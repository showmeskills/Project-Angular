import { RouterModule, Routes } from '@angular/router';
import { PlinkoComponent } from './plinko.component';

const routes: Routes = [
  {
    path: '',
    component: PlinkoComponent,
    pathMatch: 'full',
  },
];

export const PlinkoRoutes = RouterModule.forChild(routes);
