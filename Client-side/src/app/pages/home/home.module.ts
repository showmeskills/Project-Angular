import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QrCodeModule } from 'ng-qrcode';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { LogoModule } from 'src/app/shared/components/logo/logo.module';
import { NormalCarouselModule } from 'src/app/shared/components/normal-carousel/normal-carousel.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { SwiperUnitModule } from 'src/app/shared/components/swiper-unit/swiper-unit.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { NumberChangeAddClassModule } from 'src/app/shared/directive/number-change-add-class/number-change-add-class.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { DailyRacesModule } from '../daily-races/daily-races.module';
import { HomeComponent } from './home.component';
import { HomeRoutes } from './home.routing';
import { OpenAppComponent } from './open-app/open-app.component';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    HomeRoutes,
    LoadingModule,
    SwiperUnitModule,
    QrCodeModule,
    NormalCarouselModule,
    PaginatorModule,
    PipesModule,
    CustomizeFormModule,
    NumberChangeAddClassModule,
    LogoModule,
    DailyRacesModule,
  ],
  declarations: [HomeComponent, OpenAppComponent],
})
export class HomeModule {}
