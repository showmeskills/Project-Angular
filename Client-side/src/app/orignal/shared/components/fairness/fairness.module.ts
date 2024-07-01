import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from '../../pipes/pipes.module';
import { FairnessComponent } from './fairness.component';

@NgModule({
  imports: [CommonModule, MatDialogModule, MatSelectModule, FormsModule, PipesModule, LoadingModule],
  declarations: [FairnessComponent],
  exports: [FairnessComponent],
})
export class FairnessModule {}
