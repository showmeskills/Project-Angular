import { RouterModule, Routes } from '@angular/router';
import { CrashComponent } from './crash.component';

const routes: Routes = [
  {
    path: '',
    component: CrashComponent,
    pathMatch: 'full',
  },
];

export const CrashRoutes = RouterModule.forChild(routes);
