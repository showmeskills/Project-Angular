import { Routes } from '@angular/router';
import { DetailComponent } from './detail/detail.component';
import { OverviewComponent } from './detail/overview/overview.component';
import { ListComponent } from './list/list.component';
import { FundingComponent } from './detail/overview/funding/funding.component';
import { TradeCasinoComponent } from './detail/trade/trade-casino/trade-casino.component';
import { TradeSportComponent } from './detail/trade/trade-sport/trade-sport.component';
import { TradeRealComponent } from './detail/trade/trade-real/trade-real.component';
import { TradeLotteryComponent } from './detail/trade/trade-lottery/trade-lottery.component';
import { TradeChessComponent } from './detail/trade/trade-chess/trade-chess.component';
import { TradeProxyComponent } from 'src/app/pages/member/detail/trade/trade-proxy/trade-proxy.component';
import { TradeBalanceComponent } from 'src/app/pages/member/detail/trade/trade-balance/trade-balance.component';
import { VipManagementComponent } from 'src/app/pages/vip/vip-management/vip-management.component';
import { TradeFeeComponent } from './detail/trade/trade-fee/trade-fee.component';
import { MessageSendComponent } from './list/message-send/message-send.component';
import { NonStickyComponent } from './list/non-sticky/non-sticky.component';
import { FreeSpinDetailComponent } from 'src/app/pages/member/detail//free-spin-detail/free-spin-detail.component';
import { CorrespondenceNoteComponent } from 'src/app/pages/member/detail/correspondence-note/correspondence-note.component';
import { MessageBanListComponent } from 'src/app/pages/member/list/message-ban-list/message-ban-list.component';
import { MessageWhiteListComponent } from 'src/app/pages/member/list/message-white-list/message-white-list.component';
import { IpSessionsComponent } from 'src/app/pages/member/detail/ip-sessions/ip-sessions-detail.component';

const detail: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },

  {
    path: 'overview',
    component: OverviewComponent,
    data: { name: '总览', showTime: true, lang: 'breadCrumb.overview' },
  },

  {
    path: 'trade/casino',
    component: TradeCasinoComponent,
    data: { name: '娱乐城', lang: 'breadCrumb.Casino' },
  },
  {
    path: 'trade/sport',
    component: TradeSportComponent,
    data: { name: '体育', lang: 'breadCrumb.physicalEducation' },
  },
  {
    path: 'trade/real',
    component: TradeRealComponent,
    data: { name: '真人娱乐城', lang: 'breadCrumb.LiveCasino' },
  },
  {
    path: 'trade/lottery',
    component: TradeLotteryComponent,
    data: { name: '彩票', lang: 'breadCrumb.lotteryTicket' },
  },
  {
    path: 'trade/chess',
    component: TradeChessComponent,
    data: { name: '棋牌', lang: 'breadCrumb.chessCards' },
  },
  {
    path: 'trade/proxy',
    component: TradeProxyComponent,
    data: { name: '代理訊息', lang: 'breadCrumb.proxyMessage' },
  },
  {
    path: 'trade/balance',
    component: TradeBalanceComponent,
    data: { name: '游戏余额', lang: 'breadCrumb.gameBalance' },
  },
  {
    path: 'trade/fee',
    component: TradeFeeComponent,
    data: { name: '手续费', lang: 'breadCrumb.fee' },
  },
];

/** 添加会员列表的面包屑 */
detail.forEach((e) => {
  if (e.data) {
    e.data['breadcrumbsBefore'] = [{ name: '会员列表', link: '/member/list', lang: 'nav.memberList' }];
  }
});

export const routes: Routes = [
  { path: '', redirectTo: 'list/detail/overview', pathMatch: 'full' },
  {
    path: 'list',
    component: ListComponent,
    data: {
      name: '会员列表',
      showMerchant: true,
      // showCountry: true,
      showRegion: true,
      code: '203',
      keep: true,
      lang: 'nav.memberList',
    },
  },
  {
    path: 'list/detail',
    component: DetailComponent,
    data: { name: '会员管理', lang: 'nav.memberManagement' },
    children: [...detail /*, ...detail.map(e => ({...e, path: e.path ? e.path + '/:uid' : e.path}))*/],
  },
  {
    path: 'list/detail/funding-history',
    component: FundingComponent,
    data: { name: '资金历程', lang: 'breadCrumb.fundingHistory' },
  },
  {
    path: 'vip-management',
    component: VipManagementComponent,
    data: { name: 'vip管理', showMerchant: true, code: '204', lang: 'breadCrumb.vipManagement' },
  },
  {
    path: 'list/detail/message-send',
    component: MessageSendComponent,
    data: {
      name: '群发站内信',
      lang: 'member.model.groupMail',
      breadcrumbsBefore: [{ name: '会员列表', link: '/member/list', lang: 'nav.memberList' }],
    },
  },
  {
    path: 'list/detail/non-sticky',
    component: NonStickyComponent,
    data: { name: '非粘性奖金', lang: 'member.detail.nonsticky.nonsticky' },
  },
  {
    path: 'list/detail/free-spin-detail',
    component: FreeSpinDetailComponent,
    data: { name: '免费旋转', lang: 'member.detail.freeSpin.freeSpin' },
  },
  {
    path: 'list/detail/correspondence-note',
    component: CorrespondenceNoteComponent,
    data: { name: '通讯记录', lang: 'member.overview.correspondence.title' },
  },
  {
    path: 'list/detail/ip-sessions',
    component: IpSessionsComponent,
    data: { name: 'IP会话', lang: 'member.detail.ipSessions' },
  },
  {
    path: 'list/message-ban-list',
    component: MessageBanListComponent,
    data: {
      name: '在线消息禁用名单',
      lang: 'member.list.banList',
      showMerchant: true,
      breadcrumbsBefore: [{ name: '会员列表', link: '/member/list', lang: 'nav.memberList' }],
    },
  },
  {
    path: 'list/message-white-list',
    component: MessageWhiteListComponent,
    data: {
      name: '在线消息白名单',
      lang: 'member.list.whiteList',
      showMerchant: true,
      breadcrumbsBefore: [{ name: '会员列表', link: '/member/list', lang: 'nav.memberList' }],
    },
  },
];
