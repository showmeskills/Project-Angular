import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom, timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CurrencyBalance } from 'src/app/shared/interfaces/wallet.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { WsService } from '../../shared/services/ws.service';
import { HiloService } from '../hilo/hilo.service';
import { ChipDataService } from './chips.service';
@UntilDestroy()
@Component({
  selector: 'app-baccarat',
  templateUrl: './baccarat.component.html',
  styleUrls: ['./baccarat.component.scss'],
})
export class BaccaratComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private layout: LayoutService,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private ws: WsService,
    private localeService: LocaleService,
    private cacheService: CacheService,
    private currencyValuePipe: CurrencyValuePipe,
    private chipDataService: ChipDataService,
    private hiloService: HiloService,
    private toast: ToastService,
    private nativeAppService: NativeAppService
  ) {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      if (v) {
        this.uid = v.uid;
      }
    });
    this.appService.currentCurrency$.pipe(distinctUntilChanged(), untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.currentCurrencyData = x;
        this.isDigital = x.isDigital;
        this.chipValue = this.isDigital ? 0.00000001 : 0.01;
        this.onClear();
      }
    });
    // this.orignalService.userBalance$.pipe(untilDestroyed(this)).subscribe((data: any) => {
    //   this.balance = data?.balance;
    // });
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });
    //主题色获取
    this.appService.themeSwitch$.subscribe(v => {
      this.theme = v;
    });
    this.orignalService.gameName$.next(this.route.snapshot.data.name);
  }
  @ViewChild('leftCardsGroup') leftCardsElement!: ElementRef;
  @ViewChild('rghitCardsGroup') rghitCardsElement!: ElementRef;
  @ViewChild('dealer') dealerElement!: ElementRef;

  isH5!: boolean;
  /** 用户id */
  uid: string = '';
  /** 是否开启快速投注 */
  isFastBet!: boolean;
  /** 是否开启热键 */
  isHotkey!: boolean;
  /** 键盘操作 */
  operate: any;
  /** 是否开启动画 */
  isAnimation!: boolean;
  /** theme主题 */
  theme: string = '';
  /** 用户余额 */
  // balance: string = "0";
  /** 当前选择币种信息 */
  currentCurrencyData?: CurrenciesInterface;
  /** 是否为数字货币 */
  isDigital: boolean = false;
  /** 公平性验证的numberid和pubkey */
  fairnessData: any;
  languageCode = this.appService.languageCode;
  /** 限额 */
  limit: any;
  //投注类型
  betType = 'baccarat';
  money: string = '0.00000000';
  /** 倍数列表 */
  multiplier: any = [];
  /** 是否显示投注胜利后的倍数提示框 */
  isShowWinTip = false;
  /** 赔率 */
  rate = 1;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 投注获得利润 */
  winLossAmount: number = 0;
  /** 赢钱弹出框金额 */
  winMoney: string = '';
  /** 心跳定时器 */
  heartbeat: any = null;
  // 当前彩种历史记录列表
  historyList: any = [];
  /** 左边翻牌 */
  playerCards: any = [];
  /** 右边翻牌 */
  bankerCards: any = [];
  playerResult: string = '';
  bankerResult: string = '';
  /** 1左边赢 2右边赢 */
  wintype: number = 0;
  /** 顶部所有币种余额 */
  allCurrencyBalance: CurrencyBalance[] = [];
  /** 投注中 */
  loading!: boolean;
  /** 是否登录 */
  isLogin: boolean = false;
  async ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.isLogin = x ? true : false;
      this.ws?.destory();
      // this.betService.atuoActive$.next(false);
      // this.betService.isChangeActive$.next(false);
      this.isBet = false;
      this.loading = false;
      // this.appService.originalAutoBet$.next(false);
      this.onClear();
      if (this.heartbeat) clearInterval(this.heartbeat);
      if (x) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/baccarat/open?token=${this.orignalService.token}`);
      }
    });

    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    this.isAnimation = this.cacheService.animation;
    // 操作声音初始化
    this.iconService.init('baccarat');
    // 限额
    this.betService.limitList$.pipe(untilDestroyed(this)).subscribe(v => {
      this.limit = v.find((cur: any) => cur.currency === this.currentCurrencyData?.currency);
      console.log(this.limit);
      this.minLimitAmount = this.limit?.lotteryMinAmount;
    });
    this.betService.changChipType$.pipe(untilDestroyed(this)).subscribe(type => {
      switch (type) {
        // 最小
        case 0:
          if (this.tableChips.size > 0) {
            const el = this.tableChips.keys().next().value;
            this.tableChips.forEach((curChips, curIndex) => {
              curChips.chips.forEach(e => {
                e.chipsHtml.remove();
              });
              this.tableChips.delete(curIndex);
            });
            const table: HTMLElement = this.getTable(el);
            const chip = this.chipDataService.chipData[0];
            const chipHtml = this.animate(table, chip[this.isDigital ? 'digitalValue' : 'value'], el, chip.img);
            this.tableChips.set(el, {
              chips: [{ value: this.chipData.chip, chipsHtml: chipHtml }],
              maxChip: 1000000000000,
              chipCount: chip.chip,
            });
          }
          break;
        // 最大
        case 1:
          break;
        // 1/2
        case 2:
          this.changeNewTableChips('Decrease');
          break;
        // 2X
        case 3:
          this.changeNewTableChips('Increase');

          break;
        default:
          break;
      }
      let totalChipAmount = '0';
      this.tableChips.forEach((curChips: any, curIndex: any) => {
        const oldmoney = this.toNonExponential((Number(curChips.chipCount) * Number(this.chipValue)).toFixed(10));
        totalChipAmount = Number(totalChipAmount).add(Number(oldmoney)).toFixed(10);
      });
      console.log(totalChipAmount);
      this.betService.money$.next(totalChipAmount.toString());
      setTimeout(() => {
        console.log(this.tableChips);
        this.historyList.push(this.deepCopyMap(this.tableChips));
      }, 300);
    });

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
        switch (e.keyCode) {
          // space-下注
          case 32:
            if (this.isBet) {
              this.operate = { value: 'bet' };
            } else if (!this.isBet) {
              this.operate = { value: 'submit' };
              this.iconService.balanceAudioPlay();
            }
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
          //q-自动选择
          case 81:
            break;
          //w-炸弹变少
          case 87:
            break;
          //e-炸弹变多
          case 69:
            break;
          default:
            break;
        }
      }
    };

    //筹码监控
    this.betService.chip$.pipe(untilDestroyed(this)).subscribe(data => {
      this.chipData = data;
    });
  }

  /**
   * @param data
   * @description 接收消息
   */
  onmessage(data: any) {
    if (data.code != 0) {
      this.toast.show({ message: `${this.localeService.getValue(data.tKey)}!`, type: 'fail' });
      this.loading = false;
      this.isBet = false;
      this.ws.sendMessage({ action: 'actionPublicKeyApi' });
    }
    if (data.code == 0) {
      switch (data.action) {
        case 'JoinRoom':
          this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          // 开启定时发送心跳
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
          break;
        case 'actionBetApi':
          this.allCurrencyBalance = this.appService.userBalance$.value || [];
          this.orignalService.chartMessage$.next({ gameId: 'baccarat', amount: data.data.lotteryAmount, type: 'bet' });
          const item = this.allCurrencyBalance.find(
            balanceItem => balanceItem.currency === this.currentCurrencyData?.currency
          );
          if (item) {
            // 余额更新
            item.nonStickyBalance = item.nonStickyBalance.minus(data.data.lotteryAmount);
            this.appService.userBalance$.next([...this.allCurrencyBalance]);
            if (this.appService.isNativeApp) {
              this.nativeAppService.onCurrentMoney(this.currentCurrencyData?.currency ?? '', item.nonStickyBalance);
            }
          }
          // 开始成功
          this.animateCard(data.data);
          break;
        default:
          break;
      }
    }
  }

  /**
   * 投注
   *
   * @param event
   */
  async toBet(event: any) {
    if (this.loading || !this.isBet) return;
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    if (this.timeTip) clearTimeout(this.timeTip);
    this.appService.assetChangesLock$.next(true);
    this.iconService.balanceAudioPlay();
    this.isBet = false;
    this.loading = true;
    this.isShowWinTip = false;
    if (!this.isFastBet) {
      this.receiveAnimate();
    }
    this.wintype = 0;
    this.playerResult = '';
    this.bankerResult = '';
    // this.iconService.selectAudioPlay();
    const banker = this.tableChips.get('b')?.chipCount ?? 0;
    const player = this.tableChips.get('p')?.chipCount ?? 0;
    const tie = this.tableChips.get('t')?.chipCount ?? 0;
    const bPair = this.tableChips.get('bp')?.chipCount ?? 0;
    const pPair = this.tableChips.get('pp')?.chipCount ?? 0;
    const betAmount = banker
      .subtract(this.chipValue)
      .add(player.subtract(this.chipValue))
      .add(tie.subtract(this.chipValue))
      .add(bPair.subtract(this.chipValue))
      .add(pPair.subtract(this.chipValue));
    const betData = {
      action: 'actionBetApi',
      data: {
        betAmount: betAmount,
        banker: banker.subtract(this.chipValue).toString(), //庄
        player: player.subtract(this.chipValue).toString(), //闲
        tie: tie.subtract(this.chipValue).toString(), //合
        bPair: bPair.subtract(this.chipValue).toString(), //庄对
        pPair: pPair.subtract(this.chipValue).toString(), //闲对
        numberId: this.fairnessData.numberId,
        currency: this.orignalService.currentCurrencyData.currency,
        isAuto: false,
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    this.ws.sendMessage(betData);
  }
  async animateCard(data: any) {
    const playerValue = data.playerValue.split(',').map((str: string) => Number(str) % 52);
    const bankerValue = data.bankerValue.split(',').map((str: string) => Number(str) % 52);
    const playerCards: any = playerValue.map((x: number) => {
      const item = this.hiloService.CARD_DATA.find(y => y.index === x);
      return JSON.parse(JSON.stringify(item));
    });
    /** 右边翻牌 */
    const bankerCards: any = bankerValue.map((x: number) => {
      const item = this.hiloService.CARD_DATA.find(y => y.index === x);
      return JSON.parse(JSON.stringify(item));
    });
    console.log(playerCards);
    console.log(bankerCards);
    const dealerElement = this.dealerElement.nativeElement as HTMLElement;
    // console.log(dealerElement.clientHeight);
    // console.log(dealerElement.offsetTop);
    // console.log(dealerElement.offsetLeft);
    const leftCardsElement = this.leftCardsElement.nativeElement as HTMLElement;
    // console.log(leftCardsElement.clientHeight);
    // console.log(leftCardsElement.clientWidth);
    // console.log(leftCardsElement.offsetTop);
    // console.log(leftCardsElement.offsetLeft);
    const rghitCardsElement = this.rghitCardsElement.nativeElement as HTMLElement;
    // console.log(rghitCardsElement.clientHeight);
    // console.log(rghitCardsElement.clientWidth);
    // console.log(leftCardsElement.offsetTop);
    // console.log(rghitCardsElement.offsetLeft);
    // 第一张牌的位置 = dealerElement.offsetLeft-leftCardsElement.offsetLeft 负的（dealerElement.clientHeight+leftCardsElement.offsetTop）
    // 第二张牌的位置 left=  dealerElement.offsetLeft-leftCardsElement.offsetLeft-(leftCardsElement.clientWidth)*0.2 负的（dealerElement.clientHeight+leftCardsElement.offsetTop+(leftCardsElement.clientHeight*0.1)）
    // 第三张牌的位置 left=  dealerElement.offsetLeft-leftCardsElement.offsetLeft-(leftCardsElement.clientWidth)*0.2 负的（dealerElement.clientHeight+leftCardsElement.offsetTop+(leftCardsElement.clientHeight*0.1)）

    playerCards.forEach((e: any, i: number) => {
      e.active = false;
      if (!this.isFastBet) {
        if (i == 0) {
          e.left = dealerElement.offsetLeft - leftCardsElement.offsetLeft;
          e.top = -(dealerElement.clientHeight + leftCardsElement.offsetTop);
        } else if (i == 1) {
          e.left = dealerElement.offsetLeft - leftCardsElement.offsetLeft - leftCardsElement.clientWidth * 0.2;
          e.top = -(dealerElement.clientHeight + leftCardsElement.offsetTop + leftCardsElement.clientHeight * 0.1);
        } else if (i == 2) {
          e.left = dealerElement.offsetLeft - leftCardsElement.offsetLeft - leftCardsElement.clientWidth * 0.4;
          e.top = -(dealerElement.clientHeight + leftCardsElement.offsetTop + leftCardsElement.clientHeight * 0.2);
        }
      }
    });
    bankerCards.forEach((e: any, i: number) => {
      e.active = false;
      if (!this.isFastBet) {
        if (i == 0) {
          e.left = dealerElement.offsetLeft - rghitCardsElement.offsetLeft;
          e.top = -(dealerElement.clientHeight + rghitCardsElement.offsetTop);
        } else if (i == 1) {
          e.left = dealerElement.offsetLeft - rghitCardsElement.offsetLeft - rghitCardsElement.clientWidth * 0.2;
          e.top = -(dealerElement.clientHeight + rghitCardsElement.offsetTop + rghitCardsElement.clientHeight * 0.1);
        } else if (i == 2) {
          e.left = dealerElement.offsetLeft - rghitCardsElement.offsetLeft - rghitCardsElement.clientWidth * 0.4;
          e.top = -(dealerElement.clientHeight + rghitCardsElement.offsetTop + rghitCardsElement.clientHeight * 0.2);
        }
      }
    });

    this.playerResult = '0';
    this.bankerResult = '0';
    this.playerCards = JSON.parse(JSON.stringify(playerCards));
    this.bankerCards = JSON.parse(JSON.stringify(bankerCards));
    // if (this.playerCards.length == 0) {
    // this.playerCards = playerCards;
    // this.bankerCards = bankerCards;
    // } else {
    // // 执行收牌动画
    // let cont2 = 0;
    // const numberAnimate = async () => {
    //   if (this.playerCards[cont2]) {
    //     Object.assign(this.playerCards[cont2], playerCards[cont2]);
    //   }
    //   if (this.bankerCards[cont2]) {
    //     Object.assign(this.bankerCards[cont2], bankerCards[cont2]);
    //   }
    //   cont2++;
    //   if (!this.bankerCards[cont2] && !this.playerCards[cont2]) {
    //     return;
    //   }
    //   numberAnimate();
    // };
    // numberAnimate();
    // }
    await firstValueFrom(timer(this.isFastBet ? 0 : 500));
    // 执行发牌动画
    let cont = 0;
    const numberAnimate = async () => {
      if (this.playerCards[cont]) {
        const obj = this.playerCards[cont];
        obj.left = 0;
        obj.top = 0;
        this.iconService.baccaratStartAudioPlay();
        await firstValueFrom(timer(this.isFastBet ? 0 : 500));
        obj.active = true;
        if (Number(this.playerResult) + this.result(obj.num) >= 10) {
          this.playerResult = (Number(this.playerResult) + this.result(obj.num) - 10).toString();
        } else {
          this.playerResult = (Number(this.playerResult) + this.result(obj.num)).toString();
        }
      }
      if (this.bankerCards[cont]) {
        const obj = this.bankerCards[cont];
        obj.left = 0;
        obj.top = 0;
        this.iconService.baccaratStartAudioPlay();
        await firstValueFrom(timer(this.isFastBet ? 0 : 500));
        obj.active = true;
        if (Number(this.bankerResult) + this.result(obj.num) >= 10) {
          this.bankerResult = (Number(this.bankerResult) + this.result(obj.num) - 10).toString();
        } else {
          this.bankerResult = (Number(this.bankerResult) + this.result(obj.num)).toString();
        }
      }
      cont++;
      if (!this.bankerCards[cont] && !this.playerCards[cont]) {
        console.log('-----结束-------');
        this.ws.sendMessage({ action: 'actionPublicKeyApi' });
        if (this.bankerResult > this.playerResult) {
          this.wintype = 2;
        } else if (this.playerResult > this.bankerResult) {
          this.wintype = 1;
        } else {
          // 和
          this.wintype = 3;
        }
        this.winMoney = this.currencyValuePipe.transform(
          Number(this.betService.money$.value).add(data.winLossAmount),
          this.currentCurrencyData?.currency ?? ''
        );
        this.orignalService.chartMessage$.next({ gameId: 'baccarat', amount: data.winLossAmount, type: 'set' });
        if (data.winLossAmount > 0) {
          const item = this.allCurrencyBalance.find(
            balanceItem => balanceItem.currency === this.currentCurrencyData?.currency
          );
          if (item) {
            const amount = data.winLossAmount.add(data.lotteryAmount);
            item.nonStickyBalance = item.nonStickyBalance.add(amount);
            this.appService.userBalance$.next([...this.allCurrencyBalance]);
            if (this.appService.isNativeApp) {
              this.nativeAppService.onCurrentMoney(this.currentCurrencyData?.currency ?? '', item.nonStickyBalance);
            }
            if (Number(amount) > 0) {
              const winLossAmount = this.currencyValuePipe.transform(amount, this.currentCurrencyData?.currency ?? '');
              this.appService.assetChangesAnimation$.next(winLossAmount);
            }
          }
        }
        this.loading = false;
        if (data.lotteryOdds >= 1) {
          await firstValueFrom(timer(500));
          this.rate = data.lotteryOdds;
          this.iconService.baccaratWinAudioPlay();
          this.showWinTip();
        }

        return;
      }
      numberAnimate();
    };
    numberAnimate();
  }
  // 收牌动画
  receiveAnimate() {
    if (this.playerCards.length == 0) return;
    const dealerElement = this.dealerElement.nativeElement as HTMLElement;
    const leftCardsElement = this.leftCardsElement.nativeElement as HTMLElement;
    const rghitCardsElement = this.rghitCardsElement.nativeElement as HTMLElement;
    this.playerCards.forEach((e: any, i: number) => {
      e.active = false;
      if (i == 0) {
        e.left = dealerElement.offsetLeft - leftCardsElement.offsetLeft;
        e.top = -(dealerElement.clientHeight + leftCardsElement.offsetTop);
      } else if (i == 1) {
        e.left = dealerElement.offsetLeft - leftCardsElement.offsetLeft - leftCardsElement.clientWidth * 0.2;
        e.top = -(dealerElement.clientHeight + leftCardsElement.offsetTop + leftCardsElement.clientHeight * 0.1);
      } else if (i == 2) {
        e.left = dealerElement.offsetLeft - leftCardsElement.offsetLeft - leftCardsElement.clientWidth * 0.4;
        e.top = -(dealerElement.clientHeight + leftCardsElement.offsetTop + leftCardsElement.clientHeight * 0.2);
      }
    });
    this.bankerCards.forEach((e: any, i: number) => {
      e.active = false;
      if (i == 0) {
        e.left = dealerElement.offsetLeft - rghitCardsElement.offsetLeft;
        e.top = -(dealerElement.clientHeight + rghitCardsElement.offsetTop);
      } else if (i == 1) {
        e.left = dealerElement.offsetLeft - rghitCardsElement.offsetLeft - rghitCardsElement.clientWidth * 0.2;
        e.top = -(dealerElement.clientHeight + rghitCardsElement.offsetTop + rghitCardsElement.clientHeight * 0.1);
      } else if (i == 2) {
        e.left = dealerElement.offsetLeft - rghitCardsElement.offsetLeft - rghitCardsElement.clientWidth * 0.4;
        e.top = -(dealerElement.clientHeight + rghitCardsElement.offsetTop + rghitCardsElement.clientHeight * 0.2);
      }
    });
    this.iconService.baccaratReceiveAudioPlay();
  }
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

  isSettlement: boolean = false;
  /**
   * 结算请求
   *
   * @param event
   */
  async toSubmit(event: any) {}

  /**
   * 科学计算替换
   *
   * @param num
   */
  toNonExponential(num: string) {
    const m: any = Number(num)
      .toExponential()
      .match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return Number(num).toFixed(Math.max(0, (m[1] || '').length - m[2]));
  }
  /**
   * 清除状态
   */
  clear() {}

  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    if (this.heartbeat) clearInterval(this.heartbeat);
    if (this.appService.isNativeApp) {
      console.log('解锁');
      this.nativeAppService.onLockTitleMoney(false);
    }
    this.appService.assetChangesLock$.next(false);
    if (this.isLogin) {
      this.appService.assetChanges$.next({ related: 'Wallet' });
    }
  }

  @ViewChild('areaTypeT') areaTypeTElement!: ElementRef;
  @ViewChild('areaTypePP') areaTypePPElement!: ElementRef;
  @ViewChild('areaTypeBp') areaTypeBpElement!: ElementRef;
  @ViewChild('areaTypeP') areaTypePElement!: ElementRef;
  @ViewChild('areaTypeB') areaTypeBElement!: ElementRef;
  // chips: any = [];
  /** 投注栏选择的筹码*/
  chipData!: {
    index: number;
    chip: number;
    value: string;
    digitalValue: string;
    img: string;
    isDisabled: boolean;
  };
  /**
   * 添加筹码
   *
   * @param el
   */
  onAddChip(el: string) {
    if (!this.chipData || (this.chipData && this.chipData.isDisabled) || this.loading) return;
    const table: HTMLElement = this.getTable(el);
    const addmoney = this.chipData[this.isDigital ? 'digitalValue' : 'value'];

    const chipHtml = this.animate(table, addmoney, el, this.chipData.img);
    this.betService.money$.next(Number(addmoney).add(Number(this.betService.money$.value)).toString());

    const table1 = this.tableChips.get(el);
    const randomId = Math.random().toString(36).slice(-6);
    if (!table1) {
      this.tableChips.set(el, {
        chips: [{ value: this.chipData.chip, chipsHtml: chipHtml }],
        maxChip: 1000000000000,
        chipCount: this.chipData.chip,
      });
    } else {
      table1.chips.push({ value: this.chipData.chip, chipsHtml: chipHtml });
      table1.maxChip = 1000000000000;
      table1.chipCount = table1.chipCount.add(this.chipData.chip);
      this.tableChips.set(el, table1);
    }
    // 深拷贝整个桌子筹码，包括HTMLElement元素
    setTimeout(() => {
      this.historyList.push(this.deepCopyMap(this.tableChips));
    }, 300);
    this.iconService.baccaratChipsAudioPlay();
    // console.log(this.deepCopyMap(this.tableChips));
  }

  animate(table: HTMLElement, addmoney: string, el: string, imgS: string) {
    const chip = this.renderer.createElement('div');
    const img = this.renderer.createElement('img');
    chip.classList.add('baccarat_chip');
    chip.setAttribute('data_money', addmoney);
    chip.setAttribute('data_table', el);
    chip.setAttribute('data_img', imgS);
    chip.style.left = Math.random() * table.clientWidth + 'px';
    chip.style.bottom = '-20px';
    img.src = imgS;
    this.renderer.appendChild(chip, img);
    this.renderer.appendChild(table, chip);
    const startX = Math.random() * table.clientWidth;
    const startY = -20;
    const targetX = Math.random() * (table.clientWidth - chip.clientWidth);
    const targetY = Math.random() * (table.clientHeight - chip.clientHeight);
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const duration = Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 2;

    let start: any = null;
    /**
     *
     * @param timestamp
     */
    const step = (timestamp: any) => {
      if (!start) start = timestamp;
      let progress = (timestamp - start) / duration;
      if (progress > 1) progress = 1;
      const x = startX + deltaX * progress;
      const y = startY + deltaY * progress;
      chip.style.left = x + 'px';
      chip.style.bottom = y + 'px';
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
    return chip;
  }
  /**
   * 清除筹码
   *
   */
  onClear() {
    if (this.loading) return;
    this.iconService.balanceAudioPlay();
    this.tableChips.clear();
    this.historyList = [];
    const chipsD = document.getElementsByClassName('baccarat_chip');
    while (chipsD.length > 0) {
      chipsD[0].parentNode?.removeChild(chipsD[0]);
    }
    this.betService.money$.next('0');
  }
  /**
   * 撤销筹码
   *
   */
  onUndo() {
    if (this.loading) return;
    if (this.historyList.length > 0) {
      this.iconService.balanceAudioPlay();
      const chipsD = document.getElementsByClassName('baccarat_chip');
      while (chipsD.length > 0) {
        chipsD[0].parentNode?.removeChild(chipsD[0]);
      }

      if (this.historyList.length > 1) {
        const historyTable = this.historyList[this.historyList.length - 2];
        console.log(historyTable);
        let totalChipAmount = '0';
        historyTable.forEach((curChips: any, curIndex: any) => {
          const oldmoney = this.toNonExponential((Number(curChips.chipCount) * Number(this.chipValue)).toFixed(10));
          totalChipAmount = Number(totalChipAmount).add(Number(oldmoney)).toFixed(10);
          // totalChipAmount = totalChipAmount.add(curChips.chipCount.subtract(this.chipValue));
          const table = this.getTable(curIndex);
          curChips.chips.forEach((element: any) => {
            this.renderer.appendChild(table, element.chipsHtml);
          });
        });
        this.tableChips = historyTable;
        this.betService.money$.next(totalChipAmount.toString());
        this.historyList.splice(this.historyList.length - 2, 1);
      } else {
        this.onClear();
      }
    }
  }
  getTable(el: string) {
    let table!: HTMLElement;
    switch (el) {
      case 't':
        table = this.areaTypeTElement.nativeElement as HTMLElement;
        break;
      case 'pp':
        table = this.areaTypePPElement.nativeElement as HTMLElement;
        break;
      case 'bp':
        table = this.areaTypeBpElement.nativeElement as HTMLElement;
        break;
      case 'p':
        table = this.areaTypePElement.nativeElement as HTMLElement;
        break;
      case 'b':
        table = this.areaTypeBElement.nativeElement as HTMLElement;
        break;
      default:
        break;
    }
    return table;
  }

  // 最小投注限制金额
  minLimitAmount = 0.00000001;
  // // 最大投注限制金额
  // maxLimitAmout = 100.8;
  // 1筹码对应的金额
  chipValue = 0.00000001;
  // 当前支持的筹码
  // chipsV: Array<number> = [1, 10, 100, 1000, 10 * 1000, 100 * 1000, 1000 * 1000, 10 * 1000 * 1000, 100 * 1000 * 1000];
  // 桌面筹码
  tableChips = new Map<
    string,
    { chips: { value: number; chipsHtml: HTMLElement }[]; maxChip: number; chipCount: number }
  >();
  changeNewTableChips(changeMethod: 'Increase' | 'Decrease') {
    // 桌面筹码总金额
    let totalChipAmount = 0;
    this.tableChips.forEach((curChips, curIndex) => {
      totalChipAmount = totalChipAmount.add(curChips.chipCount.subtract(this.chipValue));
    });
    // 检查限额，如果不满足条件，直接返回当前牌桌的筹码
    switch (changeMethod) {
      // 增加
      case 'Increase':
        totalChipAmount = totalChipAmount.subtract(2);
        // if (totalChipAmount > maxLimitAmout) return tableChips;
        break;
      // 减少
      case 'Decrease':
        totalChipAmount = totalChipAmount.divide(2);
        if (totalChipAmount < this.minLimitAmount) return this.tableChips;
        break;
      default:
        return this.tableChips;
    }
    // 改变之后的总筹码数量，以1为单位
    const totalChipCount = totalChipAmount.divide(this.chipValue);
    // 计算调整之后整个桌面的筹码
    let newTotalChipCount = 0;
    // 当前支持的筹码
    const chipsV = this.chipDataService.chipData.map(item => item.chip);
    if (changeMethod == 'Decrease') {
      const minOne = [...this.tableChips.values()].some((e: any) => e.chipCount.divide(2) >= 1);
      if (!minOne) return this.tableChips;
    }

    this.tableChips.forEach((curChips, curIndex) => {
      // if (curChips.chips.length > 0) {
      const newChips: number[] = [];
      switch (changeMethod) {
        // 增加
        case 'Increase':
          // 判断当前桌面是否要改变筹码
          // 当前桌面增加之后的筹码
          let chipCountAfterIncrease = curChips.chipCount.subtract(2);
          curChips.chipCount = chipCountAfterIncrease;
          console.log('chipCountAfterIncrease', chipCountAfterIncrease);
          // 加上变动之后的筹码小于等于总的筹码，才开始变动
          if (newTotalChipCount.add(chipCountAfterIncrease) <= totalChipCount) {
            newTotalChipCount = newTotalChipCount.add(chipCountAfterIncrease);
            // 当前筹码中找出比当前桌面最大筹码小的所有筹码,从大到小排列
            const sortChips = chipsV.filter(x => x <= curChips.maxChip);
            const minChip = Math.min(...sortChips);
            // sortChips.push(1);
            sortChips.sort((a, b) => b - a);

            // curChips.chips = newChips;
            console.log('sortChips', sortChips);
            sortChips.forEach(x => {
              if (!chipCountAfterIncrease) return;
              const chipAmount = Math.floor(chipCountAfterIncrease / x);
              if (!chipAmount) {
                return;
              }
              try {
                new Array(chipAmount).fill(x).forEach(j => {
                  newChips.push(j);
                });
              } catch (e) {
                console.log('发生异常:' + chipAmount);
              }

              chipCountAfterIncrease = chipCountAfterIncrease % x;
              // 如果为0，说明已经分配完成
              if (!chipCountAfterIncrease) return;
              console.log(chipCountAfterIncrease);
              // 如果小于1或者小于当前最小筹码，以1填充
              if (chipCountAfterIncrease == 1 || chipCountAfterIncrease < minChip) {
                if (chipCountAfterIncrease < 1) {
                  newChips.push(...new Array(1).fill(chipCountAfterIncrease));
                } else {
                  newChips.push(...new Array(chipCountAfterIncrease).fill(1));
                }
                chipCountAfterIncrease = 0;
                return;
              }
            });
          }

          break;
        // 减少
        case 'Decrease':
          // 判断当前桌面是否要改变筹码
          // 当前桌面减少之后的筹码
          let chipCountAfterDecrease = curChips.chipCount.divide(2);
          curChips.chipCount = chipCountAfterDecrease;
          // console.log(chipCountAfterDecrease);

          // 加上变动之后的筹码小于等于总的筹码，才开始变动
          if (newTotalChipCount.add(chipCountAfterDecrease) <= totalChipCount) {
            newTotalChipCount = newTotalChipCount.add(chipCountAfterDecrease);
            // 当前筹码中找出比当前桌面最大筹码小的所有筹码,从大到小排列
            const sortChips = chipsV.filter(x => x <= curChips.maxChip);
            const minChip = Math.min(...sortChips);
            sortChips.sort((a, b) => b - a);
            sortChips.forEach(x => {
              if (!chipCountAfterDecrease) return;
              const chipAmount = Math.floor(chipCountAfterDecrease / x);
              newChips.push(...new Array(chipAmount).fill(x));
              chipCountAfterDecrease = chipCountAfterDecrease % x;
              // console.log(chipCountAfterDecrease, minChip);
              // 如果为0，说明已经分配完成
              if (!chipCountAfterDecrease) return;
              if (chipCountAfterDecrease <= 1) {
                newChips.push(chipCountAfterDecrease.divide(2));
                chipCountAfterDecrease = 0;
                return;
              }
              // 如果小于当前最小筹码，以1填充
              if (chipCountAfterDecrease < minChip) {
                if (Number.isInteger(chipCountAfterDecrease)) {
                  newChips.push(...new Array(chipCountAfterDecrease).fill(1));
                  chipCountAfterDecrease = 0;
                  return;
                } else {
                  // newChips.push(...new Array(Math.floor(chipCountAfterDecrease)).fill(1));
                  newChips.push(chipCountAfterDecrease.minus(Math.floor(chipCountAfterDecrease)));
                  chipCountAfterDecrease = 0;
                  return;
                }
              }
            });
          }
          break;
        default:
          break;
      }
      // console.log(newChips);
      const tempChips = [...newChips];
      // 删除的筹码
      this.deleteObjects(curChips.chips, newChips);
      const added = this.findValuesToAdd([...curChips.chips], tempChips);
      // console.log(added);
      this.addChipsHtml(curChips.chips, added, curIndex);
      // }
      // console.log(curChips.chips);
    });
    return this.tableChips;
  }

  deleteObjects(a: any, b: any) {
    for (let i = 0; i < a.length; i++) {
      const index = b.indexOf(a[i].value);
      if (index === -1) {
        a[i].chipsHtml.remove();
        a.splice(i, 1);
        i--;
      } else {
        b.splice(index, 1);
      }
    }
    console.log(a);
  }
  findValuesToAdd(a: any, b: any) {
    const valuesToAdd = [];
    for (let i = 0; i < b.length; i++) {
      if (a.some((obj: any) => obj.value === b[i])) {
        const index = a.findIndex((obj: any) => obj.value === b[i]);
        a.splice(index, 1);
        continue;
      } else {
        valuesToAdd.push(b[i]);
      }
    }
    return valuesToAdd;
  }
  addChipsHtml(a: any, b: any, el: string) {
    const table = this.getTable(el);
    b.forEach((num: any) => {
      const chip = this.chipDataService.chipData.find(item => item.chip === num);
      if (chip) {
        if (a.length <= 100) {
          const chipHtml = this.animate(table, chip[this.isDigital ? 'digitalValue' : 'value'], el, chip.img);
          a.push({ value: chip.chip, chipsHtml: chipHtml });
        }
      }
    });
  }
  /**
   * 拷贝map 多层数据
   *
   * @param map
   */
  deepCopyMap(map: any) {
    const copy = new Map();
    for (const [key, value] of map) {
      if (typeof value === 'object' && value !== null) {
        // 如果 value 是对象类型，则递归调用 deepCopyObject 函数进行深拷贝
        copy.set(key, this.deepCopyObject(value));
      } else {
        copy.set(key, value);
      }
    }
    return copy;
  }
  /**
   * 拷贝对象里面有HTMLElement类型的
   *
   * @param obj
   */
  deepCopyObject(obj: any) {
    const copy: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value instanceof Map) {
          // 如果对象的属性值是 Map 类型，则进行深拷贝
          copy[key] = this.deepCopyMap(value);
        } else if (Array.isArray(value)) {
          // 如果属性值是数组类型，则递归调用 deepCopyArray 函数进行深拷贝
          copy[key] = this.deepCopyArray(value);
        } else if (typeof value === 'object' && value !== null) {
          if (value instanceof HTMLElement) {
            // 如果属性值是 HTMLElement 类型，则使用 cloneNode 方法进行深拷贝
            copy[key] = value.cloneNode(true);
          } else {
            // 如果属性值是对象类型，则递归调用 deepCopyObject 函数进行深拷贝
            copy[key] = this.deepCopyObject(value);
          }
        } else {
          copy[key] = value;
        }
      }
    }
    return copy;
  }
  /**
   * 拷贝数组里面有HTMLElement类型的
   *
   * @param obj
   * @param arr
   */
  deepCopyArray<T>(arr: T[]): T[] {
    const copy = [];
    for (let i = 0; i < arr.length; i++) {
      const value = arr[i];
      if (Array.isArray(value)) {
        // 如果元素是数组类型，则递归调用 deepCopyArray 函数进行深拷贝
        copy.push(this.deepCopyArray(value));
      } else if (typeof value === 'object' && value !== null) {
        if (value instanceof HTMLElement) {
          // 如果元素是 HTMLElement 类型，则使用 cloneNode 方法进行深拷贝
          copy.push(value.cloneNode(true));
        } else {
          // 如果元素是对象类型，则递归调用 deepCopyObject 函数进行深拷贝
          copy.push(this.deepCopyObject(value));
        }
      } else {
        copy.push(value);
      }
    }
    return copy;
  }
}
