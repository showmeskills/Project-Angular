import {
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Host,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';

/**
 * 触发事件
 * @param el
 * @param eventType
 */
function dispatchEvent(el, eventType) {
  const event = document.createEvent('Event');
  event.initEvent(eventType, false, false);
  el.dispatchEvent(event);
}

// 整数 默认正整数需要负数再扩展
@Directive({
  selector: '[input-number]',
  standalone: true,
})
export class InputNumberDirective {
  constructor(
    private host: ElementRef,
    @Host() @Optional() private control: NgControl
  ) {}

  @HostListener('input', ['$event.target', '$event.target.value'])
  onInput(el: any, value: string): void {
    const newVal = el.value
      .replace(/\D/g, '')
      .replace(/^0+$/, '0')
      .replace(/^0(\d+)$/, '$1');

    if (newVal === value) return;

    el.value = newVal;
    this.control?.control?.setValue(newVal);

    dispatchEvent(el, 'input');
  }
}

@Directive({
  selector: '[input-percentage]',
  standalone: true,
})
export class InputPercentageDirective {
  constructor(
    private host: ElementRef,
    @Host() @Optional() private control: NgControl
  ) {}

  /** 是否支持输入负数
   * [input-percentage]="true"
   * <input input-percentage [negative]="true" />
   */
  @Input('input-percentage')
  set inputPercentage(v: boolean | string) {
    this.negative = v === 'true' || v === true;
  }

  /** 支持几位小数 默认：2 */
  private _decimal: number | string = 2;
  @Input()
  get decimal() {
    return this._decimal;
  }

  set decimal(v) {
    this._decimal = +v || 0;
    this.onInput(this.host.nativeElement, this.host.nativeElement.value);
  }

  /** 是否支持输入负数 */
  @Input()
  public negative = false;

  /** 最大值 0.01~100 */
  @Input()
  public max = 100;

  /** 最小值 -0.01~-100 */
  @Input()
  public min = -100;

  get isInt() {
    return !this.decimal;
  }

  get firstReg(): RegExp {
    if (this.isInt) {
      return this.negative ? /([^\d-])/g : /([^\d])/g; // 支持负数
    }

    return this.negative
      ? /(^\.|[^\d.+-])/g // 支持负数
      : /(^\.|[^\d.])/g;
  }

  @HostListener('input', ['$event.target', '$event.target.value'])
  onInput(el: any, value: string): void {
    let newVal = value
      .replace(this.firstReg, '')
      .replace(/^0(\d+(.*?))/g, '$1') // 替换连续0整数字符
      .replace(/^([-+])0(\d+)/, '$1$2') // 替换连续0整数字符
      // .replace(/^([-+0])+/g, '$1')
      .replace(/(.)[-+]/g, '$1') // 替换点后面
      .replace(/^([-+])\./g, '$1') // 替换加减后不带小数点 +. -.
      .replace('.', '$#$') // 保证只有一个小数点
      .replace(/\./g, '') // 保证只有一个小数点
      .replace('$#$', '.') // 保证只有一个小数点
      .replace(new RegExp(`(\\.\\d{${this._decimal}})\\d+$`), '$1') // 浮点结尾截取
      .replace(/^(([+-])\d{3,}|\d{3,})(\.)*\d*?/, '$2100'); // 替换整数部分最大100
    // .replace(/^([+-]\d{2}|\d{2})\d+?/, '$1') // 限制整数部分为两位 最多99.99% 达不到100%

    // 如果可以被转化成数值进行验证
    if (+newVal) {
      if (+newVal > this.max) {
        newVal = newVal.replace(/^(([+-])\d+|\d+)(\.)*\d*?$/, '$2' + this.max); // 保留符号替换成最大值
      } else if (+newVal < this.min) {
        newVal = newVal.replace(/^(([+-])\d+|\d+)(\.)*\d*?$/, '$2' + Math.abs(this.min)); // 保留符号替换成最小值
      }
    }

    if (newVal === value) return;

    el.value = newVal;
    this.control?.control?.setValue(newVal);

    dispatchEvent(el, 'input');
  }

  @HostListener('focus', ['$event.target', '$event.target.value'])
  onfocus(el: any, value: string): void {
    if (!+value) {
      if (this.control) {
        this.control.control?.setValue('');
        // dispatchEvent(el, 'focus');
      }
    }
  }

  @HostListener('blur', ['$event.target', '$event.target.value'])
  onblur(el: any, value: string): void {
    const val = value
      // .replace(/^(\d+)$/, '$1.00')
      .replace(/\.(\d)$/, '.$10')
      .replace(/(\.)$/, '.00');

    if (val === value) return;

    if (+val) {
      el.value = val;

      if (this.control) {
        this.control.control?.setValue(val);
      }
    } else {
      // 错误值
      this.control?.control?.setValue('');
      el.value = '0.00'; // 显示值给上
    }

    dispatchEvent(el, 'blur');
  }
}

@Directive({
  selector: '[input-float]',
  standalone: true,
})
export class InputFloatDirective {
  constructor(
    private host: ElementRef,
    @Host() @Optional() private control: NgControl
  ) {}

  /** 小数点后保留位数
   * [input-float]="2"
   */
  @Input('input-float')
  set inputFloat(value: number | string) {
    this._decimal = value;
    this.oninput(this.host.nativeElement, this.host.nativeElement.value);
  }

  /** 最大值 */
  private max?: number;

  @Input('input-max')
  set inputMax(value: number | undefined) {
    this.max = value === undefined ? undefined : +value;
    this.oninput(this.host.nativeElement, this.host.nativeElement.value);
  }

  /** 是否支持输入负数 */
  private _negative: boolean | string = false;
  @Input()
  set negative(value: boolean) {
    this._negative = value;
    this.oninput(this.host.nativeElement, this.host.nativeElement.value);
  }

  /** 是否只支持输入负数 */
  private _negativeOnly = false;

  @Input('negativeOnly')
  get negativeOnly() {
    return this._negativeOnly;
  }

  set negativeOnly(v) {
    this._negativeOnly = v;
    this.oninput(this.host.nativeElement, this.host.nativeElement.value);
  }

  /** 支持几位小数 默认：2 */
  private _decimal: number | string = 2;
  @Input()
  get decimal() {
    return this._decimal;
  }

  set decimal(v) {
    this._decimal = v;
    this.oninput(this.host.nativeElement, this.host.nativeElement.value);
  }

  get firstReg(): RegExp {
    return !!this._negative || this.negativeOnly
      ? /(^\.|[^\d.-])/g // 支持负数
      : /(^\.|[^\d.])/g;
  }

  // 根据需要可以修改成addEventListener
  // TODO 后期记录 range 选择开始和结束位置 replace后还原记录光标的position start
  @HostListener('input', ['$event.target', '$event.target.value'])
  oninput(el: any, value: string): void {
    let newVal = value
      .replace(this.firstReg, '')
      .replace(/^(-0|0)+$/, '$1')
      .replace(/^(-0|0)(\d+)/, '$2')
      .replace(/^-/, '$%$')
      .replace(/-/g, '')
      .replace('$%$', '-')
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.')
      .replace(new RegExp(`(\\.)(\\d{0,${this.decimal}})\\d*`, 'g'), '$1$2');

    if (this.negativeOnly) {
      newVal = newVal.replace(/^-?(.*?)/, '-$1');
    }

    if (this.max !== undefined) {
      newVal = +newVal > this.max ? String(this.max) : newVal;
    }

    if (newVal === value) return;

    el.value = newVal;
    if (this.control) {
      this.control.control?.setValue(newVal);
    }

    dispatchEvent(el, 'input');
  }

  @HostListener('focus', ['$event.target', '$event.target.value'])
  onfocus(el: any, value: string): void {
    if (+this.decimal !== 2 && value === '0.00') {
      el.value = '';
      // dispatchEvent(el, 'focus');
    }
  }

  @HostListener('blur', ['$event.target', '$event.target.value'])
  onblur(el: any, value: string): void {
    if (+this.decimal === 2) {
      const val = value
        .replace(/^(\d+)((?!\.\d+)|\.)$/, '$1.00') // 没有小数或只有小数点结尾情况
        .replace(/\.(\d)$/, '.$10') // 只有一位小数情况
        .replace(/(\.)$/, '.00');

      if (el.value === value) return;

      if (+val) {
        el.value = val;

        if (this.control) {
          this.control.control?.setValue(val);
        }
      } else {
        // 错误值
        this.control?.control?.setValue('');
        el.value = '0.00'; // 显示值给上
      }

      dispatchEvent(el, 'blur');
    }
  }
}

/**
 * trim输入
 * 源自：
 *  https://www.npmjs.com/package/ngx-trim-directive
 *
 *  https://github.com/KingMario/packages/blob/master/projects/ngx-trim-directive/src/lib/ngx-trim.directive.ts
 */
@Directive({
  selector: '[input-trim]',
  standalone: true,
})
export class InputTrimDirective implements OnInit, OnDestroy {
  private _trim: '' | 'input' | 'blur' | false = '';
  @Input('input-trim')
  public set trim(trimOption: '' | 'input' | 'blur' | false) {
    if (trimOption === '') {
      trimOption = 'blur';
    }

    if (trimOption !== 'input' && trimOption !== 'blur' && trimOption !== false) {
      console.warn(`input-trim: The value ${JSON.stringify(trimOption)} is not assignable to the trim attribute.
        Only blank string (""), "blur" or false is allowed.`);

      this._trim = false;
      return;
    }

    this._trim = trimOption;

    const elem = this.elementRef.nativeElement;
    const eleValue = elem.value;
    if (trimOption !== false && eleValue !== eleValue.trim()) {
      // initially trim the value if needed
      dispatchEvent(elem, trimOption);
    }
  }

  public get trim() {
    return this._trim;
  }

  @Input() trimOnWriteValue = true;

  private _valueAccessor!: ControlValueAccessor;
  private _writeValue!: (value) => void;

  constructor(
    private elementRef: ElementRef,
    @Optional() private ngControl: NgControl
  ) {}

  private static getCaret(el) {
    return {
      start: el.selectionStart,
      end: el.selectionEnd,
    };
  }

  private static setCaret(el, start, end) {
    el.selectionStart = start;
    el.selectionEnd = end;

    el.focus();
  }

  private static trimValue(el, value) {
    el.value = value.trim();
    dispatchEvent(el, 'input');
  }

  ngOnInit(): void {
    if (!this.ngControl) {
      console.warn(
        'Note: The trim directive should be used with one of ngModel, formControl or formControlName directives.'
      );
      return;
    }

    this._valueAccessor = this.ngControl.valueAccessor!;

    this._writeValue = this._valueAccessor.writeValue;
    this._valueAccessor.writeValue = (value) => {
      const _value =
        this.trim === false || !value || 'function' !== typeof value.trim || !this.trimOnWriteValue
          ? value
          : value.trim();

      if (this._writeValue) {
        this._writeValue.call(this._valueAccessor, _value);
      }

      if (value !== _value) {
        if (this._valueAccessor['onChange']) {
          this._valueAccessor['onChange'](_value);
        }

        if (this._valueAccessor['onTouched']) {
          this._valueAccessor['onTouched']();
        }
      }
    };
  }

  ngOnDestroy(): void {
    if (this._valueAccessor && this._writeValue) {
      this._valueAccessor.writeValue = this._writeValue;
    }
  }

  @HostListener('blur', ['$event.target', '$event.target.value'])
  onBlur(el: any, value: string): void {
    if (this.trim === false) return;

    if (
      (this.trim === '' || 'blur' === this.trim || 'input' === this.trim) &&
      'function' === typeof value.trim &&
      value.trim() !== value
    ) {
      InputTrimDirective.trimValue(el, value);
      dispatchEvent(el, 'blur'); // in case updateOn is set to blur
    }
  }

  @HostListener('input', ['$event.target', '$event.target.value'])
  onInput(el: any, value: string): void {
    if (this.trim === false) return;
    if ((this.trim === '' || 'input' === this.trim) && 'function' === typeof value.trim && value.trim() !== value) {
      let { start, end } = InputTrimDirective.getCaret(el);

      if (value[0] === ' ' && start === 1 && end === 1) {
        start = 0;
        end = 0;
      }

      InputTrimDirective.trimValue(el, value);
      InputTrimDirective.setCaret(el, start, end);
    }
  }
}

/**
 * 多选框绑定勾选值
 *
 * @usageNotes
 * ```html
 *  form-row
 *    required
 *    name="tenantIds"
 *    label-width="220px"
 *    [label]="'game.provider.support_maker' | lang"
 *    [invalidFeedback]="{ arrayRequired: 'game.provider.sup_maker' | lang }"
 *  >
 *    <ng-template let-control="formControl" let-invalid="invalid">
 *      <div class="d-flex flex-wrap lh-38">
 *        <label
 *          class="checkbox checkbox-lg fz-16 mr-12"
 *          *ngFor="let item of subHeaderService.merchantListAll; let i = index"
 *        >
 *          <input type="checkbox" [checkboxArrayControl]="control" [checkboxArrayValue]="item.value" />
 *          <span class="mr-2"></span>{{ item.name }}
 *        </label>
 *      </div>
 *    </ng-template>
 *  </form-row>
 * ```
 *
 * ### 说明
 * 只需绑定者两个属性即可，不能绑定响应式表单或者模板驱动表单
 * - checkboxArrayControl: 绑定表单控件
 * - checkboxArrayValue: 绑定勾选值
 *
 * @Annotation
 */
@Directive({
  selector: `input[type="checkbox"][checkboxArrayControl][checkboxArrayValue]`,
  standalone: true,
})
export class CheckboxArrayControlDirective<T> implements OnInit {
  constructor(private elementRef: ElementRef) {}

  private destroy$ = new Subject<void>();

  private checkValue: T;

  /**
   * 绑定勾选值
   */
  @Input('checkboxArrayValue')
  set _checkboxArrayValue(value: T) {
    this.checkValue = value;
    this.check();
  }

  private control: FormControl<T[]>;

  /**
   * 绑定表单控件
   *  - 会根据当前传入类型赋值给T，后去匹配checkboxArrayValue的类型，如果不匹配会报分配类型错误
   */
  @Input('checkboxArrayControl')
  get _checkboxArrayControl(): FormControl<T[]> {
    return this.control;
  }

  set _checkboxArrayControl(v: FormControl<T[]>) {
    this.control = v;
    this.check();

    this.destroy$.complete();
    this.destroy$.next();
    this.destroy$ = new Subject<void>();
    this.control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.check());
  }

  ngOnInit(): void {
    this.check();
  }

  /**
   * 检查是否勾选，并设置勾选状态
   */
  check() {
    const el = this.elementRef.nativeElement;
    el.checked = this.control!.value?.includes(this.checkValue);
  }

  /**
   * 勾选事件
   * @param el
   * @param checked
   */
  @HostListener('change', ['$event.target', '$event.target.checked'])
  private onInput(el: any, checked: boolean): void {
    const checkedList = this.control.value.filter((e) => e !== this.checkValue);

    checked && checkedList.push(this.checkValue);
    this.control.setValue(checkedList);
    this.control.markAllAsTouched(); // 手动执行触摸
  }
}

/**
 * 与查看密码指令配合使用
 * @usageNotes
 * ## 使用实例
 * ```html
 *     <label [invalid]="invalid" form-wrap>
 *       <input
 *         [formControl]="control"
 *         type="password"
 *         [input-reveal]="reveal"
 *       />
 *       <reveal #reveal [reveal]="false"></reveal>
 *     </label>
 * ```
 *
 */
@Component({
  selector: 'reveal',
  template: `
    <ng-content></ng-content>
    <svg-icon
      (click)="onSwitch(true)"
      [hidden]="!_reveal"
      [src]="'./assets/images/svg/eye-close.svg'"
      class="svg-icon svg-icon-2x color-999"
    ></svg-icon>
    <svg-icon
      (click)="onSwitch(false)"
      [hidden]="_reveal"
      [src]="'./assets/images/svg/eye.svg'"
      class="svg-icon svg-icon-2x color-999"
    ></svg-icon>
  `,
  standalone: true,
  imports: [AngularSvgIconModule, CommonModule],
  host: {
    class: 'user-select-none',
  },
})
export class RevealComponent implements OnInit {
  ngOnInit(): void {}

  private revealVal = false;
  get _reveal() {
    return this.revealVal;
  }

  set _reveal(v: boolean) {
    this.revealVal = v;
    this.updateReveal();
  }

  @Input() set reveal(v: boolean | string) {
    this._reveal = !!v;
  }

  @Output() revealChange = new EventEmitter<boolean>();

  @HostListener('click')
  onSwitch(v?: boolean) {
    this._reveal = v !== undefined ? v : !this._reveal;
    this.revealChange.emit(this._reveal);
  }

  input?: InputRevealDirective;
  registerInput(inp: InputRevealDirective) {
    this.input = inp;
    this.updateReveal();
  }

  updateReveal() {
    if (!this.input) return;

    this.input.isReveal = this._reveal;
  }
}

/**
 * 与查看密码组件配合使用
 * @usageNotes
 * ## 使用实例
 * ```html
 *     <label [invalid]="invalid" form-wrap>
 *       <input
 *         [formControl]="control"
 *         type="password"
 *         [input-reveal]="reveal"
 *       />
 *       <reveal #reveal [reveal]="false"></reveal>
 *     </label>
 * ```
 *
 */
@Directive({
  selector: '[input-reveal]',
  standalone: true,
  host: {
    '[type]': 'isReveal ? "text" : "password"',
  },
})
export class InputRevealDirective {
  public isReveal = false;

  _reveal: RevealComponent;

  @Input('input-reveal') set _(reveal: RevealComponent) {
    this._reveal = reveal;
    reveal.registerInput(this);
  }
}
