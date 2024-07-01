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
import { LimboApi } from '../../shared/apis/limbo.api';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';
import { WsService } from '../../shared/services/ws.service';
@UntilDestroy()
@Component({
  selector: 'orignal-limbo',
  templateUrl: './limbo.component.html',
  styleUrls: ['./limbo.component.scss'],
})
export class LimboComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private limboApi: LimboApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private currencyValuePipe: CurrencyValuePipe,
    private cacheService: CacheService,
    private layout: LayoutService,
    private nativeAppService: NativeAppService
  ) {
    this.appService.currentCurrency$.pipe(distinctUntilChanged(), untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.currentCurrencyData = x;
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

  @ViewChild('limboWheel') limboWheelElement!: ElementRef;
  @ViewChild('limboSides') limboSidesElement!: ElementRef;
  @ViewChild('arrowDown') arrowDownElement!: ElementRef;

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
  betType = 'limbo';
  /** 心跳定时器 */
  heartbeat: any = null;

  /** 当前选择币种信息 */
  currentCurrencyData!: CurrenciesInterface;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 兑换倍数*/
  rate!: number;
  /** 是否在自动投注 */
  isLoop: boolean = false;
  /** 自动投注是否投注成功 */
  isLoopbet: boolean = false;
  /** 投注中 */
  loading!: boolean;
  /** 历史记录*/
  historyList: Array<any> = [];
  /** 倍数动画*/
  stepValue: string = '1.00';
  /** 是否开始动画*/
  isRun: boolean = false;
  /** 开奖结果*/
  winloseData: any = {};
  /** 倍数颜色变化 */
  roleColor: string = '';
  allCurrencyBalance: CurrencyBalance[] = [];
  /** 是否登录 */
  isLogin: boolean = false;
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(v => {
      this.isLogin = v ? true : false;
      this.ws?.destory();
      this.stopAutoLoop();
      this.loading = false;
      this.isBet = false;
      this.stepValue = '1.00';
      this.roleColor = '';
      if (v) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/limbo/open?token=${this.orignalService.token}`);
      }
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    this.rate = 2;
    this.iconService.init('limbo');
    this.isAnimation = this.cacheService.animation;

    setTimeout(() => {
      this.iconService.limboBGAudioPlay();
    }, 800);

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
          //q-乘数上升
          case 81:
            this.operate = { value: 'rateAdd' };
            this.iconService.balanceAudioPlay();
            break;
          //w-乘数降低
          case 87:
            this.operate = { value: 'rateReduce' };
            this.iconService.balanceAudioPlay();
            break;
          //e-预言数字变大
          case 69:
            break;
          default:
            break;
        }
      }
    };
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
      this.stopAutoLoop();
      this.ws.sendMessage({ action: 'actionPublicKeyApi' });
    }
    if (data.code == 0) {
      // eslint-disable-next-line default-case
      switch (data.action) {
        case 'JoinRoom':
          this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          this.historyList = data.data.result;
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
          this.isRun = false;
          if (this.isLoopbet) {
            this.submitLoop(this.LoopData);
          }
          break;
        case 'actionBetApi':
          this.isRun = true;
          this.winloseData = data.data;
          if (this.isAnimation) {
            this.iconService.limboCarAudioPlay();
          }
          this.allCurrencyBalance = this.appService.userBalance$.value || [];
          const item = this.allCurrencyBalance.find(
            balanceItem => balanceItem.currency === this.currentCurrencyData.currency
          );
          if (item) {
            // 余额更新
            item.nonStickyBalance = item.nonStickyBalance.minus(data.data.lotteryAmount);
            this.appService.userBalance$.next([...this.allCurrencyBalance]);
            if (this.appService.isNativeApp) {
              this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item.nonStickyBalance);
            }
          }
          this.orignalService.chartMessage$.next({ gameId: 'limbo', amount: data.data.lotteryAmount, type: 'bet' });
          this.stepValue = '0';
          this.roleColor = '';
          this.setIncrement(data, e => {
            this.stepValue = e.divide(100).toDecimal(2);
            this.roleColor = Number(this.stepValue) >= this.rate ? 'bule' : '';
          });
          break;
        case 'actionAllBetApi':
          break;
      }
    }
  }
  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    this.iconService.limboBGAudioStop();
    this.appService.assetChangesLock$.next(false);
    if (this.isLogin) {
      if (this.appService.isNativeApp) {
        this.nativeAppService.onLockTitleMoney(false);
      }
      this.appService.assetChanges$.next({ related: 'Wallet' });
    }
    clearInterval(this.heartbeat);
  }

  toBet(event: Event) {
    if (this.loading || !this.isBet) return;
    this.isBet = false;
    this.loading = true;
    // this.stepValue = '1.00';
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
        target: Number(this.rate),
        isAuto: 'false',
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    });
  }

  // /** 自动投注 投注数 */

  LoopData: any = {};
  /** 记录上一把输赢*/
  winloseState: any = '';
  submitLoop(loopInfo: Event) {
    if (this.loading || !this.isBet) return;
    this.isBet = false;
    this.loading = true;
    // this.stepValue = '1.00';
    this.LoopData = loopInfo;
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    this.appService.assetChangesLock$.next(true);
    this.ws.sendMessage({
      action: 'actionBetApi',
      data: {
        betAmount: Number(this.LoopData.oldmoney ?? this.LoopData.money),
        numberId: this.fairnessData.numberId,
        currency: this.currentCurrencyData.currency,
        target: Number(this.rate),
        isAuto: 'true',
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    });
  }
  /**
   * 连续投注输赢处理
   *
   * @param data
   */
  winOrLossProcess(data: any) {
    /** 初始投注金额记住 ，此值保持不变*/
    const money = this.LoopData.money;
    /** 投注使用的金额 ，赢损增加满足后使用*/
    let oldmoney = this.LoopData.oldmoney ?? this.LoopData.money;
    if (data.active) {
      // 检查是增加还是重置
      if (!this.LoopData.win) {
        //检查是否有赢了增加百分比 ,并检查上一把输赢状态
        if (
          this.LoopData.winPercent &&
          this.LoopData.winPercent != '' &&
          (this.winloseState === '' || this.winloseState === 1) &&
          this.LoopData.losePercent &&
          this.LoopData.lose
        ) {
          oldmoney = Number(oldmoney).add(Number(this.LoopData.winPercent).divide(100).subtract(Number(oldmoney)));
          this.winloseState = data.active ? 1 : 2;
        } else {
          //赢了增加没填写的情况 金额变成初始投注值
          oldmoney = money;
        }
      } else {
        if (this.LoopData.winPercent && this.LoopData.winPercent != '') {
          oldmoney = Number(oldmoney).add(Number(this.LoopData.winPercent).divide(100).subtract(Number(oldmoney)));
          this.winloseState = data.active ? 1 : 2;
        }
      }

      // 一轮总输赢统计
      this.betService.winLoseAmount = Number(this.betService.winLoseAmount.add(data.winLossAmount).toDecimal(8));
    } else {
      // 检查是增加还是重置
      if (!this.LoopData.lose) {
        //检查是否有输了增加百分比
        if (
          this.LoopData.losePercent &&
          this.LoopData.losePercent != '' &&
          (this.winloseState === '' || this.winloseState === 2) &&
          this.LoopData.winPercent &&
          this.LoopData.win
        ) {
          oldmoney = Number(oldmoney).add(Number(this.LoopData.losePercent).divide(100).subtract(Number(oldmoney)));
          this.winloseState = data.active ? 1 : 2;
        } else {
          // 输了增加没填写的情况 金额变成初始投注值
          oldmoney = money;
        }
      } else {
        if (this.LoopData.losePercent && this.LoopData.losePercent != '') {
          oldmoney = Number(oldmoney).add(Number(this.LoopData.losePercent).divide(100).subtract(Number(oldmoney)));
          this.winloseState = data.active ? 1 : 2;
        }
      }
      // 一轮总输赢统计
      this.betService.winLoseAmount = Number(this.betService.winLoseAmount.minus(data.lotteryAmount).toDecimal(8));
    }
    // 检查是否有最大投注额
    if (
      this.LoopData.MaxbetNmb &&
      this.LoopData.MaxbetNmb != '' &&
      Number(oldmoney) > Number(this.LoopData.MaxbetNmb)
    ) {
      oldmoney = this.LoopData.MaxbetNmb;
    }

    console.log(
      this.betService.winLoseAmount,
      '一轮总输赢--',
      data.winLossAmount,
      '-可盈金额--',
      data.lotteryAmount,
      '-投注金-'
    );
    //检查是否有止盈
    if (this.LoopData.profitNmb != '' && this.betService.winLoseAmount >= this.LoopData.profitNmb) {
      this.stopAutoLoop();
      return;
    }
    //检查是否有止损
    if (
      this.LoopData.lossNmb &&
      this.LoopData.lossNmb != '' &&
      this.betService.winLoseAmount < 0 &&
      Math.abs(this.betService.winLoseAmount) >= this.LoopData.lossNmb
    ) {
      this.stopAutoLoop();
      return;
    }
    console.log(oldmoney);
    if (Number(oldmoney) > Number(this.LoopData.lotteryMaxAmount)) {
      oldmoney = this.LoopData.lotteryMaxAmount;
    }
    console.log(oldmoney);
    // 准备下一次投注
    this.LoopData.oldmoney = this.toNonExponential(oldmoney.toString());
    this.betService.money$.next(this.LoopData.oldmoney);
  }

  /**
   * 停止自动投注，状态初始化
   */
  stopAutoLoop() {
    this.isLoop = false;
    this.winloseState = '';
    this.isLoopbet = false;
  }
  /**
   *
   * @param {*} val 需要自增的数字
   * @param data
   * @param {*} callback 回调
   * @param {*} time  时间内做完
   */
  setIncrement(data: any, callback: (e: any) => void = () => {}, time = 1000) {
    let status = false,
      val = Number(data.data.lotteryBetDetail).subtract(100),
      step = Math.ceil(val / (time / 15)),
      count = 0,
      interval: any = null;
    interval = setInterval(async () => {
      if (count < val) {
        callback(count);
      } else {
        status = true;
        callback(val);
      }
      if (status) {
        clearInterval(interval);
        this.roleColor = Number(this.stepValue) >= this.rate ? 'bule' : 'red';

        this.historyList.unshift({
          lotteryBetDetail: this.winloseData.lotteryBetDetail,
          winLossAmount: this.winloseData.winLossAmount,
        });
        this.orignalService.chartMessage$.next({ gameId: 'limbo', amount: data.data.winLossAmount, type: 'set' });
        this.loading = false;
        console.log(1111);
        const item = this.allCurrencyBalance.find(
          balanceItem => balanceItem.currency === this.currentCurrencyData.currency
        );
        if (item && data.data.winLossAmount > 0) {
          const amount = data.data.winLossAmount.add(data.data.lotteryAmount);
          item.nonStickyBalance = item.nonStickyBalance.add(amount);
          this.appService.userBalance$.next([...this.allCurrencyBalance]);
          const winLossAmount = this.currencyValuePipe.transform(amount, this.currentCurrencyData.currency);
          this.appService.assetChangesAnimation$.next(winLossAmount);
          if (this.appService.isNativeApp) {
            this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item.nonStickyBalance);
          }
        }
        if (this.isLoop) {
          this.isLoopbet = true;
          this.winOrLossProcess(this.winloseData);

          // 投注数量减1
          if (this.LoopData.betNmb != '') {
            this.LoopData.betNmb = this.LoopData.betNmb - 1;
          }
          if (this.LoopData.betNmb === 0) {
            this.stopAutoLoop();
            this.LoopData.betNmb = '';
          }
          this.cacheService.loopInfos = { ...this.cacheService.loopInfos, betNmb: this.LoopData.betNmb };
        } else {
          this.stopAutoLoop();
        }
        if (val < 200) {
          await firstValueFrom(timer(500));
        }
        this.ws.sendMessage({ action: 'actionPublicKeyApi' });
      }
      count = count + step;
    }, 15);
  }

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
}
