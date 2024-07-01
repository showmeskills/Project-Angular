import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { filter, fromEvent, Subscription } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { NgIf, NgTemplateOutlet, NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'select-group',
  templateUrl: './select-group.component.html',
  styleUrls: ['./select-group.component.scss'],
  host: {
    '[style.left.px]': 'offset.left',
  },
  standalone: true,
  imports: [NgIf, NgTemplateOutlet, FormsModule, AngularSvgIconModule, NgFor, NgClass, LangPipe],
})
export class SelectGroupComponent<K extends keyof R, R extends {} = any> implements OnInit, OnDestroy, OnChanges {
  @Input() label: K = 'label' as any; // 显示选项的label
  @Input() value: K = 'value' as any; // 值属性
  @Input() disabled = 'disabled'; // 禁止属性
  @Input() emptyText = ''; // 空展示文字
  @Input() showSelectAll = true; // 是否显示选择所有 当type为checkbox有效
  @Input('data') propList: R[] = []; // 数据列表
  @Input() select: Array<R[typeof this.value]> = []; // 选中的value数组 可双向绑定 -> 需要传select 全部

  @Input() tabTemplate: TemplateRef<any> | null = null; // TabTemplate模板
  @Input('show') propShow = true; // popup浮层显示
  @Input() hideBtn = false; // 隐藏底部btn 当position为true有效
  @Input() type = 'checkbox'; // type属性 checkbox | radio
  @Input() scrollHeight = 180; // 最大滚动高度 默认 180
  @Output() selectChange: EventEmitter<any> = new EventEmitter();
  @Output() showChange: EventEmitter<boolean> = new EventEmitter();
  @Output() confirm: EventEmitter<R[]> = new EventEmitter(); // 确定提交事件

  @HostBinding('hidden') get isHidden() {
    return !this.show;
  } // 是否隐藏

  @HostBinding('class.position') // 装饰一手 position的class
  @Input()
  position = false; // 是否定位popup浮层

  @Input() title = ''; // 是否定位popup浮层

  @ViewChild('all', { static: true }) all!: ElementRef<HTMLInputElement>;

  kw = '';
  innerList: any[] = [];
  offset = { left: 0 };
  subscription: Subscription[] = [];

  get show() {
    return this.position ? this.propShow : true;
  }

  set show(v) {
    if (!v) this.kw = ''; // 关闭时，清空搜索

    this.showChange.emit(v);
  }

  get list() {
    return this.innerList;
  }

  get isCheckbox() {
    return this.type === 'checkbox';
  }

  get isRadio() {
    return this.type === 'radio';
  }

  get labelClassName() {
    return `${this.type} ${this.type}-lg w-100`;
  }

  get isSearchEmpty() {
    // 是否搜索结果为空
    return this.kw && !this.list.some((e) => this.hasSearchKW(e));
  }

  get isIndeterminate() {
    // 是否半选状态
    const isAll = this.list.every((e) => e.checked);
    const hasChecked = this.list.some((e) => e.checked);
    return !isAll && hasChecked;
  }

  constructor(private host: ElementRef) {}

  initEvent() {
    if (!this.position) return; // 只有定位浮层才有关闭效果

    // 检查 点击此组件以外元素关闭显示此组件 -> app-root 同级会有modal可能需要modal显示在这上面
    const click = fromEvent<MouseEvent>(document, 'click', { capture: true })
      .pipe(filter(() => this.show))
      .subscribe((event) => {
        const show = this.host.nativeElement.contains(event.target as Node);

        // 如果还是显示状态，则不做处理
        if (show) return;

        this.show = show;

        // 如果在弹窗里面阻止点击可能会导致点击背景关闭弹窗
        if (
          document.querySelector('body > .cdk-overlay-container') ||
          document.querySelector('body > ngb-modal-backdrop')
        ) {
          // 阻止其他弹窗关闭，体验就需要点击第二次才会关闭
          event.stopPropagation();
          event.preventDefault();
        }
      });

    this.subscription.push(click);
  }

  // 计算安全边缘距离
  computed() {
    this.offset.left = 0;

    setTimeout(() => {
      const { right, left } = this.host.nativeElement.getBoundingClientRect();
      if (document.body.clientWidth >= right || left < 0) return;

      this.offset.left = -Math.max(right - document.body.clientWidth, 0);
    });
  }

  // 计算需要渲染的列表
  computedList() {
    this.innerList = this.propList.map((e) => ({
      ...e,
      checked: this.getChecked(e[this.value]),
    }));
  }

  // 更新选中状态
  updateState() {
    this.innerList.forEach((e) => {
      e.checked = this.getChecked(e[this.value]);
    });
  }

  // 获取选中值
  getChecked(val) {
    return this.select.includes(val);
  }

  // 双向绑定select - 用于直接使用在页面情况
  onChange(item) {
    const value = item[this.value];
    let checked: any[];

    if (this.isCheckbox) {
      // checkbox
      checked = this.getCheckedAll().map((e) => e[this.value]);
    } else {
      // radio
      this.innerList.forEach((e) => (e.checked = false)); // 只选中一个
      item.checked = true;
      checked = [value];
    }

    this.selectChange.emit(checked);
    this.updateAllState();
  }

  updateAllState() {
    if (this.all.nativeElement && this.isCheckbox) {
      this.all.nativeElement.checked = this.list.every((e) => e.checked);
    }
  }

  // 是否含有关键词
  hasSearchKW(item) {
    return this.kw ? item[this.label]?.toLowerCase().includes(this.kw?.toLocaleLowerCase()) : true;
  }

  // 提交
  ok() {
    const res = this.getCheckedAll(); // 派发节点数组
    this.confirm.emit(res);
    this.show = false;
  }

  // 获取选中的值
  public getCheckedAll(): any[] {
    return this.propList.filter((e, i) => this.innerList[i]['checked']);
  }

  // checkAll修改
  onAllChange(e: Event) {
    const dom = e.target as HTMLInputElement;
    if (!dom) return;
    this.list.filter((e) => !e[this.disabled]).forEach((e) => (e.checked = dom.checked));

    const checked = this.getCheckedAll().map((e) => e[this.value]);
    this.selectChange.emit(checked);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['propShow']) {
      this.computed();
    }

    if (changes['propList'] || changes['propShow']) {
      this.computedList();
    } else if (changes['select']) {
      this.updateState();
    }

    this.updateAllState();
  }

  ngOnInit(): void {
    this.initEvent();
  }

  ngOnDestroy(): void {
    this.subscription.forEach((e) => e.unsubscribe());
  }
}
