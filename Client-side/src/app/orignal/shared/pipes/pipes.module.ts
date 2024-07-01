import { NgModule } from '@angular/core';
import { CurrencyIconPipe } from './currency-icon.pipe';
import { CurrencyValuePipe } from './currency-value.pipe';
import { MomentDatePipe } from './moment-date.pipe';
import { NumberPipe } from './number.pipe';
import { SliceArrayPipe } from './slice-array.pipe';
import { TranslatePipe } from './translate.pipe';
// 时间戳 使用gogaming
@NgModule({
  imports: [],
  declarations: [NumberPipe, TranslatePipe, SliceArrayPipe, CurrencyIconPipe, CurrencyValuePipe, MomentDatePipe],
  exports: [NumberPipe, TranslatePipe, SliceArrayPipe, CurrencyIconPipe, CurrencyValuePipe, MomentDatePipe],
})
export class PipesModule {}
