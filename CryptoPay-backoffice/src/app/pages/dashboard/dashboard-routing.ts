import { Routes } from '@angular/router';
import { AnalysisComponent } from './analysis/analysis.component';

export const routes: Routes = [
  { path: '', redirectTo: 'analysis', pathMatch: 'full' },
  // {
  //   path: 'analysis',
  //   component: AnalysisComponent,
  //   data: { name: '分析页', showMerchant: true, showTime: true, code: '1', lang: 'breadCrumb.analysisPage' },
  // },
  {
    path: 'analysis',
    component: AnalysisComponent,
    data: {
      name: '分析页',
      code: '1',
      lang: 'breadCrumb.welcome',
    },
  },
];
