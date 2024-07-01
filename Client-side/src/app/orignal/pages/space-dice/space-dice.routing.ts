import { RouterModule, Routes } from '@angular/router';
import { SpaceDiceComponent } from './space-dice.component';

const routes: Routes = [
  {
    path: '',
    component: SpaceDiceComponent,
    pathMatch: 'full',
  },
];

export const SpaceDiceRoutes = RouterModule.forChild(routes);
