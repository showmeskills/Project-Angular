import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormRowComponent } from './form-row.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormFullDirective, FormWrapComponent /*FormWrapDirective */ } from './form-wrap.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  exports: [FormRowComponent, FormWrapComponent, ReactiveFormsModule, /*FormWrapDirective,*/ FormFullDirective],
  imports: [
    CommonModule,
    AngularSvgIconModule.forRoot(),
    FormRowComponent,
    FormWrapComponent,
    /*FormWrapDirective,*/ FormFullDirective,
  ],
})
export class FormRowModule {}
