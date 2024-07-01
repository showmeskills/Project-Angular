import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { AutoModule } from '../bet/auto/auto.module';
import { RealBetComponent } from './real-bet.component';

@NgModule({
  declarations: [RealBetComponent],
  imports: [CommonModule, FormsModule, MatSlideToggleModule, AutoModule, PipesModule],
  exports: [RealBetComponent],
})
export class RealBetModule {}
