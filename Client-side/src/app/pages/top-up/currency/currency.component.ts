import { Location } from '@angular/common';
import { Component, DestroyRef, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import { Subject, combineLatest, firstValueFrom, merge, timer } from 'rxjs';
import { debounceTime, delay, first, map, takeUntil, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { BankCardApi } from 'src/app/shared/apis/bank-card.api';
import { DepositApi } from 'src/app/shared/apis/deposit.api';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import { SelectCurrencyComponent } from 'src/app/shared/components/select-currency/select-currency.component';
import { SelectDepositBonusService } from 'src/app/shared/components/select-deposit-bonus/select-deposit-bonus.service';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { SystemBankCard } from 'src/app/shared/interfaces/bank-card.interface';
import { BonusList } from 'src/app/shared/interfaces/bonus.interface';
import {
  CurrenciesInterface,
  DepositCryptoCallBackData,
  PaymentListInferface,
  PaymentListResponse,
  PostDepositCryptoInferface,
  ResponseToCurrency,
  TokenNetworksFlatInterface,
  VirtualRate,
} from 'src/app/shared/interfaces/deposit.interface';
import { CurrencytxHistoryInterface } from 'src/app/shared/interfaces/history.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { GeneralService } from 'src/app/shared/service/general.service';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { SentryService } from 'src/app/shared/service/sentry.service';
import { environment } from 'src/environments/environment';
import { PaymentIqService } from '../../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { SelectDividendDialogComponent } from '../../../shared/components/select-deposit-bonus/select-dividend-dialog/select-dividend-dialog.component';
import { CardCenterService } from '../../card-center/card-center.service';
import { KycService } from '../../kyc/kyc.service';
import { WalletHistoryService } from '../../user-asset/wallet-history/wallet-history.service';
import { SelectNetworkDialogComponent } from '../digital/select-network-dialog/select-network-dialog.component';
import { TopUpService } from '../top-up.service';
import { GuideVideoComponent } from './guide-video/guide-video.component';
import { H5QuestionsDialogComponent } from './h5-questions-dialog/h5-questions-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-currency',
  templateUrl: './currency.component.html',
  styleUrls: ['./currency.component.scss'],
})
export class CurrencyComponent implements OnInit, OnDestroy {
  constructor(
    private dialog: MatDialog,
    private topUpService: TopUpService,
    private depositApi: DepositApi,
    private walletApi: WalletApi,
    private appService: AppService,
    private historyApi: HistoryApi,
    private bankCardApi: BankCardApi,
    private layout: LayoutService,
    private kycService: KycService,
    private popupService: PopupService,
    private router: Router,
    private localeService: LocaleService,
    private walletHistoryService: WalletHistoryService,
    private route: ActivatedRoute,
    private kycDialogService: KycDialogService,
    private location: Location,
    private generalService: GeneralService,
    private dataCollectionService: DataCollectionService,
    private paymentIqService: PaymentIqService,
    private sentryService: SentryService,
    private destroyRef: DestroyRef,
    private kycApi: KycApi,
    private piqService: PaymentIqService,
    private cardCenterService: CardCenterService,
    private selectDepositBonusService: SelectDepositBonusService,
  ) {}

  static _componentName = 'FiatDepositComponent';

  isH5!: boolean;
  /** 被选中货币数据 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seletedDepositCurrencyItem: any = null;
  /** 被选中支付方式 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seletedDepositWay: any = null;
  submitLoading: boolean = false; //submit中
  userName: string = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  amount: any;
  isOpen: boolean = false;
  iAmountIsValid: boolean = false;
  // isShow: boolean = true;
  isMore: boolean = false;
  isClick: boolean = false;
  isMaintenance: boolean = false;
  canSubmit: boolean = false;
  /** 当前选择的注册方式 0:用户名 1:手机号 */
  selectedTabIndex = 0;
  /** 被选中银行 */
  // seletedBank: any = null;
  /** 下拉银行选单 */
  openBankList: boolean = false;
  /** 选中银行 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedBank: any = {};
  isEmpty: boolean = false;
  // historyData: any = [];
  currencyHistory: CurrencytxHistoryInterface[] = [];
  systemBankList!: Array<SystemBankCard>;
  /** 支付方式需要选择银行卡 */
  isShowBankCard: boolean = false;
  /** 银行卡选择loading */
  isSelectBankLoading: boolean = false;
  isLoading: boolean = false;
  isPayLoading: boolean = false;
  loadingCurrencies: boolean = true;

  /** 打开红利弹出框 */
  openDividend: boolean = false;
  /** 选中红利 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
  seletedDividend: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  paymentWayList: any = [];

  /**
   * 通道列表是否有人工申请，如果有返回索引
   *
   * @returns //
   */
  get manualCharge() {
    if (Array.isArray(this.paymentWayList) && this.paymentWayList.length > 0) {
      let itemIndex = -1;
      const tabIndex = this.paymentWayList.findIndex(x => {
        itemIndex = (x.list as []).findIndex((y: PaymentListResponse) => {
          return y.code === 'OverTheCounterTransfer';
        });
        return itemIndex >= 0;
      });
      if (tabIndex >= 0) {
        return { tabIndex, itemIndex };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  /** 红利数据 */
  bonuslist: BonusList[] = [];

  /** 防止点击红利出现问题 */
  bonusDisabled: boolean = false;

  /** 是否展示 红利的 选择框 */
  isShowBonus: boolean = false;

  /** 红利弹窗准备 */
  isBonusPopupReady: boolean = false;

  /** 红利接口请求loading */
  bonusLoading: boolean = false;

  /**传入币种默认CNY */
  queryCurrency: string | null = null;

  /**用于判断该视频支付方式是否有链接 */
  videoLink!: string;

  /** 是否显示paymentiq组件 当没有支付方式的时候 */
  isShowPaymentIq: boolean = false;

  /** piq用户选择的币种 */
  piqSelectedCurrency!: string;

  amountChanges$: Subject<boolean> = new Subject();
  amountBlur$: Subject<boolean> = new Subject();

  /** 是否展示存虚得法 */
  isShowDepositToCrypto: boolean = false;

  /** 存虚得法 */
  selectedCurrency: CurrenciesInterface | null = null;

  /** 支持存虚得法的货币 */
  supportCurrencies: CurrenciesInterface[] = [];

  /** loading pool */
  loadingSelectedCurrency: boolean = false;

  /** 选择网络 */
  selectedNetwork!: TokenNetworksFlatInterface | null;

  /** 汇率loading */
  rateLoading: boolean = false;

  /** 当前汇率数据 */
  currentRateData!: { rate: number; currency: string } | null;

  /** 汇率数据 */
  rateData!: ResponseData<VirtualRate>;

  /** 默认货币 */
  currentCurrency!: CurrenciesInterface;

  /** 默认货币 */
  defaultCurrency: string = 'CNY';

  /** 选择的语言 */
  languageCode = this.appService.languageCode;

  ngOnInit() {
    this.appService.currentCurrency$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      this.currentCurrency = v;
    });

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });

    this.appService.userInfo$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(userInfo => {
      if (userInfo) {
        if (userInfo?.isEurope && this.selectDepositBonusService.switchEuBonusFlow) {
          this.defaultCurrency = 'EUR';
        } else {
          this.defaultCurrency = 'CNY';
        }
      }
    });

    // 响应顶部跳转
    combineLatest([this.route.queryParams])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([query]) => {
        if (query.currency) this.queryCurrency = query.currency;

        this.getCurrency();
        this.getCurrencytxHistory();
      });

    // 请求红利
    merge(this.amountChanges$.pipe(debounceTime(400)), this.amountBlur$)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        this.checkBonus();
      });
    this.dataCollectionService.gtmPush('deposit_visit', { deposit_type: 'fiat' });
    this.dataCollectionService.addPoint({ eventId: 30011, actionValue1: 1 });
  }

  ngOnDestroy() {
    this.cardCenterService.onReset();
  }

  getCurrency() {
    this.loadingCurrencies = true;
    combineLatest([
      this.appService.currencies$.pipe(
        map(v => v.filter(x => !x.isDigital && x.isVisible)),
        untilDestroyed(this),
        first(v => !!(v.length > 0)),
      ),
      this.appService.currentCurrency$.pipe(first(v => !!v)),
    ]).subscribe(([v, currentCurrency]) => {
      this.loadingCurrencies = false;
      const matched = this.queryCurrency && v.find(e => e.currency === this.queryCurrency);

      //设置带入币种
      if (this.queryCurrency && matched) {
        if (matched) this.closeSelectCurrencyCallBack(matched);
      } else if (!currentCurrency?.isDigital && currentCurrency?.isVisible) {
        this.closeSelectCurrencyCallBack(currentCurrency);
      } else {
        const matched = v.find(e => e.currency === this.defaultCurrency);
        if (matched) this.closeSelectCurrencyCallBack(matched);
      }
    });
  }

  getCurrencytxHistory() {
    const param = {
      category: 'Deposit',
      startTime: this.generalService.getStartEndDateArray('30days')[0],
      endTime: this.generalService.getStartEndDateArray('30days')[1],
      currency: '',
    };
    this.isLoading = true;
    this.historyApi
      .getCurrencytxHistory(param)
      .pipe(map(v => v?.data))
      .subscribe(data => {
        //处理时间格式
        if (data?.list?.length > 0) {
          const newData = data?.list?.map(e => {
            const iniDa = new Date(e?.date || 0);
            const formatDate = moment(new Date(iniDa)).format('YYYY-MM-DD HH:mm');

            return {
              ...e,
              date: formatDate,
            };
          });
          const x = newData.sort((a, b) => {
            return new Date(b?.date || 0).valueOf() - new Date(a?.date || 0).valueOf();
          });
          this.currencyHistory = x.slice(0, 3);
        }
        this.isLoading = false;
      });
  }

  /**
   * 切换tab
   *
   * @param item
   * @param item.typeName
   * @param item.key
   * @param item.isActive
   * @param item.list
   */
  onChangeTab(item: { typeName: string; key: number; isActive: boolean; list: PaymentListResponse[] }) {
    this.selectedTabIndex = item.key;
    this.isMore = false;
    this.seletedDepositWay = null;
    this.selectedBank = {};
    this.amount = null;
    this.isValid = false;

    // 存虚得法
    this.onResetCrypto();
    if (item?.list.find(list => list.actionType === 6)) {
      this.isShowDepositToCrypto = true;
      // this.handleSelectTab(item?.list[0]);
      this.getCurrenciesToCrypTo();
    }

    this.resetBonus();
  }

  //推荐充值方式
  handleSelectTab(
    item: PaymentListResponse,
    group: { typeName: string; key: number; isActive: boolean; list: PaymentListResponse[] },
  ) {
    this.onChangeTab(group);
    this.seletedDepositWay = item;
    this.amount = null;
    this.isValid = false;
    this.iAmountIsValid = false;
    this.videoLink = '';
    if (
      // 支付宝个人码
      this.seletedDepositWay.code == 'AliPayTransfer' ||
      // 支付宝口令红包
      this.seletedDepositWay.code == 'AliPaySecretRedPacket' ||
      // 支付寶H5
      this.seletedDepositWay.code == 'AliPayH5' ||
      // 微信支付转帐
      this.seletedDepositWay.code == 'WeChatPayTransfer'
    ) {
      const key = this.seletedDepositWay.code.replace(/^./, this.seletedDepositWay.code[0].toLowerCase());
      this.videoLink = `${environment.resourceUrl}/${this.appService.tenantConfig.config[key]}`;
    }
    if (item.needBankCode) {
      //根据当前币种获取系统支持银行资讯
      this.loadSystemBankCardList(item.code);
      this.isShowBankCard = true;
    } else {
      this.isShowBankCard = false;
      this.systemBankList = [];
    }
    this.resetBonus();
    this.handleNext();
  }

  /**打开教程视频弹窗 */
  openGuideDialog() {
    this.dialog.open(GuideVideoComponent, { panelClass: 'guide-dialog', data: this.videoLink });
  }

  /**
   * 获取系统支持银行资讯
   *
   * @param paymentCode
   */
  async loadSystemBankCardList(paymentCode: string) {
    this.isSelectBankLoading = true;
    this.isLoading = true;
    const result = await firstValueFrom(
      this.bankCardApi.getDepositBank(paymentCode, this.seletedDepositCurrencyItem.currency),
    );
    if (result.success) {
      const formatData = result.data.map(e => {
        return {
          ...e,
          isSelected: false,
          valueKey: e,
          textKey: e.bankNameLocal,
          iconKey: `assets/images/bankicon/${e.bankCode}.png`,
        };
      });
      this.isSelectBankLoading = false;
      this.isLoading = false;
      this.systemBankList = formatData;
    }
  }

  /**限制一些字符的输入 */
  amountKeydown(e: KeyboardEvent) {
    if (e?.key === '.' || e?.key === '-' || e?.key === 'e') e.preventDefault();
  }

  /**
   * 充值计算
   *
   * @param element 金额输入框
   */
  isValid: boolean = false;
  handleAmount(amount: number, changes: boolean = true) {
    this.amount = Number(amount) > 0 ? Number(amount) : amount;
    this.isValid = this.iAmountIsValid =
      this.seletedDepositWay.minAmount <= Number(this.amount) &&
      Number(this.amount).minus(Number(this.seletedDepositWay.maxAmount)) <= 0;
    this.resetBonus();
    if (changes) this.amountChanges$.next(true);
  }

  /**
   * 普通 - 实际到账金额
   *
   * @returns //
   */
  get getRealAmount(): number {
    if (Number(this.amount).minus(this.seletedDepositWay.fee) < 0) return 0;
    if (!this.isValid) return 0;
    return Number(this.amount).minus(this.seletedDepositWay.fee);
  }

  /**
   * 检查和读取红利
   *
   * @param callback
   */
  checkBonus(callback: () => void = () => {}) {
    if (!this.isValid) {
      this.bonusDisabled = false;
      return;
    }
    this.bonusLoading = true;
    this.selectDepositBonusService
      .bufferTopUpBonus(this.seletedDepositCurrencyItem.currency, this.amount || 0)
      .subscribe(data => {
        this.bonusLoading = false;
        if (data) {
          this.bonuslist = data?.filter(item => item.prizeAmountType !== 0 || item.freeSpinTimes !== null);
        }
        if (this.bonuslist.length > 0) {
          if (this.cardCenterService.onNoneStickyWithBonus(this.bonuslist)) {
            this.seletedDividend = this.cardCenterService.onNoneStickyWithBonus(this.bonuslist);
          } else {
            this.bonuslist[0].isActive = true;
            this.seletedDividend = this.bonuslist[0];
          }
        }
        this.isShowBonus = this.bonuslist.length > 0;
        this.isBonusPopupReady = true;
        if (this.amount) {
          this.bonusDisabled = true;
        } else {
          this.bonusDisabled = false;
        }
        callback();
      });
  }

  /**重置红利 */
  resetBonus() {
    this.seletedDividend = undefined;
    this.isBonusPopupReady = false;
    this.isShowBonus = false;
  }

  //是否能继续step2(当前支付方式判定是否可用)
  async handleNext() {
    if (!this.isCanNext()) {
      return;
    }
    this.isMore = false;
    this.isClick = true;
    const res = await this.walletApi.getPaymentAvail(
      this.seletedDepositWay.code,
      this.seletedDepositCurrencyItem.currency,
      'Deposit',
    );
    if (!res) {
      this.isClick = false;
      return;
    }
    if (res.success) {
      this.userName = res.data.userName;
      this.isMore = res.data.isValid;
      // 存虚得法
      if (this.isMore) this.getFiatToVirtualRate();
    } else {
      if (res.code == '2049' || res.code == '2048') {
        //支付方式/币种不可用,显示维护中
        this.isMaintenance = true;
      } else {
        const level = ['', 'KycPrimary', 'KycIntermediat', 'KycAdvanced'].findIndex(x => x === res.data.kycType);
        this.kycDialogService.showKycError(Number(res.code), level + 1);
      }
    }
    this.isClick = false;
  }

  /**
   * 错误类型路由
   *
   * @param code 错误类型
   * @param errorMsg 弹窗描述文字
   */
  openErrorDialog(code: string, errorMsg?: string) {
    //title
    switch (code) {
      case 'payChannelBusy':
        // 提示跳转人工
        this.errorDialog(
          this.localeService.getValue('hint'),
          code,
          errorMsg,
          this.localeService.getValue('pay_channel_busy_b'),
          true,
          false,
        );
        break;
      case '2097': //禁用存款
        this.appService.showForbidTip('income', errorMsg);
        break;
      case 'kcyError':
        this.errorDialog(
          this.localeService.getValue('safety_rem00'),
          code,
          errorMsg,
          this.localeService.getValue('verification'),
          true,
          true,
          true,
        );
        break;
      case '2049':
      case '2052':
        this.errorDialog(
          this.localeService.getValue('not_ava'),
          code,
          this.localeService.getValue('kyc_error01'),
          this.localeService.getValue('online_cs'),
          true,
          false,
        );
        break;
      case '2050':
        this.errorDialog(
          this.localeService.getValue('safety_rem00'),
          code,
          this.localeService.getValue('kyc_error02'),
          this.localeService.getValue('verification'),
          true,
          true,
        );
        break;
      case '2053':
        this.errorDialog(
          this.localeService.getValue('kyc_error03'),
          code,
          this.localeService.getValue('kyc_error04'),
          this.localeService.getValue('verification'),
          true,
          false,
        );
        break;
      //存款金额超出当日限额
      case '2061':
        this.errorDialog(
          this.localeService.getValue('kyc_error03'),
          code,
          errorMsg,
          this.localeService.getValue('verification'),
          true,
          true,
        );
        break;
      // 存虚得法 code=2072, 没有可用支付方式信息，提示用户更换虚拟货币存款
      case '2072':
        this.errorDialog(
          this.localeService.getValue('hint'),
          code,
          errorMsg,
          this.localeService.getValue('confirm_button'),
          true,
          true,
        );
        break;
      // 存虚得法 code=2110, 汇率过期，提示用户汇率更新
      case '2110':
        this.errorDialog(
          this.localeService.getValue('hint'),
          code,
          errorMsg,
          this.localeService.getValue('confirm_button'),
          true,
          true,
        );
        break;
      default:
        if (!errorMsg) return;
        this.errorDialog(
          this.localeService.getValue('hint'),
          code,
          errorMsg,
          this.localeService.getValue('i_ha_kn00'),
          false,
          false,
        );
        break;
    }
  }

  /**
   * 显示错误弹窗
   *
   * @param title 弹窗标题文字
   * @param code 可用于分辨按钮点击回调
   * @param errorMsg 弹窗描述文字
   * @param btnTxt 按钮文字
   * @param primary 是否是主题色的按钮
   * @param disableClose 是否禁止关闭
   * @param closeIcon 是否显示关闭按钮
   */
  errorDialog(
    title?: string,
    code?: string,
    errorMsg?: string,
    btnTxt?: string,
    primary?: boolean,
    disableClose?: boolean,
    closeIcon: boolean = false,
  ) {
    this.dialog.closeAll();
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'warn',
        content: title,
        buttons: [{ text: btnTxt, primary: primary }],
        description: errorMsg,
        callback: () => {
          this.closeErroeCallBack(primary, code);
        },
        closeIcon: closeIcon,
        closecallback: () => {
          this.closeIconCallBack();
        },
      },
      disableClose: disableClose,
    });
  }
  /**右上角关闭触发 */
  closeIconCallBack() {
    this.location.back();
  }

  // 关闭后触发
  closeErroeCallBack(kycStauts?: boolean, errCode?: string) {
    if (kycStauts) {
      switch (errCode) {
        case 'payChannelBusy':
          if (this.manualCharge) {
            // 自动选中人工申请通道
            let amount = Number(this.amount);
            const bonusNo = this.seletedDividend?.bonusActivitiesNo || 'unknowtmpcode';

            this.handleSelectTab(
              this.paymentWayList[this.manualCharge.tabIndex],
              this.paymentWayList[this.manualCharge.tabIndex].list[this.manualCharge.itemIndex],
            );

            if (amount < Number(this.seletedDepositWay.minAmount)) {
              amount = Number(this.seletedDepositWay.minAmount);
            } else if (amount > Number(this.seletedDepositWay.maxAmount)) {
              amount = Number(this.seletedDepositWay.maxAmount);
            }

            // 自动填入金额
            this.handleAmount(amount, false);

            // 手动检查红利 并自动提交
            this.checkBonus(() => {
              if (this.isShowBonus) {
                const bonus = this.bonuslist.find(x => x?.bonusActivitiesNo === bonusNo);
                if (bonus) this.closeSelectDividandCallBack(bonus);
              }
              this.submit();
            });
          }
          break;
        case '2049':
        case '2052':
          //临时在线客服
          this.appService.toOnLineService$.next(true);
          break;
        case 'kcyError':
        case '2061':
          // this.router.navigate([this.appService.languageCode, "userCenter", "kyc"], { fragment: "open" });
          this.kycDialogService.openPrimaryVerifyDialog();
          break;
        default:
          break;
      }
    }
  }

  /**选择币种 */
  handleSelectCurrency() {
    this.dialog
      .open(SelectCurrencyComponent, {
        panelClass: 'custom-dialog-container',
        data: { isDigital: false },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.closeSelectCurrencyCallBack(result);
          this.paymentIqService.seletedDividend.set(null);
        }
      });
  }

  //SelectCurrencyDialogComponent 关闭后触发
  closeSelectCurrencyCallBack(data: unknown) {
    this.seletedDepositCurrencyItem = data;
    this.paymentWayList = [];
    this.isMaintenance = false;
    this.amount = null;
    this.isMore = false;
    this.isShowPaymentIq = false;
    this.seletedDepositWay = null;
    this.allowPaymentIq = false;
    this.getPaymentList();
    this.resetBonus();
    this.onResetCrypto();
  }

  /**获取当前选择币种的支付方式 */
  getPaymentList() {
    const param: PaymentListInferface = {
      currency: this.seletedDepositCurrencyItem.currency,
      category: 'Deposit', //当前是充值，使用Deposit
    };
    this.isPayLoading = true;
    this.depositApi.getPaymentlist(param).subscribe(response => {
      this.isPayLoading = false;
      const { types, paymentList } = response;
      if (paymentList.length > 0) {
        // 有支付方式
        this.paymentWayList = this.topUpService.processPaymentlist(types, paymentList, true);

        // 当存续得法为第一个返回值/自动调用onChangeTab方式 刷新出存法得虚页面
        if (this.topUpService.onCheckFiatToCrypto(paymentList, 6)) {
          this.handleSelectTab(this.paymentWayList[0].list[0], this.paymentWayList[0]);
        }

        // 隐藏piq
        this.isShowPaymentIq = false;
      } else {
        //没有支付方式
        this.paymentWayList = [];
        if (this.paymentIqService.onCurrencyCheck(this.seletedDepositCurrencyItem.currency)) {
          // 没有支付方式显示payment iq
          this.isShowPaymentIq = true;
          this.piqSelectedCurrency = this.seletedDepositCurrencyItem.currency;
          this.checkKycForPaymentIq();
        } else {
          this.isShowPaymentIq = false;
        }
      }
    });
  }

  allowPaymentIq: boolean = false;
  checkingPaymentIq: boolean = false;

  checkKycForPaymentIq(needLevel: number = 1) {
    this.checkingPaymentIq = true;
    const currentKycLevel = this.piqService.currentKycLevel();
    if (currentKycLevel === null) {
      this.kycApi.getUserKycStatus().subscribe(data => {
        if (data.length > 0) {
          const currentKycLevel = this.kycService.checkUserKycStatus(data)?.level || 0;
          if (currentKycLevel >= needLevel) {
            this.allowPaymentIq = true;
          } else {
            this.kycDialogService.showKycError(null, currentKycLevel + 1);
          }
        }
        this.checkingPaymentIq = false;
      });
    } else {
      if (currentKycLevel >= needLevel) {
        this.allowPaymentIq = true;
      } else {
        this.kycDialogService.showKycError(null, currentKycLevel + 1);
      }
      this.checkingPaymentIq = false;
    }
  }

  //红利弹出框
  openDividendOptions() {
    // if (!this.isShowBonus) return;
    this.openDividend = !this.openDividend;
    this.dialog.open(SelectDividendDialogComponent, {
      panelClass: 'dividend-dialog-container',
      disableClose: true,
      data: {
        callback: this.closeSelectDividandCallBack.bind(this),
        bonusList: this.bonuslist,
        currencyInfor: this.seletedDepositCurrencyItem,
        seletedDividend: this.seletedDividend,
        couponCodeParams: {
          amount: this.amount,
          currency: this.seletedDepositCurrencyItem.currency,
        },
      },
    });
  }

  closeSelectDividandCallBack(item: BonusList | null) {
    if (!item) {
      this.bonuslist = this.bonuslist.map(list => ({
        ...list,
        isActive: false,
      }));
    }
    this.seletedDividend = item;
  }

  /**
   * 去充值
   *
   * @returns //
   */
  @HostListener('body:keydown.enter', ['$event'])
  submit() {
    if (this.isDisableSubmit()) return;

    const fullUrl = `${window.location.origin}/${this.appService.languageCode}/wallet/overview`;
    const param: PostDepositCryptoInferface = {
      amount: this.amount,
      currency: this.seletedDepositCurrencyItem.currency,
      paymentCode: this.seletedDepositWay.code,
      actionType: this.seletedDepositWay.actionType,
      userName: this.userName.length > 0 ? this.userName : '',
      bankCode: this.selectedBank.bankCode ? this.selectedBank.bankCode : '',
      activityNo: this.seletedDividend?.bonusActivitiesNo || 'unknowtmpcode',
      callbackUrl: this.seletedDepositWay.actionType == 2 || this.seletedDepositWay.actionType == 3 ? fullUrl : '',
    };
    this.selectDepositBonusService.resetBuffer();

    let newWindow: Window | null;
    if (this.seletedDepositWay.actionType == 2 || this.seletedDepositWay.actionType == 3) {
      newWindow = window.open('', '_blank');
    }
    if (this.seletedDepositWay) this.submitLoading = true;

    /** 存虚得法  */
    if (this.seletedDepositWay.actionType === 6) {
      this.submitFiatToCypto();
      return;
    }

    this.depositApi.postDepositCrypto(param).subscribe(res => {
      this.submitLoading = false;
      this.processResult(res, newWindow);
      if (!res?.success) {
        this.sentryService.error('DepositError', 'Fiat Deposit Error', {
          extra: { params: param, response: res },
          level: 'warning',
        });
      }
    });
  }

  /**
   * 整合返回处理
   *
   * @param res 返回值
   * @param newWindow 当前window
   */
  processResult(res: ResponseData<ResponseToCurrency>, newWindow?: Window | null) {
    if (res?.data) {
      if (res?.data?.statue == 7) {
        //上一笔交易还在处理中，需要间隔10秒重新请求
        newWindow?.close();
        this.buildWaitPop();
        return;
      } else {
        this.destroyWaitPop();
      }

      const callBackData: DepositCryptoCallBackData | ResponseToCurrency = res.data;
      const { statue, actionType, canUseTime } = callBackData;
      const orderInfor = {
        ...callBackData,
        seletedDepositWay: this.seletedDepositWay,
      };

      //网银转账创建成功
      if ((statue == 1 && actionType == 1) || (statue == 3 && actionType == 1) || (statue === 3 && actionType === 3)) {
        this.openOrderPage(orderInfor);
        newWindow?.close();
      } else if (statue == 1 && actionType == 2) {
        this.topUpService.orderInfor = {
          orderId: callBackData?.orderId,
          amount: this.amount,
          symbol: this.seletedDepositCurrencyItem.symbol,
        };
        this.openOrderPage(orderInfor);
        this.topUpService.vnThTransferOnlineCallBackData.next(callBackData);
        this.router.navigate([this.appService.languageCode, 'deposit', 'vn-th-transfer']);
        newWindow?.close();
      } else if (statue == 1 && actionType == 3) {
        this.topUpService.orderInfor = {
          orderId: callBackData?.orderId,
          amount: this.amount,
          symbol: this.seletedDepositCurrencyItem.symbol,
        };
        //新页面打开url
        if (environment.isApp) {
          window.location.href = callBackData.redirectUrl ?? '';
        } else {
          newWindow && (newWindow.location.href = callBackData.redirectUrl ?? '');
        }
        // window.open(callBackData.redirectUrl);
        this.openOrderPage(orderInfor);
        // this.router.navigate([this.appService.languageCode, "deposit", 'e-wallet']);
      } else if (statue === 1 && actionType === 6) {
        this.openOrderPage(orderInfor);
        newWindow?.close();
      } else if (statue == 2) {
        this.openOrderPage(orderInfor);
        this.openErrorDialog('', this.localeService.getValue('kyc_succ00'));
        newWindow?.close();
      } else if (statue == 4) {
        //多笔订单未支持
        const time = Math.floor((canUseTime - Date.now()) / 1000 / 60);
        this.openErrorDialog('', this.localeService.getValue('kyc_succ01', [time < 1 ? 1 : time]));
        newWindow?.close();
      } else if (statue == 5) {
        // 通道繁忙
        if (this.manualCharge) {
          // 有人工充值，提示人工充值
          // this.openErrorDialog('payChannelBusy', this.localeService.getValue('pay_channel_busy_d'));
          this.openErrorDialog('', this.localeService.getValue('trans_busy'));
        } else {
          actionType == 1
            ? this.openErrorDialog('', this.localeService.getValue('kyc_succ02'))
            : this.openErrorDialog('', this.localeService.getValue('trans_busy'));
        }
        newWindow?.close();
      } else if (statue == 6) {
        this.openErrorDialog('', this.localeService.getValue('kyc_succ04'));
        newWindow?.close();
      }
    } else {
      newWindow?.close();
      this.destroyWaitPop();
      this.openErrorDialog((res?.code ?? '') as string, res?.message);
    }
  }

  /**跳转收银台页面 */
  openOrderPage(orderInfor: DepositCryptoCallBackData | ResponseToCurrency) {
    //增加详情页面提示
    const detailInfo = this.seletedDepositWay?.tipsInfo?.find((x: { tipsType: string }) => x.tipsType == 'Detail');
    this.router.navigate([this.appService.languageCode, 'deposit', 'bank'], {
      state: { ...orderInfor, detailInfo: detailInfo?.content },
    });
  }

  /**判断是否继续 */
  isCanNext() {
    if (this.isShowDepositToCrypto) {
      return this.canSubmitCrypTo;
    } else {
      return Boolean(this.seletedDepositWay);
    }
  }

  /**判断是否可以提交订单 */
  isDisableSubmit() {
    if (this.bonusLoading) return true;

    let userNameValied: boolean;
    let bankNameValied: boolean;
    if (!this.isShowBankCard) {
      userNameValied = this.userName.length > 1;
      bankNameValied = true;
    } else {
      userNameValied = true;
      bankNameValied = this.selectedBank.bankCode !== undefined;
    }

    if (!this.isBonusPopupReady) return true;

    if (
      userNameValied &&
      this.seletedDepositWay.valueOf().name !== undefined &&
      this.amount >= this.seletedDepositWay.minAmount &&
      this.amount <= this.seletedDepositWay.maxAmount &&
      bankNameValied
    ) {
      return false;
    }

    return true;
  }

  back() {
    this.isMore = false;
    this.isValid = false;
    this.amount = null;
  }

  openQuestion() {
    this.dialog.open(H5QuestionsDialogComponent, {
      panelClass: 'custom-dialog-container',
    });
  }

  /**选择银行卡 */
  handleSelectBank(item: { isSelected: boolean }) {
    this.selectedBank = item;
    item.isSelected = true;
    this.openBankList = false;
  }

  openHistoryPage() {
    this.walletHistoryService.designatedDepositeCurrencyHistory$.next('isCurrency');
    this.router.navigate([this.appService.languageCode, 'wallet', 'history', 'deposit']);
  }

  openHistory() {
    this.router.navigate([this.appService.languageCode, 'retrieve-account', 'digital-record']);
  }

  @ViewChild('waitPop') waitPopTemplate!: TemplateRef<unknown>;
  waitPop?: MatDialogRef<unknown>;
  waitPopStatus$: Subject<number> = new Subject();

  /** 销毁等待弹窗和相关定时器 */
  destroyWaitPop() {
    this.waitPop?.close();
    this.waitPop = undefined;
  }

  /**创建等待弹窗和定时器 */
  buildWaitPop() {
    if (this.waitPop) return;
    this.waitPop = this.popupService.open(this.waitPopTemplate, {
      disableClose: true,
      speed: 'faster',
    });

    //启动轮询
    timer(10000, 10000)
      .pipe(takeUntil(this.waitPop.beforeClosed()), untilDestroyed(this))
      .subscribe(() => {
        this.submit();
      });

    //启动状态更新
    timer(0, 30000)
      .pipe(
        takeUntil(this.waitPop.beforeClosed()),
        untilDestroyed(this),
        tap(() => this.waitPopStatus$.next(1)),
        delay(5000),
        tap(() => this.waitPopStatus$.next(2)),
      )
      .subscribe();
  }

  /**
   * 获取预付
   *
   * @returns //
   */
  get getPrePayment(): number {
    if (!this.isValid) {
      return 0;
    }
    return Number(this.amount).divide(this.currentRateData?.rate || 1);
  }

  /**
   * 是否可以继续 存虚得法
   *
   * @returns //
   */
  get canSubmitCrypTo(): boolean {
    return !!this.selectedCurrency && !!this.selectedNetwork && !this.isClick;
  }

  /** 获取存虚得法的货币 */
  getCurrenciesToCrypTo() {
    this.loadingSelectedCurrency = true;
    this.depositApi.getCurrencies(2, 'Deposit', true).subscribe(data => {
      this.loadingSelectedCurrency = false;
      if (data?.length) {
        const defaultCurrency = data.find(item => item.currency === this.currentCurrency.currency);
        const usdt = data.find(item => item.currency === 'USDT');
        if (defaultCurrency) {
          // 优先展示 头部钱包货币
          this.selectedCurrency = defaultCurrency;
        } else if (usdt) {
          // 其次 默认显示USDT
          this.selectedCurrency = usdt;
        } else {
          // 没有就显示 返回的第一个货币
          this.selectedCurrency = data[0];
        }
        this.supportCurrencies = data;
      }
    });
  }

  /** 选择存虚得法的 货币 */
  onSelectCurrency() {
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
        if (result) {
          this.isMore = false;
          this.selectedNetwork = null;
          this.amount = null;
          this.currentRateData = null;
          this.isValid = false;
          this.selectedCurrency = result;
        }
      });
  }

  /** 选择网络 */
  handleSelectNetWork() {
    this.dialog.open(SelectNetworkDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        selectedCurrency: this.selectedCurrency,
        isDeposit: true,
        callback: (data: TokenNetworksFlatInterface) => {
          this.selectedNetwork = data;
          if (!this.isMore) this.handleNext();
        },
      },
    });
  }

  /** 获取汇率 */
  getFiatToVirtualRate() {
    this.rateLoading = true;
    this.depositApi.getFiatToVirtualRate(this.seletedDepositCurrencyItem.currency, 'Deposit').subscribe(data => {
      this.rateLoading = false;
      if (data) {
        this.currentRateData =
          (data as unknown as VirtualRate)?.rates?.find(rate => rate?.currency === this.selectedCurrency?.currency) ??
          null;
        this.rateData = data;
      }
    });
  }

  /** 重制虚拟得法的参数 */
  onResetCrypto() {
    this.selectedNetwork = null;
    this.selectedCurrency = null;
    this.isShowDepositToCrypto = false;
  }

  /** 提交 存虚得法 */
  submitFiatToCypto() {
    const params = {
      amount: this.amount,
      paymentCode: this.seletedDepositWay.code,
      currency: this.seletedDepositCurrencyItem.currency,
      paymentCurrency: this.selectedCurrency?.currency,
      network: this.selectedNetwork?.networkInfo.network,
      rateId: this.rateData?.rateId || null,
      actionType: this.seletedDepositWay.actionType,
      activityNo: this.seletedDividend?.bonusActivitiesNo || 'unknowtmpcode',
    };
    this.depositApi.submitToCurrency(params).subscribe(response => {
      this.submitLoading = false;
      this.processResult(response);
      if (!response?.success) {
        this.sentryService.error('DepositError', 'Crypto to Fiat Deposit Error', {
          extra: { params, response },
          level: 'warning',
        });
      }
    });
  }
}
