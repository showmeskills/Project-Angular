import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomizeFormModule } from '../customize-form/customize-form.module';
import { VerifyCodeModule } from '../verify-code/verify-code.module';
import { General2faverifyComponent } from './general2faverify.component';

@NgModule({
  imports: [CommonModule, FormsModule, VerifyCodeModule, PipesModule, CustomizeFormModule, MatDialogModule],
  declarations: [General2faverifyComponent],
  exports: [General2faverifyComponent],
})
export class Ganeral2faVerifyModule {}
