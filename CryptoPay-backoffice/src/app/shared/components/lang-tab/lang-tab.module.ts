import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangTabComponent, LanguageWarningComponent } from './lang-tab.component';
import { SelectGroupModule } from 'src/app/shared/components/select-group/select-group.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
  imports: [
    CommonModule,
    AngularSvgIconModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    SelectGroupModule,
    MatTabsModule,
    LanguageWarningComponent,
    LangTabComponent,
  ],
  exports: [LangTabComponent, LanguageWarningComponent],
})
export class LangTabModule {}
