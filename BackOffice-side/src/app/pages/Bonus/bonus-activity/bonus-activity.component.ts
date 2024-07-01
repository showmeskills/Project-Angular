import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { catchError, combineLatestWith, takeUntil, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/api/bonus.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { BalanceDetailComponent } from '../../member/detail/balance-detail/balance-detail.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf, CommonModule, KeyValuePipe } from '@angular/common';
import { HistoricalActivityEnum } from 'src/app/shared/interfaces/bonus';
import { ActivityTypeEnum } from 'src/app/shared/interfaces/activity';
import moment from 'moment';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { BonusService } from 'src/app/pages/Bonus/bonus.service';
@Component({
  selector: 'app-bonus-activity',
  templateUrl: './bonus-activity.component.html',
  styleUrls: ['./bonus-activity.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    NgFor,
    AngularSvgIconModule,
    NgIf,
    CurrencyValuePipe,
    LangPipe,
    CommonModule,
    KeyValuePipe,
    EmptyComponent,
    LoadingDirective,
    FormatMoneyPipe,
    CurrencyValuePipe,
  ],
})
export class BonusActivityComponent implements OnInit {
  constructor(
    public router: Router,
    private bonusApi: BonusApi,
    private appService: AppService,
    public subHeaderService: SubHeaderService,
    private modal: MatModal,
    private lang: LangService,
    private destroy$: DestroyService,
    public bonusService: BonusService
  ) {}

  protected readonly HistoricalActivityEnum = HistoricalActivityEnum;

  isLoading = false;

  activityStatsLoading = false;

  activityList: any = []; // 活动列表 数据
  time: Date[] = []; // 活动列表 已结束状态 时间区间
  activityPageSizes: number[] = PageSizes; // 活动列表 页大小
  activityPaginator: PaginatorState = new PaginatorState(); // 活动列表 分页
  selectedStatusItem: any = { title: 'member.activity.processing', total: 0, value: 4 }; // 活动列表 被选中的状态
  statusMenuList: any = [
    { title: 'member.activity.processing', total: 0, value: 4 },
    { title: 'member.activity.over', total: 0, value: 3 },
  ];

  /** 头部筛选时间(YYYY-DD-MM) */
  headerTime: string[] = [];

  tepActivityList: any = [
    // 活动模板 数据
    // {
    //   name: '存款笔笔送模板',
    //   title: 'member.activity.sencli1.title',
    //   detail: 'member.activity.sencli1.detail',
    //   src: './assets/images/bonus/1.svg',
    //   pathValue: '/bonus/activity-model',
    //   id: 1,
    // },
    {
      name: '存款活动',
      title: 'member.activity.sencli2.title',
      detail: 'member.activity.sencli3.detail',
      src: './assets/images/bonus/2.svg',
      pathValue: '/bonus/',
      id: 2,
    },
    {
      name: '存款额外奖励',
      title: 'breadCrumb.extraDepositBonus',
      detail: 'member.activity.sencli13.desc',
      src: './assets/images/bonus/13.svg',
      pathValue: '/bonus/',
      id: 13,
    },
    {
      name: '存款送模版（券码）',
      title: 'member.activity.sencli14.title',
      detail: 'member.activity.sencli14.desc',
      src: './assets/images/bonus/14.svg',
      pathValue: '/bonus/',
      id: 14,
    },
    {
      name: '新人任务',
      title: 'member.activity.sencli3.title',
      detail: 'member.activity.sencli3.detail',
      src: './assets/images/bonus/3.svg',
      pathValue: '/bonus/',
      id: 3,
    },
    // {
    //   name: '负盈利和反水模版',
    //   title: 'member.activity.sencli4.title',
    //   detail: 'member.activity.sencli4.detail',
    //   src: './assets/images/bonus/4.svg',
    //   pathValue: '/bonus/activity-water',
    //   id: 4,
    // },
    // {
    //   name: '连赢模版',
    //   title: 'member.activity.sencli5.title',
    //   src: './assets/images/bonus/5.svg',
    //   pathValue: '/bonus/activity-winning-streak',
    //   id: 5,
    // },
    {
      name: '竞猜活动模版',
      title: 'member.activity.sencli6.title',
      // detail: 'member.activity.sencli6.detail',
      src: './assets/images/bonus/6.svg',
      pathValue: '/bonus/activity-carve-up',
      id: 6,
    },
    // {
    //   name: 'SVIP体验券',
    //   title: 'member.activity.sencli7.title',
    //   src: './assets/images/bonus/7.svg',
    //   pathValue: '/bonus/activity-carve-up',
    //   id: 7,
    // },
    // {
    //   name: '利润分享模版',
    //   title: 'member.activity.sencli8.title',
    //   src: './assets/images/bonus/8.svg',
    //   pathValue: '/bonus/activity-carve-up',
    //   id: 8,
    // },
    {
      name: '每日竞赛模版',
      title: 'member.activity.sencli9.title',
      detail: 'member.activity.sencli9.detail',
      src: './assets/images/bonus/9.svg',
      pathValue: '/bonus/activity-carve-up',
      id: 9,
    },
    {
      name: '幸运大转盘',
      title: 'member.activity.sencli11.title',
      detail: 'member.activity.sencli11.detail',
      src: './assets/images/bonus/11.svg',
      pathValue: '/bonus/',
      id: 11,
    },
    {
      name: '新竞赛活动',
      title: 'member.activity.sencli12.title',
      detail: '',
      src: './assets/images/bonus/12.svg',
      pathValue: '/bonus/',
      id: 12,
    },
    {
      name: '登录签到活动',
      title: 'member.activity.sencli15.title',
      detail: 'member.activity.sencli15.detail',
      src: './assets/images/bonus/15.svg',
      pathValue: '/bonus/',
      id: 15,
    },
    {
      name: '专属VIP活动',
      title: 'member.activity.sencli16.title',
      detail: 'member.activity.sencli16.detail',
      src: './assets/images/bonus/16.svg',
      pathValue: '/bonus/',
      id: 16,
    },
  ];

  /** 数据概览 - 列表 */
  activityStatsList: any[] = [
    {
      name: '存款送模板',
      nameLang: 'member.activity.activityName.depositBonus',
      key: 'deposit',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '存款送模板（券码）',
      nameLang: 'member.activity.activityName.depositCouponCode',
      key: 'coupon_code_deposit',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '存款额外奖励',
      nameLang: 'member.activity.activityName.additionalRewards',
      key: 'ewallet_depbonus',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '顶级推荐人',
      nameLang: 'member.activity.activityName.topReferer',
      key: 'top_recommend',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '身份认证活动',
      nameLang: 'member.activity.activityName.identity',
      key: 'kyc',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '真人百家乐连赢活动',
      nameLang: 'member.activity.activityName.live',
      key: 'baccarat_win',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '新用户体育保险投注',
      nameLang: 'member.activity.activityName.insurance',
      key: 'sports_recharge',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '每日竞赛模板',
      nameLang: 'member.activity.activityName.dailyContest',
      key: 'rank',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    // {
    //   name: '竞猜活动模板-x',
    //   nameLang: 'member.activity.activityName.quizTemplate',
    //   key: 'guess',
    //   count: 'NaN',
    //   progress: 'NaN',
    //   times: 'NaN',
    //   data: '',
    // },
    {
      name: '免费竞猜',
      nameLang: 'member.activity.activityName.freeGuess',
      key: 'match_prediction',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '新竞赛活动',
      nameLang: 'member.activity.activityName.newRank',
      key: 'new_rank',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '救援金',
      nameLang: 'member.activity.activityName.rechargeReload',
      key: 'vip_cashback ',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: 'VIP登录',
      nameLang: 'member.activity.activityName.vipLogin',
      key: 'vip_login',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: 'VIP保级',
      nameLang: 'member.activity.activityName.vipKeep',
      key: 'vip_keep',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: 'VIP生日礼金',
      nameLang: 'member.activity.activityName.vipBirthdayBonus',
      key: 'vip_birthday',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: 'VIP升级',
      nameLang: 'member.activity.activityName.vipUpgrade',
      key: 'vip_promote',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '推荐好友佣金',
      nameLang: 'member.activity.activityName.referralFriends',
      key: 'recommend',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    // {
    //   name: '代理佣金-x',
    //   nameLang: 'member.activity.activityName.agencyCommission',
    //   key: 'commission',
    //   count: 'NaN',
    //   progress: 'NaN',
    //   times: 'NaN',
    //   data: '',
    // },
    // {
    //   name: 'CAP奖励-x',
    //   nameLang: 'member.activity.activityName.cap',
    //   key: 'commission',
    //   count: 'NaN',
    //   progress: 'NaN',
    //   times: 'NaN',
    //   data: '',
    // },
    {
      name: '交易反水',
      nameLang: 'member.activity.activityName.rebate',
      key: 'vip_transaction',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '幸运大转盘',
      nameLang: 'member.activity.activityName.luckySpin',
      key: 'turntable',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '签到活动模板',
      nameLang: 'member.activity.activityName.vipSignActivity',
      key: 'vipsignin',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    {
      name: '手动发放的优惠券',
      nameLang: 'member.activity.activityName.manual',
      key: 'voucher',
      count: 'NaN',
      progress: 'NaN',
      times: 'NaN',
      data: '',
    },
    // {
    //   name: '首存红利-x',
    //   nameLang: 'member.activity.activityName.fTDepositBonus',
    //   key: 'frist_deposit',
    //   count: 'NaN',
    //   progress: 'NaN',
    //   times: 'NaN',
    //   data: '',
    // },
    // {
    //   name: '老存款奖励-x',
    //   nameLang: 'member.activity.activityName.oldDepositBonus',
    //   key: 'vip_deposit',
    //   count: 'NaN',
    //   progress: 'NaN',
    //   times: 'NaN',
    //   data: '',
    // },
    // {
    //   name: '新人模板-x',
    //   nameLang: 'member.activity.activityName.newcomerTaskTemplate',
    //   key: 'new_user',
    //   count: 'NaN',
    //   progress: 'NaN',
    //   times: 'NaN',
    //   data: '',
    // },
  ];

  ngOnInit() {
    this.subHeaderService.merchantId$
      .pipe(
        switchMap(() =>
          this.merchantChangeLoadData$().pipe(
            combineLatestWith(this.subHeaderService.timeCurrent$.pipe(switchMap(() => this.timeChangeLoadData$())))
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  /** 商户请求流 */
  merchantChangeLoadData$() {
    this.activityPaginator.page = 1;

    return forkJoin([
      // 获取活动总数 数据
      this.getActivityCount(),
      // 获取活动列表 数据
      this.getActivityList(),
      // 数据概览 - 进行中的活动数据
      this.getActivityProgressCountData(),
    ]).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  /** 商户和时间 请求流 */
  timeChangeLoadData$() {
    // 时间初始化
    this.headerTime = this.subHeaderService.curTime.length
      ? [
          moment(this.subHeaderService.curTime[0]).format('YYYY-MM-DD'),
          moment(this.subHeaderService.curTime[1]).format('YYYY-MM-DD'),
        ]
      : [];

    return forkJoin([
      // 数据概览 - 列表数据
      this.getActivityStatsData(),
    ]).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  /** 获取活动总数 数据 */
  getActivityCount() {
    this.statusMenuList.forEach((v) => (v.total = 0));

    this.loading(true);
    return this.bonusApi.getActivityCount({ tenantId: +this.subHeaderService.merchantCurrentId }).pipe(
      map((v) => v.data),
      finalize(() => this.loading(false)),
      tap((data) => {
        if (data && data.length > 0) {
          data.forEach((v) => {
            this.statusMenuList.forEach((j) => {
              if (v.activities_status === j.value) {
                j.total = v.total;
              }
            });
            if (v.activities_status === this.selectedStatusItem.value) {
              this.selectedStatusItem.total = v.total;
            }
          });
        }
      })
    );
  }

  /** 获取活动列表 数据 */
  getActivityList() {
    const parmas = {
      tenantId: +this.subHeaderService.merchantCurrentId,
      current: 1,
      size: 999,
      activitiesStatus: this.selectedStatusItem.value,
      ...(this.time[0] ? { activitiesStartTime: toDateStamp(this.time[0]) } : {}),
      ...(this.time[1] ? { activitiesEndTime: toDateStamp(this.time[1], true) } : {}),
    };

    this.loading(true);
    return this.bonusApi.getActivityList(parmas).pipe(
      map((v) => v.data),
      finalize(() => this.loading(false)),
      tap((data) => {
        const list = data?.records || [];
        list.forEach((v) => {
          v.label = v.label?.split(',').filter((v) => v) || [];
        });
        this.activityList = list || [];
        this.activityPaginator.total = data?.total || 0;
      })
    );
  }

  /** 数据概览 - 进行中的活动数据 */
  getActivityProgressCountData() {
    return this.bonusApi.getActivityProgressCountData(+this.subHeaderService.merchantCurrentId).pipe(
      tap((res) => {
        if (!res) return;
        this.activityStatsList.forEach((v) => {
          if (typeof res[v.key] === 'number') v.progress = res[v.key];
        });
      })
    );
  }

  /** 数据概览 - 列表数据 */
  getActivityStatsData() {
    const params = {
      beginDate: this.headerTime[0],
      endDate: this.headerTime[1],
      tenantId: +this.subHeaderService.merchantCurrentId,
    };

    this.activityStatsLoading = true;
    return this.bonusApi.getactivitystats(params).pipe(
      finalize(() => (this.activityStatsLoading = false)),
      tap((res) => {
        if (!res) return;
        this.activityStatsList.forEach((v) => {
          v.data = res[v.key]?.dict || '';
          v.count = res[v.key]?.joinCount;
          v.times = res[v.key]?.joinTimes;
        });
      })
    );
  }

  // 活动列表 状态切换
  onSelectStatusMenu(item: any) {
    this.selectedStatusItem = item;
    this.activityPaginator.page = 1;
    if (item.value === 3) this.time = [];
    this.getActivityList().subscribe();
  }

  // 查看活动红利金额详情弹窗
  async openBalanceDetail(bonusActivitiesNo: string, tenantId: string) {
    const parmas = {
      tenantId,
      bonusActivitiesNo,
    };
    const releaseDetail = await this.lang.getOne('bonus.activity.releaseDetail');
    this.loading(true);
    this.bonusApi.getActivityAmt(parmas).subscribe((res) => {
      this.loading(false);
      if (!res || !res.data?.length)
        return this.appService.showToastSubject.next({ msgLang: 'bonus.activity.noReleasedInfo' });
      const modal = this.modal.open(BalanceDetailComponent, { width: '500px' });
      modal.componentInstance['title'] = releaseDetail;
      modal.componentInstance['list'] = res.data.map((item) => ({
        code: item.moneyType,
        value: item.money,
      }));
    });
  }

  // 跳转 活动列表的报名详情
  async goEdit(item: any) {
    const title = await this.lang.getOne(this.bonusService.activityLang(item.bonusActivitiesNo));
    this.router.navigate([
      '/bonus/activity-manage/activity-edit',
      {
        type: item.activitiesType,
        id: item.bonusActivitiesNo,
        title,
      },
    ]);
  }

  // 跳转 活动列表
  goActivityEdit(item: any) {
    switch (item.id) {
      case 2:
        this.router.navigate(['/bonus/activity-manage/Deposit']);
        break;
      case 3:
        this.router.navigate(['/bonus/activity-manage/NewUser']);
        break;
      case 6:
        this.router.navigate(['/bonus/activity-manage/quiz']);
        break;
      case 11:
        this.router.navigate(['/bonus/activity-manage/Turntable']);
        break;
      case 12:
        this.router.navigate(['/bonus/activity-manage/NewRank']);
        break;
      case 13:
        this.router.navigate(['/bonus/activity-manage/EWalletDepBonus']);
        break;
      case 14:
        this.router.navigate(['/bonus/activity-manage', ActivityTypeEnum[ActivityTypeEnum.CouponCodeDeposit]]);
        break;
      case 15:
        this.router.navigate(['/bonus/activity-manage', ActivityTypeEnum[ActivityTypeEnum.VipSignIn]]);
        break;
      case 16:
        this.router.navigate(['/bonus/activity-manage', ActivityTypeEnum[ActivityTypeEnum.VipExclusive]]);
        break;
      default:
        this.router.navigate(['/bonus/activity-manage/activity-list'], {
          queryParams: { activityId: item.id, tenantId: +this.subHeaderService.merchantCurrentId },
        });
    }
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
