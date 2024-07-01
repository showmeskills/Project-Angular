import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PipesModule } from '../../pipes/pipes.module';
import { dialogTopUpComponent } from './dialog-top-up.component';

@NgModule({
  declarations: [dialogTopUpComponent],
  imports: [CommonModule, PipesModule, FormsModule, MatSlideToggleModule],
  exports: [dialogTopUpComponent],
})
export class dialogTopUpModule {}
