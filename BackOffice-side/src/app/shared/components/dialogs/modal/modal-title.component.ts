import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal/modal-ref';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'modal-title',
  styles: [
    `
      :host {
        display: block;
      }

      .modal-title-drawer {
        justify-content: flex-end;
        flex-flow: row-reverse;
        padding: 14px 20px;
        border-bottom: 0;
      }
    `,
  ],
  template: `
    <div class="modal-header" [class.modal-title-drawer]="isDrawer">
      <div class="modal-title flex-1">
        {{ isAdd === true ? ('common.add' | lang) : '' }}
        {{ isAdd === false ? ('common.edit' | lang) : '' }}{{ title }}
        <ng-content></ng-content>
      </div>
      <div class="c-btn-close mr-4" (click)="onClose($event)">
        <svg-icon [src]="'./assets/images/svg/admin-close.svg'" class="svg-icon vam"></svg-icon>
      </div>
    </div>
  `,
  standalone: true,
  imports: [AngularSvgIconModule, LangPipe],
})
export class ModalTitleComponent implements OnInit {
  constructor(@Optional() private modal: MatModalRef<any>) {}

  ngOnInit(): void {}

  @Input() title!: string;
  @Input() isAdd!: string | boolean;
  @Input() type!: string;

  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close = new EventEmitter<any>();

  get isDrawer() {
    return this.type === 'drawer';
  }

  /** methods */
  onClose($event: MouseEvent) {
    // this.modal?.dismiss(); // 嵌套弹窗时，子弹窗用ngTemplate将找到的是父弹窗的modal，所以这里不能关闭
    this.close.emit($event);
  }
}
