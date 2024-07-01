import { Routes, RouterModule } from '@angular/router';
import { NotificationCenterComponent } from './notification-center.component';
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // 通知中心
  { path: 'home', component: NotificationCenterComponent },
];

export const NotificationCenterRoutes = RouterModule.forChild(routes);
