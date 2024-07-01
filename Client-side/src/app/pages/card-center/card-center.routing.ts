import { RouterModule, Routes } from '@angular/router';
import { CardCenterComponent } from './card-center.component';

const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '', component: CardCenterComponent, pathMatch: 'full' },
];

export const CardCenterRoutes = RouterModule.forChild(routes);
