import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutsideModule } from '../../directive/click-outside/click-outside.module';
import { IntersectionObserverModule } from '../../directive/intersection-observer/intersection-observer.module';
import { PipesModule } from '../../pipes/pipes.module';
import { QrScannererModule } from '../qrscanner/qrscanner.module';
import { ScrollbarModule } from '../scrollbar/scrollbar.module';
import { CustomizeButtonComponent } from './customize-button/customize-button.component';
import { CustomizeFormGroupComponent } from './customize-form-group/customize-form-group.component';
import { CustomizeInputComponent } from './customize-input/customize-input.component';
import { CustomizeSelectComponent } from './customize-select/customize-select.component';
import { CustomizeTextareaComponent } from './customize-textarea/customize-textarea.component';

@NgModule({
  imports: [
    CommonModule,
    PipesModule,
    OverlayModule,
    ClickOutsideModule,
    ScrollbarModule,
    FormsModule,
    IntersectionObserverModule,
    QrScannererModule,
  ],
  declarations: [
    CustomizeSelectComponent,
    CustomizeFormGroupComponent,
    CustomizeInputComponent,
    CustomizeTextareaComponent,
    CustomizeButtonComponent,
  ],
  exports: [
    CustomizeSelectComponent,
    CustomizeFormGroupComponent,
    CustomizeInputComponent,
    CustomizeTextareaComponent,
    CustomizeButtonComponent,
  ],
})
export class CustomizeFormModule {} // 已用于组件 activities.component，可参考使用
