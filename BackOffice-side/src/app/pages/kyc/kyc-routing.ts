import { Routes } from '@angular/router';
import { KycGraphComponent } from 'src/app/pages/kyc/kyc-graph/kyc-graph.component';
import { KycOptionComponent } from 'src/app/pages/kyc/kyc-option/kyc-option.component';
import { KycOptionEditComponent } from 'src/app/pages/kyc/kyc-option/kyc-option-edit/kyc-option-edit.component';
import { KycExamineComponent } from 'src/app/pages/kyc/kyc-examine/kyc-examine.component';

export const routes: Routes = [
  { path: '', redirectTo: '/kyc/count', pathMatch: 'full' },
  {
    path: 'count',
    component: KycGraphComponent,
    data: { name: 'KYC管理', showMerchant: true, code: '215', lang: 'nav.kycManagement' },
  },
  {
    path: 'count/option',
    component: KycOptionComponent,
    data: {
      name: '配置管理',
      lang: 'breadCrumb.configManagement',
      breadcrumbsBefore: [{ name: 'KYC管理', link: '/kyc/count', lang: 'nav.kycManagement' }],
    },
  },
  {
    path: 'count/option/edit',
    component: KycOptionEditComponent,
    data: {
      name: '配置管理编辑',
      lang: 'breadCrumb.configManageEdit',
    },
  },
  {
    path: 'count/examine',
    component: KycExamineComponent,
    data: {
      name: '审核管理',
      lang: 'breadCrumb.auditManagement',
      showMerchant: true,
      breadcrumbsBefore: [{ name: 'KYC管理', link: '/kyc/count', lang: 'nav.kycManagement' }],
    },
  },
];
