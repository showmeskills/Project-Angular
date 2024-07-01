import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/service/auth.guard';
import { FeedbackRecordComponent } from './feedback-record/feedback-record.component';
import { FeedbackComponent } from './feedback.component';
import { SubmitFeedbackComponent } from './submit-feedback/submit-feedback.component';

const routes: Routes = [
  { path: '', component: FeedbackComponent, pathMatch: 'full' },
  { path: 'submit', canActivate: [AuthGuard], component: SubmitFeedbackComponent },
  { path: 'submit/:target', canActivate: [AuthGuard], component: SubmitFeedbackComponent },
  { path: 'record', canActivate: [AuthGuard], component: FeedbackRecordComponent },
];

export const FeedbackRoutes = RouterModule.forChild(routes);
