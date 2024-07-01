import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { DiceApi } from '../../shared/apis/dice.api';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';

import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { WsService } from '../../shared/services/ws.service';
@UntilDestroy()
@Component({
  selector: 'orignal-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss'],
})
export class DiceComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private diceApi: DiceApi,
    private orignalService: OrignalService,
    private appService: AppService,
    private iconService: IconService,
    private layout: LayoutService,
    private cacheService: CacheService,
    private betService: BetService,
    private ws: WsService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private localeService: LocaleService,
    private toast: ToastService
  ) {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      if (v) {
        this.uid = v.uid;
      }
    });
    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(v => {
      this.currentCurrencyData = v;
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
  /** 用户id */
  uid: string = '';
  /** theme主题 */
  theme: string = '';
  /** 用户余额 */
  // balance: string = "0";
  /** 当前选择币种信息 */
  currentCurrencyData!: CurrenciesInterface;

  /** 历史开奖记录 */
  list: any = [];
  /** 进度条值 */
  value = 50;
  /** 进度条范围 */
  options: any = {
    floor: 0,
    ceil: 100,
    minLimit: 0,
    maxLimit: 94,
    showSelectionBarEnd: true,
    disabled: false,
  };
  rate = 1.96;
  rateValue = 0;
  /** 选择投注选择below-小于,above-大于 */
  selected = 'below';
  /** DICE游戏赔付比例 */
  multiplier: any;
  /** 幸运数字 */
  lucky = 0;
  /** 投注中 */
  loading!: boolean;
  /** 投注获得利润 */
  winLossAmount: number = 0;
  /** 上次投注选择condition */
  prevCondition: string = 'above';

  /** 公平性验证的numberid和pubkey */
  fairnessData: any;
  isH5!: boolean;

  /** 是否开启快速投注 */
  isFastBet!: boolean;
  /** 是否开启热键 */
  isHotkey!: boolean;
  /** 键盘操作 */
  operate: any;
  /** 是否在自动投注 */
  isLoop: boolean = false;
  /** 自动投注是否投注成功 */
  isLoopbet: boolean = false;
  /** 记录投注的ID，与中奖ID判断自己是否中奖 */
  mainAccountId!: number;
  /** 自动投注输赢判断 */
  winOrlose: boolean = false;

  /** 是否能投注， */
  isBet: boolean = false;
  /** 心跳定时器 */
  heartbeat: any = null;
  async ngOnInit() {
    console.log('isH5-->', this.isH5);
    this.rateValue = this.value * this.rate;

    this.orignalService.orignalLoginReady$
      .pipe(untilDestroyed(this), distinctUntilChanged())
      .subscribe(async (x: boolean | null) => {
        if (x) {
          const response = await this.diceApi.getMultiplier();
          this.multiplier = response.data;
          this.options = Object.assign({}, this.options, {
            minLimit: this.multiplier[this.selected][0].index,
            maxLimit: this.multiplier[this.selected][this.multiplier[this.selected].length - 1].index,
          });
          if (!this.orignalService.token) return;
          this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/dice/open?token=${this.orignalService.token}`);
        } else {
          this.ws?.destory();
        }
      });
    this.appService.currentCurrency$
      .pipe(
        map(v => v?.currency),
        distinctUntilChanged()
      )
      .subscribe(v => {
        this.stopAutoLoop();
      });

    // 操作声音初始化
    this.iconService.init('dice');

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
          //q-切换大小
          case 81:
            this.changeSelect(this.selected === 'above' ? 'below' : 'above');
            break;
          //w-预言数字变小
          case 87:
            if (this.value > 2) this.value--;
            this.iconService.sliderAudioPlay();
            break;
          //e-预言数字变大
          case 69:
            if (this.value < 98) this.value++;
            this.iconService.sliderAudioPlay();
            break;
          default:
            break;
        }
      }
    };

    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
  }
  /**
   * @param data
   * @description 接收消息
   */
  onmessage(data: any) {
    if (data.code != 0) {
      // 扣款失败都直接用code 判断
      // this.orignalService.showToast$.next({
      //   content: data.tKey ? this.localeService.getValue(data.tKey) : '',
      // });
      this.toast.show({ message: `${this.localeService.getValue(data.tKey)}!`, type: 'fail' });
      this.stopAutoLoop();
      this.loading = false;
      this.options = Object.assign({}, this.options, { disabled: false });
      this.isBet = false;
      this.ws.sendMessage({ action: 'actionGameCodePublicKeyApi', data: { userId: this.uid } });
    }
    if (data.code == 0) {
      switch (data.action) {
        case 'JoinRoom':
          this.list = data.data.result;
          // 初次进入 获取投注key
          this.ws.sendMessage({ action: 'actionGameCodePublicKeyApi', data: { userId: this.uid } });
          // 开启定时发送心跳
          clearInterval(this.heartbeat);
          this.heartbeat = setInterval(() => {
            this.ws.sendMessage({ action: 'type' });
          }, 15000);
          break;
        case 'actionGameCodePublicKeyApi':
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.isBet = true;

          if (this.isLoopbet) {
            this.submitLoop(this.LoopData);
          }

          break;
        case 'actionDiceBetApi':
          // 投注结果
          this.lucky = data.data.lotteryBetDetail;
          this.orignalService.chartMessage$.next({ gameId: 'dice', amount: data.data.lotteryAmount, type: 'bet' });

          if (this.isFastBet) {
            this.currentValue = data.data.lotteryBetDetail.toString().padStart(2, '0');
          } else {
            this.animate();
          }
          setTimeout(
            async () => {
              // this.lucky = data.data.lotteryBetDetail.toString();
              this.prevCondition = data.data.lotteryPlayType;
              this.winLossAmount = data.data.winLossAmount;
              this.orignalService.chartMessage$.next({ gameId: 'dice', amount: data.data.winLossAmount, type: 'set' });
              // this.orignalService.refreshUserBanlance$.next(true);
              this.list.unshift({
                lotteryBetDetail: data.data.lotteryBetDetail,
                lotteryBetReturnAmount: data.data.winLossAmount,
              });
              // 播放输钱音效
              if (data.data.winLossAmount <= 0) {
                this.iconService.loseAudioPlay();
              } else {
                // 播放赢钱音效
                this.iconService.winAudioPlay();
              }

              //
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
              this.options = Object.assign({}, this.options, { disabled: false });
              this.isBet = false;
            },
            this.isFastBet ? 0 : 600
          );
          setTimeout(
            () => {
              this.ws.sendMessage({ action: 'actionGameCodePublicKeyApi', data: { userId: this.uid } });
            },
            this.isFastBet ? 0 : 800
          );
          break;
        default:
          break;
      }
    }
  }
  start = 0; // 初始值为0
  // lucky =  50 // 目标值为50
  duration = 600; // 动画执行时间为1秒
  increment = 1; // 每次增加的数值
  currentValue = '00'; // 当前数值
  isAnimating = false;
  startTime = null; // 动画开始时间
  rafId: any; // requestAnimationFrame的id
  // 上一次的目标值
  lastTargetValue = 0;
  animate() {
    this.startTime = null;
    this.isAnimating = true;
    const update = (currentTime: any) => {
      if (!this.startTime) {
        this.startTime = currentTime;
      }

      const elapsedTime = currentTime - (this.startTime ? this.startTime : currentTime);
      // 计算起始值与目标值之间的距离
      let distance = this.lucky - this.start;
      if (Math.abs(distance) < 50) {
        // 如果距离小于50，需要动画执行到100后，再从0开始执行到目标值
        if (this.start === 100) {
          this.start = 0;
        }
        distance = this.lucky + (100 - this.start);
      }

      // 计算当前值
      const currentValue = this.start + distance * (elapsedTime / this.duration);
      // 更新界面
      if (currentValue > 100) {
        this.currentValue = (currentValue - 100).toFixed(0).padStart(2, '0');
      } else {
        this.currentValue = currentValue.toFixed(0).padStart(2, '0');
      }

      // 如果动画未完成，继续执行
      if (elapsedTime < this.duration) {
        this.rafId = requestAnimationFrame(update);
      } else {
        // 动画完成，更新起始值和上一次的目标值
        this.start = this.lucky;
        this.lastTargetValue = this.lucky;
        this.startTime = null;
        this.currentValue = this.lucky.toString().padStart(2, '0');
      }
    };

    this.rafId = requestAnimationFrame(update);
  }
  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.isAnimating = false;
  }

  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    clearInterval(this.heartbeat);
    this.stop();
  }

  /** 获取numberId用于投注、numberPublicKey用于公平性页面展示 */
  async getNextNumberId() {
    // let res = await this.diceApi.getNumberId();
    // this.fairnessData = res.data;
    this.isBet = false;
    this.ws.sendMessage({
      action: 'actionGameCodePublicKeyApi',
      data: { userId: this.uid },
    });
  }

  /**
   * 返回type=rate:赔率、type=success:获胜的机会
   *
   * @param type
   */
  returnRate(type: string) {
    if (type === 'rate') {
      return (
        this.multiplier &&
        Number(this.multiplier[this.selected].find((cur: any) => cur.index == this.value).multiplier).toDecimal(4)
      );
    }
    if (type === 'success') {
      return this.multiplier && this.multiplier[this.selected].find((cur: any) => cur.index == this.value).winChance;
    }
  }

  /** 骰子头奖弹窗 */
  // showJackport() {
  //   this.dialog.open(JackportComponent, {
  //     panelClass: 'no-border-radius',
  //   });
  // }

  // showChart() {
  //   this.dialog.open(RealTimeChartComponent, {
  //     panelClass: 'no-border-radius',
  //   });
  // }

  /**
   * 切换大小选择
   *
   * @param value
   */
  changeSelect(value: string) {
    if (this.loading || this.isLoop || !this.multiplier) {
      return;
    }
    if (this.value < this.multiplier['above'][0].index && value == 'above') {
      this.value = this.multiplier['above'][0].index;
    }

    if (
      this.value <= this.multiplier['above'][this.multiplier['above'].length - 1].index &&
      this.value > this.multiplier['below'][this.multiplier['below'].length - 1].index &&
      value == 'below'
    ) {
      this.value = this.multiplier['below'][this.multiplier['below'].length - 1].index;
    }
    this.iconService.selectAudioPlay();
    this.selected = value;
    this.options = Object.assign({}, this.options, {
      minLimit: this.multiplier[this.selected][0].index,
      maxLimit: this.multiplier[this.selected][this.multiplier[this.selected].length - 1].index,
    });
  }

  /**
   * 投注
   *
   * @param event
   */
  async toBet(event: any) {
    if (this.loading || !this.isBet) return;
    if (!this.fairnessData.numberPublicKey || !this.fairnessData.numberId) return;

    this.loading = true;
    this.options = Object.assign({}, this.options, { disabled: true });

    this.iconService.betAudioPlay();
    const data = {
      userId: this.uid,
      betAmount: Number(event),
      condition: this.selected,
      target: this.value,
      numberId: this.fairnessData.numberId,
      currency: this.orignalService.currentCurrencyData.currency,
      realBetRate:
        this.multiplier &&
        Number(this.multiplier[this.selected].find((cur: any) => cur.index == this.value).multiplier),
    };
    const betData = {
      action: 'actionDiceBetApi',
      data: data,
      numberPublicKey: this.fairnessData.numberPublicKey,
    };

    this.ws.sendMessage(betData);
  }

  /** 获取个人投注记录 */
  async getHistory() {
    const res = await this.diceApi.getRecord({ sourceCode: 'DICE', state: 1 });
  }

  /** 获取开奖结果 */
  async getResult() {
    const res = await this.diceApi.getResult();
    this.list = res.data;
  }

  /** 播放滑动按钮音效 */
  playVideo() {
    this.iconService.sliderAudioPlay();
  }

  /**
   * 自动投注
   *
   * @param loopInfo
   */
  // /** 自动投注 投注数 */
  // betNmb: any = ''
  // /** 自动投注 止盈 */
  // profitNmb: any = ''
  // /** 自动投注 止损 */
  // lossNmb: any = ''
  // /** 自动投注 最大投注数 */
  // MaxbetNmb: any = ''
  // /** 自动投注 赢了百分比 */
  // winPercent: any = ''
  // /** 自动投注 输了百分比 */
  // losePercent: any = ''
  LoopData: any = {};
  /** 记录上一把输赢*/
  winloseState: any = '';
  /** 投注获得利润 */
  lotteryBetReturnAmount: number = 0;
  // 是否达到条件
  async submitLoop(loopInfo: any) {
    if (this.loading || !this.isBet) return;
    if (!this.fairnessData.numberPublicKey || !this.fairnessData.numberId) return;
    this.loading = true;
    this.options = Object.assign({}, this.options, { disabled: true });

    this.LoopData = loopInfo;
    const data = {
      userId: this.uid,
      isAuto: true,
      betAmount: Number(this.LoopData.oldmoney ?? this.LoopData.money),
      condition: this.selected,
      target: this.value,
      numberId: this.fairnessData.numberId,
      currency: this.orignalService.currentCurrencyData.currency,
      realBetRate:
        this.multiplier &&
        Number(this.multiplier[this.selected].find((cur: any) => cur.index == this.value).multiplier),
    };
    const betData = {
      action: 'actionDiceBetApi',
      data: data,
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    this.ws.sendMessage(betData);

    // console.log(loopInfo)
    // let LoopData = loopInfo;
    // /** 初始投注金额记住 ，此值保持不变*/
    // let money = LoopData.money
    // /** 投注使用的金额 ，赢损增加满足后使用*/
    // let oldmoney = LoopData.oldmoney ?? LoopData.money

    // if (LoopData.betNmb === 0) {
    //   this.isLoop = false
    //   LoopData.betNmb = ''
    //   this.options = Object.assign({}, this.options, { disabled: false });
    //   return
    // }
    // this.loading = true
    // this.options = Object.assign({}, this.options, { disabled: true });
    // this.iconService.betAudioPlay();
    // let data = await this.diceApi.toBet({
    //   // 优先使用oldmoney，第一次投注使用money
    //   betAmount: Number(oldmoney) || Number(money),
    //   condition: this.selected,
    //   target: this.value,
    //   numberId: this.fairnessData.numberId,
    //   numberPublicKey: this.fairnessData.numberPublicKey,
    //   currency: this.orignalService.currentCurrencyData.currency
    // })
    // await firstValueFrom(timer(this.isFastBet ? 0 : 1000));
    // this.loading = false
    // if (data.code === 0) {
    //   this.isLoop = true
    //   this.lucky = data.data.lotteryBetDetail.toString();
    //   this.prevCondition = data.data.lotteryPlayType;
    //   this.winLossAmount = data.data.winLossAmount;
    //   // 播放输钱音效
    //   if (data.data.winLossAmount <= 0) {
    //     this.iconService.loseAudioPlay();
    //   } else {
    //     // 播放赢钱音效
    //     this.iconService.winAudioPlay();
    //   }
    //   // 投注数量减1
    //   if (LoopData.betNmb != '') {
    //     LoopData.betNmb = LoopData.betNmb - 1
    //   }

    //   if (data.data.active) {
    //     // 检查是增加还是重置
    //     if (!LoopData.win) {
    //       //检查是否有赢了增加百分比 ,并检查上一把输赢状态
    //       if (LoopData.winPercent && LoopData.winPercent != '' && (this.winloseState === '' || this.winloseState === 1) && (LoopData.losePercent && LoopData.lose)) {
    //         oldmoney = Number(oldmoney).add(Number(LoopData.winPercent).divide(100).subtract(Number(oldmoney)))
    //         this.winloseState = data.data.active ? 1 : 2
    //       } else {
    //         //赢了增加没填写的情况 金额变成初始投注值
    //         oldmoney = money
    //       }
    //     } else {
    //       if (LoopData.winPercent && LoopData.winPercent != '') {
    //         oldmoney = Number(oldmoney).add(Number(LoopData.winPercent).divide(100).subtract(Number(oldmoney)))
    //         this.winloseState = data.data.active ? 1 : 2
    //       }
    //     }

    //     // 一轮总输赢统计
    //     this.betService.winLoseAmount = Number(this.betService.winLoseAmount.add(data.data.winLossAmount).toDecimal(8))
    //   } else {
    //     // 检查是增加还是重置
    //     if (!LoopData.lose) {
    //       //检查是否有输了增加百分比
    //       if (LoopData.losePercent && LoopData.losePercent != '' && (this.winloseState === '' || this.winloseState === 2) && (LoopData.winPercent && LoopData.win)) {
    //         oldmoney = Number(oldmoney).add(Number(LoopData.losePercent).divide(100).subtract(Number(oldmoney)))
    //         this.winloseState = data.data.active ? 1 : 2
    //       } else {
    //         // 输了增加没填写的情况 金额变成初始投注值
    //         oldmoney = money
    //       }
    //     } else {
    //       if (LoopData.losePercent && LoopData.losePercent != '') {
    //         oldmoney = Number(oldmoney).add(Number(LoopData.losePercent).divide(100).subtract(Number(oldmoney)))
    //         this.winloseState = data.data.active ? 1 : 2
    //       }
    //     }
    //     // 一轮总输赢统计
    //     this.betService.winLoseAmount = Number(this.betService.winLoseAmount.minus(data.data.lotteryAmount).toDecimal(8))
    //   }
    //   // 检查是否有最大投注额
    //   if (LoopData.MaxbetNmb && LoopData.MaxbetNmb != '' && Number(oldmoney) > Number(LoopData.MaxbetNmb)) {
    //     oldmoney = LoopData.MaxbetNmb
    //   }

    //   console.log(this.betService.winLoseAmount, "一轮总输赢--", data.data.winLossAmount, '-可盈金额--', data.data.lotteryAmount, "-投注金-")
    //   //检查是否有止盈
    //   if (LoopData.profitNmb != '' && this.betService.winLoseAmount >= LoopData.profitNmb) {
    //     this.updateAll()
    //     this.isLoop = false;
    //     this.options = Object.assign({}, this.options, { disabled: false });
    //     this.winloseState = ''
    //     return
    //   }
    //   //检查是否有止损
    //   if (LoopData.lossNmb && LoopData.lossNmb != '' && this.betService.winLoseAmount < 0 && Math.abs(this.betService.winLoseAmount) >= LoopData.lossNmb) {
    //     this.updateAll()
    //     this.isLoop = false;
    //     this.options = Object.assign({}, this.options, { disabled: false });
    //     this.winloseState = ''
    //     return
    //   }

    //   // 准备下一次投注
    //   LoopData.oldmoney = this.toNonExponential(oldmoney.toString())
    //   this.betService.money$.next(LoopData.oldmoney)
    // } else {
    //   this.isLoop = false
    //   this.options = Object.assign({}, this.options, { disabled: false });

    // }

    // Promise.all([
    //   this.orignalService.refreshUserBanlance$.next(true),
    //   this.getResult(),
    //   this.getNextNumberId()
    // ]).then(async _ => {
    //   if (data.code === 0 && LoopData.isLoop) {
    //     this.submitLoop(LoopData)
    //   } else {
    //     this.isLoop = false
    //     this.options = Object.assign({}, this.options, { disabled: false });
    //   }
    // });
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
      this.betService.winLoseAmount = Number(this.betService.winLoseAmount.minus(data.data.lotteryAmount).toDecimal(8));
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
      data.data.lotteryAmount,
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
    this.options = Object.assign({}, this.options, { disabled: false });
    this.winloseState = '';
    this.isLoopbet = false;
  }

  // async updateAll() {
  //   Promise.all([
  //     this.orignalService.refreshUserBanlance$.next(true),
  //     this.getResult(),
  //     this.getNextNumberId()
  //   ])
  // }
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
