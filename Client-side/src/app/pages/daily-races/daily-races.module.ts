import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { BigWinnerComponent } from './big-winner/big-winner.component';
import { DailyRacesComponent } from './daily-races.component';
import { LuskiestUserComponent } from './luskiest-user/luskiest-user.component';
import { RacesConversionCurrencyComponent } from './races-conversion-currency/races-conversion-currency.component';
import { RacesPopupUpComponent } from './races-popup-up/races-popup-up.component';
import { RacesTableTemplateComponent } from './races-table-template/races-table-template.component';

@NgModule({
  imports: [
    CommonModule,
    CustomizeFormModule,
    ToolTipModule,
    PipesModule,
    EmptyModule,
    LoadingModule,
    ScrollbarModule,
    PaginatorModule,
  ],
  declarations: [
    DailyRacesComponent,
    RacesPopupUpComponent,
    RacesTableTemplateComponent,
    BigWinnerComponent,
    LuskiestUserComponent,
    RacesConversionCurrencyComponent,
  ],
  exports: [DailyRacesComponent, BigWinnerComponent, LuskiestUserComponent],
})
export class DailyRacesModule {}
