import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './upload.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DefaultDirective } from './default.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LangModule,
    AngularSvgIconModule.forRoot(),
    UploadComponent,
    DefaultDirective,
  ],
  exports: [DefaultDirective, UploadComponent],
})
export class UploadModule {}
