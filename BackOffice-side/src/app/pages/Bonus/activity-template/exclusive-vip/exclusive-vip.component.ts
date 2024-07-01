import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { finalize, lastValueFrom, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TableSortComponent } from 'src/app/shared/components/table-sort/table-sort.component';
import {
  ActivityListItem,
  ActivityQualificationsType,
  ActivityQualificationsTypeEnum,
  ActivityStatusEnum,
  ActivityTypeEnum,
} from 'src/app/shared/interfaces/activity';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { DestroyService, JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe, TimeUTCFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import moment from 'moment';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { timeFormat } from 'src/app/shared/models/tools.model';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { ExclusiveVipSendCouponPopupComponent } from './send-coupon-popup/send-coupon-popup.component';

@Component({
  selector: 'exclusive-vip',
  templateUrl: './exclusive-vip.component.html',
  styleUrls: ['./exclusive-vip.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
    LabelComponent,
    IconSrcDirective,
    TableSortComponent,
    TimeUTCFormatPipe,
    TimeFormatPipe,
  ],
})
export class ExclusiveVipComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    public router: Router,
    public appService: AppService,
    private confirmModalService: ConfirmModalService,
    private api: ActivityAPI,
    public lang: LangService,
    private modalService: MatModal
  ) {
    // 必须：活动初始化设置
    this.curType = ActivityTypeEnum.VipExclusive;
  }

  /** 必须：活动初始化设置 */
  readonly curType: ActivityTypeEnum;

  protected readonly ActivityTypeEnum = ActivityTypeEnum;
  protected readonly ActivityStatusEnum = ActivityStatusEnum;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 筛选 - 状态列表 */
  statusList: Tabs[] = [
    { name: '待开始', lang: 'member.activity.sencli6.toBeStarted', value: 0 },
    { name: '进行中', lang: 'member.activity.sencli6.processing', value: 1 },
    { name: '已过期', lang: 'member.coupon.expired', value: 2 },
    { name: '开启审核中', lang: 'member.activity.sencliCommon.startingReview', value: -1 },
    { name: '停止审核中', lang: 'member.activity.sencliCommon.stopReviewing', value: -2 },
  ];

  dataEmpty = {
    campaignName: '', // 活动名称
    status: '', // 状态
    time: [] as Date[], // 时间
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: ActivityListItem[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tmpType: ActivityQualificationsTypeEnum[this.curType] as ActivityQualificationsType,
      tenantId: this.subHeaderService.merchantCurrentId,
      activityName: this.data.campaignName,
      configState: this.data.status,
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
      ...sendData,
    };

    return this.api.getOldBonusList(parmas);
  }

  /** 列表/活动操作 - 新增/编辑 活动 */
  onGoCampaign(item?: ActivityListItem) {
    if (!this.subHeaderService.merchantCurrentId)
      return this.appService.showToastSubject.next({ msg: 'no select tenant' });

    this.router.navigate(['/bonus/activity-manage/' + ActivityTypeEnum[this.curType] + '/activity'], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId, id: item?.activityId, code: item?.tmpCode },
    });
  }

  /** 活动操作 - 查看 */
  onViewCampaign(item: ActivityListItem) {
    if (!this.subHeaderService.merchantCurrentId)
      return this.appService.showToastSubject.next({ msg: 'no select tenant' });

    this.router.navigate(['/bonus/activity-manage/' + ActivityTypeEnum[this.curType] + '/activity-view'], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId, id: item?.activityId, code: item?.tmpCode },
    });
  }

  /** 发券 - 弹窗操作 */
  onOpneSendCoupnPopup(item?: ActivityListItem) {
    const modalRef = this.modalService.open(ExclusiveVipSendCouponPopupComponent, {
      width: '744px',
      disableClose: true,
    });
    modalRef.componentInstance['data'] = item;
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;

    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 可否允许编辑 */
  allowEdit(status) {
    return ActivityStatusEnum.inProgress !== status;
  }

  /**
   * 活动操作 - 状态变更
   * @state 1=开启,0=停止
   * @tmpCode 模板code
   */
  onStateUpdateCampaign(state: number, tmpCode: string) {
    this.confirmModalService
      .open({
        msgLang: state ? 'luckRoulette.ifStart' : 'luckRoulette.ifEnd',
      })
      .result.then(() => {
        this.appService.isContentLoadingSubject.next(true);
        this.api
          .qualifications_cos({
            tmpConfigState: state,
            tmpCodes: [tmpCode],
          })
          .subscribe((res) => {
            this.appService.isContentLoadingSubject.next(false);

            if (res?.code !== '0000')
              return this.appService.showToastSubject.next(
                res.message ? { msg: res.message } : { msgLang: 'common.operationFailed' }
              );

            this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
            this.loadData();
          });
      })
      .catch(() => {});
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  /**
   * 导出
   */
  async onExport() {
    let list: ActivityListItem[] = [];

    try {
      this.appService.isContentLoadingSubject.next(true);
      const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
      this.appService.isContentLoadingSubject.next(false);
      list = res?.data?.records || [];
      this.list = list;
    } finally {
      this.appService.isContentLoadingSubject.next(false);
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const campaignName = await this.lang.getOne('member.activity.sencli12.campaignName'); // 活动名称
    const startTime = await this.lang.getOne('common.startTime'); // 开始时间
    const endTime = await this.lang.getOne('common.endTime'); // 结束时间
    const receiveTimes = await this.lang.getOne('member.activity.sencli2.receiveTimes'); // 领取次数
    const recipientsNumber = await this.lang.getOne('member.activity.sencli2.recipientsNumber'); // 领取人数
    const actStatus = await this.lang.getOne('luckRoulette.actStatus'); // 活动状态

    const status = {
      [ActivityStatusEnum.waitingStart]: await this.lang.getOne('member.activity.sencli6.toBeStarted'),
      [ActivityStatusEnum.inProgress]: await this.lang.getOne('member.activity.sencli6.processing'),
      [ActivityStatusEnum.stopped]: await this.lang.getOne('member.coupon.expired'),
      [ActivityStatusEnum.startReview]: await this.lang.getOne('member.activity.sencliCommon.startingReview'),
      [ActivityStatusEnum.stopReview]: await this.lang.getOne('member.activity.sencliCommon.stopReviewing'),
    };

    JSONToExcelDownload(
      list.map((e) => ({
        [campaignName]: e.activityName || '-',
        [startTime]: timeFormat(+e.tmpStartTime) || '-',
        [endTime]: timeFormat(+e.tmpEndTime) || '-',
        [receiveTimes]: e.tmpSendNum,
        [recipientsNumber]: e.tmpSendUidNum,
        [actStatus]: status[e.configState] || '-',
      })),
      'exclusive-vip-list ' + Date.now()
    );
  }
}
