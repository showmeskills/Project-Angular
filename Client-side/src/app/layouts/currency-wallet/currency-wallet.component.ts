import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, combineLatest, from } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { SettingsService } from 'src/app/pages/settings/settings.service';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';
import { PaymentIqService } from 'src/app/shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CurrencyBalance } from 'src/app/shared/interfaces/wallet.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { CurrencyWalletService } from './currency-wallet.service';

@UntilDestroy()
@Component({
  selector: 'app-currency-wallet',
  templateUrl: './currency-wallet.component.html',
  styleUrls: ['./currency-wallet.component.scss'],
  animations: [
    trigger('expansion', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('0.2s ease-in-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('0.2s ease-in-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class CurrencyWalletComponent implements OnInit {
  logined!: boolean;
  supportExpanded: boolean = false;
  currentCurrencyData!: CurrenciesInterface;
  checked = false;
  selectedTabIndex = 0; //当前选择 0:数字货币 1:虚拟货币
  allCurrencyBalance: CurrencyBalance[] = [];
  currencies!: CurrenciesInterface[];
  checkZeroCurrencies!: CurrenciesInterface[];
  editCurrencies!: CurrenciesInterface[];

  editPop!: MatDialogRef<any>;

  /** 钱包推送的时间 */
  oldTime = 0;

  /** 默认货币下拉开关 */
  defaultCurrencyExpanded: boolean = false;

  /** 更新默认货币loading状态 */
  defaultCurrencyLoading: boolean = false;

  /** userUid 默认为-1， 用于用户未登录的时候判断*/
  userUid: string = '-1';
  @ViewChild('amount') amountElement!: ElementRef;
  searchKeyWord: string = '';
  conversion!: boolean;
  hideZero!: boolean;
  conversionFiat!: string;
  currencyDisplay: any;

  /** 非粘性详情 */
  nonStickyDetails: WritableSignal<CurrencyBalance | null> = signal(null);
  renderNonStickyDetails = computed(() => this.nonStickyDetails());
  @ViewChild('nonStickPopup') nonStickPopup!: TemplateRef<Element>;
  closeDialog!: MatDialogRef<Element, unknown>;

  /** 检查 piq loading */
  renderPiqCheckedLoading = computed(() => this.piqService.checkedLoading());

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private appService: AppService,
    private userAssetsService: UserAssetsService,
    private localStorageService: LocalStorageService,
    private currencyValuePipe: CurrencyValuePipe,
    private popup: PopupService,
    private layout: LayoutService,
    private settingsService: SettingsService,
    private dataCollectionService: DataCollectionService,
    public currencyWalletService: CurrencyWalletService,
    public piqService: PaymentIqService,
  ) {}

  /** 是否展示游戏进行 */
  isShowPlaying = false;

  ngOnInit() {
    this.appService.isShowTopWalletPalying$.subscribe(x => (this.isShowPlaying = x));

    // 订阅当前登录账号信息判断是否已登录
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      this.logined = !!v;
      if (this.logined) {
        this.getUserBalance();
        this.userUid = v?.uid as string;
      }
    });

    //订阅当前货币
    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(v => {
      this.currentCurrencyData = v;
    });

    //首次准备好的时候获取所有币种数据,并初始化
    combineLatest([this.appService.currencies$, this.userAssetsService.allRate.pipe(first(v => v?.rates?.length > 0))])
      .pipe(untilDestroyed(this))
      .subscribe(([x]) => {
        if (x.length > 0) {
          this.currencies = x.filter(v => v.isVisible);
          this.initData();
        }
      });

    //订阅资产相关的signalr通知，用于更新钱包
    this.appService.assetChanges$
      .pipe(
        filter(v => v.related === 'Wallet'), //关联目标是钱包
        untilDestroyed(this),
      )
      .subscribe(msg => {
        // 如果没有data,说明是手动更新钱包
        if (!msg.data) {
          this.getUserBalance();
          return;
        }
        // 原创需求 开始plinko 投注时，锁住钱包
        if (this.appService.assetChangesLock$.value) {
          return;
        }
        // 对比上一次推送时间，上一次推送时间大于当前，那么不用跟新余额
        if (this.oldTime > (msg.time ?? 0)) return;
        this.oldTime = msg.time ?? 0;
        if (typeof msg.data.Balance == 'number') {
          // 单币种
          const item = this.allCurrencyBalance.find(balanceItem => balanceItem.currency === msg.data?.Currency);
          if (item) {
            // 非粘性 余额更新
            if (msg?.type === 'NonStickyBalance') {
              if (msg?.data?.Category === 'SlotGame') {
                item.nsSlotGame!.balance = msg.data.Balance || 0;
              } else {
                item.nsLiveCasino!.balance = msg.data.Balance || 0;
              }
            } else {
              // 正常余额更新
              item.balance = msg.data.Balance;
              // 新增需求 赢钱增加动画 只要金额变化是大于 0，那么就需要增加动画效果 msg.data.Amount
              // console.log(msg.data.Amount)
            }

            item.nonStickyBalance = Number(item.balance)
              .add(Number(item?.nsSlotGame?.balance || 0))
              .add(Number(item?.nsLiveCasino?.balance || 0));
            if (msg.data.Amount > 0) {
              const amount = this.currencyValuePipe.transform(msg.data.Amount, msg.data.Currency);
              // this.startUserAnimation(amount)
              this.appService.assetChangesAnimation$.next(amount);
            }
          }
        } else {
          // 多币种更改余额
          const objBalance = msg.data.Balance;
          Object.keys(objBalance || {}).forEach(key => {
            const item = this.allCurrencyBalance.find(balanceItem => balanceItem.currency === key);
            if (item) {
              item.balance = objBalance[key];
              item.nonStickyBalance = Number(objBalance[key] || 0)
                .add(item.nsSlotGame?.currency === key ? item.nsSlotGame?.balance || 0 : 0)
                .add(item.nsLiveCasino?.currency === key ? item.nsLiveCasino?.balance || 0 : 0);
            }
          });
        }
        this.appService.userBalance$.next([...this.allCurrencyBalance]);
      });

    this.appService.userBalance$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) {
        this.allCurrencyBalance = v;
        this.initData();
      }
    });
    this.appService.assetChangesAnimation$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) {
        this.startUserAnimation(v);
      }
    });
    this.settingsService.setDefaultCurrencyLoading$
      .pipe(untilDestroyed(this))
      .subscribe(v => (this.defaultCurrencyLoading = v));

    this.appService.originalAutoBet$.pipe(untilDestroyed(this)).subscribe(v => {
      this.isDiasbled = v;
    });
  }

  startUserAnimation(Amount: string) {
    if (!this.amountElement) return;
    const amountElement = this.amountElement.nativeElement as HTMLElement;
    const div = this.renderer.createElement('div');
    div.innerHTML = Amount;
    this.renderer.addClass(div, 'add-amount');
    this.renderer.appendChild(amountElement.parentElement, div);
    const top = amountElement.offsetTop;
    const y = top + 20;
    div.style.top = `${y}px`;
    div.style.opacity = 1;
    let speed = 0;
    let speedop = 1;
    const userTimer = setInterval(() => {
      speed = speed - 0.3;
      speedop = speedop - 0.02;
      div.style.top = `${y + speed}px`;
      div.style.opacity = speedop;
      if (speedop <= 0) {
        clearInterval(userTimer);
        this.renderer.removeChild(amountElement.parentElement, div);
      }
    }, 10);
  }

  /** 更新余额订阅 */
  updateUserbalance$!: Subscription;
  // 原创自动投注禁止币种切换后的样式
  isDiasbled: boolean = false;
  /**
   * 更新钱包信息
   */
  getUserBalance() {
    this.updateUserbalance$?.unsubscribe();
    this.updateUserbalance$ = from(this.userAssetsService.getUserbalance()).subscribe(
      (userbalance: CurrencyBalance[]) => {
        if (userbalance.length > 0) {
          this.appService.userBalance$.next(userbalance);
        }
      },
    );
  }

  //展开/收起
  handleOpen() {
    // 原创自动投注时禁止展开收起
    if (this.appService.originalAutoBet$.value || this.settingsService.setDefaultCurrencyLoading$.value) {
      this.supportExpanded = false;
      return;
    }
    this.supportExpanded = !this.supportExpanded;
    // 定位到当前选择的tab
    if (this.supportExpanded && this.currentCurrencyData)
      // 定位到当前选择的tab
      this.selectedTabIndex = this.currentCurrencyData.isDigital ? 0 : 1;
  }

  /** 打开默认货币下拉 */
  handleOpenDefaultCurrency() {
    this.defaultCurrencyExpanded = !this.defaultCurrencyExpanded;
  }

  //选择
  handleSelect(item: CurrenciesInterface) {
    if (this.currentCurrencyData.currency === item.currency) return;

    if (this.logined) {
      // 如果登录 调用设置默认货币接口, 且订阅
      this.settingsService.setUserDefaultCurrency({ defaultCurrencyType: item.currency }, item.currency);
      this.defaultCurrencyExpanded = false;
    } else {
      // 不登录只是进行订阅
      this.settingsService.setAppServiceCurrentCurrency(item.currency);
    }

    //存入localStorageService
    this.localStorageService.currentCurrency = item.currency;
    this.supportExpanded = false;

    this.setDefaultToFait();
  }

  // 初始化
  initData() {
    if (!this.currencies) return;
    const currencyDisplay = this.localStorageService.currencyDisplay;
    this.currencyDisplay = currencyDisplay;
    this.conversion = !!currencyDisplay?.conversion;
    this.conversionFiat = currencyDisplay?.conversionFiat || this.currencies.find(cur => !cur.isDigital)?.currency;
    this.hideZero = !!currencyDisplay?.hideZero;
    this.setConversion();
    this.setDefaultToFait();

    if (currencyDisplay?.hideZero) {
      //隐藏没有金额的钱包
      this.checkZeroCurrencies = this.currencies.filter(currencyItem => {
        const item = this.allCurrencyBalance.find(balanceItem => balanceItem.currency === currencyItem.currency);
        return item && item.balance! !== 0;
      });
    } else {
      //显示所有
      this.checkZeroCurrencies = this.currencies;
    }
  }

  // 钱包按钮跳转
  toWalletPage() {
    if (this.logined) {
      //在资产管理主页面显示充值弹出框
      this.router.navigate([this.appService.languageCode, 'deposit']); //暂时直接到法币
      this.piqService.allowRoute.set(false);
    } else {
      this.router.navigate([this.appService.languageCode, 'login']);
    }
  }

  // editDisplayCurrency(template: TemplateRef<any>) {
  //   this.dataCollectionService.addPoint({ eventId: 30023 });
  //   this.supportExpanded = false;
  //   this.editCurrencies = JSON.parse(JSON.stringify(this.currencies));
  //   this.editPop = this.popup.open(template, {
  //     inAnimation: this.layout.isH5$.value ? 'fadeInUp' : undefined,
  //     outAnimation: this.layout.isH5$.value ? 'fadeOutDown' : undefined,
  //     position: this.layout.isH5$.value ? { bottom: '0px' } : undefined,
  //     speed: 'faster',
  //     autoFocus: false,
  //   });
  // }

  walletSetting(template: TemplateRef<any>) {
    this.supportExpanded = false;
    this.editPop = this.popup.open(template, {
      disableClose: true,
      inAnimation: this.layout.isH5$.value ? 'fadeInUp' : undefined,
      outAnimation: this.layout.isH5$.value ? 'fadeOutDown' : undefined,
      position: this.layout.isH5$.value ? { bottom: '0px' } : undefined,
      speed: 'faster',
      autoFocus: false,
    });
  }

  closeEditPop() {
    this.editPop.close();
  }

  saveCurrencyDisplay() {
    this.localStorageService.currencyDisplay = {
      conversion: this.conversion,
      conversionFiat: this.conversionFiat,
      hideZero: this.hideZero,
    };
    this.initData();
    this.closeEditPop();
    this.setConversion();
  }

  async setConversion() {
    this.currencyWalletService.conversionCurrency$.next({
      currency: this.currencies?.find(cur => cur.currency === this.conversionFiat) || null,
      enable: this.conversion,
      loading: true,
      rate: this.userAssetsService.getRatesBaseCurrency(this.userAssetsService.allRate.value, this.conversionFiat)
        .rates,
    });
  }

  setDefaultToFait() {
    const currentCurrency =
      this.currencies?.find(cur => cur.currency === this.localStorageService.currentCurrency) || null;

    this.currencyWalletService.defaultToFiat$.next({
      currency: currentCurrency || null,
      rates: this.userAssetsService.getRatesBaseCurrency(
        this.userAssetsService.allRate.value,
        this.localStorageService.currentCurrency,
      ).rates,
    });
  }

  onValueChange(data: string) {
    console.log(11111, data);
  }

  /**
   * 展示非粘 余额详情
   *
   * @param currency
   */
  showNonStickBalanceDetail(currency: string) {
    this.nonStickyDetails.set(this.allCurrencyBalance?.find(item => item?.currency === currency) || null);
    this.closeDialog = this.popup.open(this.nonStickPopup, {
      disableClose: false,
    });
  }
}
