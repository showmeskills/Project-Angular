import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomizeTextComponent } from './customize-text.component';

@NgModule({
  imports: [CommonModule],
  declarations: [CustomizeTextComponent],
  exports: [CustomizeTextComponent],
})
export class CustomizeTextModule {}
