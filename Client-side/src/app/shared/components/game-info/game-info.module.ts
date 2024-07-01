import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { DailyRacesModule } from 'src/app/pages/daily-races/daily-races.module';
import { PipesModule } from '../../pipes/pipes.module';
import { SwiperUnitModule } from '../swiper-unit/swiper-unit.module';
import { GameInfoComponent } from './game-info.component';

@NgModule({
  imports: [CommonModule, PipesModule, SwiperUnitModule, MatTabsModule, RouterModule, DailyRacesModule],
  declarations: [GameInfoComponent],
  exports: [GameInfoComponent],
})
export class GameInfoModule {}
