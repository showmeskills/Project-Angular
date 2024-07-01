import { Routes } from '@angular/router';
import { VipManagementComponent } from './vip-management/vip-management.component';
import { VipManagementNewComponent } from './vip-management-new/vip-management-new.component';
import { VipComponent } from './vip.component';

export const routes: Routes = [
  { path: '', redirectTo: 'vip-management', pathMatch: 'full' },
  {
    path: 'vip-management',
    component: VipComponent,
    data: { name: 'vip管理', code: '204', lang: 'breadCrumb.vipManagement' },
    children: [
      { path: '', redirectTo: 'vip-management', pathMatch: 'full' },
      {
        path: 'model-A',
        component: VipManagementComponent,
        data: { name: 'VIP Model A', lang: 'breadCrumb.vipManagementA', showMerchant: true },
      },
      {
        path: 'model-C',
        component: VipManagementNewComponent,
        data: { name: 'VIP Model C', lang: 'breadCrumb.vipManagementC', showMerchant: true },
      },
    ],
  },
];
