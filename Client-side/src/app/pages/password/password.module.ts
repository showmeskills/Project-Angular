import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { CustomizeTextModule } from 'src/app/shared/components/customize-text/customize-text.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { VerifyCodeModule } from './../../shared/components/verify-code/verify-code.module';
import { PasswordComponent } from './password.component';
import { PasswordRoutes } from './password.routing';
import { PhoneAuthComponent } from './phone-auth/phone-auth.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    VerifyCodeModule,
    PasswordRoutes,
    PipesModule,
    CustomizeFormModule,
    CustomizeTextModule,
  ],
  declarations: [PhoneAuthComponent, ResetPasswordComponent, PasswordComponent],
  exports: [
    // PhoneAuthComponent,
    // ResetPasswordComponent
  ],
})
export class PasswordModule {}
