import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { SuccessVerificationPageComponent } from 'src/app/shared/components/success-verification-page/success-verification-page.component';
import { ThirdAuthModule } from 'src/app/shared/components/third-auth/third-auth.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { AccountSafetyComponent } from './account-safety.component';
import { AccountSafetyRoutes } from './account-safety.routing';
import { HeaderTitleBarModule } from './header-title-bar/header-title-bar.module';
import { ActivitiesComponent } from './safety-home/activities/activities.component';
import { ChangePasswordComponent } from './safety-home/change-password/change-password.component';
import { DeviceManagementComponent } from './safety-home/device-management/device-management.component';
import { ResetNameComponent } from './safety-home/reset-name/reset-name.component';
import { SafetyHomeComponent } from './safety-home/safety-home.component';

@NgModule({
  imports: [
    CommonModule,
    AccountSafetyRoutes,
    FormsModule,
    MatIconModule,
    MatStepperModule,
    PipesModule,
    PaginatorModule,
    ClickOutsideModule,
    LoadingModule,
    CustomizeFormModule,
    EmptyModule,
    HeaderTitleBarModule,
    ThirdAuthModule,
  ],
  declarations: [
    AccountSafetyComponent,
    ChangePasswordComponent,
    ActivitiesComponent,
    SafetyHomeComponent,
    DeviceManagementComponent,
    ResetNameComponent,
    SuccessVerificationPageComponent,
  ],
})
export class AccountSafetyModule {}
