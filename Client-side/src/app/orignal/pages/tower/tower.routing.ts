import { RouterModule, Routes } from '@angular/router';
import { TowerComponent } from './tower.component';

const routes: Routes = [
  {
    path: '',
    component: TowerComponent,
    pathMatch: 'full',
  },
];

export const TowerRoutes = RouterModule.forChild(routes);
