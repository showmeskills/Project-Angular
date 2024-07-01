import { Routes } from '@angular/router';
import { ReportViewerComComponent } from 'src/app/pages/system/report-viewer-com/report-viewer-com.component';
import { ReportViewerComponent } from 'src/app/pages/system/report-viewer-com/report-viewer/report-viewer.component';
import { ReportCorrespondenceComponent } from 'src/app/pages/system/report-viewer-com/report-correspondence/report-correspondence.component';

/** 报告查看，通讯记录 */
export let ReportViewerRoutesTab: Routes = [
  {
    path: 'viewer',
    component: ReportViewerComponent,
    data: { name: '报告查看', lang: 'nav.reportViewer', showMerchant: true },
  },
  {
    path: 'correspondence',
    component: ReportCorrespondenceComponent,
    data: { name: '通讯记录', lang: 'system.reportViewer.correspondence', showMerchant: true },
  },
];

export const ReportViewerRoutes: Routes = [
  {
    path: 'reportViewer',
    component: ReportViewerComComponent,
    data: { name: '报告查看', code: '329', lang: 'nav.reportViewer' },
    children: [{ path: '', redirectTo: 'viewer', pathMatch: 'full' }, ...ReportViewerRoutesTab],
  },
];
