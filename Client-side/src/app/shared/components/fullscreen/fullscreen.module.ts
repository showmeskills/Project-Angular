import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FullscreenComponent } from './fullscreen.component';

@NgModule({
  imports: [CommonModule, DragDropModule],
  declarations: [FullscreenComponent],
  exports: [FullscreenComponent],
})
export class FullscreenModule {}
