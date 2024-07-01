import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PipesModule } from '../../pipes/pipes.module';
import { EmptyComponent } from './empty.component';

@NgModule({
  imports: [CommonModule, PipesModule],
  declarations: [EmptyComponent],
  exports: [EmptyComponent],
})
export class EmptyModule {}
