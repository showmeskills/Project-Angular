import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, Subscription, of, timer } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/apis/game.api';
import { ImgCarouselOptions } from 'src/app/shared/components/img-carousel/img-carousel-options.interface';
import {
  HeaderMenu,
  HomeLabelSceneData,
  ScenesGameResponse,
  ScenesInfo,
} from 'src/app/shared/interfaces/game.interface';
import { SportEvent } from 'src/app/shared/interfaces/sport-event.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { MiniGameService } from '../minigame/minigame.service';

@UntilDestroy()
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  isH5!: boolean;

  constructor(
    private router: Router,
    private layout: LayoutService,
    private miniGameService: MiniGameService,
    public appService: AppService,
    private dataCollectionService: DataCollectionService,
    private gameApi: GameApi,
  ) {}
  sportData: SportEvent[] = [];
  /**滚动与断点配置 */
  imgCarouselConfig: ImgCarouselOptions = {
    slidesPerView: 4,
    slidesPerGroup: 4,
    spaceBetween: 10,
    speed: 500,
    breakpoints: {
      1400: {
        slidesPerView: 3,
        slidesPerGroup: 3,
      },
      800: {
        slidesPerView: 1,
        slidesPerGroup: 1,
      },
    },
  };

  ngOnInit() {
    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });
    this.setPoint('in');
    this.initHomeScenes();
    this.layout.page$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v === 'home') {
        this.sportData = [];
        this.initHotSport();
      } else {
        this.timer$?.unsubscribe();
      }
    });

    this.layout
      .watchPageReuse('')
      .pipe(untilDestroyed(this))
      .subscribe(x => {
        switch (x.type) {
          case 'enter':
            this.setPoint('in');
            break;
          case 'leave':
            this.setPoint('out');
            break;
          default:
            break;
        }
      });
  }

  //---------------------------------真人娱乐场/小游戏等动态板块

  homeScenesInfo: WritableSignal<ScenesInfo[]> = signal([]);
  renderHomeScenesInfo = computed(() => {
    if (this.homeScenesInfo().length > 0) return this.homeScenesInfo();
    return Array(7).fill(null);
  });

  loadingGameList: boolean = true;
  initHomeScenes() {
    this.loadingGameList = true;
    let tempHomeScenes: any = {};
    this.miniGameService.homeScenesSub$
      .pipe(
        untilDestroyed(this),
        map((x: HomeLabelSceneData) => {
          this.miniGameService.allScenesData = x;
          tempHomeScenes = x?.homeScene;
          return tempHomeScenes;
        }),
        switchMap((y: HeaderMenu) => {
          const ids: number[] = [];
          y?.infoVerticallyList?.map((item: any) => {
            ids.push(item?.labelId);
          });
          return this.miniGameService.getGameListByIds(ids);
        }),
      )
      .subscribe((data: ScenesGameResponse[]) => {
        tempHomeScenes?.infoVerticallyList?.map((item: any, index: number) => {
          item.gameLists = data[index]?.gameList;
          return item;
        });
        this.loadingGameList = false;
        if (tempHomeScenes?.infoVerticallyList) {
          const gameGroups = Array(tempHomeScenes?.infoVerticallyList.length).fill(null);
          tempHomeScenes.infoVerticallyList.forEach((element: any, index: number) => {
            if (index < 2) {
              gameGroups[index] = {
                ...element,
                titleHref: `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(element)}`,
              };
              this.homeScenesInfo.set(gameGroups);
            } else {
              setTimeout(() => {
                gameGroups[index] = {
                  ...element,
                  titleHref: `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(element)}`,
                };
                this.homeScenesInfo.set(gameGroups);
              }, 50 * index);
            }
          });
        }
      });
  }

  trackByFn(index: number) {
    return index;
  }

  // 点击游戏
  clickGameItem(item: any) {
    if (item?.webRedirectUrl) {
      this.router.navigateByUrl(`${this.appService.languageCode}/${item.webRedirectUrl}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/games/${item.providerCatId}/${item.gameId}`);
    }
  }

  // 点击标签标题
  clickLabelTitle(item: ScenesInfo) {
    const url = `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(item)}`;
    if (url) {
      this.router.navigateByUrl(url);
    }
  }

  ngOnDestroy(): void {
    this.setPoint('out');
  }

  qrPopPositions: ConnectedPosition[] = [
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      panelClass: 'app-download-qr-pop-down',
    },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', panelClass: 'app-download-qr-pop-up' },
  ];

  showPop$: Subject<boolean> = new Subject();
  downQR: boolean = false;
  showPop(skipRepeat: boolean = true) {
    if (skipRepeat && this.downQR) return;
    this.closePop();
    this.showPop$.next(true);
    this.downQR = true;
  }

  closePop(time: number = 0) {
    if (time > 0) {
      timer(time)
        .pipe(takeUntil(this.showPop$))
        .subscribe(_ => {
          this.downQR = false;
        });
    } else {
      this.downQR = false;
    }
  }

  setPoint(type: string) {
    switch (type) {
      case 'in':
        this.dataCollectionService.addPoint({ eventId: 30001 });
        this.dataCollectionService.setEnterTime('home');
        break;
      case 'out':
        this.dataCollectionService.addPoint({
          eventId: 30002,
          actionValue1: this.dataCollectionService.getTimDiff('home'),
          actionValue2: 0,
        });
        break;
      default:
        break;
    }
  }

  timer$?: Subscription;
  isHotSport: boolean = true;
  initHotSport() {
    this.timer$ = timer(0, 30000)
      .pipe(
        switchMap(_ => this.gameApi.getHotMatch(this.appService.languageCode, 10)),
        map(v => {
          return v.map((x: SportEvent) => ({
            ...x,
          }));
        }),
        catchError(() => {
          return of([]); // 返回一个空数组作为备用值
        }),
      )
      .subscribe(data => {
        this.isHotSport = data.length == 0 ? false : true;
        this.sportData.forEach(item => {
          if (item.timerSubscription) {
            clearTimeout(item.timerTimeout);
          }
        });
        this.sportData = JSON.parse(JSON.stringify(data));
        this.sportData.forEach((e, i) => {
          if (e.gameTime == -1) {
            e.timerTimeout = '';
            return;
          }
          if (e.sportId == 1) {
            // 足球
            this.onStartClockFoot(e);
          } else {
            this.onStartClock(e);
          }
        });
      });
  }
  /** 篮球倒数计时 */
  onStartClock(item: SportEvent) {
    const update = () => {
      item.gameTime = item.gameTime - 1;
      if (item.gameTime <= 0) {
        item.remainingTime = '00:00';
      } else {
        const minutes = Math.floor(item.gameTime / 60);
        const seconds_remainder = item.gameTime % 60;
        item.remainingTime = String(minutes).padStart(2, '0') + ':' + String(seconds_remainder).padStart(2, '0');
        item.timerTimeout = setTimeout(update, 1000);
      }
    };
    update();
  }

  /** 足球倒数计时 足球不知道什么时候计时停止*/
  onStartClockFoot(item: SportEvent) {
    const update = () => {
      item.gameTime = item.gameTime + 1;
      const minutes = Math.floor(item.gameTime / 60);
      const seconds_remainder = item.gameTime % 60;
      item.remainingTime = String(minutes).padStart(2, '0') + ':' + String(seconds_remainder).padStart(2, '0');
      item.timerTimeout = setTimeout(update, 1000);
    };
    update();
  }
}
