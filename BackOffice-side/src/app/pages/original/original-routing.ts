import { Routes } from '@angular/router';
import { OddsComponent } from 'src/app/pages/original/odds/odds.component';
import { BetComponent } from 'src/app/pages/original/bet/bet.component';
import { AnalysisComponent } from 'src/app/pages/original/analysis/analysis.component';
import { profitAnalysisComponent } from 'src/app/pages/original/profit-analysis/profit-analysis.component';

export const routes: Routes = [
  { path: '', redirectTo: 'odds', pathMatch: 'full' },
  {
    path: 'bet',
    component: BetComponent,
    data: { name: '注单查询', showMerchant: true, lang: 'nav.betSingleQuery' },
  },
  {
    path: 'odds',
    component: OddsComponent,
    data: { name: '限额设定', showMerchant: true, lang: 'nav.limitSetting' },
  },
  {
    path: 'analysis',
    component: AnalysisComponent,
    data: { name: '输赢分析', showMerchant: true, lang: 'nav.winLossAnalysis' },
  },
  {
    path: 'profitAnalysis',
    component: profitAnalysisComponent,
    data: { name: '盈利率分析', showMerchant: true, lang: 'nav.profitAnalysis' },
  },
];
