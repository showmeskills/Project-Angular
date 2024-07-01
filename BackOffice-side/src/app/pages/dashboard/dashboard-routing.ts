import { Routes } from '@angular/router';
// import { AnalysisComponent } from './analysis/analysis.component';
import { AnalysisNewComponent } from './analysis-new/analysis-new.component';

export const routes: Routes = [
  { path: '', redirectTo: 'analysis', pathMatch: 'full' },
  // {
  //   path: 'analysis',
  //   component: AnalysisComponent,
  //   data: { name: '分析页', showMerchant: true, showTime: true, code: '1', lang: 'breadCrumb.analysisPage' },
  // },
  {
    path: 'analysis',
    component: AnalysisNewComponent,
    data: {
      name: '分析页',
      showMerchant: true,
      showTime: true,
      code: '1',
      showCountry: true,
      lang: 'breadCrumb.analysisPage',
    },
  },
];
