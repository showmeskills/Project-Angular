import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom, timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CurrencyBalance } from 'src/app/shared/interfaces/wallet.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { BlackjackApi } from '../../shared/apis/blackjack.api';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { WsService } from '../../shared/services/ws.service';
import { HiloService } from '../hilo/hilo.service';

@UntilDestroy()
@Component({
  selector: 'orignal-blackjack',
  templateUrl: './blackjack.component.html',
  styleUrls: ['./blackjack.component.scss'],
})
export class BlackjackComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private blackjackApi: BlackjackApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private currencyValuePipe: CurrencyValuePipe,
    private cacheService: CacheService,
    private layout: LayoutService,
    private nativeAppService: NativeAppService,
    private hiloService: HiloService
  ) {
    this.appService.currentCurrency$.pipe(distinctUntilChanged(), untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.currentCurrencyData = x;
        this.isDigital = x.isDigital;
      }
    });
    this.appService.themeSwitch$.subscribe(v => {
      this.theme = v;
    });
    this.orignalService.gameName$.next(this.route.snapshot.data.name);
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });
  }

  @ViewChild('dealer') dealerElement!: ElementRef;
  @ViewChild('leftCardsGroup') leftCardsElement!: ElementRef;
  @ViewChild('rghitCardsGroup') rghitCardsElement!: ElementRef;
  /** 是否为数字货币 */
  isDigital: boolean = false;
  isH5!: boolean;
  theme: string = '';
  /** 公平性验证的numberid和pubkey */
  fairnessData: any;
  /** 是否开启快速投注 */
  isFastBet!: boolean;
  /** 是否开启动画 */
  isAnimation!: boolean;
  /** 是否开启热键 */
  isHotkey!: boolean;
  /** 键盘操作 */
  operate: any = { value: '', item: '' };
  /**投注类型 */
  betType = 'blackjack';
  /** 心跳定时器 */
  heartbeat: any = null;

  /** 当前选择币种信息 */
  currentCurrencyData!: CurrenciesInterface;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 兑换倍数*/
  rate!: number;

  /** 投注中 */
  loading!: boolean;
  /** 按钮loading */
  HSSDloading!: boolean;
  /** 开奖结果*/
  winloseData: any = {};

  /** 左边翻牌 */
  playerCards: any = [];
  /** 庄翻牌 */
  bankerCards: any = [];
  playerResult: Array<string> = [];
  bankerResult: string = '';
  /** 赢钱弹出框金额 */
  winMoney: string = '';
  /** 是否显示投注胜利后的倍数提示框 */
  isShowWinTip = false;
  /** 投注金额 */
  money: number = 0;
  allCurrencyBalance: CurrencyBalance[] = [];
  /** 闲家牌 因为可以分牌，所以需要使用数组 */
  playerAllCards: {
    active: boolean;
    wintype: number; //2为赢 1为输  3为平
    crads: {
      index: number;
      num: string;
      color: string;
      cnColor: string;
      higher: string;
      lower: string;
      left: number;
      top: number;
      mleft: number;
      mtop: number;
      active: boolean;
    }[];
  }[] = [];
  /** 闲家牌默认使用第0项 */
  playerIndex: number = 0;
  playerValue = [14, 21];
  bankerValue = [12, 42];
  clientHeight: number = 0;
  clientWidth: number = 0;
  isButton: Array<number> = []; //保险 - 0 分牌 - 1 加牌 - 2 加倍 - 3 停牌 - 4
  issplit: boolean = false;
  /** 是否登录 */
  isLogin: boolean = false;
  winLossList: Array<number> = [];
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.isLogin = x ? true : false;
      this.ws?.destory();
      this.betService.isChangeActive$.next(false);
      this.betService.minesBetstate$.next({ betting: false });
      this.loading = false;
      this.isBet = false;
      this.clear();
      if (x) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/blackjack/open?token=${this.orignalService.token}`);
      }
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    this.betService.inputMoney$.pipe(untilDestroyed(this)).subscribe(j => {
      const money = Number(j);
      if (money) {
        this.money = money;
      }
    });
    this.iconService.init('baccarat');
    this.isAnimation = this.cacheService.animation;

    let isFastKey = false;
    let count = 0;

    // 禁止空格键页面下滑s
    document.body.onkeydown = (e: any): any => {
      count++;
      if (e.keyCode === 91) {
        isFastKey = true;
      }
      if (e.keyCode === 32) {
        e.preventDefault();
      }
    };

    // 添加键盘监听
    document.onkeyup = e => {
      count--;
      if (isFastKey) return;
      if (count === 0) {
        isFastKey = false;
      }

      if (this.isHotkey) {
        console.log('======', e.keyCode);
        switch (e.keyCode) {
          // space-下注
          case 32:
            this.operate = { value: 'bet' };
            this.iconService.balanceAudioPlay();
            break;
          //a-最小赌注
          case 65:
            this.operate = { value: 'min' };
            this.iconService.balanceAudioPlay();
            break;
          //s-减半
          case 83:
            this.operate = { value: 'half' };
            this.iconService.balanceAudioPlay();
            break;
          //d-加倍
          case 68:
            this.operate = { value: 'double' };
            this.iconService.balanceAudioPlay();
            break;
          //q-叫牌
          case 81:
            this.onHitCard();
            this.iconService.balanceAudioPlay();
            break;
          //w-停叫
          case 87:
            this.onStandCard();
            this.iconService.balanceAudioPlay();
            break;
          //e-分牌
          case 69:
            this.onSplitCard();
            this.iconService.balanceAudioPlay();
            break;
          //r-加倍
          case 82:
            this.onDoubleCard();
            this.iconService.balanceAudioPlay();
            break;
          default:
            break;
        }
      }
    };
    setTimeout(() => {
      const leftCardsElement = this.leftCardsElement.nativeElement as HTMLElement;
      this.clientWidth = leftCardsElement.clientWidth;
      this.clientHeight = leftCardsElement.clientHeight;
    }, 0);
  }

  /**
   * @param msg
   * @param data
   * @description 接收消息
   */
  onmessage(data: any) {
    if (data.code != 0) {
      this.toast.show({ message: `${this.localeService.getValue(data.tKey)}!`, type: 'fail' });
      this.loading = false;
      this.isBet = false;
      this.betService.minesBetstate$.next({ betting: false });
      this.clear();
      this.ws.sendMessage({ action: 'actionPublicKeyApi' });
    }
    if (data.code == 0) {
      // eslint-disable-next-line default-case
      switch (data.action) {
        case 'JoinRoom':
          this.ws.sendMessage({ action: 'actionCurrentApi' });
          clearInterval(this.heartbeat);
          this.heartbeat = setInterval(() => {
            this.ws.sendMessage({ action: 'type' });
          }, 15000);
          break;
        case 'actionPublicKeyApi':
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.isBet = true;
          this.loading = false;
          this.betService.isChangeActive$.next(true);
          break;
        case 'actionBetApi':
          console.log(this.isButton);
          this.orignalService.chartMessage$.next({ gameId: 'blackjack', amount: data.data.betAmount, type: 'bet' });
          this.playerValue = data.data.playerIndexArray[0].split(',').map((str: string) => Number(str) % 52);
          this.bankerValue = data.data.bankerIndex.split(',').map((str: string) => Number(str) % 52);
          if (!data.data?.activeResult) {
            this.bankerValue.push(1);
          }
          this.initAnimateCard(data);
          this.allCurrencyBalance = this.appService.userBalance$.value || [];
          const item = this.allCurrencyBalance.find(
            balanceItem => balanceItem.currency === this.currentCurrencyData.currency
          );
          console.log(item);
          if (item) {
            // 余额更新
            item.nonStickyBalance = item.nonStickyBalance.minus(data.data.betAmount);
            this.appService.userBalance$.next([...this.allCurrencyBalance]);
            if (this.appService.isNativeApp) {
              this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item.nonStickyBalance);
            }
          }
          break;
        case 'actionCurrentApi':
          //  查询正在游戏中的注单
          if (data.data.currentFlag) {
            this.orignalService.chartMessage$.next({ gameId: 'blackjack', amount: data.data.betAmount, type: 'bet' });
            this.setCurrentBet(data.data);
          } else {
            this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          }
          break;
        case 'actionStandApi':
          //   停牌
          if ((this.issplit && this.playerIndex == 1) || !this.issplit) {
            this.standAnimateCard(data);
          } else {
            this.playerIndex = 1;
            this.playerAllCards[0].active = false;
            if (this.playerAllCards.length > 1) {
              this.playerAllCards[1].active = true;
            }
            this.isButton = [2, 3, 4];
          }
          this.winLossList = data.data.winLossList;
          break;
        case 'actionInsuranceApi':
          // activeResult 0继续 1庄赢 2闲赢 3平局
          if (data.data?.activeResult) {
            this.standAnimateCard(data);
          } else {
            this.isButton = data.data.button.split(',').map((str: string) => Number(str));
          }
          //   保险
          if (data.data.addAmount) {
            this.orignalService.chartMessage$.next({ gameId: 'blackjack', amount: data.data.addAmount, type: 'bet' });
            this.allCurrencyBalance = this.appService.userBalance$.value || [];
            const item2 = this.allCurrencyBalance.find(
              balanceItem => balanceItem.currency === this.currentCurrencyData.currency
            );
            if (item2) {
              // 余额更新
              item2.nonStickyBalance = item2.nonStickyBalance.minus(data.data.addAmount);
              this.appService.userBalance$.next([...this.allCurrencyBalance]);
              if (this.appService.isNativeApp) {
                this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item2.nonStickyBalance);
              }
            }
          }
          break;
        case 'actionHitApi':
          this.hitAnimateCard(data);
          //   叫牌
          break;
        case 'actionSplitApi':
          if (data.data.addAmount) {
            this.orignalService.chartMessage$.next({ gameId: 'blackjack', amount: data.data.addAmount, type: 'bet' });
            this.allCurrencyBalance = this.appService.userBalance$.value || [];
            const item3 = this.allCurrencyBalance.find(
              balanceItem => balanceItem.currency === this.currentCurrencyData.currency
            );
            if (item3) {
              // 余额更新
              item3.nonStickyBalance = item3.nonStickyBalance.minus(data.data.addAmount);
              this.appService.userBalance$.next([...this.allCurrencyBalance]);
              if (this.appService.isNativeApp) {
                this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item3.nonStickyBalance);
              }
            }
          }
          this.issplit = true;
          this.splitAnimateCard(data);
          //   分牌
          break;
        case 'actionDoubleApi':
          this.allCurrencyBalance = this.appService.userBalance$.value || [];
          const item1 = this.allCurrencyBalance.find(
            balanceItem => balanceItem.currency === this.currentCurrencyData.currency
          );
          this.orignalService.chartMessage$.next({ gameId: 'blackjack', amount: data.data.addAmount, type: 'bet' });
          if (item1) {
            // 余额更新
            item1.nonStickyBalance = item1.nonStickyBalance.minus(data.data.addAmount);
            this.appService.userBalance$.next([...this.allCurrencyBalance]);
            if (this.appService.isNativeApp) {
              this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item1.nonStickyBalance);
            }
          }
          this.playerIndex = data.data.index;
          this.doubleAnimateCard(data);

          //   翻倍
          break;
      }
    }
  }
  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    clearInterval(this.heartbeat);
    this.appService.assetChangesLock$.next(false);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(false);
    }
    if (this.isLogin) {
      this.appService.assetChanges$.next({ related: 'Wallet' });
    }
  }
  /**
   * @param event
   * @description 手动投注
   */
  toBet(event: Event) {
    if (this.loading || !this.isBet) return;
    this.isBet = false;
    this.loading = true;
    this.clear();
    this.betService.minesBetstate$.next({ betting: true });
    this.iconService.balanceAudioPlay();
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    this.appService.assetChangesLock$.next(true);
    this.ws.sendMessage({
      action: 'actionBetApi',
      data: {
        betAmount: Number(event),
        numberId: this.fairnessData.numberId,
        currency: this.currentCurrencyData.currency,
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    });
  }
  /**
   * 获取当前用户未结算注单信息
   *
   * @param data
   */
  async setCurrentBet(data: any) {
    const leftCardsElement = this.leftCardsElement.nativeElement as HTMLElement;
    this.clientWidth = leftCardsElement.clientWidth;
    this.clientHeight = leftCardsElement.clientHeight;
    this.money = data.betAmount;
    this.betService.minesBetstate$.next({ betting: true, money: data.betAmount });
    console.log(data);
    this.loading = true;
    this.playerIndex = data.splitStatus ?? 0;
    this.isButton = data.button.split(',').map((str: string) => Number(str));
    /** 右边翻牌 */
    data.bankerIndex = data.bankerIndex + ',1';
    const bankerCards: any = data.bankerIndex.split(',').map((str: string) => {
      const item = this.hiloService.CARD_DATA.find(y => y.index === Number(str) % 52);
      return JSON.parse(JSON.stringify(item));
    });
    const playerCards: any = data.playerIndexArray.map((ax: string) => {
      return ax.split(',').map((str: string) => {
        const item = this.hiloService.CARD_DATA.find(y => y.index === Number(str) % 52);
        return JSON.parse(JSON.stringify(item));
      });
    });

    bankerCards.forEach((e: any, i: number) => {
      e.left = 0;
      e.top = 0;
      e.mleft = (this.clientWidth / 2.8) * i;
      if (i == 0) {
        e.mtop = 0;
        e.active = true;
      } else {
        e.active = false;
        e.mtop = -(this.clientHeight / 1.16);
      }
    });
    playerCards.forEach((j: any) => {
      j.forEach((e: any, i: number) => {
        e.active = true;
        e.left = 0;
        e.top = 0;
        e.mleft = (this.clientWidth / 2.8) * i;
        if (i == 0) {
          e.mtop = 0;
        } else {
          e.mtop = -(this.clientHeight / 1.16);
        }
      });
    });
    this.bankerCards = JSON.parse(JSON.stringify(bankerCards));
    console.log(playerCards);
    this.playerAllCards[0] = { active: false, wintype: 0, crads: [] };
    this.playerAllCards[0].crads = JSON.parse(JSON.stringify(playerCards[0]));
    if (playerCards.length > 1) {
      this.issplit = true;
      this.playerAllCards[1] = { active: false, wintype: 0, crads: [] };
      this.playerAllCards[1].crads = JSON.parse(JSON.stringify(playerCards[1]));
      this.playerAllCards[this.playerIndex].active = true;
    }
    this.bankerResult = data.bankerResult;
    this.playerResult = data.playerResult;
  }
  /**
   * 动画播放
   *
   * @param data
   */
  onAnimation(data: any) {}
  /**
   * 清空页面动画状态
   */
  clear() {
    this.isButton = [];
    this.betService.minesBetstate$.next({ betting: false });
    this.winLossList = [];
    this.playerAllCards = [];
    this.bankerCards = [];
    this.playerResult = [];
    this.playerValue = [];
    this.bankerValue = [];
    this.playerIndex = 0;
    this.bankerResult = '';
    this.issplit = false;
  }
  // eslint-disable-next-line jsdoc/require-returns
  /**
   * @param num
   *  @description  科学计算替换
   */
  toNonExponential(num: string) {
    const m: any = Number(num)
      .toExponential()
      .match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return Number(num).toFixed(Math.max(0, (m[1] || '').length - m[2]));
  }

  /**
   * 隐藏倍数右侧详情
   */
  closePop() {}

  // 翻牌结果计算
  result(num: string) {
    if (num == 'A') {
      return 1;
    } else if (num == 'J' || num == 'Q' || num == 'K') {
      return 10;
    } else {
      return Number(num);
    }
  }

  // 赢钱弹出框
  timeTip: any;
  showWinTip() {
    this.isShowWinTip = true;
    if (this.timeTip) clearTimeout(this.timeTip);
    this.timeTip = setTimeout(() => {
      this.isShowWinTip = false;
    }, 2000);
  }

  /**
   * 初始发牌
   * 开始发牌动画，
   * 玩家先配发一张牌并翻开，
   * 庄家发给自己一张并翻开，
   * 玩家再发放一张牌并翻开，
   * 庄家再发给自己一张牌，不翻开
   *
   * @param data
   */
  async initAnimateCard(data: any) {
    // const playerValue = [14, 21];
    // const bankerValue = [12, 42];
    const playerCards: any = this.playerValue.map((x: number) => {
      const item = this.hiloService.CARD_DATA.find(y => y.index === x);
      return JSON.parse(JSON.stringify(item));
    });
    /** 右边翻牌 */
    const bankerCards: any = this.bankerValue.map((x: number) => {
      const item = this.hiloService.CARD_DATA.find(y => y.index === x);
      return JSON.parse(JSON.stringify(item));
    });

    const dealerElement = this.dealerElement.nativeElement as HTMLElement;
    const leftCardsElement = this.leftCardsElement.nativeElement as HTMLElement;
    this.bankerCards = [];
    this.playerAllCards = [];
    await firstValueFrom(timer(0));
    //要提前渲染位置 因为获取cards-group 元素的offsetLeft clientWidth,因为盒子的宽会根据牌数改变
    bankerCards.forEach((e: any, i: number) => {
      e.active = false;
      if (!this.isFastBet) {
        e.left = 1000;
        e.top = -1000;
      }
      e.mleft = (this.clientWidth / 2.8) * i;
      if (i == 0) {
        e.mtop = 0;
      } else {
        e.mtop = -(this.clientHeight / 1.16);
      }
    });
    playerCards.forEach((e: any, i: number) => {
      e.active = false;
      if (!this.isFastBet) {
        e.left = 1000;
        e.top = -1000;
      }
      e.mleft = (this.clientWidth / 2.8) * i;
      if (i == 0) {
        e.mtop = 0;
      } else {
        e.mtop = -(this.clientHeight / 1.16);
      }
    });

    // this.playerResult = '0';
    // this.bankerResult = '0';
    // this.playerCards.push(...JSON.parse(JSON.stringify(playerCards)))
    this.playerAllCards[this.playerIndex] = { active: false, wintype: 0, crads: [] };
    this.playerAllCards[this.playerIndex].crads = JSON.parse(JSON.stringify(playerCards));
    this.bankerCards = JSON.parse(JSON.stringify(bankerCards));

    await firstValueFrom(timer(0));
    const rghitCardsElement = this.rghitCardsElement.nativeElement as HTMLElement;
    const playerElement = rghitCardsElement.children[this.playerIndex] as HTMLElement;
    bankerCards.forEach((e: any, i: number) => {
      if (!this.isFastBet) {
        if (i == 0) {
          e.left = dealerElement.offsetLeft - leftCardsElement.offsetLeft;
          e.top = -(dealerElement.clientHeight + leftCardsElement.offsetTop);
        } else {
          e.left = dealerElement.offsetLeft - leftCardsElement.offsetLeft - leftCardsElement.clientWidth / 2.8;
          e.top = -(dealerElement.clientHeight + leftCardsElement.offsetTop + leftCardsElement.clientHeight / 1.16);
        }
      }
    });
    playerCards.forEach((e: any, i: number) => {
      if (!this.isFastBet) {
        if (i == 0) {
          e.left = dealerElement.offsetLeft - playerElement.offsetLeft;
          e.top = -(dealerElement.clientHeight + playerElement.offsetTop);
        } else {
          e.left = dealerElement.offsetLeft - playerElement.offsetLeft - playerElement.clientWidth / 2.8;
          e.top = -(dealerElement.clientHeight + playerElement.offsetTop + playerElement.clientHeight / 1.16);
        }
      }
    });
    // 再渲染一次
    this.bankerCards = JSON.parse(JSON.stringify(bankerCards));
    this.playerAllCards[this.playerIndex].crads = JSON.parse(JSON.stringify(playerCards));
    await firstValueFrom(timer(this.isFastBet ? 0 : 100));
    console.log(this.playerAllCards);
    // 执行发牌动画
    const crads = this.playerAllCards[this.playerIndex].crads;
    let cont = 0;
    const numberAnimate = async () => {
      if (crads[cont]) {
        const obj = crads[cont];
        obj.left = 0;
        obj.top = 0;
        this.iconService.baccaratStartAudioPlay();
        await firstValueFrom(timer(this.isFastBet ? 0 : 500));
        obj.active = true;

        this.playerResult[this.playerIndex] = (
          Number(this.playerResult[this.playerIndex] ?? 0) + this.result(obj.num)
        ).toString();
        // if (Number(this.playerResult) + this.result(obj.num) >= 10) {
        //   this.playerResult = (Number(this.playerResult) + this.result(obj.num) - 10).toString();
        // } else {
        //   this.playerResult = (Number(this.playerResult) + this.result(obj.num)).toString();
        // }
      }

      if (this.bankerCards[cont]) {
        const obj = this.bankerCards[cont];
        obj.left = 0;
        obj.top = 0;
        this.iconService.baccaratStartAudioPlay();
        await firstValueFrom(timer(this.isFastBet ? 0 : 500));

        obj.active = cont == 1 ? false : true;
        this.bankerResult = data.data.bankerResult;
        // if (cont == 0) {
        //   if (Number(this.bankerResult) + this.result(obj.num) >= 10) {
        //     this.bankerResult = (Number(this.bankerResult) + this.result(obj.num) - 10).toString();
        //   } else {
        //     this.bankerResult = (Number(this.bankerResult) + this.result(obj.num)).toString();
        //   }
        // }
      }

      cont++;
      if (!this.bankerCards[cont] && !this.playerCards[cont]) {
        console.log('-----结束-------');
        this.playerResult[this.playerIndex] = data.data.playerResult;

        if (data.data?.activeResult) {
          this.standAnimateCard(data);
        } else {
          this.isButton = data.data.button.split(',').map((str: string) => Number(str));
        }
        // this.ws.sendMessage({ action: 'actionPublicKeyApi' });
        return;
      }
      numberAnimate();
    };
    numberAnimate();
  }
  // 买保险
  onInsurance() {
    this.ws.sendMessage({
      action: 'actionInsuranceApi',
      data: {
        currency: this.currentCurrencyData.currency,
        status: 1,
      },
    });
    this.isButton = [];
  }
  // 不买保险
  onNotInsurance() {
    this.ws.sendMessage({
      action: 'actionInsuranceApi',
      data: {
        currency: this.currentCurrencyData.currency,
        status: 0,
      },
    });
    this.isButton = [];
  }
  onHitCard() {
    if (!this.isButton.includes(2)) return;
    this.ws.sendMessage({ action: 'actionHitApi' });
    this.isButton = [];
  }
  onStandCard() {
    if (!this.isButton.includes(4)) return;
    this.ws.sendMessage({ action: 'actionStandApi' });
    this.isButton = [];
  }

  onSplitCard() {
    if (!this.isButton.includes(1)) return;
    this.ws.sendMessage({ action: 'actionSplitApi' });
    this.isButton = [];
  }
  onDoubleCard() {
    if (!this.isButton.includes(3)) return;
    this.ws.sendMessage({ action: 'actionDoubleApi' });
    this.isButton = [];
  }
  /**
   * 闲家 叫牌 或者停牌 都需要加牌进去
   *
   * @param index
   * @param data
   */
  async AddAnimateCard(index: number, data: any = {}) {
    // 新增牌
    const playerCard: any = JSON.parse(JSON.stringify(this.hiloService.CARD_DATA.find(y => y.index === index)));
    const dealerElement = this.dealerElement.nativeElement as HTMLElement;
    if (!this.isFastBet) {
      playerCard.left = 1000;
      playerCard.top = -1000;
    }
    playerCard.mleft = (this.clientWidth / 2.8) * this.playerAllCards[this.playerIndex].crads.length;
    playerCard.mtop = -(this.clientHeight / 1.16);
    const crads = this.playerAllCards[this.playerIndex].crads;
    crads.push(playerCard);
    await firstValueFrom(timer(0));
    const rghitCardsElement = this.rghitCardsElement.nativeElement as HTMLElement;
    const playerElement = rghitCardsElement.children[this.playerIndex] as HTMLElement;
    if (!this.isFastBet) {
      crads[crads.length - 1].left =
        dealerElement.offsetLeft - playerElement.offsetLeft - playerElement.clientWidth / 2.8;
      crads[crads.length - 1].top = -(
        dealerElement.clientHeight +
        playerElement.offsetTop +
        playerElement.clientHeight / 1.16
      );
    }
    const obj = crads[crads.length - 1];
    obj.left = 0;
    obj.top = 0;
    this.iconService.baccaratStartAudioPlay();
    await firstValueFrom(timer(this.isFastBet ? 0 : 500));
    obj.active = true;
    // this.playerResult[this.playerIndex] = (
    //   Number((this.playerResult[this.playerIndex] ?? '0').split(',')[0]) + this.result(obj.num)
    // ).toString();
    this.playerResult[this.playerIndex] = data.data.playerResult[0];
    if (data.data.playerResult.length > 1) {
      this.playerResult[1] = data.data.playerResult[1];
    }
    if (data.data.button) {
      this.isButton = data.data.button.split(',').map((str: string) => Number(str));
    }
    this.playerIndex = data.data.index;
    if (this.issplit && this.playerIndex == 0 && data.data.splitIndex == 1) {
      console.log(22222);
      // 分牌后 叫牌的时候 如果第一首牌超过21点 需要转到第二手牌
      this.playerIndex = 1;
      this.playerAllCards[0].active = false;
      this.playerAllCards[1].active = true;
    }
  }
  /**
   * 闲家 叫牌
   * 如果玩家认为自己的牌面还不够接近21点，
   * 可以向庄家要一张或多张牌，
   * 直到手牌总点数达到或超过21点为止
   *
   * @param data
   */
  async hitAnimateCard(data: any) {
    // 分牌后 第一手牌点停牌 不会有任何操作
    // if (this.issplit && this.playerIndex == 0) return;
    this.playerIndex = data.data.index;
    await this.AddAnimateCard(Number(data.data.playerIndex[0]) % 52, data);
    console.log(111111);
    const activeResult = (data: any) => {
      if (data.data.activeResult) {
        if (data.data.bankerIndex) {
          this.standAnimateCard(data);
        } else {
          this.winLossList = data.data.winLossList;
          this.winOrloss(data);
        }
      }
    };
    // 判断是否有activeResult ，说明结算了，再判断是否爆掉，不发庄家牌，
    // 分牌第一手牌，如果未爆掉，可以继续发牌，如果爆掉，切换到第二手牌，第二手牌如果爆掉那就说明结算了，再判断是否爆掉，不发庄家牌
    if (this.issplit) {
      // 已分牌情况
      if (this.playerIndex == 0) {
        if (data.data.splitIndex == 1 && !data.data.activeResult) {
          // 说明右边爆掉了
          this.playerIndex = 1;
          this.playerAllCards[0].active = false;
          this.playerAllCards[1].active = true;
        } else {
          activeResult(data);
        }
      }
      if (this.playerIndex == 1) {
        activeResult(data);
      }
    } else {
      // 未分牌判断  判断是否有activeResult ，说明结算了，再判断是否爆掉，不发庄家牌，
      activeResult(data);
    }
  }
  /**
   * 停叫 开庄家牌
   * 如果玩家认为自己的牌面已经很接近21点，可以选择停止要牌
   * 停牌只发庄家 第二张牌翻开
   *
   * @param data
   */
  async standAnimateCard(data: any) {
    if (!data.data.bankerIndex) {
      this.winOrloss(data);
      return;
    }
    this.bankerValue = data.data.bankerIndex.split(',').map((str: string) => Number(str) % 52);
    console.log(this.bankerCards);

    const bankerCards: any = this.bankerValue.map((x: number) => {
      const item = this.hiloService.CARD_DATA.find(y => y.index === x);
      return JSON.parse(JSON.stringify(item));
    });

    const dealerElement = this.dealerElement.nativeElement as HTMLElement;
    const leftCardsElement = this.leftCardsElement.nativeElement as HTMLElement;
    bankerCards.forEach((e: any, i: number) => {
      if (i < 2) {
        e.active = true;
        if (i == 1) {
          e.active = false;
        }
        e.left = this.bankerCards[i].left;
        e.top = this.bankerCards[i].top;
        e.mleft = this.bankerCards[i].mleft;
        e.mtop = this.bankerCards[i].mtop;
      } else {
        e.active = false;
        if (!this.isFastBet) {
          e.left = 1000;
          e.top = -1000;
        }
        e.mleft = (this.clientWidth / 2.8) * i;
        e.mtop = -(this.clientHeight / 1.16);
      }
    });

    this.bankerCards = JSON.parse(JSON.stringify(bankerCards));
    console.log(this.bankerCards);
    await firstValueFrom(timer(0));
    bankerCards.forEach((e: any, i: number) => {
      if (!this.isFastBet) {
        if (i > 1) {
          e.left = dealerElement.offsetLeft - leftCardsElement.offsetLeft - leftCardsElement.clientWidth / 2.8;
          e.top = -(dealerElement.clientHeight + leftCardsElement.offsetTop + leftCardsElement.clientHeight / 1.16);
        }
      }
    });
    // 再渲染一次
    this.bankerCards = JSON.parse(JSON.stringify(bankerCards));
    await firstValueFrom(timer(100));
    let cont = 1;
    const numberAnimate = async () => {
      if (this.bankerCards[cont]) {
        const obj = this.bankerCards[cont];
        obj.left = 0;
        obj.top = 0;
        this.iconService.baccaratStartAudioPlay();
        await firstValueFrom(timer(this.isFastBet ? 0 : 500));
        obj.active = true;
        this.bankerResult = (Number(this.bankerResult.split(',')[0]) + this.result(obj.num)).toString();
      }

      cont++;
      if (!this.bankerCards[cont]) {
        console.log('-----结束-------');
        this.bankerResult = data.data.bankerResult;
        this.winLossList = data.data.winLossList;
        // 结算
        this.winOrloss(data);
        // this.ws.sendMessage({ action: 'actionPublicKeyApi' });
        return;
      }
      numberAnimate();
    };
    numberAnimate();
  }
  /**
   * 分牌
   * 若玩家初始手牌为一对相同的纸牌时，可以选择分牌。
   * 分牌后玩家将获得两手独立的牌，
   * 每手牌再分别与庄家对决，玩家可以获得两次获胜的机会
   * 并且需要支付同等下注额
   *
   * @param data
   */
  async splitAnimateCard(data: any) {
    const dataP = data.data.playerIndex.map((e: string) => {
      return e.split(',').map((str: string) => {
        const x = Number(str) % 52;
        const item = this.hiloService.CARD_DATA.find(y => y.index === x);
        return JSON.parse(JSON.stringify(item));
      });
    });
    console.log(this.playerAllCards);
    this.playerAllCards[0].crads[1].active = false;
    this.playerAllCards[0].crads[1].index = dataP[0][1].index;
    this.playerAllCards[0].crads[1].cnColor = dataP[0][1].cnColor;
    this.playerAllCards[0].crads[1].color = dataP[0][1].color;
    this.playerAllCards[0].crads[1].num = dataP[0][1].num;
    this.playerResult[0] = data.data.playerResult[0];
    this.playerAllCards[0].active = true;
    const crads = [];
    crads.push({
      ...dataP[1][0],
      active: true,
      mleft: 0,
      mtop: 0,
      left: 0,
      top: 0,
    });
    this.playerAllCards[1] = { active: false, wintype: 0, crads: crads };
    this.playerResult[1] = this.result(dataP[1][0].num).toString();
    await firstValueFrom(timer(this.isFastBet ? 0 : 300));
    this.playerAllCards[0].crads[1].active = true;

    this.playerIndex = 1;
    this.AddAnimateCard(dataP[1][1].index, data);
  }
  /**
   * 加倍
   * 这意味着在玩家要牌之前，
   * 可以将原下注额加倍，然后只能再要一张牌，并立即停止要牌。
   *
   * @param data
   */
  async doubleAnimateCard(data: any) {
    await this.AddAnimateCard(Number(data.data.playerIndex[0]) % 52, data);
    // 再开庄家牌  如果分牌了，第一次加倍 不能开庄家牌
    if (!this.issplit || (this.issplit && data.data.index == 1)) {
      // 如果未分牌 闲家点数爆掉了，不发庄家牌
      this.standAnimateCard(data);
    }
    if (this.issplit && data.data.index == 0) {
      // 加完倍 就需要转到第2组牌
      this.playerIndex = 1;
      this.playerAllCards[0].active = false;
      this.playerAllCards[1].active = true;
    }
  }
  // 结算
  winOrloss(data: any) {
    this.winLossList = data.data.winLossList;
    this.playerAllCards[this.playerIndex].active = false;
    this.isButton = [];
    //
    if (Array.isArray(data.data.activeResult)) {
      this.playerAllCards.forEach((e: any, i: number) => {
        e.wintype = data.data.activeResult[i];
      });
    } else {
      this.playerAllCards[this.playerIndex].wintype = data.data.activeResult;
    }

    this.playerIndex = 0;
    this.betService.minesBetstate$.next({ betting: false });
    this.ws.sendMessage({ action: 'actionPublicKeyApi' });
    this.orignalService.chartMessage$.next({ gameId: 'blackjack', amount: data.data.winLossAmount, type: 'set' });
    const item = this.allCurrencyBalance.find(
      balanceItem => balanceItem.currency === this.currentCurrencyData.currency
    );
    if (item) {
      const amount = data.data.winLossAmount.add(data.data.betAmount);
      item.nonStickyBalance = item.nonStickyBalance.add(amount);
      this.appService.userBalance$.next([...this.allCurrencyBalance]);
      if (this.appService.isNativeApp) {
        this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item.nonStickyBalance);
      }
      if (Number(amount) > 0) {
        const winLossAmount = this.currencyValuePipe.transform(amount, this.currentCurrencyData.currency);
        this.appService.assetChangesAnimation$.next(winLossAmount);
      }
    }
  }
}
