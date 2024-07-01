import { Component, Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Currency } from 'src/app/shared/interfaces/currency';

@Directive({
  selector: 'img[currencyIcon]',
  exportAs: 'currencyIcon',
  host: {
    alt: '',
    class: 'vam',
    '[attr.src]': 'src',
    '[attr.width]': 'size',
    '[attr.height]': 'size',
    '[style.max-width]': 'size',
    '[style.max-height]': 'size',
    '[style.min-width]': 'size',
    '[style.min-height]': 'size',
    '[class.invisible]': '!type',
  },
  standalone: true,
})
export class CurrencyIconDirective implements OnInit, OnDestroy {
  constructor(private currencyService: CurrencyService, public _elementRef: ElementRef) {}

  currency!: Currency[];
  private _destroy$ = new Subject<void>();
  private _initGetList$ = new Subject<void>();

  @Input('currencyIcon') public type?: string | unknown;

  /**
   * 自定义传入币种列表进行内部匹配
   * PS: 不进行内部请求，传入空数组即可
   */
  @Input() currencyList?: Currency[] = undefined;

  /** 图片宽高css的尺寸 */
  @Input('currencySize') size = '16px';

  get src(): string {
    return (this.currencyList || this.currency)?.find((e) => e.code === this.type)?.icon || '';
  }

  ngOnInit() {
    /** 如果没传将进行内部请求 */
    if (this.currencyList === undefined) {
      this.currencyService.list$.pipe(takeUntil(this._destroy$)).subscribe((res: any[]) => {
        this.currency = res;
      });

      if (!this.currency?.length) {
        // 没有币种数据时进行请求
        this._initGetList$.next();
        this._initGetList$.complete();
        this._initGetList$.subscribe(() => {
          // 已经complete 多次next只会触发一次请求
          this.currencyService.updateCurrency();
        });
      }
    }
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

@Component({
  selector: '[iconCountry]',
  exportAs: 'iconCountry',
  host: {
    class: 'vam',
    '[style.display]': '"inline-block"',
    '[style.width]': 'size',
    '[style.height]': 'size',
    '[style.max-width]': 'size',
    '[style.max-height]': 'size',
    '[style.min-width]': 'size',
    '[style.min-height]': 'size',
  },
  template: `<i class="country" [class]="countryName" [style.transform]="scale"></i>`,
  standalone: true,
})
export class IconCountryComponent {
  constructor() {}

  /**
   * 国家code
   */
  @Input('iconCountry') public country: string;

  /**
   * 宽高
   */
  @Input('iconSize') size = '18px';

  /**
   * 国旗样式名
   */
  get countryName() {
    if (!this.country) return '';

    // 后台返回的国家code，含有不符合CSS样式规则， 有空格，&，逗号，小数点等。
    return (
      'country-' +
      this.country
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/&/g, '_and_')
        .replace(/ /g, '_')
        .replace(/,/g, '')
        .replace(/\./g, '')
    );
  }

  /**
   * 国旗缩放比例
   */
  get scale() {
    return `scale(calc(${Number.parseFloat(this.size)} / 48))`;
  }
}

@Directive({
  selector: 'img[iconSrc]',
  exportAs: 'iconSrc',
  host: {
    alt: '',
    class: 'vam',
    '[attr.src]': 'src',
    '[attr.width]': 'size',
    '[attr.height]': 'size',
    '[style.max-width]': 'size',
    '[style.max-height]': 'size',
    '[style.min-width]': 'size',
    '[style.min-height]': 'size',
  },
  standalone: true,
})
export class IconSrcDirective {
  constructor(public _elementRef: ElementRef) {}

  @Input('iconSrc') public src!: string;

  /** 图片宽高css的尺寸 */
  @Input('iconSize') size = '16px';
}
