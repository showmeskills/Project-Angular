import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IntersectionObserverModule } from '../../directive/intersection-observer/intersection-observer.module';
import { PipesModule } from '../../pipes/pipes.module';
import { PaginatorComponent } from './paginator.component';

export interface PaginatorState {
  /**当前页码 */
  page: number;
  /**每页数量 */
  pageSize: number;
  /**总数 */
  total: number;
}

@NgModule({
  imports: [CommonModule, FormsModule, PipesModule, IntersectionObserverModule],
  declarations: [PaginatorComponent],
  exports: [PaginatorComponent],
})
export class PaginatorModule {}
