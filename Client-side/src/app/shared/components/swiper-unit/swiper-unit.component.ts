import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { ImgCarouselOptions } from '../img-carousel/img-carousel-options.interface.js';

@Component({
  selector: 'app-swiper-unit',
  templateUrl: './swiper-unit.component.html',
  styleUrls: ['./swiper-unit.component.scss'],
  host: {
    '[class.hide-when-no-data]': 'hideOnNoData && !loading && data.length < 1',
  },
})
export class SwiperUnitComponent implements OnInit, OnChanges {
  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.data) this._data.set(changes.data.currentValue);
    if (changes.row) this._row.set(changes.row.currentValue);
  }
  domain = window.location.origin;
  /**板块标题 */
  @Input() title?: string = '';

  /**板块icon */
  @Input() titleIcon?: string = '';

  /**是否有hover移动一小段距离，只在非h5生效（css里调整了） */
  @Input() hasHover: boolean = true;

  /**是否有悬浮信息遮罩，只在非h5生效（css里调整了） */
  @Input() hasMask: boolean = true;

  /**在没数据的时候是否隐藏 */
  @Input() hideOnNoData: boolean = false;

  /**在没数据的时候是否隐藏滚动的部分（保留标题） */
  @Input() hideCarouselOnNoData: boolean = false;

  /**数据准备中, 如果使用 hideOnNoData或hideCarouselOnNoData 时候必须传 */
  @Input() loading: boolean = false;

  /**宽高比 */
  @Input() ratio: number = 1 / 1.333333;

  /**是否是用于显示厂商logo */
  @Input() isProvider: boolean = false;

  /**是否为多行，需要时，请设置大于1的整数 */
  @Input() row: number = 0;
  _row = signal(this.row);

  /**遍历的数据 */
  @Input() data?: unknown[] = [];
  _data = signal(this.data);

 /**用于显示什么类型 */
 @Input() for: 'game' | 'sport' = 'game';
  _for = signal(this.for);
  
  @Input() titleHref: string = '';

  /**渲染的数据 */
  renderData = computed(() => {
    const data = this._data();
    const row = this._row();
    if (data && data?.length > 0) {
      // 防止接口问题返回太多卡死，截取最多一百个
      return data.slice(0, 100);
    }
    let baseLoadCount = 8;
    if (row > 1) baseLoadCount = baseLoadCount * row;
    return Array(baseLoadCount).fill(null);
  });

  /**滚动与断点配置 */
  @Input() imgCarouselConfig: ImgCarouselOptions = {
    slidesPerView: 7.5,
    slidesPerGroup: 7,
    spaceBetween: 11,
    speed: 500,
    allowTouchMove: true,
    breakpoints: {
      1150: {
        slidesPerView: 6.5,
        slidesPerGroup: 6,
        spaceBetween: 16,
      },
      1000: {
        slidesPerView: 5.5,
        slidesPerGroup: 5,
        spaceBetween: 16,
      },
      850: {
        slidesPerView: 4.5,
        slidesPerGroup: 4,
        spaceBetween: 16,
      },
      700: {
        slidesPerView: 4,
        slidesPerGroup: 4,
        spaceBetween: 6,
      },
      500: {
        slidesPerView: 3,
        slidesPerGroup: 3,
        spaceBetween: 6,
      },
    },
  };

  /**点击标题 */
  @Output() clickTitle: EventEmitter<unknown> = new EventEmitter();

  /**点击卡片 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() clickItem: EventEmitter<any> = new EventEmitter();

  /**点击卡片之后 */
  @Output() afterClickItem: EventEmitter<unknown> = new EventEmitter();

  ngOnInit() {}
}
