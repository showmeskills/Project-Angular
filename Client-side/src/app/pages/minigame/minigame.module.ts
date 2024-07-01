import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { FullscreenModule } from 'src/app/shared/components/fullscreen/fullscreen.module';
import { GameInfoModule } from 'src/app/shared/components/game-info/game-info.module';
import { NormalCarouselModule } from 'src/app/shared/components/normal-carousel/normal-carousel.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { SwiperUnitModule } from 'src/app/shared/components/swiper-unit/swiper-unit.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LifeObserveModule } from 'src/app/shared/directive/life-observe/life-observe.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { TournamentModule } from '../activity/tournament/tournament.module';
import { DailyRacesModule } from '../daily-races/daily-races.module';
import { VerifyCodeModule } from './../../shared/components/verify-code/verify-code.module';
import { GameItemSkeletonModule } from './game-item-skeleton/game-item-skeleton.module';
import { GameLevel2Component } from './game-level2/game-level2.component';
import { GameLevel3Component } from './game-level3/game-level3.component';
import { GameLikeCollectionComponent } from './game-like-collection/game-like-collection.component';
import { GamePaginatorComponent } from './game-paginator/game-paginator.component';
import { GameProviderComponent } from './game-provider/game-provider.component';
import { GameRecentPlayedComponent } from './game-recent-played/game-recent-played.component';
import { HomeSubModule } from './home-sub/home-sub.module';
import { MinigameComponent } from './minigame.component';
import { MinigameRoutes } from './minigame.routing';
import { PageBannerComponent } from './page-banner/page-banner.component';
import { SearchGameComponent } from './search-game/search-game.component';
@NgModule({
  imports: [
    CommonModule,
    LifeObserveModule,
    FormsModule,
    HomeSubModule,
    GameItemSkeletonModule,
    VerifyCodeModule,
    MinigameRoutes,
    MatToolbarModule,
    MatSidenavModule,
    MatTabsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    ClickOutsideModule,
    PipesModule,
    NormalCarouselModule,
    SwiperUnitModule,
    CustomizeFormModule,
    MatTooltipModule,
    LoadingModule,
    OverlayModule,
    ToolTipModule,
    EmptyModule,
    ScrollbarModule,
    FullscreenModule,
    DailyRacesModule,
    GameInfoModule,
    TournamentModule,
  ],
  declarations: [
    MinigameComponent,
    SearchGameComponent,
    GameLevel2Component,
    GameLevel3Component,
    // BettingInfoComponent,
    PageBannerComponent,
    GameProviderComponent,
    GamePaginatorComponent,
    GameLikeCollectionComponent,
    GameRecentPlayedComponent,
  ],
})
export class MinigameModule {}
