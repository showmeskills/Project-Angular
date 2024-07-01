import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { QrCodeModule } from 'ng-qrcode';
import { BindMobilePopupModule } from 'src/app/shared/components/bind-mobile-popup/bind-mobile-popup.module';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { SelectCurrencyModule } from 'src/app/shared/components/select-currency/select-currency.module';
import { SelectDepositBonusModule } from 'src/app/shared/components/select-deposit-bonus/select-deposit-bonus.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SelectNetworkDialogComponentModule } from '../top-up/digital/select-network-dialog/select-network-dialog.component.module';
import { CurrencyTransformComponent } from './currency-transform/currency-transform.component';
import { CurrencyProcessComponent } from './currency/currency-process/currency-process.component';
import { CurrencyComponent } from './currency/currency.component';
import { ErrorDialogComponent } from './currency/error-dialog/error-dialog.component';
import { GuideVideoComponent } from './currency/guide-video/guide-video.component';
import { H5QuestionsDialogComponent } from './currency/h5-questions-dialog/h5-questions-dialog.component';
import { DigitalGuideComponent } from './digital/digital-guide/digital-guide.component';
import { DigitalReceiptDialogComponent } from './digital/digital-receipt-dialog/digital-receipt-dialog.component';
import { DigitalComponent } from './digital/digital.component';
import { OnlinePayWalletComponent } from './online-pay-wallet/online-pay-wallet.component';
import { OnlinePaymentComponent } from './online-payment/online-payment.component';
import { TipsComponent } from './tips/tips.component';
import { TopUpComponent } from './top-up.component';
import { TopUpRoutes } from './top-up.routing';
import { VnThTransferComponent } from './vn-th-transfer/vn-th-transfer.component';
@NgModule({
  imports: [
    CommonModule,
    TopUpRoutes,
    FormsModule,
    MatRadioModule,
    LoadingModule,
    PipesModule,
    EmptyModule,
    ClickOutsideModule,
    QrCodeModule,
    PipesModule,
    ToolTipModule,
    SelectNetworkDialogComponentModule,
    PipesModule,
    SelectCurrencyModule,
    ScrollbarModule,
    CustomizeFormModule,
    BindMobilePopupModule,
    SelectDepositBonusModule,
  ],
  declarations: [
    TopUpComponent,
    DigitalComponent,
    TipsComponent,
    CurrencyComponent,
    DigitalReceiptDialogComponent,
    CurrencyProcessComponent,
    ErrorDialogComponent,
    CurrencyTransformComponent,
    H5QuestionsDialogComponent,
    DigitalGuideComponent,
    OnlinePaymentComponent,
    VnThTransferComponent,
    OnlinePayWalletComponent,
    GuideVideoComponent,
  ],
})
export class TopUpModule {}
