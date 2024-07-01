import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MoneyApi } from 'src/app/shared/api/money.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ActivatedRoute, Router } from '@angular/router';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { GoMoneyCurrency } from 'src/app/shared/interfaces/common.interface';
import { filter, Subject, zip } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CodeName } from 'src/app/shared/interfaces/base.interface';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { MerchantAdjustmentComponent } from 'src/app/pages/money/merchant-money/merchant-detail/merchant-adjustment.component';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { toUTCStamp } from 'src/app/shared/models/tools.model';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeUTCFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { StickyDirective } from 'src/app/shared/directive/sticky.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'merchant-detail',
  templateUrl: './merchant-detail.component.html',
  styleUrls: ['./merchant-detail.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgIf,
    StickyDirective,
    CurrencyIconDirective,
    AngularSvgIconModule,
    PaginatorComponent,
    AsyncPipe,
    CurrencyValuePipe,
    TimeUTCFormatPipe,
    LangPipe,
  ],
})
export class MerchantDetailComponent implements OnInit, OnDestroy {
  constructor(
    public appService: AppService,
    private api: MoneyApi,
    private selectApi: SelectApi,
    private channelApi: ChannelApi,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modal: MatModal,
    public breadcrumbsService: BreadcrumbsService
  ) {
    const { merchantId, currency, currentTime } = this.activatedRoute.snapshot.params;

    this.record.merchantId = merchantId;
    this.record.currency = currency;
    this.record.currentTime = currentTime;
    this.EMPTY_DATA.currency = currency;
    this.EMPTY_DATA.time = [
      moment(+currentTime || 0)
        .startOf('day')
        .toDate(),
      moment(+currentTime || 0)
        .startOf('day')
        .add(1, 'millisecond')
        .toDate(),
    ];

    this.data = cloneDeep(this.EMPTY_DATA);

    this.breadcrumbsService.isInit$
      .pipe(
        filter((e) => e),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.breadcrumbsService.setBefore([
          { name: '商户资金', link: '/money/merchant-money', lang: 'nav.merchantMoney' },
          {
            name: '商户资金查看',
            lang: 'breadCrumb.merchantMoney',
            click: () =>
              this.router.navigate(['/money/merchant-money/count', this.record.merchantId, this.record.currency], {
                queryParamsHandling: 'merge',
              }),
          },
        ]);
      });
  }

  destroy$ = new Subject<void>();
  record = { merchantId: '', currency: '', currentTime: '' };
  currencyList: GoMoneyCurrency[] = [];
  merchantList: { id: number; name: string }[] = [];
  subChannelList: CodeName[] = [];
  typeList: CodeName[] = [];
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];

  EMPTY_DATA = {
    subChannel: '',
    type: '',
    currency: '',
    merchantOrder: '',
    time: [new Date(), new Date()],
  };

  data = cloneDeep(this.EMPTY_DATA);

  /** getters */
  get curMerchant() {
    return this.merchantList.find((e) => e.id === +this.record.merchantId);
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.selectApi.goMoneyGetMerchant(),
      this.selectApi.goMoneyGetCurrencies(),
      this.api.option_getmerchantaccountflowchangetype(),
      this.channelApi.getChannelsByMerchant(+this.record.merchantId),
      this.loadData$()
    ).subscribe(([merchant, currency, flowType, subChannel]) => {
      this.appService.isContentLoadingSubject.next(false);
      this.merchantList = merchant;
      this.currencyList = currency;
      this.subChannelList = subChannel;
      this.typeList = flowType;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** methods */
  reset() {
    this.data = cloneDeep(this.EMPTY_DATA) as any;
    this.loadData(true);
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.loadData$().subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }

  loadData$() {
    return this.api.getMerchantFlow(this.getParams()).pipe(
      tap((res) => {
        this.list = res?.list || [];
        this.paginator.total = res.total;
      })
    );
  }

  /**
   * @description 转UTC时间戳
   * @param date
   * @param isEnd
   */
  toUTC(date: Date, isEnd = false) {
    const res = moment(date);

    if (isEnd) {
      res.add(1, 'day').startOf('day');
    }

    return res.utc(true).utcOffset(0).valueOf();
  }

  /** 获取请求参数 */
  getParams() {
    let params: any = {
      MerchantId: this.record.merchantId,
      Currency: this.data.currency,
      StartTime: toUTCStamp(this.data.time?.[0]),
      EndTime: toUTCStamp(this.data.time?.[1], true),
      ChangeType: this.data.type,
      ChannelAccountId: this.data.subChannel,
      MerchantOrderId: this.data.merchantOrder,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };

    params.MerchantId = params.MerchantId || undefined;
    params.Currency = params.Currency || undefined;
    params.ChangeType = params.ChangeType || undefined;
    params.ChannelAccountId = params.ChannelAccountId || undefined;

    return params;
  }

  /** 获取类型 */
  getType(item) {
    return this.typeList.find((e) => e.code === item.changeType)?.name || '-';
  }

  /** 导出 */
  onExport() {
    if (!this.list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .merchantaccount_exportaccountflow(this.getParams())
      .subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }

  /** 商户资金调整 */
  async onAdjustment() {
    const modal = this.modal.open(MerchantAdjustmentComponent, { width: '540px' });
    modal.componentInstance.setData({ ...this.record, currency: this.data.currency });
    if ((await modal.result) !== true) return;

    this.loadData(true);
  }
}
