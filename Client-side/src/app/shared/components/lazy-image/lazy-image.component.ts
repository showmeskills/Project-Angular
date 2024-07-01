/* eslint-disable @angular-eslint/no-input-rename */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnChanges,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppService } from 'src/app/app.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-lazy-image',
  templateUrl: './lazy-image.component.html',
  styleUrls: ['./lazy-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyImageComponent implements OnChanges {
  constructor(private appService: AppService) {}

  hdError = signal(false);
  thumbError = signal(false);
  hdDone = signal(false);
  thumbDone = signal(false);
  theme = toSignal(this.appService.themeSwitch$);

  /**圆角，数字，默认没有 */
  @Input({ transform: (v: number) => v + 'px' })
  @HostBinding('style.border-radius')
  radius: string = '';

  /**宽高比率，外层没高度只有宽度时，需要设置，默认没有 */
  @Input({ transform: (v: number) => 100 / v + '%' })
  @HostBinding('style.padding-top')
  ratio: string = '';

  /**图格式转换，默认转换成webp(如果浏览器支持) */
  @Input() format = 'webp';
  _format = signal(this.format);

  /**
   * 延迟加载的路径
   *
   * 支持字符串或者字符串数组
   * lazy="foo" 传字符串，不分日夜版本
   * lazy="[foo,bar]" 传字符串数组，日间时候使用foo，夜间时候使用bar
   */
  @Input() lazy: string | string[] = '';
  _lazySignal = signal(this.lazy);
  _lazy = computed(() => {
    const urls = this._lazySignal();
    if (Array.isArray(urls)) {
      const theme = this.theme();
      switch (theme) {
        case 'sun':
          return urls[0];
        case 'moon':
          return urls[1];
        default:
          return urls[0];
      }
    } else {
      return urls;
    }
  });

  /** 缩略图宽度，默认200,单位px */
  @Input() thumbWidth = 200;
  _thumbWidth = signal(this.thumbWidth);

  /** 缩略图模糊度，默认10，范围0-20 */
  @Input() thumbBlur = 10;
  _thumbBlur = signal(this.thumbBlur);

  /** 缩略图质量，默认80，范围0-80 */
  @Input() quality = 80;
  _quality = signal(this.quality);

  /** 默认图片 */
  @Input() defaultImg = '';
  _defaultImg = signal(this.defaultImg);

  /** 默认底色（通常用来做没有图片地址、图片错误、没有默认图片时候，默认显示的色块，需要配合defaultShowBlock使用） */
  @Input()
  @HostBinding('style.backgroundColor')
  bgcolor: string = '';

  @Input() defaultShowBlock: boolean = false;

  /**查询参数 */
  query = computed(() => {
    const isSupportWebp = window.isSupportWebp;
    const format = this._format();
    const quality = `q=${this._quality()}`;
    const formatText = format ? (format === 'webp' ? (isSupportWebp ? `format=webp` : '') : `format=${format}`) : '';
    const thumbWidth = `w=${this._thumbWidth()}`;
    const thumbBlur = `blur=${this._thumbBlur()}`;
    return {
      hd: '?' + [quality, formatText].filter(x => !!x).join('&'),
      thumb: '?' + [thumbWidth, thumbBlur, quality, formatText].filter(x => !!x).join('&'),
    };
  });

  /** 清晰图路径 */
  hdSrc = computed(() => {
    const lazy = this._lazy();
    const defaultImg = this._defaultImg();
    const isError = this.hdError();
    const query = this.query();
    return !lazy || isError ? defaultImg : lazy.startsWith('http') ? lazy + query.hd : lazy;
  });

  /** 缩略图路径 */
  thumbSrc = computed(() => {
    if (this.thumbError()) return null;
    const lazy = this._lazy();
    const query = this.query();
    if (lazy && lazy.startsWith('http') && (lazy.endsWith('.png') || lazy.endsWith('.jpg') || lazy.endsWith('.jpeg'))) {
      return lazy + query.thumb;
    } else {
      return null;
    }
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lazy) this._lazySignal.set(changes.lazy.currentValue);
    if (changes.defaultImg) this._defaultImg.set(changes.defaultImg.currentValue);
    if (changes.quality) this._quality.set(changes.quality.currentValue);
    if (changes.thumbBlur) this._thumbBlur.set(changes.thumbBlur.currentValue);
    if (changes.thumbWidth) this._thumbWidth.set(changes.thumbWidth.currentValue);
    if (changes.format) this._format.set(changes.format.currentValue);
  }
}
