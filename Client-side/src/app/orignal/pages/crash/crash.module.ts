import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { BarModule } from '../../shared/components/bar/bar.module';
import { BetModule } from '../../shared/components/bet/bet.module';
import { RealBetModule } from '../../shared/components/real-bet/real-bet.module';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { CrashComponent } from './crash.component';
import { CrashRoutes } from './crash.routing';

@NgModule({
  imports: [CommonModule, CrashRoutes, PipesModule, BetModule, BarModule, RealBetModule],
  providers: [CurrencyValuePipe],
  declarations: [CrashComponent],
})
export class CrashModule {}
