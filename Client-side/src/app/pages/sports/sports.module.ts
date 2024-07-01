import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { FullscreenModule } from 'src/app/shared/components/fullscreen/fullscreen.module';
import { NormalCarouselModule } from 'src/app/shared/components/normal-carousel/normal-carousel.module';
import { SwiperUnitModule } from 'src/app/shared/components/swiper-unit/swiper-unit.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { DailyRacesModule } from '../daily-races/daily-races.module';
import { SportsComponent } from './sports.component';
import { SportsRoutes } from './sports.routing';

@NgModule({
  imports: [
    SportsRoutes,
    NormalCarouselModule,
    DailyRacesModule,
    SwiperUnitModule,
    FullscreenModule,
    PipesModule,
    CustomizeFormModule,
    OverlayModule,
    CommonModule,
    ClickOutsideModule,
  ],
  declarations: [SportsComponent],
})
export class SportsModule {}
