import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyComponent } from './empty.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';

@NgModule({
  imports: [CommonModule, AngularSvgIconModule, LangModule, EmptyComponent],
  exports: [EmptyComponent],
})
export class EmptyModule {}
