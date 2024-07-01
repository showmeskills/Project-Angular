import { Injectable, Injector, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import moment from 'moment';
import { BehaviorSubject, Observable, Subscription, map, shareReplay, timer } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { CurrencyWalletService } from 'src/app/layouts/currency-wallet/currency-wallet.service';
import { ActivityApi } from 'src/app/shared/apis/activity.api';
import { FreeJackpotApi } from 'src/app/shared/apis/free-jackpot.api';
import {
  NewUserActivity,
  TournamentList,
  TournamentSignalR,
  WheelInfo,
} from 'src/app/shared/interfaces/activity.interface';
import { RecentActivity } from 'src/app/shared/interfaces/free-jackpot.interface';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { cacheValue } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { UserAssetsService } from '../user-asset/user-assets.service';
import { TournamentPopupComponent } from './tournament/tournament-popup/tournament-popup.component';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  constructor(
    private appService: AppService,
    private popup: PopupService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private activityApi: ActivityApi,
    private layout: LayoutService,
    private injector: Injector,
    private userAssetsService: UserAssetsService,
    private currencyWalletService: CurrencyWalletService,
    private freeJackpotApi: FreeJackpotApi,
  ) {}

  isH5 = toSignal(this.layout.isH5$);

  /**竞赛弹窗面板 */
  tournamentRankPanel$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /** 竞赛排行榜订阅 */
  private tournamentList$: { [key: string]: Observable<TournamentList> } = {};

  /** 收集 竞赛leader board  数据  */
  collectLeaderBoard: Array<TournamentSignalR> = [];
  collectCurrentUser: Array<TournamentSignalR> = [];
  tournamentTimeStamp: number = moment().valueOf();

  private wheelInfo$: { [key: string]: Observable<ResponseData<WheelInfo>> } = {};
  private freeGuess$: { [key: string]: Observable<ResponseData<RecentActivity>> } = {};

  /**大转盘打开状态 */
  openWheeled!: boolean;
  /**打开大转盘 */
  openWheel() {
    this.openWheeled = true;
    import('src/app/pages/activity/wheel/wheel.component').then(({ WheelComponent }) => {
      const popup = this.popup.open(WheelComponent, { disableClose: true, panelClass: 'wheel-activity-popup' });
      popup.afterOpened().subscribe(() => {
        this.appService.turnShowPalying('wheel', true);
      });
      popup.afterClosed().subscribe(() => {
        this.appService.turnShowPalying('wheel', false);
        this.router.navigate([], { replaceUrl: true });
        this.openWheeled = false;
      });
    });
  }

  getturntableinformation(value: string = 'wheelInfo') {
    const bufferValue = window.btoa(JSON.stringify(value));
    return (
      this.wheelInfo$[bufferValue] ??
      ((this.wheelInfo$[bufferValue] = this.activityApi.getturntableinformation().pipe(
        cacheValue(1200 * 60 * 10),
        map(x => x && this.newObj(x)),
        shareReplay(1),
      )),
      this.wheelInfo$[bufferValue])
    );
  }

  getRecentActivity(value: string = 'freeGuess') {
    const bufferValue = window.btoa(JSON.stringify(value));
    return (
      this.freeGuess$[bufferValue] ??
      ((this.freeGuess$[bufferValue] = this.freeJackpotApi.getRecentActivity().pipe(
        cacheValue(1200 * 60 * 10),
        map(x => x && this.newObj(x)),
      )),
      this.freeGuess$[bufferValue])
    );
  }

  /**新人红利列表 */
  regBonusList: NewUserActivity[] = [];
  /**检查是否有新人红利，如果有就弹出供选择 */
  checkRegBonus() {
    if (!this.localStorageService.loginToken) return;
    // 静默获取红利
    this.activityApi.getnewuseractivityapply().subscribe(res => {
      if (res?.data && res.data.length > 1) {
        this.regBonusList = res.data;
        import('src/app/pages/activity/new-user-prize/new-user-prize.component').then(({ NewUserPrizeComponent }) => {
          this.popup.open(NewUserPrizeComponent, {
            disableClose: true,
          });
        });
      }
    });
  }

  page = toSignal<string>(this.layout.page$, { injector: this.injector, requireSync: true });
  noPop = computed(() => ['login', 'register', 'password'].includes(this.page()));
  timer$?: Subscription;

  checkToOpenWheel(delay: number, run: boolean = false) {
    this.getturntableinformation().subscribe(wheel => {
      if (wheel?.data) {
        this.timer$?.unsubscribe();
        if (this.openWheeled || this.localStorageService.wheelShown) return;
        if (this.noPop()) {
          this.timer$ = toObservable(this.noPop, { injector: this.injector }).subscribe(v => {
            if (!v) this.checkToOpenWheel(delay);
          });
        } else if (run) {
          this.openWheel();
        } else {
          this.timer$ = timer(delay).subscribe(() => {
            this.timer$?.unsubscribe();
            this.checkToOpenWheel(delay, true);
          });
        }
      }
    });
  }

  /**
   * 返回 兑换的当前默认币种
   *
   * @param currency 接口返回币种
   * @param amount 接口返回金额
   * @param normal 正常 转换 默认为 false 用于 tournament
   * @returns
   */
  tournamentCurrencyExchange(amount: number = 0, currency: string, normal: boolean = false): string {
    const currentCurrency = this.appService.currentCurrency$.value;
    const cryptoRates = this.userAssetsService.allRate.value?.rates;
    const defaultToFiatRates = this.currencyWalletService.defaultToFiat$.value?.rates;

    // 默认币种和返回币种相同
    if (currentCurrency?.currency === currency) return normal ? String(amount) : String(this.processAmount(amount));

    // 当前币种 为虚拟货币 baseCurrency USDT
    if (currentCurrency?.isDigital) {
      const rate = cryptoRates?.find((rate: { currency: string; rate: number }) => rate?.currency === currency)?.rate;
      const returnAmount = Number(amount).subtract(rate || 0);
      return normal ? String(returnAmount) : String(this.processAmount(returnAmount));
    }

    // 当默认币种为法币时
    const fiatRate = defaultToFiatRates?.find(rate => rate.currency === currency)?.rate;
    const returnFiatAmount = Number(amount).subtract(fiatRate || 0);

    return normal ? String(returnFiatAmount) : String(this.processAmount(returnFiatAmount));
  }

  /**
   * tournament 金额显示 处理
   * 拿接口 数据金额 先做汇率换算 默认币种，然后格式化，最后相加
   *
   * @param amount
   * @returns
   */
  processAmount(amount: number): number {
    return Number(amount || 0) > 1
      ? Number(String(amount || 0).split('.')[0])
      : Number(Number(amount || 0).toFixed(2)) > 0.01
        ? Number(Number(amount || 0).toFixed(2))
        : 0;
  }

  /**
   * tournament 计算 时间
   *
   * @param firstTime 第一个时间 开始/结束
   * @param secondTime 当前
   * @returns
   */
  calcUtcToLocalTime(firstTime: number, secondTime: number): number {
    return Number(
      moment
        .utc(Number(firstTime || 0))
        .local()
        .valueOf(),
    ).minus(
      moment
        .utc(Number(secondTime || 0))
        .local()
        .valueOf(),
    );
  }

  /**
   * 打开 活动 排名弹窗 for H5
   *
   * @param gameTypeDto
   * @param gameTypeDto.gameCategory
   * @param gameTypeDto.gameCode
   * @param gameTypeDto.gameProvider
   */
  openTournamentPopup(gameTypeDto: { gameCategory: string; gameCode: string; gameProvider: string }) {
    this.popup.open(TournamentPopupComponent, {
      speed: 'faster',
      autoFocus: false,
      inAnimation: !this.isH5() ? 'fadeInRight' : undefined,
      outAnimation: !this.isH5() ? 'fadeOutRight' : undefined,
      position: !this.isH5() ? { right: '30px' } : undefined,
      data: {
        gameTypeDto,
      },
    });
  }

  /**
   * 转换新竞赛推送数据
   *
   * @param tournamentSignalData
   * @returns
   */
  singlRTournamentData(tournamentSignalData: TournamentSignalR) {
    return {
      prizeId: tournamentSignalData?.PrizeId,
      rankNumber: tournamentSignalData?.RankNumber,
      rankScore: tournamentSignalData?.RankScore,
      tenantWinOrLost: tournamentSignalData?.TenantWinOrLost,
      userName: tournamentSignalData?.UserName,
      uidActiveFlow: tournamentSignalData?.UidActiveFlow,
      uidBetMoney: tournamentSignalData?.UidBetMoney,
      uidWinOrLost: tournamentSignalData?.UidWinOrLost,
      amount: tournamentSignalData?.Amount || 0,
      currency: tournamentSignalData?.Currency || 'USDT',
      prizeType: tournamentSignalData?.PrizeType,
      prizeFullName: tournamentSignalData?.PrizeFullName,
      prizeShortName: tournamentSignalData?.PrizeShortName,
      uid: tournamentSignalData?.Uid || '',
    };
  }

  /**
   * 请求标签
   *
   * @param value
   * @returns
   */
  getTournamentList(value: string = 'tournament') {
    const bufferValue = window.btoa(JSON.stringify(value));
    return (
      this.tournamentList$[bufferValue] ??
      ((this.tournamentList$[bufferValue] = this.activityApi
        .getTournamentList({
          startDto: {
            current: 1,
            orderDirection: 'desc',
            size: 999,
          },
          endDto: {
            current: 1,
            orderDirection: 'desc',
            size: 6,
          },
          preDto: {
            current: 1,
            orderDirection: 'desc',
            size: 4,
          },
        })
        .pipe(
          map(data => (data && this.newObj(data)) || {}),
          cacheValue(1000 * 60 * 10),
        )),
      this.tournamentList$[bufferValue])
    );
  }

  private newObj(v: unknown) {
    return JSON.parse(JSON.stringify(v));
  }
}
