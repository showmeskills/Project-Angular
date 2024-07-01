import { RouterModule, Routes } from '@angular/router';
import { CurrencyPurchaseComponent } from './currency-purchase/currency-purchase.component';

const routes: Routes = [
  // {
  //   path: '', component: ExchangeComponent, children: [
  //     { path: '', redirectTo: 'exChange' },
  //   ]
  // },
  { path: 'purchase', component: CurrencyPurchaseComponent },
];

export const ExchangeRoutes = RouterModule.forChild(routes);
