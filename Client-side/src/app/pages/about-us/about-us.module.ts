import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { ImgCarouselModule } from 'src/app/shared/components/img-carousel/img-carousel.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { AboutUsHomeComponent } from './about-us-home/about-us-home.component';
import { AboutUsComponent } from './about-us.component';
import { AboutUsRouting } from './about-us.routing';
import { JobOpportunityComponent } from './job-opportunity/job-opportunity.component';
import { ContactHrComponent } from './jobs/contact-hr/contact-hr.component';
import { JobApplicationComponent } from './jobs/job-application/job-application.component';
import { JobDetailsComponent } from './jobs/job-details/job-details.component';
import { JobVacancyComponent } from './jobs/job-vacancy/job-vacancy.component';
import { JobsNavComponent } from './jobs/jobs-nav/jobs-nav.component';
import { JobsComponent } from './jobs/jobs.component';
@NgModule({
  declarations: [
    AboutUsComponent,
    AboutUsHomeComponent,
    JobOpportunityComponent,
    JobVacancyComponent,
    JobDetailsComponent,
    JobApplicationComponent,
    ContactHrComponent,
    JobsComponent,
    JobsNavComponent,
  ],
  imports: [
    CommonModule,
    AboutUsRouting,
    CustomizeFormModule,
    EmptyModule,
    LoadingModule,
    PipesModule,
    ToolTipModule,
    ImgCarouselModule,
  ],
})
export class AboutUsModule {}
