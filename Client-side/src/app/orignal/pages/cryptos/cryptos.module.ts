import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetSizeModule } from '../../shared/components/bet-size/bet-size.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { CryptosComponent } from './cryptos.component';
import { CryptosRoutes } from './cryptos.routing';
@NgModule({
  imports: [CommonModule, CryptosRoutes, PipesModule, BarModule, BetSizeModule, BetModule, MatTabsModule],
  providers: [CurrencyValuePipe],
  declarations: [CryptosComponent],
})
export class CryptosModule {}
