import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RealBetModule } from 'src/app/orignal/shared/components/real-bet/real-bet.module';
import { PipesModule } from '../../pipes/pipes.module';
import { BetSizeComponent } from './bet-size.component';

@NgModule({
  declarations: [BetSizeComponent],
  imports: [CommonModule, FormsModule, MatSlideToggleModule, PipesModule, RealBetModule, MatSelectModule],
  exports: [BetSizeComponent],
})
export class BetSizeModule {}
