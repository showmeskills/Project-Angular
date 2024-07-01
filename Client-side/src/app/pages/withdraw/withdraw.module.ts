import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { SelectCurrencyModule } from 'src/app/shared/components/select-currency/select-currency.module';
import { SelectDepositBonusModule } from 'src/app/shared/components/select-deposit-bonus/select-deposit-bonus.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { VerifyCodeModule } from 'src/app/shared/components/verify-code/verify-code.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { CryptoWithdrawHistoryComponent } from './crypto-withdraw/crypto-withdraw-history/crypto-withdraw-history.component';
import { CryptoWithdrawTipsComponent } from './crypto-withdraw/crypto-withdraw-tips/crypto-withdraw-tips.component';
import { CryptoWithdrawComponent } from './crypto-withdraw/crypto-withdraw.component';
import { SelectAddressDialogComponent } from './crypto-withdraw/select-address-dialog/select-address-dialog.component';
import { SubmitDialogComponent } from './crypto-withdraw/submit-dialog/submit-dialog.component';
import { SuccessPageComponent } from './crypto-withdraw/success-page/success-page.component';
import { WithdrawGuideComponent } from './crypto-withdraw/withdraw-guide/withdraw-guide.component';
import { CurrencyWithdrawComponent } from './currency-withdraw/currency-withdraw.component';
import { WithdrawSuccessPageComponent } from './currency-withdraw/withdraw-success-page/withdraw-success-page.component';
import { WithdrawComponent } from './withdraw.component';
import { WithdrawRoutes } from './withdraw.routing';
@NgModule({
  imports: [
    CommonModule,
    WithdrawRoutes,
    FormsModule,
    MatCheckboxModule,
    MatRadioModule,
    PipesModule,
    LoadingModule,
    EmptyModule,
    ScrollbarModule,
    MatTooltipModule,
    MatDialogModule,
    ToolTipModule,
    PipesModule,
    SelectCurrencyModule,
    CustomizeFormModule,
    SelectDepositBonusModule,
    VerifyCodeModule,
  ],
  declarations: [
    WithdrawComponent,
    CurrencyWithdrawComponent,
    CryptoWithdrawComponent,
    CryptoWithdrawTipsComponent,
    CryptoWithdrawHistoryComponent,
    SubmitDialogComponent,
    SelectAddressDialogComponent,
    SuccessPageComponent,
    WithdrawGuideComponent,
    WithdrawSuccessPageComponent,
  ],
})
export class WithdrawModule {}
