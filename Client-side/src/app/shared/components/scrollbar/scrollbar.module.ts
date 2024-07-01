import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ScrollbarComponent } from './scrollbar.component';

@NgModule({
  imports: [CommonModule, ScrollingModule],
  declarations: [ScrollbarComponent],
  exports: [ScrollbarComponent],
})
export class ScrollbarModule {}
