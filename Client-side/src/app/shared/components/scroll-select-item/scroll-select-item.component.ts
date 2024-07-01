import { Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { MatTabHeader, MatTabNav } from '@angular/material/tabs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, Subscription, combineLatest, delay, timer } from 'rxjs';
import { LayoutService } from '../../service/layout.service';

@UntilDestroy()
@Component({
  selector: 'app-scroll-select-item',
  templateUrl: './scroll-select-item.component.html',
  styleUrls: ['./scroll-select-item.component.scss'],
})
export class ScrollSelectItemComponent implements OnInit, OnDestroy {
  /** 要滚动的组件，支持MatTabGroup 与 MatTabNav */
  matTab?: MatTabNav;

  /** 子元素模板 */
  @ContentChild('item') itemTemplate!: TemplateRef<unknown>;

  listChange$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  list: any[] = [];
  @Input() set data(value: any) {
    this.list = value;
    this.listChange$.next(true);
  }

  /** 间距 */
  @Input() gap: number = 10;

  /** swiper是否显示上下翻页按钮 */
  @Input() showPrevNext: boolean = true;

  /** 上下翻页跳过条数 */
  @Input() skip: number = 0;

  /** swiper无需翻页时swiper靠左或居中显示 */
  @Input() position: 'left' | 'center' = 'left';

  /** 自动滑动 */
  @Input() animation: boolean = false;

  /** 自动滚动停顿时间 */
  @Input() duration: number = 2000;

  /** 手指滑动 */
  @Input() touchMove: boolean = true;

  /** 非结束上一次滚动距离 */
  oldDeltaX: number = 0;

  @Output() clickTab = new EventEmitter();

  /** 是否为点击事件 */
  isClick: boolean = true;

  /**游戏窗口观察者 */
  timer?: Subscription;

  /** 每页能完整显示item数 */
  perPage: number = 0;

  isBeginning = false;

  /**
   * 是否为第一页
   *
   * @returns `boolean`
   */
  getIsBeginning(): boolean {
    return this.matTab?.scrollDistance == 0;
  }

  isEnd = false;

  /**
   * 是否为最后一页
   *
   * @returns `boolean`
   */
  getIsEnd(): boolean {
    const width =
      this.matTab?._tabListInner?.nativeElement?.clientWidth -
      this.matTab?._tabListContainer?.nativeElement?.clientWidth;
    return width <= (this.matTab?.scrollDistance ?? 0);
  }

  constructor(private layout: LayoutService) {}

  ngOnInit() {
    this.layout.resize$.pipe(untilDestroyed(this)).subscribe(_ => {
      this.setPerPage();
    });
    if (this.animation) {
      this.timer = timer(0, this.duration).subscribe(x => {
        setTimeout(() => {
          this.toNext();
          const width =
            this.matTab?._tabListInner.nativeElement.clientWidth -
            this.matTab?._tabListContainer.nativeElement.clientWidth;
          if (width && width <= (this.matTab?.scrollDistance ?? 0)) {
            this.timer?.unsubscribe();
          }
        }, 1000);
      });
    }
  }

  toNext() {
    if (!this.perPage) {
      this.setPerPage();
    }
    let curIndex = 0;
    if (this.matTab) {
      for (const index in this.matTab?._tabListInner?.nativeElement?.children) {
        if (!isNaN(parseInt(index))) {
          const cur = this.matTab._tabListInner.nativeElement.children[index];
          if (cur.offsetLeft >= this.matTab.scrollDistance) {
            curIndex = parseInt(index);
            break; // 终止循环
          }
        }
      }
      const index = curIndex + this.perPage;
      const maxIndex = index < this.list?.length - 1 ? index : this.list?.length - 1;
      this.matTab.scrollDistance = this.matTab?._tabListInner.nativeElement.children[maxIndex].offsetLeft;
    }
  }

  toPrev() {
    if (!this.perPage) {
      this.setPerPage();
    }
    let curIndex = 0;
    if (this.matTab) {
      for (const index in this.matTab?._tabListInner?.nativeElement?.children) {
        if (!isNaN(parseInt(index))) {
          const cur = this.matTab._tabListInner.nativeElement.children[index];
          if (cur.offsetLeft >= this.matTab.scrollDistance) {
            curIndex = parseInt(index);
            break; // 终止循环
          }
        }
      }
      const index = curIndex - this.perPage;
      this.matTab.scrollDistance = this.matTab._tabListInner.nativeElement.children[index > 0 ? index : 0].offsetLeft;
    }
  }

  setPerPage() {
    const wrapWidth = this.matTab?._tabListContainer?.nativeElement?.clientWidth;
    const itemWidth = this.matTab?._tabListInner?.nativeElement?.children[0]?.clientWidth;
    if (this.skip) {
      this.perPage = this.skip;
      return;
    }
    this.perPage = Math.floor((wrapWidth + this.gap) / (itemWidth + this.gap));
  }

  menuTabNavCreate(_: Element, matTab: MatTabNav) {
    this.matTab = matTab;

    combineLatest([this.layout.mutationObserver(matTab._tabList.nativeElement, { attributes: true }), this.listChange$])
      .pipe(untilDestroyed(this), delay(0))
      .subscribe(() => {
        this.setPerPage();
        this.isBeginning = this.getIsBeginning();
        this.isEnd = this.getIsEnd();
      });

    if (!this.touchMove) return;
    const tabHeader: MatTabHeader | MatTabNav = (matTab as any)._tabHeader ?? matTab;
    const hammerManager = new Hammer(tabHeader._tabList.nativeElement);
    hammerManager.on('pan', (event: HammerInput) => {
      //顺滑一点
      if (this.oldDeltaX == 0) {
        (<HTMLDivElement>tabHeader._tabList.nativeElement).style.transition = 'none';
      }
      //同步设置translate，实现滚动效果
      const translateX = tabHeader.scrollDistance - (event.deltaX - this.oldDeltaX);
      if (tabHeader.scrollDistance != translateX) {
        tabHeader.scrollDistance = translateX;
        this.oldDeltaX = event.deltaX;
      }
      //滚动结束，加上切换动画
      if (event.isFinal) {
        this.isClick = false;
        setTimeout(() => {
          this.isClick = true;
        });
        this.oldDeltaX = 0;
        (<HTMLDivElement>tabHeader._tabList.nativeElement).style.transition = '';
      }
    });
  }

  clickItem(item: any, i: number) {
    if (this.isClick) {
      this.clickTab.emit({ ...item, index: i });
    }
  }

  ngOnDestroy(): void {
    this.timer?.unsubscribe();
  }
}
