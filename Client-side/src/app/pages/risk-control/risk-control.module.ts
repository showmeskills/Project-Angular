import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { HeaderTitleBarModule } from '../user-center/account-safety/header-title-bar/header-title-bar.module';
import { IncomeProofComponent } from './income-proof/income-proof.component';
import { RiskControlRoutes } from './risk-control.routing';
import { RiskPopupComponent } from './risk-popup/risk-popup.component';
import { RiskUploaderComponent } from './risk-uploader/risk-uploader.component';
import { SafeQuestionnaireComponent } from './safe-questionnaire/safe-questionnaire.component';
import { UploadFilesComponent } from './upload-files/upload-files.component';
@NgModule({
  imports: [
    CommonModule,
    RiskControlRoutes,
    CustomizeFormModule,
    PipesModule,
    HeaderTitleBarModule,
    ScrollbarModule,
    MatCheckboxModule,
    ClickOutsideModule,
    OverlayModule,
    MatStepperModule,
  ],
  declarations: [
    RiskUploaderComponent,
    SafeQuestionnaireComponent,
    RiskPopupComponent,
    IncomeProofComponent,
    UploadFilesComponent,
  ],
})
export class RiskControlModule {}
