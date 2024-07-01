import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { CountrySelecterModule } from 'src/app/shared/components/country-selecter/country-selecter.module';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { DatepickerModule } from 'src/app/shared/components/datepicker/datepicker.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { KycOtpComponent } from '../kyc-otp/kyc-otp.component';
import { AdvanceKycComponent } from './advance-kyc/advance-kyc.component';
import { ForeiAdvanceKycComponent } from './forei-advance-kyc/forei-advance-kyc.component';
import { ForeiMidKycComponent } from './forei-mid-kyc/forei-mid-kyc.component';
import { ForeiPrimaryKycComponent } from './forei-primary-kyc/forei-primary-kyc.component';
import { MidKycValidationComponent } from './mid-kyc-validation/mid-kyc-validation.component';
import { PrimaryKycComponent } from './primary-kyc-validation/primary-kyc.component';
import { VerifyDialogComponent } from './verify-dialog.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ClickOutsideModule,
    MatCheckboxModule,
    PipesModule,
    MatTabsModule,
    ScrollbarModule,
    DatepickerModule,
    CustomizeFormModule,
    CountrySelecterModule,
    ToolTipModule,
    LoadingModule,
  ],
  declarations: [
    VerifyDialogComponent,
    PrimaryKycComponent,
    ForeiPrimaryKycComponent,
    MidKycValidationComponent,
    ForeiMidKycComponent,
    AdvanceKycComponent,
    KycOtpComponent,
    ForeiAdvanceKycComponent,
  ],
})
export class VerifyDialogModule {}
