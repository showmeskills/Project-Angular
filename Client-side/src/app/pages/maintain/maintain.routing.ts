import { RouterModule, Routes } from '@angular/router';
import { MaintainComponent } from './maintain.component';

const routes: Routes = [
  { path: '', component: MaintainComponent, pathMatch: 'full' },
  { path: 'service', component: MaintainComponent, data: { ident: 'service' } },
  { path: 'sport', component: MaintainComponent, data: { ident: 'sport' } },
  { path: 'lottery', component: MaintainComponent, data: { ident: 'lottery' } },
];

export const MaintainRoutes = RouterModule.forChild(routes);
