import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent implements OnChanges {
  @Input() disabled: boolean = false; // 是否禁用 (可选)
  @Input() loading: boolean = false; // 是否loading，目前仅用于h5。(h5必传)
  @Input() pageSize: number = 10; // 每页数据多少条 (可选, 但一般为了和数据接口一致都会传一下)
  @Input() total: number = 0; // 数据总数 (必传)
  @Input() page: number = 1; // 当前页码 (必传)

  @Output() pageChange: EventEmitter<number> = new EventEmitter(); // page 双向绑定
  @Output() onPageChange: EventEmitter<number> = new EventEmitter(); // page 改变后你要做什么

  pagesLength!: number;
  pages!: number[];
  isH5!: boolean;

  get prevPage(): boolean {
    if (this.page <= 1) return false;
    return true;
  }

  get nextPage(): boolean {
    if (this.pagesLength === undefined) return false;
    if (this.page >= this.pages[this.pagesLength - 1]) return false;
    return true;
  }

  get showPages() {
    let arr: number[] = [];
    if (this.pagesLength <= 5) return this.pages;
    if (this.pagesLength > 5) {
      arr = [this.page - 2, this.page - 1, this.page, this.page + 1, this.page + 2];
      if (!arr.includes(1)) arr.unshift(1);
      if (!arr.includes(this.pagesLength)) arr.push(this.pagesLength);
      arr = arr.filter(x => this.pages.includes(x));
    }
    return arr;
  }

  constructor(private layout: LayoutService) {
    //OnPush 策略下isH5改变不会动态变更，以后如果需要可以用 private changeRef:ChangeDetectorRef 手动触发
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  checkToLoad(e: boolean) {
    if (this.disabled) return; // 被禁用了
    if (this.loading) return; // 加载中
    if (!this.nextPage) return; // 没有下一页了
    if (e) this.goPage(this.page + 1);
  }

  ngOnChanges(): void {
    if (this.total <= 0) return;
    this.recalculate();
  }

  recalculate() {
    if (this.total <= this.pageSize) {
      // 总数小于等于每页大小，已全部显示，
      this.pagesLength = 1;
      this.pages = [1];
    } else {
      //需要分页
      this.pagesLength = Math.floor(this.total / this.pageSize) + (this.total % this.pageSize > 0 ? 1 : 0);
      this.pages = Array.from({ length: this.pagesLength }, (v, i) => i + 1);
    }
  }

  clickPage(page: number) {
    this.goPage(page);
  }

  goPage(page: number) {
    this.pageChange.emit(page);
    this.onPageChange.emit(page);
  }

  judgeBeginDot(item: number): boolean {
    return this.pagesLength > 5 && item === 1 && this.page - 3 > 1;
  }

  judgeEndDot(item: number): boolean {
    return this.pagesLength > 5 && item === this.pagesLength && this.page + 3 < this.pagesLength;
  }
}
