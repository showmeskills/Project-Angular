import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetSizeModule } from '../../shared/components/bet-size/bet-size.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { CsgoComponent } from './csgo.component';
import { CsgoRoutes } from './csgo.routing';
@NgModule({
  imports: [CommonModule, CsgoRoutes, PipesModule, BarModule, BetSizeModule, BetModule, MatTabsModule],
  providers: [CurrencyValuePipe],
  declarations: [CsgoComponent],
})
export class CsgoModule {}
