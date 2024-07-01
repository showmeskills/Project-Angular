import { RouterModule, Routes } from '@angular/router';
import { SportsComponent } from './sports.component';

const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: ':sub', component: SportsComponent, data: { keep: true } },
  { path: '**', redirectTo: '' },
];

export const SportsRoutes = RouterModule.forChild(routes);
