import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SelectNetworkDialogComponentModule } from '../top-up/digital/select-network-dialog/select-network-dialog.component.module';
import { HeaderTitleBarModule } from '../user-center/account-safety/header-title-bar/header-title-bar.module';
import { CurrencyRecordComponent } from './currency-record/currency-record.component';
import { DigitalRecordComponent } from './digital-record/digital-record.component';
import { RetrieveAccountComponent } from './retrieve-account.component';
import { RetrieveAccountRoutes } from './retrieve-account.routing';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    LoadingModule,
    PipesModule,
    EmptyModule,
    ClickOutsideModule,
    RetrieveAccountRoutes,
    SelectNetworkDialogComponentModule,
    HeaderTitleBarModule,
    PaginatorModule,
    PipesModule,
    MatCheckboxModule,
    CustomizeFormModule,
  ],
  declarations: [RetrieveAccountComponent, DigitalRecordComponent, CurrencyRecordComponent],
})
export class RetrieveAccountModule {}
