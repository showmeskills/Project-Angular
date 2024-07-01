import { CdkConnectedOverlay, ConnectedPosition } from '@angular/cdk/overlay';
import { Component, DestroyRef, OnDestroy, OnInit, ViewChild, WritableSignal, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subscription, combineLatest, filter, fromEvent, map, of, switchMap, tap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/apis/game.api';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import {
  HeaderMenu,
  HomeLabelSceneData,
  InfoVerticallyList,
  PlayGameParams,
  ProviderInterface,
} from 'src/app/shared/interfaces/game.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { SentryService } from 'src/app/shared/service/sentry.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { MiniGameService } from '../minigame/minigame.service';
import { SportsCurrencyPopupComponent } from './sports-currency-popup/sports-currency-popup.component';

@Component({
  selector: 'app-sports',
  templateUrl: './sports.component.html',
  styleUrl: './sports.component.scss',
})
export class SportsComponent implements OnInit, OnDestroy {
  static _componentName = 'sportsHome';
  constructor(
    private dataCollectionService: DataCollectionService,
    private layout: LayoutService,
    private appService: AppService,
    private router: Router,
    private miniGameService: MiniGameService,
    private gameApi: GameApi,
    private sentryService: SentryService,
    private toast: ToastService,
    private localeService: LocaleService,
    private localStorageService: LocalStorageService,
    private destroyRef: DestroyRef,
    private popup: PopupService,
  ) {}

  /** 后台标签配置 */
  gameList: WritableSignal<InfoVerticallyList[]> = signal([]);
  renderGameList = computed(() => {
    if (this.gameList().length > 0) return this.gameList();
    return Array(5).fill(null);
  });

  /** 是否配置 体育首页的iframe */
  isHasIframe: boolean = false;

  /** laoding 状态 */
  loading: boolean = false;

  /** 游戏链接 */
  url: string = '';

  /** 是否已登录 */
  logined: boolean = false;

  /** 报错信息 */
  errorText: string = '';

  /** 是否为全屏 */
  isFullScreen: boolean = false;

  /** 游戏详情 */
  gameProvider: ProviderInterface | null = null;
  showCoinList: boolean = false;
  positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', panelClass: 'select-coin-show-in-down' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass: 'select-coin-show-in-up' },
  ];
  gameCurrency: string[] = [];
  selectedPlayCoin: string = '';
  currentCurrency: CurrenciesInterface | null = null;

  /** 游客模式 */
  guestModeListener$!: Subscription;

  @ViewChild(CdkConnectedOverlay, { static: false }) cdkConnectedOverlay?: CdkConnectedOverlay;

  ngOnInit(): void {
    this.setPoint('in');

    this.layout
      .watchPageReuse('sports/', 'include')
      .pipe(takeUntilDestroyed(this.destroyRef))
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

    // 是否登录
    this.logined = Boolean(this.localStorageService.loginToken);

    this.layout.page$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      this.cdkConnectedOverlay?.overlayRef?.detach();
      if (v?._componentName === SportsComponent._componentName) {
        if (!this.logined) {
          this.onGuestMode();
        }
      } else {
        this.guestModeListener$?.unsubscribe();
      }
    });

    this.miniGameService.homeScenesSub$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((x: HomeLabelSceneData) => {
          return x.headerMenus.find((item: HeaderMenu) => item.config.assignUrl?.includes('sports'));
        }),
        switchMap((data: HeaderMenu | undefined) => {
          if (data) {
            const ids = [data.infoHorizontalList, data.infoVerticallyList]
              .flat()
              .filter(x => !!x)
              .map(x => Number(x.labelCode || 0));
            return combineLatest([of(data), this.miniGameService.getGameListByIds([...new Set(ids)])]);
          } else {
            return of([null, null]);
          }
        }),
      )
      .subscribe(([data, list]) => {
        if (data && list) {
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
          }
        } else {
          this.router.navigateByUrl(`/${this.appService.languageCode}`);
        }
      });

    combineLatest([
      this.miniGameService.getAllProvider().pipe(
        map(v => v?.filter(x => x?.showHome && (x?.category === 'SportsBook' || x?.category === 'Esports'))),
        tap(provider => {
          if (provider?.length) {
            this.gameProvider = provider[0];
            this.gameCurrency = provider[0]?.currencies || [];
            const allow = this.gameProvider.countryCode.includes(this.appService.countryCode);
            if (this.gameProvider?.status !== 'Online') {
              this.errorText = this.localeService.getValue('game_main_desc_re');
            } else if (this.gameProvider.countryCode.length > 0 && !allow) {
              this.errorText = this.localeService.getValue('provider_n_sup_region');
            }
          }
        }),
      ),
      this.appService.currentCurrency$.pipe(filter(v => !!v)),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([provider, currentCurrency]) => {
        if (provider?.length) {
          this.isHasIframe = true;
          this.currentCurrency = currentCurrency;

          if (this.gameCurrency.includes(currentCurrency.currency)) {
            this.selectedPlayCoin = currentCurrency.currency;
          } else if (this.gameCurrency.includes('USDT')) {
            this.selectedPlayCoin = 'USDT';
          } else {
            this.selectedPlayCoin = this.gameCurrency[0] || '';
          }
          if (this.logined || this.gameProvider?.isTry) {
            this.getGameLink();
          }
        } else {
          this.isHasIframe = false;
        }
      });
  }

  /** 开始订阅 游客模式 */
  onGuestMode() {
    this.guestModeListener$?.unsubscribe();
    this.guestModeListener$ = fromEvent<MessageEvent>(window, 'message')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(event => {
        const sboSport: boolean =
          (this.gameProvider?.providerCatId?.includes('SBOSport-1') && event?.data?.type === 'click') || false;
        const fbSport: boolean =
          (this.gameProvider?.providerCatId?.includes('FBSport-1') && event?.data?.relogin) || false;
        if (sboSport || fbSport) {
          this.appService.jumpToLogin();
        }
      });
  }

  /**
   * 获取 打开游戏参数
   *
   * @returns
   */
  get playGameParams(): PlayGameParams {
    return {
      providerCatId: this.gameProvider?.providerCatId || '',
      gameId: 'All',
      currencyCode: this.currentCurrency?.currency || '',
      gameCurrencyCode: this.selectedPlayCoin,
      playMode: this.logined ? 'Normal' : 'Try',
      siteType: this.layout.isMobile$.value ? 'Mobile' : 'PC',
      showMode: this.appService.themeSwitch$?.value === 'moon' ? 'Night' : 'Day',
    };
  }

  /**获取游戏连接 */
  getGameLink() {
    if (this.loading) return;
    this.url = '';
    this.loading = true;

    this.gameApi.getPlayGameUrl(this.playGameParams).subscribe(res => {
      this.loading = false;
      if (res?.data?.playGameUrl) {
        this.url = res.data.playGameUrl;
      } else {
        this.toast.show({
          type: 'fail',
          message: this.localeService.getValue('gam_conn_err'),
        });
        this.sentryService.error('GameError', 'Full Play Game Url Error', {
          extra: { params: this.playGameParams, response: res },
          level: 'warning',
        });
      }
    });
  }

  playGame() {
    this.appService.jumpToLogin();
  }

  onSelectPlayCoin(coin: string) {
    if (coin === this.selectedPlayCoin) return;
    this.selectedPlayCoin = coin;
    this.showCoinList = false;

    if (!this.logined && !this.gameProvider?.isTry) return;

    this.getGameLink();
  }

  // 点击标签标题
  clickLabelTitle(item: HeaderMenu) {
    const url = `/${this.appService.languageCode}${this.miniGameService.getLinkByMethod(item)}`;
    if (url) {
      this.router.navigateByUrl(url);
    }
  }

  // 点击游戏
  clickGameItem(item: { webRedirectUrl: string; providerCatId: string; gameId: string }) {
    if (item?.webRedirectUrl) {
      this.router.navigateByUrl(`${this.appService.languageCode}/${item.webRedirectUrl}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/play/${item.providerCatId}/${item.gameId}`);
    }
  }

  ngOnDestroy(): void {
    this.setPoint('out');
  }

  setPoint(type: string) {
    switch (type) {
      case 'in':
        this.dataCollectionService.setEnterTime('sports');
        this.dataCollectionService.addPoint({ eventId: 30006, actionValue1: 1 });
        break;
      case 'out':
        this.dataCollectionService.addPoint({
          eventId: 30002,
          actionValue1: this.dataCollectionService.getTimDiff('sports'),
          actionValue2: 1,
        });
        break;
      default:
        break;
    }
  }

  /**
   * 监听是否打开全屏
   *
   * @param isFullScreen
   */
  fullScreen(isFullScreen: boolean) {
    this.isFullScreen = isFullScreen;
  }

  switchCurrency() {
    this.popup.open(SportsCurrencyPopupComponent, {
      speed: 'faster',
      autoFocus: false,
      disableClose: true,
      panelClass: 'sport-currency-dialog-container',
      data: {
        currency: this.gameProvider?.currencies || [],
        selectedPlayCoin: this.selectedPlayCoin,
        currencyRatio: this.gameProvider?.currencyRatio || [],
        callback: (currency: string) => this.onSelectPlayCoin(currency),
      },
    });
  }
}
