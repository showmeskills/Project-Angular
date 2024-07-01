import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject } from 'rxjs';
import { debounceTime, delay } from 'rxjs/operators';
import { QrscannerComponent } from 'src/app/shared/components/qrscanner/qrscanner.component';
import { LayoutService } from 'src/app/shared/service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-customize-input',
  templateUrl: './customize-input.component.html',
  styleUrls: ['./customize-input.component.scss'],
  host: {
    '[class.error]': '!!error',
    '[class.disabled]': 'disabled',
    '[class.loading]': 'loading',
  },
})
export class CustomizeInputComponent implements OnInit, AfterViewInit {
  constructor(private layout: LayoutService, private dialog: MatDialog) {}

  change$: Subject<string> = new Subject();
  hov: boolean = false;
  foc: boolean = false;
  inEye!: boolean;
  isH5!: boolean;

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  /**提示文案 */
  @Input() notice: string = '';
  /**标题 */
  @Input() label: string = '';
  /** 是否必须，在标题后面加*号 */
  @Input() required: boolean = false;
  /**左边icon */
  @Input() leftIcon!: string;
  /**value右边的icon（暂不处理极端情况超过input长度时候看不见的问题）, 密码类型的输入框无效*/
  @Input() valueRightIcon!: string;
  /**自定义width , size = large 时默认100% , size = medium 时h5下会自动变为100%  */
  @Input() width!: string;
  /**提示占位文字 */
  @Input() placeholder: string = '';
  /**触发 onChange 时使用 DebounceTime */
  @Input() onChangeDebounceTime: number = 0;
  /**size = medium 时，默认h5模式高度会变高（用于筛选弹窗），但也可以传fixedHeight从而固定高度 */
  @Input() fixedHeight: boolean = false;
  /**是否禁用 */
  @Input() disabled: boolean = false;
  /**是否loading */
  @Input() loading: boolean = false;
  /**是否只读 */
  @Input() readonly: boolean = false;
  /**是否自动焦点，通常用于弹窗 */
  @Input() autoFocus: boolean = false;
  /**是否自动忽略前后空格 */
  @Input() trim: boolean = true;
  /**最大输入字符数量，默认无限制。(仅 type = text 时候才有用) */
  @Input() max: number | null = null;
  /**是否自动完成 */
  @Input() autocomplete: boolean = true;
  /**是否自带清除按钮 */
  @Input() hasClear: boolean = true;
  /**原生input类型 */
  @Input() type: 'text' | 'number' | 'password' = 'text';
  /**尺寸 */
  @Input() size: 'large' | 'medium' | 'small' = 'medium';
  /**h5键盘弹出时候自动滚动到对应位置 */
  @Input() autoScroll: boolean = true;
  /**格式化函数 */
  @Input() format?: (x: any) => any;
  /**是否扫描二维码 */
  @Input() scanQr?: boolean = false;

  /** 错误信息 传值是布尔的时候，仅变红色框；传值是字符串且不为空时候，就显示错误文字 + 变红边框 */
  @Input() error: string | boolean = false;
  get errorTxt() {
    return typeof this.error === 'string' ? this.error : '';
  }

  /**双向绑定value ，【 一般情况下，请勿在父组件直接监听 valueChange，请使用监听 onChange 】 */
  @Input() value: any;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();

  /**绑定onChange自定义做其它事情,注意：从父组件进行的改变它不会被触发 */
  @Output() onChange: EventEmitter<any> = new EventEmitter();

  /**聚焦事件 */
  @Output() onFocus: EventEmitter<any> = new EventEmitter();
  /**失焦事件 */
  @Output() onBlur: EventEmitter<any> = new EventEmitter();
  /**按下事件 */
  @Output() onKeyDown: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.change$.pipe(debounceTime(this.onChangeDebounceTime), untilDestroyed(this)).subscribe(v => {
      this.onChange.emit(v);
    });

    this.layout.h5Keyboard$.pipe(delay(300), untilDestroyed(this)).subscribe(_ => {
      if (this.autoScroll && !this.inEye && this.foc) {
        this.input.nativeElement.scrollIntoView();
      }
    });

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  ngAfterViewInit() {
    this.autoFocus &&
      setTimeout(() => {
        this.focus();
      });
  }

  focus = () => {
    this.input.nativeElement.focus();
  };

  change(v: string) {
    this.trim && (v = v.trim());
    this.format && (v = this.format(v));
    if (this.input.nativeElement.value !== v) this.input.nativeElement.value = v;
    this.value = v;
    this.valueChange.emit(v);
    this.change$.next(v);
  }

  _onFocus(e: HTMLInputElement) {
    this.foc = true;
    this.onFocus.emit(e);
  }

  _onBlur(e: HTMLInputElement) {
    this.foc = false;
    this.onBlur.emit(e);
  }

  scan() {
    this.dialog
      .open(QrscannerComponent, {
        autoFocus: false,
        panelClass: 'custom-dialog-container',
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          this.value = result;
          this.valueChange.emit(result);
          this.change$.next(result);
        }
      });
  }
}
