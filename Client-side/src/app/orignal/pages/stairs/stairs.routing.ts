import { RouterModule, Routes } from '@angular/router';
import { StairsComponent } from './stairs.component';

const routes: Routes = [
  {
    path: '',
    component: StairsComponent,
    pathMatch: 'full',
  },
];

export const StairsRoutes = RouterModule.forChild(routes);
