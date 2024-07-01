import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[flip]',
  exportAs: 'flip',
  host: {
    class: 'fz-flip',
    '[style.height]': 'flipHeight',
  },
  standalone: true,
})
export class FlipDirective {
  constructor() {}

  private _inTransition = false;

  /** 触发翻转效果动作 */
  @Input() flipTrigger: 'click' | 'hover' = 'click';

  /** 触发翻转效果动作 */
  @Input() flipHeight!: string;

  /** 状态 */
  @Output() flipChange = new EventEmitter<boolean>(false);

  @HostBinding('class.fz-flip-wrap')
  get isBack() {
    return this._isBack;
  }

  set isBack(v) {
    this._isBack = v;
    this.flipChange.emit(v);
  }

  private _isBack = false;

  @HostListener('click') onClick() {
    if (this.flipTrigger !== 'click' || this._inTransition) return;

    this.isBack = !this.isBack;
    this.isBack && (this._inTransition = true);
  }

  @HostListener('mouseenter') onEnter() {
    if (this.flipTrigger !== 'hover') return;

    this.isBack = true;
  }

  @HostListener('mouseleave') onLeave() {
    if (this.flipTrigger !== 'hover') return;

    this.isBack = false;
  }

  @HostListener('transitionstart') onTransitionstart() {
    this._inTransition = true;
  }

  @HostListener('transitionend') onTransitionend() {
    this._inTransition = false;
  }
}

@Directive({
  selector: '[flipFace], [flip-face]',
  host: {
    '[class]': '"fz-flip-face"',
  },
  standalone: true,
})
export class FlipFaceDirective {
  constructor() {}
}

@Directive({
  selector: '[flipBack], [flip-back]',
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    class: 'fz-flip-face fz-flip-back',
    '[style.position.static]': 'isBack',
  },
  standalone: true,
})
export class FlipBackDirective {
  constructor() {}

  @Input() isBack = true;
}
