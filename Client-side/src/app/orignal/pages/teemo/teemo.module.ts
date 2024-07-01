import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { TeemoComponent } from './teemo.component';
import { TeemoRoutes } from './teemo.routing';

@NgModule({
  imports: [CommonModule, TeemoRoutes, PipesModule, BetModule, BarModule, MatTabsModule],
  providers: [CurrencyValuePipe],
  declarations: [TeemoComponent],
})
export class TeemoModule {}
