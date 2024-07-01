import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/service/auth.guard';
import { IncomeProofComponent } from './income-proof/income-proof.component';
import { SafeQuestionnaireComponent } from './safe-questionnaire/safe-questionnaire.component';
import { UploadFilesComponent } from './upload-files/upload-files.component';

export const routes: Routes = [
  { path: 'edd', canActivate: [AuthGuard], component: SafeQuestionnaireComponent },
  { path: 'proof-of-income', canActivate: [AuthGuard], component: IncomeProofComponent },
  { path: 'upload-files', canActivate: [AuthGuard], component: UploadFilesComponent },
];

export const RiskControlRoutes = RouterModule.forChild(routes);
