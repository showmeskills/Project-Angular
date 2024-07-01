import { RouterModule, Routes } from '@angular/router';
import { TeemoComponent } from './teemo.component';

const routes: Routes = [
  {
    path: '',
    component: TeemoComponent,
    pathMatch: 'full',
  },
];

export const TeemoRoutes = RouterModule.forChild(routes);
