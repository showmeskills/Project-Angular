import { Routes } from '@angular/router';
import { HotComponent } from 'src/app/pages/wallet/hot/hot.component';
import { HotEditComponent } from 'src/app/pages/wallet/hot/hot-edit/hot-edit.component';
import { ColdComponent } from 'src/app/pages/wallet/cold/cold.component';
import { ColdEditComponent } from 'src/app/pages/wallet/cold/cold-edit/cold-edit.component';
import { EncryptComponent } from 'src/app/pages/wallet/encrypt/encrypt.component';
import { ConversionComponent } from 'src/app/pages/wallet/conversion/conversion.component';

export const routes: Routes = [
  { path: '', redirectTo: 'hot', pathMatch: 'full' },
  {
    path: 'cold',
    component: ColdComponent,
    data: { name: '冷钱包管理', code: '221', lang: 'breadCrumb.coldWalletManagement' },
  },
  {
    path: 'cold/add',
    component: ColdEditComponent,
    data: {
      name: '新增冷钱包',
      lang: 'breadCrumb.addColdWallet',
      breadcrumbsBefore: [{ name: '冷钱包管理', link: '/wallet/cold', lang: 'breadCrumb.coldWalletManagement' }],
    },
  },
  {
    path: 'cold/:address/:network',
    component: ColdEditComponent,
    data: {
      name: '编辑冷钱包',
      lang: 'breadCrumb.editColdWallet',
      breadcrumbsBefore: [{ name: '冷钱包管理', link: '/wallet/cold', lang: 'breadCrumb.coldWalletManagement' }],
    },
  },
  {
    path: 'encrypt',
    component: EncryptComponent,
    data: { name: '用户钱包管理', code: '222', lang: 'breadCrumb.balanceStatisticsManagement' },
  },
  {
    path: 'hot',
    component: HotComponent,
    data: { name: '热钱包管理', code: '223', lang: 'breadCrumb.hotWalletManagement' },
  },
  {
    path: 'hot/add',
    component: HotEditComponent,
    data: {
      name: '新增热钱包',
      lang: 'breadCrumb.addHotWallet',
      breadcrumbsBefore: [{ name: '热钱包管理', link: '/wallet/hot', lang: 'breadCrumb.hotWalletManagement' }],
    },
  },
  {
    path: 'hot/:address/:network',
    component: HotEditComponent,
    data: {
      name: '编辑热钱包',
      lang: 'breadCrumb.editHotWallet',
      breadcrumbsBefore: [{ name: '热钱包管理', link: '/wallet/hot', lang: 'breadCrumb.hotWalletManagement' }],
    },
  },
  {
    path: 'conversion',
    component: ConversionComponent,
    data: { name: '闪兑', lang: 'nav.flushSwap', code: '225' },
  },
];
