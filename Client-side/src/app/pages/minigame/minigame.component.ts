import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import {
  GameList,
  HeaderMenu,
  HomeLabelSceneData,
  InfoHorizontalList,
  InfoVerticallyList,
  ScenesGameResponse,
  ScenesInfo,
} from 'src/app/shared/interfaces/game.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { MiniGameService } from './minigame.service';

@UntilDestroy()
@Component({
  selector: 'app-minigame',
  templateUrl: './minigame.component.html',
  styleUrls: ['./minigame.component.scss'],
  animations: [
    trigger('toggle', [
      transition('* => *', [
        style({ opacity: 0.3, transform: 'translateY(10px)' }),
        animate('0.2s ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class MinigameComponent implements OnInit, OnDestroy {
  static _componentName = 'MinigameComponent';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private layout: LayoutService,
    private miniGameService: MiniGameService,
    public appService: AppService,
    private dataCollectionService: DataCollectionService,
  ) {}
  domain = window.location.origin;
  isH5 = toSignal(this.layout.isH5$);

  showFor: WritableSignal<string> = signal('index');
  /** 每当showFor变化的时候触发动画 */
  tabToggleAnimateTick = computed(() => {
    return this.showFor().length + Math.random();
  });

  tabs: InfoHorizontalList[] = [];

  labelBars: WritableSignal<InfoVerticallyList[]> = signal([]);
  renderLabelBars = computed(() => {
    if (this.labelBars().length > 0) return this.labelBars();
    return Array(7).fill(null);
  });

  labelCodes: string[] = [];

  gameList: GameList[] = [];
  loadingGameList: boolean = true;

  ngOnInit() {
    this.setPoint('in');
    this.initScenesData();

    this.layout
      .watchPageReuse('casino/home', 'include')
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

  trackByFn(index: number) {
    return index;
  }

  //初始化标签数据
  initScenesData() {
    this.loadingGameList = true;
    this.miniGameService.homeScenesSub$
      .pipe(
        untilDestroyed(this),
        map((x: HomeLabelSceneData) => {
          return x.headerMenus.find((item: HeaderMenu) => item.config.assignUrl?.includes('casino'));
        }),
        switchMap((data: HeaderMenu | undefined) => {
          if (data) {
            const ids = [data.infoHorizontalList, data.infoVerticallyList]
              .flat()
              .filter(x => !!x)
              .map(x => Number(x.labelCode || 0));
            return this.miniGameService.getGameListByIds([...new Set(ids)]).pipe(
              tap((list: ScenesGameResponse[]) => {
                if (data.infoVerticallyList) {
                  data.infoVerticallyList.forEach(x => {
                    const gameLists = list.find(l => l.labelId === x.labelId)?.gameList;
                    x.gameLists = gameLists ?? [];
                  });
                  const gameGroups = Array(data.infoVerticallyList.length).fill(null);
                  data.infoVerticallyList.forEach((v, index) => {
                    if (index < 2) {
                      gameGroups[index] = {
                        ...v,
                        titleHref: `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(v)}`,
                      };
                      this.labelBars.set(gameGroups);
                    } else {
                      setTimeout(() => {
                        gameGroups[index] = {
                          ...v,
                          titleHref: `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(v)}`,
                        };
                        this.labelBars.set(gameGroups);
                      }, 50 * index);
                    }
                  });
                  this.labelCodes = data.infoVerticallyList.map(x => x.labelCode) as string[];
                }
                if (data.infoHorizontalList) {
                  data.infoHorizontalList.forEach(x => {
                    const gameLists = list.find(l => l.labelId === x.labelId)?.gameList;
                    x.gameLists = gameLists ?? [];
                  });
                  this.tabs = data.infoHorizontalList;
                }
                this.loadingGameList = false;
              }),
            );
          } else {
            return EMPTY;
          }
        }),
        switchMap(() => this.route.paramMap),
      )
      .subscribe(params => {
        const sub = params.get('sub') || '';
        if (['index', ...this.tabs.map(x => x?.labelCode)]?.includes(sub)) {
          this.showFor.set(sub);
        } else {
          //跳到404
          this.router.navigateByUrl(`/${this.appService.languageCode}/404`, { replaceUrl: true });
        }
      });
  }

  // 点击标签标题
  clickLabelTitle(item: ScenesInfo) {
    const url = `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(item)}`;
    if (url) {
      this.router.navigateByUrl(url);
    }
  }

  // 点击游戏
  clickGameItem(item: any) {
    if (item?.webRedirectUrl) {
      this.router.navigateByUrl(`${this.appService.languageCode}/${item.webRedirectUrl}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/games/${item.providerCatId}/${item.gameId}`);
    }
  }

  ngOnDestroy(): void {
    this.setPoint('out');
  }

  setPoint(type: string) {
    switch (type) {
      case 'in':
        this.dataCollectionService.gtmPush('casino_visit');
        this.dataCollectionService.setEnterTime('casino');
        this.dataCollectionService.addPoint({ eventId: 30006, actionValue1: 2 });
        break;
      case 'out':
        this.dataCollectionService.addPoint({
          eventId: 30002,
          actionValue1: this.dataCollectionService.getTimDiff('casino'),
          actionValue2: 2,
        });
        break;
      default:
        break;
    }
  }
}
