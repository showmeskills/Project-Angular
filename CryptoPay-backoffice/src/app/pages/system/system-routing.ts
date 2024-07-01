import { Routes } from '@angular/router';
import { MerchantsComponent } from './merchants/merchants.component';
import { EditComponent as MerchantsEditComponent } from './merchants/edit/edit.component';
import { ExchangeComponent } from './exchange/exchange.component';
import { PaymentMethodManagementComponent } from './payment-method-management/payment-method-management.component';
import { PaymentMethodEditComponent } from './payment-method-management/payment-method-edit/payment-method-edit.component';
import { LogComponent } from 'src/app/pages/system/log/log.component';
import { WhiteIpComponent } from 'src/app/pages/system/merchants/white-ip/white-ip.component';
import { AddWhiteIPComponent } from 'src/app/pages/system/merchants/white-ip/add/add.component';

export const routes: Routes = [
  { path: '', redirectTo: 'merchants', pathMatch: 'full' },
  {
    path: 'merchants',
    component: MerchantsComponent,
    data: { name: '商户管理', code: '219', keep: true, lang: 'nav.merchantManagement' },
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
    path: 'mw-ip',
    component: WhiteIpComponent,
    data: { name: '商户IP白名单', code: '227', keep: true, lang: 'nav.merchantWhiteIP' },
  },
  {
    path: 'mw-ip/add',
    component: AddWhiteIPComponent,
    data: { name: '商户IP白名单 - 创建', lang: 'nav.merchantWhiteIPAdd' },
  },
  {
    path: 'exchange',
    component: ExchangeComponent,
    data: { name: '汇率管理', lang: 'nav.exchangeRateManagement' },
  },
  {
    path: 'paymentMethodManagement',
    component: PaymentMethodManagementComponent,
    data: { name: '支付方式管理', keep: true, lang: 'nav.paymentMethodManagement' },
  },
  {
    path: 'paymentMethodManagement/:id',
    component: PaymentMethodEditComponent,
    data: {
      name: '支付方式编辑',
      lang: 'breadCrumb.paymentMethodEdit',
      breadcrumbsBefore: [
        { name: '支付方式管理', link: '/system/paymentMethodManagement', lang: 'nav.paymentMethodManagement' },
      ],
    },
  },
  {
    path: 'log',
    component: LogComponent,
    data: { name: '操作日志', code: '220', lang: 'nav.operationlog' },
  },
];
