import { CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { cloneDeep } from 'lodash';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { takeUntil } from 'rxjs/operators';
import { tournamentInstance } from 'src/app/pages/Bonus/bonus-routing';
import { CouponNonStickyLimitEnumType } from 'src/app/shared/interfaces/coupon';
import moment from 'moment';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { TableSortComponent } from 'src/app/shared/components/table-sort/table-sort.component';
import { NewContestListItem, NewContestStatusEnum } from 'src/app/shared/interfaces/activity';

@Component({
  selector: 'tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss'],
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
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
    LoadingDirective,
    LabelComponent,
    IconSrcDirective,
    CdkDropList,
    CdkDrag,
    TableSortComponent,
  ],
})
export class TournamentComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    public router: Router,
    public appService: AppService,
    private confirmModalService: ConfirmModalService,
    private api: ActivityAPI
  ) {}

  protected readonly NewContestStatusEnum = NewContestStatusEnum;

  /** 是否加载中 */
  isLoading = false;

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 当前tab */
  curTabValue = 1;
  /** tab列表 */
  tabList = [
    {
      name: '进行中以及即将开始',
      lang: 'member.activity.sencli12.tabs.activeUpcoming',
      value: 1,
      configStates: [10, 11],
    },
    { name: '已结束', lang: 'member.activity.sencli12.tabs.ended', value: 2, configStates: [2, 3] },
    { name: '草稿箱', lang: 'member.activity.sencli12.tabs.draft', value: 3, configStates: [0, -1, -2] },
  ];

  /** 筛选 - 产品列表 */
  productList = [
    {
      name: '娱乐场投注',
      lang: 'member.activity.prizeCommon.casinoBetting',
      value: CouponNonStickyLimitEnumType.SlotGame,
    },
    {
      name: '真人娱乐场投注',
      lang: 'member.activity.prizeCommon.liveCasinoBetting',
      value: CouponNonStickyLimitEnumType.LiveCasino,
    },
  ];

  /** 筛选 - 类型列表 */
  typeList = [{ name: '新竞赛活动', lang: 'member.activity.sencli12.title', value: 'Tournament' }];

  /** 筛选 - 状态列表 */
  statusList: Tabs[] = [];

  dataEmpty = {
    campaignName: '', // 活动名称
    product: '', // 产品
    type: 'Tournament', // 类型
    status: '', // 状态
    time: [] as Date[], // 时间

    order: '', // 排序字段
    isAsc: false, // 是否为升序排序
  };

  data: any = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: NewContestListItem[] = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  /** tab - 选择 */
  onSelectTab(value) {
    this.curTabValue = value;
    this.onReset();
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      activityName: this.data.campaignName,
      provider: this.data.product,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
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
      ...(this.data.status || this.data.status === 0
        ? {
            configState: this.data.status,
          }
        : {
            configStates: this.tabList.find((v) => v.value === this.curTabValue)?.configStates,
          }),
      ...(this.data.order
        ? {
            orderBy: this.data.order,
            sort: this.data.isAsc ? 'asc' : 'desc',
          }
        : {}),
    };
    this.appService.isContentLoadingSubject.next(true);
    this.api.getnewranklist(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (res.code === '0000') {
        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      }
    });
  }

  /** 列表操作 - 查看报告 */
  onViewReports() {
    this.router.navigate(['/bonus/activity-manage/NewRank/reports-list'], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId },
    });
  }

  /** 列表操作 - 导出 */
  // onExport() {}

  /** 列表/活动操作 - 新增/编辑 活动 */
  onGoCampaign(item?: NewContestListItem) {
    if (!this.subHeaderService.merchantCurrentId)
      return this.appService.showToastSubject.next({ msg: 'no select tenant' });

    if (item && item.nowTime > item.tmpEndTime)
      return this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli12.errorTips.tips20' });

    this.router.navigate([tournamentInstance.getPathTournamentStep1(item?.activityId, item?.tmpCode)], {
      queryParams: {
        tenantId: this.subHeaderService.merchantCurrentId,
        configState: item?.configState,
      },
    });
  }

  /** 活动操作 - 查看 */
  onViewCampaign() {}

  /**
   * 活动操作 - 状态变更
   * @state 1=开启,0=停止
   * @tmpCode 模板code
   * @configState 活动状态
   */
  onStateUpdateCampaign(state: number, item: NewContestListItem) {
    if (item.configState === NewContestStatusEnum.ManualStop && item.nowTime > item.tmpEndTime)
      return this.appService.showToastSubject.next({ msgLang: 'member.activity.sencli12.errorTips.tips20' });

    this.confirmModalService
      .open({
        msgLang: state ? 'luckRoulette.ifStart' : 'luckRoulette.ifEnd',
      })
      .result.then(() => {
        this.appService.isContentLoadingSubject.next(true);
        this.api
          .newrank_state_update({
            tmpConfigState: state,
            tmpCodes: [item?.tmpCode],
          })
          .subscribe((res) => {
            this.appService.isContentLoadingSubject.next(false);
            if (res?.code !== '0000') {
              return this.appService.showToastSubject.next(
                res.message ? { msg: res.message } : { msgLang: 'common.operationFailed' }
              );
            }
            this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
            this.loadData();
          });
      })
      .catch(() => {});
  }

  /** 活动操作 - 查看报表详情 */
  onViewReportsDetail(activityId: number | string, tmpCode: string) {
    this.router.navigate(['/bonus/activity-manage/NewRank/reports-detail'], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId, activityId, tmpCode },
      queryParamsHandling: 'merge',
    });
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
    this.getStatusList();
  }

  /** 筛选 - 获取状态数据 */
  getStatusList() {
    switch (this.curTabValue) {
      case 1:
        this.statusList = [
          { name: '待开始', lang: 'member.activity.sencli6.toBeStarted', value: 10 },
          { name: '进行中', lang: 'member.activity.sencli6.processing', value: 11 },
        ];
        break;
      case 2:
        this.statusList = [
          { name: '手动结束', lang: 'member.activity.sencli12.manualStop', value: 3 },
          { name: '已过期', lang: 'member.coupon.expired', value: 2 },
        ];
        break;
      case 3:
        this.statusList = [
          { name: '草稿', lang: 'member.activity.sencli12.draft', value: 0 },
          { name: '开启审核中', lang: 'member.activity.sencliCommon.startingReview', value: -1 },
          { name: '停止审核中', lang: 'member.activity.sencliCommon.stopReviewing', value: -2 },
        ];
        break;
    }
  }
}
