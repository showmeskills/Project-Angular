import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { SelectCurrencyModule } from 'src/app/shared/components/select-currency/select-currency.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { VerifyCodeModule } from 'src/app/shared/components/verify-code/verify-code.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { IntersectionObserverModule } from 'src/app/shared/directive/intersection-observer/intersection-observer.module';
import { LifeObserveModule } from 'src/app/shared/directive/life-observe/life-observe.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { AddAddressDialogComponent } from './address-management/add-address-dialog/add-address-dialog.component';
import { AddressManagementComponent } from './address-management/address-management.component';
import { SelectMainNetworkDialogComponent } from './address-management/select-main-network-dialog/select-main-network-dialog.component';
import { AddBankCardComponent } from './bankcard-management/add-bank-card/add-bank-card.component';
import { BankcardManagementComponent } from './bankcard-management/bankcard-management.component';
import { SelectBankDialogComponent } from './bankcard-management/select-bank-dialog/select-bank-dialog.component';
import { MainWalletComponent } from './main-wallet/main-wallet.component';
import { SelectTopUpDialogComponent } from './select-top-up-dialog/select-top-up-dialog.component';
import { SelectWithdrawDialogComponent } from './select-withdraw-dialog/select-withdraw-dialog.component';
import { TransferWalletComponent } from './transfer-wallet/transfer-wallet.component';
import { UserAssetsComponent } from './user-assets.component';
import { UserAssetsRoutes } from './user-assets.routing';
import { WalletOverviewComponent } from './wallet-overview/wallet-overview.component';
import { WalletSortingDialogComponent } from './wallet-sorting-dialog/wallet-sorting-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatStepperModule,
    PipesModule,
    UserAssetsRoutes,
    MatCheckboxModule,
    VerifyCodeModule,
    LoadingModule,
    LifeObserveModule,
    ClickOutsideModule,
    EmptyModule,
    CustomizeFormModule,
    MatTooltipModule,
    MatDialogModule,
    IntersectionObserverModule,
    PaginatorModule,
    OverlayModule,
    ToolTipModule,
    SelectCurrencyModule,
    ScrollbarModule,
  ],
  declarations: [
    UserAssetsComponent,
    MainWalletComponent,
    SelectTopUpDialogComponent,
    WalletOverviewComponent,
    TransferWalletComponent,
    AddressManagementComponent,
    AddAddressDialogComponent,
    SelectMainNetworkDialogComponent,
    // KycErrorDialogComponent,
    SelectWithdrawDialogComponent,
    SelectBankDialogComponent,
    BankcardManagementComponent,
    AddBankCardComponent,
    WalletSortingDialogComponent,
  ],
})
export class UserAssetsModule {}
