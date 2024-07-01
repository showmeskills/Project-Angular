import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomizeFormModule } from '../customize-form/customize-form.module';
import { StandardPopupComponent } from './standard-popup.component';

@NgModule({
  imports: [CommonModule, CustomizeFormModule, PipesModule],
  declarations: [StandardPopupComponent],
  exports: [StandardPopupComponent],
})
export class StandardPopupModule {}
