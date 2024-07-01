import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { FeedbackRecordComponent } from './feedback-record/feedback-record.component';
import { FeedbackTopTitleComponent } from './feedback-top-title/feedback-top-title.component';
import { FeedbackComponent } from './feedback.component';
import { FeedbackRoutes } from './feedback.routing';
import { SubmitFeedbackComponent } from './submit-feedback/submit-feedback.component';

@NgModule({
  imports: [
    CommonModule,
    FeedbackRoutes,
    CustomizeFormModule,
    PipesModule,
    EmptyModule,
    LoadingModule,
    ToolTipModule,
    MatCheckboxModule,
    PaginatorModule,
  ],
  declarations: [FeedbackComponent, FeedbackTopTitleComponent, SubmitFeedbackComponent, FeedbackRecordComponent],
})
export class FeedbackModule {}
