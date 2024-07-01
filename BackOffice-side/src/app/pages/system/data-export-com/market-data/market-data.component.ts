import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { cloneDeep } from 'lodash';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { finalize, takeUntil } from 'rxjs/operators';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { MarketDataItem } from 'src/app/shared/interfaces/stat';
import { AppService } from 'src/app/app.service';
import { StatApi } from 'src/app/shared/api/stat.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';

@Component({
  selector: 'market-data',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    FormRowComponent,
    FormatMoneyPipe,
    LangPipe,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    PaginatorComponent,
    ReactiveFormsModule,
    TimeFormatPipe,
    OwlDateTimeTriggerDirective,
    EmptyComponent,
    FormsModule,
    CurrencyValuePipe,
  ],
  templateUrl: './market-data.component.html',
  styleUrls: ['./market-data.component.scss'],
  providers: [DestroyService],
})
export class MarketDataComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: StatApi,
    private subHeader: SubHeaderService,
    private _destroy$: DestroyService
  ) {}

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.loadData(true);
    });
  }

  EMPTY_DATA = {
    // time: [moment().subtract(6, 'day').startOf('h').toDate(), new Date()] as Date[], // 时间范围
    time: [] as Date[], // 时间范围
    hasTest: false, // 是否包含测试用户
  };

  data = cloneDeep(this.EMPTY_DATA);
  list: MarketDataItem[] = [];

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  /**
   * 表格标题
   */
  get tableTitle() {
    return Object.keys(this.list?.[0] || {});
  }

  getParams() {
    return {
      tenantIds: [this.subHeader.merchantCurrentId],
      hasTest: this.data.hasTest,
      beginDate: timeFormat(this.data.time[0], 'YYYY-MM-DD') || undefined,
      endDate: timeFormat(this.data.time[1], 'YYYY-MM-DD') || undefined,
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    if (!this.data.time[1]) return;
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getMarketData(this.getParams())
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  /**
   * 重置
   */
  onReset() {
    this.data = cloneDeep(this.EMPTY_DATA);
    this.list = [];
    this.loadData(true);
  }

  /**
   * 导出
   */
  onExport() {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .cvsMarketData({
        ...this.getParams(),
      })
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe();
  }
}
