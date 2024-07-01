import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgApexchartsModule } from 'ng-apexcharts';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { StatisticsPanelComponent } from './statistics-panel.component';
@NgModule({
  declarations: [StatisticsPanelComponent],
  imports: [
    CommonModule,
    PipesModule,
    FormsModule,
    MatSlideToggleModule,
    ScrollbarModule,
    MatSelectModule,
    DragDropModule,
    NgApexchartsModule,
  ],
  exports: [StatisticsPanelComponent],
})
export class StatisticsPanelModule {}
