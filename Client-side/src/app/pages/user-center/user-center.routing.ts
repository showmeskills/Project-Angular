import { RouterModule, Routes } from '@angular/router';
import { OverviewComponent } from './overview/overview.component';
import { UserCenterComponent } from './user-center.component';

const routes: Routes = [
  {
    path: '',
    component: UserCenterComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      //总览
      { path: 'overview', component: OverviewComponent },
      //账户安全
      {
        path: 'security',
        loadChildren: () => import('./account-safety/account-safety.module').then(m => m.AccountSafetyModule),
      },
      //kyc
      { path: 'kyc', loadChildren: () => import('./../kyc/kyc.module').then(m => m.KycModule) },
    ],
  },
];

export const UserCenterRoutes = RouterModule.forChild(routes);
