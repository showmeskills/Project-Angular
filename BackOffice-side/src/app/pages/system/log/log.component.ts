import { Component, OnInit, OnDestroy } from '@angular/core';
import { finalize, forkJoin, Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SystemLogApi } from 'src/app/shared/api/system-log.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { JSONToExcelDownload, timeFormat } from 'src/app/shared/models/tools.model';
import { LogItem, LogParams, OperationTypeItem } from 'src/app/shared/interfaces/system.interface';

@Component({
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class LogComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    private appService: AppService,
    private systemLogApi: SystemLogApi,
    public subHeaderService: SubHeaderService,
    private lang: LangService
  ) {}

  isLoading = false;

  // 头部筛选
  userName = ''; // 操作人
  time: Date[] = []; // 时间区间
  typeList: OperationTypeItem[] = []; // 日志类型
  selectedType = ''; // 当前选中日志类型
  merchantId;

  // 页面数据
  list: LogItem[] = [];

  ngOnInit(): void {
    // this.paginator.pageSize = 10;
    this.subHeaderService.loadMerchant(true);
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.merchantId = this.subHeaderService.merchantListAll?.[0]?.value;
      this.loadData(true);
    });
    this.getInitData();
  }

  // 获取筛选数据
  getInitData() {
    this.loading(true);
    forkJoin([this.systemLogApi.operationTypeList()]).subscribe(([typeData]) => {
      this.typeList = typeData || [];
    });
  }

  // 获取页面渲染数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return this.loading(false);

    this.loadData$().subscribe((data) => {
      this.list = data?.list || [];
      this.paginator.total = data?.total || 0;
    });
  }

  loadData$() {
    this.loading(true);
    const param: LogParams = {
      tenantId: this.merchantId,
      operationType: this.selectedType,
      userName: this.userName,
      ...(this.time[0] ? { startTime: +this.time[0] } : {}),
      ...(this.time[1] ? { endTime: +this.time[1] } : {}),
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    return this.systemLogApi.getOperationLogList(param).pipe(finalize(() => this.loading(false)));
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.userName = '';
    this.time = [];
    this.selectedType = '';
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * 导出
   */
  onExport() {
    this.loadData$().subscribe(async (res) => {
      if (!res?.list?.length) return;

      const merchantName = await this.lang.getOne('system.merchants.merchantName');
      const logType = await this.lang.getOne('system.log.logType');
      const operationItem = await this.lang.getOne('system.log.operationItem');
      const time = await this.lang.getOne('common.time');
      const operator = await this.lang.getOne('system.log.operator');

      const process = (e: LogItem) => ({
        [merchantName]: e.tenantName,
        [logType]: e.operationType,
        [operationItem]: e.content,
        [time]: timeFormat(e.createdTime),
        [operator]: e.userName,
      });

      const exportList = res.list.map(process);
      JSONToExcelDownload(exportList, 'logs ' + Date.now());
    });
  }
}
