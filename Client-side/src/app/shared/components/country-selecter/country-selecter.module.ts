import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutsideModule } from '../../directive/click-outside/click-outside.module';
import { IntersectionObserverModule } from '../../directive/intersection-observer/intersection-observer.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ScrollbarModule } from '../scrollbar/scrollbar.module';
import { CountrySelecterComponent } from './country-selecter.component';

@NgModule({
  imports: [CommonModule, PipesModule, ClickOutsideModule, ScrollbarModule, FormsModule, IntersectionObserverModule],
  declarations: [CountrySelecterComponent],
  exports: [CountrySelecterComponent],
})
export class CountrySelecterModule {} // 已用于组件 activities.component，可参考使用
