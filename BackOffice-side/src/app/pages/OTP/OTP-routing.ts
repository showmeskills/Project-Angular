import { Routes } from '@angular/router';
import { QueryComponent } from './query/query.component';

export const routes: Routes = [
  { path: '', redirectTo: 'OTP-query', pathMatch: 'full' },
  {
    path: 'OTP-query',
    component: QueryComponent,
    data: { name: 'OTP查询', showMerchant: true, code: '291', lang: 'breadCrumb.otpQuery' },
  },
];
