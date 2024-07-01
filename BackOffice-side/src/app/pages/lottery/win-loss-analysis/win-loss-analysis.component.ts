import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LotteryApi } from 'src/app/shared/api/lottery.api';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-win-loss-analysis',
  templateUrl: './win-loss-analysis.component.html',
  styleUrls: ['./win-loss-analysis.component.scss'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgFor,
    NgIf,
    AngularSvgIconModule,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class WinLossAnalysisComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    public router: Router,
    private appService: AppService,
    public modal: NgbModal,
    private api: LotteryApi,
    private datePipe: DatePipe,
    public subHeaderService: SubHeaderService
  ) {}

  isLoading = false;

  // 表单搜索数据
  searchData: any = {};
  searchDataEMPT: any = {
    lotteryType: '快乐彩',
    time: [new Date(), new Date()],
  };

  // 页面数据
  list: any = [];
  listData: any = {};

  ngOnInit(): void {
    this.searchData = { ...this.searchDataEMPT };
    // this.paginator.pageSize = 10;
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.loadData(true);
    });
  }

  // 获取页面渲染数据
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;

    this.loading(true);
    this.api
      .sysLotteryIssueNumberGetList(this.subHeaderService.merchantCurrentId, {
        startTime: this.datePipe.transform(this.searchData.time[0], 'yyyy-MM-dd'),
        endTime: this.datePipe.transform(this.searchData.time[1], 'yyyy-MM-dd'),
        lotteryType: this.searchData.lotteryType,
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res?.data.lotteryTypeStatisticsVos || [];
        this.listData = res?.data.lotteryStatisticsVo || {};
      });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.searchData = { ...this.searchDataEMPT };
    this.loadData(true);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  async onEdit(detailTpl: TemplateRef<any>) {
    this.modal.open(detailTpl, {
      centered: true,
      windowClass: 'lottery-edit-modal',
    });
  }
}
