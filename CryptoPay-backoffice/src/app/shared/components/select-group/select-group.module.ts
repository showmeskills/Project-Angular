import { NgModule } from '@angular/core';
import { SelectGroupComponent } from './select-group.component';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';

@NgModule({
  imports: [CommonModule, FormsModule, LangModule, AngularSvgIconModule.forRoot(), SelectGroupComponent],
  exports: [SelectGroupComponent],
})
export class SelectGroupModule {}
