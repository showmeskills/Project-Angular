import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { JackportComponent } from './jackport.component';

@NgModule({
  declarations: [JackportComponent],
  imports: [CommonModule, PipesModule, FormsModule, MatSlideToggleModule, ScrollbarModule],
  exports: [JackportComponent],
})
export class JackportModule {}
