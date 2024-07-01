import { Component, Directive, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf } from '@angular/common';

@Directive({
  selector: '[form-full]',
  host: {
    class: 'full-input-reset',
  },
  standalone: true,
})
export class FormFullDirective {
  constructor(@Optional() @Inject(FormRowComponent) public formRow: FormRowComponent) {}
}

@Component({
  selector: 'form-wrap, [form-wrap]',
  template: `
    <label
      class="form-field"
      [class]="labelClass"
      [class.is-valid]="valid"
      [class.is-invalid]="invalid"
      [style]="labelStyle"
    >
      <ng-content select="[prefix]"></ng-content>
      <ng-content></ng-content>
      <ng-content select="[suffix]"></ng-content>
      <!-- 清除图标 -->
      <svg-icon
        *ngIf="showClear && row?.control?.value"
        (click)="onClear($event)"
        class="form-icon-clear svg-icon svg-icon-1x"
        [src]="'assets/images/svg/close.svg'"
      ></svg-icon>
    </label>
  `,
  styleUrls: ['./form-wrap.component.scss'],
  host: {},
  standalone: true,
  imports: [NgIf, AngularSvgIconModule],
})
export class FormWrapComponent implements OnInit {
  constructor(@Optional() @Inject(FormRowComponent) public row: FormRowComponent) {}

  /** 是否无效验证 */
  @Input() invalid = false;

  /** 是否通过验证 */
  @Input() valid = false;

  @Input() labelClass;

  /** 是否显示清空 */
  @Input() showClear = false;
  @Output() clear = new EventEmitter<MouseEvent>();

  /** label样式 */
  @Input() labelStyle!: any;

  ngOnInit(): void {}

  onClear(event: MouseEvent): void {
    if (this.row?.control) {
      this.row.control.setValue('');
    }

    this.clear.emit(event);
  }
}
