import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LazyImageComponent } from '../lazy-image/lazy-image.component';
import { NormalCarouselComponent } from './normal-carousel.component';

@NgModule({
  imports: [CommonModule, LazyImageComponent],
  declarations: [NormalCarouselComponent],
  exports: [NormalCarouselComponent],
})
export class NormalCarouselModule {}
