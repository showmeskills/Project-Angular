import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { NgPagination } from './components/paginator/ng-pagination/ng-pagination.component';
import { FormsModule } from '@angular/forms';
import { SortIconComponent } from './components/sort-icon/sort-icon.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@NgModule({
    imports: [CommonModule, FormsModule, AngularSvgIconModule.forRoot(), PaginatorComponent, NgPagination, SortIconComponent],
    exports: [PaginatorComponent, NgPagination, SortIconComponent],
})
export class CRUDTableModule {}
