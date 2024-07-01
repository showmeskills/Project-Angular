import { RouterModule, Routes } from '@angular/router';
import { LimboComponent } from './limbo.component';

const routes: Routes = [
  {
    path: '',
    component: LimboComponent,
    pathMatch: 'full',
  },
];

export const LimboRoutes = RouterModule.forChild(routes);
