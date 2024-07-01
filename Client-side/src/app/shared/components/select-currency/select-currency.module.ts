import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingModule } from '../../directive/loading/loading.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomizeFormModule } from '../customize-form/customize-form.module';
import { EmptyModule } from '../empty/empty.module';
import { ScrollbarModule } from '../scrollbar/scrollbar.module';
import { SelectCurrencyComponent } from './select-currency.component';

@NgModule({
  imports: [CommonModule, FormsModule, PipesModule, EmptyModule, LoadingModule, ScrollbarModule, CustomizeFormModule],
  declarations: [SelectCurrencyComponent],
})
export class SelectCurrencyModule {}
