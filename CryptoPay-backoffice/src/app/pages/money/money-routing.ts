import { Routes } from '@angular/router';
import { CompanyAccountManagementComponent } from './company-account-management/company-account-management.component';
import { ChannelAllocationManagementComponent } from './channel-allocation-management/channel-allocation-management.component';
import { SubChannelListsComponent } from './sub-channel-lists/sub-channel-lists.component';
import { ChannelConfigComponent } from './channel-config/channel-config.component';
import { CompanyAccountEditComponent } from './company-account-management/company-account-edit/company-account-edit.component';
import { ChannelEditComponent } from './channel-edit/channel-edit.component';
import { ChannelSubEditComponent } from './channel-sub-edit/channel-sub-edit.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { ChannelSubViewComponent } from 'src/app/pages/money/channel-sub-edit/channel-sub-view/channel-sub-view.component';
import { ChannelLogComponent } from 'src/app/pages/money/channel-log/channel-log.component';
import { BankComponent } from 'src/app/pages/money/bank/bank.component';
import { BankMapEditComponent } from 'src/app/pages/money/bank-map/bank-map-edit/bank-map-edit.component';
import { BankMapComponent } from 'src/app/pages/money/bank-map/bank-map.component';
import { MerchantMoneyComponent } from 'src/app/pages/money/merchant-money/merchant-money.component';
import { MerchantDetailComponent } from 'src/app/pages/money/merchant-money/merchant-detail/merchant-detail.component';
import { MerchantCountComponent } from 'src/app/pages/money/merchant-money/merchant-count/merchant-count.component';

export const routes: Routes = [
  { path: '', redirectTo: 'channelConfig', pathMatch: 'full' },
  {
    path: 'channelConfig',
    component: ChannelConfigComponent,
    data: { name: '法币渠道配置', code: '206', keep: true, lang: 'nav.fiatCurrencyChannelConfig' },
  },
  {
    path: 'channelConfig/:id',
    component: ChannelEditComponent,
    data: {
      name: '渠道编辑',
      lang: 'breadCrumb.channelEditor',
      breadcrumbsBefore: [
        { name: '法币渠道配置', link: '/money/channelConfig', lang: 'nav.fiatCurrencyChannelConfig' },
      ],
    },
  },
  {
    path: 'subChannel',
    component: SubChannelListsComponent,
    data: { name: '法币子渠道列表', code: '207', keep: true, lang: 'breadCrumb.listSubChannels' },
  },
  {
    path: 'subChannel/detail/:id',
    component: ChannelSubViewComponent,
    data: {
      name: '法币子渠道查看',
      lang: 'breadCrumb.fiatCurrencyView',
      breadcrumbsBefore: [{ name: '法币子渠道配置', link: '/money/subChannel', lang: 'nav.fiatCurrencyConfiguration' }],
    },
  },
  {
    path: 'subChannel/add',
    component: ChannelSubEditComponent,
    data: {
      name: '法币子渠道新增',
      lang: 'breadCrumb.SubChannelAdd',
      breadcrumbsBefore: [{ name: '法币子渠道配置', link: '/money/subChannel', lang: 'nav.fiatCurrencyConfiguration' }],
    },
  },
  {
    path: 'subChannel/:id',
    component: ChannelSubEditComponent,
    data: {
      name: '法币子渠道编辑',
      lang: 'breadCrumb.fiatSubChannelEdit',
      breadcrumbsBefore: [{ name: '法币子渠道配置', link: '/money/subChannel', lang: 'nav.fiatCurrencyConfiguration' }],
    },
  },
  {
    path: 'channelAllocationManagement',
    component: ChannelAllocationManagementComponent,
    data: {
      name: '渠道分配管理',
      showMerchant: true,
      code: '208',
      keep: true,
      lang: 'nav.channeAllocationManagement',
    },
  },
  {
    path: 'channelAllocationManagement/log/:id',
    component: ChannelLogComponent,
    data: {
      name: '渠道分配日志',
      lang: 'breadCrumb.channelAllocationLog',
      breadcrumbsBefore: [
        { name: '渠道分配管理', link: '/money/channelAllocationManagement', lang: 'nav.channeAllocationManagement' },
      ],
    },
  },
  {
    path: 'companyAccountManagement',
    component: CompanyAccountManagementComponent,
    data: { name: '公司帐户管理', code: '209', keep: true, lang: 'nav.companyAccountManagement' },
  },
  {
    path: 'companyAccountManagement/add',
    component: CompanyAccountEditComponent,
    data: {
      name: '新增公司账户',
      lang: 'breadCrumb.addCompanyAccount',
      breadcrumbsBefore: [
        { name: '公司帐户管理', link: '/money/companyAccountManagement', lang: 'nav.companyAccountManagement' },
      ],
    },
  },
  {
    path: 'companyAccountManagement/:id',
    component: CompanyAccountEditComponent,
    data: {
      name: '编辑公司账户',
      lang: 'breadCrumb.editCompanyAccount',
      breadcrumbsBefore: [
        { name: '公司帐户管理', link: '/money/companyAccountManagement', lang: 'nav.companyAccountManagement' },
      ],
    },
  },
  {
    path: 'transactionList',
    component: TransactionListComponent,
    data: { name: '存提款列表', code: '203', lang: 'nav.depositWithdrawalList', showRegion: true },
  },
  { path: 'bank', component: BankComponent, data: { name: '银行列表配置', lang: 'nav.bankListConfiguration' } },
  {
    path: 'bank-map',
    component: BankMapComponent,
    data: { name: '银行映射配置', lang: 'nav.bankMappingConfiguration' },
  },
  {
    path: 'bank-map/add',
    component: BankMapEditComponent,
    data: {
      name: '银行映射配置新增',
      lang: 'breadCrumb.bankMappingConfigAdded',
      breadcrumbsBefore: [{ name: '银行映射配置', link: '/money/bank-map', lang: 'nav.bankMappingConfiguration' }],
    },
  },
  {
    path: 'bank-map/:id',
    component: BankMapEditComponent,
    data: {
      name: '银行映射配置编辑',
      lang: 'breadCrumb.bankConfigurationEdit',
      breadcrumbsBefore: [{ name: '银行映射配置', link: '/money/bank-map', lang: 'nav.bankMappingConfiguration' }],
    },
  },
  {
    path: 'merchant-money',
    component: MerchantMoneyComponent,
    data: { name: '商户资金', lang: 'breadCrumb.merchantMoney' },
  },
  {
    path: 'merchant-money/count/:merchantId/:currency',
    component: MerchantCountComponent,
    data: {
      name: '商户资金查看',
      lang: 'breadCrumb.merchantMoney',
      breadcrumbsBefore: [{ name: '商户资金', link: '/money/merchant-money', lang: 'nav.merchantMoney' }],
    },
  },
  {
    path: 'merchant-money/:merchantId/:currency/:currentTime',
    component: MerchantDetailComponent,
    data: {
      name: '商户资金详情',
      lang: 'breadCrumb.merchantMoneyDetail',
      breadcrumbsBefore: [{ name: '商户资金', link: '/money/merchant-money', lang: 'nav.merchantMoney' }],
    },
  },
];
