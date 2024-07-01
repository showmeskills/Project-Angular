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
import { CircleApi } from '../../shared/apis/circle.api';
import { BetListData } from '../../shared/interfaces/bet-list.interface';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
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
  selector: 'orignal-circle',
  templateUrl: './circle.component.html',
  styleUrls: ['./circle.component.scss'],
})
export class CircleComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private circleApi: CircleApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private currencyValuePipe: CurrencyValuePipe,
    private layout: LayoutService,
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

  @ViewChild('circleWheel') circleWheelElement!: ElementRef;
  @ViewChild('circleSides') circleSidesElement!: ElementRef;
  @ViewChild('arrowDown') arrowDownElement!: ElementRef;
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
  operate: any = { value: '', item: '' };
  /**投注类型 */
  betType = 'circle';

  /** 当前选择币种信息 */
  currentCurrencyData!: CurrenciesInterface;
  /** 是否能投注， */
  isBet: boolean = false;

  /** 按钮属性 */
  betList: BetListData[] = [
    { money: '0.00000000', betTest: '2.04X', loading: true, betAuto: false, isAuto: false, betcolor: 'gray' },
    { money: '0.00000000', betTest: '3.13X', loading: true, betAuto: false, isAuto: false, betcolor: 'red' },
    { money: '0.00000000', betTest: '5.31X', loading: true, betAuto: false, isAuto: false, betcolor: 'green' },
    { money: '0.00000000', betTest: '53.09X', loading: true, betAuto: false, isAuto: false, betcolor: 'yellow' },
  ];
  bglist: any = {
    green: [2, 10, 12, 20, 22, 34, 36, 44, 46, 54],
    red: [4, 6, 8, 14, 16, 18, 24, 26, 28, 30, 32, 38, 40, 42, 48, 50, 52],
    gray: [3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53],
  };
  results: any = [];
  /** 投注状态 1.开始投注，2.结束投注 3.展示结果 4.准备下一轮*/
  showState: number = 4;
  /** 实时下注消息 */
  realHistoryList: any = [];
  /** 每局开奖Random展示 */
  numberSecretKey: string = '';
  rotate: any;
  // 选择器
  selector: number = 0;
  /** 结果颜色 */
  color: string = '';
  /** 结果颜色 */
  role: string = '';
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(v => {
      // this.ws?.destory()
      // if (v) {
      //     if (!this.orignalService.token) return
      //     this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/circle/open?token=${this.orignalService.token}`)
      // }
      clearInterval(this.timerCount);
      clearInterval(this.iconAudio);
      let token = '';
      if (v) {
        token = this.orignalService.token;
      } else if (v === false) {
        token = 'test-CIRCLE-' + Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 5));
      } else {
        return;
      }
      if (!token) {
        this.ws?.destory();
        return;
      }
      this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/circle/open?token=${token}`);
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });

    this.iconService.init('circle');

    let isFastKey = false;
    let count = 0;

    // 禁止空格键页面下滑
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
          case 49:
            this.selector = 0;
            this.operate = { value: '1', item: this.betList[this.selector] };
            break;
          case 50:
            this.selector = 1;
            this.operate = { value: '2', item: this.betList[this.selector] };
            break;
          case 51:
            this.selector = 2;
            this.operate = { value: '3', item: this.betList[this.selector] };
            break;
          case 52:
            this.selector = 3;
            this.operate = { value: '4', item: this.betList[this.selector] };
            break;
          // space-下注
          case 32:
            this.operate = { value: 'bet', item: this.betList[this.selector] };
            break;
          //a-最小赌注
          case 65:
            this.operate = { value: 'min', item: this.betList[this.selector] };
            break;
          //s-减半
          case 83:
            this.operate = { value: 'half', item: this.betList[this.selector] };
            break;
          //d-加倍
          case 68:
            this.operate = { value: 'double', item: this.betList[this.selector] };
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
   */
  onmessage(data: any) {
    if (data.code != 0) {
      // 扣款失败都直接用code 判断
      // this.orignalService.showToast$.next({
      //   content: data.tKey ? this.localeService.getValue(data.tKey) : '',
      // });
      this.toast.show({ message: `${this.localeService.getValue(data.tKey)}!`, type: 'fail' });
      // this.gameLoading = false;
      if (this.showState == 1) {
        this.onloding(false);
      }
    }
    if (data.code == 0) {
      // eslint-disable-next-line default-case
      switch (data.action) {
        case 'JoinRoom':
          this.rotate = this.rotateAnything();
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          if (this.isH5) {
            this.results = data.data.roundNumRecord.splice(0, 26);
          } else {
            this.results = data.data.roundNumRecord;
          }
          this.showState = 4;
          if (data.data.endTime) {
            // 有倒计时说明可以投注状态
            this.showState = 1;
            this.isBet = true;
            this.endTime = Number(data.data.endTime);
            this.onProgress();
          }
          this.onloding(data.data.endTime ? false : true);
          break;
        case 'actionCircleStopBettingApi':
          // 停止下注
          this.showState = 2;
          this.onloding(true);
          break;
        case 'actionShowResultApi':
          // 获取结果
          this.onloding(true);
          this.rotate?.start();
          this.showState = 3;
          break;
        case 'actionResultApi':
          // 展示结果
          // this.showState = 3;
          this.numberSecretKey = data.data.numberSecretKey;
          // this.RotationIndex(data.data.value + 1)
          // setTimeout(() => {
          this.rotate
            ?.end({
              angle: (54 - data.data.value) * (360 / 54),
            })
            .then(() => {
              const runAreaNum = 54 - data.data.value + 1;
              this.color = '#ffb636';
              let colorname = 'yellow';
              if (runAreaNum == 55) {
                this.color = '#ffb636';
                colorname = 'yellow';
                this.role = 'x53.09';
              } else if (this.bglist.red.includes(runAreaNum)) {
                this.color = '#ed1d49';
                colorname = 'red';
                this.role = 'x3.13';
              } else if (this.bglist.green.includes(runAreaNum)) {
                this.color = '#1bb83d';
                colorname = 'green';
                this.role = 'x5.31';
              } else if (this.bglist.gray.includes(runAreaNum)) {
                this.color = '#343f5a';
                colorname = 'gray';
                this.role = 'x2.04';
              }
              this.showState = 5;
              this.circleSidesElement.nativeElement.style.borderColor = this.color;
              this.results.unshift({
                lotteryIssueNumberData: colorname,
                numberPublicKey: this.fairnessData.numberPublicKey,
                numberSecretKey: this.numberSecretKey,
              });
              if (this.results.length > (this.isH5 ? 26 : 30)) {
                this.results.pop();
              }
              this.iconService.circleResultAudioPlay();
            });
          // }, 3000);

          break;
        case 'preparingNextRound':
          // 准备下一轮
          this.onloding(true);
          this.showState = 4;
          this.realHistoryList = [];
          this.circleSidesElement.nativeElement.style.borderColor = `#55657e`;

          break;
        case 'Betting':
          // 开始下注
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.endTime = data.data.end;
          this.onProgress();
          this.onloding(false);
          this.isBet = true;
          this.showState = 1;
          this.betList.forEach(e => {
            if (e.isAuto && e.betAuto) {
              this.toBet(e, true);
            }
          });
          break;
        case 'actionBetApi':
          // 自己投注成功
          this.betList.forEach((e: BetListData) => {
            if (e.betcolor == data.data.color) {
              e.loading = false;
            }
          });
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
                multiplier: data.data.multiplier,
                mainAccountId: data.data.uid,
                userName: data.data.userName ? data.data.userName : this.localeService.getValue('invisible'),
              });
            }
          }
          break;
      }
    }
  }

  toBet(item: any, falg: boolean = false) {
    // var rotate = this.rotateAnything();

    // this.betList.forEach(e => {
    //     if (item.betcolor == e.betcolor) {
    //         e.loading = true;
    //     }
    // })
    const data = {
      betAmount: item.money,
      currency: this.orignalService.currentCurrencyData.currency,
      color: item.betcolor,
      numberId: this.fairnessData.numberId,
      isAuto: item.isAuto.toString(),
    };
    const betData = {
      action: 'actionBetApi',
      data: data,
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    if (item.isAuto) {
      if (!item.betAuto) {
        // 自动投注
        item.betAuto = true;
        this.onloding(true, item.betcolor);
        this.ws.sendMessage(betData);
      } else {
        // 停止自动投注
        if (!falg) {
          item.betAuto = false;
        }
      }
      if (falg) {
        // 自动ws投注
        this.onloding(true, item.betcolor);
        this.ws.sendMessage(betData);
      }
    } else {
      // 手动投注
      this.onloding(true, item.betcolor);
      this.ws.sendMessage(betData);
    }
  }

  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    this.rotate?.stop();
    clearInterval(this.timerCount);
    clearInterval(this.iconAudio);
  }

  /**
   * 第一种转盘方式
   *
   * @param {object} wantToStop  想要停止的位置(块号)
   */
  // RotationIndex(wantToStop: number) {
  //     console.log(wantToStop)
  //     let stopAreaNum = 0; //停在区域的名字数
  //     let angle = 1; //每次旋转角度
  //     let nowTime = 0; //当前时间,随机起点,让停止来的更加真实
  //     let disTime = 15; //时间差值,每15毫秒改变一次,基本上类似于60Hz刷新频率
  //     let disangle = 12; //角度差值
  //     let angle360 = 0; //用于记录角度数,360°范围的
  //     let stop = false; //停在区域的名字数
  //     let areaNum = 54; //区域的块数
  //     let defaultTime = 0.5; //刚开始匀速旋转的时间
  //     let chageTime = 0.8; //刚开始匀速旋转的时间
  //     let UP = (1 - ((12 / chageTime) * defaultTime)); //定义一个函数uniformizing parameter
  //     let IPFP = 12 * defaultTime + (12 / chageTime) * defaultTime * defaultTime; //定义一个反比例函数的参数Inverse proportional function parameters
  //     let myIntervalInRotationIndex = setInterval(() => {
  //         nowTime += disTime;
  //         //当时间小于默认时间时候
  //         if ((nowTime / 1000) <= defaultTime) {

  //             //匀速旋转
  //         } else if ((nowTime / 1000) > defaultTime && (nowTime / 1000) < (defaultTime + chageTime)) {
  //             //当时间大于默认时间,开始减速旋转
  //             disangle = UP + (IPFP / (nowTime / 1000));
  //             /**
  //               * 函数式为:
  //               * UP+IPFP/t=h
  //               * 其中t为时间,h为角度
  //               */
  //         } else {
  //             angle360 = angle % 360;
  //             stopAreaNum = angle360 / (360 / areaNum);
  //             if (stopAreaNum >= (wantToStop - 1.5)) {
  //                 disangle = 0.5;
  //             } else if (stopAreaNum >= (wantToStop - 1)) {
  //                 disangle = 0.5;
  //             } else {
  //                 disangle = 0.8;
  //             }
  //             if (stopAreaNum >= (wantToStop - 1) && stopAreaNum <= wantToStop) {
  //                 clearInterval(myIntervalInRotationIndex);
  //                 stop = true
  //             }

  //         }
  //         angle360 = angle % 360;
  //         angle += disangle;
  //         let runAreaNum = parseInt((angle360 / (360 / areaNum)).toString()) + 1
  //         let color = '#ffb636'
  //         let colorname = 'yellow'
  //         if (runAreaNum == 1) {
  //             color = '#ffb636'
  //             colorname = 'yellow'
  //         } else if (this.bglist.red.includes(runAreaNum)) {
  //             color = '#ed1d49'
  //             colorname = 'red'
  //         } else if (this.bglist.green.includes(runAreaNum)) {
  //             color = '#1bb83d'
  //             colorname = 'green'
  //         } else if (this.bglist.gray.includes(runAreaNum)) {
  //             color = '#343f5a'
  //             colorname = 'gray'
  //         }
  //         this.circleWheelElement.nativeElement.style.transform = `rotate(${angle}deg)`
  //         this.arrowDownElement.nativeElement.style.borderColor = `${color} transparent transparent`;
  //         if (stop) {
  //             this.circleSidesElement.nativeElement.style.borderColor = color;
  //             this.results.unshift({
  //                 lotteryIssueNumberData: colorname,
  //                 numberPublicKey: this.fairnessData.numberPublicKey,
  //                 numberSecretKey: this.numberSecretKey,
  //             })
  //             if (this.results.length > 30) {
  //                 this.results.pop()
  //             }
  //         }
  //     }, disTime)

  // }
  /** 倒计时*/
  timerCount: any = null;
  iconAudio: any = null;
  endTime: number = 0;
  currentCountDown: string = '10.00';
  allTime: number = 0;
  onProgress() {
    // 总共花费时间，
    const date = new Date();
    const now = date.getTime();
    const endDate = new Date(this.endTime); //设置截止时间
    const end = endDate.getTime();
    this.allTime = end - now; //时间差
    this.timerCount = setInterval(() => {
      this.countTime();
    }, 50);
    this.iconAudio = setInterval(() => {
      this.iconService.circleCountAudioPlay();
    }, 300);
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
      if (ms < 100) {
        ms = '0' + ms;
      }
      if (s < 10) {
        s = '0' + s;
      }
      this.currentCountDown = s + ':' + ms.toString().substring(0, 2);
    } else if (leftTime <= 1) {
      clearInterval(this.iconAudio);
      clearInterval(this.iconAudio);
      if (leftTime <= 0) {
        this.currentCountDown = '00:00';
        clearInterval(this.timerCount);
        clearInterval(this.iconAudio);
      }
    }
  }
  /**
   * 按钮loding状态
   * color:设置单个按钮状态，默认设置全部
   *
   * @param type
   * @param color
   */
  onloding(type: boolean, color: string = '') {
    this.betList.forEach((e: BetListData) => {
      if (color == '') {
        e.loading = type;
      } else if (e.betcolor == color) {
        e.loading = type;
      }
    });
  }

  /**
   * 第二种转盘方式
   *
   */
  rotateAnything() {
    const ONE_CIRCLE = 360;
    const elem = this.circleWheelElement.nativeElement;
    elem.style.willChange = 'transform';

    let tweenRes: any = null;
    let rotateStatu = '';
    let diffState = 0;
    const tweenExcution = ({ startValue, endValue, duration, infinite, easingFn, stepCb }: any) => {
      const perUpdateDistance = 1000 / (duration * 60);
      const diffValue = endValue - startValue;

      let position = 0;
      let prevState = 0;
      let state = 0;
      let maxDiffState = 0;
      let shouldStop = false;
      let color = '#ffb636';
      const step = () => {
        const runAreaNum = 54 - parseInt(((state % 360) / (360 / 54)).toString());
        if (runAreaNum == 1) {
          color = '#ffb636';
        } else if (this.bglist.red.includes(runAreaNum)) {
          color = '#ed1d49';
        } else if (this.bglist.green.includes(runAreaNum)) {
          color = '#1bb83d';
        } else if (this.bglist.gray.includes(runAreaNum)) {
          color = '#343f5a';
        }
        this.iconService.circleRotationAudioPlay();
        this.arrowDownElement.nativeElement.style.borderColor = `${color} transparent transparent`;
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
        if (state - diffState > 360 / 54) {
          diffState = state;
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
      end({ angle = 0, easingFn = easeOutQuad, duration = 1200 } = {}) {
        // if (rotateStatu !== ROTATE_STATUS.START) return Promise.resolve();
        if (tweenRes) tweenRes.stop();

        rotateStatu = ROTATE_STATUS.END;
        const currentValue = tweenRes.getState();
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
}
