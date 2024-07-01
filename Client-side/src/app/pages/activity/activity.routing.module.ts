import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BetFreeJackpotCaptionComponent } from './bet-free-jackpot/bet-free-jackpot-caption/bet-free-jackpot-caption.component';
import { BetFreeJackpotHistoryComponent } from './bet-free-jackpot/bet-free-jackpot-history/bet-free-jackpot-history.component';
import { BetFreeJackpotHomeComponent } from './bet-free-jackpot/bet-free-jackpot-home/bet-free-jackpot-home.component';
import { BetFreeJackpotNowComponent } from './bet-free-jackpot/bet-free-jackpot-now/bet-free-jackpot-now.component';
import { BetFreeJackpotRankComponent } from './bet-free-jackpot/bet-free-jackpot-rank/bet-free-jackpot-rank.component';
import { BetFreeJackpotComponent } from './bet-free-jackpot/bet-free-jackpot.component';
import { Euro2024Component } from './euro2024/euro2024.component';
import { TournamentDetailsComponent } from './tournament/tournament-details/tournament-details.component';
import { TournamentComponent } from './tournament/tournament.component';

const routes: Routes = [
  { path: '', redirectTo: '/404', pathMatch: 'full' },
  // 每周竞猜活动
  {
    path: 'betfreejackpot',
    component: BetFreeJackpotComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: BetFreeJackpotHomeComponent },
      { path: 'now', component: BetFreeJackpotNowComponent },
      { path: 'history', component: BetFreeJackpotHistoryComponent },
      { path: 'rank', component: BetFreeJackpotRankComponent },
      { path: 'caption', component: BetFreeJackpotCaptionComponent },
    ],
  },
  // tournament 竞赛活动
  { path: 'tournament', component: TournamentComponent },
  { path: 'tournament-detail', component: TournamentDetailsComponent },
  { path: 'euro2024', component: Euro2024Component },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActivityRoutingModule {}
