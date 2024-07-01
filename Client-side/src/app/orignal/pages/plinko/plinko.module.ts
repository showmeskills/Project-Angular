import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetSizeModule } from '../../shared/components/bet-size/bet-size.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { PlinkoComponent } from './plinko.component';
import { PlinkoRoutes } from './plinko.routing';
@NgModule({
  imports: [CommonModule, PlinkoRoutes, PipesModule, BetModule, BarModule, BetSizeModule],
  providers: [CurrencyValuePipe],
  declarations: [PlinkoComponent],
})
export class PlinkoModule {}
