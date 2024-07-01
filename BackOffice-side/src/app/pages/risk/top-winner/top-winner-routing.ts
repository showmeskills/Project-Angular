import { Routes } from '@angular/router';
import { TopWinnerComponent } from 'src/app/pages/risk/top-winner/top-winner.component';
import { TopWinnerUserComponent } from 'src/app/pages/risk/top-winner/top-winner-user/top-winner-user.component';
import { TopWinnerProviderComponent } from 'src/app/pages/risk/top-winner/top-winner-provider/top-winner-provider.component';
import { TopWinnerDailyComponent } from 'src/app/pages/risk/top-winner/top-winner-daily/top-winner-daily.component';
// import { LogsComponent } from 'src/app/pages/system/data-export-com/logs/logs.component';

// 市场数据、VIP数据、提款日志
export let topWinnerRoutesTab: Routes = [
  {
    path: 'user',
    component: TopWinnerUserComponent,
    data: { name: '最优胜的用户报表', showMerchant: true, lang: 'risk.topWin.user' },
  },
  {
    path: 'provider',
    component: TopWinnerProviderComponent,
    data: { name: '每个厂商最优胜的UID', showMerchant: true, lang: 'risk.topWin.provider' },
  },
  {
    path: 'daily',
    component: TopWinnerDailyComponent,
    data: { name: '每日最优胜的UID', showMerchant: true, lang: 'risk.topWin.daily' },
  },
];

export const topWinnerRoutes: Routes = [
  {
    path: 'top-winner',
    component: TopWinnerComponent,
    data: { name: '最优胜报表', showMerchant: true, code: '325', lang: 'nav.topWinnerReport' },
    children: [{ path: '', redirectTo: 'user', pathMatch: 'full' }, ...topWinnerRoutesTab],
  },
];
