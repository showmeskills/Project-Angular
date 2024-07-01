import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { LabelComponent } from 'src/app/shared/components/label/label.component';

@Component({
  selector: 'channel-order-label',
  template: `
    <app-label [type]="type" class="d-flex" [minWidth]="96">
      <ng-content></ng-content>
      <div *ngIf="isOk" class="ok ml-2" [class]="['text-' + type]"></div>
    </app-label>
  `,
  host: {
    class: 'd-inline-block',
  },
  standalone: true,
  imports: [LabelComponent, NgIf],
})
export class OrderLabelComponent implements OnInit {
  constructor() {}

  @Input() isOk = false;

  @Input()
  type: 'success' | 'primary' | 'danger' | 'warning' | 'yellow' | 'info' = 'success';

  ngOnInit(): void {}
}
