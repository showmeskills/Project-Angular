import { Component, OnInit } from '@angular/core';
import { cloneDeep } from 'lodash';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import moment from 'moment';
import { DestroyService, toDateStamp, toUTCStamp } from 'src/app/shared/models/tools.model';
import { ExchangeApi } from 'src/app/shared/api/exchange.api';
import { tap } from 'rxjs/operators';
import { ExchangeRecordItem, ExchangeRecordTotal } from 'src/app/shared/interfaces/merchants-interface';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { SubHeaderPipe } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ReduceTotalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeUTCFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { StickyDirective } from 'src/app/shared/directive/sticky.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'exchange-record',
  templateUrl: './exchange-record.component.html',
  styleUrls: ['./exchange-record.component.scss'],
  providers: [DestroyService],
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
    StickyDirective,
    NgIf,
    CurrencyIconDirective,
    EmptyComponent,
    PaginatorComponent,
    AsyncPipe,
    CurrencyValuePipe,
    TimeUTCFormatPipe,
    ReduceTotalPipe,
    LangPipe,
    SubHeaderPipe,
  ],
})
export class ExchangeRecordComponent implements OnInit {
  constructor(
    public modal: MatModal,
    public appService: AppService,
    public subHeaderService: SubHeaderService,
    public lang: LangService,
    private api: ExchangeApi,
    private selectApi: SelectApi,
    private _destroy$: DestroyService
  ) {
    subHeaderService.loadMerchant(true);
  }

  EMP_DATA = {
    merchant: '', // 商户
    uid: '', // 用户ID
    orderNum: '', // 订单号
    time: [new Date(toDateStamp(moment().subtract(5, 'days').toDate())!), new Date(toDateStamp(new Date(), true)!)], // 时间
  };

  sum?: ExchangeRecordTotal; // 总计
  data = cloneDeep(this.EMP_DATA);
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: ExchangeRecordItem[] = [];

  ngOnInit(): void {
    this.onReset();
  }

  /**
   * 加载数据
   * @param resetPage
   */
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$().subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });
  }

  /**
   * 加载数据流
   */
  loadData$() {
    return this.api
      .getExchangeRecordList({
        merchantUserAccount: this.data.uid,
        merchantOrderId: this.data.orderNum,
        merchantId: this.data.merchant || undefined,
        startTime: toUTCStamp(this.data.time[0])!,
        endTime: toUTCStamp(this.data.time[1], true)!,
        pageIndex: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .pipe(
        tap((res) => {
          this.sum = res;
          this.list = Array.isArray(res?.list) ? res.list : [];
          this.paginator.total = res?.total || 0;
        })
      );
  }

  /**
   * 重置
   */
  onReset() {
    this.data = cloneDeep(this.EMP_DATA);
    this.paginator.page = 1;

    this.loadData(true);
  }
}
