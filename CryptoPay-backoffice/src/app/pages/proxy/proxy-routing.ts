import { Routes } from '@angular/router';
import { ApprovalComponent } from 'src/app/pages/proxy/approval/approval.component';
import { ApprovalApplyComponent } from 'src/app/pages/proxy/approval/approval-apply/approval-apply.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'budget-apply',
    component: ApprovalApplyComponent,
    data: { name: '付款申请', showMerchant: true, lang: 'nav.paymentRequest' },
  },
  {
    path: 'budget-approval',
    component: ApprovalComponent,
    data: { name: '付款审批', showMerchant: true, lang: 'nav.paymentApproval' },
  },
];
