import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RealBetModule } from 'src/app/orignal/shared/components/real-bet/real-bet.module';
import { ScrollSelectItemModule } from 'src/app/shared/components/scroll-select-item/scroll-select-item.module';
import { PipesModule } from '../../pipes/pipes.module';
import { BetSizeModule } from '../bet-size/bet-size.module';
import { dialogTopUpModule } from '../dialog-top-up/dialog-top-up.module';
import { AutoModule } from './auto/auto.module';
import { BetComponent } from './bet.component';

@NgModule({
  declarations: [BetComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatSlideToggleModule,
    AutoModule,
    PipesModule,
    RealBetModule,
    MatSelectModule,
    BetSizeModule,
    ScrollSelectItemModule,
    dialogTopUpModule,
  ],
  exports: [BetComponent],
})
export class BetModule {}
