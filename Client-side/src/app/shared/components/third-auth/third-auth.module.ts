import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomizeFormModule } from '../customize-form/customize-form.module';
import { ThirdAuthComponent } from './third-auth.component';

@NgModule({
  imports: [CommonModule, FormsModule, PipesModule, CustomizeFormModule, MatCheckboxModule],
  declarations: [ThirdAuthComponent],
  exports: [ThirdAuthComponent],
})
export class ThirdAuthModule {}
