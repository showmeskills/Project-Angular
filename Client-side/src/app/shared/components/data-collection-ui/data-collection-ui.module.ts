import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DataCollectionUiComponent } from './data-collection-ui.component';

@NgModule({
  imports: [CommonModule, DragDropModule],
  declarations: [DataCollectionUiComponent],
  exports: [DataCollectionUiComponent],
})
export class DataCollectionUiModule {}
