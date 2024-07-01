import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PipesModule } from 'src/app/orignal/shared/pipes/pipes.module';
import { ImgCarouselModule } from 'src/app/shared/components/img-carousel/img-carousel.module';
import { ScrollbarModule } from 'src/app/shared/components/scrollbar/scrollbar.module';
import { RulesComponent } from './rules.component';

@NgModule({
  declarations: [RulesComponent],
  imports: [
    CommonModule,
    PipesModule,
    FormsModule,
    MatSlideToggleModule,
    ScrollbarModule,
    MatSelectModule,
    ImgCarouselModule,
  ],
  exports: [RulesComponent],
})
export class RulesModule {}
