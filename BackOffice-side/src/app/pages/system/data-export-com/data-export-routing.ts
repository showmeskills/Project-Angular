import { Routes } from '@angular/router';
import { DataExportComComponent } from 'src/app/pages/system/data-export-com/data-export-com.component';
import { MarketDataComponent } from 'src/app/pages/system/data-export-com/market-data/market-data.component';
import { VipDataComponent } from 'src/app/pages/system/data-export-com/vip-data/vip-data.component';
import { MemberBalanceComponent } from 'src/app/pages/system/data-export-com/member-balance/member-balance.component';
import { ActiveUserComponent } from 'src/app/pages/system/data-export-com/active-user/active-user.component';
import { FirstDepositComponent } from 'src/app/pages/system/data-export-com/first-deposit/first-deposit.component';
import { GameTopComponent } from 'src/app/pages/system/data-export-com/game-top/game-top.component';
import { BankDataComponent } from 'src/app/pages/system/data-export-com/bank-data/bank-data.component';
import { ProviderggrComponent } from 'src/app/pages/system/data-export-com/providerggr/providerggr.component';
import { ProxyDataComponent } from 'src/app/pages/system/data-export-com/proxy-data/proxy-data.component';
import { BonusActivityComponent } from 'src/app/pages/system/data-export-com/bonus-activity/bonus-activity.component';
import { DailyDataComponent } from './daily-data/daily-data.component';
import { PlayerBonusBreakdown } from './player-bonus-breakdown/player-bonus-breakdown.component';
import { DailyStatisticsDateComponent } from 'src/app/pages/system/data-export-com/daily-statistics-data/daily-statistics-data.component';
import { PspDepositComponent } from './psp-deposit/psp-deposit.component';
import { DataExportDefaultComponent } from 'src/app/pages/system/data-export-com/data-export-default.component';

// import { LogsComponent } from 'src/app/pages/system/data-export-com/logs/logs.component';

// 市场数据、VIP数据、提款日志
export let dataExportRoutesTab: Routes = [
  {
    path: 'market',
    component: MarketDataComponent,
    data: { name: '市场数据', lang: 'system.export.market', showMerchant: true },
  },
  {
    path: 'vip',
    component: VipDataComponent,
    data: { name: 'VIP数据', lang: 'system.export.vip', showMerchant: true },
  },
  {
    path: 'memberBalance',
    component: MemberBalanceComponent,
    data: { name: '会员余额', lang: 'system.export.memberBalance', showMerchant: true },
  },
  {
    path: 'activeUser',
    component: ActiveUserComponent,
    data: { name: '活跃用户', lang: 'system.export.activeUser', showMerchant: true },
  },
  {
    path: 'firstDeposit',
    component: FirstDepositComponent,
    data: { name: '首存数据', lang: 'system.export.firstDeposit', showMerchant: true },
  },
  {
    path: 'gameTop',
    component: GameTopComponent,
    data: { name: '游戏排行100', lang: 'system.export.gameTop', showMerchant: true },
  },
  {
    path: 'bank',
    component: BankDataComponent,
    data: { name: '银行卡新增数据', lang: 'system.export.bank', showMerchant: true },
  },
  {
    path: 'providerggr',
    component: ProviderggrComponent,
    data: { name: '游戏厂商GGR', lang: 'system.export.providerggr', showMerchant: true },
  },
  {
    path: 'proxyData',
    component: ProxyDataComponent,
    data: { name: '代理月佣金数据', lang: 'system.export.proxy', showMerchant: true },
  },
  {
    path: 'bonusActivity',
    component: BonusActivityComponent,
    data: { name: '红利报表', lang: 'system.export.bonusActivity', showMerchant: true },
  },
  {
    path: 'dailyStatisticsDate',
    component: DailyStatisticsDateComponent,
    data: { name: '每日统计数据 ', lang: 'system.export.dailyStatisticsDate', showMerchant: true },
  },
  {
    path: 'dailyData',
    component: DailyDataComponent,
    data: { name: '每日数据', lang: 'system.export.dailyData', showMerchant: true },
  },
  {
    path: 'playerBonusBreakdown',
    component: PlayerBonusBreakdown,
    data: { name: '会员红利明细 ', lang: 'system.export.playerBonusBreakdown', showMerchant: true },
  },
  {
    path: 'pspDepositTiming',
    component: PspDepositComponent,
    data: { name: 'PSP存款完成时间统计', lang: 'system.export.pspDepositTiming', showMerchant: true },
  },
  // fitch： 2023-11-16 不做
  // {
  //   path: 'withdrawal-log',
  //   component: LogsComponent,
  //   data: { name: '提款日志', lang: 'system.export.withdrawalsLogs', showMerchant: true },
  // },
];

export const dataExportRoutes: Routes = [
  {
    path: 'dataExport',
    component: DataExportComComponent,
    data: { name: '数据导出', code: '324', lang: 'nav.exportData' },
    children: [
      { path: '', redirectTo: 'default', pathMatch: 'full' },
      ...dataExportRoutesTab,
      {
        path: '**',
        component: DataExportDefaultComponent,
        data: { name: '请选择报表类型', lang: 'nav.exportData' },
      },
    ],
  },
];
