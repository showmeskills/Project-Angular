import { Routes } from '@angular/router';
import { DashboardComponent } from 'src/app/pages/proxy/dashboard/dashboard.component';
import { ProxyListComponent } from 'src/app/pages/proxy/proxy-list/proxy-list.component';
import { CommissionListComponent } from 'src/app/pages/proxy/commission-list/commission-list.component';
import { CommissionDetailComponent } from 'src/app/pages/proxy/commission-list/commission-detail/commission-detail.component';
import { BudgetComponent } from 'src/app/pages/proxy/budget/budget.component';
import { BudgetBossComponent } from 'src/app/pages/proxy/budget/budget-boss/budget-boss.component';
import { ReviewListComponent } from 'src/app/pages/proxy/review-list/review-list.component';
import { ReviewDetailComponent } from 'src/app/pages/proxy/review-list/review-detail/review-detail.component';
import { CommissionMonthlyBillComponent } from 'src/app/pages/proxy/commission-list/commission-monthly-bill/commission-monthly-bill.component';
import { RecommendFriendsComponent } from './recommend-friends/recommend-friends.component';

export const routes: Routes = [
  { path: '', redirectTo: 'proxy-dashboard', pathMatch: 'full' },
  {
    path: 'proxy-dashboard',
    component: DashboardComponent,
    data: { name: '代理仪表盘', showMerchant: true, code: '218', lang: 'breadCrumb.agentDashboard' },
  },
  {
    path: 'list',
    component: ProxyListComponent,
    data: { name: '代理列表', showMerchant: true, code: '219', lang: 'nav.proxyList' },
  },
  {
    path: 'commission',
    component: CommissionListComponent,
    data: { name: '佣金审核', showMerchant: true, code: '221', lang: 'breadCrumb.commReview', keep: true },
  },
  {
    path: 'commission/bill/:id',
    component: CommissionMonthlyBillComponent,
    data: {
      name: '代理月结账单',
      lang: 'breadCrumb.commissionBill',
      breadcrumbsBefore: [{ name: '佣金审核列表', link: '/proxy/commission', lang: 'nav.commissionReviewList' }],
    },
  },
  {
    path: 'commission/:id',
    component: CommissionDetailComponent,
    data: {
      name: '代理申请详情',
      lang: 'breadCrumb.commissionDetail',
      breadcrumbsBefore: [{ name: '佣金审核列表', link: '/proxy/commission', lang: 'nav.commissionReviewList' }],
    },
  },
  { path: 'budget', component: BudgetComponent, data: { name: '预算管理', lang: 'nav.budgetManagement' } },
  {
    path: 'budget-boss',
    component: BudgetBossComponent,
    data: { name: '预算管理', showMerchant: true, lang: 'nav.budgetManagement' },
  },
  {
    path: 'review',
    component: ReviewListComponent,
    data: { name: '代理审核列表', showMerchant: true, code: '220', lang: 'breadCrumb.proxyAuditList', keep: true },
  },
  {
    path: 'review/:id',
    component: ReviewDetailComponent,
    data: {
      name: '代理审核详情',
      showMerchant: true,
      lang: 'breadCrumb.commissionDetail',
      breadcrumbsBefore: [{ name: '代理审核列表', link: '/proxy/review', lang: 'breadCrumb.proxyAuditList' }],
    },
  },
  {
    path: 'recommend-friends',
    component: RecommendFriendsComponent,
    data: {
      name: '推荐好友',
      code: '315',
      lang: 'breadCrumb.recommendFriends',
      showMerchant: true,
      showTime: true,
    },
  },
];
