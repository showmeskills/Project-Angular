import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { FooterComponent } from './footer.component';

@NgModule({
  imports: [CommonModule, PipesModule],
  declarations: [FooterComponent],
  exports: [FooterComponent],
})
export class FooterModule {}
