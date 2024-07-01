import { Routes } from '@angular/router';
import { AnnouncementComponent } from './announcement/announcement.component';
import { EditComponent as AnnouncementEditComponent } from './announcement/edit/edit.component';
import { InformationManageComponent } from './information-manage/information-manage.component';
import { InformationManageEditComponent } from './information-manage/information-manage-edit/information-manage-edit.component';
import { MultilingualismManageComponent } from './multilingualism-manage/multilingualism-manage.component';
import { MessagestationManageComponent } from './messagestation-manage/messagestation-manage.component';
import { MessagestationLogComponent } from './messagestation-manage/messagestation-log/messagestation-log.component';
import { JurisdictionComponent } from './jurisdiction/jurisdiction.component';
import { LastPageComponent } from './last-page/last-page.component';
import { BannerManageComponent } from './banner-manage/banner-manage.component';
import { EditComponent as BannerManageEditComponent } from './banner-manage/edit/edit.component';
import { MessagestationTemplateComponent } from './messagestation-manage/messagestation-template/messagestation-template.component';
import { EditComponent as MessagestationTemplateEditComponent } from './messagestation-manage/messagestation-template/edit/edit.component';
import { NoticeEditComponent as EditMessagestationLogComponent } from './messagestation-manage/messagestation-log/notice-edit/notice-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'content/announcement', pathMatch: 'full' },
  {
    path: 'announcement',
    component: AnnouncementComponent,
    data: { name: '资讯管理', showMerchant: true, code: '274', keep: true, lang: 'nav.InfoManagement' },
  },
  {
    path: 'announcement/add',
    component: AnnouncementEditComponent,
    data: {
      name: '新增公告',
      lang: 'breadCrumb.newAnnouncement',
      breadcrumbsBefore: [{ name: '资讯管理', link: '/content/announcement', lang: 'nav.InfoManagement' }],
    },
  },
  {
    path: 'announcement/:id',
    component: AnnouncementEditComponent,
    data: {
      name: '编辑公告',
      lang: 'breadCrumb.editAnnouncement',
      breadcrumbsBefore: [{ name: '资讯管理', link: '/content/announcement', lang: 'nav.InfoManagement' }],
    },
  },
  {
    path: 'information-manage',
    component: InformationManageComponent,
    data: { name: '资讯分类管理', showMerchant: true, code: '273', lang: 'nav.InfoClassManagement' },
  },
  {
    path: 'information-manage/add',
    component: InformationManageEditComponent,
    data: {
      name: '资讯分类新增',
      lang: 'breadCrumb.newInformAtionCategory',
      breadcrumbsBefore: [
        { name: '资讯分类管理', link: '/content/information-manage', lang: 'nav.InfoClassManagement' },
      ],
    },
  },
  {
    path: 'information-manage/:id',
    component: InformationManageEditComponent,
    data: {
      name: '资讯分类编辑',
      lang: 'breadCrumb.informationClassificationEditor',
      breadcrumbsBefore: [
        { name: '资讯分类管理', link: '/content/information-manage', lang: 'nav.InfoClassManagement' },
      ],
    },
  },
  {
    path: 'last-page',
    component: LastPageComponent,
    data: { name: '页尾管理', showMerchant: true, code: '277', lang: 'nav.footerManagement' },
  },
  {
    path: 'jurisdiction',
    component: JurisdictionComponent,
    data: { name: '司法管辖区配置', code: '278', lang: 'nav.jurisdConfiguration' },
  },
  {
    path: 'multilingualism-manage',
    component: MultilingualismManageComponent,
    data: { name: '多语系管理', code: '279', lang: 'breadCrumb.multilingualManagement' },
  },
  {
    path: 'messagestation-manage',
    component: MessagestationManageComponent,
    data: { name: '站内信管理', code: '280', lang: 'nav.messageManagement' },
    children: [
      { path: '', redirectTo: 'messagestation-log', pathMatch: 'full' },
      {
        path: 'messagestation-log',
        component: MessagestationLogComponent,
        data: { name: '站内信记录', lang: 'breadCrumb.siteletterRecord', showMerchant: true },
      },
      {
        path: 'messagestation-template',
        component: MessagestationTemplateComponent,
        data: { name: '站内信模板', keep: true, lang: 'breadCrumb.inSiteletterTemplate' },
      },
    ],
  },
  {
    path: 'messagestation-manage/messagestation-log/:id',
    component: EditMessagestationLogComponent,
    data: {
      name: '编辑站内信记录',
      lang: 'breadCrumb.editSiteLetterLog',
      showMerchant: true,
      breadcrumbsBefore: [
        {
          name: '站内信记录',
          link: '/content/messagestation-manage/messagestation-log',
          lang: 'breadCrumb.siteletterRecord',
        },
      ],
    },
  },
  {
    path: 'messagestation-manage/messagestation-template/:id',
    component: MessagestationTemplateEditComponent,
    data: {
      name: '编辑站内信模板',
      lang: 'breadCrumb.editSiteLetterTemplate',
      showMerchant: true,
      breadcrumbsBefore: [
        {
          name: '站内信模板',
          link: '/content/messagestation-manage/messagestation-template',
          lang: 'breadCrumb.inSiteletterTemplate',
        },
      ],
    },
  },
  {
    path: 'banner-manage',
    component: BannerManageComponent,
    data: { name: 'banner管理', showMerchant: true, code: '275', lang: 'breadCrumb.bannerManagement' },
  },
  {
    path: 'banner-manage/add',
    component: BannerManageEditComponent,
    data: {
      name: 'banner新增',
      lang: 'breadCrumb.newBanner',
      breadcrumbsBefore: [{ name: 'banner管理', link: '/content/banner-manage', lang: 'breadCrumb.bannerManagement' }],
    },
  },
  {
    path: 'banner-manage/:id',
    component: BannerManageEditComponent,
    data: {
      name: 'banner编辑',
      lang: 'breadCrumb.bannerEdit',
      breadcrumbsBefore: [{ name: 'banner管理', link: '/content/banner-manage', lang: 'breadCrumb.bannerManagement' }],
    },
  },
];
