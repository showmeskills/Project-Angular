import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { ConnectedPosition } from '@angular/cdk/overlay';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, combineLatest, EMPTY, merge, of, Subject, timer } from 'rxjs';
import { distinctUntilChanged, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/apis/game.api';
import {
  CurrencyRatio,
  GameListItem,
  PlayGameParams,
  ProviderInterface,
  ProviderSetting,
} from 'src/app/shared/interfaces/game.interface';
import { CurrencyData, TransferWalletListData } from 'src/app/shared/interfaces/wallet.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { SentryService } from 'src/app/shared/service/sentry.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { ActivityService } from '../../activity/activity.service';
import { UserAssetsService } from '../../user-asset/user-assets.service';
import { WalletTransferComponent } from '../../user-asset/wallet-transfer/wallet-transfer.component';
import { MiniGameService } from '../minigame.service';

@UntilDestroy()
@Component({
  selector: 'app-game-level3',
  templateUrl: './game-level3.component.html',
  styleUrls: ['./game-level3.component.scss'],
})
export class GameLevel3Component implements OnInit, AfterViewInit, OnDestroy {
  isH5!: boolean;
  isRealPhone!: boolean;
  logined!: boolean;

  constructor(
    private route: ActivatedRoute,
    private gameApi: GameApi,
    public appService: AppService,
    private router: Router,
    public layout: LayoutService,
    private miniGameService: MiniGameService,
    private toast: ToastService,
    private localeService: LocaleService,
    private userAssetsService: UserAssetsService,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef,
    private sentryService: SentryService,
    public activityService: ActivityService,
  ) {}

  gameId!: string;
  providerId!: string;

  theater!: boolean;
  showTab: boolean = false;

  selectedOddType: string = ''; //选择的投注范围类型
  showRangList: boolean = false; //显示选择投注范围菜单

  selectedPlayCoin: string = ''; //选择的游戏币种
  showCoinList: boolean = false; //显示选择币种菜单
  selectPlayCoin$: Subject<string> = new Subject();

  showOverlay: boolean = true; //显示遮盖
  silenceLoading!: boolean;

  gameInfo?: GameListItem; //游戏详情
  loaddingGameInfo: boolean = true;
  maintenance: boolean = false; //是否维护中
  gameLink: string = ''; //游戏链接
  loadingGameUrl!: boolean;
  lastGetLinkParam!: string;

  playMode!: boolean; //真钱/试玩模式
  currentCurrency!: string;

  listenLoad!: boolean;
  iframeLoading!: boolean;

  provider?: ProviderInterface;
  transferGameWalletInfo?: TransferWalletListData;

  errorText: string = '';

  /** 各大排行榜的请求接口参数 */
  gameCategories: string[] = [];

  /**是否转账型游戏 */
  get isTransferGame(): boolean {
    return this.provider ? this.provider.isTransfer : false;
  }

  /**当前游戏所有的钱包(支持的币种) */
  get currentGameWalletInfo() {
    return (
      (this.isTransferGame
        ? this.logined
          ? this.transferGameWalletInfo?.currencies
          : this.gameInfo?.currencyRatio
        : this.gameInfo?.currencyRatio) || []
    );
  }

  /**是否支持顶部的币种 */
  get isSupportTopCurrency(): boolean {
    return !!(this.currentGameWalletInfo as CurrencyData[]).find(
      (x: CurrencyData | CurrencyRatio) => (x.currency === 'USD' ? 'USDT' : x.currency) === this.currentCurrency,
    );
  }

  /**当前游戏选择的钱包 */
  get currentGameCurrencies(): CurrencyData | CurrencyRatio | undefined {
    if (this.selectedPlayCoin) {
      // 有具体选择了币种
      return (this.currentGameWalletInfo as CurrencyData[]).find(
        (x: CurrencyData) => x.currency === this.selectedPlayCoin,
      );
    } else {
      // 默认
      const v = (this.currentGameWalletInfo as CurrencyData[]).find(
        (x: CurrencyData) => (x.currency === 'USD' ? 'USDT' : x.currency) === this.currentCurrency,
      );
      return v ?? (this.currentGameWalletInfo as CurrencyData[])[0];
    }
  }

  /**是否需要转账 */
  get needTransfer(): boolean {
    return this.isTransferGame && (this.transferGameWalletInfo?.isFirst || !this.currentGameCurrencies?.isActivate);
  }

  /**显示币种提示 */
  get showCurrencyTip(): boolean {
    if (!this.gameInfo) return false;
    const currency = this.gameInfo.currencyRatio.find(x => x.currency === this.selectedPlayCoin);
    return currency ? currency.ratio !== 1 : false; //如果找不到这个币种，默认当做1，即不显示
  }

  positions: ConnectedPosition[] = [
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      panelClass: 'select-coin-show-in-down',
    },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', panelClass: 'select-coin-show-in-up' },
  ];

  /**当前投注限额级别数据 */
  betRangeSetting?: ProviderSetting;

  /**游戏活动中 */
  get gameActive() {
    return !!(this.gameInfo && !this.loaddingGameInfo && this.gameLink);
  }

  /**是否显示大屏幕 */
  showFullIframe!: boolean;
  /**外层 layout 元素尺寸变化触发 */
  layoutContentSizeChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  /**game-view 元素尺寸变化触发 */
  gameViewSizeChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  /**游戏窗口的定位 */
  iframePosition = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  };

  defaultImg: string = '';
  gameRule: string = '';
  /**游戏窗口 */
  gameWin: Window | null = null;

  /** tournament 竞赛 组件参数 */
  gameTypeDto?: { gameCategory: string; gameCode: string; gameProvider: string };

  ngOnInit() {
    this.defaultImg = this.miniGameService.defaultImg;
    // 游戏初始化
    this.gameInit();

    // 监听h5、是否是移动设备横屏
    combineLatest([
      this.layout.isH5$.pipe(
        tap(e => {
          this.isH5 = e;
          this.showTab = e ? false : this.logined ? false : true;
        }),
      ),
      this.breakpointObserver
        .observe([
          Breakpoints.HandsetLandscape, //手机横板
          Breakpoints.TabletLandscape, //平板横板
        ])
        .pipe(
          map((state: BreakpointState) => state.matches),
          distinctUntilChanged(),
        ),
      this.breakpointObserver
        .observe(['(max-width: 767px) and (orientation: portrait)', '(max-height: 767px) and (orientation: landscape)'])
        .pipe(
          map((state: BreakpointState) => state.matches && this.layout.isMobile$.value),
          distinctUntilChanged(),
          tap(e => (this.isRealPhone = e)),
        ),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([isH5, result]) => {
        this.showFullIframe = isH5 || result;
        this.setLeftMenu();
      });

    /**合并检测尺寸变化，从而改变游戏窗口的位置 */
    merge(this.layoutContentSizeChange$, this.gameViewSizeChange$)
      .pipe(untilDestroyed(this))
      .subscribe(() => this.checkToSetIframePosition());
  }

  /**检测外层 layout 元素 */
  ngAfterViewInit() {
    this.layout
      .resizeObservable(document.querySelector('.layout-main-content') as HTMLElement)
      .pipe(
        untilDestroyed(this),
        map(() => true),
      )
      .subscribe(this.layoutContentSizeChange$);
  }

  /**开始检测 game-view 元素的大小（准备游戏窗口定位需要）*/
  buildGameViewSize(e: boolean) {
    if (!e) return;
    this.layout
      .resizeObservable(document.querySelector('.game-view-content') as HTMLElement)
      .pipe(
        untilDestroyed(this),
        map(() => true),
      )
      .subscribe(this.gameViewSizeChange$);
  }

  /**游戏页面进入、联动等关键准备 */
  gameInit() {
    // 顶部币种订阅
    this.appService.currentCurrency$
      .pipe(
        filter(v => !!v),
        untilDestroyed(this),
      )
      .subscribe(v => {
        this.currentCurrency = v.currency;
        if (this.isSupportTopCurrency) {
          if (this.currentCurrency === 'USDT') {
            if (this.currentGameWalletInfo.map(x => x.currency).includes('USD')) {
              this.selectedPlayCoin = 'USD';
            } else {
              this.selectedPlayCoin = 'USDT';
            }
          } else {
            this.selectedPlayCoin = this.currentCurrency;
          }
        }
        this.resetOddType();
        this.reset();
        this.playGame();
      });

    // 路由进入、切换订阅
    combineLatest([
      this.route.paramMap.pipe(
        untilDestroyed(this),
        tap(params => {
          //路由变化必定重新请求，清空数据
          this.selectedOddType = '';
          this.selectedPlayCoin = '';
          this.errorText = '';
          this.maintenance = false;
          this.reset();
          //获取路由参数
          this.providerId = params.get('providerId') || '';
          this.gameId = params.get('gameId') || '';
          //准备请求GameInfo
          this.loaddingGameInfo = true;
        }),
      ),
      this.miniGameService.getAllProvider(),
      this.appService.userInfo$.pipe(
        map(x => Boolean(x)),
        distinctUntilChanged(),
        tap(x => (this.playMode = this.logined = x)),
      ),
      this.appService.ipInfoReady$,
      this.appService.currentCurrency$.pipe(first(v => !!v)),
    ])
      .pipe(
        untilDestroyed(this),
        switchMap(([, allProvider]) => {
          this.provider = allProvider.find(y => y.providerCatId === this.providerId);
          if (this.provider && this.provider.status === 'Online') {
            // 彩票使用剧场模式
            if (this.provider.category === 'Lottery') {
              this.turnTheater(true);
            }

            // SlotGame 显示'游戏使用中'
            if (this.provider.category === 'SlotGame') {
              this.appService.turnShowPalying('game-level3', true);
            } else {
              this.appService.turnShowPalying('game-level3', false);
            }

            const allow = this.provider.countryCode.includes(this.appService.countryCode);
            if (this.provider.countryCode.length > 0 && !allow) {
              // 不是支持的地区
              this.errorText = this.localeService.getValue('provider_n_sup_region');
            }

            this.gameRule = this.miniGameService
              .getProviderRules(this.layout.isH5$.value, this.provider.gameOpenMethod)
              .toLowerCase();
            return combineLatest([
              this.gameApi.getGameInfo(this.gameId, this.providerId).pipe(map(res => res?.data || null)),
              // 根据是否转账游戏，决定是否需要请求 getWalletList 接口
              this.isTransferGame && this.logined
                ? this.userAssetsService.getWalletList()
                : of([] as TransferWalletListData[]),
            ]);
          } else {
            //不是有效的游戏，跳到404
            this.to404();
            return EMPTY;
          }
        }),
      )
      .subscribe(([gameInfo, walletList]) => {
        this.loaddingGameInfo = false;
        if (gameInfo) {
          this.gameInfo = gameInfo;
          this.betRangeSetting = gameInfo.betRangeSetting;
          this.gameCategories = [this.gameInfo.category];

          // 判断维护状态
          this.maintenance = gameInfo.id === 0 || gameInfo.status !== 'Online';

          // 不支持试玩又已登录，自动切换为真钱模式
          if (!this.gameInfo.isTry && this.logined) this.playMode = true;

          if (this.isTransferGame && this.logined) {
            this.transferGameWalletInfo = walletList.find(x => x.providerId === this.providerId.split('-')[0]);
            //找不到匹配的钱包，暂按维护中处理
            if (!this.transferGameWalletInfo) this.maintenance = true;
          }

          this.playGame();
        }
      });
  }

  /**进入准备游戏阶段 */
  playGame(isReal: boolean = this.playMode, byUser: boolean = false) {
    if (this.maintenance || !this.provider || !this.gameInfo || !this.currentGameCurrencies) return;

    this.gameTypeDto = {
      gameCategory: this.gameInfo?.category || '',
      gameCode: this.gameId,
      gameProvider: this.gameInfo?.providerId || '',
    };

    if (isReal && !this.logined && byUser) {
      //跳转登录
      this.appService.jumpToLogin();
      return;
    }

    this.playMode = isReal;
    this.selectedPlayCoin = this.currentGameCurrencies.currency;
    if (!byUser && this.selectedOddType === '') this.resetOddType();

    if (isReal && this.isTransferGame && this.needTransfer && this.transferGameWalletInfo) {
      //弹出划转
      this.openWalletTransDialog(this.transferGameWalletInfo.category);
      return;
    }

    if (this.errorText) {
      if (byUser) {
        this.toast.show({
          type: 'fail',
          message: this.localeService.getValue('provider_n_sup_region'),
        });
      }
      return;
    }

    const param = this.buildParam();

    //模式不支持,阻止继续
    if (param.playMode === 'Try' && !this.gameInfo.isTry) return;
    if (param.playMode === 'Normal' && !this.logined) return;

    if (this.isH5 || this.betRangeSetting || !this.isSupportTopCurrency || !this.logined || this.showCurrencyTip) {
      // 有范围选择或者游戏不支持顶部币种时，或者未登录时，或h5时，或有币种提示信息时，显示遮罩(即仅加载，但不开始)
      if (this.checkParam(param)) {
        this.silenceLoading = true;
        this.getGameLink(param, byUser);
      } else {
        this.startByRule(true);
      }
    } else {
      this.getGameLink(param, true);
    }
  }

  /**选择游戏币种 */
  onSelectPlayCoin(coin: string) {
    this.selectedPlayCoin = coin;
    this.resetOddType();
    this.reset();
    this.playGame();
  }

  /**选择投注范围 */
  onSelectOddType(type: string) {
    this.selectedOddType = type;
    this.reset();
    this.playGame();
  }

  //打开划转窗口
  openWalletTransDialog(category: string): void {
    this.dialog
      .open(WalletTransferComponent, {
        disableClose: true,
        autoFocus: false,
        panelClass: 'custom-dialog-container',
        data: {
          category,
        },
      })
      .afterClosed()
      .subscribe(async x => {
        if (x) {
          this.loaddingGameInfo = true;
          const walletList = await this.userAssetsService.getWalletList();
          this.loaddingGameInfo = false;
          this.transferGameWalletInfo = walletList.find(x => x.providerId === this.providerId.split('-')[0]);
          //找不到匹配的钱包，暂按维护中处理
          if (!this.transferGameWalletInfo) this.maintenance = true;
          this.playGame();
        }
      });
  }

  gameLinkCache: string = '';

  /**获取游戏链接 */
  getGameLink(param: PlayGameParams, removeMask?: boolean) {
    if (this.maintenance) return;
    this.loadingGameUrl = true;

    //提前准备好窗口
    if (this.gameRule === 'newwindow') {
      this.clearWin();
      this.buildWin();
    }

    this.gameApi.getPlayGameUrl(param).subscribe(res => {
      this.loadingGameUrl = false;
      this.silenceLoading = false;

      if (res?.data?.playGameUrl) {
        this.gameLinkCache = res.data.playGameUrl;
        this.startByRule(removeMask, true);
      } else {
        this.clearWin(true);
        this.reset();
        this.toast.show({
          type: 'fail',
          message: this.localeService.getValue('gam_conn_err'),
        });
        this.sentryService.error('GameError', 'Play Game Url Error', {
          extra: { params: param, response: res },
          level: 'warning',
        });
      }
    });
  }

  startByRule(removeMask: boolean = false, buildloading: boolean = false) {
    switch (this.gameRule) {
      case 'iframe':
        if (buildloading) this.gameLink = this.gameLinkCache;
        if (removeMask) {
          this.showOverlay = false;
          this.setLeftMenu(true);
        }
        if (buildloading) this.buildIframeLoading();
        break;
      case 'newwindow':
        this.buildWin();
        this.gameWin && (this.gameWin.location.href = this.gameLinkCache);
        this.lastGetLinkParam = '';
        break;
      case 'system':
        // @ts-ignore
        window.cordova.InAppBrowser.open(this.gameLinkCache, '_system');
        this.lastGetLinkParam = '';
        break;
      default:
        break;
    }
  }

  /**创建新游戏窗口的检测（只对最后打开的窗口有效） */
  buildWin() {
    if (!this.gameWin) {
      this.gameWin = window.open('');
    }
  }

  /**清除游戏窗口 */
  clearWin(close: boolean = false) {
    if (this.gameWin) {
      close && this.gameWin.close();
      this.gameWin = null;
    }
  }

  goHomeTime = 5;

  goHome() {
    this.router.navigateByUrl(`/${this.appService.languageCode}`);
  }

  buildGoHome() {
    this.goHomeTime = 5;
    const timeOut = timer(1000, 1000)
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        if (this.goHomeTime === 0) {
          timeOut.unsubscribe();
          this.goHome();
          return;
        }
        this.goHomeTime -= 1;
      });
  }

  /**构建请求参数 */
  buildParam(): PlayGameParams {
    const param: PlayGameParams = {
      providerCatId: this.gameInfo?.providerCatId || '',
      gameId: this.gameId,
      currencyCode: this.currentCurrency,
      gameCurrencyCode: this.selectedPlayCoin,
      playMode: this.playMode ? 'Normal' : 'Try',
      siteType: this.layout.isMobile$.value ? 'Mobile' : 'PC',
      agOddType: this.selectedOddType,
      showMode: this.appService.themeSwitch$?.value === 'moon' ? 'Night' : 'Day',
    };
    return param;
  }

  /**检查是否刚请求过 */
  checkParam(param: PlayGameParams): boolean {
    const currentParamString = window.btoa(JSON.stringify(param));
    if (currentParamString === this.lastGetLinkParam) {
      return false;
    } else {
      this.lastGetLinkParam = currentParamString;
      return true;
    }
  }

  /**前往404 */
  to404() {
    this.router.navigateByUrl(`/${this.appService.languageCode}/404`, { replaceUrl: true });
  }

  /**重置 */
  reset() {
    this.showCoinList = false;
    this.showRangList = false;
    this.iframeLoading = false;
    this.gameLink = '';
    this.showOverlay = true;
    this.setLeftMenu(false);
    this.lastGetLinkParam = '';
  }

  /**重置投注级距配置 */
  resetOddType() {
    if (this.selectedPlayCoin && this.betRangeSetting) {
      const range = this.betRangeSetting.currencySettingList?.find(x => x?.currency === this.selectedPlayCoin);
      if (range) this.selectedOddType = range.rangeSettingList[0].oddType;
    }
  }

  /**点击游戏 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clickGameItem(item: any) {
    if (item?.webRedirectUrl) {
      this.router.navigateByUrl(`${this.appService.languageCode}/${item.webRedirectUrl}`);
    } else {
      this.router.navigateByUrl(`${this.appService.languageCode}/casino/games/${item.providerCatId}/${item.gameId}`);
    }
  }

  /**点击标签标题 */
  clickLabelTitle(label: string) {
    this.router.navigateByUrl(`${this.appService.languageCode}/casino/category/${label}`);
  }

  /**收藏 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleFavorite(gameItem: any) {
    this.getFavorite(gameItem.isFavorite, gameItem.id);
    gameItem.isFavorite = !gameItem.isFavorite;
  }

  /**添加或删除收藏 */
  getFavorite(isFavorite: boolean, id: string) {
    if (isFavorite) {
      //remove
      this.gameApi.postRemoveFavoriteGame(id).subscribe(res => {
        if (res.success) {
          this.miniGameService.miniGameFavoriteNumber$.next(res.data.favoriteCount);
        }
      });
    } else {
      //add
      this.gameApi.postAddFavoriteGame(id).subscribe(res => {
        if (res.success) {
          this.miniGameService.miniGameFavoriteNumber$.next(res.data.favoriteCount);
        }
      });
    }
  }

  /**iframe加载状态开启 */
  buildIframeLoading() {
    this.iframeLoading = true;
    setTimeout(() => {
      // 用于跳过 chrome/opera 两次的load事件中的第一次
      this.listenLoad = true;
    });
  }

  /**游戏窗口第三方HTML加载完成 */
  iframeLoad(iframeEl: HTMLIFrameElement) {
    if (!this.listenLoad) return;
    this.iframeLoading = false;
    if (this.gameInfo?.providerCatId.includes('PNGGame')) {
      this.miniGameService.gameIframeSource = iframeEl.contentWindow;
      this.miniGameService.gameIframeOrigin = new URL(iframeEl.src).origin;
      this.miniGameService.gameIframeSubscriptions['PNGGame'] = [
        // PNGGame 点击x回到娱乐城首页
        this.miniGameService.gameOn('logout').subscribe(() => {
          this.router.navigate([this.appService.languageCode, 'casino']);
        }),
        // PNGGame 点击继续免费旋转。重新开启游戏
        this.miniGameService.gameOn('reloadGame').subscribe(() => {
          this.reset();
          this.playGame();
          if (this.isH5) this.startByRule(true);
        }),
      ];
    } else {
      this.miniGameService.clearGameObservable();
    }
  }

  /**设置左侧菜单显示与隐藏 */
  setLeftMenu(v?: boolean) {
    if (v !== undefined) {
      if (this.layout.leftMenuInvisible$.value !== v) {
        if (v) {
          if (this.showFullIframe && this.gameActive && !this.showOverlay) this.layout.leftMenuInvisible$.next(true);
        } else {
          this.layout.leftMenuInvisible$.next(false);
        }
      }
    } else {
      const can = this.showFullIframe && this.gameActive && !this.showOverlay;
      if (this.layout.leftMenuInvisible$.value !== can) this.layout.leftMenuInvisible$.next(can);
    }
    this.checkToSetIframePosition();
  }

  /**切换剧场模式 */
  turnTheater(v?: boolean) {
    if (v !== undefined) {
      this.theater = v;
    } else {
      this.theater = !this.theater;
    }
  }

  /**检查并设置游戏窗口的位置 */
  checkToSetIframePosition() {
    const layoutSize = document.querySelector('.layout-main-content')?.getBoundingClientRect();
    if (this.showFullIframe) {
      if (layoutSize) {
        this.iframePosition = {
          top: 0 + (this.isH5 || this.isRealPhone ? 0 : this.layout.scrollTop$.value),
          left: 0,
          width: layoutSize.width,
          height: this.isH5 || this.isRealPhone ? window.innerHeight : layoutSize.height,
        };
      }
    } else {
      const gameViewSize = document.querySelector('.game-view-content')?.getBoundingClientRect();
      if (layoutSize && gameViewSize) {
        this.iframePosition = {
          top: this.theater ? 0 : 42, //非剧场模式固定为样式中的42px
          left: gameViewSize.left - layoutSize.left,
          width: gameViewSize.width,
          height: gameViewSize.height,
        };
      }
    }
    this.cdr.detectChanges();
  }

  /**关闭全屏模式后重置、重新检查游戏窗口位置 */
  afterCloseFullscreen() {
    this.reset();
    this.checkToSetIframePosition();
  }

  /**切换显示统计 */
  toggleStatistics() {
    //TODO:完善后需删掉
    if (environment.isOnline) {
      this.toast.show({ message: this.localeService.getValue('waiting'), type: 'fail', title: '' });
      return;
    }
    this.layout.statisticsPanelState$.next(!this.layout.statisticsPanelState$.value);
  }

  /** 打开toournament 竞赛 推送 */
  toggleTournamentPanel() {
    this.activityService.tournamentRankPanel$.next(!this.activityService.tournamentRankPanel$.value);
    if (this.isH5) {
      this.activityService.openTournamentPopup({
        gameCategory: this.gameInfo?.category || '',
        gameCode: this.gameId,
        gameProvider: this.gameInfo?.providerId || '',
      });
    }
  }

  ngOnDestroy() {
    this.setLeftMenu(false);
    this.appService.turnShowPalying('game-level3', false);
    this.miniGameService.clearGameObservable();
    this.activityService.tournamentRankPanel$.next(false);
  }
}
