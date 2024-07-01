import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyService, timeFormat } from 'src/app/shared/models/tools.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { AppService } from 'src/app/app.service';
import { StatApi } from 'src/app/shared/api/stat.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { PspDepositList } from 'src/app/shared/interfaces/stat';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { SelectApi } from 'src/app/shared/api/select.api';
import { Currency } from 'src/app/shared/interfaces/currency';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'app-psp-deposit',
  templateUrl: './psp-deposit.component.html',
  styleUrls: ['./psp-deposit.component.scss'],
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
  ],
  providers: [DestroyService],
})
export class PspDepositComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: StatApi,
    private selectApi: SelectApi,
    private subHeader: SubHeaderService,
    private _destroy$: DestroyService,
    private lang: LangService
  ) {}

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.loadData(true);
    });
    this.getCurrencies();
  }

  EMPTY_DATA = {
    // time: [new Date(), moment().subtract(-1, 'day').startOf('h').toDate()] as Date[], // 时间范围 默认今天
    time: [] as Date[], // 时间范围 默认今天
    currency: '',
    uid: '',
  };

  data = cloneDeep(this.EMPTY_DATA);
  list: PspDepositList[] = [];
  currencies: Array<Currency> = [];

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  /**
   * 表格标题
   */
  get tableTitle() {
    return Object.keys(this.list?.[0] || {});
  }

  get getParams() {
    return {
      tenantIds: [this.subHeader.merchantCurrentId],
      beginDate: timeFormat(this.data.time[0], 'YYYY-MM-DD') || undefined,
      endDate: timeFormat(this.data.time[1], 'YYYY-MM-DD') || undefined,
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
      currency: this.data.currency,
      uid: this.data.uid,
    };
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    if (!this.data.time[1]) return;
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getPspDeposit(this.getParams)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  async getCurrencies() {
    this.selectApi.getCurrencySelect().subscribe((v) => {
      this.currencies = [
        {
          code: '',
          description: '',
          icon: '',
          isDigital: false,
        },
        ...(v || []),
      ];
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
      .exportPspDeposit({
        ...this.getParams,
      })
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe();
  }
}
