import { Component, OnInit } from '@angular/core';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { ActivatedRoute } from '@angular/router';
import { SelectApi } from 'src/app/shared/api/select.api';
import { zip } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { getRangeTime, toDateStamp } from 'src/app/shared/models/tools.model';
import { ChannelAssignLog, PaymentMethod } from 'src/app/shared/interfaces/channel';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OrderLabelComponent } from '../components/order-label.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyAutoDirective } from 'src/app/shared/directive/sticky-auto.directive';
import moment from 'moment/moment';
import { cloneDeep } from 'lodash';
import { PaymentTypeEnum } from 'src/app/shared/interfaces/transaction';
import { finalize } from 'rxjs/operators';

@Component({
  templateUrl: './channel-log.component.html',
  styleUrls: ['./channel-log.component.scss'],
  standalone: true,
  imports: [
    StickyAutoDirective,
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    LabelComponent,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    OrderLabelComponent,
    AngularSvgIconModule,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ChannelLogComponent implements OnInit {
  constructor(
    private api: ChannelApi,
    private selectApi: SelectApi,
    private activatedRoute: ActivatedRoute,
    private appService: AppService
  ) {
    this.id = activatedRoute.snapshot.params['id'];
  }

  protected readonly PaymentTypeEnum = PaymentTypeEnum;
  id = '';
  list: ChannelAssignLog[] = [];
  statusList: any[] = [];
  currenciesList: any[] = [];
  paymentMethodList: PaymentMethod[] = [];
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  defaultData = {
    uid: '',
    category: '' as PaymentTypeEnum,
    currency: '',
    paymentMethod: '',
    status: '',
    time: getRangeTime(-2, 'days', false).map((e) => new Date(e)),
  };

  data: any = cloneDeep(this.defaultData);
  isLoading = false;

  ngOnInit(): void {
    this.onReset();
    this.loading(true);
    zip(
      this.selectApi.goMoneyGetCurrencies(true),
      this.selectApi.goMoneyGetPaymentMethods(true),
      this.api.getChannelStatus(true)
    ).subscribe(([currencies, paymentMethods, status]) => {
      this.loading(false);
      this.currenciesList = currencies;
      this.paymentMethodList = paymentMethods;
      this.statusList = status;
    });
  }

  onReset(): void {
    this.data = cloneDeep(this.defaultData);
    this.loadData(true);
  }

  // 获取数据
  loadData(resetPage = false) {
    if (!this.validTime()) return;

    resetPage && (this.paginator.page = 1);

    this.loading(true);
    this.api.getChannelLog(this.getParams()).subscribe((res) => {
      this.loading(false);
      this.list = res?.list || [];
      this.paginator.total = res?.total || 0;
    });
  }

  validTime() {
    const maxDay = 31;

    const check = () => {
      // 没有时间范围
      if (!(this.data.time?.[0] && this.data.time?.[1])) return false;
      const start = toDateStamp(this.data.time[0], false);
      const end = toDateStamp(this.data.time[1], true);
      return Math.abs(moment(start).diff(end, 'days')) <= maxDay;
    };

    const checkResult = check();
    if (!checkResult) {
      this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });
    }

    return checkResult;
  }

  loading(v: boolean) {
    // 数据量大时，会导致页面卡顿，所以加上Promise.resolve().then(() => { ... })，让其异步执行
    Promise.resolve().then(() => {
      this.isLoading = v;
      this.appService.isContentLoadingSubject.next(v);
    });
  }

  getPayMethodName(code: string): string {
    return this.paymentMethodList.find((e) => e.code === code)?.name || '';
  }

  /**
   * 获取参数
   */
  getParams() {
    return {
      merchantUserAccount: this.data.uid,
      channelAccountId: this.id,
      currency: this.data.currency,
      category: this.data.category,
      status: this.data.status,
      paymentMethod: this.data.paymentMethod,
      startTime: toDateStamp(this.data.time[0]),
      endTime: toDateStamp(this.data.time[1], true),
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
  }

  /**
   * 导出
   * @param isAll
   */
  isDownloading = false;
  onExport(isAll = false) {
    if (this.isDownloading || (isAll && !this.validTime())) return;
    this.isDownloading = true;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .exportChannelAllocatedLog({ ...this.getParams(), isAll: +isAll })
      .pipe(
        finalize(() => {
          this.isDownloading = false;
          this.appService.isContentLoadingSubject.next(false);
        })
      )
      .subscribe();
  }
}
