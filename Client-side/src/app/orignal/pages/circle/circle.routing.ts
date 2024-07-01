import { RouterModule, Routes } from '@angular/router';
import { CircleComponent } from './circle.component';

const routes: Routes = [
  {
    path: '',
    component: CircleComponent,
    pathMatch: 'full',
  },
];

export const CircleRoutes = RouterModule.forChild(routes);
