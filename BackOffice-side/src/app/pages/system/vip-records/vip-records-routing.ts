import { Routes } from '@angular/router';
import { VipRecordsComComponent } from 'src/app/pages/system/vip-records/vip-records-com.component';
import { PlayersPromoteComponent } from 'src/app/pages/system/vip-records/players-promote/players-promote.component';
import { VipPerformanceComponent } from 'src/app/pages/system/vip-records/vip-performance/vip-performance.component';
import { VipComparisonComponent } from 'src/app/pages/system/vip-records/vip-comparison/vip-comparison.component';

import { VipRecordsDefaultComponent } from 'src/app/pages/system/vip-records/vip-records-routing-default.component';

// import { LogsComponent } from 'src/app/pages/system/data-export-com/logs/logs.component';

// 市场数据、VIP数据、提款日志
export let VipdataExportRoutesTab: Routes = [
  {
    path: 'playersPromote',
    component: PlayersPromoteComponent,
    data: { name: '玩家推广', lang: 'report.playersPromote', showMerchant: true, showTime: true },
  },
  {
    path: 'vipPerformance',
    component: VipPerformanceComponent,
    data: { name: 'VIP绩效', lang: 'report.vipPerformance', showMerchant: true, showTime: true },
  },
  {
    path: 'vipComparison',
    component: VipComparisonComponent,
    data: { name: 'VIP玩家比较', lang: 'report.vipComparison', showMerchant: true },
  },
];

export const VipRecordsRoutes: Routes = [
  {
    path: 'vipRecords',
    component: VipRecordsComComponent,
    data: { name: 'VIP报表', code: '10012', lang: 'report.vipReport' },
    children: [
      { path: '', redirectTo: 'default', pathMatch: 'full' },
      ...VipdataExportRoutesTab,
      {
        path: '**',
        component: VipRecordsDefaultComponent,
        data: { name: '请选择报表类型', lang: 'report.vipReport' },
      },
    ],
  },
];
