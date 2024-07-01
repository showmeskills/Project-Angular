import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { MiniGameService } from 'src/app/pages/minigame/minigame.service';
import { LayoutService } from 'src/app/shared/service/layout.service';

@Component({
  selector: 'app-game-unit',
  templateUrl: './game-unit.component.html',
  styleUrls: ['./game-unit.component.scss'],
  animations: [
    trigger('delayShow', [
      transition(':enter', [style({ opacity: 0 }), animate('0.2s 0.3s ease-in-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('0.2s ease-in-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class GameUnitComponent implements OnInit, OnChanges {
  constructor(
    private router: Router,
    private appService: AppService,
    private miniGameService: MiniGameService,
    private layout: LayoutService,
  ) {}

  ngOnInit() {}
  domain = window.location.origin;
  isH5 = toSignal(this.layout.isH5$);

  /**鼠标滑动 */
  hover: boolean = false;

  /**默认图片 */
  defaultImg = computed(() => this.miniGameService.defaultImg);

  /**卡片数据 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() item: any | null = null;

  /**是否有hover移动一小段距离，只在非h5生效（css里调整了） */
  @Input() hasHover: boolean = true;

  /**是否有悬浮信息遮罩，只在非h5生效（css里调整了） */
  @Input() hasMask: boolean = true;

  /**加载中，类似disabled，但只是单纯的透明度禁用 */
  @Input() loading: boolean = false;

  /**宽高比 */
  @Input() ratio: number = 1 / 1.333333;

  /**是否是用于显示厂商logo */
  @Input() isProvider: boolean = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() clickItem: EventEmitter<any> = new EventEmitter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() afterClickItem: EventEmitter<any> = new EventEmitter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() clickOnDisabled: EventEmitter<any> = new EventEmitter();

  /**status 不是 Online 的都视作维护中 */
  get maintenance() {
    return this.item && this.item['status'] !== 'Online';
  }

  url: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    this.url = this.getUrl(changes?.item?.currentValue || null);
  }

  getUrl(item: any | null): string {
    if (!item) return '';
    if (this.isProvider) {
      if (item.secondaryPage) {
        return `${this.appService.languageCode}/casino/provider/${item.providerCatId}`;
      } else {
        return `${this.appService.languageCode}/play/${item.providerCatId}`;
      }
    } else if (item.isFullScreen) {
      // 大屏幕打开
      if (item.webRedirectUrl) {
        return `${this.appService.languageCode}/${item.webRedirectUrl}`;
      } else {
        return `${this.appService.languageCode}/play/${item.providerCatId}/${item.gameId}`;
      }
    } else if (item.providerCatId && item.providerCatId == 'GBGame-3') {
      // 原创游戏专属跳转
      if (item.webRedirectUrl) {
        return `${this.appService.languageCode}/${item.webRedirectUrl}`;
      } else {
        return `${this.appService.languageCode}/original/${item.gameId.toLowerCase()}`;
      }
    } else {
      if (item?.webRedirectUrl) {
        return `${this.appService.languageCode}/${item.webRedirectUrl}`;
      } else {
        return `${this.appService.languageCode}/casino/games/${item.providerCatId}/${item.gameId}`;
      }
    }
  }

  onClickItem() {
    if (!this.item) return;
    const item = this.item;
    if (item.isFullScreen) {
      // 大屏幕打开
      this.router.navigateByUrl(this.url);
      this.afterClickItem.emit(item);
    } else if (item.providerCatId && item.providerCatId == 'GBGame-3') {
      // 原创游戏专属跳转
      this.router.navigateByUrl(this.url);
      this.afterClickItem.emit(item);
    } else {
      // 普通点击
      this.clickItem.emit(item);
      this.afterClickItem.emit(item);
    }
  }
}
