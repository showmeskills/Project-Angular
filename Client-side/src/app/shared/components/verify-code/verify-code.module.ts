import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomizeFormModule } from '../customize-form/customize-form.module';
import { ToolTipModule } from '../tool-tip/tool-tip.module';
import { VerifyCodeComponent } from './verify-code.component';

@NgModule({
  imports: [CommonModule, FormsModule, PipesModule, ToolTipModule, CustomizeFormModule],
  declarations: [VerifyCodeComponent],
  exports: [VerifyCodeComponent],
})
export class VerifyCodeModule {}
