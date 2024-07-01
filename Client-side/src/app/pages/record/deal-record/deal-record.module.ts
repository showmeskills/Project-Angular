import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QrCodeModule } from 'ng-qrcode';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { ImgCarouselModule } from 'src/app/shared/components/img-carousel/img-carousel.module';
import { LogoModule } from 'src/app/shared/components/logo/logo.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { LifeObserveModule } from 'src/app/shared/directive/life-observe/life-observe.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { HeaderTitleBarModule } from '../../user-center/account-safety/header-title-bar/header-title-bar.module';
import { DealCasinoComponent } from './casino/deal-casino.component';
import { DealRecordComponent } from './deal-record.component';
import { DealRecordRoutes } from './deal-record.routing';
import { DealLotteryComponent } from './lottery/deal-lottery.component';
import { DealPokerComponent } from './poker/deal-poker.component';
import { DealSportComponent } from './sport/deal-sport.component';

@NgModule({
  imports: [
    CommonModule,
    DealRecordRoutes,
    HeaderTitleBarModule,
    EmptyModule,
    PaginatorModule,
    CustomizeFormModule,
    LoadingModule,
    ScrollbarModule,
    ToolTipModule,
    PipesModule,
    LogoModule,
    QrCodeModule,
    ImgCarouselModule,
    LifeObserveModule,
  ],
  declarations: [
    DealRecordComponent,
    DealSportComponent,
    DealPokerComponent,
    DealLotteryComponent,
    DealCasinoComponent,
  ],
})
export class DealRecordModule {}
