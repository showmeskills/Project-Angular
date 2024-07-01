import { RouterModule, Routes } from '@angular/router';
import { MinesComponent } from './mines.component';

const routes: Routes = [
  {
    path: '',
    component: MinesComponent,
    pathMatch: 'full',
  },
];

export const MinesRoutes = RouterModule.forChild(routes);
