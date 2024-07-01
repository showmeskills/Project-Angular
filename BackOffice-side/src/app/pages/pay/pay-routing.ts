import { Routes } from '@angular/router';
import { CurrencyComponent } from './currency/currency.component';
import { CurrencyEditComponent } from './currency/currency-edit/currency-edit.component';
import { PayComponent } from './pay/pay.component';
import { PayEditComponent } from './pay/pay-edit/pay-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'currency-list', pathMatch: 'full' },
  {
    path: 'currency',
    component: CurrencyComponent,
    data: {
      name: '币种管理',
      lang: 'breadCrumb.currencyManagement',
      showMerchant: true,
      showMerchantGB: true,
      keep: true,
    },
  },
  {
    path: 'currency/add',
    component: CurrencyEditComponent,
    data: { name: '币种新增', lang: 'breadCrumb.currencyAdded' },
  },
  {
    path: 'currency/:merchantId/:currency',
    component: CurrencyEditComponent,
    data: {
      name: '币种编辑',
      lang: 'breadCrumb.currencyEdit',
      breadcrumbsBefore: [{ name: '币种管理', link: '/pay/currency', lang: 'breadCrumb.currencyManagement' }],
    },
  },
  {
    path: 'method',
    component: PayComponent,
    data: { name: '支付方式管理', lang: 'nav.paymentMethodManagement', showMerchant: true, keep: true },
  },
  {
    path: 'method/:id',
    component: PayEditComponent,
    data: {
      name: '支付方式编辑',
      lang: 'breadCrumb.paymentMethodEdit',
      breadcrumbsBefore: [{ name: '支付方式管理', lang: 'nav.paymentMethodManagement', link: '/pay/method' }],
    },
  },
];
