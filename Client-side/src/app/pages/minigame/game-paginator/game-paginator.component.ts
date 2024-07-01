import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-game-paginator',
  templateUrl: './game-paginator.component.html',
  styleUrls: ['./game-paginator.component.scss'],
})
export class GamePaginatorComponent implements OnInit {
  constructor() {}

  @Input() disabled: boolean = false; // 是否禁用 (可选)
  @Input() loading: boolean = false; // 是否loading
  @Input() pageSize: number = 10; // 每页数据多少条
  @Input() total: number = 0; // 数据总数 (必传)
  @Input() page: number = 1; // 当前页码 (必传)

  @Output() pageChange: EventEmitter<number> = new EventEmitter(); // page 双向绑定
  @Output() loadNext: EventEmitter<number> = new EventEmitter(); // loadNext 点击事件

  get progress() {
    if (this.total < 1) return 0;
    const p = (this.page * this.pageSize) / this.total;
    return p > 1 ? 100 : p * 100;
  }

  get curNum() {
    const n = this.page * this.pageSize;
    return n > this.total ? this.total : n;
  }

  loadNextPage() {
    this.pageChange.emit(this.page + 1);
    this.loadNext.emit();
  }

  ngOnInit() {}
}
