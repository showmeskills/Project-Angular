import { RouterModule, Routes } from '@angular/router';
import { AccountSafetyComponent } from './account-safety.component';
import { ActivitiesComponent } from './safety-home/activities/activities.component';
import { ChangePasswordComponent } from './safety-home/change-password/change-password.component';
import { DeviceManagementComponent } from './safety-home/device-management/device-management.component';
import { ResetNameComponent } from './safety-home/reset-name/reset-name.component';
import { SafetyHomeComponent } from './safety-home/safety-home.component';

const routes: Routes = [
  {
    path: '',
    component: AccountSafetyComponent,
    children: [
      //账户安全页面
      { path: '', component: SafetyHomeComponent, pathMatch: 'full' },
      //修改密码页面
      { path: 'reset-password', component: ChangePasswordComponent },
      //设备管理页面
      { path: 'device-management', component: DeviceManagementComponent },
      //账户活动页面
      { path: 'activities', component: ActivitiesComponent },
      //修改用户名
      { path: 'reset-name', component: ResetNameComponent },
    ],
  },
];

export const AccountSafetyRoutes = RouterModule.forChild(routes);
