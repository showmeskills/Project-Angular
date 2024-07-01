import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { CountrySelecterModule } from 'src/app/shared/components/country-selecter/country-selecter.module';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { DatepickerModule } from 'src/app/shared/components/datepicker/datepicker.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { CountryFilterPipe } from 'src/app/shared/pipes/cuontry-filter.pipe';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { AddSupportDocumentsDialogComponent } from './add-support-documents-dialog/add-support-documents-dialog.component';
import { BankCardsOptionsDialogComponent } from './bank-cards-options-dialog/bank-cards-options-dialog.component';
import { DialogMessageComponent } from './dialog-messages/dialog-message.component';
import { KycCardComponent } from './kyc-h5/kyc-ticket-h5/kyc-card/kyc-card.component';
import { KycH5Component } from './kyc-h5/kyc-ticket-h5/kyc-h5.component';
import { KycTicketComponent } from './kyc-ticket/kyc-ticket.component';
import { KycComponent } from './kyc.component';
import { KycRoutes } from './kyc.routing';
import { AdvanceKycDocs } from './verify-dialog/forei-advance-kyc/advance-kyc-docs/advance-kyc-docs.component';
import { VerifyDialogModule } from './verify-dialog/verify-dialog.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    KycRoutes,
    PipesModule,
    ClickOutsideModule,
    MatTabsModule,
    ScrollbarModule,
    DatepickerModule,
    ToolTipModule,
    VerifyDialogModule,
    CountrySelecterModule,
    CustomizeFormModule,
    LoadingModule,
  ],
  declarations: [
    KycComponent,
    KycTicketComponent,
    BankCardsOptionsDialogComponent,
    DialogMessageComponent,
    KycH5Component,
    KycCardComponent,
    AddSupportDocumentsDialogComponent,
    AdvanceKycDocs,
  ],
  providers: [CountryFilterPipe],
})
export class KycModule {}
