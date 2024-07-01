import { Component, OnInit } from '@angular/core';
import { SelectApi } from 'src/app/shared/api/select.api';
import { forkJoin, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ChannelSubFundsComponent } from 'src/app/pages/money/channel-sub-edit/channel-sub-view/channel-sub-funds.component';
import { OrderDetailComponent } from 'src/app/pages/money/components/order-detail/order-detail.component';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { FlowType, MainChannelSupportCurrency, PaymentMethod } from 'src/app/shared/interfaces/channel';
import moment from 'moment';
import { tap } from 'rxjs/operators';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectChildrenDirective } from 'src/app/shared/directive/select.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { ChannelSubCardComponent } from './channel-sub-card/channel-sub-card.component';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  templateUrl: './channel-sub-view.component.html',
  styleUrls: ['./channel-sub-view.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormRowComponent,
    NgIf,
    MatTabsModule,
    NgFor,
    ChannelSubCardComponent,
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    SelectChildrenDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ChannelSubViewComponent implements OnInit {
  constructor(
    public router: Router,
    private selectApi: SelectApi,
    private appService: AppService,
    private api: ChannelApi,
    private activatedRoute: ActivatedRoute,
    private modalService: MatModal,
    public lang: LangService,
    private ls: LocalStorageService
  ) {
    const { id } = activatedRoute.snapshot.params;
    this.id = id;
  }

  paymentList: PaymentMethod[] = []; // 币种标签
  channelsList: any[] = []; // 渠道列表（根据商户关联获取）联动关系
  supportPayList: any[] = []; // 币种支持支付方式列表
  payListSource: MainChannelSupportCurrency; // 币种支持支付方式列表_源数据
  currencies: any[] = []; // 币种列表
  flowType: FlowType[] = []; // 资金流水列表
  curTab = 0; // 当前tab索引
  id = ''; // 编辑所用id
  detail: any[] = []; // 币种详情数据
  pageSizes: number[] = [...PageSizes, 1e3]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;
  list: any[] = [];
  flowData = {
    time: [
      new Date(moment().set({ h: 0, m: 0, s: 0, ms: 0 }).subtract(1, 'd').valueOf()),
      new Date(moment().set({ h: 23, m: 59, s: 59, ms: 999 }).valueOf()),
    ],
  };

  data: any = {};
  EMPTY: any = {
    merchantId: null, // 商户下拉
    subChannelName: '', // 子渠道名
    channelId: '', // 主渠道下拉
    state: true, // 状态
    merchantAccountApiSettings: {}, // 渠道信息
  };

  /** getters */
  private _merchantList: any[] = [];
  get merchantList(): any[] {
    return this._merchantList;
  }

  set merchantList(v) {
    this.data.merchantId = null; // 联动关系 赋值进行清空
    this._merchantList = v;
  }

  get isEdit(): boolean {
    return !!this.id;
  }

  get isAdd(): boolean {
    return !this.id;
  }

  get currency() {
    return this.currencies.filter((e) => this.supportPayList.some((j) => j.currency === e.code));
  }

  get currencyValue() {
    return this.currency[this.curTab] || {};
  }

  get currentData() {
    return this.detail.find((e) => e.currency === this.currencyValue.code) || {};
  }

  get subInfo() {
    const data = this.data.merchantAccountApiSettings;
    return data
      ? JSON.stringify(data)
          .replace(/","/g, '",\n  "')
          .replace('":"', '": "')
          .replace('{"', '{\n  "')
          .replace('"}', '"\n}')
      : // ? Object.keys(data).map(e => `${e} : ${data[e]}`).join('\n') // 精简显示
        '';
  }

  get curSupport() {
    return this.supportPayList.find((e) => e.currency === this.currencyValue.code);
  }

  /**
   * 当前关联的主渠道
   */
  get curChannel() {
    return this.channelsList.find((e) => e.code === this.data.channelId) || {};
  }

  /**
   * 当前关联的主渠道名称
   */
  get channelName(): string {
    return this.curChannel?.name || '';
  }

  /** 已选的商户列表 */
  get curMerchantList() {
    return this.merchantList.filter((e) => this.data.merchantIds.includes(e.id));
  }

  /** 已选商户名 多个逗号拼接 */
  get merchantName(): string {
    return this.curMerchantList.map((e) => e.name).join('，');
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.loadForm();

    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.api.getAllChannels(),
      this.selectApi.goMoneyGetCurrencies(),
      this.selectApi.goMoneyGetMerchant(),
      this.selectApi.goMoneyGetPaymentMethods(),
      this.selectApi.goMoneyGetSubChannelFlowType(),
      this.isEdit ? this.api.getSubChannelConfig(this.id) : of(undefined),
    ]).subscribe(([channel, currencies, merchant, payment, flowType, detail]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.currencies = currencies;
      this.merchantList = merchant;
      this.paymentList = payment;
      this.flowType = flowType;
      this.channelsList = channel;

      this.loadDetail(detail);
    });
  }

  /** methods */
  loadDetail(detail: any): void {
    if (!detail || this.isAdd) return;
    this.detail = detail?.details || [];

    this.data.state = detail.isEnable;
    this.data.subChannelName = detail.channelName;
    this.data.merchantAccountApiSettings = detail.merchantAccountApiSettings;
    this.updateData(detail);
  }

  loadForm(): void {
    this.data = { ...this.EMPTY };
  }

  /** 编辑时更新数据 回显 */
  updateData(data: any): void {
    const { merchantIds, channelId, channelName } = data || {};

    this.data.channelId = channelId || '';
    this.data.subChannelName = channelName || '';

    channelId && this.onChannel();

    this.data.merchantIds = merchantIds || []; // 等上面请求清空完 这里再赋值回去
  }

  /** 渠道选择 */
  onChannel(): void {
    this.data.merchantIds = [];

    this.appService.isContentLoadingSubject.next(true);
    this.getPayMethods$().subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  /** 获取所支持的支付方式 */
  getPayMethods$() {
    return this.api.getChannelSupport(this.data.channelId).pipe(
      tap((payList) => {
        this.curTab = 0;
        this.payListSource = payList;
        this.setPayList();
        this.pullFlow();
      })
    );
  }

  setPayList(): void {
    this.supportPayList = this.countCurrency(this.payListSource);
  }

  countCurrency(data: any): any[] {
    if (!data) return [];

    return [
      ...new Set([
        ...Object.keys(data.supportedDepositPaymentMethods || {}),
        ...Object.keys(data.supportedWithdrawalPaymentMethods || {}),
      ]),
    ].map((key) => {
      // TODO 优化把那边封装成组件传递view进行查看显示
      let curData = this.detail.find((e) => e.currency === key);

      if (!curData) {
        curData = {
          isDigital: this.curChannel.category === 'Coin',
          balanceDetails: [],
        };
      }

      return {
        currency: key,
        deposit:
          data.supportedDepositPaymentMethods[key]?.map((method) => ({
            isDigital: curData.isDigital,
            ...this.getCurrencyData(method, 'Deposit'),
            ...curData?.balanceDetails.find((e) => e.paymentCategory === 'Deposit' && e.paymentMethod === method),
          })) || [],
        withdrawal:
          data.supportedWithdrawalPaymentMethods[key]?.map((method) => ({
            isDigital: curData.isDigital,
            ...this.getCurrencyData(method, 'Withdraw'),
            ...curData?.balanceDetails.find((e) => e.paymentCategory === 'Withdraw' && e.paymentMethod === method),
          })) || [],
      };
    });
  }

  getCurrencyData(code: string, category?: string): object | any {
    if (code === 'Overview') {
      return { name: this.lang.isLocal ? '总览' : 'Overview', paymentCategory: 'Deposit', paymentMethod: code };
    }

    return {
      name: this.paymentList.find((e) => e.code === code)?.name || '',
      paymentMethod: code,
      paymentCategory: category,
    };
  }

  back(): void {
    this.router.navigate(['/money/subChannel']);
  }

  // loading处理
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  async onView(item: any): Promise<void> {
    const modalRef = this.modalService.open(OrderDetailComponent);

    modalRef.componentInstance.id = item.orderRecordId || '';
    modalRef.componentInstance.merchantName = this.merchantName || '';
    modalRef.componentInstance.change.subscribe(() => this.pullFlow());
  }

  onExport() {
    if (!(+this.flowData.time[0] && +this.flowData.time[1])) {
      return this.appService.showToastSubject.next({
        msgLang: 'form.chooseTime',
      });
    }

    if ((this.flowData.time[1] as any) - (this.flowData.time[0] as any) >= 31 * 864e5) {
      return this.appService.showToastSubject.next({
        msgLang: 'payment.subChannel.gtTime31d',
      });
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .channelaccount_exportchannelaccountflow({
        channelAccountId: this.id,
        currency: this.currencyValue.code,
        startTime: toDateStamp(this.flowData.time[0], false) || 0,
        endTime: toDateStamp(this.flowData.time[1], true) || 0,
      })
      .subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }

  // 资金调整浮层
  async onFunds(): Promise<void> {
    const modal = this.modalService.open(ChannelSubFundsComponent, {
      width: '440px',
    });
    modal.componentInstance.formGroup.patchValue({ subChannel: this.id });

    (await modal.result) === true && this.pullFlow();
  }

  /** 币种改变 */
  onCurrency(i: number) {
    this.curTab = i;

    this.pullFlow();
  }

  /** 拉取流水 */
  pullFlow(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .subChannelFlow({
        channelAccountId: this.id,
        currency: this.currencyValue.code,
        pageIndex: this.paginator.page,
        pageSize: this.paginator.pageSize,
        startTime: toDateStamp(this.flowData.time[0], false) || 0,
        endTime: toDateStamp(this.flowData.time[1], true) || 0,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  getType(type: string): string {
    return this.flowType.find((e) => e.code === type)?.name || '-';
  }
}
