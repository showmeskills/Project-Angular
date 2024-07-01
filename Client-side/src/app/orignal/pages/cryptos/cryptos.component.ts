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
import { CryptosApi } from '../../shared/apis/cryptos.api';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { WsService } from '../../shared/services/ws.service';
@UntilDestroy()
@Component({
  selector: 'orignal-cryptos',
  templateUrl: './cryptos.component.html',
  styleUrls: ['./cryptos.component.scss'],
})
export class CryptosComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private cryptosApi: CryptosApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private currencyValuePipe: CurrencyValuePipe,
    private cacheService: CacheService,
    private layout: LayoutService,
    private nativeAppService: NativeAppService,
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

  @ViewChild('cryptosWheel') cryptosWheelElement!: ElementRef;
  @ViewChild('cryptosSides') cryptosSidesElement!: ElementRef;
  @ViewChild('arrowDown') arrowDownElement!: ElementRef;
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
  betType = 'cryptos';
  /** 心跳定时器 */
  heartbeat: any = null;

  /** 当前选择币种信息 */
  currentCurrencyData?: CurrenciesInterface;
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

  /** 倍数动画*/
  stepValue: string = '1.00';
  /** 是否开始动画*/
  isRun: boolean = false;
  /** 开奖结果*/
  winloseData: any = {};
  /** 倍数颜色变化 */
  roleColor: string = '';
  /** 倍数列表  active是否选中 hover是否划入显示 dots小圆列表类型1为实心0为空心 classBg小圆颜色class*/
  coefficients: any = [
    {
      active: false,
      hover: false,
      dots: [1, 1, 1, 1, 1],
      odds: 0.0244,
      rate: '60.00',
      winAmount: 0,
      endAmount: '',
      classBg: [],
    },
    {
      active: false,
      hover: false,
      dots: [1, 1, 1, 1, 0],
      odds: 0.8545,
      rate: '7.00',
      winAmount: 0,
      endAmount: '',
      classBg: [],
    },
    {
      active: false,
      hover: false,
      dots: [1, 1, 1, 2, 2],
      odds: 1.709,
      rate: '6.00',
      winAmount: 0,
      endAmount: '',
      classBg: [],
    },
    {
      active: false,
      hover: false,
      dots: [1, 1, 1, 0, 0],
      odds: 10.2539,
      rate: '3.75',
      winAmount: 0,
      endAmount: '',
      classBg: [],
    },
    {
      active: false,
      hover: false,
      dots: [1, 1, 2, 2, 0],
      odds: 15.3809,
      rate: '2.40',
      winAmount: 0,
      endAmount: '',
      classBg: [],
    },
    {
      active: false,
      hover: false,
      dots: [1, 1, 0, 0, 0],
      odds: 51.2695,
      rate: '0.10',
      winAmount: 0,
      endAmount: '',
      classBg: [],
    },
    {
      active: true,
      hover: true,
      dots: [0, 0, 0, 0, 0],
      odds: 20.5078,
      rate: '0.00',
      winAmount: 0,
      endAmount: '',
      classBg: [],
    },
  ];
  /** 结果币种显示列表，coin 1~7币种 showCoin是否显示结果 macth如果存在2个相同币种，状态改为true*/
  coins: any = [
    { coin: 1, showCoin: true, macth: false },
    { coin: 2, showCoin: true, macth: false },
    { coin: 3, showCoin: true, macth: false },
    { coin: 4, showCoin: true, macth: false },
    { coin: 5, showCoin: true, macth: false },
  ];
  /** 是否显示结果 */
  showCoin: boolean = false;
  /** 倍数列表高亮第几个 */
  coefficientsIndex: number = 6;
  /** 顶部所有币种余额 */
  allCurrencyBalance: CurrencyBalance[] = [];
  /** 是否登录 */
  isLogin: boolean = false;
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(v => {
      this.isLogin = v ? true : false;
      this.ws?.destory();
      this.betService.isChangeActive$.next(false);
      this.betService.minesBetstate$.next({ betting: false });
      this.coefficientsIndex = 6;
      this.coefficients.forEach((e: any) => {
        e.hover = false;
        e.active = false;
        e.classBg = [];
      });
      this.coefficients[this.coefficientsIndex].hover = true;
      this.coefficients[this.coefficientsIndex].active = true;
      this.stopAutoLoop();
      this.loading = false;
      this.isBet = false;
      if (v) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/cryptos/open?token=${this.orignalService.token}`);
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
        this.coefficients.forEach((e: any) => {
          e.winAmount = this.toNonExponential(money.subtract(Number(e.rate)).toString());
          // 是否有小数点

          const x = String(e.winAmount).split('.'); //得到小数点的位置
          const y = x[1] ? x[1].toString().split('').length : 0; //小数点的位数
          const x0 = x[0].length;
          const max_chars = 9;
          let s = '';
          let t = 0;
          if (y > 0 && x0 <= max_chars) {
            t = this.isDigital ? max_chars - x0 - y : 2 - y;
          } else {
            s = '.';
            t = this.isDigital ? max_chars - x0 - y : 2;
          }

          if (t > 0) {
            for (let i = 0; i < t; i++) {
              s += '0';
            }
            e.endAmount = s;
          } else {
            e.endAmount = '';
            e.winAmount = Number(e.winAmount).toDecimal(this.isDigital ? 8 : 2);
          }
        });
      }
    });
    this.iconService.init('cryptos');
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
      this.betService.minesBetstate$.next({ betting: false });
      this.clear();
      this.ws.sendMessage({ action: 'actionPublicKeyApi' });
    }
    if (data.code == 0) {
      // eslint-disable-next-line default-case
      switch (data.action) {
        case 'JoinRoom':
          this.ws.sendMessage({ action: 'actionMultiplierApi' });
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
          this.betService.isChangeActive$.next(true);
          break;
        case 'actionBetApi': {
          this.allCurrencyBalance = this.appService.userBalance$.value || [];
          this.orignalService.chartMessage$.next({ gameId: 'cryptos', amount: data.data.betAmount, type: 'bet' });
          const item = this.allCurrencyBalance.find(
            balanceItem => balanceItem.currency === (this.currentCurrencyData?.currency ?? ''),
          );
          if (item) {
            // 余额更新
            item.nonStickyBalance = item.nonStickyBalance.minus(data.data.betAmount);
            this.appService.userBalance$.next([...this.allCurrencyBalance]);
            if (this.appService.isNativeApp) {
              this.nativeAppService.onCurrentMoney(this.currentCurrencyData?.currency ?? '', item.nonStickyBalance);
            }
          }
          this.winloseData = data.data;
          this.onAnimation(data);
          break;
        }
        case 'actionMultiplierApi': {
          const Multiplier = data.data.reverse();
          this.coefficients.forEach((e: any, i: number) => {
            e.rate = Multiplier[i].multiplier.toFixed(2);
          });
          this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          this.isBet = true;
          break;
        }
      }
    }
  }
  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    clearInterval(this.heartbeat);
    this.appService.assetChangesLock$.next(false);
    if (this.isLogin) {
      if (this.appService.isNativeApp) {
        this.nativeAppService.onLockTitleMoney(false);
      }
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
        currency: this.currentCurrencyData?.currency,
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    });
  }

  /**
   * @param loopInfo
   * @description 自动投注
   */
  LoopData: any = {};
  /** 记录上一把输赢*/
  winloseState: any = '';
  submitLoop(loopInfo: Event) {
    if (this.loading || !this.isBet) return;
    this.isBet = false;
    this.loading = true;
    this.clear();
    this.LoopData = loopInfo;
    this.betService.minesBetstate$.next({ betting: true });
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    this.appService.assetChangesLock$.next(true);
    this.appService.originalAutoBet$.next(true);
    this.ws.sendMessage({
      action: 'actionBetApi',
      data: {
        betAmount: Number(this.LoopData.oldmoney ?? this.LoopData.money),
        numberId: this.fairnessData.numberId,
        currency: this.currentCurrencyData?.currency,
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
   * 动画播放
   *
   * @param data
   */
  onAnimation(data: any) {
    const steps: { [key: number]: number } = {};
    let index = 6;
    const result = data.data.result;
    // 最后一个翻牌声音 0为普通 1为对子且输了，2为赢了
    let soundType = 0;
    const classColor: number[] = [];
    this.ws.sendMessage({ action: 'actionPublicKeyApi' });
    this.coins.forEach((e: any, i: number) => {
      e.coin = Number(result[i]);
      setTimeout(
        async () => {
          e.showCoin = true;
          // 对比前面是否有一样的
          if (i > 0) {
            for (let index = 0; index < i; ++index) {
              if (e.coin == this.coins[index].coin) {
                e.macth = true;
                this.coins[index].macth = true;
              }
            }
          }

          // 记录出现的次数
          if (!steps[e.coin]) {
            steps[e.coin] = 1;
            // 普通翻牌音效
            soundType = 0;
          } else {
            steps[e.coin] = steps[e.coin] + 1;
            if (!classColor.includes(e.coin)) {
              classColor.push(e.coin);
            } else {
              if (steps[e.coin] == 3) {
                classColor.forEach((item: any, index: number) => {
                  if (item == e.coin) {
                    classColor.unshift(classColor.splice(index, 1)[0]);
                  }
                });
              }
            }
            soundType = 1;
          }
          // 判断中奖
          const value = Object.values(steps)
            .filter(e => e != 1)
            .sort((a, b) => a - b)
            .toString();
          switch (value) {
            case '2':
              index = 5;
              break;
            case '2,2':
              index = 4;
              break;
            case '3':
              index = 3;
              break;
            case '2,3':
              index = 2;
              break;
            case '4':
              index = 1;
              break;
            case '5':
              index = 0;
              break;
            default:
              index = 6;
              break;
          }
          if (index != this.coefficientsIndex) {
            this.coefficientsIndex = index;
            this.coefficients.forEach((e: any) => {
              e.hover = false;
              e.active = false;
              e.classBg = [];
            });
            this.coefficients[this.coefficientsIndex].hover = true;
            this.coefficients[this.coefficientsIndex].active = true;
            this.coefficients[this.coefficientsIndex].classBg = classColor;
          }

          // 判断是否是最后一个动画
          if (!this.isFastBet) {
            if (i == 4 && index !== 5 && index != 6) {
              this.iconService.cryptosWinAudioPlay();
            } else {
              if (soundType == 0) {
                this.iconService.cryptosFlopAudioPlay();
              } else {
                this.iconService.cryptosFlopTAudioPlay();
              }
            }
          } else {
            // 无动画效果 只有2个声音
            if (i == 4) {
              if (index !== 5 && index != 6) {
                this.iconService.cryptosWinAudioPlay();
              } else {
                this.iconService.cryptosFlopAudioPlay();
              }
            }
          }
          if (i == 4) {
            this.orignalService.chartMessage$.next({ gameId: 'cryptos', amount: data.data.winLossAmount, type: 'set' });
            const item = this.allCurrencyBalance.find(
              balanceItem => balanceItem.currency === this.currentCurrencyData?.currency,
            );
            if (item) {
              const amount = data.data.winLossAmount.add(data.data.betAmount);
              item.nonStickyBalance = item.nonStickyBalance.add(amount);
              this.appService.userBalance$.next([...this.allCurrencyBalance]);
              if (this.appService.isNativeApp) {
                this.nativeAppService.onCurrentMoney(this.currentCurrencyData?.currency ?? '', item.nonStickyBalance);
              }
              if (Number(amount) > 0) {
                const winLossAmount = this.currencyValuePipe.transform(
                  amount,
                  this.currentCurrencyData?.currency ?? '',
                );
                this.appService.assetChangesAnimation$.next(winLossAmount);
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

            this.loading = false;
            this.betService.minesBetstate$.next({ betting: false });
            if (this.isLoopbet) {
              await firstValueFrom(timer(800));
              this.submitLoop(this.LoopData);
            }
          }
        },
        this.isFastBet ? 0 : 300 * i,
      );
    });
  }
  /**
   * 清空页面动画状态
   */
  clear() {
    this.coefficientsIndex = 6;
    this.coefficients.forEach((e: any) => {
      e.hover = false;
      e.active = false;
      e.classBg = [];
    });
    this.coefficients[this.coefficientsIndex].hover = true;
    this.coefficients[this.coefficientsIndex].active = true;

    this.coins.forEach((e: any) => {
      e.showCoin = false;
      e.macth = false;
    });
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
   * 显示倍数右侧详情
   *
   * @param index
   */
  showPop(index: number) {
    this.coefficients.forEach((e: any) => {
      e.hover = false;
    });
    this.coefficients[index].hover = true;
  }
  /**
   * 隐藏倍数右侧详情
   */
  closePop() {
    this.coefficients.forEach((e: any) => {
      e.hover = e.active ? true : false;
    });
  }
}
