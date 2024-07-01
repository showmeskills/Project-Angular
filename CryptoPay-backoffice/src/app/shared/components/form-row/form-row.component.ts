import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  SkipSelf,
  TemplateRef,
} from '@angular/core';
import { ControlContainer, FormControl, FormGroup, FormGroupDirective, FormGroupName } from '@angular/forms';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'form-row,[form-row]',
  templateUrl: './form-row.component.html',
  styleUrls: ['./form-row.component.scss'],
  providers: [],
  standalone: true,
  imports: [NgIf, NgTemplateOutlet, AngularSvgIconModule, NgFor],
})
export class FormRowComponent implements OnInit {
  constructor(
    @SkipSelf() @Optional() private parentFG: FormGroupDirective,
    @SkipSelf() @Optional() private groupName: FormGroupName,
    @SkipSelf() @Optional() private parent: ControlContainer,
    @SkipSelf() @Optional() public lang: LangService
  ) {}

  /** 获取template模板标签（可用于回传参数） */
  @ContentChild(TemplateRef) templateRef!: TemplateRef<any>;
  /** 验证无效反馈 */
  @ContentChild('invalidFeedback') invalidFeedbackTpl!: TemplateRef<any>;
  /** 自定义验证无效提示 */
  @ContentChild('invalidFeedbackCustom')
  invalidFeedbackCustom!: TemplateRef<any>;

  /** 标签跟随formControl禁止时改变为禁止样式 */
  @Input() labelAutoDisable = false;

  /** 显示红星 */
  @Input() required: boolean | string = false;

  /** 验证的名称 */
  @Input() name = '';

  /** 标签名称 */
  @Input() label!: string | TemplateRef<any>;

  /** 标签名称显示 */
  @Input() showLabel = true;

  /** 冒号标记 */
  @Input() flag = true;

  /** 内容宽度 */
  @Input()
  get contentWidth(): number | string | undefined {
    return this._contentWidth;
  }

  set contentWidth(v: string | number | undefined) {
    this._contentWidth = (isNaN(+(v as number)) ? v : v + 'px') as string;
  }

  private _contentWidth?: string;

  /** 用于验证的 FormGroup */
  @Input('group') public _formGroup!: FormGroup | any;

  /** 用于验证 Control */
  @Input('control') public _control!: FormControl | any;

  /** 验证失败提示数组 */
  @Input() invalidFeedback: { [key: string]: string | TemplateRef<any> } = {};

  /** 多选内容后面带 图标> */
  @Input() multiContent!: string;
  @Output() multiContentClick: EventEmitter<any> = new EventEmitter<any>();

  /** 标签宽度 */
  @Input('label-width')
  get labelBasis() {
    return this._labelBasis;
  }

  set labelBasis(v: string | number) {
    this._labelBasis = (isNaN(+v) ? v : v + 'px') as string;
  }

  private _labelBasis: string | number = 'auto';

  /** 行高 */
  @Input('line-height')
  lineHeight: string | number = '42px';

  // 名称的样式
  @Input() labelStyle!: any;

  // 名称标签的样式
  @Input('labelWrapStyle')
  get labelWrapStyle() {
    return {
      lineHeight: this.lineHeight,
      flex: `0 0 ${this.labelBasis}`,
      width: this.labelBasis, // flex 子元素不给宽度剩下内容指明宽度内容会溢出造成宽度不准
      marginRight: this.labelBasis === 'auto' ? '16px' : '',
      ...this._labelWrapStyle,
    };
  }

  set labelWrapStyle(v: any) {
    this._labelWrapStyle = v;
  }

  private _labelWrapStyle!: any;

  // 默认行高1
  @Input('labelTextAuto')
  set labelTextAuto(v: boolean | string) {
    if (v) {
      this._labelWrapStyle = {
        lineHeight: '18px',
        paddingTop: '12px',
        paddingBottom: '12px',
        ...this._labelWrapStyle,
      };
    }
  }

  // 内容的样式
  @Input('contentStyle') _contentStyle: any = {};
  get contentStyle() {
    return {
      width: this.contentWidth,
      lineHeight: this.lineHeight,
      ...this._contentStyle,
    };
  }

  /** 显示几条feedBack */
  @Input() showFeedBack = 1;

  /** 就近取Group */
  @Input() nearGroup = false;

  /** getters */
  // 是否无效遍历
  get invalidFeedbackArr(): any[] {
    return Object.keys(this.invalidFeedback).map((key) => ({
      validation: key,
      content: this.invalidFeedback[key],
    })) as any[];
  }

  get showInvalidFeedback(): any[] {
    return this.invalidFeedbackArr.filter((e) => this.showInvalid(e.validation)).slice(0, this.showFeedBack);
  }

  get group(): FormGroup | undefined {
    if (this.nearGroup) return this._formGroup || (this.groupName || this.parent)?.control || this.parentFG?.form;
    return this._formGroup || this.parentFG?.form || (this.groupName || this.parent)?.control;
  }

  // 当前Control
  get control(): FormControl | undefined {
    return this._control || this.group?.controls[this.name];
  }

  // 是否验证无效
  get invalid(): boolean {
    // 优先级: control > formGroup > parentFormGroup
    const control = this.control;
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  // 是否验证通过
  get valid(): boolean {
    // 优先级: control > formGroup > parentFormGroup
    const control = this.control;
    return control ? control.valid && !control.pending : false;
  }

  // 名称标签的文本内容
  get labelHTML() {
    return typeof this.label === 'string' ? this.label : '';
  }

  // 名称标签的模板内容
  get labelTemplate(): TemplateRef<any> | null {
    return typeof this.label !== 'string' ? this.label : null;
  }

  // 是否显示带后缀图标的内容
  get showMultiContent() {
    return this.multiContent !== undefined;
  }

  // 获取内容
  get data() {
    const control = this.control;
    return control ? control.value : undefined;
  }

  /** lifeCycle */
  ngOnInit(): void {}

  /** methods */
  // 是否显示未验证提示内容
  showInvalid(validation: any): boolean {
    const control = this.control;
    return control ? control.hasError(validation) && (control.dirty || control.touched) : false;
  }

  // 是否为Template模板
  isTemplate(v: any): boolean {
    return v instanceof TemplateRef;
  }

  // 带图标静态内容点击
  onMultiContentClick(): void {
    this.multiContentClick.emit({ value: this.data });
  }
}
