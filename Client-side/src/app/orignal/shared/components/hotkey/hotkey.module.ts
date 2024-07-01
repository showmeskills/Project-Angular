import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { PipesModule } from '../../pipes/pipes.module';
import { HotkeyComponent } from './hotkey.component';

@NgModule({
  declarations: [HotkeyComponent],
  imports: [
    CommonModule,
    PipesModule,
    FormsModule,
    MatSlideToggleModule,
    MatDialogModule,
    ScrollbarModule,
    MatSlideToggleModule,
  ],
  exports: [HotkeyComponent],
})
export class HotkeyModule {}
