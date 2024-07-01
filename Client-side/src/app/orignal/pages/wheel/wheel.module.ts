import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetSizeModule } from '../../shared/components/bet-size/bet-size.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { WheelComponent } from './wheel.component';
import { WheelRoutes } from './wheel.routing';
@NgModule({
  imports: [CommonModule, WheelRoutes, PipesModule, BarModule, BetSizeModule, BetModule, MatTabsModule],
  providers: [CurrencyValuePipe],
  declarations: [WheelComponent],
})
export class WheelModule {}
