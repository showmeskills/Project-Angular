import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { CategoryMenuComponent } from './category-menu.component';

@NgModule({
  imports: [CommonModule, MatTabsModule, AngularSvgIconModule, LangModule, CategoryMenuComponent],
  exports: [CategoryMenuComponent],
})
export class CategoryMenuModule {}
