import { RouterModule, Routes } from '@angular/router';
import { AddressManagementComponent } from './address-management/address-management.component';
import { BankcardManagementComponent } from './bankcard-management/bankcard-management.component';
import { MainWalletComponent } from './main-wallet/main-wallet.component';
import { TransferWalletComponent } from './transfer-wallet/transfer-wallet.component';
import { UserAssetsComponent } from './user-assets.component';
import { WalletOverviewComponent } from './wallet-overview/wallet-overview.component';

const routes: Routes = [
  {
    path: '',
    component: UserAssetsComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      //钱包总览页面
      { path: 'overview', component: WalletOverviewComponent },
      // 主账户钱包
      { path: 'main', component: MainWalletComponent },
      // Ky钱包
      { path: 'transfer/:walletName', component: TransferWalletComponent },
      //地址管理
      { path: 'address', component: AddressManagementComponent },
      //银行卡管理
      { path: 'bankcard', component: BankcardManagementComponent },
      //钱包历史
      {
        path: 'history',
        loadChildren: () => import('./wallet-history/wallet-history.module').then(m => m.WalletHistoryModule),
      },
    ],
  },
];

export const UserAssetsRoutes = RouterModule.forChild(routes);
