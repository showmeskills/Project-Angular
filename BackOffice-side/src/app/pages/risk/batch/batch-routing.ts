import { Routes } from '@angular/router';
import { BatchComponent } from 'src/app/pages/risk/batch/batch.component';
import { BatchRemarksComponent } from 'src/app/pages/risk/batch/batch-remarks/batch-remarks.component';
import { BatchProhibitedComponent } from 'src/app/pages/risk/batch/batch-prohibited/batch-prohibited.component';
import { BatchListComponent } from 'src/app/pages/risk/batch/batch-list/batch-list.component';
import { BatchRiskComponent } from 'src/app/pages/risk/batch/batch-risk/batch-risk.component';
import { BatchAdjustmentComponent } from 'src/app/pages/risk/batch/batch-adjustment/batch-adjustment.component';

// 市场数据、VIP数据、提款日志
export let batchRoutesTab: Routes = [
  {
    path: 'remarks',
    component: BatchRemarksComponent,
    data: { name: '批量备注', showMerchant: true, lang: 'risk.batch.remarks' },
  },
  {
    path: 'risk-level',
    component: BatchRiskComponent,
    data: { name: '批量风控', showMerchant: true, lang: 'risk.batch.risk' },
  },
  {
    path: 'prohibited',
    component: BatchProhibitedComponent,
    data: { name: '批量禁用', showMerchant: true, lang: 'risk.batch.prohibited' },
  },
  {
    path: 'adjustment',
    component: BatchAdjustmentComponent,
    data: { name: '批量调账', showMerchant: true, lang: 'risk.batch.adjustment' },
  },
];

export const batchRoutes: Routes = [
  {
    path: 'batch',
    component: BatchComponent,
    data: { name: '批量上传', showMerchant: true, code: '326', lang: 'risk.batch.title' },
    children: [{ path: '', redirectTo: batchRoutesTab[0].path, pathMatch: 'full' }, ...batchRoutesTab],
  },
  {
    path: 'batch-list',
    component: BatchListComponent,
    data: { name: '批量状态列表', showMerchant: true, code: '327', lang: 'risk.batchList.title' },
  },
];
