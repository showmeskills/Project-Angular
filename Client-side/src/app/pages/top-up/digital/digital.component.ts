import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, combineLatest } from 'rxjs';
import { finalize, first, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { DepositApi } from 'src/app/shared/apis/deposit.api';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { SelectCurrencyComponent } from 'src/app/shared/components/select-currency/select-currency.component';
import { SelectDepositBonusService } from 'src/app/shared/components/select-deposit-bonus/select-deposit-bonus.service';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { BonusList } from 'src/app/shared/interfaces/bonus.interface';
import {
  CurrenciesInterface,
  DepositAddressInterface,
  DepositAddressParamInterface,
  TokenNetworksFlatInterface,
} from 'src/app/shared/interfaces/deposit.interface';
import { CointxHistoryInterface } from 'src/app/shared/interfaces/history.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PaymentIqService } from '../../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { SelectDividendDialogComponent } from '../../../shared/components/select-deposit-bonus/select-dividend-dialog/select-dividend-dialog.component';
import { CardCenterService } from '../../card-center/card-center.service';
import { KycService } from '../../kyc/kyc.service';
import { WalletHistoryService } from '../../user-asset/wallet-history/wallet-history.service';
import { H5QuestionsDialogComponent } from '../currency/h5-questions-dialog/h5-questions-dialog.component';
import { TopUpService } from '../top-up.service';
import { DigitalReceiptDialogComponent } from './digital-receipt-dialog/digital-receipt-dialog.component';
import { SelectNetworkDialogComponent } from './select-network-dialog/select-network-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-digital',
  templateUrl: './digital.component.html',
  styleUrls: ['./digital.component.scss'],
})
export class DigitalComponent implements OnInit, OnDestroy {
  constructor(
    private localStorageService: LocalStorageService,
    private api: DepositApi,
    private dialog: MatDialog,
    private historyApi: HistoryApi,
    private appService: AppService,
    private router: Router,
    private walletHistoryService: WalletHistoryService,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    private layout: LayoutService,
    private dataCollectionService: DataCollectionService,
    private bonusApi: BonusApi,
    private topUpService: TopUpService,
    private piqService: PaymentIqService,
    private cardCenterService: CardCenterService,
    private selectDepositBonusService: SelectDepositBonusService,
    private kycService: KycService,
  ) {}
  static _componentName = 'CryptoDepositComponent';
  walletSub!: Subscription; //订阅钱包数据
  hashCode: string = '';
  isCorrectNetwork: boolean = true;
  isShow: boolean = true;
  isOpen: boolean = false;
  isQrcShow: boolean = false;
  isWarning: boolean = false;
  isLoading: boolean = false;

  currencies: CurrenciesInterface[] = [];
  cryptoHistory: CointxHistoryInterface[] = []; //数字货币充值记录
  selectedCurrency?: CurrenciesInterface; // 选择的币种
  selectedNetwork?: TokenNetworksFlatInterface; // 选择的网络
  depositAddressGroup: DepositAddressInterface[] = []; // 存款地址集合（缓存）
  depositAddress?: DepositAddressInterface; // 当前显示的地址
  isFirstViewPage: boolean = false; //是否第一次进入页面
  isH5!: boolean;

  /**传入币种默认USDT */
  queryCurrency: string | null = null;

  /**默认USDT */
  defaultCurrency: string | null = 'USDT';

  /** 红利loading */
  bonusLoading: boolean = false;

  /** 红利数据 */
  bonuslist: BonusList[] = [];

  /** 选择的红利 */
  seletedDividend: WritableSignal<BonusList | null> = signal(null);

  /** 用户资料 */
  userInfo?: AccountInforData;

  /** 是否绑定手机号 */
  isBindMobile: boolean = false;

  /** 欧亚 用户 */
  isEurope: boolean = false;

  ngOnInit() {
    this.dataCollectionService.gtmPush('deposit_visit', { deposit_type: 'crypto' });
    this.dataCollectionService.addPoint({ eventId: 30011, actionValue1: 0 });

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });

    //是否第一次访问页面
    this.isFirstViewPage = this.checkFirstView();
    // 响应传入币种
    combineLatest([this.route.queryParams])
      .pipe(untilDestroyed(this))
      .subscribe(([query]) => {
        if (query.currency) this.queryCurrency = query.currency;

        this.getCurrencies();
        this.getcoinTx();
      });
  }

  onInitUserInfo() {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(userInfo => {
      if (userInfo) {
        this.userInfo = userInfo;
        this.isEurope = userInfo?.isEurope;

        this.checkBonus();

        if (this.topUpService.phoneVerifyCryptoDeposit) {
          if (!this.userInfo.isBindMobile) {
            this.piqService.openBindMobilePopup();
          } else {
            this.isBindMobile = true;
          }
        }
      }
    });
  }

  /** 亚洲用户 红利接口 */
  checkBonus() {
    this.bonusLoading = true;
    this.selectDepositBonusService.getTopUpBonus(this.selectedCurrency?.currency || 'USDT').subscribe(data => {
      if (data) {
        this.bonuslist = data;
        if (this.cardCenterService.onNoneStickyWithBonus(this.bonuslist)) {
          this.seletedDividend.set(this.cardCenterService.onNoneStickyWithBonus(this.bonuslist));
          this.bonusCallback(this.cardCenterService.onNoneStickyWithBonus(this.bonuslist));
        } else {
          if (this.isEurope && this.piqService.seletedDividend()) {
            this.seletedDividend.set(this.piqService.seletedDividend());
            this.bonusCallback(this.piqService.seletedDividend());
          } else if (data?.length > 0) {
            this.bonuslist[0].isActive = true;
            this.seletedDividend.set(this.bonuslist[0]);
            this.bonusCallback(this.bonuslist[0]);
          }
        }
      }
      this.bonusLoading = false;
    });
  }

  /** 红利弹出框 */
  openDividendOptions() {
    if (!this.isBindMobile && this.topUpService.phoneVerifyCryptoDeposit) {
      this.piqService.openBindMobilePopup();
      return;
    }
    this.piqService.selectDepositMethod.set('crypto');
    this.dialog.open(SelectDividendDialogComponent, {
      panelClass: 'dividend-dialog-container',
      data: {
        callback: this.bonusCallback.bind(this),
        bonusList: this.bonuslist,
        seletedDividend: this.seletedDividend(),
        isShowTimes: true,
        isPiq: this.isEurope,
        couponCodeParams: {
          amount: 0,
          currency: this.selectedCurrency?.currency || '',
        },
      },
    });
  }

  /**
   * 红利回调
   *
   * @param item
   */
  bonusCallback(item: BonusList | null) {
    this.bonusLoading = true;
    this.bonusApi
      .onCryptoActivityNo({
        activityNo: item?.bonusActivitiesNo || 'unknowtmpcode',
      })
      .subscribe(() => {
        if (!item) {
          this.bonuslist = this.bonuslist.map(list => ({
            ...list,
            isActive: false,
          }));
        }
        this.seletedDividend.set(item);
        this.bonusLoading = false;
      });
  }

  checkFirstView() {
    const checkValue = this.localStorageService.getValueByJsonParse('toUpPage');
    if (checkValue == 'digtalToUp') {
      return false;
    } else {
      this.localStorageService.setValueByJsonStringify('toUpPage', 'digtalToUp');
      return true;
    }
  }

  //---------获取充币记录
  getcoinTx() {
    const param = {
      category: 'Deposit',
      startTime: this.generalService.getStartEndDateArray('30days')[0],
      endTime: this.generalService.getStartEndDateArray('30days')[1],
      currency: '',
    };
    this.isLoading = true;
    this.historyApi
      .getCointxHistory(param)
      .pipe(
        // map(v => v.data),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe(res => {
        if (res?.data) {
          if (res.data.list.length > 0) {
            const newData = res.data.list;
            this.cryptoHistory = newData.slice(0, 3);
          }
        }
      });
  }

  /**处理地址格式 */
  getAddresseElipsis(addresse: string) {
    return addresse.slice(0, 7) + '...' + addresse.slice(-7);
  }

  /**
   * 获取所有币种
   *
   * @param query
   */
  getCurrencies() {
    combineLatest([
      this.appService.currencies$.pipe(
        map(v => v.filter(x => x.isDigital && x.isVisible)),
        untilDestroyed(this),
        first(v => !!(v.length > 0)),
      ),
      this.appService.currentCurrency$.pipe(first(v => !!v)),
    ]).subscribe(([v, currentCurrency]) => {
      this.currencies = v;
      const matched = this.queryCurrency && this.currencies.find((e: any) => e.currency === this.queryCurrency);

      //设置带入币种
      if (this.queryCurrency && matched) {
        this.selectedCurrency = matched;
      } else if (currentCurrency?.isDigital && currentCurrency?.isVisible) {
        this.selectedCurrency = currentCurrency;
      } else {
        const matched = this.currencies.find((e: any) => e.currency === this.defaultCurrency);
        if (matched) this.selectedCurrency = matched;
      }

      this.onInitUserInfo();
    });
  }

  closeGuide(event: any) {
    this.isShow = event;
  }

  //选择币种
  handleSelectCurrency() {
    if (!this.isBindMobile && this.topUpService.phoneVerifyCryptoDeposit) {
      this.piqService.openBindMobilePopup();
      return;
    }
    this.dialog
      .open(SelectCurrencyComponent, {
        panelClass: 'custom-dialog-container',
        data: {
          showBalance: false,
          isDigital: true,
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) this.selectCurrency(result);
      });
  }

  //SelectCurrencyDialogComponent 关闭后触发
  selectCurrency(data: CurrenciesInterface) {
    if (this.selectedCurrency?.currency === data?.currency) return;
    this.selectedCurrency = data;
    //每次选择币种，清空网络
    this.selectedNetwork = undefined;
    this.checkBonus();
    this.seletedDividend.set(null);
  }

  //选择网络
  handleSelectNetWork() {
    if (!this.isBindMobile && this.topUpService.phoneVerifyCryptoDeposit) {
      this.piqService.openBindMobilePopup();
      return;
    }
    this.dialog.open(SelectNetworkDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        callback: this.closeSelectNetwordCallBack.bind(this),
        selectedCurrency: this.selectedCurrency,
        isDeposit: true,
      },
    });
  }
  //SelectNetworkDialogComponent 关闭后触发
  closeSelectNetwordCallBack(data: TokenNetworksFlatInterface) {
    this.selectedNetwork = data;
    //检查缓存，显示地址 or 请求地址
    this.depositAddress = undefined;
    this.checkNetworkStatus();
  }

  //记录弹出框
  openReceipt(item: any) {
    item.isSelected = !item.isSelected;
    this.dialog.open(DigitalReceiptDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        callback: this.closeReceiptCallBack.bind(this),
        item,
        type: 'digital',
      },
    });
  }

  //绑定接收DigitalReceiptDialogComponent 关闭后触发
  closeReceiptCallBack(data: any) {
    data.isSelected = false;
  }

  checkNetworkStatus() {
    const temp: DepositAddressInterface = this.depositAddressGroup?.find(v => {
      return v.token === this.selectedNetwork?.currency && v.network === this.selectedNetwork?.networkInfo.network;
    }) as DepositAddressInterface;
    if (temp) {
      this.depositAddress = temp;
    } else {
      this.getDepositAddress();
    }
  }

  getDepositAddress() {
    const param: DepositAddressParamInterface = {
      currency: this.selectedNetwork?.currency as string,
      network: this.selectedNetwork?.networkInfo.network as string,
    };

    this.api
      .getDepositAddress(param)
      .pipe(
        map(v => v.data),
        finalize(() => {}),
      )
      .subscribe(res => {
        this.depositAddressGroup?.push(res);
        this.depositAddress = res;
      });
  }

  //地址错误
  // checkError(){
  //   setTimeout(() => {
  //     this.isError = true;
  //   }, 2000);
  // }

  // QRC
  mouseIn() {
    setTimeout(() => {
      this.isQrcShow = true;
    }, 200);
  }
  mouseOut() {
    setTimeout(() => {
      this.isQrcShow = false;
    }, 200);
  }

  //关掉错误
  // closeErro(){
  //   this.isError = false;
  // }

  //申请地址
  // handleApply(){
  //   this.details = this.mockApplyAddre;
  //   this.isApply = true;

  // }

  handleWarning() {
    setTimeout(() => {
      this.isWarning = !this.isWarning;
    }, 200);
  }
  // @ViewChild('digitalSuccessPopup') digitalSuccessPopup!: TemplateRef<any>;
  // openSuccess(): void {
  //   this.topUpService.openPopup(this.digitalSuccessPopup);
  // }

  // kycErrorDialog(errorMassage: string) {
  //   this.dialog.open(KycErrorDialogComponent, {
  //     panelClass: 'custom-dialog-container',
  //     data: { callback: this.closeErroeCallBack.bind(this), message: errorMassage },
  //   });
  // }

  //其他充值方式
  //ErrorDialogComponent 关闭后触发
  closeErroeCallBack(data: boolean) {
    console.log('callback-->', data);
  }

  openHistoryPage() {
    this.walletHistoryService.designatedDepositeCurrencyHistory$.next('isDigital');
    this.router.navigate([this.appService.languageCode, 'wallet', 'history', 'deposit']);
  }

  openAppeal() {
    this.router.navigate([this.appService.languageCode, 'retrieve-account', 'digital-record']);
  }

  openQuestion() {
    this.dialog.open(H5QuestionsDialogComponent, {
      panelClass: 'custom-dialog-container',
    });
  }

  ngOnDestroy(): void {
    this.walletSub?.unsubscribe();
    this.cardCenterService.onReset();
  }
}
