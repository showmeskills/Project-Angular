import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { arrSearch } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { BehaviorSubject, delay, fromEvent, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

@Directive({
  selector: 'input[searchInput]',
  exportAs: 'searchInp',
  host: {
    class: 'select-search',
    '[placeholder]': `_placeholder`,
  },
  standalone: true,
})
export class SearchInpDirective implements AfterViewInit, OnDestroy {
  constructor(
    private lang: LangService,
    public host: ElementRef
  ) {}

  value = '';
  _placeholder = '';
  private _destroy$ = new Subject<void>();

  public valueChange$ = fromEvent<InputEvent>(this.host.nativeElement, 'input').pipe(
    map((e) => e.target?.['value']),
    takeUntil(this._destroy$)
  );

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.lang
      .get('common.searchPlaceholder')
      .pipe(takeUntil(this._destroy$))
      .subscribe((text) => {
        setTimeout(() => {
          this._placeholder = text;
        });
      });
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.value = value;
  }
}

interface SearchDirectiveContext<T> {
  $implicit: Observable<T>;
  list: T;
  key: string;
  value: string;
}

/**
 * 搜做指令
 * @description TODO material升级15x之后下拉进行搜索的话，不会覆盖select所选值，所以需要优化
 * @UsageNotes
 * ## 基本使用
 * ```html
 * <mat-form-field [style.width.px]="200">
 *   <mat-select
 *     class="form-control"
 *     [(ngModel)]="data.mainChannel"
 *     (selectionChange)="loadData(true)"
 *     *search="let searchList$ of mainChannelList; key: 'name'"
 *   >
 *     <input type="text" searchInput />
 *     <mat-option *ngFor="let item of searchList$ | async" [value]="item.code">{{ item.name }}</mat-option>
 *   </mat-select>
 * </mat-form-field>
 * ```
 * @Annotation
 */
@Directive({
  selector: '[search]',
  standalone: true,
})
export class SearchDirective<T extends Array<Object | string | String>> implements OnDestroy {
  constructor(
    private templateRef: TemplateRef<SearchDirectiveContext<T>>,
    private viewContainerRef: ViewContainerRef,
    private cd: ChangeDetectorRef
  ) {}

  /** select */
  private _select?: MatSelect;

  /** 过滤后的List$ */
  private list$ = new BehaviorSubject<T>([] as any);

  /** 过滤后的list */
  set list(v: T) {
    this.list$.next(v);
  }

  /** 原list */
  private _list: T = [] as any;

  /** 搜索的属性 */
  private _key: string | boolean = '';
  get _searchKey() {
    return this._key;
  }

  set _searchKey(v) {
    this._key = v;
    this.list = arrSearch(this._list, this._searchValue, this._searchKey) as T;
  }

  /** 搜索的值 */
  private _value = '';
  get _searchValue() {
    return this._value;
  }

  set _searchValue(v) {
    this._value = v;
    this.list = arrSearch(this._list, this._searchValue, this._searchKey) as T;
  }

  /**
   * 辅助ts类型检查
   */
  static ngTemplateContextGuard<T extends Array<Object | string | String>>(
    directive: SearchDirective<T>,
    context: any
  ): context is SearchDirectiveContext<T> {
    return true;
  }

  /**
   * 传入的list
   * @param list
   */
  @Input()
  set searchOf(list: T) {
    this._list = list;
    this.list = arrSearch(this._list, this._searchValue, this._searchKey) as T;
    this.viewContainerRef.clear();
    const s = this.viewContainerRef.createEmbeddedView(this.templateRef, {
      $implicit: this.list$.asObservable(),
      list,
      key: this._searchKey,
      value: this._searchValue,
    });

    const inputRef = s['_lView'].find((e) => e instanceof SearchInpDirective) as SearchInpDirective;

    this._select = s['_lView'].find((e) => e instanceof MatSelect) as MatSelect;
    this._select?.openedChange?.subscribe((isOpen) => {
      inputRef.host.nativeElement.value = '';
      inputRef.host.nativeElement.blur();
      this._searchValue = '';

      // 让激活的选项失去激活状态
      setTimeout(() => {
        // @ts-ignore
        if (this._select._keyManager.activeItem?._active) {
          // @ts-ignore
          this._select._keyManager.activeItem._active = false;
        }
      });

      isOpen && inputRef.host.nativeElement.focus();
    });

    this.subscribeInputValue(inputRef);
  }

  /**
   * 搜索的属性
   * @param key
   */
  @Input() set searchKey(key: string | boolean) {
    this._searchKey = key;
  }

  /**
   * 搜索的值
   * @param value
   */
  @Input() set searchValue(value: string) {
    this._searchValue = value;
  }

  /**
   * 搜索的值来源于Inp指令
   * @param value
   */
  @Input('searchInp') set searchValueByInp(value: SearchInpDirective) {
    this.subscribeInputValue(value);
  }

  /** methods */
  subscribeInputValue(value: SearchInpDirective) {
    if (!value) return;

    value.valueChange$
      .pipe(
        tap((v) => (this._searchValue = v)),
        delay(1),
        takeUntil(this._destroy$)
      )
      .subscribe(() => {
        // this._select && this._select['_positioningSettled']();
        // this._select && this._select['_calculateOverlayPosition']();
        // this._select && this._select?.['_overlayDir']?.['overlayRef']?.['updatePosition']();
      });
  }

  /** lifeCycle */
  private _destroy$ = new Subject<void>();
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
