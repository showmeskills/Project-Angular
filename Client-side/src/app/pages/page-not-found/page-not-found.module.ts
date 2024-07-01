import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { PageNotFoundComponent } from './page-not-found.component';
@NgModule({
  imports: [CommonModule, PipesModule],
  declarations: [PageNotFoundComponent],
  exports: [PageNotFoundComponent],
})
export class PageNotFoundModule {}
