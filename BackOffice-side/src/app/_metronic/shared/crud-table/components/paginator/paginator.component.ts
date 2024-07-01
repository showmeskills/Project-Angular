import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageSizes, PaginatorState } from '../../models/paginator.model';
import { AppService } from 'src/app/app.service';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { NgPagination } from './ng-pagination/ng-pagination.component';

@Component({
    selector: 'app-paginator',
    templateUrl: './paginator.component.html',
    styleUrls: ['./paginator.component.scss'],
    standalone: true,
    imports: [
        NgPagination,
        NgIf,
        FormsModule,
        NgFor,
        AsyncPipe,
    ],
})
export class PaginatorComponent implements OnInit {
  @Input() paginator!: PaginatorState;
  @Input() simple: boolean = false;
  @Input() isLoading;
  @Input() maxSize:number=5;
  @Output() paginate: EventEmitter<PaginatorState> = new EventEmitter();
  pageSizes: number[] = PageSizes;
  constructor(public appService: AppService) {}

  ngOnInit(): void {}

  pageChange(num: number) {
    this.paginator.page = num;
    this.paginate.emit(this.paginator);
  }

  sizeChange() {
    this.paginator.pageSize = +this.paginator.pageSize;
    this.paginator.page = 1;
    this.paginate.emit(this.paginator);
  }
}
