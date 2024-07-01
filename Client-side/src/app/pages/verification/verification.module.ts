import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { QrCodeModule } from 'ng-qrcode';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { VerifyCodeModule } from 'src/app/shared/components/verify-code/verify-code.module';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { HeaderTitleBarModule } from '../user-center/account-safety/header-title-bar/header-title-bar.module';
import { DackupKeyComponent } from './dackup-key/dackup-key.component';
import { DisableEmailComponent } from './disable-email/disable-email.component';
import { DisableSocialComponent } from './disable-social/disable-social.component';
import { DownloadPageComponent } from './download-page/download-page.component';
import { EnableEmailComponent } from './enable-email/enable-email.component';
import { GoogleUnboundComponent } from './google-unbound/google-unbound.component';
import { GoogleVerificationComponent } from './google-verification/google-verification.component';
import { PhoneVerificationComponent } from './phone-verification/phone-verification.component';
import { ResetPhoneNumberComponent } from './reset-phone-number/reset-phone-number.component';
import { ScanPageComponent } from './scan-page/scan-page.component';
import { SuccessVerificationComponent } from './success-verification/success-verification.component';
import { UnboundPhoneComponent } from './unbound-phone/unbound-phone.component';
import { VerificationRoutes } from './verification.routing';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    VerificationRoutes,
    MatFormFieldModule,
    MatStepperModule,
    ReactiveFormsModule,
    VerifyCodeModule,
    MatIconModule,
    HeaderTitleBarModule,
    PipesModule,
    CustomizeFormModule,
    PipesModule,
    ToolTipModule,
    QrCodeModule,
  ],
  declarations: [
    PhoneVerificationComponent,
    GoogleVerificationComponent,
    GoogleUnboundComponent,
    SuccessVerificationComponent,
    DownloadPageComponent,
    ScanPageComponent,
    DackupKeyComponent,
    UnboundPhoneComponent,
    DisableSocialComponent,
    DisableEmailComponent,
    EnableEmailComponent,
    ResetPhoneNumberComponent,
  ],
})
export class VerificationModule {}
