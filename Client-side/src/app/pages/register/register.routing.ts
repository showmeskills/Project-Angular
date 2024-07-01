import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register.component';

const routes: Routes = [
  {
    path: '',
    component: RegisterComponent,
    pathMatch: 'full',
  },
];

export const RegisterRoutes = RouterModule.forChild(routes);
