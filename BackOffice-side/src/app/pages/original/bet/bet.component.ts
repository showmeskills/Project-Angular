import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LotteryApi } from 'src/app/shared/api/lottery.api';
import { getRangeTime } from 'src/app/shared/models/tools.model';
import { DatePipe, NgFor, NgSwitch, NgSwitchCase, NgIf, AsyncPipe } from '@angular/common';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-bet',
  templateUrl: './bet.component.html',
  styleUrls: ['./bet.component.scss'],
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
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
    WinDirective,
    WinColorDirective,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    CurrencyValuePipe,
    LangPipe,
    AsyncPipe,
  ],
})
export class BetComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    public appService: AppService,
    public subHeaderService: SubHeaderService,
    private api: LotteryApi,
    private datePipe: DatePipe
  ) {}

  isLoading = false;
  time: any[] = []; // 时间区间
  // 表单搜索数据
  searchData: any = {};
  searchDataEMPT: any = {
    lotteryBetId: '',
    lotteryUserId: '',
    lotteryBetStatus: '',
    lotteryName: '',
    timeType: '',
  };

  // 筛选数据
  lotteryNameList: any[] = [];

  // 页面数据
  list: any = [];

  ngOnInit(): void {
    this.searchData = { ...this.searchDataEMPT };
    // this.paginator.pageSize = 10;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.getInitData();
      this.loadData(true);
    });
  }

  // 获取页面渲染数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;

    this.loading(true);
    this.api
      .systemLotteryBetGetPage(this.subHeaderService.merchantCurrentId, {
        size: this.paginator.pageSize,
        current: this.paginator.page,
        ...(this.time[0]
          ? {
              startTime: this.datePipe.transform(this.time[0], 'yyyy-MM-dd'),
            }
          : {}),
        ...(this.time[0]
          ? {
              endTime: this.datePipe.transform(this.time[1], 'yyyy-MM-dd'),
            }
          : {}),
        ...(this.searchData.lotteryBetId ? { lotteryBetId: this.searchData.lotteryBetId } : {}),
        ...(this.searchData.lotteryUserId ? { lotteryUserId: this.searchData.lotteryUserId } : {}),
        ...(this.searchData.lotteryBetStatus ? { lotteryBetStatus: this.searchData.lotteryBetStatus } : {}),
        ...(this.searchData.lotteryName ? { lotteryName: this.searchData.lotteryName } : {}),
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res?.data.records || [];
        this.paginator.total = res.data.total;
      });
  }

  // 获取筛选数据
  getInitData() {
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return this.loading(false);
    this.loading(true);
    this.api.systemPlayGetLotteryName(this.subHeaderService.merchantCurrentId).subscribe((res) => {
      this.loading(false);
      this.lotteryNameList = [];
      res.data?.map((e) => {
        this.lotteryNameList.push({ val: e });
      });
    });
  }

  onTime(timeDate) {
    if (!timeDate) {
      this.time = [];
    } else {
      this.time = [new Date(Number(getRangeTime(timeDate)[0])), new Date()];
    }
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.searchData = { ...this.searchDataEMPT };
    this.time = [];
    this.loadData(true);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
