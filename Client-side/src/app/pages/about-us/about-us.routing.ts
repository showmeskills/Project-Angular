import { RouterModule, Routes } from '@angular/router';
import { AboutUsHomeComponent } from './about-us-home/about-us-home.component';
import { AboutUsComponent } from './about-us.component';
import { JobOpportunityComponent } from './job-opportunity/job-opportunity.component';
import { ContactHrComponent } from './jobs/contact-hr/contact-hr.component';
import { JobApplicationComponent } from './jobs/job-application/job-application.component';
import { JobDetailsComponent } from './jobs/job-details/job-details.component';
import { JobVacancyComponent } from './jobs/job-vacancy/job-vacancy.component';
import { JobsComponent } from './jobs/jobs.component';

const routes: Routes = [
  {
    path: '',
    component: AboutUsComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: AboutUsHomeComponent },
      { path: 'work', component: JobOpportunityComponent },
    ],
  },
  {
    path: 'jobs',
    component: JobsComponent,
    children: [
      { path: 'vacancy', component: JobVacancyComponent },
      { path: 'detail/:id', component: JobDetailsComponent },
      { path: 'applications/:jobId', component: JobApplicationComponent },
      { path: 'hr', component: ContactHrComponent },
    ],
  },
];

export const AboutUsRouting = RouterModule.forChild(routes);
