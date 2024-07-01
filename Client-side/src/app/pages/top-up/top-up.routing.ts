import { RouterModule, Routes } from '@angular/router';
import { CurrencyTransformComponent } from './currency-transform/currency-transform.component';
import { CurrencyComponent } from './currency/currency.component';
import { DigitalComponent } from './digital/digital.component';
import { OnlinePayWalletComponent } from './online-pay-wallet/online-pay-wallet.component';
import { OnlinePaymentComponent } from './online-payment/online-payment.component';
import { TopUpComponent } from './top-up.component';
import { TopUpGuard } from './top-up.guard';
import { VnThTransferComponent } from './vn-th-transfer/vn-th-transfer.component';

const routes: Routes = [
  {
    path: '',
    component: TopUpComponent,
    canActivate: [TopUpGuard],
    runGuardsAndResolvers: 'always',
    children: [
      //数字货币
      { path: 'crypto', component: DigitalComponent },
      //法币
      { path: 'fiat', component: CurrencyComponent },
      //网银转账
      { path: 'bank', component: CurrencyTransformComponent },
      //在线支付
      { path: 'online-payment', component: OnlinePaymentComponent },
      //泰越
      { path: 'vn-th-transfer', component: VnThTransferComponent },
      //电子钱包
      { path: 'e-wallet', component: OnlinePayWalletComponent },
    ],
  },
];

export const TopUpRoutes = RouterModule.forChild(routes);
