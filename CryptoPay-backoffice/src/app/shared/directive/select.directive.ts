import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  Optional,
  QueryList,
  Self,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { fromEvent, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { NgControl } from '@angular/forms';

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
  selector: '[selectTpl]',
  standalone: true,
})
export class SelectTplDirective {
  constructor(public tplRef: TemplateRef<any>, public viewContainer: ViewContainerRef) {}
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
  get $implicit(): { count; total; isAll } {
    return { count: this.count, total: this.total, isAll: this.isAll };
  }

  // 回传模板的上下文回调数据 context
  get context(): any {
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
  checkAll = (isAll?: boolean | undefined): void => {
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
