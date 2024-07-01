import { Component, Directive, EventEmitter, HostListener, Input, OnInit, Optional, Output } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal/modal-ref';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { NgTemplateOutlet, NgIf } from '@angular/common';

@Directive({
  selector: 'modal-footer[confirmClose]',
  standalone: true,
})
export class ConfirmCloseDirective {
  constructor(@Optional() private modal: MatModalRef<any>) {}

  @Input('confirmClose') confirmClose;

  @HostListener('confirm', ['$event'])
  onConfirm() {
    this.modal?.close(this.confirmClose);
  }
}

@Directive({
  selector: 'modal-footer[dismissClose]',
  standalone: true,
})
export class DismissCloseDirective {
  constructor(@Optional() private modal: MatModalRef<any>) {}

  @Input('dismissClose') dismissClose;

  @HostListener('dismiss', ['$event'])
  onConfirm() {
    this.modal?.close(this.dismissClose);
  }
}

@Component({
  selector: 'modal-footer',
  styles: [
    `
      :host {
        display: flex;
      }
    `,
  ],
  host: {
    class: 'modal-footer btn-wrap',
  },
  template: `
    <ng-container>
      <ng-container *ngTemplateOutlet="defaultTpl; context: { $implicit: {} }"> </ng-container>

      <ng-template #defaultTpl>
        <button type="button" class="c-btn btn btn-light" (click)="onDismiss()" *ngIf="dismissShow">
          <ng-container *ngIf="dismissText; else dismissTpl">{{ dismissText }}</ng-container>
          <ng-template #dismissTpl>{{ 'common' | lang: dismissKey }}</ng-template>
        </button>
        <button type="button" class="c-btn btn btn-primary" (click)="confirm.emit($event)" *ngIf="confirmShow">
          <ng-container *ngIf="confirmText; else confirmTpl">{{ confirmText }}</ng-container>
          <ng-template #confirmTpl>{{ 'common' | lang: confirmKey }}</ng-template>
        </button>
      </ng-template>
    </ng-container>
  `,
  standalone: true,
  imports: [NgTemplateOutlet, NgIf, LangPipe],
})
export class ModalFooterComponent implements OnInit {
  constructor(@Optional() private modalRef: MatModalRef<any>) {}

  ngOnInit(): void {}

  @Input() dismissKey = 'cancel';
  @Input() confirmKey = 'confirm';
  @Input() dismissText = '';
  @Input() confirmText = '';
  @Input() confirmShow = true;
  @Input() dismissShow = true;

  @Output() dismiss = new EventEmitter<any>();
  @Output() confirm = new EventEmitter<any>();

  onDismiss() {
    // TODO 找时间优化 自定义关闭的 这里不能直接给关闭
    // this.modal?.dismiss();
    this.dismiss.emit(this.modalRef);
  }
}
