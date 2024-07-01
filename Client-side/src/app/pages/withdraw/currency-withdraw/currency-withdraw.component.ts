import { Component, DestroyRef, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { BankCardApi } from 'src/app/shared/apis/bank-card.api';
import { DepositApi } from 'src/app/shared/apis/deposit.api';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import { WithdrawApi } from 'src/app/shared/apis/withdraw.api';
import { EddPopupService } from 'src/app/shared/components/edd-popup/edd-popup.service';
import { SelectCurrencyComponent } from 'src/app/shared/components/select-currency/select-currency.component';
import {
  StandardPopupComponent,
  StandardPopupData,
} from 'src/app/shared/components/standard-popup/standard-popup.component';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { TIMER_MS, VerifyAction } from 'src/app/shared/interfaces/auth.interface';
import { BankCard, DeleteParam } from 'src/app/shared/interfaces/bank-card.interface';
import {
  CurrenciesInterface,
  PaymentListInferface,
  TokenNetworksFlatInterface,
  VirtualRate,
} from 'src/app/shared/interfaces/deposit.interface';
import { CurrencytxHistoryInterface } from 'src/app/shared/interfaces/history.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { Quotalimit } from 'src/app/shared/interfaces/withdraw.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { GeneralService } from 'src/app/shared/service/general.service';
import { General2faverifyService } from 'src/app/shared/service/general2faverify.service';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { TokenNetworksValidationService } from 'src/app/shared/service/token-networks-validation';
import { PaymentIqService } from '../../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { KycService } from '../../kyc/kyc.service';
import { SelectNetworkDialogComponent } from '../../top-up/digital/select-network-dialog/select-network-dialog.component';
import { TopUpService } from '../../top-up/top-up.service';
import { AddBankCardComponent } from '../../user-asset/bankcard-management/add-bank-card/add-bank-card.component';
import { ClearBonusComponent } from '../../user-asset/clear-bonus/clear-bonus.component';
import { WalletHistoryService } from '../../user-asset/wallet-history/wallet-history.service';
import { SelectAddressDialogComponent } from '../crypto-withdraw/select-address-dialog/select-address-dialog.component';
import { SubmitDialogComponent } from '../crypto-withdraw/submit-dialog/submit-dialog.component';
import { WithdrawService } from '../withdraw.service';

@UntilDestroy()
@Component({
  selector: 'app-currency-withdraw',
  templateUrl: './currency-withdraw.component.html',
  styleUrls: ['./currency-withdraw.component.scss'],
})
export class CurrencyWithdrawComponent implements OnInit, OnDestroy {
  constructor(
    private dialog: MatDialog,
    private bankCardApi: BankCardApi,
    private depositApi: DepositApi,
    public appService: AppService,
    private walletApi: WalletApi,
    private historyApi: HistoryApi,
    private layout: LayoutService,
    private withdrawApi: WithdrawApi,
    private kycService: KycService,
    private kycDialogService: KycDialogService,
    private popupService: PopupService,
    private general2faverifyService: General2faverifyService,
    private toast: ToastService,
    private router: Router,
    public walletHistoryService: WalletHistoryService,
    private route: ActivatedRoute,
    private localeService: LocaleService,
    private generalService: GeneralService,
    public withdrawService: WithdrawService,
    private dataCollectionService: DataCollectionService,
    private tokenNetworksValidationService: TokenNetworksValidationService,
    private topUpService: TopUpService,
    private localStorageService: LocalStorageService,
    // private riskService: RiskControlService,
    private paymentIqService: PaymentIqService,
    private accApi: AccountApi,
    private eddPopup: EddPopupService,
    private destroyRef: DestroyRef,
    private kycApi: KycApi,
  ) {}
  amountValid: any = {
    isValid: false,
  };
  /** 提款金额 */
  isShow: boolean = true;
  amount!: number | string;
  isOpen: boolean = false;
  selectedCurrency?: CurrenciesInterface;
  selectedWithdraw: any;
  selectbackCard: any;
  isEmpty: boolean = true;
  /** 'maintainance'：维护中 ； 'transferVaild':可以继续填写表单 ； 'transferUnvaild' : 支付方式不可用 */
  onMaintainance: string = '';
  showLimit: boolean = false;
  /** 银行卡数据 */
  cardList!: Array<BankCard>;
  /** 管理银行卡下拉框 */
  showManageOption: boolean = false;
  isLoading: boolean = false;
  loadingCurrencies: boolean = true;
  /** 充值方式数据 */
  recommendWithdraw: any = [];
  /** 其他支付方式 */
  otherWithdraw: any = [];
  /** 升级状态 */
  topUpSuccess: boolean = true;
  currencyWithdrawHistory: CurrencytxHistoryInterface[] = [];
  /** 订单提交成功 */
  orderSuccess: boolean = false;
  submitRecipet: any = {};
  isH5!: boolean;
  /** 用户资产限额数据 //availQuota 可用限额 withdrawQuota 提款限额 balance 余额 freezeAmount 锁定金额 todayQuota 单日限额 usedQuota 已使用额度 */
  coinLimit!: Quotalimit;
  /** 实际到账 */
  realAmount: number = 0;

  /** 手续费 */
  fee: number = 0;

  /** 用户kyc姓名-用于添加银行卡弹窗 */
  kycName: string = '';
  /** 银行卡加载中 */
  bankCardLoading: boolean = true;
  /** 提款范围 */
  coinRange = {
    min: 0,
    realmin: 0,
    max: 0,
  };
  /** 输入框错误信息 */
  errorMsg: string = '';
  paymentWayList: any = [];
  /** 当前选择的注册方式 0:用户名 1:手机号 */
  selectedTabIndex = 0;
  currentPaymenyList: any = [];
  isPayLoading: boolean = false;
  kycLimitInfor: any = null;

  kycPageUrl: string = `/${this.appService.languageCode}/userCenter/kyc`;

  queryCurrency: string | null = null;

  /** 检查支付方式是否可用 */
  checkLoading: boolean = false;

  /** 是否显示paymentiq组件 当没有支付方式的时候 */
  isShowPaymentIq: boolean = false;

  /** piq用户选择的币种 */
  piqSelectedCurrency!: string;

  /** paymentIQ 提款限额度*/
  paymentIqCoinLimit!: Quotalimit;

  /** 用户当前的kyc等级 */
  currentKycLevel: number = 0;

  /** 是否展示 提法得虚 */
  isShowCryptoToFiat: boolean = false;

  /** loading pool */
  loadingSelectedCurrency: boolean = false;

  /** 选择当前的虚拟货币 */
  selectedCryptoCurrency: CurrenciesInterface | null = null;

  /** 支持提法得虚的货币 */
  supportCurrencies: CurrenciesInterface[] = [];

  /** loading pool */
  rateLoading: boolean = false;

  /** 当前汇率数据 */
  currentRateData!: { rate: number; currency: string } | null;

  /** 汇率数据 */
  rateData!: ResponseData<VirtualRate>;

  /** 提法得虚 的withdraw */
  cryptoWidthdraw!: any;

  /** 选择当前Tab 下表 */
  selectedNetTabIndex: number = 0;

  /** 已选择的网络 */
  selectedNetwork!: TokenNetworksFlatInterface | null;

  /** 当前地址 */
  address: string = '';

  /** 判断地址是否符合标准 */
  addressValid: any = {
    isValid: false,
    text: '',
    isValid1: false,
    isValid2: false,
  };

  /** 数字货币 */
  crypToCurrencies!: CurrenciesInterface[];

  /** 是否可以 提交订单 */
  isCanNext: boolean = false;

  /** 从地址簿里面选择 */
  selectedAddress!: any;

  /** 地址簿loading */
  loadingAddress: boolean = false;

  /** 地址簿信息 */
  // addressInfor: TokenAddress[] = [];

  /** 默认货币 */
  defaultCurrency!: CurrenciesInterface;

  /** EB Pay 提款 */
  isNeedWalletAddress!: boolean;
  otpType: VerifyAction = 'Withdraw';
  phone: any = ''; //手机号
  isAuthValid: boolean = false;
  smsVoice: boolean = false; //是否语音验证
  authStatus = 'initial'; // 当前验证状态有 initial（初始），sent（发送），timeout（超时）
  authcode: string = ''; //手机验证码
  userAccountInfor?: AccountInforData;
  walletaddress: string = '';
  /** 判断EB Pay 提款地址是否输入 */
  walletaddressValid: any = {
    isValid: false,
    text: '',
  };
  /** 手机号验证后返回的key */
  key!: string;

  ngOnInit() {
    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(v => {
      this.defaultCurrency = v;
    });

    combineLatest([
      this.route.queryParams,
      this.appService.userInfo$,
      this.kycService.getUserKycSettings(),
      this.kycApi.getUserKycStatus(),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([query, userInfo, kycSettings, kycStatus]) => {
        if (userInfo) this.userAccountInfor = userInfo;

        if (query.currency) this.queryCurrency = query.currency;

        const currentKycStatus = this.kycService.checkUserKycStatus(kycStatus);

        if (currentKycStatus && kycSettings.length > 0) {
          this.currentKycLevel = currentKycStatus.level;
          this.kycLimitInfor = kycSettings[currentKycStatus.level];
        }

        if (userInfo?.isEurope && currentKycStatus.level !== 0 && this.kycService.getSwitchEuKyc) {
          // 针对欧洲的检查，亚洲理论恒定返回true
          this.withdrawApi.riskformverify().subscribe(res => {
            // 欧洲
            // code 2050 kyc 等级不够
            if (res?.code === '2050') {
              this.withdrawService.errorDialog(
                this.localeService.getValue('safety_rem00'),
                'kycLevelNotEnough',
                this.localeService.getValue('kyc_level_unenough'),
                this.localeService.getValue('verification'),
                true,
                true,
                true,
              );
              return;
            }
            // 2060 欧洲 补充材料
            if (res?.code === '2060') {
              this.withdrawService.errorDialog(
                this.localeService.getValue('safety_rem00'),
                'documentError',
                this.localeService.getValue('kyc_error05'),
                this.localeService.getValue('verification'),
                true,
                true,
                true,
              );
              return;
            }

            // 2061 EDD 尚未完成
            if (res?.code === '2061') {
              this.eddPopup.onJourneyStart();
              return;
            }

            // 2062 EDD 审核中
            if (res?.code === '2062') {
              this.eddPopup.success();
              return;
            }
            //2063,kyc审核中
            if (res?.code === '2063') {
              this.kycDialogService.statusNoticePopup();
              return;
            }
            this.onWidthdrawInit();
          });
        } else {
          this.onWidthdrawInit();
        }
      });

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });

    this.dataCollectionService.addPoint({ eventId: 30012, actionValue1: 1 });
  }

  /** 初始化 对应 函数 */
  onWidthdrawInit() {
    this.checkWithdrawVaild();
    this.getCurrency();
    this.loadCardList();
    this.getCurrencyWithdrawHistory();
  }

  ngOnDestroy(): void {
    this.withdrawService.onResetValue();
  }

  /**
   * 检查抵用金情况与初始化
   */
  checkWithdrawVaild() {
    this.withdrawService.allowWithdrawal().subscribe(data => {
      if (!data) {
        // 取消，=> 跳转钱包总览
        // 清零，=> 直接弹清零弹窗 => 成功后回调再次检查执行 checkWithdrawVaild
        this.popupService
          .open(ClearBonusComponent, { speed: 'faster' })
          .beforeClosed()
          .subscribe(e => {
            if (e) {
              this.checkWithdrawVaild();
            } else {
              this.router.navigateByUrl(`/${this.appService.languageCode}/wallet/overview`);
            }
          });
      }
    });
  }

  getCurrency() {
    this.loadingCurrencies = true;
    this.appService.currencies$
      .pipe(
        map(v => {
          this.crypToCurrencies = v.filter(x => x.isDigital && x.isVisible);
          return v;
        }),
        map(v => v.filter(x => !x.isDigital && x.isVisible)),
        untilDestroyed(this),
      )
      .subscribe(v => {
        if (v.length > 0) {
          this.loadingCurrencies = false;

          //设置带入币种
          if (this.queryCurrency !== null) {
            const matched = v.find((e: CurrenciesInterface) => e.currency === this.queryCurrency);
            if (matched) this.closeSelectCurrencyCallBack(matched);
          }
        }
      });
  }

  //获取历史交易记录
  getCurrencyWithdrawHistory() {
    const param = {
      category: 'Withdraw',
      startTime: this.generalService.getStartEndDateArray('30days')[0],
      endTime: this.generalService.getStartEndDateArray('30days')[1],
      currency: '',
    };
    this.isLoading = true;
    this.historyApi
      .getCurrencytxHistory(param)
      .pipe(map(v => v?.data))
      .subscribe(data => {
        if (data?.list?.length > 0) {
          const newData = data.list;
          this.currencyWithdrawHistory = newData.slice(0, 3);
        }
        this.isLoading = false;
      });
  }

  /**
   * 获取银行卡
   */
  async loadCardList() {
    this.bankCardLoading = true;

    const result = await firstValueFrom(this.bankCardApi.getBankCard());
    if (result?.data) {
      this.cardList = result.data;
      this.cardList.forEach(x => {
        x.isShow = false;
        x.selected = x.isDefault === true;
        if (x.selected) {
          this.selectbackCard = x;
        }
      });
    }
    this.bankCardLoading = false;
  }

  /**
   * 删除银行卡
   *
   * @param card
   * @returns
   */
  //TODO: 放入service中
  deleteCard(card: BankCard) {
    const param: DeleteParam = {
      id: card.id,
      key: '',
    };
    const confirmData: StandardPopupData = {
      type: 'warn',
      // 是否删除此银行卡
      content: this.localeService.getValue('del_bank_ca01'),
      // 此操作不可取消
      description: this.localeService.getValue('oper_can_be00'),
    };

    //确认弹窗
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        ...confirmData,
        callback: () => {
          //2fa验证弹窗
          this.general2faverifyService.launch('DelBankCard').subscribe(async res => {
            if (res.status) {
              //正式请求删除
              this.bankCardLoading = true;
              param.key = res.key;
              this.bankCardApi.deleteCard(param).subscribe(res => {
                if (res?.success && res?.data) {
                  this.toast.show({
                    message: this.localeService.getValue('dele_card_s'),
                    type: 'success',
                  });
                  //刷新列表
                  this.loadCardList();
                } else {
                  this.bankCardLoading = false;
                  this.toast.show({
                    message: this.localeService.getValue('dele_card_f'),
                    type: 'fail',
                  });
                }
              });
            } else {
              this.bankCardLoading = false;
            }
          });
        },
        autoCloseAfterCallback: true,
      },
    });
  }

  /**
   * 设为默认卡
   *
   * @param card
   * @returns
   */
  async setDefault(card: any) {
    const result = await firstValueFrom(this.bankCardApi.setDefaultCard(card.id));
    if (result.success) {
      this.toast.show({ message: this.localeService.getValue('def_card_s'), type: 'success' });
      this.loadCardList();
      return;
    }
    this.toast.show({ message: this.localeService.getValue('def_card_f'), type: 'fail' });
  }

  /**
   * 获取提款方式
   */
  getPaymentList() {
    if (!this.selectedCurrency) return;
    const param: PaymentListInferface = {
      currency: this.selectedCurrency.currency,
      category: 'Withdraw',
    };

    this.isPayLoading = true;
    this.depositApi.getPaymentlist(param).subscribe(res => {
      this.isPayLoading = false;
      const { types, paymentList } = res;
      if (paymentList.length > 0) {
        //有支付方式
        if (types.length > 0) {
          this.paymentWayList = types.map((i: string, index: number) => {
            return {
              typeName: i,
              key: index,
              isActive: false,
              list: paymentList.filter((e: any) => e.type && e.type.includes(i)),
            };
          });
          this.selectedTabIndex = this.paymentWayList.find((e: any) => e.list.length > 0).key;
          this.currentPaymenyList = this.paymentWayList[this.selectedTabIndex];
        } else {
          this.paymentWayList = [
            {
              typeName: this.localeService.getValue('other_pay'),
              key: 1,
              isActive: false,
              list: paymentList,
            },
          ];
          this.currentPaymenyList = this.paymentWayList[0];
        }

        // 当存续得法为第一个返回值/自动调用onChangeTab方式 刷新提需得法
        if (this.topUpService.onCheckFiatToCrypto(paymentList, 7)) {
          this.onChangeTab(this.paymentWayList[0]);
        }

        this.isShowPaymentIq = false;
      } else {
        this.paymentWayList = paymentList;
        if (!this.selectedCurrency) return;
        if (!paymentList.length && this.paymentIqService.onCurrencyCheck(this.selectedCurrency.currency)) {
          this.isShowPaymentIq = true;
          this.piqSelectedCurrency = this.selectedCurrency.currency;
          this.paymentIqCoinLimit = this.coinLimit;
          this.checkKycForPaymentIq();
        } else {
          this.isShowPaymentIq = false;
        }
      }
    });
  }

  allowPaymentIq: boolean = false;
  checkingPaymentIq: boolean = false;

  async checkKycForPaymentIq(req: boolean = false, needLevel: number = 2) {
    if (this.currentKycLevel === null) return;
    this.checkingPaymentIq = true;
    if (this.currentKycLevel >= needLevel) {
      this.allowPaymentIq = true;
    } else {
      if (req) {
        this.kycApi.getUserKycStatus().subscribe(data => {
          if (data.length > 0) {
            this.currentKycLevel = this.kycService.checkUserKycStatus(data)?.level || 0;
            if (this.currentKycLevel >= needLevel) {
              this.allowPaymentIq = true;
            } else {
              this.kycDialogService.showKycError(null, this.currentKycLevel + 1);
            }
          }
        });
      } else {
        this.kycDialogService.showKycError(null, this.currentKycLevel + 1);
      }
    }
    this.checkingPaymentIq = false;
  }

  /**
   * 切换tab
   *
   * @param item TabIndex
   */
  onChangeTab(item: any) {
    this.selectedTabIndex = item.key;
    this.currentPaymenyList = item;
    this.selectedWithdraw = null;
    this.resetAddressForm();
    this.amount = '';
    this.amountValid.isValid = false;
    this.errorMsg = '';
    this.onMaintainance = '';
    // 提法得虚
    this.isShowCryptoToFiat = false;
    if (item?.list.find((list: any) => list.actionType === 7)) {
      this.isShowCryptoToFiat = true;
      this.cryptoWidthdraw = item.list[0];
      this.handleWithdrawOption(item.list[0]);
      this.getCurrenciesToCrypTo();
    }
  }

  walletAddressReg?: RegExp;

  /**
   * 选择提款方式
   *
   * @param option
   */
  async handleWithdrawOption(option: any) {
    this.resetAddressForm();
    this.amount = '';
    this.amountValid.isValid = false;
    this.errorMsg = '';
    this.onMaintainance = '';
    this.selectedWithdraw = option;
    this.coinRange.min = Math.ceil(option.minAmount);
    this.coinRange.realmin = Math.ceil(Number(option.minAmount).add(Number(this.fee)));
    this.coinRange.max = Math.floor(option.maxAmount);
  }

  async checkContinue() {
    if (!this.selectedCurrency) return;

    this.checkLoading = true;
    //验证当前支付方式是否可用
    const res = await this.walletApi.getPaymentAvail(
      this.selectedWithdraw.code,
      this.selectedCurrency.currency,
      'Withdraw',
    );
    this.checkLoading = false;
    if (!res) return;
    if (res.success) {
      this.kycName = res.data.userName;
      /** EB Pay 提款 */
      this.isNeedWalletAddress = res.data.isNeedWalletAddress;
      if (this.isNeedWalletAddress) {
        this.walletAddressReg = new RegExp(res.data.walletAddressValid ?? '');
        this.checkLoading = true;
        const userinfo = await firstValueFrom(this.accApi.getUserAccountInfor());
        if (userinfo?.data) this.appService.userInfo$.next(userinfo.data);
        this.checkLoading = false;
      }
      if (res.data.isValid) {
        this.onMaintainance = 'transferVaild';
      } else {
        //支付方式不可用
        this.onMaintainance = 'transferUnvaild';
      }
    } else {
      if (res.code == '2049' || res.code == '2048') {
        //支付方式不可用,显示维护中
        this.onMaintainance = 'maintainance';
      } else {
        const level = ['', 'KycPrimary', 'KycIntermediat', 'KycAdvanced'].findIndex(x => x === res.data.kycType);
        this.kycDialogService.showKycError(Number(res.code), level + 1);
      }
    }
  }

  /**
   * 选择银行卡
   *
   * @param card
   */
  handleSelectCard(card: any) {
    this.cardList.forEach(x => {
      //先全部取消选择，再选择当前
      x.selected = false;
    });
    card.selected = true;
    this.selectbackCard = card;
  }

  //跳转管理页面
  jumpToCards() {
    this.router.navigateByUrl(`/${this.appService.languageCode}/wallet/bankcard`);
  }

  /**
   * 是否可以提交提现信息
   */
  canSubmit() {
    // 提法得虚 是否可以提交
    if (this.isShowCryptoToFiat) {
      // 选择网络
      if (this.selectedNetTabIndex === 0) {
        return this.amountValid.isValid && this.isCanNext && this.addressValid.isValid1 && this.addressValid.isValid2;
      }
      // 选择地址簿
      if (this.selectedNetTabIndex === 1) {
        return this.amountValid.isValid && this.isCanNext;
      }
    }

    // 普通提现
    if (this.amountValid.isValid) {
      if (!this.isNeedWalletAddress) {
        return this.selectbackCard;
      } else {
        // 手动填写
        if (this.selectedNetTabIndex === 0) {
          return this.walletaddressValid && this.isAuthValid;
        }
        // 选择地址簿
        if (this.selectedNetTabIndex === 1) {
          return this.selectedAddress && this.isCanNext;
        }
      }
    }
    return false;
  }

  //点击继续
  async handleNext() {
    if (!this.canSubmit()) {
      return;
    }

    if (this.isNeedWalletAddress && this.selectedNetTabIndex === 0) {
      const data = await this.general2faverify();
      if (!data) return;
    }

    // 提法得虚
    if (this.isShowCryptoToFiat) {
      this.onCrypToSubmit();
      return;
    }

    let data;

    //普通---确认提款订单dialog
    if (!this.isNeedWalletAddress) {
      data = {
        selectedWithdraw: this.selectedWithdraw,
        selectedCurrency: this.selectedCurrency,
        category: 'Withdraw',
        selectbackCard: this.selectbackCard,
        amount: this.amount,
        fee: this.fee,
      };
    } else {
      data = {
        selectedWithdraw: this.selectedWithdraw,
        selectedCurrency: this.selectedCurrency,
        category: 'Withdraw',
        amount: this.amount,
        fee: this.fee,
        walletaddress: this.selectedNetTabIndex === 0 ? this.walletaddress : this.selectedAddress.address,
        key: this.key,
        isNeedWalletAddress: this.isNeedWalletAddress,
        selectedAddress: this.selectedNetTabIndex === 0 ? null : this.selectedAddress,
      };
    }
    this.dialog.open(SubmitDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: { callback: this.closeSubmitCallBack.bind(this), submitData: data, submitWay: 'currencyWithdraw' },
      disableClose: true,
    });
  }

  //绑定关闭提交定单
  closeSubmitCallBack(event: any) {
    // 成功后，跳转到提交订单页面
    this.orderSuccess = true;
    this.submitRecipet = event;
    if (this.isNeedWalletAddress) {
      this.submitRecipet = {
        selectedWithdraw: this.selectedWithdraw,
        selectedCurrency: this.selectedCurrency,
        fee: this.fee,
        walletaddress: this.walletaddress || this.selectedAddress.address,
        isNeedWalletAddress: this.isNeedWalletAddress,
        ...this.submitRecipet,
      };
    }
    //手动更新余额
    this.appService.assetChanges$.next({ related: 'Wallet' });
    //检查风控
    // console.log('检查风控表单');
    // this.riskService.checkUserRiskForm();
  }

  // kycErrorDialog(errorMassage: string) {
  //   this.dialog.closeAll();
  //   this.dialog.open(KycErrorDialogComponent, {
  //     panelClass: 'custom-dialog-container',
  //     data: { callback: this.withdrawService.closeErroeCallBack.bind(this), message: errorMassage },
  //   });
  // }

  //选择币种
  handleSelectCurrency() {
    this.dialog
      .open(SelectCurrencyComponent, {
        panelClass: 'custom-dialog-container',
        data: { isDigital: false },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) this.closeSelectCurrencyCallBack(result);
      });
  }

  //SelectCurrencyDialogComponent 关闭后触发
  async closeSelectCurrencyCallBack(data: CurrenciesInterface) {
    const { currency } = data;
    //获取币种限额
    const result = await firstValueFrom(this.withdrawApi.getCoinLimit(currency));
    if (result?.data) {
      this.coinLimit = result.data;
      // 新手续费 逻辑添加
      this.fee = result.data?.paymentHandlingFee || 0;
    }
    this.selectedCurrency = data;
    //每次选择后，需要清空上一次选择的数据

    this.selectedWithdraw = null;
    this.currentPaymenyList = [];
    // 清空 提法得虚
    this.isShowCryptoToFiat = false;
    this.otherWithdraw = [];
    this.recommendWithdraw = [];
    this.onMaintainance = '';
    this.coinRange.min = 0;
    this.coinRange.max = 0;
    this.allowPaymentIq = false;
    this.getPaymentList();
  }

  /**
   * 添加银行卡
   */
  addBankCard() {
    const dialogRef = this.dialog.open(AddBankCardComponent, {
      disableClose: true,
      panelClass: 'bankcard-container',
      data: { kycName: this.kycName },
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((success: any) => {
      if (success) this.loadCardList();
    });
  }

  trackMethod(index: any, item: any) {
    return item.id;
  }

  /**
   * 金额输入
   */
  onAmountInput() {
    if (!this.selectedCurrency) {
      //"请选择提现币种";
      this.errorMsg = this.localeService.getValue('sel_with_coin');
      this.amountValid.isValid = false;
      return;
    }

    if (!this.selectedWithdraw) {
      //"请选择提现方式"
      this.errorMsg = this.localeService.getValue('sel_with_method');
      this.amountValid.isValid = false;
      return;
    }

    if (Number(this.amount) > this.coinLimit.availQuota) {
      //余额不足
      this.errorMsg = this.localeService.getValue('in_bala');
      this.amountValid.isValid = false;
      return;
    }

    this.realAmount = Number(this.amount).minus(Number(this.fee));

    if (this.realAmount < this.coinRange.min || this.realAmount > this.coinRange.max) {
      //"请输入有效金额";
      this.errorMsg = this.localeService.getValue('valid_amount');
      this.amountValid.isValid = false;
      return;
    }

    if (this.realAmount <= 0) {
      this.amountValid.isValid = false;
      return;
    }

    this.amountValid.isValid = true;
  }

  /**填入全部金额 */
  inputAll() {
    this.amount = Math.floor(this.coinLimit?.availQuota || 0);
    this.onAmountInput();
  }

  //跳转页面:历史总览
  openHistoryPage() {
    this.walletHistoryService.designatedWithdrawCurrencyHistory$.next('isCurrency');
    this.router.navigate([this.appService.languageCode, 'wallet', 'history', 'withdrawal']);
  }

  cancelOrder(orderNum: string) {
    this.walletHistoryService.cancelCurrency(orderNum, this.getCurrencyWithdrawHistory.bind(this));
  }

  /**
   * 继续投注金额减免手续费提示
   *
   * @param fee
   */
  feeSubtract(fee: number | string): number {
    return Number(fee).subtract(100);
  }

  /**
   * 最小额度显示
   *
   * @param minRange
   * @param fee
   */
  feePlus(minRange: number | string, fee: number | string): number {
    return Number(minRange).add(fee);
  }

  /**
   * 选择地址/地址铺
   *
   * @param index
   */
  onSelectedMethod(index: number) {
    if (this.selectedNetTabIndex === index) return;
    this.resetAddressForm();
    this.selectedNetTabIndex = index;
    // 10/18 地址簿组件自己请求 暂注释
    // if (this.selectedNetTabIndex === 1) {
    //   this.loadingAddress = true;
    //   this.withdrawService.loadAddressList().subscribe(data => {
    //     this.loadingAddress = false;
    //     if (data?.data) this.addressInfor = data.data;
    //   });
    // }
  }

  resetAddressForm() {
    this.walletaddress = '';
    this.isAuthValid = false;
    this.walletaddressValid.isValid = false;
    this.walletaddressValid.text = '';
    this.isCanNext = false;
    this.selectedNetwork = null;
    this.selectedAddress = null;
    this.address = '';
    this.addressValid = {
      isValid: false,
      text: '',
      isValid1: false,
      isValid2: false,
    };
  }

  /** 预计可提 */
  get getPreWidthdraw(): number {
    if (!this.amount) return 0;
    if (!this.amountValid.isValid) return 0;
    return Number(this.amount)
      .minus(this.fee)
      .divide(this.currentRateData?.rate || 1);
  }

  /** 获取虚拟货币手续费 */
  get getCrypToFee(): number {
    return Number(this.selectedNetwork?.withdrawFee || 1);
  }

  /** 预计 到账 */
  get getToAccount(): number {
    if (!this.amount) return 0;
    if (!this.amountValid.isValid) return 0;
    return Number(this.getPreWidthdraw).minus(this.getCrypToFee);
  }

  /**
   * 提法得虚 支持货币
   */
  /** 获取存虚得法的货币 */
  getCurrenciesToCrypTo() {
    this.loadingSelectedCurrency = true;
    this.depositApi.getCurrencies(2, 'Withdraw', true).subscribe(data => {
      this.loadingSelectedCurrency = false;
      if (data?.length) {
        const defaultCurrency = data.find(item => item.currency === this.defaultCurrency.currency);
        const usdt = data.find(item => item.currency === 'USDT');
        if (defaultCurrency) {
          // 优先展示 头部钱包货币
          this.selectedCryptoCurrency = defaultCurrency;
        } else if (usdt) {
          // 其次 默认显示USDT
          this.selectedCryptoCurrency = usdt;
        } else {
          // 没有就显示 返回的第一个货币
          this.selectedCryptoCurrency = data[0];
        }
        this.supportCurrencies = data;
      }
      this.getFiatToVirtualRate();
    });
  }

  /** 选择存虚得法的 货币 */
  onSelectCurrency() {
    this.selectedCryptoCurrency = null;
    this.amount = '';
    this.dialog
      .open(SelectCurrencyComponent, {
        panelClass: 'custom-dialog-container',
        data: {
          showBalance: false,
          isDigital: true,
          useData: this.supportCurrencies,
        },
      })
      .afterClosed()
      .subscribe(result => {
        this.selectedCryptoCurrency = result;
        if (!this.selectedCryptoCurrency) {
          this.selectedWithdraw = null;
          return;
        }
        this.handleWithdrawOption(this.cryptoWidthdraw);
        this.getFiatToVirtualRate();
      });
  }

  /** 获取汇率 */
  getFiatToVirtualRate() {
    if (!this.selectedCurrency) return;
    this.rateLoading = true;
    this.depositApi.getFiatToVirtualRate(this.selectedCurrency?.currency, 'Withdraw').subscribe(data => {
      this.rateLoading = false;
      if (data) {
        this.currentRateData = data?.rates?.find(
          (rate: any) => rate?.currency === this.selectedCryptoCurrency?.currency,
        );
        this.rateData = data;
      }
    });
  }

  /** 选择网络 */
  handleTransNetWork() {
    this.dialog.open(SelectNetworkDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        selectedCurrency: this.crypToCurrencies.find(v => v.currency === this.selectedCryptoCurrency?.currency),
        address: this.address,
        addressValied: this.addressValid.isValid1,
        isDeposit: false,
        callback: (data: TokenNetworksFlatInterface) => {
          //对地址进行格式验证
          this.addressValid.isValid2 = this.tokenNetworksValidationService.checkNetWorkValied(
            data.name,
            data.network,
            this.address,
          );
          this.selectedNetwork = data;
          this.onNetWorkInput(this.address);
        },
      },
    });
  }

  /**
   * 地址输入
   *
   * @param element
   */
  onNetWorkInput(element: any) {
    //判断地址是否正确
    if (this.selectedCryptoCurrency && this.selectedCryptoCurrency.currency) {
      this.addressValid.isValid1 = this.tokenNetworksValidationService.checkAdressVailedByCurrency(
        this.selectedCryptoCurrency.currency,
        this.address,
      );
    } else {
      this.addressValid.isValid1 = false;
    }

    if (this.selectedNetwork) {
      this.addressValid.isValid2 = this.tokenNetworksValidationService.checkNetWorkValied(
        this.selectedNetwork.name,
        this.selectedNetwork.network,
        this.address,
      );
    } else {
      this.addressValid.isValid2 = false;
    }
    //判断显示文字
    if (this.address.length === 0 && (element.foc || element === '')) {
      this.addressValid.isValid = false;
      this.isCanNext = false;
      this.addressValid.text = this.localeService.getValue('enter_wd_ad');
    } else if (!this.addressValid.isValid1) {
      this.addressValid.isValid = false;
      this.isCanNext = false;
      this.addressValid.text = this.localeService.getValue('add_format_error');
    } else if (this.selectedNetwork && !this.addressValid.isValid2) {
      this.addressValid.isValid = false;
      this.isCanNext = false;
      this.addressValid.text = this.localeService.getValue('check_ad');
    } else {
      this.addressValid.isValid = true;
      this.isCanNext = true;
    }
  }

  /**
   * 从地址簿里选择
   *
   * @param isEw
   */
  handleSelectAddress(isEw: boolean = false) {
    this.dialog
      .open(SelectAddressDialogComponent, {
        panelClass: 'custom-dialog-container',
        data: {
          currency: isEw ? this.selectedCurrency?.currency : this.selectedCryptoCurrency?.currency,
          paymentMethod: isEw ? this.selectedWithdraw?.code : undefined,
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          if (isEw) {
            this.selectedAddress = result;
          } else {
            this.selectedAddress = result;
            this.selectedNetwork = result.networkInfo;
          }
          this.isCanNext = true;
        }
      });
  }

  /**
   * 提法得虚 提交
   *
   *
   */
  onCrypToSubmit() {
    let data: any = {
      isCrypToSubmit: true,
      icon: this.selectedCryptoCurrency,
      fee: this.fee,
      currency: this.selectedCurrency?.currency,
      withdrawCurrency: this.selectedCryptoCurrency?.currency as string,
      amount: this.amount,
      paymentCode: this.cryptoWidthdraw.code,
      actionType: this.cryptoWidthdraw.actionType,
      rateId: this.rateData?.rateId || null,
      beforeWithdrawAmount: this.getPreWidthdraw,
      withdrawAmount: this.getToAccount,
      withdrawFee: this.selectedNetwork?.withdrawFee,
    };
    if (this.selectedNetTabIndex === 1) {
      // 地址簿，不需要2fa
      data = {
        ...data,
        address: this.selectedAddress?.address,
        addressId: this.selectedAddress?.id,
        network: this.selectedNetwork?.network,
      };
    } else if (this.selectedNetTabIndex === 0) {
      // 使用新地址,需要2fa验证
      //判断数字货币地址是否满足条件
      if (!this.address) {
        return;
      }
      data = {
        ...data,
        address: this.address,
        network: this.selectedNetwork?.network,
      };
    }
    this.dialog.open(SubmitDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        submitData: data,
        submitWay: 'cryptoWithdraw',
        need2fa: this.selectedNetTabIndex === 0,
        callback: (response: any) => {
          this.withdrawService.closeSubmitCallBack(response);
        },
      },
      disableClose: true,
    });
  }

  /**格式化输入金额，且不能0开头 */
  amountFormat = (v: string) => {
    const val = Number(v.replace(/[^0-9]/g, ''));
    return val > 0 ? val : '';
  };

  /**限制一些字符的输入 */
  amountKeydown(e: KeyboardEvent) {
    if (e?.key === '.' || e?.key === '-' || e?.key === 'e') e.preventDefault();
  }

  /**
   * 發送驗證碼后倒计时状态
   *
   * @param event
   */
  onfirstSendAuthcode(event: any) {
    this.smsVoice = event?.smsVoice || false;
    this.authStatus = 'sent';
    setTimeout(() => {
      this.authStatus = 'timeout';
    }, TIMER_MS);
  }

  // 接收通过手机验证api的返回数据
  onOtpCode(event: any) {
    if (event.phone) {
      this.phone = event.phone;
    }
    this.authcode = event.authcode;
    this.isAuthValid = event.valid;
  }

  async general2faverify() {
    if (!this.userAccountInfor) return;
    const res = await firstValueFrom(
      this.accApi.general2faVerify(this.otpType, {
        areaCode: this.userAccountInfor.areaCode, //手机区号
        mobile: this.phone, //手机号
        otpCode: this.authcode, //验证码
        smsVoice: this.smsVoice, //是否语音验证
      }),
    );
    if (res.success == false && res.message) {
      this.toast.show({ message: res.message, type: 'fail' });
      return false;
    } else {
      this.key = res.data;
      return true;
    }
  }

  /**
   * 地址输入
   *
   * @param element
   */
  onEbpayAddressChange() {
    //判断显示文字
    if (this.walletaddress.length === 0) {
      this.walletaddressValid.isValid = false;
      this.isCanNext = false;
      this.walletaddressValid.text = this.localeService.getValue('enter_wd_curr_ad');
      return;
    }
    if (this.walletaddress.length > 0 && this.walletAddressReg && !this.walletAddressReg.test(this.walletaddress)) {
      this.walletaddressValid.isValid = false;
      this.isCanNext = false;
      this.walletaddressValid.text = this.localeService.getValue('enter_wd_ebpay_ad_err');
      return;
    }
    this.walletaddressValid.isValid = true;
    this.isCanNext = true;
  }
}
