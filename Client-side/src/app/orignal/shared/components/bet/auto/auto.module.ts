import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { PipesModule } from '../../../pipes/pipes.module';
import { AutoComponent } from './auto.component';

@NgModule({
  declarations: [AutoComponent],
  imports: [
    CommonModule,
    PipesModule,
    FormsModule,
    MatSlideToggleModule,
    MatDialogModule,
    ScrollbarModule,
    MatCheckboxModule,
  ],
  exports: [AutoComponent],
})
export class AutoModule {}
