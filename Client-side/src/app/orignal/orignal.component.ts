import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { GameApi } from 'src/app/shared/apis/game.api';
import { AppService } from '../app.service';
import { GameListItem, PlayGameParams } from '../shared/interfaces/game.interface';
import { OrignalService } from './orignal.service';
import { DiceApi } from './shared/apis/dice.api';
import { ResourceApi } from './shared/apis/resource.api';
import { UserApi } from './shared/apis/user.api';
import { BetService } from './shared/services/bet.service';
import { LocaleService } from './shared/services/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-orignal',
  templateUrl: './orignal.component.html',
  styleUrls: ['./orignal.component.scss'],
})
export class OrignalComponent implements OnInit, OnDestroy {
  constructor(
    private localeService: LocaleService,
    private appService: AppService,
    private betService: BetService,
    protected orignalService: OrignalService,
    private userApi: UserApi,
    private gameApi: GameApi,
    private diceApi: DiceApi,
    private resourceApi: ResourceApi,
  ) {
    // if (environment.isOnline) {

    // }
    // 平台登录后自动登录原创 预留

    this.orignalService.refreshUserBanlance$.pipe(untilDestroyed(this)).subscribe(v => {
      // this.updateBanlance();
    });
  }

  gameInfo!: GameListItem; //游戏详情
  /** 是否已经初始化完成 */
  isReady: boolean = false;
  /** 错误提示 */
  isToastShow: boolean = false;
  /** 错误文字 */
  toastContent: string = '';
  /** 消息定时器 */
  tipTimer: any;
  orignalUrlParma: PlayGameParams = {
    gameId: '',
    currencyCode: 'USDT',
    gameCurrencyCode: 'CNY',
    playMode: 'Normal',
    siteType: 'PC',
    providerCatId: 'GBGame-3',
    showMode: 'Day',
  };
  ngOnInit(): void {
    this.resourceApi
      .getLocale(this.appService.languageCode)
      .pipe(untilDestroyed(this))
      .subscribe(data => {
        if (data) {
          this.localeService.setLocaleData(data);
          this.isReady = true;
        }
      });

    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) {
        this.orignalService.currentCurrencyData = v;
        this.orignalService.isDigital = v?.isDigital;
      }
    });
    combineLatest([
      this.appService.userInfo$.pipe(map(v => !!v)),
      this.orignalService.gameName$,
      this.appService.currentCurrency$.pipe(
        map(v => v?.currency),
        distinctUntilChanged(),
      ),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(async ([platformLogined, gameNme, topCurrency]) => {
        if (platformLogined && gameNme && topCurrency) {
          //使用顶部钱包币种（currencyCode） 和 默认体育币种（gameCurrencyCode）登录
          this.orignalUrlParma.gameId = gameNme;
          this.orignalLogin(topCurrency, topCurrency);
        } else {
          this.orignalService.orignalLoginReady$.next(false);
        }
      });
    this.orignalService.gameName$.pipe(untilDestroyed(this)).subscribe(gameId => {
      this.gameApi
        .getGameInfo(gameId, this.orignalUrlParma.providerCatId)
        .pipe(untilDestroyed(this))
        .subscribe(gameInfo => {
          if (gameInfo?.data) {
            this.gameInfo = gameInfo.data;
          }
        });
    });

    this.orignalService.showToast$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        if (data.close) {
          this.isToastShow = false;
          return;
        }
        this.isToastShow = true;
        this.toastContent = data.content;
        if (this.tipTimer) clearTimeout(this.tipTimer);
        this.tipTimer = setTimeout(() => {
          this.isToastShow = false;
        }, 2000);
      }
    });

    // 重复登录弹出框订阅
    this.appService.logoutShowTip$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.orignalService.token = '';

        this.orignalService.orignalLoginReady$.next(null);
      }
    });
  }

  ngOnDestroy(): void {
    this.orignalService.token = '';
    this.orignalService.orignalLoginReady$.next(null);
    this.appService.originalAutoBet$.next(false);
  }

  orignalLogin(currencyCode: string, gameCurrencyCode: string) {
    this.gameApi
      .getPlayGameUrl({
        ...this.orignalUrlParma,
        currencyCode,
        gameCurrencyCode,
      })
      .subscribe(async res => {
        if (res?.data?.token) {
          console.log('【原创登录信息】token OK', res.data.token);
          //token赋值
          // const params = new URL(res.data.data.playGameUrl).searchParams;
          this.orignalService.token = res.data.token;
          //登录signalR
          //通知登录完毕
          const limit: any = await this.diceApi.getBetLimit(this.orignalUrlParma.gameId);
          console.log(limit);
          if (limit.code == 0) {
            this.betService.limitList$.next(limit.data);
            this.orignalService.orignalLoginReady$.next(true);
          }
          // this.updateBanlance(true)
        }
      });
  }

  async updateBanlance(isInit?: boolean) {
    // 接口不要放在service 里面，会导致token 获取不到
    // console.log()
    const res = await this.userApi.getUser();
    const balance = res.data.amounts;
    this.orignalService.userBalance$.next({ balance: balance, isInit });
  }
}
