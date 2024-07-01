import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  WritableSignal,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import _PaymentIQCashier, { CashierConfig, IPiqCashierApiMethods } from 'paymentiq-cashier-bootstrapper';
import { combineLatest, filter, mergeMap, of, take, timer } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { CardCenterService } from 'src/app/pages/card-center/card-center.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { BonusList } from 'src/app/shared/interfaces/bonus.interface';
import { Quotalimit } from 'src/app/shared/interfaces/withdraw.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { environment } from 'src/environments/environment';
import { SelectDepositBonusService } from '../select-deposit-bonus.service';
import { SelectDividendDialogComponent } from '../select-dividend-dialog/select-dividend-dialog.component';
import { PaymentIqService } from './payment-iq.service';

@UntilDestroy()
@Component({
  selector: 'app-payment-iq',
  templateUrl: './payment-iq.component.html',
  styleUrls: ['./payment-iq.component.scss'],
})
export class PaymentIqComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private appService: AppService,
    private localeStorage: LocalStorageService,
    private router: Router,
    private piqService: PaymentIqService,
    private popupService: PopupService,
    private localeService: LocaleService,
    private bonusApi: BonusApi,
    private cardCenterService: CardCenterService,
    private selectDepositBonusService: SelectDepositBonusService,
    private dialog: MatDialog,
  ) {}

  loading: boolean = true;

  configCashier!: CashierConfig;

  paymentIQ?: _PaymentIQCashier;

  theme!: boolean;

  /** 用户id值 */
  uid!: string;

  /** 显示 提款限额 */
  isShowCoinLimit: boolean = false;

  /** 存款或者取款*/
  @Input() method!: 'deposit' | 'withdrawal';

  /** 用户选择的币种 */
  @Input() selectedCurrency!: string;

  /** 成功或失败获取历史记录 */
  @Output() getHistory = new EventEmitter();

  /** 提款限额 */
  @Input() paymentIqCoinLimit?: Quotalimit;

  /** 红利loading */
  bonusLoading: boolean = false;

  /** 红利数据 */
  bonuslist: BonusList[] = [];

  /** 选择的红利 */
  seletedDividend: WritableSignal<BonusList | null> = signal(null);
  /** 交易完成后 不展示 红利弹窗 */
  isHiddenBonusPopup: boolean = false;

  /** 返回首页按钮 */
  isShowHomeBtn: boolean = false;

  /** 线上环境关闭新功能 */
  get isOnline(): boolean {
    return environment.isOnline;
  }

  ngOnInit() {
    this.appService.userInfo$
      .pipe(
        filter(v => !!v),
        untilDestroyed(this),
        mergeMap(userInfo => {
          if (userInfo && !userInfo?.isEurope) {
            this.popupService.open(StandardPopupComponent, {
              speed: 'faster',
              data: {
                type: 'warn',
                content: this.localeService.getValue('not_ava'),
                description: this.localeService.getValue('kyc_error01'),
                buttons: [{ text: this.localeService.getValue('online_cs'), primary: true }],
                callback: () => {
                  this.loading = false;
                  this.isHiddenBonusPopup = true;
                  this.appService.toOnLineService$.next(true);
                },
              },
            });
            return of(null);
          }

          if (userInfo) {
            this.uid = userInfo?.uid || '';
          }

          return this.appService.themeSwitch$;
        }),
      )
      .subscribe(themeSwitch => {
        if (themeSwitch !== null) {
          this.theme = themeSwitch === 'sun' ? true : false;
          this.checkBonus();
        }
      });
  }

  /** 红利接口 */
  checkBonus() {
    this.bonusLoading = true;
    combineLatest([
      this.selectDepositBonusService.getTopUpBonus(this.selectedCurrency),
      this.appService.currentCurrency$.pipe(
        untilDestroyed(this),
        filter(v => !!v),
        take(1),
      ),
    ]).subscribe(([data, currency]) => {
      if (data) {
        this.onBootWindow();
        this.bonuslist = data;
        if (this.cardCenterService.onNoneStickyWithBonus(this.bonuslist)) {
          this.seletedDividend.set(this.cardCenterService.onNoneStickyWithBonus(this.bonuslist));
          this.bonusCallback(this.cardCenterService.onNoneStickyWithBonus(this.bonuslist));
        } else {
          if (currency?.currency !== this.selectedCurrency && this.selectDepositBonusService.isCouponCodeWay) {
            this.piqService.seletedDividend.set(null);
            this.seletedDividend.set(this.piqService.seletedDividend());
            this.bonusCallback(this.piqService.seletedDividend());
          } else {
            if (this.piqService.seletedDividend()) {
              this.seletedDividend.set(this.piqService.seletedDividend());
              this.bonusCallback(this.piqService.seletedDividend());
            } else if (data?.length > 0) {
              this.bonuslist[0].isActive = true;
              this.seletedDividend.set(this.bonuslist[0]);
              this.bonusCallback(this.bonuslist[0]);
            }
          }
        }
      }
      this.bonusLoading = false;
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
      .onPiqActivityNo({
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

  /** 红利弹出框 */
  openDividendOptions() {
    this.piqService.selectDepositMethod.set('fiat');
    this.dialog.open(SelectDividendDialogComponent, {
      panelClass: 'dividend-dialog-container',
      data: {
        callback: this.bonusCallback.bind(this),
        bonusList: this.bonuslist,
        seletedDividend: this.seletedDividend(),
        isPiq: true,
        couponCodeParams: {
          currency: this.selectedCurrency || '',
          amount: 0,
        },
      },
    });
  }

  /**
   * 监听币种切换
   *
   * @param changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    const { selectedCurrency } = changes;
    if (selectedCurrency) {
      const { previousValue, currentValue } = selectedCurrency;
      if (previousValue && currentValue !== previousValue) {
        this.checkBonus();
      }
    }
  }

  onBootWindow() {
    this.onClearCashier()
      .pipe(untilDestroyed(this))
      .subscribe(_ => {
        this.onConfigCashier();
      });
  }

  /** 收银台页面配置 */
  onConfigCashier() {
    this.configCashier = {
      defaultLoader: false,
      customLogoFileName: '',
      merchantId: this.isOnline ? '100479005' : '100479998',
      userId: this.uid,
      sessionId:
        this.localeStorage.token && this.selectedCurrency ? `${this.localeStorage.token}_${this.selectedCurrency}` : '',
      environment: this.isOnline ? 'production' : 'test',
      method: this.method || '',
      gtm: '',
      locale: 'en',
      allowMobilePopup: 'true',
      containerWidth: '100%',
      containerMinHeight: '400px',
      accountDelete: 'true',
      allowCancelPendingWithdrawal: 'false',
      amountFirst: 'false',
      autoOpenFirstPaymentMethod: 'true',
      autoProcess: 'false',
      displayLogoOrName: 'both',
      globalSubmit: 'true',
      layout: 'vertical',
      listRadio: 'false',
      listType: 'list',
      logoFullWidth: 'true',
      logoSize: 120,
      mode: 'gambling',
      predefinedAmounts: [30, 50, 100, 200],
      predefinedValues: 'true',
      receiptAmountDisplayStyle: 'symbol',
      receiptAmountTransactionStyle: 'TxAmount',
      receiptExcludeKeys: [],
      showReceipt: true,
      scrollToOffset: 0,
      scrollToPm: 'nearest',
      showCookiesWarning: 'false',
      selectlastusedtxmethod: 'false',
      showAccounts: 'list-first',
      showAmountLimits: 'true',
      showBonusCode: 'false',
      showFee: 'true',
      showFooter: 'false',
      showHeader: 'false',
      showListHeaders: 'true',
      showTermsConditions: 'false',
      showTransactionOverview: 'true',
      singlePageFlow: 'true',
      storeAccount: 'true',
      tabs: 'false',
      theme: {
        input: {
          height: '46px',
          color: this.theme ? '#1e2329' : '#b1bad3',
        },
        inputbackground: {
          color: this.theme ? '#fff' : '#0f212e',
        },
        labels: {
          color: this.theme ? '#1e2329' : '#b1bad3',
        },
        loader: {
          color: 'transparent',
        },
        buttons: {
          color: '#fb6943',
        },
        cashierbackground: {
          color: this.theme ? '' : '#0f212e',
        },
        headings: {
          color: this.theme ? '#1e2329' : '#b1bad3',
        },
      },
    };
    this.onCreateCashier();
  }

  /** 创建payment 界面 */
  onCreateCashier() {
    this.loading = true;
    this.paymentIQ = new _PaymentIQCashier('#cashier', this.configCashier, (api: IPiqCashierApiMethods) => {
      api.on({
        cashierInitLoad: () => console.log('Cashier init load'),
        update: data => console.log('The passed in data was set', data),
        success: data => {
          if (data?.data?.payload.success) {
            this.isHiddenBonusPopup = true;
            this.isShowHomeBtn = true;
            this.getHistory.emit(data);
          }
          console.log('Transaction was completed successfully', data);
        },
        failure: data => {
          if (!data?.data.success) {
            this.getHistory.emit(data);
          }
          console.log('Transaction failed', data);
        },
        pending: data => console.log('Transaction is pending', data),
        unresolved: data => console.log('Transaction is unresolved', data),
        isLoading: data => console.log('Data is loading', data),
        doneLoading: data => {
          this.loading = false;
          if (this.method === 'withdrawal') {
            this.isShowCoinLimit = true;
          }
          console.log('Data has been successfully downloaded', data);
        },
        newProviderWindow: data => console.log('A new window / iframe has opened', data),
        paymentMethodSelect: data => console.log('Payment method was selected', data),
        paymentMethodPageEntered: data => console.log('New payment method page was opened', data),
        navigate: data => console.log('Path navigation triggered', data),
        cancelledPendingWD: data => console.log('A pending withdrawal has been cancelled', data),
        validationFailed: data => {
          console.log('Transaction attempt failed at validation', data);
        },
        cancelled: data => console.log('Transaction has been cancelled by user', data),
        onLoadError: data => {
          this.isHiddenBonusPopup = true;
          console.log('Cashier could not load properly', data);
        },
        transactionInit: data => console.log('A new transaction has been initiated', data),
      });

      api.css(`
          .overflow-auto{
            overflow:unset !important;
          }
          .route-container{
            overflow:hidden;
          }
          .dropdown-container{
            border: 1px solid ${this.theme ? '#eaecef' : '#2f4553 '} !important;
          }
          .seperator-line{
            background: ${this.theme ? '#eaecef' : '#2f4553 '} !important;
          }
          .input-wrapper{
            input{
              border: 1px solid ${this.theme ? '#eaecef' : '#2f4553 '} !important;
            }
          }
          .dropdown-content .dropdown-item.selected{
            background: ${this.theme ? '#f9f9fa ' : '#2f4553'}  !important;
          }
          .dropdown-content .dropdown-item.selected, .dropdown-content .dropdown-item:hover{
            background: ${this.theme ? '#f9f9fa ' : '#2f4553'} !important;
          }
          .set-amount .input-container  .input-wrapper input{
            border: 1px solid ${this.theme ? '#eaecef' : '#2f4553 '} !important;
          }
          #hosted-field-single-iframe .hosted-input-container .input-container input{
            border-color:  ${this.theme ? '#eaecef' : '#2f4553 '} !important;
          }
          .submit-button-container .transaction-overview{
            border-top: 1px solid ${this.theme ? '#eaecef' : '#2f4553 '} !important;
            border-bottom: 1px solid ${this.theme ? '#eaecef' : '#2f4553 '} !important;
          }
          .input, #frmCCNum, #bankBic{ 
            border: 1px solid ${this.theme ? '#eaecef' : '#2f4553 '} !important;
          }
          .credit-card-inputs-wrapper .inputs-container .creditCardField .creditCardField{
            border-color:  ${this.theme ? '#eaecef' : '#2f4553 '} !important;
          }
          .single-page-flow-container{
            padding:0 !important;
          }
          .payment-method-details{
            padding:var(--main-container-top-down) 0 !important;
          }
          .seperator-middle{
            color:${this.theme ? '#1e2329' : '#b1bad3'} !important;
          }
          .main-container h3 h4{
            color:${this.theme ? '#1e2329' : '#b1bad3'} !important;
          }
          .status-label{
            color:${this.theme ? '#1e2329' : '#b1bad3'} !important;
          }
          .receipt .details-container .success-message{
            border-bottom: 1px solid ${this.theme ? '#eaecef' : '#2f4553 '} !important;
          }

          #cashier h1 h2 h3 h4 h5 h6{
            color:${this.theme ? '#1e2329' : '#fff'} !important;
          }
        `);
    });
  }

  /** 切换主题时候清理界面*/
  @ViewChild('cashier') cashierElement!: ElementRef<any>;
  onClearCashier() {
    if (this.cashierElement) {
      this.cashierElement.nativeElement.innerHTML = '';
      this.paymentIQ = undefined;
    }
    return timer(200);
  }

  /**
   * 返回首页
   *
   *  @param route 路由
   */
  toHome() {
    this.router.navigateByUrl(`${this.appService.languageCode}`);
  }

  ngOnDestroy(): void {
    this.selectDepositBonusService.isCouponCodeWay = false;
  }
}
