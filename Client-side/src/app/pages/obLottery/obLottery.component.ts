import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit, WritableSignal, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import {
  Gamelabel,
  HeaderMenu,
  HomeLabelSceneData,
  InfoHorizontalList,
  InfoVerticallyList,
  ScenesGameResponse,
} from 'src/app/shared/interfaces/game.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { MiniGameService } from '../minigame/minigame.service';

@UntilDestroy()
@Component({
  selector: 'app-obLottery',
  templateUrl: './obLottery.component.html',
  styleUrls: ['./obLottery.component.scss'],
  animations: [
    trigger('toggle', [
      transition('* => *', [
        style({ opacity: 0.3, transform: 'translateY(10px)' }),
        animate('0.2s ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class ObLotteryComponent implements OnInit, OnDestroy {
  /** 用于启用客服按钮等 */
  static _activate = 'CS';
  static _componentName = 'ObLotteryComponent';

  constructor(
    private router: Router,
    private layout: LayoutService,
    private route: ActivatedRoute,
    private appService: AppService,
    private miniGameService: MiniGameService,
    private dataCollectionService: DataCollectionService,
  ) {}

  showFor: WritableSignal<string> = signal('index');
  /** 每当showFor变化的时候触发动画 */
  tabToggleAnimateTick = computed(() => {
    return this.showFor().length + Math.random();
  });

  // showFor: string = '';
  loadingLabels: boolean = true;
  loadingGameList: boolean = true;
  labels: Gamelabel[] = [];

  tabs: InfoHorizontalList[] = [];

  gameList: WritableSignal<InfoVerticallyList[]> = signal([]);
  renderGameList = computed(() => {
    if (this.gameList().length > 0) return this.gameList();
    return Array(5).fill(null);
  });

  ngOnInit() {
    this.setPoint('in');
    this.initLabelData();

    this.layout
      .watchPageReuse('lottery/', 'include')
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
  initLabelData() {
    this.loadingGameList = true;
    this.loadingLabels = true;
    this.miniGameService.homeScenesSub$
      .pipe(
        untilDestroyed(this),
        map((x: HomeLabelSceneData) => {
          return x.headerMenus.find((item: HeaderMenu) => item.config.assignUrl?.includes('lottery'));
        }),
        switchMap((data: HeaderMenu | undefined) => {
          if (data) {
            this.labels = data.infoHorizontalList ?? [];
            this.loadingLabels = false;
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
                      this.gameList.set(gameGroups);
                    } else {
                      setTimeout(() => {
                        gameGroups[index] = {
                          ...v,
                          titleHref: `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(v)}`,
                        };
                        this.gameList.set(gameGroups);
                      }, 50 * index);
                    }
                  });
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
        const sub = params.get('sub');
        if (sub && this.labels?.find(x => x?.labelCode == sub)) {
          this.showFor.set(sub);
        } else {
          this.showFor.set('index');
        }
      });
  }

  selectClassicMenu(code: string) {
    this.router.navigateByUrl(`${this.appService.languageCode}/lottery/${code}`);
  }

  // 点击标签标题
  clickLabelTitle(item: any) {
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
        this.dataCollectionService.setEnterTime('lottery');
        this.dataCollectionService.addPoint({ eventId: 30006, actionValue1: 1 });
        break;
      case 'out':
        this.dataCollectionService.addPoint({
          eventId: 30002,
          actionValue1: this.dataCollectionService.getTimDiff('lottery'),
          actionValue2: 1,
        });
        break;
      default:
        break;
    }
  }
}
