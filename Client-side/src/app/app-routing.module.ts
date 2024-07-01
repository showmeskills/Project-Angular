import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BasicLayoutComponent } from './layouts/basic-layout/basic-layout.component';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { AuthGuard } from './shared/service/auth.guard';
import { LoginGuard } from './shared/service/login.guard';

const routes: Routes = [
  //默认跳转首页
  { path: '', redirectTo: window.languageCode, pathMatch: 'full' },
  { path: '404', component: PageNotFoundComponent },
  {
    path: ':languageCode',
    component: BasicLayoutComponent,
    children: [
      //首页
      {
        path: '',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
      },
      // 活动单页
      { path: 'activity', loadChildren: () => import('./pages/activity/activity.module').then(m => m.ActivityModule) },
      //用户layout
      {
        path: '',
        component: UserLayoutComponent,
        children: [
          //用户中心
          {
            path: 'userCenter',
            canActivateChild: [AuthGuard],
            loadChildren: () => import('./pages/user-center/user-center.module').then(m => m.UserCenterModule),
          },
          //资产管理
          {
            path: 'wallet',
            canActivateChild: [AuthGuard],
            loadChildren: () => import('./pages/user-asset/user-assets.module').then(m => m.UserAssetsModule),
          },
        ],
      },
      //交易记录
      {
        path: 'transaction-record',
        canActivateChild: [AuthGuard],
        children: [
          { path: '', redirectTo: 'deal', pathMatch: 'full' },
          {
            path: 'deal',
            loadChildren: () => import('./pages/record/deal-record/deal-record.module').then(m => m.DealRecordModule),
          },
        ],
      },
      //登录
      {
        path: 'login',
        canActivateChild: [LoginGuard],
        loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
      },
      //注册
      {
        path: 'register',
        canActivateChild: [LoginGuard],
        loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterModule),
      },
      //忘记密码
      {
        path: 'forget-password',
        canActivateChild: [LoginGuard],
        loadChildren: () => import('./pages/password/password.module').then(m => m.PasswordModule),
      },
      //手机验证器
      {
        path: 'verification',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./pages/verification/verification.module').then(m => m.VerificationModule),
      },
      //充值
      {
        path: 'deposit',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./pages/top-up/top-up.module').then(m => m.TopUpModule),
      },
      //提现
      {
        path: 'withdrawal',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./pages/withdraw/withdraw.module').then(m => m.WithdrawModule),
      },
      //兑换
      {
        path: 'exChange',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./pages/exchange/exchange.module').then(m => m.ExchangeModule),
      },
      //小游戏
      {
        path: 'casino',
        loadChildren: () => import('./pages/minigame/minigame.module').then(m => m.MinigameModule),
      },
      //第三方全窗口
      {
        path: 'play',
        loadChildren: () => import('./pages/full-play/full-play.module').then(m => m.FullPlayModule),
      },
      //ob彩票
      {
        path: 'lottery',
        loadChildren: () => import('./pages/obLottery/obLottery.module').then(m => m.ObLotteryModule),
      },
      //维护
      { path: 'maintain', loadChildren: () => import('./pages/maintain/maintain.module').then(m => m.MaintainModule) },
      //原创游戏
      { path: 'original', loadChildren: () => import('./orignal/orignal.module').then(m => m.OrignalModule) },
      //红利和优惠 and vip
      {
        path: 'promotions',
        loadChildren: () => import('./pages/dividend-vip/dividend-vip.module').then(m => m.DividendVipModule),
      },
      //卡劵中心
      {
        path: 'coupon',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./pages/card-center/card-center.module').then(m => m.CardCenterModule),
      },
      //奖励明细模块 web and h5 推荐好友
      { path: 'referral', loadChildren: () => import('./pages/friend/friend.module').then(m => m.FriendModule) },
      //通知中心
      {
        path: 'notification-center',
        canActivateChild: [AuthGuard],
        loadChildren: () =>
          import('./pages/notification-center/notification-center.module').then(m => m.NotificationCenterModule),
      },
      //偏好设置
      {
        path: 'settings',
        canActivateChild: [AuthGuard],
        loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule),
      },
      //账户找回
      {
        path: 'retrieve-account',
        canActivateChild: [AuthGuard],
        loadChildren: () =>
          import('./pages/retrieve-account/retrieve-account.module').then(m => m.RetrieveAccountModule),
      },
      // 帮助中心
      {
        path: 'help-center',
        loadChildren: () => import('./pages/help-center/help-center.module').then(m => m.HelpCenterModule),
      },
      // 关于我们
      { path: 'about-us', loadChildren: () => import('./pages/about-us/about-us.module').then(m => m.AboutUsModule) },
      // 意见反馈
      { path: 'feedback', loadChildren: () => import('./pages/feedback/feedback.module').then(m => m.FeedbackModule) },
      // 落地页
      {
        path: 'landing-page',
        loadChildren: () => import('./pages/landing-page/landing-page.module').then(m => m.LandingPageModule),
      },
      // 节制博彩首页
      {
        path: 'responsible-gambling',
        loadChildren: () =>
          import('./pages/responsible-gambling/responsible-gambling.module').then(m => m.ResponsibleGambling),
      },
      // 新风控表格
      // {
      //   path: 'risk-control',
      //   canActivateChild: [AuthGuard, RiskControlGuard],
      //   loadChildren: () => import('./pages/risk-control/risk-control.module').then(m => m.RiskControlModule),
      // },
      // 体育首页
      {
        path: 'sports',
        loadChildren: () => import('./pages/sports/sports.module').then(m => m.SportsModule),
      },
    ],
  },
  // 404页面
  { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
