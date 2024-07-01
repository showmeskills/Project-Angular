import { RouterModule, Routes } from '@angular/router';
import { ObLotteryComponent } from './obLottery.component';

const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  { path: ':sub', component: ObLotteryComponent, data: { keep: true } },
  { path: '**', redirectTo: '' },
];

export const ObLotteryRoutingModule = RouterModule.forChild(routes);
