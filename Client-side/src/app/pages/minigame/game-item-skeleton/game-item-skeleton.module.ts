import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GameItemSkeletonComponent } from './game-item-skeleton.component';

@NgModule({
  imports: [CommonModule],
  declarations: [GameItemSkeletonComponent],
  exports: [GameItemSkeletonComponent],
})
export class GameItemSkeletonModule {}
