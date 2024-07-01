import { Routes, RouterModule } from '@angular/router';
import { CryptoWithdrawComponent } from './crypto-withdraw/crypto-withdraw.component';
import { CurrencyWithdrawComponent } from './currency-withdraw/currency-withdraw.component';
import { WithdrawComponent } from './withdraw.component';
import { WithdrawGuard } from './withdraw.guard';

const routes: Routes = [
  {
    path: '',
    component: WithdrawComponent,
    canActivate: [WithdrawGuard],
    runGuardsAndResolvers: 'always',
    children: [
      //法币
      { path: 'fiat', component: CurrencyWithdrawComponent },
      //数字货币
      { path: 'crypto', component: CryptoWithdrawComponent },
    ],
  },
];

export const WithdrawRoutes = RouterModule.forChild(routes);
