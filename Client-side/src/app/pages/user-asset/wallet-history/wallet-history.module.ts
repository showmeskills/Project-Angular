import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { DatepickerModule } from 'src/app/shared/components/datepicker/datepicker.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { AdjustmentHistoryComponent } from './adjustment-history/adjustment-history.component';
import { CommissionHistoryComponent } from './commission-history/commission-history.component';
import { CustomizedTimeDialogComponent } from './customized-time-dialog/customized-time-dialog.component';
import { DepositHistoryComponent } from './deposit-history/deposit-history.component';
import { ExchangeDetailComponent } from './exchange-history/exchange-detail/exchange-detail.component';
import { PrizeHistoryComponent } from './prize-history/prize-history.component';
import { PromotionHistoryComponent } from './promotion-history/promotion-history.component';
import { TransferHistoryComponent } from './transfer-history/transfer-history.component';
import { WalletHistoryComponent } from './wallet-history.component';
import { WalletHistoryRoutes } from './wallet-history.routing';
import { WithdrawHistoryComponent } from './withdraw-history/withdraw-history.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatStepperModule,
    PipesModule,
    WalletHistoryRoutes,
    ClickOutsideModule,
    DatepickerModule,
    LoadingModule,
    PaginatorModule,
    EmptyModule,
    CustomizeFormModule,
    OverlayModule,
    ToolTipModule,
    ScrollbarModule,
  ],
  declarations: [
    WalletHistoryComponent,
    DepositHistoryComponent,
    // TranscationHistoryComponent,
    TransferHistoryComponent,
    WithdrawHistoryComponent,
    // ExchangeHistoryComponent,
    CustomizedTimeDialogComponent,
    AdjustmentHistoryComponent,
    PromotionHistoryComponent,
    CommissionHistoryComponent,
    ExchangeDetailComponent,
    PrizeHistoryComponent,
  ],
})
export class WalletHistoryModule {}
