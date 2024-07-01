import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EMPTY, Subscription, combineLatest, fromEvent, of, timer } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/apis/game.api';
import { GameListItem, PlayGameParams, ProviderInterface } from 'src/app/shared/interfaces/game.interface';
import { CurrencyData, TransferWalletListData } from 'src/app/shared/interfaces/wallet.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { SentryService } from 'src/app/shared/service/sentry.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { GAME_ID_MAP } from '../minigame/game.config';
import { MiniGameService } from '../minigame/minigame.service';
import { SportsCurrencyPopupComponent } from '../sports/sports-currency-popup/sports-currency-popup.component';
import { UserAssetsService } from '../user-asset/user-assets.service';
import { WalletTransferComponent } from '../user-asset/wallet-transfer/wallet-transfer.component';

@UntilDestroy()
@Component({
  selector: 'app-full-play',
  templateUrl: './full-play.component.html',
  styleUrls: ['./full-play.component.scss'],
})
export class FullPlayComponent implements OnInit, OnDestroy {
  constructor(
    private gameApi: GameApi,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private miniGameService: MiniGameService,
    private layout: LayoutService,
    private appService: AppService,
    private toast: ToastService,
    private userAssetsService: UserAssetsService,
    private localeService: LocaleService,
    private localStorageService: LocalStorageService,
    private dataCollectionService: DataCollectionService,
    private sentryService: SentryService,
    private popup: PopupService,
  ) {}

  /** 用于全屏显示 */
  static _displayMode = 'FullMode';

  url!: string;
  selectedPlayCoin: string = '';
  currentCurrency: string = '';
  isH5!: boolean;
  loading!: boolean;
  showCoinList!: boolean;
  maintenance: boolean = false; //是否维护中

  providerId: string = '';
  gameId: string = '';
  gameInfoId: string = '';
  gameInfo?: GameListItem; //游戏详情
  provider?: ProviderInterface;

  positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', panelClass: 'select-coin-show-in-down' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', panelClass: 'select-coin-show-in-up' },
  ];

  /**游戏窗口观察者 */
  watcher?: Subscription;
  /**游戏窗口 */
  gameWin: Window | null = null;

  transferGameWalletInfo?: TransferWalletListData;

  errorText: string = '';

  /** 体育的全屏 */
  currentGameIsSport: boolean = false;
  /** 游客模式 */
  guestModeListener$!: Subscription;
  isPopupSelectedCoin: boolean = false;
  sportsHasTry: boolean = false;

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
          : this.provider?.currencyRatio
        : this.provider?.currencyRatio) || []
    );
  }

  /**是否支持顶部的币种 */
  get isSupportTopCurrency(): boolean {
    return !!(this.currentGameWalletInfo as CurrencyData[]).find(
      (x: CurrencyData) => (x.currency === 'USD' ? 'USDT' : x.currency) === this.currentCurrency,
    );
  }

  /**当前游戏选择的钱包 */
  get currentGameCurrencies(): CurrencyData | undefined {
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
    if (!this.provider) return false;
    const currency = this.provider.currencyRatio.find(x => x.currency === this.selectedPlayCoin);
    return currency ? currency.ratio !== 1 : false; //如果找不到这个币种，默认当做1，即不显示
  }

  /**获取当前 游戏是否为体育 */
  get isSportsGame(): boolean {
    if (this.provider?.category === 'SportsBook') return true;
    return false;
  }

  /**当前游戏为体育并且支持试玩 - 根据provider 接口中返回的 isTry进行试玩模式 */
  get sportsGameIsTry() {
    if (this.isSportsGame && this.provider?.isTry) return true;
    return false;
  }

  /**当前体育供应商币种 */
  get sportsProviderCurrencies(): string[] {
    return this.provider?.currencies || [];
  }

  /**当前体育供应商币种 */
  get sportsProviderCatId(): boolean {
    return (
      this.provider?.providerCatId?.includes('SBOSport-1') ||
      this.provider?.providerCatId?.includes('FBSport-1') ||
      false
    );
  }

  /**当前位体育并且或者游戏币种 */
  get sportsGameSupportCurreny(): string {
    if (this.isPopupSelectedCoin) return this.selectedPlayCoin;
    if (this.sportsProviderCurrencies.includes(this.currentCurrency)) {
      return this.currentCurrency;
    } else if (this.sportsProviderCurrencies.includes('USDT')) {
      return 'USDT';
    } else {
      return this.sportsProviderCurrencies[0];
    }
  }

  gameRule: string = '';

  /**是否登录 */
  logined: boolean = false;
  /**true:真钱 false:试玩模式 */
  playMode: boolean = false;
  /**是否有试玩，gameinfo -> provider 逐级寻找 isTry */
  hasTry: boolean = false;
  /** 首页热门赛事跳转进入第三方参数 欧洲需求 */
  extraParams: string = '';

  ngOnInit() {
    // 订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.route.queryParams
      .pipe(untilDestroyed(this))
      .subscribe(params => (this.extraParams = params.extra ? window.atob(params.extra) : ''));
    // 是否登录
    this.logined = this.playMode = Boolean(this.localStorageService.loginToken);

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
        this.reset();
        this.playGame();
      });

    // 路由进入、切换订阅
    combineLatest([
      this.miniGameService.getAllProvider(),
      this.route.paramMap.pipe(
        untilDestroyed(this),
        tap(params => {
          //路由变化必定重新请求，清空数据
          this.selectedPlayCoin = '';
          this.errorText = '';
          this.maintenance = false;
          this.reset();
          //获取路由参数
          this.providerId = params.get('providerId') || '';
          this.gameInfoId = params.get('gameId') ?? GAME_ID_MAP[this.providerId]; // string | undefined | ''
          this.gameId = this.gameInfoId ?? this.providerId; // string | ''
          //准备请求GameInfo
          this.loading = true;
        }),
        switchMap(() => {
          if (this.gameInfoId) {
            return this.gameApi.getGameInfo(this.gameInfoId, this.providerId).pipe(map(res => res?.data));
          } else {
            return of(undefined);
          }
        }),
      ),
      this.appService.ipInfoReady$,
      this.appService.currentCurrency$.pipe(first(v => !!v)),
    ])
      .pipe(
        untilDestroyed(this),
        switchMap(([allProvider, gameInfo]) => {
          this.provider = allProvider.find(y => y.providerCatId === this.providerId);

          // 判断维护等不可用的情况
          if (
            !this.provider || //没有厂商
            this.provider.status !== 'Online' || //有厂商但不是 Online
            (gameInfo && (gameInfo.id === 0 || gameInfo.status !== 'Online')) //有请求 gameInfo 情况下，id 或 status 不符合预期
          ) {
            this.maintenance = true;
            this.loading = false;
            return EMPTY;
          }

          const allow = this.provider.countryCode.includes(this.appService.countryCode);
          if (this.provider.countryCode.length > 0 && !allow) {
            // 不是支持的地区
            this.errorText = this.localeService.getValue('provider_n_sup_region');
          }

          this.gameRule = this.miniGameService
            .getProviderRules(this.layout.isH5$.value, this.provider.gameOpenMethod)
            .toLowerCase();
          this.gameInfo = gameInfo;

          // 如果gameInfo不存在，就往上一层级找provider isTry
          this.hasTry = this.gameInfo?.isTry ?? this.provider.isTry ?? false;
          this.sportsHasTry = this.sportsGameIsTry;
          this.dataCollectionService.addPoint({ eventId: 30004, actionValue1: this.providerId });
          // 根据是否转账游戏，决定是否需要请求 getWalletList 接口
          if (this.isTransferGame && this.logined) {
            return this.userAssetsService.getWalletList();
          } else {
            return of([]);
          }
        }),
      )
      .subscribe(walletList => {
        // status 不是 Online 的都视作维护中
        const status = this.gameInfo?.status || this.provider?.status;
        this.maintenance = status !== 'Online';

        this.loading = false;

        if (this.isTransferGame && this.logined) {
          this.transferGameWalletInfo = walletList.find(x => x.providerId === this.providerId.split('-')[0]);
          //找不到匹配的钱包，暂按维护中处理
          if (!this.transferGameWalletInfo) this.maintenance = true;
        }

        // SlotGame 显示'游戏使用中'
        if (this.provider?.category === 'SlotGame') {
          this.appService.turnShowPalying('full-play', true);
        } else {
          this.appService.turnShowPalying('full-play', false);
        }

        // 体育
        if (this.isSportsGame) {
          this.currentGameIsSport = true;
        } else {
          this.currentGameIsSport = false;
        }

        this.playGame();
      });
  }

  /**进入准备游戏阶段 */
  playGame(isReal: boolean = this.playMode, byUser: boolean = false) {
    //不能进行
    if (this.maintenance || !this.provider || !this.currentGameCurrencies) return;

    //跳转登录
    if (isReal && !this.logined && byUser) {
      this.appService.jumpToLogin();
      return;
    }

    //赋值币种
    this.selectedPlayCoin = this.currentGameCurrencies.currency;

    //赋值是否试玩还是真钱模式；
    this.playMode = isReal;

    //弹出划转
    if (isReal && this.needTransfer && this.transferGameWalletInfo) {
      this.openWalletTransDialog(this.transferGameWalletInfo.category);
      return;
    }

    //弹出错误提示
    if (this.errorText) {
      if (byUser) {
        this.toast.show({
          type: 'fail',
          message: this.localeService.getValue('provider_n_sup_region'),
        });
      }
      return;
    }

    //最终开始游戏或自动加载
    //-情况1 已登录 支持顶部币种，自动开启真钱模式
    //-情况2 已登录 不支持顶部币种，不自动开启，除非用户点的
    //-情况3 未登录 不自动开启，除非用户点的
    //-情况4 体育游戏 已登录 自动开启， 未登录支持试玩自动开启 为新规则 (用户默认币种 支持 体育游戏 就传 当前默认币种;用户默认币种 不支持 体育游戏 优先传USDT;用户默认币种 不支持并且不支持USDT的 体育游戏传provider currency数组的1一个)
    if (this.isSportsGame) {
      this.selectedPlayCoin = this.sportsGameSupportCurreny;
      this.isPopupSelectedCoin = false;
      if ((this.sportsGameIsTry && !this.logined) || this.logined) {
        if (!this.logined && this.sportsProviderCatId) {
          this.onGuestMode();
        } else {
          this.guestModeListener$?.unsubscribe();
        }
        this.getGameLink();
      }
    } else if (byUser || (this.logined && this.isSupportTopCurrency && !this.showCurrencyTip)) {
      this.getGameLink();
    }
  }

  /** 开始订阅 游客模式 */
  onGuestMode() {
    this.guestModeListener$?.unsubscribe();
    this.guestModeListener$ = fromEvent<MessageEvent>(window, 'message')
      .pipe(untilDestroyed(this))
      .subscribe(event => {
        const sboSport: boolean = (this.sportsProviderCatId && event?.data?.type === 'click') || false;
        const fbSport: boolean = (this.sportsProviderCatId && event?.data?.relogin) || false;
        if (sboSport || fbSport) {
          this.appService.jumpToLogin();
        }
      });
  }

  onSelectPlayCoin(coin: string) {
    this.selectedPlayCoin = coin;
    this.reset();
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
          this.loading = true;
          const walletList = await this.userAssetsService.getWalletList();
          this.loading = false;
          this.transferGameWalletInfo = walletList.find(x => x.providerId === this.providerId.split('-')[0]);
          //找不到匹配的钱包，暂按维护中处理
          if (!this.transferGameWalletInfo) this.maintenance = true;
          this.playGame();
        }
      });
  }

  /**重置 */
  reset() {
    this.clearWatch();
    this.url = '';
    this.showCoinList = false;
    this.playMode = this.logined;
  }

  /**获取游戏连接 */
  getGameLink() {
    if (this.loading) return;
    this.loading = true;

    const params: PlayGameParams = {
      providerCatId: this.providerId,
      gameId: this.gameId,
      currencyCode: this.currentCurrency,
      gameCurrencyCode: this.selectedPlayCoin,
      playMode: this.playMode ? 'Normal' : 'Try',
      siteType: this.layout.isMobile$.value ? 'Mobile' : 'PC',
      showMode: this.appService.themeSwitch$?.value === 'moon' ? 'Night' : 'Day',
    };

    //提前准备好窗口
    if (this.gameRule === 'newwindow') {
      this.clearWin();
      this.buildWin();
    }
    this.gameApi.getPlayGameUrl(params).subscribe(res => {
      this.loading = false;
      if (res?.data?.playGameUrl) {
        this.startByRule(res.data.playGameUrl);
      } else {
        this.clearWin(true);
        this.toast.show({
          type: 'fail',
          message: this.localeService.getValue('gam_conn_err'),
        });
        this.sentryService.error('GameError', 'Full Play Game Url Error', {
          extra: { params: params, response: res },
          level: 'warning',
        });
      }
    });
  }

  /**开始加载游戏 */
  startByRule(e: string) {
    const url = e + this.extraParams;
    switch (this.gameRule) {
      case 'iframe':
        this.url = url;
        break;
      case 'newwindow':
        this.buildWin();
        this.gameWin && (this.gameWin.location.href = url);
        break;
      case 'system':
        // @ts-ignore
        window.cordova.InAppBrowser.open(url, '_system');
        break;
      default:
        break;
    }
  }

  /**创建新游戏窗口的检测（只对最后打开的窗口有效） */
  buildWin() {
    this.clearWatch();
    if (!this.gameWin) {
      const name = 'fullPlayWindow-' + this.providerId;
      this.gameWin = window.open('', name);
    }
    if (this.gameWin) {
      this.watcher = timer(0, 500)
        .pipe(
          map(() => this.gameWin),
          untilDestroyed(this),
        )
        .subscribe(x => {
          if (!x || x.closed) {
            this.clearWin();
            this.clearWatch();
          }
        });
    }
  }

  /**清除游戏窗口检测 */
  clearWatch() {
    this.watcher?.unsubscribe();
    this.watcher = undefined;
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

  ngOnDestroy() {
    this.appService.turnShowPalying('full-play', false);
  }

  switchCurrency() {
    this.popup.open(SportsCurrencyPopupComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'sport-currency-dialog-container',
      data: {
        currency: this.sportsProviderCurrencies || [],
        selectedPlayCoin: this.selectedPlayCoin,
        currencyRatio: this.provider?.currencyRatio || [],
        callback: (currency: string) => {
          this.isPopupSelectedCoin = true;
          this.onSelectPlayCoin(currency);
          this.playGame();
        },
      },
    });
  }
}
