import { RouterModule, Routes } from '@angular/router';
import { SlideComponent } from './slide.component';

const routes: Routes = [
  {
    path: '',
    component: SlideComponent,
    pathMatch: 'full',
  },
];

export const SlideRoutes = RouterModule.forChild(routes);
