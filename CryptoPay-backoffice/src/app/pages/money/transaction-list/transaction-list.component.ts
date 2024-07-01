import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { filter, forkJoin, lastValueFrom, Subject, take } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { OrderDetailComponent } from 'src/app/pages/money/components/order-detail/order-detail.component';
import { ChannelSubFundsComponent } from 'src/app/pages/money/channel-sub-edit/channel-sub-view/channel-sub-funds.component';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Adjustment, PaymentMethod } from 'src/app/shared/interfaces/channel';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { JSONToExcelDownload, toDateStamp, toFormatMoney } from 'src/app/shared/models/tools.model';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep, orderBy } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import moment from 'moment';
import { TransactionStatusService } from 'src/app/pages/money/transaction-list/state-label/transaction-status.service';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PaymentTypeEnum, TransactionItem } from 'src/app/shared/interfaces/transaction';
import { ExchangeService } from 'src/app/shared/service/exchange.service';
import { ReplenishmentComponent } from 'src/app/pages/money/transaction-list/replenishment/replenishment.component';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { RepairOrderStatusComponent } from 'src/app/pages/money/transaction-list/repair-order-status/repair-order-status.component';
import { GoMoneyMerchant } from 'src/app/shared/interfaces/select.interface';
import { OrderState } from 'src/app/shared/interfaces/agent';
import { LayoutService } from 'src/app/_metronic/core';
import { ReduceExchangeTotalPipe } from 'src/app/shared/service/exchange.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe as TimeFormatPipe_1 } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { StateLabelComponent } from './state-label/state-label.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { SelectChildrenDirective } from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  providers: [TimeFormatPipe],
  standalone: true,
  imports: [
    StickyAutoDirective,
    FormRowComponent,
    FormsModule,
    InputTrimDirective,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    SearchDirective,
    SearchInpDirective,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    SelectChildrenDirective,
    CurrencyIconDirective,
    StateLabelComponent,
    PaginatorComponent,
    AsyncPipe,
    TimeFormatPipe_1,
    CurrencyValuePipe,
    LangPipe,
    ReduceExchangeTotalPipe,
  ],
})
export class TransactionListComponent implements OnInit, OnDestroy {
  constructor(
    private selectApi: SelectApi,
    private route: ActivatedRoute,
    private api: ChannelApi,
    public appService: AppService,
    private modalService: MatModal,
    public lang: LangService,
    private stateService: TransactionStatusService,
    private timeFormatPipe: TimeFormatPipe,
    public ls: LocalStorageService,
    private exchangeService: ExchangeService,
    private currencyService: CurrencyService,
    public layout: LayoutService,
    private subHeaderService: SubHeaderService
  ) {}

  protected readonly _destroy = new Subject<void>();

  pageSizes: number[] = PageSizes;
  paginator: PaginatorState = new PaginatorState(1, 100); // 分页

  isLoading = false; // 是否处于加载

  merchantsList: GoMoneyMerchant[] = []; // 所有商户
  channelList: any[] = []; // 渠道
  paymentMethodList: PaymentMethod[] = []; // 所有汇款方式
  currenciesList: any[] = []; // 所有货币
  categoryList = [
    { name: '全部', value: '', lang: 'common.all' },
    { name: '存款', value: PaymentTypeEnum.Deposit, lang: 'payment.method.deposit' },
    { name: '提款', value: PaymentTypeEnum.Withdraw, lang: 'payment.method.withdrawal' },
    { name: '调账', value: PaymentTypeEnum.Adjustment, lang: 'payment.transactionList.reconciliation' },
    { name: '换汇', value: PaymentTypeEnum.CurrencyExchange, lang: 'budget.asset' },
  ]; // 种类列表

  orderStatusList: OrderState[] = []; // 状态列表

  list: TransactionItem[] = [];
  data = {
    merchantCode: 0,
    provider: '',
    paymentMethod: '',
    currency: '',
    currencyCategory: 'Unknown',
    category: '',
    channel: '',
    status: '',
    order: '',
    userId: '',
    adjustmentType: '',
    time: [moment().subtract(3, 'day').add(1, 'days').toDate(), new Date()],
  };

  EMPTY_DATA = cloneDeep(this.data);

  adjustmentList: Adjustment[] = [];
  stateSort = '';

  /** getters */
  get filterList() {
    return this.data.status === 'Allocating' ? this.stateSortList : this.list;
  }

  /** 存款列表 */
  get depositList() {
    return this.list.filter((e) => e.paymentCategory === 'Deposit');
  }

  /** 提款列表 */
  get withdrawList() {
    return this.list.filter((e) => e.paymentCategory === 'Withdraw');
  }

  /** 状态排序列表 */
  get stateSortList() {
    if (this.stateSort) {
      return orderBy(this.list, ['waitCount'], [this.stateSort as any]);
    }

    return this.list;
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.route.queryParams.pipe().subscribe((v: any) => {
      this.data.userId = v.uid;
    });
    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.api.getChannelsByMerchant(),
      this.selectApi.goMoneyGetCurrencies(true),
      this.selectApi.goMoneyGetMerchant(true),
      this.selectApi.goMoneyGetPaymentMethods(true),
      this.selectApi.goMoneyGetAdjustmentList(true),
      this.api.getOrderStatus(true),
    ]).subscribe(([channel, currencies, merchants, paymentMethods, adjustment, orderStatus]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.channelList = channel;
      this.currenciesList = currencies;
      this.merchantsList = merchants;
      this.paymentMethodList = paymentMethods;
      this.adjustmentList = adjustment;
      this.orderStatusList = orderStatus;

      this.subHeaderService.region$
        .pipe(
          tap(() => this.appService.isContentLoadingSubject.next(true)),
          switchMap(() => this.getList()),
          finalize(() => this.appService.isContentLoadingSubject.next(false)),
          takeUntil(this._destroy)
        )
        .subscribe();
    });
  }

  ngOnDestroy(): void {
    this._destroy.next();
    this._destroy.complete();
  }

  /** 获取数据 */
  getList() {
    return forkJoin([
      this.api.getChannelTradeList(this.getListParams()),
      this.exchangeService.flushExchange$(), // 保持汇率最新
    ]).pipe(
      tap(([res]) => {
        this.loading(false);
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      })
    );
  }

  /** 获取列表请求参数 */
  getListParams() {
    return {
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
      MerchantOrderIds: this.data.order,
      MerchantUserAccounts: this.data.userId,
      MerchantIds: this.data.merchantCode || undefined,
      Methods: this.data.paymentMethod,
      Currencies: this.data.currency,
      CurrencyCategory: this.data.currencyCategory,
      // 改动：暂时没有了
      // Providers: this.data.provider,
      ChannelAccountIds: this.data.channel,
      Category: this.data.category.length > 0 ? this.data.category : 'Undefined',
      Status: this.data.status,
      paymentCategoryReason: this.data.adjustmentType || 'Undefined',
      startTime: toDateStamp(this.data.time[0], false) || 0,
      endTime: toDateStamp(this.data.time[1], true) || 0,
      Region: this.subHeaderService.regionCurrent || undefined,
    };
  }

  // 获取数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.getList().subscribe();
  }

  // 重置
  onReset(): void {
    this.data = cloneDeep(this.EMPTY_DATA);

    this.channelList = [];
    this.stateSort = '';
    this.onMerchant({} as any);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  async toTransRecord(item: any) {
    const modalRef = this.modalService.open(OrderDetailComponent);

    modalRef.componentInstance.id = item.id || '';
    modalRef.componentInstance.merchantName = item.merchantName || '';
    modalRef.componentInstance.change.subscribe(() => this.getList().subscribe());
  }

  // 资金调整浮层
  async onFunds(): Promise<void> {
    const modal = this.modalService.open(ChannelSubFundsComponent, {
      width: '440px',
    });

    (await modal.result) === true && this.loadData();
  }

  // 商户变动
  onMerchant(matSel: MatSelectChange): any {
    this.data.channel = '';

    this.loading(true);
    this.api.getChannelsByMerchant(matSel.value).subscribe((res) => {
      this.loading(false);
      this.channelList = res;
      this.loadData(true);
    });
  }

  /** 排序 */
  switchSort() {
    const temp = ['', 'asc', 'desc']; // asc:升序 desc:降序
    const next = (temp.indexOf(this.stateSort as string) + 1) % temp.length;
    this.stateSort = temp[next];
  }

  /** 状态变动 */
  onState() {
    this.stateSort = '';
    this.loadData(true);
  }

  async onExport(isAll = false) {
    if (isAll) {
      return lastValueFrom(this.api.exportOrderRecord(this.getListParams()));
    }

    const merchant = await this.lang.getOne('payment.transactionList.merchantEName'); // 商户名
    const merchantOrder = await this.lang.getOne('payment.transactionList.merchantOrder'); // 商户订单号
    const subChannel = await this.lang.getOne('payment.transactionList.subChannel'); // 子渠道名
    const type = await this.lang.getOne('common.type'); // 类型
    const applicationTime = await this.lang.getOne('payment.transactionList.applicationPeriod'); // 申请时间
    const processTime = await this.lang.getOne('payment.transactionList.processTime'); // 处理时间
    const reason = await this.lang.getOne('payment.transactionList.reason'); // 调账原因
    // const channelOrderNumber = await this.lang.getOne('payment.transactionList.channelOrderNumber'); // 渠道订单号
    const orderNumber = await this.lang.getOne('payment.transactionList.orderNumber'); // 平台订单号
    const paymentMethod = await this.lang.getOne('payment.paymentMethod.paymentMethod'); // 支付方式
    // const currency = await this.lang.getOne('payment.currency.currency'); // 币种
    const fromAmountCurrency = await this.lang.getOne('payment.transactionList.fromAmountCurrency'); // 申请金额币种
    const toAmountCurrency = await this.lang.getOne('payment.transactionList.toAmountCurrency'); // 到账金额币种
    const applicationAmount = await this.lang.getOne('payment.transactionList.applicationAmount'); // 申请金额
    const amountReceived = await this.lang.getOne('payment.transactionList.amountReceived'); // 到账金额
    const txHash = await this.lang.getOne('payment.transactionList.txHash');
    const depositRate = await this.lang.getOne('payment.transactionList.depositRate'); // 存款费率
    const exchangeRates = await this.lang.getOne('payment.transactionList.exchangeRates'); // 汇率
    const channelFee = await this.lang.getOne('payment.transactionList.channelFee'); // 渠道手续费
    const channelBalance = await this.lang.getOne('payment.transactionList.channelBalance'); // 渠道余额
    const merchantFee = await this.lang.getOne('payment.transactionList.merchantFee'); // 商户手续费
    const fee = await this.lang.getOne('payment.transactionList.fee'); // 手续费
    const merchantBalance = await this.lang.getOne('payment.transactionList.merchantBalance'); // 商户余额
    const status = await this.lang.getOne('common.status'); // 状态
    const remark = await this.lang.getOne('common.remarks'); // 备注

    const process = async (e: TransactionItem) => ({
      [merchant]: e.merchantName || '-', // 商户名
      ...(this.ls.isGB ? { [subChannel]: e.merchantChannelName ? e.merchantChannelName : '-' } : {}), // 子渠道名
      [type]: await this.lang.getOne(this.categoryList.find((j) => j.value === e.paymentCategory)?.lang!, {
        $defaultValue: '-',
      }), // 类型
      ...(this.ls.isGB
        ? {
            [reason]: this.adjustmentList.find((j) => j.code === e.paymentCategoryReason)?.name || '-',
          }
        : {}), // 调账原因
      [applicationTime]: this.timeFormatPipe.transform(e.applicationTime), // 申请时间
      [processTime]: this.timeFormatPipe.transform(e.completeTime), // 处理时间
      // ...(this.ls.isGB ? { [channelOrderNumber]: e.channelOrderId || '-' } : {}), // 渠道订单号
      [orderNumber]: e.orderId || '-', // 平台订单号
      [merchantOrder]: e.merchantOrderId || '-', // 商户订单号
      UID: e.merchantUserAccount, // 用户ID
      [paymentMethod]: e.paymentMethod, // 支付方式
      // [currency]: e.currency, // 币种
      [applicationAmount]: toFormatMoney(e.transactedAmount, { maximumDecimalPlaces: e.isDigital ? 8 : 2 }), // 申请金额
      [fromAmountCurrency]: e.transactedAmountCurrency, // 申请金额币种
      [exchangeRates]: e.exchangeRate || '', // 汇率
      [amountReceived]: toFormatMoney(e.receivedAmount, { maximumDecimalPlaces: e.isDigital ? 8 : 2 }), // 到账金额
      [toAmountCurrency]: e.receiveAmountCurrency, // 到账金额币种
      [txHash]: e.digitalInfo?.txHash || '', // 交易哈希
      [depositRate]: e.depositRate, // 存款费率
      ...(this.ls.isGB
        ? { [channelFee]: toFormatMoney(e.channelFee, { maximumDecimalPlaces: e.isDigital ? 8 : 2 }) }
        : {}), // 渠道手续费
      ...(this.ls.isGB
        ? { [channelBalance]: toFormatMoney(e.accountBalance, { maximumDecimalPlaces: e.isDigital ? 8 : 2 }) }
        : {}), // 渠道余额
      [this.ls.isGB ? merchantFee : fee]: toFormatMoney(e.merchantFee, { maximumDecimalPlaces: e.isDigital ? 8 : 2 }), // 商户手续费/手续费
      [merchantBalance]: toFormatMoney(e.merchantBalance, { maximumDecimalPlaces: e.isDigital ? 8 : 2 }), // 商户余额
      [status]: await this.stateService.getStateText(e), // 状态
      ...(this.ls.isGB ? { [remark]: e.remark || '---' } : {}), // 状态
    });

    const exportList = await Promise.all(this.list.map(process));
    JSONToExcelDownload(exportList, 'transaction-list ' + Date.now());
  }

  /**
   * 数字货币补单
   */
  onReplenishment() {
    const ref = this.modalService.open(ReplenishmentComponent, { width: '600px' });
    ref.componentInstance.merchantList = this.merchantsList.filter((e) => e.id);

    this.currencyService.list$
      .pipe(
        filter((e) => !!e?.length),
        take(1)
      )
      .subscribe((currencyList) => {
        ref.componentInstance.currencyList = currencyList.filter((e) => e.code && e.isDigital);
      });
  }

  /**
   * 修复数字货币提款订单状态
   */
  async onRepairVirtualStatus() {
    const ref = this.modalService.open(RepairOrderStatusComponent, { width: '500px' });
    ref.componentInstance.merchantList = cloneDeep(this.merchantsList).filter((e) => e.id);

    if ((await ref.result) !== true) return;
    this.loadData();
  }
}
