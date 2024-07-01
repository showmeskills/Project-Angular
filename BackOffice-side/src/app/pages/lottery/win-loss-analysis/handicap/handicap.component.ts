import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LotteryApi } from 'src/app/shared/api/lottery.api';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputPercentageDirective } from 'src/app/shared/directive/input.directive';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
@Component({
  selector: 'app-handicap',
  templateUrl: './handicap.component.html',
  styleUrls: ['./handicap.component.scss'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    FormRowComponent,
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgIf,
    NgFor,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    InputPercentageDirective,
    LangPipe,
  ],
})
export class HandicapComponent implements OnInit, OnDestroy {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  _destroyed: any = new Subject<void>(); // 订阅商户的流

  constructor(
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    public modal: NgbModal,
    private api: LotteryApi,
    private datePipe: DatePipe,
    public subHeaderService: SubHeaderService,
    public lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = id;
  }

  id = ''; // 分页所用id

  isLoading = false;

  // 表单搜索数据
  searchData: any = {};
  searchDataEMPT: any = {
    lotteryIssueNumber: '',
    time: [new Date(), new Date()],
  };

  // 页面数据
  list: any = [];
  listData: any = {};
  editDate: any = {};
  lotteryNumber: any[] = [];

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
    const params = {
      size: this.paginator.pageSize,
      current: this.paginator.page,
      lotteryId: this.id,
      startTime: this.datePipe.transform(this.searchData.time[0], 'yyyy-MM-dd'),
      endTime: this.datePipe.transform(this.searchData.time[1], 'yyyy-MM-dd'),
    };
    forkJoin([
      this.api.sysLotteryIssueNumberGetPage(this.subHeaderService.merchantCurrentId, params),
      this.api.sysLotteryIssueNumberGetTotal(this.subHeaderService.merchantCurrentId, params),
    ]).subscribe(([dataPage, dataTotal]) => {
      this.loading(false);
      this.list = dataPage?.data.records || [];
      this.paginator.total = dataPage?.data.total;
      this.listData = dataTotal?.data || {};
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

  onItemLottery(id: any) {
    this.loading(true);
    this.api.sysLotteryIssueNumberGetInfoId(id).subscribe((res) => {
      this.loading(false);
      this.editDate = res.data;
      this.lotteryNumber = this.editDate.lotteryIssueNumberData?.split(',') || [];
    });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  async onEdit(detailTpl: TemplateRef<any>, id: any) {
    this.onItemLottery(id);
    this.modal.open(detailTpl, {
      centered: true,
      windowClass: 'lottery-edit-modal',
      size: 'lg',
    });
  }

  onSubmit() {
    this.loading(true);
    const params = this.lotteryNumber.toString();
    this.api.sysLotteryIssueNumberUpdateIssueNumber(this.editDate.lotteryIssueNumberId, params).subscribe((res) => {
      this.loading(false);
      if (res.code === '200') {
        this.appService.showToastSubject.next({
          msgLang: 'lotto.subSucess',
          successed: true,
        });
      } else {
        this.appService.showToastSubject.next({
          msgLang: 'lotto.subFailed',
          successed: false,
        });
      }
      this.loadData();
    });
  }
}
