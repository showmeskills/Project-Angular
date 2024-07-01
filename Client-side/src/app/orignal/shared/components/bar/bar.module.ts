import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PipesModule } from '../../pipes/pipes.module';
import { FairnessModule } from '../fairness/fairness.module';
import { HotkeyModule } from '../hotkey/hotkey.module';
import { RulesModule } from '../rules/rules.module';
import { StatisticsPanelModule } from '../statistics-panel/statistics-panel.module';

import { BarComponent } from './bar.component';

@NgModule({
  declarations: [BarComponent],
  imports: [
    CommonModule,
    FormsModule,
    PipesModule,
    FairnessModule,
    HotkeyModule,
    RulesModule,
    MatTooltipModule,
    StatisticsPanelModule,
  ],
  exports: [BarComponent],
})
export class BarModule {}
