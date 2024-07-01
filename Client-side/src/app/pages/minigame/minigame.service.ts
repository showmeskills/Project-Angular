/* eslint-disable jsdoc/require-returns-description */
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, fromEvent, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/apis/game.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import {
  GameFavoriteList,
  GameList,
  GameListItem,
  GameProviderParams,
  HeaderMenu,
  HomeLabelSceneData,
  LabelScenesRedirectMethodEnum,
  NewGameList,
  ProviderInterface,
  ScenesInfo,
} from 'src/app/shared/interfaces/game.interface';
import { ResponseListData } from 'src/app/shared/interfaces/response.interface';
import { cacheValue } from 'src/app/shared/service/general.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MiniGameService {
  constructor(
    private gameApi: GameApi,
    private localServie: LocaleService,
    private localeService: LocaleService,
    private popup: PopupService,
    private appService: AppService,
  ) {}

  /**当前可能存在的游戏iframe的窗口 */
  gameIframeSource: Window | null = null;
  /**当前可能存在的游戏iframe的源域名 */
  gameIframeOrigin: string = '';
  /**当前游戏iframe内部订阅 */
  gameIframeSubscriptions: { [key: string]: Subscription | Subscription[] } = {};

  // 二级页面游戏筛选缓冲池
  private gameByProviderBuffer: { [key: string]: Observable<ResponseListData<GameListItem[]>> } = {};
  // 游戏标签缓冲池
  private gameByLabelBuffer: { [key: string]: Observable<GameList[]> } = {};

  /** 新推荐接口 */
  private newGameByLabelBuffer: { [key: string]: Observable<NewGameList> } = {};

  public lotteryProviderID = '60001-3';
  public sportsProviderID = '62001-1';
  public originalProviderID = 'GBGame-3';
  public allScenesData!: HomeLabelSceneData;

  /**原创的标签id */
  private originalLabelID = '';

  miniGameFavoriteNumber$: BehaviorSubject<number> = new BehaviorSubject<number>(0); //收藏小游戏数量
  miniGameRecentLyPlayedNumber$: BehaviorSubject<number> = new BehaviorSubject<number>(0); //最近玩过小游戏数量
  homeScenesSub$: ReplaySubject<HomeLabelSceneData> = new ReplaySubject<HomeLabelSceneData>(1);

  get defaultImg(): string {
    return `assets/images/game/default_${this.appService.languageCode === 'zh-cn' ? 'zh-cn' : 'en'}.png`;
  }

  // 按标签获取游戏
  public getGameByLabel(
    labelCodes: string[],
    isRecomment?: boolean,
    gameCount?: number,
    isHill?: boolean,
    entryType?: number,
    providerId?: string,
  ): Observable<GameList[]> {
    const param = { labelCodes, isRecomment, gameCount, isHill, entryType, providerId };
    const bufferKey = window.btoa(JSON.stringify(param));
    return (
      this.gameByLabelBuffer[bufferKey] ??
      ((this.gameByLabelBuffer[bufferKey] = this.gameApi.getGameListByLabel(param).pipe(
        cacheValue(1000 * 60 * 10), //缓存10分钟
        map(x => (x?.data && this.newObj(x.data)) || []),
      )),
      this.gameByLabelBuffer[bufferKey])
    );
  }

  // 按标签获取游戏新接口 - 为你推荐数据
  public getGameListByMultipleLabel(
    labelCodes: string[],
    isRecomment?: boolean,
    gameCount?: number,
    isHill?: boolean,
    entryType?: number,
    providerCatId?: string,
  ): Observable<NewGameList> {
    const param = { labelCodes, isRecomment, gameCount, isHill, entryType, providerCatId };
    const bufferKey = window.btoa(JSON.stringify(param));
    return (
      this.newGameByLabelBuffer[bufferKey] ??
      ((this.newGameByLabelBuffer[bufferKey] = this.gameApi.getGameListByMultipleLabel(param).pipe(
        cacheValue(1000 * 60 * 10), //缓存10分钟
        map(x => (x?.data && this.newObj(x.data)) || []),
      )),
      this.newGameByLabelBuffer[bufferKey])
    );
  }

  // 获取所有标签并缓存
  public getGamelabel() {
    return this.gameApi.getGamelabel().pipe(map(x => x?.data || []));
  }

  //获取所有厂商并缓存
  public getAllProvider(practical: boolean = true) {
    return this.gameApi.getProviderList().pipe(
      map(x => x?.data || []),
      map(x => {
        if (practical) {
          //实际使用的，暂时隐藏GB
          return x.filter(
            y => ![this.lotteryProviderID, this.sportsProviderID, this.originalProviderID].includes(y.providerCatId),
          );
        } else {
          //所有的
          return x;
        }
      }),
    );
  }

  //获取指定标签的厂商
  public getProviderByLabel(labelCode?: string, gameTypes?: string) {
    return this.gameApi
      .getProviderByLabel(labelCode ? [labelCode] : undefined, gameTypes ? [gameTypes] : undefined)
      .pipe(
        map(x => {
          const data = x?.data || [];
          return data.filter((list: ProviderInterface) => list.gameCount !== 0);
        }),
      );
  }

  //获取指定厂商的标签
  public getLabelByProviderid(providerCatId: string) {
    return this.gameApi.getLabelByProviderid(providerCatId).pipe(
      map(x => {
        return x?.data || [];
      }),
    );
  }

  // 获取原创的标签id
  public getOriginalProviderID(): Observable<string> {
    if (this.originalLabelID) {
      return of(this.originalLabelID);
    } else {
      return this.getLabelByProviderid(this.originalProviderID).pipe(
        map(x => {
          if (x?.length > 0) {
            const labelCode =
              x?.reduce((prev, curr) => ((prev?.gameCount || 0) > (curr?.gameCount || 0) ? prev : curr))?.code || '';
            this.originalLabelID = labelCode;
            return labelCode;
          } else {
            return '';
          }
        }),
      );
    }
  }

  //获取排序下拉
  public getGameSort() {
    return combineLatest([
      this.gameApi.getGameSortList().pipe(
        map(x => x?.data || []),
        map(x => [{ code: '', description: this.localServie.getValue('popular'), icon: '' }, ...x]),
      ),
      this.appService.userInfo$,
    ]).pipe(
      map(([sort, userLogin]) => {
        if (userLogin) {
          return sort;
        } else {
          return sort.filter(list => list.code !== 'RecommendSort');
        }
      }),
    );
  }

  // 游戏按指定标签、供应商、排序、分页筛选
  public getGameByProvider(param: GameProviderParams): Observable<ResponseListData<GameListItem[]>> {
    if (param.providerCatIds?.length === 0) param.providerCatIds = null;
    const bufferKey = window.btoa(JSON.stringify(param));
    return (
      this.gameByProviderBuffer[bufferKey] ??
      ((this.gameByProviderBuffer[bufferKey] = this.gameApi.gameListByProvider(param).pipe(
        cacheValue(1000 * 60 * 10), //缓存10分钟
        map(x => (x?.data && this.newObj(x.data)) || { total: 0, list: [] }),
      )),
      this.gameByProviderBuffer[bufferKey])
    );
  }

  /**
   * 获取场景信息
   *
   * @param scenesType 场景类型 Hall 大厅列表 Menu 菜单 HallBar 大厅横栏 FrontPage 首页
   * @param gameCount 游戏数量
   * @returns
   */
  getScenesInfo(
    scenesType: 'Hall' | 'Menu' | 'HallBar' | 'FrontPage',
    gameCount: number = 50,
  ): Observable<ScenesInfo[]> {
    return this.gameApi.getLabelAndGameListByScenes(scenesType, gameCount).pipe(
      map(x => {
        return x?.data || [];
      }),
    );
  }

  getNewSceneData(): Observable<HomeLabelSceneData> {
    return this.gameApi.getScenesMenu().pipe(
      map(x => {
        return {
          homeScene: x?.data.headerMenus.find((y: HeaderMenu) => y.key == '0') || [],
          headerMenus: x?.data.headerMenus.filter(x => x.key !== '0').slice(0, 3) || [],
          leftMenus: x?.data.leftMenus || [],
          navigationMenus: x?.data.navigationMenus || [],
        };
      }),
    );
  }

  getGameListByIds(ids: number[]) {
    return this.gameApi.getGameListByIds(ids).pipe(
      map(x => {
        return x?.data || [];
      }),
    );
  }

  private newObj(v: unknown) {
    return JSON.parse(JSON.stringify(v));
  }

  //获取小游戏收藏列表
  public getFavoriteList(pageIndex: number = 1, pageSize: number = 10): Observable<GameFavoriteList | null> {
    return this.gameApi.getFavoritegame(pageIndex, pageSize).pipe(
      map(x => x?.data || null),
      tap(x => {
        if (x) this.miniGameFavoriteNumber$.next(x.total);
      }),
    );
  }

  private allRecentLyPlayeGamesId: string[] = [];

  public getRecentLyPlayedGame(
    pageIndex: number = 1,
    pageSize: number = 1000,
  ): Observable<ResponseListData<GameListItem[]>['data'] | null> {
    return this.gameApi.getRecentLyPlayed(pageIndex, pageSize).pipe(
      map(x => x?.data || null),
      tap(x => {
        if (x && x.list) {
          x.list.forEach(x => {
            this.checkRecentLyPlayeGames(x.gameId);
          });
        }
      }),
    );
  }

  public checkRecentLyPlayeGames(gameId: string) {
    if (!this.allRecentLyPlayeGamesId.includes(gameId)) {
      this.allRecentLyPlayeGamesId.push(gameId);
    }
    this.miniGameRecentLyPlayedNumber$.next(this.allRecentLyPlayeGamesId.length);
  }

  public checkToShowCurrencyTip(item: CurrenciesInterface) {
    if (item && item.currency === 'VND') {
      this.popup.open(StandardPopupComponent, {
        disableClose: true,
        data: {
          type: 'warn',
          content: this.localeService.getValue('game_currency_tip', 1000),
          description: this.localeService.getValue('game_currency_tip_d', 1000, 'VND'),
          buttons: [{ text: this.localeService.getValue('i_ha_kn00'), primary: true }],
        },
      });
    }
  }

  /**监听游戏窗口内部事件（目前仅PNG厂商支持） */
  gameOn(etype: string) {
    this.gameIframeSource?.postMessage({ messageType: 'addEventListener', eventType: etype }, this.gameIframeOrigin);
    return fromEvent<MessageEvent>(window, 'message').pipe(
      filter((e: MessageEvent) => {
        return e.data.type === etype;
      }),
    );
  }

  /**清理游戏窗口内部监听 */
  clearGameObservable() {
    this.gameIframeSource = null;
    this.gameIframeOrigin = '';
    Object.keys(this.gameIframeSubscriptions).forEach(key => {
      const subscription = this.gameIframeSubscriptions[key];
      if (Array.isArray(subscription)) {
        subscription.forEach(sub => sub.unsubscribe());
      } else {
        subscription.unsubscribe();
      }

      delete this.gameIframeSubscriptions[key];
    });
  }

  getProviderRules(isH5: boolean, openRules?: { [key: string]: 'Iframe' | 'NewWindow' }) {
    if (!openRules) return 'Iframe';
    const isAndroid = /(android|harmony|Linux)/i.test(navigator.userAgent);
    const isIOS = /(iphone|ipad|ipod|ios|Mac OS X)/i.test(navigator.userAgent);
    if (isIOS) {
      if (environment.isApp) return openRules.ionicIos == 'Iframe' ? openRules.ionicIos : 'system';
      if (isH5) return openRules.h5Ios;
      return openRules.webMac;
    }

    if (isAndroid) {
      if (environment.isApp) return openRules.ionicAndroid == 'Iframe' ? openRules.ionicIos : 'system';
      if (isH5) return openRules.h5Android;
    }
    return openRules.webWindow;
  }

  //拼接跳转路由
  getLinkByMethod(menu: any) {
    switch (menu.redirectMethod) {
      //标签页
      case LabelScenesRedirectMethodEnum['LabelPage']:
        return `/casino/category/${menu.labelId}`;
      //指定URL
      case LabelScenesRedirectMethodEnum['AssignUrl']:
        return `${menu.config?.assignUrl}`;
      //指定厂商
      case LabelScenesRedirectMethodEnum['AssignProvider']:
        if (menu.providerSetting && menu.providerSetting.secondaryPage) {
          return `/casino/provider/${menu.config?.assignProviderId}`;
        } else {
          return `/play/${menu.config?.assignProviderId}`;
        }
      //指定游戏 游戏供应商/游戏Code
      case LabelScenesRedirectMethodEnum['AssignGame']:
        return `/play/${menu.config?.assignGameProviderId}/${menu.config?.assignGameCode}`;
      case LabelScenesRedirectMethodEnum['DropDownList']:
        return `${menu.config?.assignDropDownListUrl}`;
      default:
        return '';
    }
  }
}
