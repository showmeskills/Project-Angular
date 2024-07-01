import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestroyService } from 'src/app/shared/models/tools.model';
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
import moment from 'moment';
import { cloneDeep } from 'lodash';
import { BankDataItem } from 'src/app/shared/interfaces/stat';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';

@Component({
  selector: 'bank-data',
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
  templateUrl: './bank-data.component.html',
  styleUrls: ['./bank-data.component.scss'],
  providers: [DestroyService],
})
export class BankDataComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: StatApi,
    private subHeader: SubHeaderService,
    private _destroy$: DestroyService
  ) {}

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.loadData();
    });
  }

  EMPTY_DATA = {
    time: [moment().subtract(6, 'day').startOf('h').toDate(), new Date()] as Date[], // 时间范围
    hasTest: false, // 是否包含测试用户
    sort: 1,
  };

  data = cloneDeep(this.EMPTY_DATA);
  list: BankDataItem[] = [];

  // pageSizes: number[] = PageSizes; // 页大小
  // paginator: PaginatorState = new PaginatorState(); // 分页

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
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  loadData() {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getBankDatatData(this.getParams())
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = res ? res : [];
      });
  }

  /**
   * 重置
   */
  onReset() {
    this.data = cloneDeep(this.EMPTY_DATA);
    this.loadData();
  }

  /**
   * 导出
   */
  onExport() {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .cvsBankDataData({
        ...this.getParams(),
      })
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe();
  }
}
