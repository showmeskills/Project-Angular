import { RouterModule, Routes } from '@angular/router';
import { AnnouncementListComponent } from './announcement/announcement-list/announcement-list.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { FaqListComponent } from './faq/faq-list/faq-list.component';
import { FaqComponent } from './faq/faq.component';
import { HelpCenterHomeComponent } from './help-center-home/help-center-home.component';
import { HelpCenterSearchComponent } from './help-center-search/help-center-search.component';
import { HelpCenterComponent } from './help-center.component';

const routes: Routes = [
  {
    path: '',
    component: HelpCenterComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      // 帮助中心首页
      { path: 'home', component: HelpCenterHomeComponent },
      // 公告中心
      { path: 'announcement', component: AnnouncementComponent },
      // 公告中心列表
      { path: 'announcement/:id', runGuardsAndResolvers: 'always', component: AnnouncementListComponent },
      // 常见问题
      { path: 'faq', component: FaqComponent },
      // 常见问题分类列表
      { path: 'faq/:id', component: FaqListComponent, runGuardsAndResolvers: 'always' },
      // 帮助中心搜索
      { path: 'search', component: HelpCenterSearchComponent },
    ],
  },
];

export const HelpCenterRoutes = RouterModule.forChild(routes);
