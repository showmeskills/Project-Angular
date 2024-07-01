import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { TowerComponent } from './tower.component';
import { TowerRoutes } from './tower.routing';

@NgModule({
  imports: [CommonModule, TowerRoutes, PipesModule, BetModule, BarModule, MatTabsModule],
  providers: [CurrencyValuePipe],
  declarations: [TowerComponent],
})
export class TowerModule {}
