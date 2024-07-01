import { Directive, HostBinding, Input, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * @description 输赢颜色指令
 * @example
 *  <div [winColor]="100">100</div>   -> <div style="color: winColorErrorColor"></div>
 *  <div [winColor]="-100">-100</div>   -> <div style="color: winColorSuccessColor"></div>
 *
 *  反转输赢颜色
 *  <div [winColor]="-100" [winColorReverse]="true">-100</div>   -> <div style="color: winColorErrorColor"></div>
 */
@Directive({
  selector: '[winColor]',
  standalone: true,
})
export class WinColorDirective {
  /**
   * 数值
   */
  @Input()
  get winColor() {
    return this._winColor;
  }

  set winColor(v: any) {
    this._winColor = v;
  }

  private _winColor: any = 0;

  /**
   * 是否反转输赢颜色
   */
  @Input() winColorReverse = false;

  /**
   * 涨幅颜色
   */
  @Input() winColorSuccessColor = '#50cd89';
  @Input() winColorErrorColor = '#f64e60';

  /**
   * 是否涨
   */
  private get isSuccess() {
    return +this.winColor > 0;
  }

  /**
   * 是否跌
   */
  private get isError() {
    return +this.winColor < 0;
  }

  /**
   * 获取颜色值
   * @private
   */
  private get getColorValue() {
    let colorKey: undefined | number = undefined;
    if (this.isSuccess) {
      colorKey = 0;
    } else if (this.isError) {
      colorKey = 1;
    }

    if (colorKey === undefined) return '';

    return [this.winColorErrorColor, this.winColorSuccessColor][+this.winColorReverse ^ colorKey];
  }

  /**
   * 绑定颜色
   * @private
   */
  @HostBinding('style.color')
  private get _color() {
    return this.getColorValue;
  }
}

@Directive({
  selector: '[win]',
  standalone: true,
})
export class WinDirective {
  constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef) {}

  @Input()
  set win(time: number | string) {
    const prev = +time > 0 ? '+' : '';
    this.viewContainerRef.createEmbeddedView(this.templateRef, { $implicit: time, prev });
  }
}

/**
 * 延迟显示元素
 * @param delay 延迟时间，单位毫秒
 * @example 结构指令演示，参考： https://cipchk.gitbooks.io/angular-practice/content/component/structural.html
 * <div *ngFor="let item of users | async; let i = index">
 *     <user-detail [user-id]="item.id" *delay="1000 * i"></user-detail>
 * </div>
 *
 * 更复杂应用可参考 PlatformAdmin\src\app\_metronic\partials\layout\subheader\subheader1\sub-header.directive.ts
 */
@Directive({
  selector: '[delay]',
  standalone: true,
})
export class Delay {
  constructor(private templateRef: TemplateRef<any>, private viewContainerRef: ViewContainerRef) {}

  private _hasCreateEmbeddedView = false;
  private _timerCreateEmbeddedView = 0;

  @Input()
  set delay(time: number) {
    if (this._hasCreateEmbeddedView) return; // 已经创建过了，不再创建

    window.clearTimeout(this._timerCreateEmbeddedView); // 如果有变化，清除上一次的定时器

    this._timerCreateEmbeddedView = window.setTimeout(() => {
      this._hasCreateEmbeddedView = true;
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }, time);
  }
}

/**
 * 固定选择的选项
 */
@Directive({
  selector: '[optionSticky]',
  exportAs: 'optionSticky',
  host: {
    class: 'select-fixed-option',
  },
  standalone: true,
})
export class OptionStickyDirective {}
