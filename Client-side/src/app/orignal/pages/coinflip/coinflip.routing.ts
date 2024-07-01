import { RouterModule, Routes } from '@angular/router';
import { CoinflipComponent } from './coinflip.component';

const routes: Routes = [
  {
    path: '',
    component: CoinflipComponent,
    pathMatch: 'full',
  },
];

export const CoinflipRoutes = RouterModule.forChild(routes);
