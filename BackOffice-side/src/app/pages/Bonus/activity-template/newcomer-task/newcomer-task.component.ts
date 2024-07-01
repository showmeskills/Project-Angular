import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService, JSONToExcelDownload, timeUTCFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { newcomerTaskInstance } from 'src/app/pages/Bonus/bonus-routing';
import { ActivityListItem, ActivityStatusEnum } from 'src/app/shared/interfaces/activity';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeUTCFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-newcomer-task',
  templateUrl: './newcomer-task.component.html',
  styleUrls: ['./newcomer-task.component.scss'],
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
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
    EmptyComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    FormatMoneyPipe,
    TimeUTCFormatPipe,
    LangPipe,
    AsyncPipe,
  ],
})
export class NewcomerTaskComponent implements OnInit {
  constructor(
    public router: Router,
    public appService: AppService,
    private modalService: MatModal,
    public lang: LangService,
    private api: ActivityAPI,
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  /** 活动名称 */
  activityName: any = '';

  pageSizes: number[] = [...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  tenantId: any = '';
  data: any = {};
  dataEmpty: any = {
    activityName: '', // 名称
    time: [], // 时间
  };

  /** 列表数据 */
  list: ActivityListItem[] = [];

  onOpenWarningPopup(tpl: any, item: ActivityListItem, msg: string) {
    const modalRef = this.modalService.open(tpl, { width: '540px', data: { msg, item } });
    modalRef.result.then(() => {}).catch(() => {});
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getOldBonusList({
        tmpType: 'newuser',
        tenantId: this.subHeaderService.merchantCurrentId,
        activityName: this.data.activityName,
        ...(this.data.time[0]
          ? {
              tmpEndTimeStart: moment(Number(toDateStamp(this.data.time[0]))).format('YYYY-MM-DD HH:mm:ss'),
            }
          : {}),
        ...(this.data.time[1]
          ? {
              tmpEndTimeEnd: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD HH:mm:ss'),
            }
          : {}),
        pageIndex: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        this.paginator.total = res?.data?.total || 0;
        this.list = res?.data?.records || [];
      });
  }

  /** 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  onAdd(item?: any) {
    if (!this.subHeaderService.merchantCurrentId)
      return this.appService.showToastSubject.next({ msg: 'no select tenant' });

    // this.router.navigate(['/bonus/activity-manage/NewUser/setting/3/activity', item?.activityCode || ''], {
    //   queryParams: { tenantId: this.subHeaderService.merchantCurrentId },
    // });

    this.router.navigate([newcomerTaskInstance.getPathStep1(item?.activityId, item?.tmpCode)], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId },
    });
  }

  /** 查看 */
  onView(item) {
    if (!this.subHeaderService.merchantCurrentId)
      return this.appService.showToastSubject.next({ msg: 'no select tenant' });

    // this.router.navigate(['/bonus/activity-manage/Deposit/setting/3/base-view', item?.activityCode || ''], {
    //   queryParams: { tenantId: this.subHeaderService.merchantCurrentId },
    // });

    this.router.navigate([newcomerTaskInstance.getViewPathStep1(item?.activityId, item?.tmpCode)], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId, allowEdit: this.allowEdit(item?.configState) },
    });
  }

  /**
   * 可否允许编辑
   */
  allowEdit(status: any) {
    return ActivityStatusEnum.inProgress !== status;
  }

  /**
   * 状态更新
   * @param c
   * @param item
   */
  onStatus(item) {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .qualifications_cos({
        tmpCodes: [item.tmpCode],
        tmpConfigState: item.configState === 0 ? 1 : 0,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        if (res.code !== '0000') return this.appService.showToastSubject.next({ msg: res.message });
        this.appService.toastOpera(res?.code === '0000');
        res?.code === '0000' && this.loadData();
      });
  }

  /** 导出 */
  async onExport() {
    const eventName = await this.lang.getOne('member.activity.sencliCommon.eventName');
    const activityTime = await this.lang.getOne('member.activity.sencliCommon.activityTime');
    const receiveTimes = await this.lang.getOne('member.activity.sencli2.receiveTimes');
    const recipientsNumber = await this.lang.getOne('member.activity.sencli2.recipientsNumber');
    const actStatus = await this.lang.getOne('luckRoulette.actStatus');

    const status = {
      [ActivityStatusEnum.waitingStart]: await this.lang.getOne('member.activity.sencli6.toBeStarted'),
      [ActivityStatusEnum.inProgress]: await this.lang.getOne('member.activity.sencli6.processing'),
      [ActivityStatusEnum.stopped]: await this.lang.getOne('member.coupon.expired'),
      [ActivityStatusEnum.startReview]: await this.lang.getOne('member.activity.sencliCommon.startingReview'),
      [ActivityStatusEnum.stopReview]: await this.lang.getOne('member.activity.sencliCommon.stopReviewing'),
    };

    const exportList = this.list.map((e) => ({
      [eventName]: e.activityName || '-',
      [activityTime]: +e.tmpEndTime
        ? `<span>
            ${timeUTCFormat(+e.tmpStartTime)} -
            ${timeUTCFormat(+e.tmpEndTime)}
          </span>`
        : '-',
      [receiveTimes]: e.tmpSendNum,
      [recipientsNumber]: e.tmpSendUidNum,
      [actStatus]: status[e.configState],
    }));

    if (!exportList.length) return;

    JSONToExcelDownload(exportList, 'newcomer-task-list ' + Date.now());
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
