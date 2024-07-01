import { RouterModule, Routes } from '@angular/router';
import { CurrencyRecordComponent } from './currency-record/currency-record.component';
import { DigitalRecordComponent } from './digital-record/digital-record.component';
import { RetrieveAccountComponent } from './retrieve-account.component';

const routes: Routes = [
  {
    path: '',
    component: RetrieveAccountComponent,
    //canActivate: [TopUpGuard],
    runGuardsAndResolvers: 'always',
    children: [
      //数字货币
      { path: 'digital-record', component: DigitalRecordComponent },
      //法币
      { path: 'currency-record', component: CurrencyRecordComponent },
    ],
  },
];

export const RetrieveAccountRoutes = RouterModule.forChild(routes);
