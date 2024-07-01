import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FooterModule } from 'src/app/layouts/footer/footer.module';
import { SwiperUnitModule } from 'src/app/shared/components/swiper-unit/swiper-unit.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { NormalCarouselModule } from '../../shared/components/normal-carousel/normal-carousel.module';
import { DailyRacesModule } from '../daily-races/daily-races.module';
import { HomeSubModule } from '../minigame/home-sub/home-sub.module';
import { LobbyCategoryMenuComponent } from './lobby-category-menu/lobby-category-menu.component';
import { ObLotteryComponent } from './obLottery.component';
import { ObLotteryRoutingModule } from './obLottery.routing';
import { topMenuComponent } from './top-menu/top-menu.component';

@NgModule({
  imports: [
    CommonModule,
    HomeSubModule,
    ObLotteryRoutingModule,
    NormalCarouselModule,
    SwiperUnitModule,
    FooterModule,
    PipesModule,
    DailyRacesModule,
  ],
  declarations: [ObLotteryComponent, LobbyCategoryMenuComponent, topMenuComponent],
})
export class ObLotteryModule {}
