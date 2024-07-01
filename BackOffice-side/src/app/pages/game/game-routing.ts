import { Routes } from '@angular/router';
import { GameLabelComponent } from './game-label/game-label.component';
import { GameLabelNewComponent } from './game-label/game-label-new/game-label-new.component';
import { GameManageComponent } from './game-manage/game-manage.component';
import { EditComponent as GameManageEditComponent } from './game-manage/edit/edit.component';
import { ProviderComponent } from 'src/app/pages/game/provider/provider.component';
import { ProviderEditComponent } from 'src/app/pages/game/provider-edit/provider-edit.component';
import { GameComponent } from 'src/app/pages/game/game/game.component';
import { GameConfigurationComponent } from 'src/app/pages/game/game-configuration/game-configuration.component';
import { ThreerdGameManageComponent } from 'src/app/pages/game/3rd-game-manage/3rd-game-manage.component';

export const routes: Routes = [
  { path: '', redirectTo: 'provider', pathMatch: 'full' },

  //厂商
  {
    path: 'provider',
    component: ProviderComponent,
    data: {
      name: '厂商管理',
      code: '248',
      lang: 'nav.vendorManagement',
      keep: true,
    },
    pathMatch: 'full',
  },
  {
    path: 'provider/0',
    component: ProviderEditComponent,
    data: {
      name: '新增厂商',
      lang: 'breadCrumb.addVendor',
      breadcrumbsBefore: [{ name: '厂商管理', link: '/game/provider', lang: 'nav.vendorManagement' }],
    },
    pathMatch: 'full',
  },
  {
    path: 'provider/:id',
    component: ProviderEditComponent,
    data: {
      name: '编辑厂商',
      lang: 'breadCrumb.editManufacturer',
      breadcrumbsBefore: [{ name: '厂商管理', link: '/game/provider', lang: 'nav.vendorManagement' }],
    },
    pathMatch: 'full',
  },
  //游戏
  {
    path: 'list',
    component: GameComponent,
    data: {
      name: '游戏列表',
      showMerchant: true,
      code: '252',
      lang: 'breadCrumb.gameList',
    },
  },
  {
    path: 'list/configuration',
    component: GameConfigurationComponent, // 由于xss因素不支持动态配置 https://github.com/angular/angular/issues/15275#issuecomment-877496933
    data: {
      name: '新增游戏',
      breadcrumbsBefore: [{ name: '游戏管理', link: '/game/list', lang: 'nav.gameManagement' }],
      lang: 'breadCrumb.addGame',
    },
  },
  {
    path: 'list/configuration/:id/:merchantId',
    component: GameConfigurationComponent,
    data: {
      name: '编辑游戏',
      breadcrumbsBefore: [{ name: '游戏管理', link: '/game/list', lang: 'nav.gameManagement' }],
      lang: 'editGame',
    },
  },
  {
    path: 'manage',
    component: GameManageComponent,
    data: { name: '游戏管理', showMerchant: true, code: '306', lang: 'breadCrumb.newGameManagement', keep: true },
  },
  {
    path: 'manage/:id',
    component: GameManageEditComponent,
    data: {
      name: '游戏编辑',
      lang: 'breadCrumb.gameEditor',
      breadcrumbsBefore: [{ name: '游戏管理', link: '/game/manage', lang: 'breadCrumb.newGameManagement' }],
    },
  },
  {
    path: 'label',
    component: GameLabelComponent,
    data: {
      name: '游戏标签列表',
      match: 'game-label',
      code: '253',
      lang: 'breadCrumb.ListGameTags',
      showMerchant: true,
    },
  },
  {
    path: 'label/labelnew',
    component: GameLabelNewComponent,
    data: {
      name: '游戏标签列表2.0',
      lang: 'breadCrumb.ListGameTags',
      code: '317',
      showMerchant: true,
    },
  },
  {
    path: '3rdManage',
    component: ThreerdGameManageComponent,
    data: { name: '第三方游戏管理', showMerchant: true, code: '10019', lang: 'nav.3rdGameManagement', keep: true },
  },
];
