import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, forkJoin, Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LotteryApi } from 'src/app/shared/api/lottery.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { DatePipe, NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { OriginalRatewinParams, OriginalRatewinData } from 'src/app/shared/interfaces/original.interface';
import moment from 'moment';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
@Component({
  selector: 'app-profit-analysis',
  templateUrl: './profit-analysis.component.html',
  styleUrls: ['./profit-analysis.component.scss'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    TimeFormatPipe,
    LangPipe,
    CurrencyValuePipe,
    AsyncPipe,
  ],
})
export class profitAnalysisComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    public appService: AppService,
    private lotteryApi: LotteryApi,
    public subHeaderService: SubHeaderService,
    private datePipe: DatePipe
  ) {}

  isLoading = false;
  ProviderCatId = 'GBGame-3';

  UserId = ''; // 用户id
  time: Date[] = []; // 时间区间
  typeList: any = []; // 游戏列表
  selectedType = ''; // 当前选中的游戏

  // 页面数据
  list: OriginalRatewinData[] = [];

  ngOnInit() {
    // this.paginator.pageSize = 10;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.getInitData();
      this.loadData(true);
    });
  }

  // 获取筛选数据
  getInitData() {
    this.loading(true);
    if (!this.subHeaderService.merchantCurrentId) return this.loading(false);
    forkJoin([
      this.lotteryApi.getLotteryNameSelect({
        TenantId: this.subHeaderService.merchantCurrentId,
        ProviderCatId: this.ProviderCatId,
      }),
    ]).subscribe(([typeData]) => {
      this.typeList = typeData || [];
    });
  }

  // 获取页面渲染数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    // 没有商户 没有输入uid
    if (!this.subHeaderService.merchantCurrentId || !this.UserId) return this.loading(false);

    this.loading(true);
    const param: OriginalRatewinParams = {
      TenantId: +this.subHeaderService.merchantCurrentId,
      uid: this.UserId,
      ...(this.selectedType ? { GameCode: this.selectedType } : {}),
      ...(this.time[0]
        ? {
            StartTime: moment(Number(toDateStamp(this.time[0], false))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      ...(this.time[1]
        ? {
            EndTime: moment(Number(toDateStamp(this.time[1], true, false, false))).format('YYYY-MM-DD HH:mm:ss'),
          }
        : {}),
      // Page: this.paginator.page,
      // PageSize: this.paginator.pageSize,
    };
    this.lotteryApi
      .getratewin(param)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((data) => {
        this.list = data;
        // this.paginator.total = data.total;
      });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onSearch() {
    // this.paginator.page = 1;
    this.loadData();
  }

  onReset() {
    this.UserId = '';
    this.time = [];
    this.selectedType = '';
    // this.paginator.page = 1;
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
