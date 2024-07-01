import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from '../../pipes/pipes.module';
import { CarouselItemComponent } from './carousel-item/carousel-item.component';
import { ImgCarouselComponent } from './img-carousel.component';

@NgModule({
  imports: [CommonModule, PipesModule],
  declarations: [ImgCarouselComponent, CarouselItemComponent],
  exports: [ImgCarouselComponent, CarouselItemComponent],
})
export class ImgCarouselModule {}
