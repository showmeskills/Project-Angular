import { RouterModule, Routes } from '@angular/router';
import { WheelComponent } from './wheel.component';

const routes: Routes = [
  {
    path: '',
    component: WheelComponent,
    pathMatch: 'full',
  },
];

export const WheelRoutes = RouterModule.forChild(routes);
