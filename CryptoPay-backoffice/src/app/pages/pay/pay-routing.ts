import { Routes } from '@angular/router';
import { CurrencyComponent } from './currency/currency.component';
import { CurrencyEditComponent } from './currency/currency-edit/currency-edit.component';
import { PayComponent } from './pay/pay.component';
import { PayEditComponent } from './pay/pay-edit/pay-edit.component';
import { ExchangeRecordComponent } from 'src/app/pages/pay/exchange-record/exchange-record.component';
import { PspRoutingComponent } from 'src/app/pages/pay/psp-routing/psp-routing.component';

export const routes: Routes = [
  { path: '', redirectTo: 'currency-list', pathMatch: 'full' },
  {
    path: 'currency',
    component: CurrencyComponent,
    data: { name: '币种管理', lang: 'breadCrumb.currencyManagement', showMerchant: true, showMerchantGB: true },
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
  {
    path: 'exchange-record',
    component: ExchangeRecordComponent,
    data: { name: '兑换记录', lang: 'nav.exchangeRecord', keep: true },
  },
  {
    path: 'psp-routing',
    component: PspRoutingComponent,
    data: { name: 'PSP分配设置', lang: 'nav.pspRouting', code: '228', showMerchant: true },
  },
];
