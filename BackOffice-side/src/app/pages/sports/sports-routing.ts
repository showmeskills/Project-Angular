import { Routes } from '@angular/router';
import { LeagueManageComponent } from './league-manage/league-manage.component';
import { BetManageComponent } from './bet-manage/bet-manage.component';
import { CompetitionManageComponent } from './competition-manage/competition-manage.component';
import { RiskManageComponent } from './risk-manage/risk-manage.component';
import { FinishMatchComponent } from './finish-match/finish-match.component';
import { EditComponent as FinishMatchEditComponent } from './finish-match/edit/edit.component';
import { CompetitionDetailsComponent } from './competition-manage/competition-details/competition-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'league-manage', pathMatch: 'full' },
  {
    path: 'league-manage',
    component: LeagueManageComponent,
    data: { name: '联赛列表', showMerchant: true, lang: 'breadCrumb.leagueList' },
  },
  {
    path: 'bet-manage',
    component: BetManageComponent,
    data: { name: '注单管理', showMerchant: true, lang: 'nav.betManagement' },
  },
  {
    path: 'competition-manage',
    component: CompetitionManageComponent,
    data: { name: '赛事列表', showMerchant: true, lang: 'nav.tournamentList' },
  },
  {
    path: 'competition-manage/details/:id',
    component: CompetitionDetailsComponent,
    data: {
      name: '赛事详情',
      lang: 'nav.tournamentList', //赛事详情（未翻译）
      showMerchant: true,
      breadcrumbsBefore: [{ name: '赛事列表', link: '/sports/competition-manage', lang: 'nav.tournamentList' }],
    },
  },
  {
    path: 'finish-match',
    component: FinishMatchComponent,
    data: { name: '完场赛事', showMerchant: true, lang: 'nav.finishMatch' },
  },
  {
    path: 'finish-match/edit',
    component: FinishMatchEditComponent,
    data: {
      name: '赛果',
      showMerchant: true,
      lang: 'nav.finishMatchEdit',
      breadcrumbsBefore: [{ name: '完场赛事', link: '/sports/finish-match', lang: 'nav.finishMatch' }],
    },
  },
  {
    path: 'risk-manage',
    component: RiskManageComponent,
    data: { name: '风险管理', showMerchant: true, lang: 'nav.riskManagement' },
  },
];
