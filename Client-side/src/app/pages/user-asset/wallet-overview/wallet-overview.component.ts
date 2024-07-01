import { Component, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, Subscription, combineLatest, forkJoin, from, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import {
  AllRateData,
  ClearWithdrawallimitCurrency,
  CurrencyBalance,
  NonStickyBonusWallet,
  TransferwWallet,
  WalletViewData,
} from 'src/app/shared/interfaces/wallet.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { PaymentIqService } from '../../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { KycService } from '../../kyc/kyc.service';
import { ClearBonusComponent } from '../clear-bonus/clear-bonus.component';
import { UserAssetsService } from '../user-assets.service';
import { WalletTransferComponent } from '../wallet-transfer/wallet-transfer.component';
import { StandardPopupComponent } from './../../../shared/components/standard-popup/standard-popup.component';

interface WalletListData {
  category: string;
  providerCategorys?: number[];
  isMain: boolean;
  desc: string;
  totalBalance: number;
  currency?: string;
  providerId?: string;
  isFirst?: boolean;
  currencies: {
    balance?: number;
    currency: string;
  }[];
}

interface ClearZeroLoading {
  clearWithDrawLimitLoading: boolean;
}

@UntilDestroy()
@Component({
  selector: 'app-wallet-overview',
  templateUrl: './wallet-overview.component.html',
  styleUrls: ['./wallet-overview.component.scss'],
})
export class WalletOverviewComponent implements OnInit {
  isH5!: boolean;
  loading: boolean = false;
  hongliTipsShow: boolean = false;
  hideAssetsValue: boolean = false;

  allRate!: AllRateData;
  walletInfo!: WalletViewData;

  /**提款限额(USDT) */
  withdrawLimit: number = 0;
  walletReady$: Subject<boolean> = new Subject();
  walletListReady$: Subject<boolean> = new Subject();
  rateReady$: Subject<boolean> = new Subject();

  newViewData: {
    totalAsset: number;
    totalBonus: number;
    totalFreezeAmount: number;
    walletList: WalletListData[];
    totalNonStickyBonus: number;
  } = {
    totalAsset: 0, //总资产(USDT)
    totalBonus: 0, //红利钱包(USDT)
    totalFreezeAmount: 0,
    walletList: [],
    totalNonStickyBonus: 0,
  };

  /** 非粘性钱包 */
  nonStickyBonusWallet: WritableSignal<NonStickyBonusWallet[]> = signal([
    {
      category: 'NSSlotGame',
      totalAmount: 0,
      amount: 0,
      currency: '',
      title: this.localeService.getValue('cas'),
    },
    {
      category: 'NSLiveCasino',
      totalAmount: 0,
      amount: 0,
      currency: '',
      title: this.localeService.getValue('live_cas'),
    },
  ]);
  renderNonStickyBonusWallet = computed(() => {
    if (this.nonStickyBonusWallet().length > 0) return this.nonStickyBonusWallet();
    return null;
  });

  walletDesc = [
    { type: 'Main', desc: 'w_view_main_tip' }, //主账号
    { type: 'Ky', desc: 'ky_start' }, //开源棋牌
    { type: 'Rg', desc: 'py_start' }, //雷竞技
    { type: 'Ag', desc: 'ag_start' },
    { type: 'BoyaChess', desc: 'boya_desc' }, //博雅棋牌
    { type: 'AGSlot', desc: 'new_ag_desc' }, //新AG电子
    { type: 'Golden', desc: 'golden_desc' }, //高登棋牌
    { type: 'YYChess', desc: 'yy_desc' }, //YOO棋牌
    { type: 'GPIChess', desc: 'gpi_desc' }, //GPI棋牌
    { type: 'KYChess', desc: 'ky_desc' }, //开源棋牌
    { type: 'SGWinChess', desc: 'sg_desc' }, //双赢棋牌
    { type: 'FCHunter', desc: 'fchunter_desc' }, //FC捕鱼
    { type: 'Baison', desc: 'baison_desc' }, //百盛棋牌
    { type: 'JDBGame', desc: 'jdb_desc' }, //JDB 电子
    { type: 'BBINLive', desc: 'bbinlive_desc' }, //BBIN 真人
  ];

  currentCurrency!: string;

  /** 清零loading */
  clearZeroLoading: ClearZeroLoading = {
    clearWithDrawLimitLoading: false,
  };

  /** 可清除的 提款限额 */
  clearWithdrawaLimitCurrencies: ClearWithdrawallimitCurrency[] = [];

  /** 检查 piq loading */
  renderPiqCheckedLoading = computed(() => this.piqService.checkedLoading());

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private appService: AppService,
    private userAssetsService: UserAssetsService,
    private kycService: KycService,
    private layout: LayoutService,
    private popup: PopupService,
    private localeService: LocaleService,
    private walletApi: WalletApi,
    private toast: ToastService,
    private dataCollectionService: DataCollectionService,
    private piqService: PaymentIqService,
  ) {}

  /** 提款限额按钮 是否可点击 */
  get disableWithdrawLimit(): boolean {
    return this.clearZeroLoading.clearWithDrawLimitLoading || this.clearWithdrawaLimitCurrencies.length === 0;
  }

  ngOnInit() {
    this.dataCollectionService.addPoint({ eventId: 30010 });

    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));

    //计算或更新限额
    combineLatest([this.walletReady$, this.rateReady$])
      .pipe(untilDestroyed(this))
      .subscribe(_ => {
        const currencies = this.walletInfo.overviewWallet.currencies;
        this.withdrawLimit = currencies.reduce((a, b) => {
          if (Number(b?.withdrawLimit || 0) <= 0) return a;
          const rate = this.allRate?.rates?.find(r => r?.currency === b?.currency)?.rate ?? 0;
          return Number(a || 0).add(Number(b?.withdrawLimit || 0).subtract(rate));
        }, 0);
      });

    //计算或更新总资产(主账户+各游戏钱包)
    combineLatest([this.walletListReady$, this.rateReady$])
      .pipe(untilDestroyed(this))
      .subscribe(_ => {
        this.newViewData.totalAsset = this.newViewData.walletList.reduce((a, b) => {
          let total = 0;
          if (!b.isMain) {
            total =
              b.currencies.reduce((x, y) => {
                const rate = this.allRate?.rates?.find(r => r?.currency === y?.currency)?.rate ?? 0;
                return Number(x).add((y?.balance || 0).subtract(rate));
              }, 0) ?? 0;
          }
          return Number(a ?? 0).add(total);
        }, this.newViewData.totalAsset);
      });

    //订阅余额更新
    this.appService.userBalance$.pipe(untilDestroyed(this)).subscribe(e => e && this.getWalletViewData());

    //订阅汇率变化
    this.userAssetsService.allRate.pipe(untilDestroyed(this)).subscribe(e => this.allRateChange(e));

    //订阅当前货币类型
    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(e => {
      if (e) this.currentCurrency = e.currency;
    });

    this.getClearWithdrawallimitCurrency();
  }

  /** 更新钱包数据订阅 */
  updateWalletViewData$!: Subscription;

  /**更新钱包数据 */
  getWalletViewData() {
    this.loading = true;
    this.updateWalletViewData$?.unsubscribe();
    this.updateWalletViewData$ = from(this.userAssetsService.getWalletInfor())
      .pipe(untilDestroyed(this))
      .subscribe(walletViewData => {
        if (walletViewData) {
          this.walletInfo = walletViewData;
          this.walletReady$.next(true);
          const { totalAsset, totalBonus, nonStickyBonusWallet, totalNonStickyBonus } = walletViewData;
          const totalFreezeAmount = walletViewData.overviewWallet.totalFreezeAmount;
          const walletList: WalletListData[] = [];
          // 先压入主钱包
          walletList.push({
            ...walletViewData.overviewWallet,
            currency: 'USDT',
            isMain: true,
            desc: this.walletDesc.find(x => x.type === 'Main')?.desc || '',
          });

          //压入游戏钱包
          walletViewData.transferWallet.forEach((game: TransferwWallet) => {
            const currency = game.isFirst ? 'USDT' : game.currencies.length > 1 ? 'USDT' : game.currencies[0].currency;
            walletList.push({
              ...game,
              currency: currency,
              isMain: false,
              desc: this.walletDesc.find(x => x.type === game.category)?.desc || '',
              totalBalance: 0,
            });
          });

          //检查&更新游戏钱包余额
          const getList = walletList.map(item => {
            if (item.category !== 'Main') {
              if (item.isFirst) {
                return of(null);
              } else {
                return forkJoin(
                  item.currencies.map(x => {
                    return this.userAssetsService.getTransferWalletBalance(item.providerId!, x.currency);
                  }),
                ).pipe(takeUntil(this.walletReady$), untilDestroyed(this));
              }
            } else {
              return of(null);
            }
          });

          if (getList.some(x => !!x)) {
            // 有游戏钱包需要更新余额
            forkJoin(getList).subscribe(allRes => {
              allRes.forEach((resArr, x) => {
                if (resArr) {
                  resArr.forEach((res, y) => {
                    if (res) {
                      walletList[x].currencies[y].balance = res.totalBalance;
                    }
                  });
                  if (resArr.length > 1) {
                    // 多币种的游戏、更新这个游戏的USDT总值
                    walletList[x].totalBalance = resArr.reduce((a, b) => {
                      return a.add(b ? b.totalBalance.subtract(b.rate) : 0);
                    }, 0);
                  } else {
                    // 单币种直接设置(总值就是这个游戏的唯一币种的余额)
                    walletList[x].totalBalance = walletList[x].currencies[0].balance!;
                  }
                }
              });
              this.newViewData = {
                walletList,
                totalAsset,
                totalFreezeAmount,
                totalBonus,
                totalNonStickyBonus,
              };
              this.nonStickyBonusWallet.set(
                nonStickyBonusWallet?.map(item => ({
                  ...item,
                  title:
                    item.category === 'NSSlotGame'
                      ? this.localeService.getValue('cas')
                      : this.localeService.getValue('live_cas'),
                })) || [],
              );
              this.walletListReady$.next(true);
              this.loading = false;
            });
          } else {
            // 没有游戏钱包需要更新余额
            this.newViewData = {
              walletList,
              totalAsset,
              totalFreezeAmount,
              totalBonus,
              totalNonStickyBonus,
            };
            this.nonStickyBonusWallet.set(
              nonStickyBonusWallet?.map(item => ({
                ...item,
                title:
                  item.category === 'NSSlotGame'
                    ? this.localeService.getValue('cas')
                    : this.localeService.getValue('live_cas'),
              })) || [],
            );
            this.walletListReady$.next(true);
            this.loading = false;
          }
        }
      });
  }

  allRateChange(e: AllRateData) {
    if (!e || Object.keys(e).length < 1) return;
    this.allRate = e;
    this.rateReady$.next(true);
  }

  afterRate(v: number, currency: string) {
    if (!this.allRate) return 0;
    const rateItem = this.allRate?.rates?.find(x => x?.currency === currency);
    if (!rateItem) return 0;
    return v.divide(rateItem.rate);
  }

  handleTopUp() {
    this.router.navigate([this.appService.languageCode, 'deposit']);
    this.piqService.allowRoute.set(false);
  }

  handleWithdrawal() {
    this.router.navigate([this.appService.languageCode, 'withdrawal']);
  }

  //打开划转窗口
  openWalletTransDialog(category: string): void {
    this.dialog.open(WalletTransferComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'custom-dialog-container',
      data: {
        category,
      },
    });
  }

  openGamePage(providerId: string, isFirst: boolean, category: string, providerCategory: number) {
    if (isFirst) {
      this.openWalletTransDialog(category);
    } else {
      if (category === 'AGSlot') {
        if (providerCategory === 4) {
          this.router.navigateByUrl(
            `/${this.appService.languageCode}/casino/games/${providerId}-${providerCategory}/0`,
          );
        }
        if (providerCategory === 5) {
          this.router.navigateByUrl(
            `/${this.appService.languageCode}/casino/provider/${providerId}-${providerCategory}`,
          );
        }
      } else if (category === 'GPIChess' || category === 'FCHunter') {
        this.router.navigateByUrl(`/${this.appService.languageCode}/casino/provider/${providerId}-${providerCategory}`);
      } else if (category === 'Baison') {
        if (providerCategory === 6) {
          //casino/games/Baison-6/1000
          this.router.navigateByUrl(
            `/${this.appService.languageCode}/casino/games/${providerId}-${providerCategory}/1000`,
          );
        }
        if (providerCategory === 5) {
          //casino/provider/Baison-5
          this.router.navigateByUrl(
            `/${this.appService.languageCode}/casino/provider/${providerId}-${providerCategory}`,
          );
        }
      } else {
        this.router.navigateByUrl(`/${this.appService.languageCode}/play/${providerId}-${providerCategory}`);
      }
    }
  }

  handleOpen(item: any) {
    if (item.category == 'Main') {
      this.router.navigateByUrl(`/${this.appService.languageCode}/wallet/main`);
    } else {
      if (item.isFirst) {
        this.openWalletTransDialog(item.category);
      } else {
        this.router.navigateByUrl(`/${this.appService.languageCode}/wallet/transfer/${item.category}`);
      }
    }
  }

  /**
   * 清零弹窗
   *
   * @param type 清零 抵佣券 或者 提款现额
   */
  onClearToZero(type: 'bonus' | 'withdrawLimit') {
    switch (type) {
      case 'bonus':
        this.popup.open(ClearBonusComponent, { speed: 'faster' });
        return;
      case 'withdrawLimit':
        this.popup.open(StandardPopupComponent, {
          speed: 'faster',
          data: {
            type: 'warn',
            content: this.localeService.getValue('confirm_clear_withdrawlimit'),
            buttons: [
              { text: this.localeService.getValue('cancels') },
              { text: this.localeService.getValue('confirm_button'), primary: true },
            ],
            description: `${this.localeService.getValue('confirm_clear_withdrawlimit_tips')}\n${
              this.clearWithdrawaLimitCurrencies.length > 0
                ? this.clearWithdrawaLimitCurrencies.map(item => item.currency).join(',')
                : ''
            }`,
            callback: () => {
              this.clearZeroLoading.clearWithDrawLimitLoading = true;
              this.walletApi.clearWithdrawallimit().subscribe(data => {
                this.clearZeroLoading.clearWithDrawLimitLoading = false;
                if (data) {
                  this.toast.show({ message: this.localeService.getValue('withdrawlimit_success'), type: 'success' });
                  this.getClearWithdrawallimitCurrency();
                  this.getUserBalance();
                } else {
                  this.toast.show({ message: this.localeService.getValue('withdrawlimit_fail'), type: 'fail' });
                }
              });
            },
          },
        });
        return;
      default:
        break;
    }
  }

  /** 获取可以清除提款限额 */
  getClearWithdrawallimitCurrency() {
    this.walletApi.getClearWithdrawallimitCurrency().subscribe(data => {
      this.clearWithdrawaLimitCurrencies = data;
    });
  }

  /** 更新一下 余额接口 */
  getUserBalance() {
    from(this.userAssetsService.getUserbalance()).subscribe((userbalance: CurrencyBalance[]) => {
      if (userbalance.length > 0) {
        this.appService.userBalance$.next(userbalance);
      }
    });
  }
}
