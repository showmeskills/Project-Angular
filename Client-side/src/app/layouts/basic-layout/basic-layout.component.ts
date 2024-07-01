import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject, combineLatest } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, map, startWith, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { MiniGameService } from 'src/app/pages/minigame/minigame.service';
import { ScrollbarComponent } from 'src/app/shared/components/scrollbar/scrollbar.component';
import { HeaderMenu, HomeLabelSceneData } from 'src/app/shared/interfaces/game.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { HeaderLevel2MenuComponent } from '../header-level2-menu/header-level2-menu.component';

const LEFT_MENU_WIDTH = {
  'web-close': '60px',
  'web-open': '240px',
  'h5-close': '0px',
  'h5-open': '90vw',
  hide: '0px',
};

@UntilDestroy()
@Component({
  selector: 'app-basic-layout',
  templateUrl: './basic-layout.component.html',
  styleUrls: ['./basic-layout.component.scss'],
  host: { class: 'flex' },
})
export class BasicLayoutComponent implements OnInit {
  constructor(
    public layout: LayoutService,
    private localStorageService: LocalStorageService,
    private appService: AppService,
    private deviceService: DeviceDetectorService,
    private miniGameService: MiniGameService,
  ) {}

  leftMenuMode$: Subject<'side' | 'over'> = new Subject<'side' | 'over'>();
  leftMenuState: boolean = false;
  leftMenuBackdrop: boolean = false;
  leftMenuWidth!: string;
  layoutContentMarginLeft!: string;

  fullMode!: boolean;
  conciseMode!: boolean;

  isH5!: boolean;

  /** 是否隐藏头部 */
  hideHead: boolean = false;

  /** 上次滑动时间 */
  prevTime: number = 0;
  /** 上一次滑动位置 */
  prevPos: number = 0;

  @ViewChild('scrollbar') scrollbar!: ScrollbarComponent;
  @ViewChild('level2Menu') level2Menu!: HeaderLevel2MenuComponent;

  isDesktop: boolean = this.deviceService.isDesktop();
  /** 是否有二级菜单 */
  hideLevel2Head: boolean = false;
  ngOnInit() {
    //左侧菜单状态判断
    combineLatest([
      this.layout.isH5$,
      this.layout.leftMenuState$,
      this.leftMenuMode$.pipe(startWith(this.getLeftMenuMode(document.body.offsetWidth))),
      this.layout.leftMenuInvisible$.pipe(startWith(undefined)),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([isH5, state, mode, invisible]) => {
        this.leftMenuState = state;
        this.isH5 = isH5;
        if (!isH5 && this.isDesktop) this.hideHead = false;
        if (isH5) this.layout.lockLayoutScroll$.next(state);
        if (invisible) {
          this.leftMenuWidth = this.layoutContentMarginLeft = LEFT_MENU_WIDTH['hide'];
          this.leftMenuBackdrop = false;
        } else {
          this.leftMenuWidth = state
            ? isH5
              ? LEFT_MENU_WIDTH['h5-open']
              : LEFT_MENU_WIDTH['web-open']
            : isH5
              ? LEFT_MENU_WIDTH['h5-close']
              : LEFT_MENU_WIDTH['web-close'];
          this.layoutContentMarginLeft = isH5
            ? LEFT_MENU_WIDTH['h5-close']
            : mode === 'side'
              ? this.leftMenuWidth
              : LEFT_MENU_WIDTH['web-close'];
          this.leftMenuBackdrop = state && mode === 'over';
          this.localStorageService.setValueByJsonStringify('platform-left-menu-state', state);
        }
        this.layout.leftMenuBackdrop$.next(this.leftMenuBackdrop);
      });

    //对会触发动画效果的订阅进行监听，模拟动画开始和完成
    [this.layout.leftMenuState$, this.layout.leftMenuInvisible$].forEach(_$ => {
      _$.pipe(
        distinctUntilChanged(),
        tap(() => this.layout.leftMenuTransition$.next('start')),
        delay(400), // 需与动画时间一致
        tap(() => this.layout.leftMenuTransition$.next('end')),
        untilDestroyed(this),
      ).subscribe();
    });

    //页面宽度变动，设置左侧菜单模式
    this.layout.resize$.pipe(debounceTime(100), untilDestroyed(this)).subscribe(v => {
      const mode = this.getLeftMenuMode(v[0]);
      this.leftMenuMode$.next(mode);
    });
    //每次页面改变置顶，并判断当前页面，设置简洁模式等
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(page => {
      if (this.isH5 && !this.isDesktop) {
        const el = document.querySelector('html');
        if (el) el.scrollTop = 0;
        this.hideHead = false;
      } else {
        this.scrollbar?.scrollToTop();
      }

      //设置无footer
      this.fullMode = false;
      this.layout.getComponentTree().forEach(x => {
        if (x._displayMode) {
          this.fullMode = {
            FullMode: true,
            normal: false,
          }[x._displayMode as 'FullMode' | 'normal'];
        }
      });

      if (['register', 'login', 'password'].includes(page)) {
        this.conciseMode = true;
        this.layout.leftMenuInvisible$.next(true);
      } else if (this.conciseMode) {
        this.conciseMode = false;
        this.layout.leftMenuInvisible$.next(false);
      }
    });

    const localLeftMenuStateState = this.localStorageService.getValueByJsonParse('platform-left-menu-state', false);
    this.layout.leftMenuState$.next(this.layout.isH5$.value ? false : localLeftMenuStateState);

    this.layout.scrollTop$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) this.onScroll(v);
    });

    /** h5使用原生时隐藏滚动 */
    this.layout.lockLayoutScroll$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x && this.deviceService.isMobile()) {
        document.body.classList.add('hidden-y');
      } else {
        document.body.classList.remove('hidden-y');
      }
    });

    //
    this.miniGameService.homeScenesSub$
      .pipe(
        untilDestroyed(this),
        map((x: HomeLabelSceneData) => {
          return x?.navigationMenus || [];
        }),
      )
      .subscribe((data: HeaderMenu[]) => {
        this.hideLevel2Head = data.length > 0 ? true : false;
      });
  }

  getLeftMenuMode(documentWidth: number) {
    return documentWidth >= 1200 ? 'side' : 'over';
  }

  onScrollDistance(event: number) {
    this.layout.scrollTop$.next(event);
  }

  @HostListener('window:scroll')
  layoutScorll() {
    if (this.isH5) {
      const top = (document.querySelector('html') as HTMLHtmlElement).scrollTop;
      this.layout.scrollTop$.next(top);
    }
  }

  onScroll(currentPos: number) {
    if (this.isH5 && !this.isDesktop) {
      const currentTime = Date.now();
      const timeDiff = currentTime - this.prevTime;
      const scrollDiff = currentPos - this.prevPos;
      const speed = Math.ceil(Math.abs(scrollDiff / timeDiff));
      this.prevTime = currentTime;
      this.prevPos = currentPos;
      const fixedSpeed = 1;
      const offsetTop = 100;

      if (scrollDiff < 0) {
        // 向上滑动
        if (currentPos < offsetTop || speed > fixedSpeed) {
          this.hideHead = false;
        }
      } else if (scrollDiff > 0) {
        //向下滑动
        if (speed > fixedSpeed) {
          this.hideHead = true;
          this.level2Menu.closePop();
        }
      }
    }
  }

  onScrollOldIos($event: any) {
    this.onScroll($event.target.scrollTop);
  }
}
