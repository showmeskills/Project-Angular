import { RouterModule, Routes } from '@angular/router';
import { HiloComponent } from './hilo.component';

const routes: Routes = [
  {
    path: '',
    component: HiloComponent,
    pathMatch: 'full',
  },
];

export const HiloRoutes = RouterModule.forChild(routes);
