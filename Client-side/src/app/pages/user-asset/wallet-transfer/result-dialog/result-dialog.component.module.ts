import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { PipesModule } from '../../../../shared/pipes/pipes.module';
import { ResultDialogComponent } from './result-dialog.component';

@NgModule({
  imports: [CommonModule, PipesModule, CustomizeFormModule],
  declarations: [ResultDialogComponent],
  exports: [ResultDialogComponent],
})
export class ResultDialogModule {}
