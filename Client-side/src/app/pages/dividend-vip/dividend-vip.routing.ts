import { RouterModule, Routes } from '@angular/router';
import { OfferDetailComponent } from './offer-list/offer-detail/offer-detail.component';
import { OfferListComponent } from './offer-list/offer-list.component';
import { VipBenefitsComponent } from './vip-benefits/vip-benefits.component';
import { VipLevelSystemComponent } from './vip-level-system/vip-level-system.component';
const routes: Routes = [
  { path: '', redirectTo: 'offer', pathMatch: 'full' },
  // 优惠列表
  { path: 'offer', component: OfferListComponent },
  { path: 'offer/:activitiesNo', component: OfferDetailComponent },
  // vip等级页面
  { path: 'vip-level', component: VipLevelSystemComponent },
  // vip等级介绍
  { path: 'vip-introduction', component: VipBenefitsComponent },
];

export const DividendVipRoutes = RouterModule.forChild(routes);
