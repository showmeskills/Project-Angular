import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SwiperUnitModule } from 'src/app/shared/components/swiper-unit/swiper-unit.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { GameItemSkeletonModule } from '../game-item-skeleton/game-item-skeleton.module';
import { HomeSubComponent } from './home-sub.component';

@NgModule({
  imports: [CommonModule, PipesModule, GameItemSkeletonModule, SwiperUnitModule],
  declarations: [HomeSubComponent],
  exports: [HomeSubComponent],
})
export class HomeSubModule {}
