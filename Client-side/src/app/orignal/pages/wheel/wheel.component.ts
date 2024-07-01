import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
import { WheelApi } from '../../shared/apis/wheel.api';
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
  selector: 'orignal-wheel',
  templateUrl: './wheel.component.html',
  styleUrls: ['./wheel.component.scss'],
})
export class WheelComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private cacheService: CacheService,
    private wheelApi: WheelApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private currencyValuePipe: CurrencyValuePipe,
    private layout: LayoutService,
    private nativeAppService: NativeAppService
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
  betType = 'wheel';

  /** 当前选择币种信息 */
  currentCurrencyData?: CurrenciesInterface;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 心跳定时器 */
  heartbeat: any = null;
  /** 赔率 */
  rate = 1;
  /** 是否在自动投注 */
  isLoop: boolean = false;
  /** 自动投注是否投注成功 */
  isLoopbet: boolean = false;

  /** 倍数列表 */
  multiplier: any = [];
  /** 底部赔率显示列表 */
  bottomMultiplier: any = [];
  /** 所有倍数列表 */
  allmultiplier: any = [];
  /** 排数  risk: "middling" subsection: 50*/
  subsection: number = 50;
  // 对应颜色  white白色、green绿色、blue蓝色、red红色、yellow黄色、purple紫色
  /** 风险 低等：low，中等：middling，高等：higher，极端：extreme   */
  selectedRisk: string = 'middling';

  /** 赢钱弹出框金额 */
  winMoney: string = '';
  /** 转盘函数 */
  rotate: any;
  /** 投注中 */
  loading!: boolean;
  /** 中间状态 1显示logo 2中奖 3未中奖*/
  type: number = 1;
  /** 显示结果颜色 */
  color = '';
  /** 倍数结果颜色 */
  roteColor = '';
  /** 结束角度 */
  angle: number = 0;

  allCurrencyBalance: CurrencyBalance[] = [];
  /** 是否登录 */
  isLogin: boolean = false;
  @ViewChild('circleWheel') circleWheelElement!: ElementRef;
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(v => {
      this.isLogin = v ? true : false;
      this.ws?.destory();
      this.stopAutoLoop();
      this.type = 1;
      if (v) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/wheel/open?token=${this.orignalService.token}`);
      }
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    this.iconService.init('wheel');

    setTimeout(() => {
      this.rotate = this.rotateAnything();
      this.iconService.wheelBGAudioPlay();
    }, 500);

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
      this.stopAutoLoop();
      this.loading = false;
      this.isBet = false;
      this.rotate.stop();
      this.ws.sendMessage({ action: 'actionPublicKeyApi' });
    }
    if (data.code == 0) {
      // eslint-disable-next-line default-case
      switch (data.action) {
        case 'JoinRoom':
          this.setMultiplier();
          clearInterval(this.heartbeat);
          this.heartbeat = setInterval(() => {
            this.ws.sendMessage({ action: 'type' });
          }, 15000);
          break;
        case 'actionMultiplierApi':
          this.allmultiplier = data.data;
          // 根据炸弹获取对应的赔率
          this.getMultiplier();
          // 初次进入 查询miens是否有未结算的注单
          this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          break;
        case 'actionPublicKeyApi':
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.isBet = true;
          if (this.isLoopbet) {
            this.submitLoop(this.LoopData);
          }
          break;
        case 'actionBetApi':
          this.orignalService.chartMessage$.next({ gameId: 'wheel', amount: data.data.betAmount, type: 'bet' });
          this.isBet = false;
          this.angle = (this.subsection - data.data.index - 1) * (360 / this.subsection) + 360 / this.subsection / 2;
          this.allCurrencyBalance = this.appService.userBalance$.value || [];
          const item = this.allCurrencyBalance.find(
            balanceItem => balanceItem.currency === this.currentCurrencyData?.currency
          );
          if (item) {
            // 余额更新
            item.nonStickyBalance = item.nonStickyBalance.minus(data.data.betAmount);
            this.appService.userBalance$.next([...this.allCurrencyBalance]);
            if (this.appService.isNativeApp) {
              this.nativeAppService.onCurrentMoney(this.currentCurrencyData?.currency ?? '', item.nonStickyBalance);
            }
          }
          if (!this.isFastBet) {
            setTimeout(() => {
              this.rotate
                ?.end({
                  angle: this.angle,
                })
                .then(() => {
                  this.endRotate(data);
                  this.circleWheelElement.nativeElement.style.transform = `rotate(${this.angle}deg)`;
                  this.orignalService.chartMessage$.next({
                    gameId: 'wheel',
                    amount: data.data.winLossAmount,
                    type: 'set',
                  });
                  if (item && data.data.winLossAmount > 0) {
                    const amount = data.data.winLossAmount.add(data.data.betAmount);
                    item.nonStickyBalance = item.nonStickyBalance.add(amount);
                    this.appService.userBalance$.next([...this.allCurrencyBalance]);
                    const winLossAmount = this.currencyValuePipe.transform(
                      amount,
                      this.currentCurrencyData?.currency ?? ''
                    );
                    this.appService.assetChangesAnimation$.next(winLossAmount);
                    if (this.appService.isNativeApp) {
                      this.nativeAppService.onCurrentMoney(
                        this.currentCurrencyData?.currency ?? '',
                        item.nonStickyBalance
                      );
                    }
                  }
                });
            }, 1000);
          } else {
            this.circleWheelElement.nativeElement.style.transform = `rotate(${this.angle}deg)`;
            this.endRotate(data);
            this.orignalService.chartMessage$.next({ gameId: 'wheel', amount: data.data.winLossAmount, type: 'set' });
            if (item && data.data.winLossAmount > 0) {
              const amount = data.data.winLossAmount.add(data.data.betAmount);
              item.nonStickyBalance = item.nonStickyBalance.add(amount);
              this.appService.userBalance$.next([...this.allCurrencyBalance]);
              const winLossAmount = this.currencyValuePipe.transform(amount, this.currentCurrencyData?.currency ?? '');
              this.appService.assetChangesAnimation$.next(winLossAmount);
              if (this.appService.isNativeApp) {
                this.nativeAppService.onCurrentMoney(this.currentCurrencyData?.currency ?? '', item.nonStickyBalance);
              }
            }
          }

          break;
        default:
          break;
      }
    }
  }
  endRotate(data: any) {
    this.winMoney = this.currencyValuePipe.transform(
      Number(this.betService.money$.value).add(data.data.winLossAmount),
      this.currentCurrencyData?.currency ?? ''
    );
    this.rate = data.data.multiplier;
    this.type = data.data.active ? 2 : 3;
    this.color = data.data.color;
    this.roteColor = data.data.color;
    if (data.data.active) {
      this.iconService.winAudioPlay();
    } else {
      this.iconService.loseAudioPlay();
    }
    if (this.isLoop) {
      this.isLoopbet = true;
      this.winOrLossProcess(data);

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
    this.loading = false;
    this.ws.sendMessage({ action: 'actionPublicKeyApi' });
  }
  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    this.rotate?.stop();
    this.iconService.wheelBGAudioStop();
    this.appService.assetChangesLock$.next(false);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(false);
    }
    if (this.isLogin) {
      this.appService.assetChanges$.next({ related: 'Wallet' });
    }
    if (this.heartbeat) clearInterval(this.heartbeat);
  }
  /**
   * 获取所有赔率
   */
  setMultiplier() {
    this.ws.sendMessage({
      action: 'actionMultiplierApi',
    });
  }
  /**
   * 根据炸弹数获取赔率
   */
  getMultiplier() {
    const data = this.allmultiplier.filter((e: any) => e.subsection == this.subsection && e.risk == this.selectedRisk);
    this.multiplier = data.sort((a: any, b: any) => {
      return a.index - b.index;
    });
    // 获取底部赔率显示
    this.bottomMultiplier = this.multiplier.reduce(function (tempArr: any, item: any) {
      if (tempArr.findIndex((ele: any) => ele.color === item.color) === -1) {
        item.multiplier = Number(item.multiplier).toDecimal(2);
        tempArr.push(item);
      }
      return tempArr;
    }, []);
    this.bottomMultiplier = this.bottomMultiplier.sort((a: any, b: any) => {
      return Number(a.multiplier) - Number(b.multiplier);
    });
  }
  toBet(event: Event) {
    if (this.loading || !this.isBet) return;
    this.loading = true;
    if (!this.isFastBet) {
      console.log(this.angle);
      this.rotate?.start({ angle: this.angle });
    }
    this.iconService.balanceAudioPlay();
    this.type = 1;
    this.betService.minesBetstate$.next({ betting: true });
    this.appService.assetChangesLock$.next(true);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    const data = {
      betAmount: Number(event),
      numberId: this.fairnessData.numberId,
      currency: this.orignalService.currentCurrencyData.currency,
      subsection: this.subsection,
      risk: this.selectedRisk,
      fastType: this.isFastBet ? 1 : 0,
    };
    const betData = {
      action: 'actionBetApi',
      data: data,
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    this.ws.sendMessage(betData);
    // setTimeout(() => {
    //   this.rotate?.end({
    //     angle: (this.subsection - 0 - 1) * (360 / this.subsection) + 360 / this.subsection / 2,
    //   });
    // }, 3000);
  }
  LoopData: any = {};
  /** 记录上一把输赢*/
  winloseState: any = '';
  /** 投注获得利润 */
  lotteryBetReturnAmount: number = 0;
  submitLoop(loopInfo: any) {
    if (this.loading || !this.isBet) return;
    if (!this.fairnessData.numberPublicKey || !this.fairnessData.numberId) return;

    this.iconService.balanceAudioPlay();
    this.loading = true;
    this.LoopData = loopInfo;
    if (!this.isFastBet) {
      this.rotate?.start({ angle: this.angle });
    }
    // this.type = 1;
    this.appService.assetChangesLock$.next(true);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    const data = {
      betAmount: Number(this.LoopData.oldmoney ?? this.LoopData.money),
      numberId: this.fairnessData.numberId,
      currency: this.orignalService.currentCurrencyData.currency,
      subsection: this.subsection,
      risk: this.selectedRisk,
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
   * 连续投注输赢处理
   *
   * @param data
   */
  winOrLossProcess(data: any) {
    /** 初始投注金额记住 ，此值保持不变*/
    const money = this.LoopData.money;
    /** 投注使用的金额 ，赢损增加满足后使用*/
    let oldmoney = this.LoopData.oldmoney ?? this.LoopData.money;
    if (data.data.active) {
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
          this.winloseState = data.data.active ? 1 : 2;
        } else {
          //赢了增加没填写的情况 金额变成初始投注值
          oldmoney = money;
        }
      } else {
        if (this.LoopData.winPercent && this.LoopData.winPercent != '') {
          oldmoney = Number(oldmoney).add(Number(this.LoopData.winPercent).divide(100).subtract(Number(oldmoney)));
          this.winloseState = data.data.active ? 1 : 2;
        }
      }

      // 一轮总输赢统计
      this.betService.winLoseAmount = Number(this.betService.winLoseAmount.add(data.data.winLossAmount).toDecimal(8));
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
          this.winloseState = data.data.active ? 1 : 2;
        } else {
          // 输了增加没填写的情况 金额变成初始投注值
          oldmoney = money;
        }
      } else {
        if (this.LoopData.losePercent && this.LoopData.losePercent != '') {
          oldmoney = Number(oldmoney).add(Number(this.LoopData.losePercent).divide(100).subtract(Number(oldmoney)));
          this.winloseState = data.data.active ? 1 : 2;
        }
      }
      // 一轮总输赢统计
      this.betService.winLoseAmount = Number(this.betService.winLoseAmount.minus(data.data.betAmount).toDecimal(8));
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
      data.data.winLossAmount,
      '-可盈金额--',
      data.data.betAmount,
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
    if (Number(oldmoney) > Number(this.LoopData.lotteryMaxAmount)) {
      oldmoney = this.LoopData.lotteryMaxAmount;
    }
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
    this.betService.minesBetstate$.next({ betting: false });
  }
  /**
   * 风险等级
   *
   * @param e
   */
  riskChange(e: string) {
    if (this.loading || this.isLoop) return;
    this.selectedRisk = e;
    this.getMultiplier();
    this.type = 1;
  }
  /**
   * 排数
   *
   * @param e
   */
  rowChange(e: number) {
    if (this.loading || this.isLoop) return;
    this.subsection = e;
    this.getMultiplier();
    this.type = 1;
  }

  rotateAnything() {
    const ONE_CIRCLE = 360;
    const elem = this.circleWheelElement.nativeElement;
    elem.style.willChange = 'transform';
    let tweenRes: any = null;
    let rotateStatu = '';
    const tweenExcution = ({ startValue, endValue, duration, infinite, easingFn, stepCb }: any) => {
      const perUpdateDistance = 1000 / (duration * 60);
      const diffValue = endValue - startValue;
      console.log(startValue);
      let position = 0;
      let prevState = 0;
      let state = startValue;
      let maxDiffState = 0;
      let shouldStop = false;
      this.color = '';
      const step = () => {
        // const runAreaNum = this.subsection - parseInt(((state % 360) / (360 / this.subsection)).toString());
        if (shouldStop) return;

        if (position < 1) {
          // 按 easingFn 进行运动
          position += perUpdateDistance;
          prevState = state;
          state = startValue + diffValue * easingFn(position);

          stepCb(state);
          this.rAF(step);
        } else if (infinite) {
          if (maxDiffState == 0) {
            maxDiffState = state - prevState;
          }
          state += maxDiffState;

          stepCb(state);
          this.rAF(step);
        }
      };

      step();

      return {
        stop() {
          shouldStop = true;
        },
        getState() {
          return state;
        },
      };
    };
    const easeInQuad = (x: number) => {
      return x * x;
    };
    const easeOutQuad = (x: number) => {
      return 1 - (1 - x) * (1 - x);
    };
    const sleep = (time: any) => {
      return new Promise(resolve => setTimeout(resolve, time));
    };

    return {
      start({ angle = 0, easingFn = easeInQuad, duration = 2000 } = {}) {
        if (tweenRes) tweenRes.stop();
        console.log(angle);
        tweenRes = tweenExcution({
          startValue: angle,
          endValue: angle + 720,
          duration,
          infinite: true,
          easingFn,
          stepCb: (v: number) => {
            elem.style.transform = `rotate(${v}deg)`;
          },
        });
      },
      end({ angle = 0, easingFn = easeOutQuad, duration = 800 } = {}) {
        // if (rotateStatu !== ROTATE_STATUS.START) return Promise.resolve();
        if (tweenRes) tweenRes.stop();
        rotateStatu = ROTATE_STATUS.END;
        const currentValue = tweenRes?.getState();
        const remainAngle = ONE_CIRCLE - (currentValue % ONE_CIRCLE) + angle;
        tweenExcution({
          startValue: currentValue,
          endValue: currentValue + remainAngle,
          duration,
          easingFn,
          infinite: false,
          stepCb: (v: number) => {
            elem.style.transform = `rotate(${v}deg)`;
          },
        });
        return sleep(duration);
      },
      stop() {
        rotateStatu = ROTATE_STATUS.STOP;
        tweenRes?.stop();
        return tweenRes?.getState();
      },
    };
  }

  rAF(cb: any) {
    requestAnimationFrame(cb);
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
}
