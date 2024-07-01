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
import { depositActivityInstance } from 'src/app/pages/Bonus/bonus-routing';
import { ActivityListItem, ActivityStatusEnum } from 'src/app/shared/interfaces/activity';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
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
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgTemplateOutlet, AsyncPipe } from '@angular/common';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgIf,
    AngularSvgIconModule,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
    CdkDropList,
    CdkDrag,
    NgTemplateOutlet,
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
export class DepositComponent implements OnInit {
  constructor(
    public router: Router,
    public appService: AppService,
    private modalService: MatModal,
    public lang: LangService,
    private api: ActivityAPI,
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    private activatedRoute: ActivatedRoute,
    private confirmModalService: ConfirmModalService
  ) {}

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  /** 活动名称 */
  activityName = '';

  pageSizes: number[] = [...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  tenantId = '';
  dataEmpty = {
    activityName: '', // 名称
    time: [], // 时间
  };

  data = cloneDeep(this.dataEmpty);
  sortFlag = false;
  sortList: ActivityListItem[] = [];

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
        tmpType: 'deposit',
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
        // LanguageCode: this.lang.currentLang.toLowerCase(),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        this.paginator.total = res?.data?.total || 0;
        this.list = res?.data?.records || [];
      });
  }

  /** 重置 */
  onReset() {
    this.sortFlag = false;
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  onAdd(item?: ActivityListItem) {
    if (!this.subHeaderService.merchantCurrentId)
      return this.appService.showToastSubject.next({ msg: 'no select tenant' });

    this.router.navigate([depositActivityInstance.getPathStep1(item?.activityId, item?.tmpCode)], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId },
    });
  }

  /** 查看 */
  onView(item: ActivityListItem) {
    if (!this.subHeaderService.merchantCurrentId)
      return this.appService.showToastSubject.next({ msg: 'no select tenant' });

    this.router.navigate([depositActivityInstance.getViewPathStep1(item.activityId, item.tmpCode)], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId, allowEdit: this.allowEdit(item?.configState) },
    });
  }

  /**
   * 可否允许编辑
   */
  allowEdit(status: ActivityStatusEnum) {
    return ActivityStatusEnum.inProgress !== status;
  }

  /**
   * 状态更新
   * @param c
   * @param item
   */
  onStatus(item: ActivityListItem) {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .qualifications_cos({
        tmpCodes: [item?.tmpCode],
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

    JSONToExcelDownload(exportList, 'deposit-list ' + Date.now());
  }

  sort() {
    // 获取排序数据
    this.loading(true);
    const params = {
      tenantId: this.subHeaderService.merchantCurrentId,
      tmpType: 'deposit',
    };
    this.api.getoldbonusactivityorderdata(params).subscribe((res) => {
      this.loading(false);
      this.sortList = res?.data || [];
      this.sortFlag = !this.sortFlag;
    });
  }

  sortConfirm() {
    this.confirmModalService
      .open({
        msgLang: 'game.manage.sure_sort',
      })
      .result.then(() => {
        const params = {
          tmpType: 'deposit',
          tenantId: this.subHeaderService.merchantCurrentId,
          listDto: this.sortList.map((v, i) => ({ tmpId: v.tmpId, triggerOrder: i + 1 })),
        };
        this.loading(true);
        this.api.back_ordersubmit(params).subscribe((res) => {
          this.loading(false);
          if (res?.code !== '0000') return this.appService.showToastSubject.next({ msg: res.message });

          this.sortFlag = !this.sortFlag;
          this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
        });
      })
      .catch(() => {});
  }

  sortCancel() {
    this.sortFlag = !this.sortFlag;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.sortList, event.previousIndex, event.currentIndex);
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  protected readonly ActivityStatusEnum = ActivityStatusEnum;
}
