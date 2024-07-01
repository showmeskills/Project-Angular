import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { Subject } from 'rxjs';
import { ReviewApi } from 'src/app/shared/api/review.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ReviewPopupComponent } from 'src/app/pages/risk/review/review-popup/review-popup.component';
import { cloneDeep } from 'lodash';
import { ReviewItem, ReviewStatus, ReviewType } from 'src/app/shared/interfaces/review';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { ReviewService } from 'src/app/pages/risk/risk.service';
import { ThemeType } from 'src/app/shared/interfaces/base.interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { StickyDirective } from 'src/app/shared/directive/sticky.directive';

@Component({
  selector: 'review-list',
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss'],
  standalone: true,
  imports: [
    StickyDirective,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    CurrencyIconDirective,
    NgIf,
    IconSrcDirective,
    NgSwitch,
    NgSwitchCase,
    NgTemplateOutlet,
    LabelComponent,
    EmptyComponent,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ReviewListComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private api: ReviewApi,
    private subHeaderService: SubHeaderService,
    private appService: AppService,
    private modalService: MatModal,
    public reviewService: ReviewService,
    private lang: LangService
  ) {}

  _destroyed = new Subject<void>();

  ReviewType = ReviewType;
  ReviewStatus = ReviewStatus;
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(1, 1000); // 分页
  isLoading = false; // 是否处于加载
  list: ReviewItem[] = []; // 列表
  // typeList: any[] = [{ name: '订单', lang: 'common.order', value: ReviewCategory.Order }]; // 类型列表
  statusList: { name: string; value: ReviewStatus; lang: string; theme: ThemeType }[] = [
    { name: '全部', value: '' as ReviewStatus, lang: 'common.all', theme: 'primary' },
    { name: '待审核', value: ReviewStatus.Processing, lang: 'risk.pending', theme: 'warning' },
    { name: '审核通过', value: ReviewStatus.Success, lang: 'risk.pass', theme: 'success' },
    { name: '拒绝申请', value: ReviewStatus.Fail, lang: 'risk.reject', theme: 'danger' },
  ];

  dataEmpty = {
    // type: ReviewCategory.Order, // 类型: 默认订单
    status: '' as ReviewStatus, // 状态
    time: [] as Date[], // 时间
  };

  data = cloneDeep(this.dataEmpty); // 查询条件

  ngOnInit(): void {
    this.loadData(true);
    // this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => this.loadData(true));
  }

  // 历史记录 - 重置
  onReset() {
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.api
      .getReviewList({
        // category: ReviewCategory.Order, // 类型
        // merchantId: this.subHeaderService.merchantCurrentId, // 商户id，暂时隐藏 也只有管理员申请 商户不给看 Marr 2023-04-07
        status: this.data.status || undefined, // 状态
        startTime: toDateStamp(this.data.time[0]),
        endTime: toDateStamp(this.data.time[1], true),
        page: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .subscribe((res) => {
        this.loading(false);

        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  /**
   * 打开审核弹窗
   * @param item
   */
  async onOpenAuditPopup(item: ReviewItem) {
    this.appService.isContentLoadingSubject.next(true);
    this.api.getReviewDetail(item.id).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.openAuditPopup(item, res);
    });
  }

  /**
   * 打开审核弹窗
   * @param item
   * @param detail
   */
  async openAuditPopup(item: ReviewItem, detail: ReviewItem) {
    if (detail) {
      this.loading(false);
      const modalRef = this.modalService.open(ReviewPopupComponent, { width: '788px', disableClose: true });
      modalRef.componentInstance['title'] = await this.lang.getOne(this.reviewService.getTypeLang(item.auditType));
      modalRef.componentInstance['data'] = detail;
      modalRef.componentInstance.reviewedAfter.subscribe(() => this.loadData());
    } else {
      this.appService.showToastSubject.next({ msgLang: 'risk.failToGet', successed: false });
    }
  }

  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
