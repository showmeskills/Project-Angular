import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { ImgCarouselModule } from 'src/app/shared/components/img-carousel/img-carousel.module';
import { LazyImageComponent } from 'src/app/shared/components/lazy-image/lazy-image.component';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SwiperModule } from 'swiper/angular';
import { CardCenterModule } from '../card-center/card-center.module';
import { DailyRacesModule } from '../daily-races/daily-races.module';
import { DividendVipRoutes } from './dividend-vip.routing';
import { OfferDetailComponent } from './offer-list/offer-detail/offer-detail.component';
import { OfferListComponent } from './offer-list/offer-list.component';
import { VipBenefitsComponent } from './vip-benefits/vip-benefits.component';
import { VipLevelSystemComponent } from './vip-level-system/vip-level-system.component';
@NgModule({
  imports: [
    CommonModule,
    DividendVipRoutes,
    SwiperModule,
    FormsModule,
    MatExpansionModule,
    CardCenterModule,
    LoadingModule,
    PipesModule,
    EmptyModule,
    CustomizeFormModule,
    DailyRacesModule,
    LazyImageComponent,
    ImgCarouselModule,
  ],
  declarations: [VipLevelSystemComponent, VipBenefitsComponent, OfferListComponent, OfferDetailComponent],
})
export class DividendVipModule {}
