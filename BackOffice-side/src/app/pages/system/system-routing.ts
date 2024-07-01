import { Routes } from '@angular/router';
import { MerchantsComponent } from './merchants/merchants.component';
import { EditComponent as MerchantsEditComponent } from './merchants/edit/edit.component';
import { LogComponent } from 'src/app/pages/system/log/log.component';
import { PhoneQueryComponent } from './phone-query/phone-query.component';
import { DataStatisticsComponent } from './data-statistics/data-statistics.component';
import { StatisticsGameBetComponent } from './data-statistics/game-bet/game-bet.component';
import { StatisticsMemberBonusComponent } from './data-statistics/member-bonus/member-bonus.component';
import { StatisticsMemberFirstDepositComponent } from './data-statistics/member-first-deposit/member-first-deposit.component';
import { StatisticsUserFundsComponent } from './data-statistics/user-funds/user-funds.component';
import { StatisticsUserStatisticsComponent } from './data-statistics/user-statistics/user-statistics.component';
import { StatisticsUserBalanceComponent } from './data-statistics/user-balance/user-balance.component';
import { StatisticsAgainStatisticsComponent } from './data-statistics/again-statistics/again-statistics.component';
import { SmsComponent } from './sms/sms.component';
import { ChannelCodeComponent } from './channelCode/channelCode.component';
import { dataExportRoutes } from 'src/app/pages/system/data-export-com/data-export-routing';
import { VipRecordsRoutes } from 'src/app/pages/system/vip-records/vip-records-routing';
import { AgentTransferComponent } from 'src/app/pages/system/agent-transfer/agent-transfer.component';
import { ReportViewerRoutes } from 'src/app/pages/system/report-viewer-com/report-viewer.routing';

export const routes: Routes = [
  { path: '', redirectTo: 'merchants', pathMatch: 'full' },
  {
    path: 'merchants',
    component: MerchantsComponent,
    data: { name: '商户管理', code: '287', keep: true, lang: 'nav.merchantManagement' },
  },
  {
    path: 'merchants/edit',
    component: MerchantsEditComponent,
    data: {
      name: '新增商户',
      lang: 'breadCrumb.addMerchant',
      breadcrumbsBefore: [{ name: '商户管理', link: '/system/merchants', lang: 'nav.merchantManagement' }],
    },
  },
  {
    path: 'merchants/edit/:id',
    component: MerchantsEditComponent,
    data: {
      name: '编辑商户',
      lang: 'breadCrumb.editBusiness',
      breadcrumbsBefore: [{ name: '商户管理', link: '/system/merchants', lang: 'nav.merchantManagement' }],
    },
  },
  {
    path: 'log',
    component: LogComponent,
    data: { name: '操作日志', code: '289', lang: 'nav.operationlog' },
  },
  {
    path: 'phoneQuery',
    component: PhoneQueryComponent,
    data: { name: '手机查询', showMerchant: true, showCountry: true, code: '308', lang: 'nav.mobilePhoneQuery' },
  },
  {
    path: 'sms',
    component: SmsComponent,
    data: {
      name: '手机Sms & Email查询查询',
      showMerchant: true,
      code: '318',
      lang: 'nav.sms',
    },
  },
  {
    path: 'channelCode',
    component: ChannelCodeComponent,
    data: {
      name: '更新会员注册渠道推荐码',
      showMerchant: true,
      code: '319',
      lang: 'nav.channelCode',
    },
  },
  {
    path: 'statistics',
    component: DataStatisticsComponent,
    data: { name: '数据统计', code: '313', lang: 'nav.statistics' },
    children: [
      { path: '', redirectTo: 'user-statistics', pathMatch: 'full' },
      {
        path: 'user-statistics',
        component: StatisticsUserStatisticsComponent,
        data: { name: '用户统计表', showMerchant: true, lang: 'system.statistics.userStatistics' },
      },
      {
        path: 'member-bonus',
        component: StatisticsMemberBonusComponent,
        data: { name: '会员红利表', showMerchant: true, lang: 'system.statistics.memberBonus' },
      },
      {
        path: 'game-bet',
        component: StatisticsGameBetComponent,
        data: { name: '游戏注单表', showMerchant: true, lang: 'system.statistics.gameBet' },
      },
      {
        path: 'user-funds',
        component: StatisticsUserFundsComponent,
        data: { name: '用户资金', showMerchant: true, lang: 'system.statistics.userFunds' },
      },
      {
        path: 'member-first-deposit',
        component: StatisticsMemberFirstDepositComponent,
        data: { name: '会员首存表', showMerchant: true, lang: 'system.statistics.memberFirstDeposit' },
      },
      {
        path: 'user-balance',
        component: StatisticsUserBalanceComponent,
        data: { name: '余额结存', showMerchant: true, lang: 'system.statistics.userBalance' },
      },
      {
        path: 'again-statistics',
        component: StatisticsAgainStatisticsComponent,
        data: { name: '待重新统计', showMerchant: true, lang: 'system.statistics.againStatistics' },
      },
    ],
  },
  {
    path: 'agent-transfer',
    component: AgentTransferComponent,
    data: {
      name: '代理转移（M2）',
      showMerchant: true,
      code: '10016',
      lang: 'nav.agentTransfer',
    },
  },
  ...dataExportRoutes,
  ...VipRecordsRoutes,
  ...ReportViewerRoutes,
];
