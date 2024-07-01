import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/service/auth.guard';
import { AffiliateProgramComponent } from './affiliate-program/affiliate-program.component';
import { ApplicationCheckComponent } from './components/application-page/application-check/application-check.component';
import { ApplicationFormComponent } from './components/application-page/application-form/application-form.component';
import { ApplicationPageComponent } from './components/application-page/application-page.component';
import { RecommendOperation } from './components/recommend-operation/recommend-operation.component';
import { RolePageComponent } from './components/role-page/role-page.component';
import { WebRankPopUpComponent } from './components/web-rank-pop-up/web-rank-pop-up.component';
import { FriendComponent } from './friend.component';
import { RecommendComponent } from './recommend/recommend.component';
import { SuperPartnerComponent } from './super-partner/super-partner.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: FriendComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: RecommendComponent },
      { path: 'affiliate', component: AffiliateProgramComponent },
      { path: 'partner', component: SuperPartnerComponent },
    ],
  },
  //推荐规则
  { path: 'role/:whichRouter', component: RolePageComponent },
  //推荐排名
  { path: 'recommendRank', canActivate: [AuthGuard], component: WebRankPopUpComponent },
  //我的推荐id
  { path: 'recommendId', canActivate: [AuthGuard], component: RecommendOperation },
  //申请加入联盟计划/超级合伙人生情
  { path: 'application/affiliate', component: ApplicationPageComponent, runGuardsAndResolvers: 'always' },
  // 表格页面
  {
    path: 'application/affiliate/openForm',
    canActivate: [AuthGuard],
    component: ApplicationFormComponent,
    runGuardsAndResolvers: 'always',
  },
  //申请代理后进入 审核页面
  { path: 'application-check', canActivate: [AuthGuard], component: ApplicationCheckComponent },
];

export const FriendRoutes = RouterModule.forChild(routes);
