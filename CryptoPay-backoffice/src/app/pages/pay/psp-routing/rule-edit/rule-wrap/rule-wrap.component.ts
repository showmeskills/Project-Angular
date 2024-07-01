import { booleanAttribute, Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AbstractControl, FormGroup } from '@angular/forms';
import { conditionItem } from 'src/app/pages/pay/psp-routing/rule-edit/rule-edit.component';

@Component({
  selector: 'rule-wrap',
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    LangPipe,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    AngularSvgIconModule,
  ],
  templateUrl: './rule-wrap.component.html',
  styleUrls: ['./rule-wrap.component.scss'],
})
export class RuleWrapComponent<
  T extends {
    [K in keyof T]: AbstractControl<any>;
  } = any
> {
  /**
   * 获取template模板标签（可用于回传参数）
   */
  @ContentChild(TemplateRef) templateRef!: TemplateRef<any>;

  /**
   * 删除规则事件
   */
  @Output() delete = new EventEmitter<AbstractControl | null>();

  /**
   * formGroup
   */
  @Input() formGroup: FormGroup<T>;

  /**
   * 标签名
   */
  @Input() label = '';

  /**
   * 是否显示标签
   */
  @Input({ transform: booleanAttribute }) showLabel = true;

  /**
   * 策略
   */
  @Input({ alias: 'rule' }) ruleItem: conditionItem = {} as any;

  /**
   * 是否显示删除按钮
   */
  @Input({ transform: booleanAttribute }) showDelete = true;

  /**
   * 表单样式
   */
  @Input() formStyle;

  /**
   * 表单标签宽度
   */
  @Input({ alias: 'label-width' }) labelWidth = '146px';

  onConditionDelRule() {
    this.delete.emit(this.formGroup?.get(this.ruleItem.field));
  }
}
