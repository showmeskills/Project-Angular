import { Routes, RouterModule } from '@angular/router';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // 偏好设置
  { path: 'home', component: SettingsComponent },
];

export const SettingsRoutes = RouterModule.forChild(routes);
