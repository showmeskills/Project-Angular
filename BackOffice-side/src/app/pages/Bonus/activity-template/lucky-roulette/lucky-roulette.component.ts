import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService, JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import { catchError, takeUntil } from 'rxjs/operators';
import { ActivityStatusEnum, TurntableListItem } from 'src/app/shared/interfaces/activity';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { luckyRouletteInstance } from 'src/app/pages/Bonus/bonus-routing';
import { of } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AffixTheadDirective } from 'src/app/shared/directive/affix-thead.directive';

@Component({
  selector: 'app-lucky-roulette',
  templateUrl: './lucky-roulette.component.html',
  styleUrls: ['./lucky-roulette.component.scss'],
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
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    AffixTheadDirective,
    AsyncPipe,
  ],
})
export class LuckyRouletteComponent implements OnInit {
  constructor(
    public router: Router,
    public appService: AppService,
    private modalService: MatModal,
    public lang: LangService,
    private api: ActivityAPI,
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService
  ) {}

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  /** 活动名称 */
  activityName: any = '';

  statusEnum = ActivityStatusEnum;
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
  list: TurntableListItem[] = [];

  onOpenWarningPopup(tpl: any, item: TurntableListItem, msg: string) {
    const modalRef = this.modalService.open(tpl, { width: '540px', data: { msg, item } });
    modalRef.result.then(() => {}).catch(() => {});
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .turntable_list({
        tenantId: this.subHeaderService.merchantCurrentId,
        Name: this.data.activityName,
        StartTime: toDateStamp(this.data.time[0]),
        EndTime: toDateStamp(this.data.time[1], true),
        PageIndex: this.paginator.page,
        PageSize: this.paginator.pageSize,
        LanguageCode: this.lang.currentLang.toLowerCase(),
      })
      .pipe(catchError(() => of({} as any)))
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        this.paginator.total = res?.data?.totalCount || 0;
        this.list = res?.data?.activities || [];
      });
  }

  /** 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onAdd(item?: TurntableListItem) {
    if (!this.subHeaderService.merchantCurrentId)
      return this.appService.showToastSubject.next({ msg: 'no select tenant' });

    this.router.navigate([luckyRouletteInstance.getPathStep1(item?.activityId, item?.activityCode)], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId },
    });
  }

  /** 查看 */
  onView(item?: TurntableListItem) {
    if (!this.subHeaderService.merchantCurrentId)
      return this.appService.showToastSubject.next({ msg: 'no select tenant' });

    this.router.navigate([luckyRouletteInstance.getViewPathStep1(item?.activityId, item?.activityCode)], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId, allowEdit: this.allowEdit(item?.status) },
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
  onStatus(item: TurntableListItem) {
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .turntable_activityaudit({
        merchantId: this.subHeaderService.merchantCurrentId,
        activityCode: item.activityCode,
        status: [ActivityStatusEnum.waitingStart, ActivityStatusEnum.stopped].includes(item.status) ? 1 : 0,
        type: 'Turntable',
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        this.appService.toastOpera(res?.success === true);
        res?.success === true && this.loadData();
      });
  }

  /** 导出 */
  async onExport() {
    const eventName = await this.lang.getOne('member.activity.sencliCommon.eventName');
    const activityTime = await this.lang.getOne('member.activity.sencliCommon.activityTime');
    const drawTimes = await this.lang.getOne('luckRoulette.drawTimes');
    const winners = await this.lang.getOne('luckRoulette.winners');
    const actStatus = await this.lang.getOne('luckRoulette.actStatus');
    const reviewingStart = await this.lang.getOne('member.activity.sencliCommon.startingReview'); // 启动审核中
    const reviewingStop = await this.lang.getOne('member.activity.sencliCommon.stopReviewing'); // 停止审核中

    // 状态
    const status = {
      [ActivityStatusEnum.waitingStart]: await this.lang.getOne('member.activity.sencli6.toBeStarted'),
      [ActivityStatusEnum.inProgress]: await this.lang.getOne('member.activity.sencli6.processing'),
      [ActivityStatusEnum.stopped]: await this.lang.getOne('member.coupon.expired'),
      [ActivityStatusEnum.startReview]: await this.lang.getOne('member.activity.sencliCommon.startingReview'),
      [ActivityStatusEnum.stopReview]: await this.lang.getOne('member.activity.sencliCommon.stopReviewing'),
    };

    const exportList = this.list.map((e) => ({
      [eventName]: e.activityName || '-',
      [activityTime]: +e.endTime
        ? `<span>
            ${moment(+e.startTime).format('YYYY-MM-DD HH:mm:ss')} -
            ${moment(+e.endTime).format('YYYY-MM-DD HH:mm:ss')}
          </span>`
        : '-',
      [drawTimes]: e.drawTimes,
      [winners]: e.hitCount,
      [actStatus]: e.inAudit ? (e.status !== 1 ? reviewingStart : reviewingStop) : status[e.status],
    }));

    if (!exportList.length) return;

    JSONToExcelDownload(exportList, 'luck-wheel ' + Date.now());
  }

  protected readonly ActivityStatusEnum = ActivityStatusEnum;
}
