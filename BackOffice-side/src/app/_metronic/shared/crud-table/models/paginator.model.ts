export const PageSizes = [30, 50, 100, 200, 500, 1e3]; // WU2021-7296 全局调整至1000

export interface IPaginatorState {
  page: number;
  pageSize: number;
  total: number;
  recalculatePaginator(total: number): IPaginatorState;
}

export class PaginatorState implements IPaginatorState {
  page = 1;
  pageSize = PageSizes[1];
  total = 0;
  pageSizes: number[] = [];

  constructor(index: number = 1, pageSize: number = PageSizes[1]) {
    this.page = index;
    this.pageSize = pageSize;
  }

  recalculatePaginator(total: number): PaginatorState {
    this.total = total;
    return this;
  }
}

export interface IPaginatorView {
  paginator: PaginatorState;
  ngOnInit(): void;
  paginate(paginator: PaginatorState): void;
}
