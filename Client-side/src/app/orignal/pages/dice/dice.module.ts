import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSliderModule } from 'ngx-slider-v2';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { DiceComponent } from './dice.component';
import { DiceRoutes } from './dice.routing';
import { JackportModule } from './jackport/jackport.module';

@NgModule({
  imports: [
    CommonModule,
    DiceRoutes,
    PipesModule,
    NgxSliderModule,
    BetModule,
    MatDialogModule,
    ScrollbarModule,
    JackportModule,
    MatTooltipModule,
    BarModule,
  ],
  providers: [CurrencyValuePipe],
  declarations: [DiceComponent],
})
export class DiceModule {}
