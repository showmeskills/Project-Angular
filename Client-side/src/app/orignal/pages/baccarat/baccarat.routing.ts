import { RouterModule, Routes } from '@angular/router';
import { BaccaratComponent } from './baccarat.component';

const routes: Routes = [
  {
    path: '',
    component: BaccaratComponent,
    pathMatch: 'full',
  },
];

export const BaccaratRoutes = RouterModule.forChild(routes);
