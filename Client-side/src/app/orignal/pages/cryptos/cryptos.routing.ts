import { RouterModule, Routes } from '@angular/router';
import { CryptosComponent } from './cryptos.component';

const routes: Routes = [
  {
    path: '',
    component: CryptosComponent,
    pathMatch: 'full',
  },
];

export const CryptosRoutes = RouterModule.forChild(routes);
