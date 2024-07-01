import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetListModule } from '../../shared/components/bet-list/bet-list.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { CircleComponent } from './circle.component';
import { CircleRoutes } from './circle.routing';
@NgModule({
  imports: [CommonModule, CircleRoutes, PipesModule, BarModule, BetListModule, MatTabsModule],
  providers: [CurrencyValuePipe],
  declarations: [CircleComponent],
})
export class CircleModule {}
