import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomizeFormModule } from 'src/app/shared/components/customize-form/customize-form.module';
import { EmptyModule } from 'src/app/shared/components/empty/empty.module';
import { ImgDpiModule } from 'src/app/shared/components/img-dpi/img-dpi.module';
import { LazyImageComponent } from 'src/app/shared/components/lazy-image/lazy-image.component';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { ScrollSelectItemModule } from 'src/app/shared/components/scroll-select-item/scroll-select-item.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { SwiperUnitModule } from 'src/app/shared/components/swiper-unit/swiper-unit.module';
import { IntersectionObserverModule } from 'src/app/shared/directive/intersection-observer/intersection-observer.module';
import { LoadingModule } from 'src/app/shared/directive/loading/loading.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { TournamentDetailsComponent } from './tournament-details/tournament-details.component';
import { TournamentPopupComponent } from './tournament-popup/tournament-popup.component';
import { TournamentTemplateComponent } from './tournament-template/tournament-template.component';
import { TournamentTimerComponent } from './tournament-timer/tournament-timer.component';
import { TournamentComponent } from './tournament.component';

@NgModule({
  imports: [
    CommonModule,
    PaginatorModule,
    ScrollbarModule,
    CustomizeFormModule,
    EmptyModule,
    DragDropModule,
    LoadingModule,
    PipesModule,
    ImgDpiModule,
    ScrollSelectItemModule,
    LazyImageComponent,
    SwiperUnitModule,
    IntersectionObserverModule,
  ],
  declarations: [
    TournamentComponent,
    TournamentDetailsComponent,
    TournamentTimerComponent,
    TournamentTemplateComponent,
    TournamentPopupComponent,
  ],
  exports: [TournamentPopupComponent],
})
export class TournamentModule {}
