import { Routes } from '@angular/router';
import { BonusActivityComponent } from 'src/app/pages/Bonus/bonus-activity/bonus-activity.component';
import { EditComponent } from 'src/app/pages/Bonus/bonus-activity/edit/edit.component';
import { GiveOutComponent } from 'src/app/pages/Bonus/give-out/give-out.component';
import { UploadImgComponent } from 'src/app/pages/Bonus/upload-img/upload-img.component';
import { CouponManageComponent } from 'src/app/pages/Bonus/coupon-manage/coupon-manage.component';
import { RecordComponent } from 'src/app/pages/Bonus/coupon-manage/record/record.component';
import { DepositComponent as ActivityDepositComponent } from 'src/app/pages/Bonus/activity-template/deposit/deposit.component';
import {
  DepositEditComponent,
  DepositEditViewComponent,
} from 'src/app/pages/Bonus/activity-template/deposit/edit/edit.component';
import { DepositQueryComponent } from 'src/app/pages/Bonus/activity-template/deposit/query/query.component';
import { SvipExperienceComponent as ActivitySvipExperienceComponent } from 'src/app/pages/Bonus/activity-template/svip-experience/svip-experience.component';
import { NewcomerTaskComponent as ActivityNewcomerTaskComponent } from 'src/app/pages/Bonus/activity-template/newcomer-task/newcomer-task.component';
import {
  NewcomerTaskEditComponent,
  NewcomerTaskEditViewComponent,
} from 'src/app/pages/Bonus/activity-template/newcomer-task/edit/edit.component';
import { NewcomerTaskQueryComponent } from 'src/app/pages/Bonus/activity-template/newcomer-task/query/query.component';
import { CompetitionComponent as ActivityCompetitionComponent } from 'src/app/pages/Bonus/activity-template/competition/competition.component';
import { ProfitSharingComponent as ActivityProfitSharingComponent } from 'src/app/pages/Bonus/activity-template/profit-sharing/profit-sharing.component';
import { ListComponent as ActivityListComponent } from 'src/app/pages/Bonus/activity-template/list/list.component';
import { EditComponent as ActivityListEditComponent } from 'src/app/pages/Bonus/activity-template/list/edit/edit.component';
import { RankListComponent as ActivityListEditRankListComponent } from 'src/app/pages/Bonus/activity-template/list/edit/rank-list/rank-list.component';
import { QuizComponent } from 'src/app/pages/Bonus/activity-template/quiz/quiz.component';
import {
  QuizActivityComponent,
  QuizActivityViewComponent,
} from 'src/app/pages/Bonus/activity-template/quiz/activity/quiz-activity.component';
import { DetailsComponent } from 'src/app/pages/Bonus/activity-template/quiz/details/details.component';
import { RankListComponent } from 'src/app/pages/Bonus/activity-template/quiz/rank-list/rank-list.component';
import { PrizeManageComponent } from 'src/app/pages/Bonus/prize-manage/prize-manage.component';
import { PrizeManageQueryComponent } from 'src/app/pages/Bonus/prize-manage/query/query.component';
import { PrizeEditComponent } from 'src/app/pages/Bonus/prize-manage/edit/edit.component';
import { ActivityTypeEnum } from 'src/app/shared/interfaces/activity';
import { LuckyRouletteComponent } from 'src/app/pages/Bonus/activity-template/lucky-roulette/lucky-roulette.component';
import {
  EditViewComponent,
  LuckyRouletteEditComponent,
} from 'src/app/pages/Bonus/activity-template/lucky-roulette/lucky-roulette-edit/lucky-roulette-edit.component';
import { DrawRecordComponent } from 'src/app/pages/Bonus/activity-template/lucky-roulette/draw-record/draw-record.component';
import { ActivityRoute } from 'src/app/pages/Bonus/bonus.service';
import { DistributionRecordsComponent } from 'src/app/pages/Bonus/coupon-manage/distribution-records/distribution-records.component';
import { NonStickyBonusComponent } from 'src/app/pages/Bonus/prize-manage/non-sticky-bonus/non-sticky-bonus.component';
import { TournamentComponent } from 'src/app/pages/Bonus/activity-template/tournament/tournament.component';
import { TournamentQueryComponent } from 'src/app/pages/Bonus/activity-template/tournament/query/query.component';
import { TournamentDetailComponent } from 'src/app/pages/Bonus/activity-template/tournament/detail/detail.component';
import { TournamentEditComponent } from 'src/app/pages/Bonus/activity-template/tournament/step/activity/activity.component';
import { TournamentEditViewComponent } from 'src/app/pages/Bonus/activity-template/tournament/step/activity/activity.component';
import { ExtraRewardComponent } from 'src/app/pages/Bonus/activity-template/extra-reward/extra-reward.component';
import {
  ExtraRewardEditComponent,
  ExtraRewardEditViewComponent,
} from 'src/app/pages/Bonus/activity-template/extra-reward/extra-reward-edit/extra-reward-edit.component';
import { ExtraRewardRecordComponent } from 'src/app/pages/Bonus/activity-template/extra-reward/extra-reward-record/extra-reward-record.component';
import { DepositCodeComponent } from 'src/app/pages/Bonus/activity-template/deposit-code/deposit-code.component';
import {
  DepositCodeEditComponent,
  DepositCodeEditViewComponent,
} from 'src/app/pages/Bonus/activity-template/deposit-code/edit/edit.component';
import { DepositCodeQueryComponent } from 'src/app/pages/Bonus/activity-template/deposit-code/query/query.component';
import {
  LoginCheckInEditComponent,
  LoginCheckInEditViewComponent,
} from 'src/app/pages/Bonus/activity-template/login-check-in/edit/edit.component';
import { LoginCheckInComponent } from 'src/app/pages/Bonus/activity-template/login-check-in/login-check-in.component';
import { LoginCheckInQueryComponent } from 'src/app/pages/Bonus/activity-template/login-check-in/query/query.component';
import { FreeSpinQueryComponent } from 'src/app/pages/Bonus/prize-manage/free-spin-query/free-spin-query.component';
import { ExclusiveVipComponent } from 'src/app/pages/Bonus/activity-template/exclusive-vip/exclusive-vip.component';
import {
  ExclusiveVipEditComponent,
  ExclusiveVipEditViewComponent,
} from 'src/app/pages/Bonus/activity-template/exclusive-vip/edit/edit.component';
import { ExclusiveVipQueryComponent } from 'src/app/pages/Bonus/activity-template/exclusive-vip/query/query.component';
import { ExclusiveVipReviewComponent } from 'src/app/pages/Bonus/activity-template/exclusive-vip/review/review.component';

/**
 * 额外奖励路由 Extra Reward Bonus
 */
export const extraRewardInstance = new ActivityRoute(
  ActivityTypeEnum.EWalletDepBonus,
  ExtraRewardComponent,
  'member.activity.sencli13.title'
)
  .appendStep3(ExtraRewardEditComponent, ExtraRewardEditViewComponent) // 存款活动 - 步骤3
  .appendRoute('receive-list/:id', ExtraRewardRecordComponent, {
    lang: 'breadCrumb.depositQuery',
    // showMerchant: true,
  }); // 额外奖励 - 领取名单

/**
 * 存款券码
 */
export const depositCodeInstance = new ActivityRoute(
  ActivityTypeEnum.CouponCodeDeposit,
  DepositCodeComponent,
  'member.activity.sencli14.title'
)
  .appendStep3(DepositCodeEditComponent, DepositCodeEditViewComponent) // 存款活动 - 步骤3
  .appendRoute('receive-list/:id', DepositCodeQueryComponent, {
    lang: 'breadCrumb.depositQuery',
    // showMerchant: true,
  }); // 额外奖励 - 领取名单

/**
 * 幸运大转盘路由
 */
export const luckyRouletteInstance = new ActivityRoute(
  ActivityTypeEnum.Turntable,
  LuckyRouletteComponent,
  'member.activity.sencli11.title'
)
  .appendStep3(LuckyRouletteEditComponent, EditViewComponent) // 大转盘 - 步骤3
  .appendRoute('draw-records/:id', DrawRecordComponent, {
    lang: 'breadCrumb.luckSpinDrawRecoeds',
    // showMerchant: true,
  }); // 大转盘 - 抽奖记录

/**
 * 存款活动路由
 */
export const depositActivityInstance = new ActivityRoute(
  ActivityTypeEnum.Deposit,
  ActivityDepositComponent,
  'member.activity.sencli2.title'
)
  .appendStep3(DepositEditComponent, DepositEditViewComponent) // 存款活动 - 步骤3
  .appendRoute('receive-list/:id', DepositQueryComponent, {
    lang: 'breadCrumb.depositQuery',
    // showMerchant: true,
  }); // 存款活动 - 领取名单

/**
 * 新人任务路由
 */
export const newcomerTaskInstance = new ActivityRoute(
  ActivityTypeEnum.NewUser,
  ActivityNewcomerTaskComponent,
  'member.activity.sencli3.title'
)
  .appendStep3(NewcomerTaskEditComponent, NewcomerTaskEditViewComponent) // 新人任务 - 步骤3
  .appendRoute('receive-list/:id', NewcomerTaskQueryComponent, {
    lang: 'breadCrumb.depositQuery',
    showMerchant: true,
  }); // 新人任务 - 领取名单

/**
 * 新竞赛活动路由
 */
export const tournamentInstance = new ActivityRoute(
  ActivityTypeEnum.NewRank,
  TournamentComponent,
  'member.activity.sencli12.title'
)
  .appendStep3(TournamentEditComponent, TournamentEditViewComponent) // 步骤3
  .appendRoute('reports-list', TournamentQueryComponent, {
    lang: 'member.activity.sencli12.reportsList', // 报表列表
  })
  .appendRoute('reports-detail', TournamentDetailComponent, {
    lang: 'member.activity.sencli12.viewReportsDetail',
  }); // 报表详情

/**
 * 登录签到路由
 */
export const LoginCheckInstance = new ActivityRoute(
  ActivityTypeEnum.VipSignIn,
  LoginCheckInComponent,
  'member.activity.sencli15.title'
)
  .appendStep3(LoginCheckInEditComponent, LoginCheckInEditViewComponent) // 步骤3
  .appendRoute('receive-list/:id', LoginCheckInQueryComponent, {
    lang: 'breadCrumb.depositQuery',
  }); // 领取名单

export const routes: Routes = [
  ...depositCodeInstance.getRoutes(),
  ...extraRewardInstance.getRoutes(),
  ...luckyRouletteInstance.getRoutes(),
  ...depositActivityInstance.getRoutes(),
  ...newcomerTaskInstance.getRoutes(),
  ...tournamentInstance.getRoutes(),
  ...LoginCheckInstance.getRoutes(),
  { path: '', redirectTo: '/bonus/activity-manage', pathMatch: 'full' },
  {
    path: 'activity-manage',
    component: BonusActivityComponent,
    data: { name: '活动管理', showMerchant: true, showTime: true, lang: 'nav.eventManagement' },
  },
  {
    path: 'activity-manage/activity-edit',
    component: EditComponent,
    data: {
      name: '活动详情',
      showMerchant: true,
      lang: 'breadCrumb.activityDetails',
      breadcrumbsBefore: [{ name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' }],
    },
  },
  {
    path: 'give-out',
    component: GiveOutComponent,
    data: { name: '发放查询', showMerchant: true, code: '206', lang: 'nav.releaseEnquiry' },
  },
  {
    path: 'upload-img',
    component: UploadImgComponent,
    data: { name: '红利图片上传', code: '296', lang: 'nav.bonusImageUpload' },
  },
  // 红利活动 - 活动列表
  {
    path: 'activity-manage/activity-list',
    component: ActivityListComponent,
    data: {
      name: '活动列表',
      lang: 'breadCrumb.eventsList',
      breadcrumbsBefore: [{ name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' }],
    },
  },
  {
    path: 'activity-manage/activity-list/save',
    component: ActivityDepositComponent,
    data: {
      name: '存款活动列表',
      lang: 'breadCrumb.activityListSave',
      showMerchant: true,
      breadcrumbsBefore: [{ name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' }],
    },
  },
  {
    path: 'activity-manage/activity-list/edit',
    component: ActivityListEditComponent,
    data: {
      name: '活动交易列表',
      lang: 'breadCrumb.listActiveTrades',
    },
  },
  {
    path: 'activity-manage/activity-list/edit/rank-list',
    component: ActivityListEditRankListComponent,
    data: {
      name: '交易排名列表',
      lang: 'breadCrumb.listActiveMembers',
    },
  },
  // 红利活动 - 新模板
  {
    path: 'activity-manage/activity-deposit',
    component: ActivityDepositComponent,
    data: {
      name: '存款红利',
      lang: 'breadCrumb.depositBonus',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        { name: '活动列表', link: '/bonus/activity-manage/activity-list', lang: 'breadCrumb.eventsList' },
      ],
    },
  },
  {
    path: 'activity-manage/activity-svip-experience',
    component: ActivitySvipExperienceComponent,
    data: {
      name: 'SVIP 体验卷',
      lang: 'breadCrumb.svipExperienceVolume',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        { name: '活动列表', link: '/bonus/activity-manage/activity-list', lang: 'breadCrumb.eventsList' },
      ],
    },
  },
  {
    path: 'activity-manage/activity-competition',
    component: ActivityCompetitionComponent,
    data: {
      name: '竞赛活动',
      lang: 'breadCrumb.competition',
    },
  },
  {
    path: 'activity-manage/activity-profit-sharing',
    component: ActivityProfitSharingComponent,
    data: {
      name: '利润分享',
      lang: 'breadCrumb.profitSharing',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        { name: '活动列表', link: '/bonus/activity-manage/activity-list', lang: 'breadCrumb.eventsList' },
      ],
    },
  },
  // 优惠券管理
  {
    path: 'coupon-manage',
    component: CouponManageComponent,
    data: { name: '优惠券管理', showMerchant: true, code: '307', lang: 'nav.couponManagement' },
  },
  // 优惠券发放记录
  {
    path: 'coupon-manage/distribution-record/:tenantId/:id',
    component: DistributionRecordsComponent,
    data: {
      name: '优惠券发放记录',
      lang: 'nav.couponDistributionRecords',
      breadcrumbsBefore: [{ name: '优惠券管理', link: '/bonus/coupon-manage', lang: 'nav.couponManagement' }],
    },
  },
  {
    path: 'coupon-manage/record',
    component: RecordComponent,
    data: {
      name: '使用记录',
      lang: 'breadCrumb.usageRecord',
      showMerchant: true,
      breadcrumbsBefore: [{ name: '优惠券管理', link: '/bonus/coupon-manage', lang: 'nav.couponManagement' }],
    },
  },
  {
    path: 'coupon-manage/nonStickyBonus',
    component: NonStickyBonusComponent,
    data: {
      name: '非粘性奖金奖品发放',
      lang: 'breadCrumb.nonStickyPrize',
      breadcrumbsBefore: [{ name: '优惠券管理', link: '/bonus/coupon-manage', lang: 'nav.couponManagement' }],
    },
  },
  {
    path: 'coupon-manage/free-spin-query',
    component: FreeSpinQueryComponent,
    data: {
      name: '免费选择奖品发放',
      lang: 'breadCrumb.freeSpinPrize',
      breadcrumbsBefore: [{ name: '优惠券管理', link: '/bonus/coupon-manage', lang: 'nav.couponManagement' }],
    },
  },

  /*****************************************************************************
   *                          红利活动 - 竞猜活动模板
   ****************************************************************************/
  {
    path: 'activity-manage/quiz',
    component: QuizComponent,
    // showMerchant是否显示商户
    data: {
      name: '竞猜活动列表',
      link: '/bonus/activity-manage/quiz',
      lang: 'breadCrumb.guessActivityList',
      showMerchant: true,
      breadcrumbsBefore: [{ name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' }],
    },
  },
  {
    path: 'activity-manage/quiz-active',
    component: QuizActivityComponent,
    data: {
      name: '新增竞猜模版',
      lang: 'breadCrumb.addQuiz',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        { name: '活动列表', link: '/bonus/activity-manage/quiz', lang: 'breadCrumb.eventsList' },
      ],
    },
  },
  {
    path: 'activity-manage/quiz-active/:id',
    component: QuizActivityComponent,
    data: {
      name: '编辑竞猜模版',
      lang: 'breadCrumb.quiz',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        { name: '活动列表', link: '/bonus/activity-manage/quiz', lang: 'breadCrumb.eventsList' },
      ],
    },
  },
  {
    path: 'activity-manage/quiz-active-view/:id',
    component: QuizActivityViewComponent,
    data: {
      name: '查看竞猜模版',
      lang: 'breadCrumb.quiz',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        { name: '活动列表', link: '/bonus/activity-manage/quiz', lang: 'breadCrumb.eventsList' },
      ],
    },
  },
  {
    path: 'activity-manage/activity-list/Details',
    component: DetailsComponent,
    data: {
      name: '活动交易列表',
      lang: 'breadCrumb.listActiveTrades',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        { name: '活动列表', link: '/bonus/activity-manage/quiz', lang: 'breadCrumb.eventsList' },
      ],
    },
  },
  {
    path: 'activity-manage/activity-list/Details/rank-list/:id',
    component: RankListComponent,
    data: {
      name: '交易排名列表',
      lang: 'breadCrumb.listActiveMembers',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        { name: '活动列表', link: '/bonus/activity-manage/quiz', lang: 'breadCrumb.eventsList' },
        {
          name: '活动交易列表',
          link: '/bonus/activity-manage/activity-list/Details',
          lang: 'breadCrumb.listActiveTrades',
        },
      ],
    },
  },

  /*****************************************************************************
   *                          红利活动 - 专属VIP活动模板
   ****************************************************************************/
  // 活动列表
  {
    path: `activity-manage/${ActivityTypeEnum[ActivityTypeEnum.VipExclusive]}`,
    component: ExclusiveVipComponent,
    data: {
      name: '专属VIP活动',
      lang: 'member.activity.sencli16.title',
      showMerchant: true,
      breadcrumbsBefore: [{ name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' }],
    },
  },
  // 活动列表 - 发券记录
  {
    path: `activity-manage/${ActivityTypeEnum[ActivityTypeEnum.VipExclusive]}/issuance-record/:id`,
    component: ExclusiveVipQueryComponent,
    data: {
      name: '发券记录',
      lang: 'member.activity.sencli16.issuanceRecord',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        {
          name: '专属VIP活动',
          link: `/bonus/activity-manage/${ActivityTypeEnum[ActivityTypeEnum.VipExclusive]}`,
          lang: 'member.activity.sencli16.title',
        },
      ],
    },
  },
  // 活动列表 - 审核列表
  {
    path: `activity-manage/${ActivityTypeEnum[ActivityTypeEnum.VipExclusive]}/review-list/:id`,
    component: ExclusiveVipReviewComponent,
    data: {
      name: '审核列表',
      lang: 'member.activity.sencli16.reviewList',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        {
          name: '专属VIP活动',
          link: `/bonus/activity-manage/${ActivityTypeEnum[ActivityTypeEnum.VipExclusive]}`,
          lang: 'member.activity.sencli16.title',
        },
      ],
    },
  },
  // 活动列表 - 活动编辑
  {
    path: `activity-manage/${ActivityTypeEnum[ActivityTypeEnum.VipExclusive]}/activity`,
    component: ExclusiveVipEditComponent,
    data: {
      name: '活动编辑',
      lang: 'luckRoulette.eventEdit',
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        {
          name: '专属VIP活动',
          link: `/bonus/activity-manage/${ActivityTypeEnum[ActivityTypeEnum.VipExclusive]}`,
          lang: 'member.activity.sencli16.title',
        },
      ],
    },
  },
  // 活动列表 - 活动查看
  {
    path: `activity-manage/${ActivityTypeEnum[ActivityTypeEnum.VipExclusive]}/activity-view`,
    component: ExclusiveVipEditViewComponent,
    data: {
      name: '活动编辑',
      lang: 'luckRoulette.eventEditTemp',
      view: true,
      breadcrumbsBefore: [
        { name: '活动管理', link: '/bonus/activity-manage', lang: 'nav.eventManagement' },
        {
          name: '专属VIP活动',
          link: `/bonus/activity-manage/${ActivityTypeEnum[ActivityTypeEnum.VipExclusive]}`,
          lang: 'member.activity.sencli16.title',
        },
      ],
    },
  },

  /*****************************************************************************
   *                                奖品管理
   ****************************************************************************/
  {
    path: 'prize-manage',
    component: PrizeManageComponent,
    data: {
      name: '奖品管理',
      code: '314',
      lang: 'breadCrumb.prizeManage',
      showMerchant: true,
      keep: true,
    },
  },
  {
    path: 'prize-manage/edit',
    component: PrizeEditComponent,
    data: {
      name: '奖品配置',
      lang: 'breadCrumb.prizeManageEdit',
      breadcrumbsBefore: [{ name: '奖品管理', link: '/bonus/prize-manage', lang: 'breadCrumb.prizeManage' }],
    },
  },
  {
    path: 'prize-manage/query',
    component: PrizeManageQueryComponent,
    data: {
      name: '奖品发放',
      lang: 'breadCrumb.prizeManageQuery',
      breadcrumbsBefore: [{ name: '奖品管理', link: '/bonus/prize-manage', lang: 'breadCrumb.prizeManage' }],
    },
  },
  {
    path: 'prize-manage/nonStickyBonus',
    component: NonStickyBonusComponent,
    data: {
      name: '非粘性奖金奖品发放',
      lang: 'breadCrumb.nonStickyPrize',
      breadcrumbsBefore: [{ name: '奖品管理', link: '/bonus/prize-manage', lang: 'breadCrumb.prizeManage' }],
    },
  },
  {
    path: 'prize-manage/free-spin-query',
    component: FreeSpinQueryComponent,
    data: {
      name: '免费选择奖品发放',
      lang: 'breadCrumb.freeSpinPrize',
      breadcrumbsBefore: [{ name: '奖品管理', link: '/bonus/prize-manage', lang: 'breadCrumb.prizeManage' }],
    },
  },
];
