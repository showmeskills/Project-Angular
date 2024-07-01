import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { SlideApi } from '../../shared/apis/slide.api';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';
import { WsService } from '../../shared/services/ws.service';

@UntilDestroy()
@Component({
  selector: 'orignal-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
})
export class SlideComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private cacheService: CacheService,
    private coinflipApi: SlideApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private currencyValuePipe: CurrencyValuePipe,
    private layout: LayoutService,
    private nativeAppService: NativeAppService,
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
    this.tenant = environment.common.tenant;
  }
  @ViewChild('monitorDiv', { static: true }) monitorDiv!: ElementRef;
  @ViewChild('slideTransform') slideTransform!: ElementRef;
  /** 区分商户 */
  tenant: string = '';
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
  betType = 'slide';

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

  /** 转盘函数 */
  rotate: any;
  /** 投注中 */
  loading!: boolean;
  /** 历史记录 0失败1成功*/
  historyList: Array<any> = [];
  results: any = [];
  /** 是否在自动投注 */
  isLoop: boolean = false;
  /** 自动投注是否投注成功 */
  isLoopbet: boolean = false;
  /** 是否登录 */
  isLogin: boolean = false;
  /** 投注金额 */
  money: string = '0.00000000';
  slideList: {
    itemWidth: string;
    rote: string;
  }[] = [];
  slideWidth?: number;
  goalX?: number;
  /** 投注状态 1.开始投注，2.结束投注 3.展示结果 4.准备下一轮*/
  showState: number = 4;
  /** 实时下注消息 */
  realHistoryList: any = [];
  // /** 倍数列表 */
  // hisResults: Array<string> = [];
  /** 倍数列表 */
  allValues: Array<string> = [];
  resulTime: any = null;
  /** 记录投注的ID，与中奖ID判断自己是否中奖 */
  mainAccountId!: number;
  allCurrencyBalance: CurrencyBalance[] = [];
  /** 限额 */
  limit: any;
  // 最大盈利限制金额
  lotteryMaxQuota = 0;
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(v => {
      this.isLogin = v ? true : false;
      clearInterval(this.timerCount);
      clearTimeout(this.resulTime);
      this.betService.isChangeActive$.next(true);
      let token = '';
      if (v) {
        token = this.orignalService.token;
      } else if (v === false) {
        token = 'test-SLIDE-' + Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 5));
      } else {
        return;
      }
      if (!token) {
        this.ws?.destory();
        return;
      }
      this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/slide/open?token=${token}`);
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    // 操作声音初始化
    this.iconService.init('slide');
    this.rate = 2;
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
    this.betService.limitList$.pipe(untilDestroyed(this)).subscribe(v => {
      this.limit = v.find((cur: any) => cur.currency === this.currentCurrencyData?.currency);
      console.log(this.limit);
      this.lotteryMaxQuota = this.limit?.lotteryMaxQuota;
    });
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
    // setTimeout(() => {
    //   this.iconService.coinflipBGAudioPlay();
    // }, 500);
    // this.slideList = [].constructor(100);

    // this.historyList = [1.21, 2.31, 3.61, 45.1, 1.21, 2.31, 3.61, 45.1, 1.21, 2.31, 3.61, 45.1, 1.21];
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    // 在窗口大小变化时触发的事件
    this.logWidth(this.allValues);
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
      this.isBet = true;
      this.betService.isChangeActive$.next(true);
    }
    if (data.code == 0) {
      // eslint-disable-next-line default-case
      switch (data.action) {
        case 'JoinRoom':
          // this.rotate = this.rotateAnything();
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.results = data.data.roundNumRecord.hisResults.splice(0, 26);

          this.allValues = data.data.recentResult;
          this.logWidth(this.allValues);
          this.showState = 4;
          if (data.data.endTime) {
            // 有倒计时说明可以投注状态
            this.showState = 1;
            this.isBet = true;
            this.endTime = Number(data.data.endTime);
            this.onProgress();
          }
          this.loading = data.data.endTime ? false : true;
          break;
        case 'actionStopBettingApi':
          clearInterval(this.timerCount);
          this.timerCount = null;
          this.progressWidth = '0%';
          // 停止下注
          this.showState = 2;
          this.loading = true;
          break;
        case 'actionResultApi':
          // 获取结果
          this.loading = true;
          this.allValues = data.data.allValues;
          this.startAnimation();
          this.showState = 3;

          this.resulTime = setTimeout(() => {
            this.results.unshift(data.data.value);
            if (this.results.length > 30) {
              this.results.pop();
            }
            clearTimeout(this.resulTime);

            // 中奖后，改变实时投注颜色
            this.realHistoryList.forEach((e: any) => {
              if (Number(e.stop) <= Number(data.data.value)) {
                e.winColor = true;
              }
            });
            this.orignalService.realHistoryList$.next(this.realHistoryList);

            const item = this.allCurrencyBalance.find(
              balanceItem => balanceItem.currency === this.currentCurrencyData?.currency,
            );
            // 整体输赢金额
            let winLossAmount = 0;
            // 总投注金额
            let lotteryAmount = 0;
            let BetAmount = 0;
            this.realHistoryList.forEach((e: any) => {
              if (this.mainAccountId == e.mainAccountId) {
                BetAmount = e.BetAmount;
                lotteryAmount = lotteryAmount.add(Number(e.BetAmount));
                if (Number(e.stop) <= Number(data.data.value)) {
                  // 返还金额
                  let refundAmount = Number(e.BetAmount).subtract(Number(e.stop));
                  if (refundAmount > this.lotteryMaxQuota.add(Number(e.BetAmount))) {
                    refundAmount = this.lotteryMaxQuota.add(Number(e.BetAmount));
                  }
                  winLossAmount += refundAmount;
                  // 余额改变
                  if (item && this.currentCurrencyData) {
                    const amount = refundAmount;
                    this.orignalService.chartMessage$.next({
                      gameId: 'slide',
                      amount: Number(amount).minus(Number(e.BetAmount)),
                      type: 'set',
                    });
                    item.nonStickyBalance = item.nonStickyBalance.add(amount);
                    this.appService.userBalance$.next([...this.allCurrencyBalance]);
                    const winLossAmount = this.currencyValuePipe.transform(amount, this.currentCurrencyData.currency);
                    this.appService.assetChangesAnimation$.next(winLossAmount);
                    if (this.appService.isNativeApp) {
                      this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item.nonStickyBalance);
                    }
                  }
                } else {
                  winLossAmount = winLossAmount.minus(Number(e.BetAmount));
                  this.orignalService.chartMessage$.next({
                    gameId: 'slide',
                    amount: -Number(e.BetAmount),
                    type: 'set',
                  });
                }
              }
            });
            // 余额改变

            // if (item && winLossAmount > 0) {
            //   const amount = winLossAmount.add(lotteryAmount);
            //   item.balance = item.balance.add(amount);
            //   this.appService.userBalance$.next([...this.allCurrencyBalance]);
            //   const winLossAmount = this.currencyValuePipe.transform(amount, this.currentCurrencyData.currency);
            //   this.appService.assetChangesAnimation$.next(winLossAmount);
            //   if (this.appService.isNativeApp) {
            //     this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item.balance);
            //   }
            // }
            //自动投注 统计当前用户整体输赢
            if (this.isLoopbet && this.isLoop) {
              console.log('------整体输赢金额-------', winLossAmount);
              console.log('------总投注金额-------', lotteryAmount);
              this.winOrLossProcess({
                active: winLossAmount >= 0 ? true : false,
                lotteryAmount: lotteryAmount,
                winLossAmount: winLossAmount,
                betAmount: Number(BetAmount),
              });
            }
            console.log(this.realHistoryList);
          }, 7000);

          break;
        case 'actionPublicKeyApi':
          // 开始下注
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.endTime = data.data.end;
          this.onProgress();
          this.loading = false;
          this.isBet = true;
          this.showState = 1;
          this.betService.isChangeActive$.next(true);
          if (this.isLoop) {
            this.submitLoop(this.LoopData);
          }
          break;
        case 'actionBetApi':
          // 自己投注成功
          this.loading = false;
          this.mainAccountId = data.data.uid;
          this.allCurrencyBalance = this.appService.userBalance$.value || [];
          this.orignalService.chartMessage$.next({ gameId: 'slide', amount: data.data.betAmount, type: 'bet' });
          const item = this.allCurrencyBalance.find(
            balanceItem => balanceItem.currency === this.currentCurrencyData?.currency,
          );
          if (item) {
            // 余额更新
            item.nonStickyBalance = item.nonStickyBalance.minus(data.data.betAmount);
            this.appService.userBalance$.next([...this.allCurrencyBalance]);
            if (this.appService.isNativeApp) {
              this.nativeAppService.onCurrentMoney(this.currentCurrencyData?.currency ?? '', item.nonStickyBalance);
            }
          }
          if (this.isLoop) {
            this.isLoopbet = true;
            // 投注数量减1
            if (this.LoopData.betNmb != '') {
              this.LoopData.betNmb = this.LoopData.betNmb - 1;
            }
            if (this.LoopData.betNmb === 0) {
              this.stopAutoLoop();
              this.LoopData.betNmb = '';
            }
            this.cacheService.loopInfos = { ...this.cacheService.loopInfos, betNmb: this.LoopData.betNmb };
          }
          break;
        case 'actionAllBetApi':
          // 所有人投注信息
          const dataIcon = this.appService.currencies$.value.find((e: any) => e.currency == data.data.currency);
          let BetAmount = Number(data.data.BetAmount).toDecimal(8);
          let max_chars = 9;
          const rep = /[.]/;
          if (rep.test(BetAmount)) {
            max_chars = 10;
          }
          BetAmount = BetAmount.substr(0, max_chars);
          if (dataIcon) {
            if (Number(this.tenant) == Number(data.data.uid.substring(0, 2))) {
              this.realHistoryList.push({
                BetAmount: BetAmount,
                color: data.data.color,
                icon: dataIcon.icon,
                stop: data.data.multiplier,
                mainAccountId: data.data.uid,
                userName: data.data.userName ? data.data.userName : this.localeService.getValue('invisible'),
              });
              this.orignalService.realHistoryList$.next(this.realHistoryList);
            }
          }
          break;
        case 'preparingNextRound':
          // 准备下一轮
          this.loading = true;
          this.showState = 4;
          this.realHistoryList = [];
          this.orignalService.realHistoryList$.next(this.realHistoryList);
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
    this.appService.assetChangesLock$.next(false);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(false);
    }
    if (this.isLogin) {
      this.appService.assetChanges$.next({ related: 'Wallet' });
    }
    if (this.heartbeat) clearInterval(this.heartbeat);
    clearTimeout(this.resulTime);
    clearInterval(this.timerCount);
    //
  }

  toBet(event: Event) {
    if (this.loading || !this.isBet) return;
    this.iconService.balanceAudioPlay();
    const data = {
      betAmount: Number(event),
      currency: this.orignalService.currentCurrencyData.currency,
      target: Number(this.rate),
      numberId: this.fairnessData.numberId,
      isAuto: false,
    };
    const betData = {
      action: 'actionBetApi',
      data: data,
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    this.betService.isChangeActive$.next(false);
    this.appService.assetChangesLock$.next(true);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    this.ws.sendMessage(betData);
  }

  // /** 自动投注 投注数 */
  LoopData: any = {};
  /** 记录上一把输赢*/
  winloseState: any = '';
  submitLoop(loopInfo: any) {
    if (this.loading || !this.isBet) return;
    this.iconService.balanceAudioPlay();
    this.isBet = false;
    this.loading = true;
    // this.stepValue = '1.00';
    this.LoopData = loopInfo;
    this.betService.isChangeActive$.next(false);
    this.appService.assetChangesLock$.next(true);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    this.ws.sendMessage({
      action: 'actionBetApi',
      data: {
        betAmount: Number(this.LoopData.oldmoney ?? this.LoopData.money),
        numberId: this.fairnessData.numberId,
        currency: this.orignalService.currentCurrencyData.currency,
        target: Number(this.rate),
        isAuto: true,
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
      this.betService.winLoseAmount = Number(this.betService.winLoseAmount.minus(data.betAmount).toDecimal(8));
    }
    // 检查是否有最大投注额
    if (
      this.LoopData.MaxbetNmb &&
      this.LoopData.MaxbetNmb != '' &&
      Number(oldmoney) > Number(this.LoopData.MaxbetNmb)
    ) {
      oldmoney = this.LoopData.MaxbetNmb;
    }

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
    console.log(this.LoopData.oldmoney);
    this.betService.money$.next(this.LoopData.oldmoney);
  }
  /**
   * 停止自动投注，状态初始化
   */
  stopAutoLoop() {
    this.isLoop = false;
    this.winloseState = '';
    this.isLoopbet = false;
    this.appService.originalAutoBet$.next(false);
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
   * 不同的倍率显示不同颜色
   *
   * @param odds 倍率
   * @returns
   */
  getItemBackgroundColor(odds: string): string {
    const odd = Number(odds);
    if (odd > 0 && odd <= 1.9804) {
      return '#55657E';
    } else if (odd > 1.9804 && odd <= 3.9804) {
      return '#32BFDE';
    } else if (odd > 3.9804 && odd <= 7.9216) {
      return '#3ECC7F';
    } else if (odd > 7.9216 && odd <= 15.8432) {
      return '#328FDE';
    } else if (odd > 15.8432 && odd <= 31.6864) {
      return '#32BFDE';
    } else if (odd > 31.6864 && odd <= 63.3728) {
      return '#A054FF';
    } else if (odd > 63.3728 && odd <= 126.7456) {
      return '#328FDE';
    } else if (odd > 126.7456 && odd <= 248.5248) {
      return '#E04461';
    } else if (odd > 248.5248 && odd <= 497.0496) {
      return '#3ECC7F';
    } else if (odd > 497.0496 && odd <= 994.0992) {
      return '#32BFDE';
    } else {
      // 默认情况下返回一个默认的背景颜色 FF23CF
      return '#FF23CF';
    }
  }

  // clear() {
  //   this.isBet = false;
  //   this.isBetting = false;
  //   this.rate = 0;
  // }

  logWidth(data: Array<string>): void {
    const divWidth = this.monitorDiv.nativeElement.offsetWidth;
    console.log('Div宽度：', divWidth);
    let aWidth = divWidth / 7;
    if (aWidth < 100) {
      aWidth = 100;
    }
    const itemWidth = aWidth - 10;
    this.slideWidth = aWidth * 100;

    if (data.length > 0) {
      const slideList = [];
      for (let i = 0; i < 100; i++) {
        if (data[i]) {
          slideList.push({ rote: data[i], itemWidth: itemWidth + 'px' });
        } else {
          slideList.push({ rote: i.toString(), itemWidth: itemWidth + 'px' });
        }
      }
      this.slideWidth = 100 * 100;
      this.slideList = slideList;
      console.log(this.slideList);
      // setTimeout(() => {
      const slideTransform = this.slideTransform.nativeElement as HTMLElement;
      const index = 69;
      const randomX = this.getRandomInteger(1, itemWidth);
      this.goalX = aWidth * index - divWidth / 2 + 10 + randomX;
      slideTransform.style.transition = 'transform 7000ms cubic-bezier(0.24, 0.78, 0.15, 1) 0s';
      slideTransform.style.transform = `translate(-${this.goalX}px,0px) `;
      this.iconService.slideStartAudioPlay();
      // }, 2000);
    }
  }
  startAnimation() {
    // const randomX = this.getRandomInteger(50, 90);
    const slideTransform = this.slideTransform.nativeElement as HTMLElement;
    // slideTransform.style.transform = `translate(${X}px,0px) `;
    slideTransform.style.transition = 'transform 0ms cubic-bezier(0.24, 0.78, 0.15, 1) 0s';
    slideTransform.style.transform = `translate(0px,0px) `;
    // console.log('结果-------------------------', randomX);
    this.logWidth(this.allValues);
  }
  getRandomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /*
   * 进度条
   *
   */
  /** 倒计时*/
  timerCount: any = null;
  endTime: number = 0;
  currentCountDown: string = '10.00';
  progressWidth: string = '100%';
  allTime: number = 0;
  onProgress() {
    // 总共花费时间，
    const date = new Date();
    const now = date.getTime();
    const endDate = new Date(this.endTime); //设置截止时间
    const end = endDate.getTime();
    this.allTime = end - now; //时间差

    this.timerCount = setInterval(() => {
      // this.currentCountDown = Number(this.currentCountDown).minus(0.01).toDecimal(2)
      // this.progressWidth = Number(this.currentCountDown) * 10 + '%'
      // if (Number(this.currentCountDown) <= 0) {
      //   clearInterval(this.timerCount)
      //   this.timerCount = null
      // }
      this.countTime();
    }, 50);
  }
  countTime() {
    const date = new Date();
    const now = date.getTime();
    const endDate = new Date(this.endTime); //设置截止时间
    const end = endDate.getTime();
    const leftTime = end - now; //时间差
    let s, ms;

    if (leftTime > 0) {
      s = Math.floor((leftTime / 1000) % 60);
      ms = Math.floor(leftTime % 1000);
      this.progressWidth = (Number(leftTime) / Number(this.allTime)) * 100 + '%';
      if (ms < 100) {
        ms = '0' + ms;
      }
      if (s < 10) {
        s = '0' + s;
      }
      this.currentCountDown = s + ':' + ms.toString().substring(0, 2);
    } else {
      this.progressWidth = '0%';
      this.currentCountDown = '00:00';
      clearInterval(this.timerCount);
      this.timerCount = null;
    }
  }
}
