import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ChangeContext, Options } from 'ngx-slider-v2';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CurrencyBalance } from 'src/app/shared/interfaces/wallet.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { SpaceDiceApi } from '../../shared/apis/space-dice.api';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';
import { WsService } from '../../shared/services/ws.service';
@UntilDestroy()
@Component({
  selector: 'orignal-space-dice',
  templateUrl: './space-dice.component.html',
  styleUrls: ['./space-dice.component.scss'],
})
export class SpaceDiceComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private spaceDiceApi: SpaceDiceApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private currencyValuePipe: CurrencyValuePipe,
    private cacheService: CacheService,
    private layout: LayoutService
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
  betType = 'spaceDice';
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
  /** 历史记录 0失败1成功*/
  historyList: Array<any> = [];
  /** 倍数动画*/
  // stepValue: string = '1.00';

  /** 开奖结果*/
  winloseData: any = {};
  /** 倍数颜色变化 */
  roleColor: string = '';
  allCurrencyBalance: CurrencyBalance[] = [];
  /** 数字预测是否在范围外 */
  isOut: boolean = false;
  minValue: number = 2500; //最小
  maxValue: number = 7500; //最大
  sliderForm: FormGroup = new FormGroup({
    sliderControl: new FormControl([2500, 7500]),
  });
  options: Options = {
    floor: 0,
    ceil: 9999,
    minRange: 0,
    maxRange: 9499,
    draggableRange: true,
    showSelectionBar: true,
    pushRange: true,
  };

  /** 骰子的颜色是否为红色 */
  redDice: boolean = true;
  /** 骰子是否移动 */
  diceMoved: boolean = false;
  /** 投注金额 */
  money: number = 0;
  /** 可盈金额 */
  winAmount: string = '0';
  /** 概率 */
  chance: string = '0';
  /** 是否登录 */
  isLogin: boolean = false;
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(v => {
      this.isLogin = v ? true : false;
      this.ws?.destory();
      this.stopAutoLoop();
      this.loading = false;
      this.isBet = false;
      if (v) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/spacedice/open?token=${this.orignalService.token}`);
      }
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    this.rate = 2;
    // 操作声音初始化
    this.iconService.init('spaceDice');

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
          //q-in/out切换
          case 81:
            this.toggleOut();
            this.iconService.balanceAudioPlay();
            break;
          //w-减少百分之五的范围
          case 87:
            this.subPercent();
            this.iconService.balanceAudioPlay();
            break;
          //e-增加百分之五的范围
          case 69:
            this.addPercent();
            this.iconService.balanceAudioPlay();
            break;
          //z-自动投注
          case 90:
            this.autoPick();
            this.iconService.balanceAudioPlay();
            break;
          default:
            break;
        }
      }
    };

    this.betService.inputMoney$.pipe(untilDestroyed(this)).subscribe(j => {
      console.log(j);
      const money = Number(j);
      if (money) {
        this.money = money;
        this.onOdds();
      }
    });

    setTimeout(() => {
      this.iconService.spacediceBGAudioPlay();
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
      this.stopAutoLoop();
      this.options = Object.assign({}, this.options, { disabled: false });
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
          if (this.isLoopbet) {
            this.submitLoop(this.LoopData);
          }
          break;
        case 'actionBetApi':
          this.lucky = Number(data.data.result);
          if (this.isFastBet) {
            this.currentValue = data.data.result.toString();
            this.start = Number(data.data.result);
          }
          this.orignalService.chartMessage$.next({ gameId: 'spacedice', amount: data.data.betAmount, type: 'bet' });
          this.animate(data.data);

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
    this.iconService.spacediceBGAudioStop();
    if (this.isLogin) {
      this.appService.assetChanges$.next({ related: 'Wallet' });
    }

    clearInterval(this.heartbeat);
    this.stop();
  }

  toBet(event: Event) {
    if (this.loading || !this.isBet) return;
    this.isBet = false;
    this.loading = true;
    // this.stepValue = '1.00';
    this.iconService.sliderAudioPlay();
    this.options = Object.assign({}, this.options, { disabled: true });
    // this.appService.assetChangesLock$.next(true);
    this.ws.sendMessage({
      action: 'actionBetApi',
      data: {
        betAmount: Number(event),
        numberId: this.fairnessData.numberId,
        currency: this.currentCurrencyData.currency,
        scope: [this.minValue, this.maxValue],
        type: this.isOut ? 2 : 1,
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
    this.appService.originalAutoBet$.next(true);
    this.options = Object.assign({}, this.options, { disabled: true });
    this.ws.sendMessage({
      action: 'actionBetApi',
      data: {
        betAmount: Number(this.LoopData.oldmoney ?? this.LoopData.money),
        numberId: this.fairnessData.numberId,
        currency: this.currentCurrencyData.currency,
        scope: [this.minValue, this.maxValue],
        type: this.isOut ? 2 : 1,
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
    this.appService.originalAutoBet$.next(false);
    this.options = Object.assign({}, this.options, { disabled: false });
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
  /** 切换预测范围 */
  toggleOut() {
    if (this.loading || !this.isBet) return;
    this.isOut = !this.isOut;
    if (!this.isOut) {
      this.redDice =
        Number(this.currentValue) <= this.minValue || Number(this.currentValue) >= this.maxValue ? false : true;
      this.options = Object.assign({}, this.options, { minRange: 0, maxRange: 9499 });
      if (this.maxValue - this.minValue > 9499) {
        this.maxValue = 9499;
        this.minValue = 0;
      }
      this.onOdds();
    } else {
      this.redDice =
        Number(this.currentValue) > this.minValue && Number(this.currentValue) < this.maxValue ? false : true;

      if (this.maxValue - this.minValue < 500) {
        if (this.minValue < 250) {
          this.maxValue = this.maxValue + 500;
        } else {
          this.maxValue = this.minValue + 250;
          this.minValue = this.minValue - 250;
        }
      }
      this.options = Object.assign({}, this.options, { minRange: 500, maxRange: 9998 });

      this.onOdds();
    }
    this.iconService.sliderAudioPlay();
  }

  getNum2() {
    // 筛子移动百分比
    this.leftPercent = Number(this.currentValue).divide(9999).subtract(100);
    console.log(this.leftPercent);
    // 数字图片赋值
    if (this.currentValue[0] !== '0') {
      this.luckyArr[0] = this.currentValue[0];
      this.luckyArr[1] = this.currentValue[1];
      this.luckyArr[2] = this.currentValue[2];
      this.luckyArr[3] = this.currentValue[3];
    } else if (this.currentValue[1] !== '0') {
      this.luckyArr[0] = '';
      this.luckyArr[1] = this.currentValue[1];
      this.luckyArr[2] = this.currentValue[2];
      this.luckyArr[3] = this.currentValue[3];
    } else if (this.currentValue[2] !== '0') {
      this.luckyArr[0] = '';
      this.luckyArr[1] = '';
      this.luckyArr[2] = this.currentValue[2];
      this.luckyArr[3] = this.currentValue[3];
    } else {
      this.luckyArr[0] = '';
      this.luckyArr[1] = '';
      this.luckyArr[2] = '';
      this.luckyArr[3] = this.currentValue[3];
    }

    // 判断颜色筛子与数字的颜色
    if (!this.isOut) {
      this.redDice =
        Number(this.currentValue) <= this.minValue || Number(this.currentValue) >= this.maxValue ? false : true;
    } else {
      this.redDice =
        Number(this.currentValue) > this.minValue && Number(this.currentValue) < this.maxValue ? false : true;
    }
  }
  // changeNum() {
  //   const random = Math.floor(Math.random() * 10000);
  //   console.log(random);
  //   this.lucky = random;
  //   this.animate();
  // }
  start = 5000; // 初始值为0
  duration = 600; // 动画执行时间为1秒
  increment = 1; // 每次增加的数值
  currentValue = '5000'; // 当前数值
  isAnimating = false;
  startTime = null; // 动画开始时间
  rafId: any; // requestAnimationFrame的id
  /** 后端返回的投注结果 */
  lucky = 0;
  // 上一次的目标值
  lastTargetValue = 0;
  /** 渲染的数字结果 */
  luckyArr: Array<string> = ['5', '0', '0', '0'];
  /** 筛子位置 按百分比来算 */
  leftPercent: number = 50;
  animate(data: any) {
    this.startTime = null;
    this.isAnimating = true;
    const update = (currentTime: any) => {
      if (!this.startTime) {
        this.startTime = currentTime;
      }

      const elapsedTime = currentTime - (this.startTime ? this.startTime : currentTime);
      // 计算起始值与目标值之间的距离
      const distance = this.lucky - this.start;
      // 计算当前值
      const currentValue = this.start + distance * (elapsedTime / this.duration);

      // 更新界面
      this.currentValue = currentValue.toFixed(0).padStart(4, '0');
      // 如果动画未完成，继续执行
      if (elapsedTime < this.duration) {
        this.rafId = requestAnimationFrame(update);
      } else {
        // 动画完成，更新起始值和上一次的目标值
        this.start = this.lucky;
        this.lastTargetValue = this.lucky;
        this.diceMoved = true;
        setTimeout(() => {
          this.diceMoved = false;
        }, 500);
        this.startTime = null;
        this.currentValue = this.lucky.toString().padStart(4, '0');
        this.historyList.unshift({
          lotteryBetDetail: this.lucky,
          type: data.active ? 1 : 0,
        });
        this.loading = false;
        this.isBet = false;
        this.options = Object.assign({}, this.options, { disabled: false });
        this.ws.sendMessage({ action: 'actionPublicKeyApi' });
        this.orignalService.chartMessage$.next({ gameId: 'spacedice', amount: data.winLossAmount, type: 'set' });
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
        this.betService.minesBetstate$.next({ betting: false });
        if (data.active) {
          this.iconService.spacediceWinAudioPlay();
        } else {
          this.iconService.spacediceLoseAudioPlay();
        }
      }

      this.getNum2();
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
  /**
   * 最小
   */
  minBtn() {
    if (this.loading || !this.isBet) return;
    if (!this.isOut) {
      this.minValue = (this.maxValue - this.minValue) / 2 + this.minValue;
      this.maxValue = this.minValue;
    } else {
      this.minValue = 0;
      this.maxValue = 9998;
    }
    this.onOdds();
    this.iconService.sliderAudioPlay();
  }
  /**
   * 最大
   */
  maxBtn() {
    if (this.loading || !this.isBet) return;
    if (!this.isOut) {
      this.maxValue = 9599;
      this.minValue = 100;
    } else {
      const diff = this.maxValue - this.minValue;

      // 如果差值大于500，将A增加差值的一半，B减少差值的一半

      const adjustment = (diff - 500) / 2;
      this.minValue += adjustment;
      this.maxValue -= adjustment;
    }
    this.onOdds();
    this.iconService.sliderAudioPlay();
  }
  addPercent() {
    if (this.loading || !this.isBet) return;
    const mi = 250;
    let ma = 250;
    if (!this.isOut) {
      if (this.maxValue - this.minValue >= 9400) {
        this.minValue = 0;
        this.maxValue = 9499;
      } else if (this.maxValue - this.minValue < 9400) {
        if (this.minValue > 0) {
          // 如果最小值大于0,分配给最小值250

          if (this.minValue < mi) {
            // 如果最小值小于250,计算最大值需要加多少
            ma = 250 + (this.minValue - mi);
            this.minValue = 0;
            this.maxValue = this.maxValue + ma;
          } else {
            if (this.maxValue + ma - (this.minValue - mi) >= 9400) {
              this.minValue = 500;
            } else {
              this.minValue = this.minValue - mi;
              this.maxValue = this.maxValue + ma;
            }
          }
        } else {
          if (this.maxValue + mi + ma > 9499) {
            this.maxValue = 9499;
          } else {
            this.maxValue = this.maxValue + mi + ma;
          }
        }
      }
    } else {
      if (this.maxValue - this.minValue < 500) {
        return;
      } else {
        this.maxValue -= 250;
        this.minValue += 250;
      }
    }

    this.onOdds();
    this.iconService.sliderAudioPlay();
  }
  subPercent() {
    if (this.loading || !this.isBet) return;
    if (!this.isOut) {
      if (this.minValue == this.maxValue) {
        return;
      }
      if (this.minValue != 9999) {
        if (this.maxValue - this.minValue < 500) {
          this.maxValue = this.maxValue - Math.floor((this.maxValue - this.minValue) / 2);
          this.minValue = this.maxValue;
        } else {
          this.maxValue -= 250;
          this.minValue += 250;
        }
      } else {
        this.minValue += 500;
      }
    } else {
      const mi = 250;
      let ma = 250;
      if (this.maxValue - this.minValue >= 9998) {
        this.minValue = 0;
        this.maxValue = 9998;
      } else if (this.maxValue - this.minValue < 9998) {
        if (this.minValue > 0) {
          // 如果最小值大于0,分配给最小值250

          if (this.minValue < mi) {
            // 如果最小值小于250,计算最大值需要加多少
            ma = 250 + (this.minValue - mi);
            this.minValue = 0;
            this.maxValue = this.maxValue + ma;
          } else {
            if (this.maxValue + ma - (this.minValue - mi) >= 9998) {
              this.minValue = 0;
              this.maxValue = 9998;
            } else {
              this.minValue = this.minValue - mi;
              this.maxValue = this.maxValue + ma;
            }
          }
        } else {
          if (this.maxValue + mi + ma > 9998) {
            this.maxValue = 9998;
          } else {
            this.maxValue = this.maxValue + mi + ma;
          }
        }
      }
    }

    this.onOdds();
    this.iconService.sliderAudioPlay();
  }
  /**
   * 随机位置
   */
  autoPick() {
    if (this.loading || !this.isBet) return;
    const maxNum = Math.floor(Math.random() * 10000);
    const minNum = Math.floor(Math.random() * 10000);
    if (maxNum > minNum) {
      this.maxValue = maxNum;
      this.minValue = minNum;
    } else {
      this.maxValue = minNum;
      this.minValue = maxNum;
    }
    this.onOdds();
    this.iconService.sliderAudioPlay();
  }
  /**
   * 滑动监视
   *
   * @param changeContext
   */
  onUserChange(changeContext: ChangeContext): void {
    console.log(changeContext);
    this.minValue = changeContext.value;
    this.maxValue = changeContext.highValue ? changeContext.highValue : this.maxValue;
    if (!this.isOut) {
      this.redDice = this.start <= this.minValue || this.start >= this.maxValue ? false : true;
    } else {
      this.redDice = this.start > this.minValue && this.start < this.maxValue ? false : true;
      console.log(this.redDice);
    }

    this.onOdds();
  }
  /**
   * 赔率 可盈金额 概率计算
   * 公式：(1)投注区段=MAX-MIN+1、(2)赔率=10000/投注区段*RTP  (小数点后四位直接舍去法)
   */
  onOdds() {
    this.sliderForm.reset({ sliderControl: [this.minValue, this.maxValue] });
    if (this.isOut) {
      this.rate = Number(((10000 / (this.minValue - 0 + (9999 - this.maxValue))) * 0.99).toDecimal(4));
    } else {
      this.rate = Number((Number((10000 / (this.maxValue - this.minValue + 1)).toDecimal(8)) * 0.99).toDecimal(4));
    }

    // this.rate = Number(((10000 / (this.maxValue - this.minValue + 1)) * 0.99).toDecimal(4));

    let money = this.toNonExponential(this.money.subtract(Number(this.rate)).toString());
    let max_chars = 9;
    const rep = /[.]/;
    money = Number(money).toDecimal(this.isDigital ? 8 : 2);
    if (rep.test(money)) {
      max_chars = 10;
    }
    this.winAmount = money.substr(0, max_chars);

    this.chance = (((this.maxValue - this.minValue + 1) / 10000) * 100).toDecimal(2);
    if (this.isOut) {
      // this.rate = Number(((10000 / (this.minValue - 0 + (9999 - this.maxValue))) * 0.99).toDecimal(4));
      this.chance = (((this.minValue - 0 + (9999 - this.maxValue)) / 10000) * 100).toDecimal(2);
    } else {
      this.chance = (((this.maxValue - this.minValue + 1) / 10000) * 100).toDecimal(2);
    }
  }
}
