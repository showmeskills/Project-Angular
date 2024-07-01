import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioSelectComponent } from './radio-select.component';
import { FormsModule } from '@angular/forms';
import { SelectGroupModule } from '../select-group/select-group.module';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    LangModule,
    AngularSvgIconModule.forRoot(),
    SelectGroupModule,
    RadioSelectComponent,
  ],
  exports: [RadioSelectComponent],
})
export class RadioSelectModule {}
