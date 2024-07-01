import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxSliderModule } from 'ngx-slider-v2';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetSizeModule } from '../../shared/components/bet-size/bet-size.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { SpaceDiceComponent } from './space-dice.component';
import { SpaceDiceRoutes } from './space-dice.routing';
@NgModule({
  imports: [
    CommonModule,
    SpaceDiceRoutes,
    PipesModule,
    FormsModule,
    BarModule,
    BetSizeModule,
    BetModule,
    MatTabsModule,
    NgxSliderModule,
    ReactiveFormsModule,
  ],
  providers: [CurrencyValuePipe],
  declarations: [SpaceDiceComponent],
})
export class SpaceDiceModule {}
