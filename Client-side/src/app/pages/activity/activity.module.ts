import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { ImgDpiModule } from 'src/app/shared/components/img-dpi/img-dpi.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ScrollSelectItemModule } from 'src/app/shared/components/scroll-select-item/scroll-select-item.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LifeObserveModule } from 'src/app/shared/directive/life-observe/life-observe.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { ActivityRoutingModule } from './activity.routing.module';
import { BetFreeJackpotCaptionComponent } from './bet-free-jackpot/bet-free-jackpot-caption/bet-free-jackpot-caption.component';
import { BetFreeJackpotHistoryComponent } from './bet-free-jackpot/bet-free-jackpot-history/bet-free-jackpot-history.component';
import { BetFreeJackpotHomeComponent } from './bet-free-jackpot/bet-free-jackpot-home/bet-free-jackpot-home.component';
import { BetFreeJackpotNowComponent } from './bet-free-jackpot/bet-free-jackpot-now/bet-free-jackpot-now.component';
import { BetFreeJackpotRankComponent } from './bet-free-jackpot/bet-free-jackpot-rank/bet-free-jackpot-rank.component';
import { BetFreeJackpotComponent } from './bet-free-jackpot/bet-free-jackpot.component';
import { Euro2024Component } from './euro2024/euro2024.component';
import { NewUserPrizeComponent } from './new-user-prize/new-user-prize.component';
import { TournamentModule } from './tournament/tournament.module';
import { WheelComponent } from './wheel/wheel.component';

@NgModule({
  imports: [
    CommonModule,
    LifeObserveModule,
    ActivityRoutingModule,
    PaginatorModule,
    ScrollbarModule,
    CustomizeFormModule,
    EmptyModule,
    DragDropModule,
    LoadingModule,
    ClickOutsideModule,
    PipesModule,
    ImgDpiModule,
    ScrollSelectItemModule,
    TournamentModule,
    ScrollbarModule,
  ],
  declarations: [
    BetFreeJackpotComponent,
    BetFreeJackpotHomeComponent,
    BetFreeJackpotNowComponent,
    BetFreeJackpotHistoryComponent,
    BetFreeJackpotCaptionComponent,
    BetFreeJackpotRankComponent,
    WheelComponent,
    NewUserPrizeComponent,
    Euro2024Component,
  ],
})
export class ActivityModule {}
