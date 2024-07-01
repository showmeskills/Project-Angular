import { RouterModule, Routes } from '@angular/router';
import { PasswordComponent } from './password.component';

const routes: Routes = [
  {
    path: '',
    component: PasswordComponent,
    pathMatch: 'full',
  },
];

export const PasswordRoutes = RouterModule.forChild(routes);
