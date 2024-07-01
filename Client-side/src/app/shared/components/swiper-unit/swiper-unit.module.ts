import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IntersectionObserverModule } from '../../directive/intersection-observer/intersection-observer.module';
import { LoadingModule } from '../../directive/loading/loading.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ImgCarouselModule } from '../img-carousel/img-carousel.module';
import { LazyImageComponent } from '../lazy-image/lazy-image.component';
import { GameUnitComponent } from './game-unit/game-unit.component';
import { SportUnitComponent } from './sport-unit/sport-unit.component';
import { SwiperProviderListComponent } from './swiper-provider-list/swiper-provider-list.component';
import { SwiperUnitComponent } from './swiper-unit.component';

@NgModule({
  imports: [
    CommonModule,
    IntersectionObserverModule,
    PipesModule,
    LoadingModule,
    ImgCarouselModule,
    LazyImageComponent,
  ],
  declarations: [SwiperUnitComponent, GameUnitComponent, SwiperProviderListComponent, SportUnitComponent],
  exports: [SwiperUnitComponent, GameUnitComponent, SwiperProviderListComponent],
})
export class SwiperUnitModule {}
