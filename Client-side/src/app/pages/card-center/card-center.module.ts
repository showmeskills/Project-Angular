import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { LazyImageComponent } from 'src/app/shared/components/lazy-image/lazy-image.component';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { StandardPopupModule } from 'src/app/shared/components/standard-popup/standard-popup.module';
import { ToolTipModule } from 'src/app/shared/components/tool-tip/tool-tip.module';
import { LifeObserveModule } from 'src/app/shared/directive/life-observe/life-observe.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { StripTrailingZerosPipe } from 'src/app/shared/pipes/strip-trailing-zeros.pipe';
import { CardCenterComponent } from './card-center.component';
import { CardCenterRoutes } from './card-center.routing';
import { CouponCardComponent } from './coupon-card/coupon-card.component';
import { ExchangeBtnComponent } from './exchange-btn/exchange-btn.component';
import { NoneStickyBonusComponent } from './none-sticky-bonus/none-sticky-bonus.component';

@NgModule({
  imports: [
    CommonModule,
    CardCenterRoutes,
    CustomizeFormModule,
    LoadingModule,
    EmptyModule,
    PaginatorModule,
    FormsModule,
    PipesModule,
    ToolTipModule,
    DragDropModule,
    ScrollbarModule,
    StandardPopupModule,
    LifeObserveModule,
    LazyImageComponent
  ],
  declarations: [
    CardCenterComponent,
    CouponCardComponent,
    NoneStickyBonusComponent,
    ExchangeBtnComponent,
    StripTrailingZerosPipe,
  ],
  exports: [CouponCardComponent],
})
export class CardCenterModule {}
