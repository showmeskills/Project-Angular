import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetSizeModule } from '../../shared/components/bet-size/bet-size.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { HiloComponent } from './hilo.component';
import { HiloRoutes } from './hilo.routing';

@NgModule({
  imports: [CommonModule, HiloRoutes, PipesModule, BetModule, BarModule, BetSizeModule],
  providers: [CurrencyValuePipe],
  declarations: [HiloComponent],
})
export class HiloModule {}
