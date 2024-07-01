import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  HostListener,
  Input,
  Optional,
  QueryList,
  Self,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { fromEvent, merge, Subscription, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { FormControl, NgControl } from '@angular/forms';
import { DestroyService } from 'src/app/shared/models/tools.model';

// 参考文章：https://netbasal.com/implementing-grouping-checkbox-behavior-with-angular-reactive-forms-9ba4e3ab3965
// 参考文章：https://coryrylan.com/blog/creating-a-dynamic-checkbox-list-in-angular

/**
 * 父
 */
@Directive({
  selector: '[selectGroup]',
  standalone: true,
})
export class SelectGroupDirective {
  checkChanges$ = fromEvent(this.host.nativeElement, 'change').pipe(map((e) => e.target?.['checked']));

  // 是否禁用半选状态
  @Input() disabledIndeterminate = false;
  // @HostBinding('class.indeterminate') indeterminateClass: boolean = false; // 这种方式绑定会有bug 不能实时进行绑定 页面活动（移动鼠标、点击等操作）才会进行绑定

  constructor(
    // 父级input[type="checkbox"]
    private host: ElementRef<HTMLInputElement>
  ) {}

  get checked(): boolean {
    return this.host.nativeElement.checked;
  }

  set checked(checked: boolean) {
    this.host.nativeElement.checked = checked;
  }

  // 设置半选状态
  set indeterminate(checked: boolean) {
    if (this.disabledIndeterminate) return;
    // this.indeterminateClass = checked; // 这种方式绑定会有bug 不能实时进行绑定 页面活动（移动鼠标、点击等操作）才会进行绑定

    this.host.nativeElement.classList[checked ? 'add' : 'remove']('indeterminate');
  }
}

/**
 * 回传数据给模板
 * PS：在 ng-template 上使用
 */
@Directive({
  selector: 'ng-template[selectTpl]',
  standalone: true,
})
export class SelectTplDirective {
  constructor(
    public tplRef: TemplateRef<SelectChildrenContext>,
    public viewContainer: ViewContainerRef
  ) {}

  static ngTemplateContextGuard(dir: SelectTplDirective, ctx: unknown): ctx is SelectChildrenContext {
    return true;
  }

  // static ngTemplateContextGuard<T>(directive: SelectTplDirective<T>, context: any): context is SelectChildrenContext {
  //   return true;
  // }
}

/**
 * 子 - 精确查找
 */
@Directive({
  selector: '[select]',
  standalone: true,
})
export class SelectDirective implements AfterContentInit {
  constructor(
    @Self() @Optional() private _control: NgControl // 没有找到就算了
  ) {}

  control;

  ngAfterContentInit() {
    // 必须在渲染后再获取赋值
    this.control = this._control?.control;
  }
}

type ParentCheckAllFn = (isAll?: boolean | undefined) => void;
interface ParentSelectImplicit {
  count: number; // 选中的数量
  total: number; // 找到的总量
  isAll: boolean; // 是否全选
}
interface SelectChildrenContext {
  $implicit: ParentSelectImplicit;
  checkAll: ParentCheckAllFn;
}

/**
 * 父选的范围
 */
@Directive({
  selector: '[selectChildren]',
  standalone: true,
})
export class SelectChildrenDirective implements AfterContentInit {
  // ContentChildren 从内容 DOM 中获取```元素或指令```。每当添加、删除或移动子元素时，查询列表都会更新，查询列表的可观察更改将发出一个新值。
  @ContentChildren(NgControl, { descendants: true })
  childControls!: QueryList<NgControl>; // 查询所处的所有control 响应式表单或双向绑定 -> 如果含其他绑定可扩展一个指令进行精确查找

  @ContentChildren(SelectTplDirective, { descendants: true })
  tpl!: QueryList<SelectTplDirective>; // 查询所处的所有<ng-template selectTpl>...

  @ContentChildren(SelectDirective, { descendants: true })
  selectControls!: QueryList<NgControl>; // 查询所处的所有control 响应式表单或双向绑定 -> 如果含其他绑定可扩展一个指令进行精确查找

  @ContentChildren(SelectGroupDirective, { descendants: true })
  selectGroup!: QueryList<SelectGroupDirective>; // 查找用于全选的指令 SelectGroup

  subList: Subscription[] = [];

  constructor(private _viewContainer: ViewContainerRef) {}

  /** 是否只查找子元素 */
  @Input('selectChildren') onlyFindSelect?: boolean | string = false;

  /** getters */
  // 通过搜索指令精确查找
  get controls(): QueryList<NgControl> {
    if (this.onlyFindSelect) return this.selectControls;

    return this.selectControls && this.selectControls.length ? this.selectControls : this.childControls;
  }

  // 当前已选
  get count(): number {
    return this.controls.filter(({ control }) => control?.value).length;
  }

  // 可选总量
  get total(): number {
    return this.controls.length;
  }

  // 是否全选
  get isAll(): boolean {
    return this.controls.toArray().every(({ control }) => control?.value); // 原生数组every 其余有内置一些数组方法
  }

  // 默认传递数据
  get $implicit(): ParentSelectImplicit {
    return { count: this.count, total: this.total, isAll: this.isAll };
  }

  // 回传模板的上下文回调数据 context
  get context(): SelectChildrenContext {
    return { $implicit: this.$implicit, checkAll: this.checkAll };
  }

  /** lifeCycle */
  ngAfterContentInit() {
    this.bindEvent();
    this.controls.changes.subscribe(() => this.bindEvent()); // 子内容动态改变重新订阅
    this.selectGroup.changes.subscribe(() => this.bindEvent()); // all 被更新 重新订阅后更新相应状态
  }

  /** methods */
  bindEvent() {
    this.unsubscribe();

    // 父级勾选改变子集
    this.selectGroup.forEach((all) => {
      this.subList.push(
        all.checkChanges$.subscribe((checked) => {
          if (this.selectGroup.length > 1) this.selectGroup.forEach((e) => (e.checked = checked)); // 有多个all情况 同步所有all
          this.controls.forEach(({ control }) => control?.patchValue(checked)); // 通过订阅父级所选改变子集 -> 遍历所属子集进行改变
        })
      );
    });

    const changes = this.controls?.map(({ control }) => control?.valueChanges);
    if (!changes || !changes.length) return;

    // 任意子改变
    this.subList.push(merge(...changes).subscribe(() => this.updateSelectAllState()));

    // 执行一遍更新all相应状态
    this.updateSelectAllState();
  }

  updateSelectAllState() {
    const hasChecked = !!this.count; // 是否有选中

    if (!(this.selectGroup && this.selectGroup.length)) return this.unsubscribe(); // all没找到或被销毁了
    this.selectGroup.forEach((all) => {
      all.checked = this.isAll;
      all.indeterminate = !this.isAll && hasChecked; // 不是全选且有选中情况
    });

    this.renderTpl();
  }

  // 渲染模板
  renderTpl() {
    this.tpl.toArray().forEach((e) => {
      e.viewContainer.clear();
      e.viewContainer.createEmbeddedView(e.tplRef, this.context);
    });
  }

  // 选择所有
  checkAll: ParentCheckAllFn = (isAll?: boolean | undefined) => {
    if (typeof isAll === 'undefined') {
      isAll = !this.controls.toArray().every(({ control }) => control!.value);
    }

    this.controls.forEach(({ control }) => control?.patchValue(isAll));
    this.updateSelectAllState();
  };

  unsubscribe() {
    if (!this.subList.length) return;

    this.subList.forEach((e) => e.unsubscribe());
    this.subList = [];
  }
}

/**
 * 全选指令用于数组
 * - 支持FormControl所选
 *
 * @usageNotes
 * ```html
 * <label class="checkbox checkbox-lg mr-8 fz-16">
 *   <input type="checkbox" [selectList]="formGroup.controls.weekRange" [selectAll]="weekList" selectKey="day" />
 *   <span class="mr-4"></span>{{ 'common.all' | lang }}
 * </label>
 * <label class="checkbox checkbox-lg mr-8 fz-16" *ngFor="let item of weekList">
 *   <input
 *     type="checkbox"
 *     [checkboxArrayControl]="$any(formGroup.controls.weekRange)"
 *     [checkboxArrayValue]="item.day"
 *   />
 *   <span class="mr-4"></span>{{ item.lang | lang }}
 * </label>
 * ```
 *
 * ### 说明
 * @param selectList {FormControl | any[]} 所选数组列表或所选FormControl
 * @param selectAll {Array<Object | string | String>} 所有列表
 * @param selectKey {keyof typeof selectList} 用于所选列表的key （会将当前item的[key]拿到所绑定的值进行操作）
 *
 * @Annotation
 */
@Directive({
  selector: 'input[selectAll]',
  standalone: true,
  host: {
    '[checked]': 'checked',
  },
  providers: [DestroyService],
})
export class SelectAllDirective<K = Object | string | String, T extends Array<K> = Array<K>> {
  constructor(
    private host: ElementRef<HTMLInputElement>,
    private destroy: DestroyService
  ) {}

  /**
   * 所有的列表
   */
  @Input('selectAll') set _(list: T) {
    this.list = list;
    this.checkUpdate();
  }

  /**
   * 绑定所选值的key
   */
  @Input('selectKey') selectKey: keyof K;

  /**
   * 选中的列表
   */
  private _valueChange$: Subscription;
  @Input('selectList') set _list(select: any[] | FormControl) {
    this._valueChange$?.unsubscribe();
    this.selectList = select;
    this.checkUpdate();

    if (this.selectList instanceof FormControl) {
      this._valueChange$ = this.selectList.valueChanges
        .pipe(takeUntil(this.destroy))
        .subscribe(() => this.checkUpdate());
    }
  }

  selectList: FormControl | any[] = [];
  list: T = [] as any;

  get selectValueList() {
    return this.selectList instanceof FormControl ? this.selectList.value : this.selectList;
  }

  get checked() {
    return this.selectValueList.length >= this.list.length;
  }

  set checked(checked: boolean) {
    this.host.nativeElement.checked = checked;
  }

  /**
   * 设置半选状态
   * @param checked
   */
  set indeterminate(checked: boolean) {
    // this.indeterminateClass = checked; // 这种方式绑定会有bug 不能实时进行绑定 页面活动（移动鼠标、点击等操作）才会进行绑定
    this.host.nativeElement.classList[checked ? 'add' : 'remove']('indeterminate');
  }

  /**
   * 检查更新状态
   */
  checkUpdate() {
    const hasChecked = !!this.selectValueList.length;
    this.indeterminate = !this.checked && hasChecked; // 不是全选且有选中情况
  }

  /**
   * 选中所有或反选
   */
  @HostListener('change', ['$event.target.checked'])
  onChange(checked: boolean) {
    if (checked) {
      const all = this.list.map((e) => e[this.selectKey]);
      this.selectList instanceof FormControl
        ? this.selectList.patchValue(all)
        : this.selectList.splice(0, -1 >>> 0, ...all);
    } else {
      this.selectList instanceof FormControl ? this.selectList.patchValue([]) : this.selectList.splice(0, -1 >>> 0);
    }

    this.selectList instanceof FormControl && this.selectList.updateValueAndValidity();

    this.checkUpdate();
  }
}
