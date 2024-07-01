import { RouterModule, Routes } from '@angular/router';
import { KycComponent } from './kyc.component';

const routes: Routes = [
  {
    path: '',
    component: KycComponent,
    pathMatch: 'full',
  },
];

export const KycRoutes = RouterModule.forChild(routes);
