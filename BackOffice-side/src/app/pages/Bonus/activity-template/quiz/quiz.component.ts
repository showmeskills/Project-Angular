import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { BillingPopupComponent } from './billing-popup/billing-popup.component';
import { QuizActivityApi } from 'src/app/shared/api/quiz-activity.api';
import { NewActivityApi } from 'src/app/shared/api/newActivity.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { BonusService } from 'src/app/pages/Bonus/bonus.service';
import { finalize, takeUntil } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    NgFor,
    NgIf,
    LabelComponent,
    EmptyComponent,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    TimeFormatPipe,
    LangPipe,
  ],
})
export class QuizComponent implements OnInit {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  constructor(
    private modalService: MatModal,
    private activatedRoute: ActivatedRoute,
    public router: Router,
    private appService: AppService,
    private api: QuizActivityApi,
    private activityApi: NewActivityApi,
    public lang: LangService,
    private destroy$: DestroyService,
    private bonusService: BonusService,
    public subHeaderService: SubHeaderService
  ) {}

  /** 结算前场次 */
  settlementList: any = [];
  isLoading = false;
  tenantId: any = '';

  dataEmpty = {
    title: '', // 名称
    time: '', // 时间
  };

  data = cloneDeep(this.dataEmpty);
  list: any = [];

  ngOnInit() {
    /** 触发结算刷新页面 */
    this.bonusService.updateList.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadData();
    });
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.activityApi
      .getActivities({
        TenantId: this.subHeaderService.merchantCurrentId,
        ActivityName: this.data.title,
        StartTime: toDateStamp(this.data.time[0], false) || 0,
        EndTime: toDateStamp(this.data.time[1], true) || 0,
        PageIndex: this.paginator.page,
        PageSize: this.paginator.pageSize,
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res.activities;
        this.paginator.total = res?.totalCount || 0;
      });
  }

  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  goActivityTep(id?) {
    this.router.navigate(['/bonus/activity-manage/quiz-active/', id || '']);
  }

  onView(id) {
    this.router.navigate(['/bonus/activity-manage/quiz-active-view/', id || '']);
  }

  /** 查看详情 */
  checkDetails() {
    this.router.navigate(['/bonus/activity-manage/activity-list/Details']);
  }

  /** 跳转到单个活动具体排名 */
  goRankList(id) {
    this.router.navigate(['/bonus/activity-manage/activity-list/Details/rank-list/' + id]);
  }

  onSort() {}

  async onOpenWarningPopup(tpl: any, type: string, id) {
    const activity = await this.lang.getOne('member.activity.sencliCommon.activity'); // 活动
    const open = await this.lang.getOne('common.open'); // 开启
    const stop = await this.lang.getOne('member.activity.sencliCommon.stop'); // 停止
    const success = await this.lang.getOne('common.success'); // 成功
    const fail = await this.lang.getOne('common.fail'); // 失败
    let msg: any = '';
    if (type === 'start') {
      // 确认是否上线该活动
      msg = 'member.activity.sencliCommon.isOpenActivity';
    } else if (type === 'end') {
      // 是否确认结束该活动
      msg = 'member.activity.sencliCommon.isCloseActivity';
    }
    const modalRef = this.modalService.open(tpl, { width: '540px', data: msg, disableClose: true });
    const status = type === 'start' ? open : stop;
    modalRef.result.then(() => {
      this.loading(true);
      this.api.activitySetStatus({ ActivityId: id, staus: type === 'start' ? 1 : -1 }).subscribe((res) => {
        this.loading(false);
        if (res.success) {
          this.loadData();
          this.appService.showToastSubject.next({
            msg: `${activity}${status}${success}！`,
            successed: true,
          });
        } else {
          this.appService.showToastSubject.next({
            msg: `${activity}${status}${fail}！`,
          });
        }
      });
    });
  }

  // 打开结算弹窗
  onOpenSettlement(id) {
    this.loading(true);
    this.api
      .gameMatches(id)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        if (!res.success) return;

        this.settlementList = res.data;
        const modalRef = this.modalService.open(BillingPopupComponent, { width: '575px', disableClose: true });
        modalRef.componentInstance.propData(this.settlementList);
      });
  }

  /** 加载状态*/
  loading(v: boolean): void {
    this.appService.isContentLoadingSubject.next(v);
  }
}
