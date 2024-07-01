import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { AppService } from 'src/app/app.service';
import { StatApi } from 'src/app/shared/api/stat.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { finalize, takeUntil } from 'rxjs/operators';
import _moment from 'moment';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { Moment } from 'moment/moment';
import { cloneDeep } from 'lodash';
import { ProxyDataItem } from 'src/app/shared/interfaces/stat';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatOptionModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'YYYY-MM',
    monthYearLabel: 'YYYY MMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY MMMM',
  },
};

@Component({
  selector: 'proxy-data',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    EmptyComponent,
    FormRowComponent,
    LangPipe,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    PaginatorComponent,
    ReactiveFormsModule,
    FormsModule,
    OwlDateTimeTriggerDirective,
    CurrencyValuePipe,
    MatInputModule,
    MatDatepickerModule,
    NgbPopover,
  ],
  templateUrl: './proxy-data.component.html',
  styleUrls: ['./proxy-data.component.scss'],
  // providers: [DestroyService],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'zh-CN' },
  ],
})
export class ProxyDataComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: StatApi,
    private subHeader: SubHeaderService,
    private _destroy$: DestroyService
  ) {}

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      // const currentDate = _moment();
      // const firstDayOfMonth = currentDate.startOf('month');
      // this.date.setValue(firstDayOfMonth);
      this.loadData(true);
    });
  }

  EMPTY_DATA = {
    // time: [moment().subtract(6, 'day').startOf('h').toDate(), new Date()] as Date[], // 时间范围
    hasTest: false, // 是否包含测试用户
  };

  data = cloneDeep(this.EMPTY_DATA);
  list: ProxyDataItem[] = [];

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
      tenantId: Number(this.subHeader.merchantCurrentId),
      // hasTest: this.data.hasTest,
      monthReview: this.date.value.format('YYYY-MM'),
      current: this.paginator.page,
      size: this.paginator.pageSize,
    };
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    if (!this.date.value) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getProxyDataData(this.getParams())
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = res.data?.records || [];
        this.paginator.total = res.data?.total || 0;
      });
  }

  /**
   * 重置
   */
  onReset() {
    this.data = cloneDeep(this.EMPTY_DATA);
    this.list = [];
    this.date.reset();
    this.loadData(true);
  }

  /**
   * 导出
   */
  onExport() {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .cvsProxyDataData({
        ...this.getParams(),
      })
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe();
  }

  date = new FormControl();
  selYear = false;

  // 日期关闭
  onDPClose(): void {
    // this.selYear && this.date.setValue(undefined);
    this.selYear = false;
  }

  // 年份选择回调
  chosenYearHandler(normalizedYear: Moment) {
    this.selYear = true;
    const ctrlValue = this.date.value;

    this.date.setValue(ctrlValue instanceof _moment ? ctrlValue?.['year'](normalizedYear.year()) : normalizedYear);
  }

  // 月份选择回调
  chosenMonthHandler(normalizedMonth: Moment, datepicker: any | MatDatepicker<Moment>) {
    this.selYear = false;
    datepicker.close();

    const ctrlValue = this.date.value;
    let month = ctrlValue instanceof _moment ? ctrlValue?.['month'](normalizedMonth.month()) : normalizedMonth;

    month = month.date(1).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    this.date.setValue(month);
    this.loadData(true);
  }

  showMaker(item: string) {
    return item;
  }
}
