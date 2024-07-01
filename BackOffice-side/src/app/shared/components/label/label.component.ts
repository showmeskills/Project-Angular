import { Component, Input, OnInit } from '@angular/core';
import { ThemeType, ThemeTypeEnum } from 'src/app/shared/interfaces/base.interface';

@Component({
  selector: 'app-label, [app-label]',
  host: {
    '[class]': 'hostClass',
    '[style]': 'hostStyle',
    '[style.min-width.px]': 'minWidth',
    '[style.width.px]': 'width',
    '[style.padding-left.px]': '16',
    '[style.padding-right.px]': '16',
  },
  template: `<ng-content></ng-content>`,
  standalone: true,
})
export class LabelComponent implements OnInit {
  constructor() {}

  @Input('type')
  type: ThemeType | string = ThemeTypeEnum.Success;

  @Input() minWidth: any = '0';
  @Input() width!: any;
  @Input() height!: any;

  get hostClass(): string[] {
    return ['label', 'label-lg', 'label-inline', 'text-nowrap', 'text-center', 'label-light-' + this.type];
  }

  get hostStyle(): any {
    return {
      height: this.height,
      lineHeight: this.height,
    };
  }

  data: any = {
    name: '',
    currency: '',
    payMethod: '',
  };

  ngOnInit(): void {}
}
