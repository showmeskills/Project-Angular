import { Routes } from '@angular/router';
import { BetSingleQueryComponent } from 'src/app/pages/lottery/bet-single-query/bet-single-query.component';
import { OddsSettingComponent } from 'src/app/pages/lottery/odds-setting/odds-setting.component';
import { WinLossAnalysisComponent } from 'src/app/pages/lottery/win-loss-analysis/win-loss-analysis.component';
import { LotterySettingComponent } from 'src/app/pages/lottery/lottery-setting/lottery-setting.component';
import { HandicapComponent } from 'src/app/pages/lottery/win-loss-analysis/handicap/handicap.component';

export const routes: Routes = [
  { path: '', redirectTo: 'odds', pathMatch: 'full' },
  {
    path: 'odds',
    component: OddsSettingComponent,
    data: { name: '赔率设定', showMerchant: true, code: '262', lang: 'breadCrumb.oddsSetting' },
  },
  {
    path: 'bet',
    component: BetSingleQueryComponent,
    data: { name: '注单查询', showMerchant: true, code: '263', lang: 'nav.betSingleQuery' },
  },
  {
    path: 'analysis',
    component: WinLossAnalysisComponent,
    data: { name: '输赢分析', showMerchant: true, code: '264', lang: 'nav.winLossAnalysis' },
  },
  {
    path: 'analysis/:id',
    component: HandicapComponent,
    data: { name: '单一盘口', showMerchant: true, lang: 'breadCrumb.singleMarket' },
  },
  {
    path: 'setting',
    component: LotterySettingComponent,
    data: { name: '彩种设定', showMerchant: true, code: '265', lang: 'nav.colorSetting' },
  },
];
