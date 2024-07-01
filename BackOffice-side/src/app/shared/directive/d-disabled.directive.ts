import { ContentChildren, Directive, ElementRef, Input, OnInit, Optional, QueryList } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[attrDisabled]',
  standalone: true,
  host: {
    '[class.disabled]': 'disabled',
    // ng15x之后不适用
    '[attr.disabled]': 'disabled ? "disabled" : null',
  },
})
export class AttrDisabledDirective implements OnInit {
  constructor(
    @Optional() private ngControl: NgControl,
    private ele: ElementRef
  ) {}

  /**
   * 是否禁用 指令参数
   * @param v
   */
  @Input({
    alias: 'attrDisabled',
    required: true,
    transform: (value: boolean | string | undefined | null) => !!value as boolean,
  })
  set _(v: boolean) {
    if (this.disabled === v) return;
    this.disabled = v;
    this.updateDisabled();
  }

  /**
   * 查找所有子Control控件
   */
  @ContentChildren(NgControl, { descendants: true })
  ngControls!: QueryList<NgControl>;

  /**
   * 是否禁用
   */
  disabled = false;

  /**
   * 更新禁用状态
   */
  updateDisabled() {
    if (this.ngControl) {
      this.ngControl.valueAccessor?.setDisabledState!(this.disabled);
    }

    setTimeout(() => {
      this.ngControls?.toArray().forEach((c) => {
        c.valueAccessor?.setDisabledState!(this.disabled);
      });

      // TODO 后期扩展查找 .checkbox、.radio 添加 class.disabled
      // TODO 后期扩展查找 子元素Control添加setDisableState
    });
  }

  ngOnInit(): void {
    if (!this.ngControl /* && !this.ngControls?.length*/) {
      // console.warn(
      //   'Note: The trim directive should be used with one of ngModel, formControl or formControlName directives.'
      // );
      return;
    }

    this.updateDisabled();
  }
}
