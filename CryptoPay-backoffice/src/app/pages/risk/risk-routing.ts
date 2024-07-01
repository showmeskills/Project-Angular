import { Routes } from '@angular/router';
import { ReviewListComponent } from 'src/app/pages/risk/review/review-list.component';
import { ReviewDetailComponent } from 'src/app/pages/risk/review/review-detail/review-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'monitor', pathMatch: 'full' },
  {
    path: 'review',
    component: ReviewListComponent,
    data: { name: '审核列表', code: '214', lang: 'nav.reviewList' /*, showMerchant: true*/ },
  },
  {
    path: 'review/detail',
    component: ReviewDetailComponent,
    data: {
      name: '实时监控详情',
      showMerchant: true,
      code: '267',
      lang: 'breadCrumb.realMonitoringDetails',
      breadcrumbsBefore: [{ name: '审核列表', link: '/risk/review', lang: 'nav.reviewList' }],
    },
  },
];
