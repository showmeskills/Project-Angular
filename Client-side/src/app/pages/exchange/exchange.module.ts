import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { ClickOutsideModule } from 'src/app/shared/directive/click-outside/click-outside.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { PageNotFoundModule } from './../page-not-found/page-not-found.module';
import { CurrencyPurchaseComponent } from './currency-purchase/currency-purchase.component';
import { ExchangeComponent } from './exchange.component';
import { ExchangeRoutes } from './exchange.routing';
@NgModule({
  imports: [
    CommonModule,
    ExchangeRoutes,
    ClickOutsideModule,
    FormsModule,
    LoadingModule,
    EmptyModule,
    CustomizeFormModule,
    PipesModule,
    PageNotFoundModule,
  ],
  declarations: [ExchangeComponent, CurrencyPurchaseComponent],
})
export class ExchangeModule {}
