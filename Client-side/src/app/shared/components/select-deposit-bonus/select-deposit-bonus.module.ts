import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingModule } from '../../directive/loading/loading.module';
import { PipesModule } from '../../pipes/pipes.module';
import { CustomizeFormModule } from '../customize-form/customize-form.module';
import { EmptyModule } from '../empty/empty.module';
import { ScrollbarModule } from '../scrollbar/scrollbar.module';
import { PaymentIqComponent } from './payment-iq/payment-iq.component';
import { SelectDepositBonusComponent } from './select-deposit-bonus.component';
import { SelectDividendDialogComponent } from './select-dividend-dialog/select-dividend-dialog.component';

@NgModule({
  imports: [CommonModule, FormsModule, PipesModule, EmptyModule, LoadingModule, ScrollbarModule, CustomizeFormModule],
  declarations: [SelectDepositBonusComponent, PaymentIqComponent, SelectDividendDialogComponent],
  exports: [SelectDepositBonusComponent, PaymentIqComponent],
})
export class SelectDepositBonusModule {}
