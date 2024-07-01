import { RouterModule, Routes } from '@angular/router';
import { DiceComponent } from './dice.component';

const routes: Routes = [
  {
    path: '',
    component: DiceComponent,
    pathMatch: 'full',
  },
];

export const DiceRoutes = RouterModule.forChild(routes);
