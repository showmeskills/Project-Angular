import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RealBetModule } from 'src/app/orignal/shared/components/real-bet/real-bet.module';
import { PipesModule } from '../../pipes/pipes.module';

import { BetListComponent } from './bet-list.component';

@NgModule({
  declarations: [BetListComponent],
  imports: [CommonModule, FormsModule, MatSlideToggleModule, PipesModule, RealBetModule, MatSelectModule],
  exports: [BetListComponent],
})
export class BetListModule {}
