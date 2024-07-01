import { RouterModule, Routes } from '@angular/router';
import { CsgoComponent } from './csgo.component';

const routes: Routes = [
  {
    path: '',
    component: CsgoComponent,
    pathMatch: 'full',
  },
];

export const CsgoRoutes = RouterModule.forChild(routes);
