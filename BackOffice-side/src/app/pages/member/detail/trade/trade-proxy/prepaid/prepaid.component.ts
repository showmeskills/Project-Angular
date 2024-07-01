import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'prepaid',
  templateUrl: './prepaid.component.html',
  styleUrls: ['./prepaid.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    LangPipe,
  ],
})
export class PrepaidComponent implements OnInit {
  constructor() {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false; // 是否加载中
  list: any[] = []; // 表格列表数据

  ngOnInit(): void {
    this.list = [1, 2, 3, 4, 5, 6, 7, 8];
    this.paginator.total = 100;
  }

  loadData(): void {}
}
