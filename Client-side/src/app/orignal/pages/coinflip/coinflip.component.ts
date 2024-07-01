import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { CoinflipApi } from '../../shared/apis/coinflip.api';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';
import { WsService } from '../../shared/services/ws.service';

const ROTATE_STATUS = {
  START: 'start',
  END: 'end',
  STOP: 'stop',
};
@UntilDestroy()
@Component({
  selector: 'orignal-coinflip',
  templateUrl: './coinflip.component.html',
  styleUrls: ['./coinflip.component.scss'],
})
export class CoinflipComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private cacheService: CacheService,
    private coinflipApi: CoinflipApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private currencyValuePipe: CurrencyValuePipe,
    private layout: LayoutService
  ) {
    this.appService.currentCurrency$.pipe(distinctUntilChanged(), untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.currentCurrencyData = x;
      }
    });
    this.appService.themeSwitch$.pipe(untilDestroyed(this)).subscribe(v => {
      this.theme = v;
    });
    this.orignalService.gameName$.next(this.route.snapshot.data.name);
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });
  }
  @ViewChild('coin') coinElement!: ElementRef;
  isH5!: boolean;
  theme: string = '';
  /** 公平性验证的numberid和pubkey */
  fairnessData: any;
  /** 是否开启快速投注 */
  isFastBet!: boolean;
  /** 是否开启热键 */
  isHotkey!: boolean;
  /** 键盘操作 */
  operate: any;
  /**投注类型 */
  betType = 'coinflip';

  /** 当前选择币种信息 */
  currentCurrencyData?: CurrenciesInterface;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 是否投注成功 */
  isBetting: boolean = false;
  /** 心跳定时器 */
  heartbeat: any = null;
  /** 赔率 */
  rate = 0;
  /** 所有倍数列表 */
  allmultiplier: any = [];
  /** 是否可以选牌 */
  isChoose: boolean = false;
  /** 赢钱弹出框金额 */
  winMoney: string = '';
  /** 转盘函数 */
  rotate: any;
  /** 投注中 */
  loading!: boolean;
  /** 历史记录 0失败1成功*/
  historyList: Array<any> = [];
  /** 是否翻转硬币 */
  isFlipped: boolean = false;
  /** 是否是正面 */
  isHeads!: boolean;
  /** 用户选择 */
  selectedOption!: boolean;
  @ViewChild('circleCoinflip') circleCoinflipElement!: ElementRef;
  /** 是否登录 */
  isLogin: boolean = false;
  /** 次数 */
  series: string = '-';
  /** 下一个赔率 */
  nextMultiplier: number = 0;
  /** 赢钱弹窗 */
  showWin: boolean = false;
  winToast!: string;
  /** 投注金额 */
  money: string = '0.00000000';
  hisResult: any = [];
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.isLogin = x ? true : false;
      this.ws?.destory();
      this.clear();
      if (this.heartbeat) clearInterval(this.heartbeat);
      if (x) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/coinflip/open?token=${this.orignalService.token}`);
      }
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    // 操作声音初始化
    this.iconService.init('coinflip');

    let isFastKey = false;
    let count = 0;

    // 禁止空格键页面下滑s
    document.body.onkeydown = (e: any): any => {
      count++;
      if (e.ctrlKey || e.altKey || e.shiftKey || e.keyCode === 91) {
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
          //d-加倍
          case 81:
            this.handleGuess(true);
            this.iconService.balanceAudioPlay();
            break;
          //w-选小于或等于（A则是选等于，K则是选小于）
          case 87:
            // if (!this.isBetting) {
            //   if (this.bombCounts > 1) this.bombCounts--;
            // }
            this.handleGuess(false);
            this.iconService.balanceAudioPlay();
            break;
          default:
            break;
        }
      }
    };
    setTimeout(() => {
      this.iconService.coinflipBGAudioPlay();
    }, 500);
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
      this.clear();
      this.ws.sendMessage({ action: 'actionCurrentApi' });
    }
    if (data.code == 0) {
      // eslint-disable-next-line default-case
      switch (data.action) {
        case 'JoinRoom':
          this.historyList = data.data.result.map((e: any) => e.hisMultiplier);
          console.log(this.historyList);
          // 初次进入 查询是否有未结算的注单
          this.ws.sendMessage({ action: 'actionCurrentApi' });
          // 开启定时发送心跳
          clearInterval(this.heartbeat);
          this.heartbeat = setInterval(() => {
            this.ws.sendMessage({ action: 'type' });
          }, 15000);
          break;
        case 'actionCurrentApi':
          // 初次进入 查询是否有未结算的注单
          this.isChoose = data.data.currentFlag;
          if (data.data.currentFlag) {
            this.setCurrentBet(data.data);
          } else {
            this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          }
          break;
        case 'actionPublicKeyApi':
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.nextMultiplier = 0;
          this.isBet = true;
          this.loading = false;
          this.isChoose = false;
          this.betService.minesBetstate$.next({ betting: false });
          break;
        case 'actionBetApi':
          this.isBet = false;
          this.isChoose = true;
          this.isBetting = true;
          this.nextMultiplier = 1.9804;
          this.series = '0';
          this.rate = 0;
          this.hisResult = [];
          this.betService.minesBetstate$.next({ betting: true });
          this.orignalService.chartMessage$.next({ gameId: 'coinflip', amount: data.data.betAmount, type: 'bet' });
          break;
        case 'actionChooseApi':
          this.flipCoin(data.data);

          break;

        case 'actionSettlementApi':
          // 结算成功
          this.historyList.unshift(data.data.multiplier);
          this.isBetting = false;
          this.isChoose = false;
          this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          this.showWinToast(data.data.winLossAmount);
          this.orignalService.chartMessage$.next({ gameId: 'coinflip', amount: data.data.winLossAmount, type: 'set' });
          break;
        default:
          break;
      }
    }
  }

  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    this.rotate?.stop();
    this.iconService.coinflipBGAudioStop();
    // this.appService.assetChangesLock$.next(false);
    if (this.isLogin) {
      this.appService.assetChanges$.next({ related: 'Wallet' });
    }
    if (this.heartbeat) clearInterval(this.heartbeat);
  }
  /**
   * 获取当前用户未结算注单信息
   *
   * @param data
   */
  async setCurrentBet(data: any) {
    this.isBetting = true;
    this.money = data.betAmount;
    this.betService.minesBetstate$.next({ betting: true, money: data.betAmount });
    this.hisResult = data.hisResult ? data.hisResult.split(',').map((str: string) => Number(str)) : [];
    console.log(this.hisResult);
    this.rate = data.multiplier;
    this.nextMultiplier = data.nextMultiplier;
    this.series = data.series;
  }
  toBet(event: Event) {
    if (this.loading || !this.isBet) return;
    this.iconService.balanceAudioPlay();
    this.loading = true;
    this.showWin = false;
    this.hisResult = [];
    this.betService.minesBetstate$.next({ betting: true });
    // this.appService.assetChangesLock$.next(true);
    const data = {
      betAmount: Number(event),
      numberId: this.fairnessData.numberId,
      currency: this.orignalService.currentCurrencyData.currency,
      fastType: this.isFastBet ? 1 : 0,
    };
    const betData = {
      action: 'actionBetApi',
      data: data,
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    this.ws.sendMessage(betData);
  }
  /**
   * 结算
   *
   * @param event
   */
  toSubmit(event: any) {
    if (this.hisResult.length == 0) return;
    this.iconService.balanceAudioPlay();
    this.isBetting = false;
    this.ws.sendMessage({
      action: 'actionSettlementApi',
    });
  }

  /**
   * 用户猜测结果
   *
   * @param guess
   */
  handleGuess(guess: boolean) {
    if (!this.isBetting || !this.isChoose) return;
    this.iconService.balanceAudioPlay();
    this.isChoose = false;
    this.selectedOption = guess;
    console.log('==', this.selectedOption);
    this.ws.sendMessage({
      action: 'actionChooseApi',
      data: {
        compareFlag: guess ? 1 : 0,
      },
    });
  }

  /**
   *  科学计算替换
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
   * 翻转硬币
   *
   * @param guess
   * @param data
   */
  flipCoin(data: any) {
    const coinElement = this.coinElement?.nativeElement as HTMLElement;
    // 模拟硬币翻转
    this.isFlipped = true;
    coinElement.style.transition = 'transform 1s';

    if (this.isHeads) {
      // 结果也是正面 旋转360度
      coinElement.style.transform = data.coinResult ? 'rotateX(360deg)' : 'rotateX(540deg)';
    } else {
      coinElement.style.transform = data.coinResult ? 'rotateX(540deg)' : 'rotateX(360deg)';
    }
    this.iconService.coinflipSoundAudioPlay();
    setTimeout(() => {
      this.isHeads = data.coinResult;
      // 随机选择 type
      this.hisResult.push(data.coinResult);
      this.isFlipped = false;
      coinElement.style.transition = '';
      coinElement.style.transform = '';
      this.nextMultiplier = data.nextMultiplier ? data.nextMultiplier : 0;
      // 处理游戏逻辑
      if (data.series) {
        this.iconService.coinflipWinAudioPlay();
        this.rate = data.multiplier;
        this.isChoose = true;
        this.series = data.series.toString();
        this.betService.minesBetstate$.next({ betting: true });
      } else {
        this.series = this.series == '-' ? '1' : (Number(this.series) + 1).toString();
        // 结算
        if (data.active) {
          this.iconService.coinflipWinAudioPlay();
          this.historyList.unshift(data.multiplier);
          this.rate = data.multiplier;
          this.showWinToast(data.winLossAmount);
        } else {
          this.historyList.unshift(0);
          this.iconService.coinfliptLossAudioPlay();
        }
        this.orignalService.chartMessage$.next({ gameId: 'coinflip', amount: data.winLossAmount, type: 'set' });

        this.ws.sendMessage({ action: 'actionPublicKeyApi' });
        this.isBetting = false;
      }
    }, 1300); // 设置一个延迟时间，模拟硬币旋转的效果
  }

  /** 用户是否猜对 */
  handleGameLogic() {
    // // 获取最近一次的历史记录
    // const latestResult = this.historyList[this.historyList.length - 1];
    // const guessedCorrectly =
    //   (latestResult.type === 1 && latestResult.pic === 'front' && this.selectedOption === true) ||
    //   (latestResult.type === 0 && latestResult.pic === 'back' && this.selectedOption === false);
    // if (guessedCorrectly) {
    //   console.log('You guessed correctly!');
    //   // 处理猜测正确的情况
    // } else {
    //   console.log('You guessed incorrectly!');
    //   // 处理猜测错误的情况
    // }
  }

  /**
   * 不同的倍率显示不同颜色
   *
   * @param odds 倍率
   * @returns
   */
  getItemBackgroundColor(odds: number): string {
    if (odds > 0 && odds <= 1.9804) {
      return '#FF23CF';
    } else if (odds > 1.9804 && odds <= 3.9804) {
      return '#32BFDE';
    } else if (odds > 3.9804 && odds <= 7.9216) {
      return '#3ECC7F';
    } else if (odds > 7.9216 && odds <= 15.8432) {
      return '#328FDE';
    } else if (odds > 15.8432 && odds <= 31.6864) {
      return '#32BFDE';
    } else if (odds > 31.6864 && odds <= 63.3728) {
      return '#A054FF';
    } else if (odds > 63.3728 && odds <= 126.7456) {
      return '#328FDE';
    } else if (odds > 126.7456 && odds <= 248.5248) {
      return '#E04461';
    } else if (odds > 248.5248 && odds <= 497.0496) {
      return '#3ECC7F';
    } else if (odds > 497.0496 && odds <= 994.0992) {
      return '#32BFDE';
    } else {
      // 默认情况下返回一个默认的背景颜色
      return '#55657E';
    }
  }

  //赢钱提示信息框 需要优化成一个组件
  showWinToast(winLossAmount: number) {
    this.iconService.minesSuccessAudioPlay();
    this.showWin = true;
    this.iconService.hiloWinAudioPlay();
    this.winToast = this.currencyValuePipe.transform(
      Number(this.betService.money$.value).add(winLossAmount),
      this.currentCurrencyData?.currency ?? ''
    );

    setTimeout(() => {
      this.showWin = false;
    }, 3000);
  }
  clear() {
    this.isBet = false;
    this.isChoose = false;
    this.isBetting = false;
    this.nextMultiplier = 0;
    this.rate = 0;
    this.hisResult = [];
    this.series = '-';
  }
}
