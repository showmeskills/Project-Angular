import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';

/**
 * 表格排序UI组件
 * @UsageNotes
 * ### 使用实例
 * ```html
 * <table-sort
 *    [(isAsc)]="data.isAsc"
 *    [(sortCurKey)]="data.sortField"
 *    [sortKey]="WinnerTopSortEnum.payout"
 *    (sortChange)="loadData(true)"
 * >W/L</table-sort>
 * ```
 *
 * ### 使用实例2
 * ```html
 *  <table-sort
 *    [(isAsc)]="data.isAsc"
 *    [(sortCurKey)]="data.sortField"
 *    [sortKey]="WinnerTopSortEnum.wager"
 *    (sortChange)="loadData(true)"
 *  >
 *    <ng-template
 *      let-sortField
 *      let-sort="sortType"
 *      let-active="active"
 *      let-isAsc="isAsc"
 *      let-slotLabelTpl="slotLabelTpl"
 *      let-slotArrowTpl="slotArrowTpl"
 *    >
 *      <ng-container *ngTemplateOutlet="slotLabelTpl; context: { $implicit: 'Wager' }"></ng-container>
 *      <ng-container *ngTemplateOutlet="slotArrowTpl"></ng-container>
 *    </ng-template>
 *  </table-sort>
 * ```
 * @Annotation
 */
@Component({
  selector: 'table-sort',
  standalone: true,
  imports: [CommonModule, LangPipe],
  templateUrl: './table-sort.component.html',
  styleUrls: ['./table-sort.component.scss'],
})
export class TableSortComponent<FT = any> {
  constructor() {}

  /** 获取template模板标签（可用于回传参数） */
  @ContentChild(TemplateRef) templateRef!: TemplateRef<any>;

  /**
   * 是否显示排序
   */
  @Input() showSort = true;

  /**
   * 标签模板
   */
  @Input() labelTpl?: TemplateRef<any>;

  /**
   * 排序字段
   */
  @Input() sortKey: FT;

  /**
   * 当前组件改变时触发
   */
  @Output() sortChange = new EventEmitter<boolean>();

  /**
   * 当前排序字段
   * @param v
   */
  @Input('sortCurKey') set _sortCurKey(v: FT) {
    this.sortCurKey = v;
  }

  @Output() sortCurKeyChange = new EventEmitter<FT>();
  sortCurKey?: FT;

  /**
   * 当前排序值
   * @param v
   */
  @Input('isAsc') set _isAsc(v: boolean | undefined) {
    this.isAsc = v;
  }

  @Output() isAscChange = new EventEmitter<boolean | undefined>();
  isAsc: boolean | undefined;

  onSort(sortKey: FT) {
    if (this.isAsc === false && this.sortCurKey === sortKey) {
      this.sortCurKey = undefined;
      this.isAsc = undefined;
      this.sortCurKeyChange.emit(this.sortCurKey);
      this.sortChange.emit(true);
      return;
    }

    if (this.sortCurKey !== undefined || this.sortCurKey !== sortKey) {
      this.sortCurKey = sortKey;
      this.sortCurKeyChange.emit(this.sortCurKey);
    }

    this.isAsc = !this.isAsc;
    this.isAscChange.emit(this.isAsc);
    this.sortChange.emit(true);
  }

  /**
   * 是否为Template模板
   * @param v
   */
  isTemplate(v: any): boolean {
    return v instanceof TemplateRef;
  }
}
