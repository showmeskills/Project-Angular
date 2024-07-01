import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom, timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { PokerInfor } from 'src/app/orignal/shared/interfaces/hilo-info.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';
import { WsService } from '../../shared/services/ws.service';
import { HiloService } from './hilo.service';

export interface SelectItem {
  status?: string;
  info: PokerInfor;
}
@UntilDestroy()
@Component({
  selector: 'orignal-hilo',
  templateUrl: './hilo.component.html',
  styleUrls: ['./hilo.component.scss'],
})
export class HiloComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private localeService: LocaleService,
    private hiloService: HiloService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private ws: WsService,
    private toast: ToastService,
    private currencyValuePipe: CurrencyValuePipe
  ) {
    this.orignalService.gameName$.next(this.route.snapshot.data.name);
    this.appService.currentCurrency$.pipe(distinctUntilChanged(), untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.currentCurrencyData = x;
      }
    });
  }

  @ViewChild('cardList') cardListElement!: ElementRef;
  @ViewChild('cardBox') cardBoxElement!: ElementRef;

  @ViewChild('inner') innerElement!: ElementRef;
  /** 当前选择币种信息 */
  currentCurrencyData!: CurrenciesInterface;
  /** 公平性验证的numberid和pubkey */
  fairnessData: any;
  /** 是否开启热键 */
  isHotkey!: boolean;
  /** 键盘操作 */
  operate: any;
  /**模拟poker数据库 */
  orginalList: SelectItem[] = [
    {
      info: { index: 0, num: 'A', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '7.69%' },
    },
    {
      info: { index: 0, num: 'A', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '7.69%' },
    },
    {
      info: { index: 0, num: 'A', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '7.69%' },
    },
    {
      info: { index: 0, num: 'A', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '7.69%' },
    },
  ];
  list: any = [];
  /** 跳过次数 */
  nextNum: number = 20;
  /** 实际倍数 */
  rate: number = 1;
  /** 显示倍数 */
  realBetRate: number = 1;
  /**投注类型 */
  betType = 'hilo';

  /**当前index */
  currentIndex: number = 0;
  /**模拟选择poker历史 */
  selectedList: SelectItem[] = [];
  /**能否买大小操作 */
  // canBuy: boolean = false;
  /**输 */
  isLose: boolean = false;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 是否投注成功 */
  isBetting: boolean = false;
  /** 心跳定时器 */
  heartbeat: any = null;
  /** 是否可以选牌 */
  isChoose: boolean = false;
  /** 赢钱弹窗 */
  showWin: boolean = false;
  winToast!: string;
  /** 限额 */
  limit: any;
  /** 投注金额 */
  money: string = '0.00000000';
  /** 最大倍数 */
  maxOdds!: number;
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.ws?.destory();
      this.reSetPoker();
      if (x) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/hilo/open?token=${this.orignalService.token}`);
      }
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });

    this.betService.limitList$.pipe(untilDestroyed(this)).subscribe(v => {
      this.limit = v.find((cur: any) => cur.currency === this.currentCurrencyData.currency);
      console.log(this.limit);
    });
    this.betService.money$.pipe(untilDestroyed(this)).subscribe((money: any) => {
      if (money) {
        this.money = money;
      }
    });
    // 操作声音初始化
    this.iconService.init('hilo');
    this.freshPokerList();

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
            if (!this.isBetting) {
              this.operate = { value: 'bet' };
            } else if (this.isBetting && this.selectedList.length > 1) {
              this.operate = { value: 'submit' };
            }
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
          //q-选大于或等于（A则是选大于，K则是选等于）
          case 81:
            this.handleBuyTypeEvent('1');
            this.iconService.balanceAudioPlay();
            break;
          //w-选小于或等于（A则是选等于，K则是选小于）
          case 87:
            // if (!this.isBetting) {
            //   if (this.bombCounts > 1) this.bombCounts--;
            // }
            this.handleBuyTypeEvent('0');
            this.iconService.balanceAudioPlay();
            break;
          //e-跳过
          case 69:
            // if (!this.isBetting) {
            //   if (this.bombCounts < 24) this.bombCounts++;
            // }
            this.handleSkip();
            this.iconService.balanceAudioPlay();
            break;
          default:
            break;
        }
      }
    };
  }
  /**
   * @param data
   * @description 接收消息
   *actionPubklicApi
   
actionHiloBetApi
   
actionHiloCurrentApi
   
actionHiloChooseApi 选牌
   
actionHiloGiveUpApi 跳过
   
actionHiloSettlementApi 结算
   */
  async onmessage(data: any) {
    if (data.code != 0) {
      // 扣款失败都直接用code 判断
      // this.orignalService.showToast$.next({
      //   // content: data.tKey ? this.localeService.getValue(data.tKey) : '',
      // });
      this.toast.show({ message: `${this.localeService.getValue(data.tKey)}!`, type: 'fail' });
      this.betService.minesBetstate$.next({ betting: false });
      this.ws.sendMessage({ action: 'actionPubklicApi' });
    }
    if (data.code == 0) {
      switch (data.action) {
        case 'JoinRoom':
          // 初次进入 查询是否有未结算的注单
          this.ws.sendMessage({ action: 'actionHiloCurrentApi' });
          // 开启定时发送心跳
          clearInterval(this.heartbeat);
          this.heartbeat = setInterval(() => {
            this.ws.sendMessage({ action: 'type' });
          }, 15000);
          break;
        case 'actionHiloCurrentApi':
          // 初次进入 查询是否有未结算的注单
          this.isChoose = data.data.currentFlag;
          if (data.data.currentFlag) {
            this.orignalService.chartMessage$.next({ gameId: 'hilo', amount: data.data.betAmount, type: 'bet' });
            this.setCurrentBet(data.data);
          } else {
            this.ws.sendMessage({ action: 'actionPubklicApi' });
          }
          break;
        case 'actionPubklicApi':
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.isBet = true;
          this.betService.minesBetstate$.next({ betting: false });
          break;
        case 'actionHiloBetApi':
          // 下注
          this.selectedList = [];
          this.isBetting = true;
          // 下注成功后，可以选牌
          this.isChoose = true;
          data.data.compareFlag = 4;
          this.maxOdds = data.data.maxOdds;
          this.fliterCard(data.data);
          this.betService.minesBetstate$.next({ betting: true });
          this.orignalService.chartMessage$.next({ gameId: 'hilo', amount: data.data.betAmount, type: 'bet' });
          break;
        case 'actionHiloChooseApi':
          // 选牌
          // 选牌成功后，可以选牌
          if (data.data.active) {
            this.rate = data.data.actualBetRate;
            this.realBetRate = data.data.realBetRate;
          } else {
            this.ws.sendMessage({ action: 'actionPubklicApi' });
            this.isLose = true;
            this.rate = 1;
            this.realBetRate = 1;
            this.iconService.hiloLoseAudioPlay();
            this.orignalService.chartMessage$.next({ gameId: 'hilo', amount: -data.data.betAmount, type: 'set' });
          }
          // let status = data.data.compareFlag

          this.isBetting = data.data.active;
          this.betService.minesBetstate$.next({ betting: data.data.active });
          this.fliterCard(data.data);

          // // 移动底部卡牌
          setTimeout(() => {
            if (this.cardBoxElement && this.cardListElement) {
              const cardBoxElement = this.cardBoxElement.nativeElement as HTMLElement;
              const cardListElement = this.cardListElement.nativeElement as HTMLElement;
              cardBoxElement.scrollLeft = cardListElement.offsetWidth + 50;
            }
          }, 0);

          break;
        case 'actionHiloGiveUpApi':
          // 跳过
          this.nextNum = data.data.remainingTimes - 1;
          data.data.compareFlag = 3;
          this.fliterCard(data.data);

          setTimeout(() => {
            if (this.cardBoxElement && this.cardListElement) {
              const cardBoxElement = this.cardBoxElement.nativeElement as HTMLElement;
              const cardListElement = this.cardListElement.nativeElement as HTMLElement;
              cardBoxElement.scrollLeft = cardListElement.offsetWidth + 50;
            }
          }, 0);

          break;
        case 'actionHiloSettlementApi':
          // 结算成功
          this.isBetting = false;
          this.isChoose = false;
          this.ws.sendMessage({ action: 'actionPubklicApi' });
          this.showWinToast(data.data.winLossAmount);
          this.orignalService.chartMessage$.next({ gameId: 'hilo', amount: data.data.winLossAmount, type: 'set' });
          break;
        default:
          break;
      }
    }
  }
  //poker数据刷新
  freshPokerList() {
    this.list = [...this.orginalList];
  }

  //弃牌事件
  handleSkip() {
    if (this.nextNum == 0) {
      // this.orignalService.showToast$.next({
      //   content: this.localeService.getValue("noskip"),
      // });
      this.toast.show({ message: `${this.localeService.getValue('noskip')}`, type: 'fail' });
    }
    if (this.isLose || this.nextNum == 0) return;
    const targetCard = document.getElementById('poker-0') as HTMLElement;
    const targetClassName = document.getElementById('poker-0')?.className;
    const isFlip = targetClassName?.includes('isFlipped');
    if (isFlip) {
      targetCard.classList.remove('isFlipped');
    } else {
      targetCard.classList.add('isFlipped');
    }

    if (this.isBetting) {
      if (this.isChoose) {
        this.ws.sendMessage({ action: 'actionHiloGiveUpApi' });
        this.isChoose = false;
      }
    } else {
      // 前端弃牌处理
      const data = {
        targetNum: Math.round(Math.random() * 51),
        compareFlag: 4,
      };
      this.selectedList = [];
      this.fliterCard(data, false);
    }
  }
  //翻牌事件
  async flipNextCard(crad: PokerInfor) {
    if (this.innerElement) {
      const innerElement = this.innerElement.nativeElement as HTMLElement;
      innerElement.classList.remove('mounted');
      await firstValueFrom(timer(60));
      this.isChoose = this.isBetting;
      this.currentIndex = 1;
      this.orginalList.forEach(e => {
        e.info = crad;
      });
      this.freshPokerList();
      innerElement.classList.add('mounted');
      this.iconService.hiloCardAudioPlay();
      if (this.isBetting) {
        await firstValueFrom(timer(800));
        this.iconService.hiloCardWinAudioPlay();
      }
    }
  }

  // 处理卡片数据
  fliterCard(data: any, flag: boolean = true) {
    const card = { ...this.hiloService.CARD_DATA[data.targetNum] };
    if (this.isBetting) {
      card.nextUpBetRate = data.nextUpBetRate?.toString();
      card.nextLowBetRate = data.nextLowBetRate?.toString();
    }
    card.compareFlag = data.compareFlag;
    const firstCard = {
      info: card,
    };
    this.betService.hiloCardData$.next(card);
    if (flag) {
      this.selectedList.push(firstCard);
    }
    const targetCard = document.getElementById('poker-0') as HTMLElement;
    targetCard.classList.add('isFlipped');

    this.flipNextCard(card);
  }
  //投注大小事件
  //status--->R:flip
  //status--->B:big
  //status--->S:small
  //status--->E:equal
  handleBuyTypeEvent(type: string) {
    console.log('type-->', type);
    if (!this.isBetting || !this.isChoose) return;

    const personTel = Number(this.money).subtract(Number(this.rate)).minus(Number(this.money));
    if (personTel > this.limit.lotteryMaxQuota) {
      // 盈利已达最高上限，请结算注单
      this.toast.show({ message: `${this.localeService.getValue('bet_maximum_win')}!`, type: 'fail' });
      return;
    }

    if (this.realBetRate >= this.maxOdds) {
      // 赔率已达最高上限，请结算注单
      this.toast.show({ message: `${this.localeService.getValue('bet_maximum_rate')}!`, type: 'fail' });
      return;
    }
    this.isChoose = false;
    this.ws.sendMessage({
      action: 'actionHiloChooseApi',
      data: {
        compareFlag: type,
      },
    });
    this.iconService.selectAudioPlay();
  }

  //submit事件
  //defaul：第一张牌
  //投注结算
  toBet(event: any) {
    if (!this.isBet) return;
    this.isBet = false;
    this.nextNum = 20;
    this.rate = 1;
    this.realBetRate = 1;
    this.isLose = false;
    this.showWin = false;
    this.betService.minesBetstate$.next({ betting: true });
    this.ws.sendMessage({
      action: 'actionHiloBetApi',
      data: {
        betAmount: Number(event),
        numberId: this.fairnessData.numberId,
        currency: this.currentCurrencyData.currency,
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    });
    this.iconService.selectAudioPlay();
  }
  /**
   * 结算
   *
   * @param event
   */
  toSubmit(event: any) {
    if (
      this.selectedList.findIndex(e => e.info.compareFlag == 0 || e.info.compareFlag == 1 || e.info.compareFlag == 2) ==
      -1
    )
      return;
    this.isBetting = false;
    this.ws.sendMessage({
      action: 'actionHiloSettlementApi',
    });
    this.iconService.selectAudioPlay();
  }

  /**
   * 获取当前用户未结算注单信息
   *
   * @param data
   */
  async setCurrentBet(data: any) {
    this.isBetting = true;
    this.money = data.betAmount;
    this.maxOdds = data.maxOdds;
    this.betService.minesBetstate$.next({ betting: true, money: data.betAmount });
    this.fliterCard({
      targetNum: data.targetNum,
      compareFlag: data.hisResult[data.hisResult.length - 1].compareFlag,
      nextUpBetRate: data.nextUpBetRate,
      nextLowBetRate: data.nextLowBetRate,
    });
    const cards = data.hisResult.map((e: any) => {
      const card = { ...this.hiloService.CARD_DATA[e.hisTargetNum] };
      card.compareFlag = e.compareFlag;
      const firstCard = {
        info: card,
      };
      return firstCard;
    });
    this.selectedList = cards;
    this.rate = data.actualBetRate;
    this.realBetRate = data.realBetRate;
    this.nextNum = data.remainingTimes;
  }
  //下局投注前，重置&&获取poker数据
  reSetPoker() {
    this.selectedList = [];
    // this.canBuy = false;
    this.isBet = false;
    this.isBetting = false;
    this.isChoose = false;
    this.rate = 1;
    this.realBetRate = 1;
    this.isLose = false;
    this.list = [];
    this.showWin = false;
    this.orginalList = [
      {
        info: { index: 0, num: 'A', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '7.69%' },
      },
      {
        info: { index: 0, num: 'A', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '7.69%' },
      },
      {
        info: { index: 0, num: 'A', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '7.69%' },
      },
      {
        info: { index: 0, num: 'A', color: 'spades', cnColor: '♠', higher: '92.31%', lower: '7.69%' },
      },
    ];
    if (this.innerElement) {
      const innerElement = this.innerElement.nativeElement as HTMLElement;
      innerElement.classList.remove('mounted');
    }

    this.currentIndex = 0;
    clearInterval(this.heartbeat);
    this.freshPokerList();
  }

  //赢钱提示信息框 需要优化成一个组件
  showWinToast(winLossAmount: number) {
    this.showWin = true;
    this.iconService.hiloWinAudioPlay();
    this.winToast = this.currencyValuePipe.transform(
      Number(this.betService.money$.value).add(winLossAmount),
      this.currentCurrencyData.currency
    );

    setTimeout(() => {
      this.showWin = false;
    }, 4000);
  }
}
