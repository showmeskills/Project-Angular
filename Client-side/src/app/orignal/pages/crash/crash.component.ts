import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import * as d3 from 'd3';
import { from, range, Subject, Subscription } from 'rxjs';
import { delay, distinctUntilChanged, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';
import { WsService } from '../../shared/services/ws.service';
@UntilDestroy()
@Component({
  selector: 'orignal-crash',
  templateUrl: './crash.component.html',
  styleUrls: ['./crash.component.scss'],
})
export class CrashComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private layout: LayoutService,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private cacheService: CacheService,
    private ws: WsService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private localeService: LocaleService,
    private toast: ToastService
  ) {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });
    // this.orignalService.userBalance$.pipe(untilDestroyed(this)).subscribe((data: any) => {
    //   this.balance = data?.balance;
    // });

    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      if (v) {
        this.uid = v.uid;
      }
    });
    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(v => {
      this.currentCurrencyData = v;
    });
    //主题色获取
    this.appService.themeSwitch$.pipe(untilDestroyed(this)).subscribe(v => {
      this.theme = v;
    });
    this.orignalService.gameName$.next(this.route.snapshot.data.name);
    this.tenant = environment.common.tenant; //商户Id
  }

  @ViewChild('gameChartSg') chartSvgElement!: ElementRef; //开奖动画SVG
  @ViewChild('plane') planeElement!: ElementRef;
  @ViewChild('airship') airshipElement!: ElementRef; //火箭

  /** 用户余额 */
  // balance: string = "0";
  /** 当前选择币种信息 */
  currentCurrencyData!: CurrenciesInterface;
  /** 用户id */
  uid: string = '';
  /** svgHTML */
  svgContainer: any;
  tenant: string = '';
  // list = [{ value: 100.00, cls: "pt100" }, { value: 99.99, cls: "pt99" }, { value: 19.99, cls: "pt19" }, { value: 4.99, cls: "pt4" }, { value: 1.99, cls: "pt1" }, { value: 1.19, cls: "pt09" }, { value: 100.00, cls: "pt100" }, { value: 99.99, cls: "pt99" }, { value: 19.99, cls: "pt19" },];

  /** 是否开始飞， */
  isFly: boolean = false;
  /** 初始为1倍 */
  step: string = '1.00';
  /** 渲染页面倍数定时器 */
  stepTime: any = null;
  /** 用户投注消息接受 */
  isOpen: boolean = false;
  userData: any = {};
  /** H5 */
  isH5!: boolean;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 是否开启热键 */
  isHotkey!: boolean;
  /** 公平性验证的numberid和pubkey */
  fairnessData: any;
  /** 游戏状态 */
  action: string = '';
  /** 兑换倍数*/
  rate!: number;
  /** 暂存投注，开始投注时，发送投注消息*/
  tempBet: any = null;
  /** 是否爆炸*/
  isboom: boolean = false;
  /** 是否出现伞兵*/
  isParachute: boolean = false;

  /** 历史记录*/
  historyList: Array<any> = [];
  /** 后端新增投注参数*/
  numberPublicKey: string = '';
  numberId: number = 0;

  /** 是否开启动画 */
  isAnimation!: boolean;
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
  /** theme主题 */
  theme: string = '';
  /** 实时投注信息展示 */
  realHistoryList: any = [];
  /** 飞机图片加载完成后才能飞 */
  imgload: boolean = false;

  step$: Subject<number> = new Subject();
  range$!: Subscription;
  stepValue: string = '1.00';
  async ngOnInit() {
    this.iconService.init('crash');
    this.isAnimation = this.cacheService.animation;
    this.rate = 2;
    this.svgContainer = d3.selectAll('svg');
    setTimeout(() => {
      this.initPosition();
    });
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe(v => {
      let token = '';
      if (v) {
        token = this.orignalService.token;
      } else if (v === false) {
        token = 'test-CRASH-' + Math.floor((Math.random() + Math.floor(Math.random() * 9 + 1)) * Math.pow(10, 5));
      } else {
        return;
      }
      if (!token) {
        this.ws?.destory();
        return;
      }
      this.stopAutoLoop();
      this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/crash/open?token=${token}`);
    });

    this.appService.currentCurrency$
      .pipe(
        map(v => v?.currency),
        distinctUntilChanged()
      )
      .subscribe(v => {
        this.stopAutoLoop();
      });

    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    this.betService.crashBetstate$.pipe(untilDestroyed(this)).subscribe((e: string) => {
      if (e == 'betclear') {
        this.betService.tempBet$.next(null);
        this.betService.crashBetstate$.next('betnext');
      }
    });
    this.betService.tempBet$.pipe(untilDestroyed(this)).subscribe((e: any) => {
      this.tempBet = e;
    });

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
          // space-下注
          case 32:
            this.operate = { value: 'bet' };
            break;
          //a-最小赌注
          case 65:
            this.operate = { value: 'min' };
            break;
          //s-减半
          case 83:
            this.operate = { value: 'half' };
            break;
          //d-加倍
          case 68:
            this.operate = { value: 'double' };
            break;
          //q-乘数上升
          case 81:
            this.operate = { value: 'rateAdd' };
            break;
          //w-乘数降低
          case 87:
            this.operate = { value: 'rateReduce' };
            break;
          //e-预言数字变大
          case 69:
            break;
          default:
            break;
        }
      }
    };
    this.step$.pipe(untilDestroyed(this)).subscribe(x => {
      this.stepValue = x.divide(100).toDecimal(2);
    });
  }
  loaded() {
    this.imgload = true;
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
    }
    if (data.code == 0) {
      // 开始下注 actionCrashBettingApi
      // 停止下注 actionCrashStopBettingApi
      // 发送倍数中 actionCrashFlyApi
      // 停止发送倍数 actionCrashSettlementApi
      // 展示结果 actionCrashResultApi
      if (data.action && data.action != 'actionCrashAllBetApi') {
        this.action = data.action;
      }

      switch (data.action) {
        case 'BetRecord':
          // 初始进入，判断状态
          const betlist: Array<any> = [];
          data.data.betList.forEach((e: any) => {
            const bet = {
              mainAccountId: e.lotteryUserId,
              currency: e.lotteryCurrency,
              BetAmount: e.lotteryAmount,
              nickName: e.lotteryUserId,
              stop: e.lotteryOdds ? e.lotteryOdds : null,
              winColor: e.lotteryOdds ? true : false,
            };
            betlist.push(bet);
            if (e.lotteryUserId == data.data.userId && !e.lotteryOdds) {
              // 说明自己投注过,还没中奖，表示现在不能投注
              this.betService.crashBetstate$.next('betsussce');
              this.isBet = false;
            }
          });
          this.realHistoryList = betlist;
          this.orignalService.realHistoryList$.next(this.realHistoryList);
          break;
        case 'JoinRoom':
          // 进入房间 获取历史记录
          this.historyList = data.data.result.split(',');
          this.numberPublicKey = data.data.numberPublicKey;
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
          };
          if (data.data.endTime) {
            // 有倒计时说明可以投注状态
            this.isBet = true;
            this.endTime = Number(data.data.endTime);
            this.onProgress();
          }
          break;
        case 'actionCrashBettingApi':
          // 开始下注 actionCrashBettingApi
          this.isBet = true;
          this.numberPublicKey = data.data.numberPublicKey;
          console.log(1111, data);
          this.numberId = data.data.numberId;
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          // 倒计时10秒开始
          this.endTime = data.data.end;
          this.onProgress();

          if (this.tempBet) {
            // 延时一会再投注 后端反应不过来
            this.tempBet.data.numberId = data.data.numberId;
            this.tempBet.numberPublicKey = data.data.numberPublicKey;

            setTimeout(() => {
              this.ws.sendMessage({
                ...this.tempBet,
                data: this.tempBet?.data,
              });
              this.betService.tempBet$.next(null);
            }, 500);
          } else {
            this.betService.crashBetstate$.next('betting');
          }
          // 清空实时投注
          this.realHistoryList = [];
          this.orignalService.realHistoryList$.next([]);
          break;
        case 'actionCrashBetApi':
          // 说明投注成功了 后端改action状态后，再次修改用状态判断
          // this.orignalService.refreshUserBanlance$.next(true)
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
          this.mainAccountId = data.data.mainAccountId;
          this.betService.crashBetstate$.next('betsussce');

          break;
        case 'actionCrashAllBetApi':
          // 实时投注消息接受
          this.realHistoryList.push(data.data);
          this.orignalService.realHistoryList$.next(this.realHistoryList);
          break;
        case 'actionCrashStopBettingApi':
          this.isBet = false;
          // 停止下注 actionCrashStopBettingApi

          clearInterval(this.timerCount);
          this.timerCount = null;
          if (this.betService.crashBetstate$.value == 'betsussce') {
            this.betService.crashBetstate$.next('betsussceloading');
          } else {
            this.betService.crashBetstate$.next('stoploading');
          }
          break;
        case 'actionCrashResultApi':
          // 结果 actionCrashResultApi  后端记录而已，前端不需要

          break;
        case 'actionCrashFlyApi':
          // 发送倍数中 actionCrashFlyApi
          if (this.imgload) {
            this.flyStart();
          }

          this.range$?.unsubscribe();
          const oldValue = Number(this.step).subtract(100).add(1);
          let count = Math.floor(data.data.coef.subtract(100).minus(oldValue));
          if (count >= 1 && count <= 200) {
            this.range$ = range(oldValue, count)
              .pipe(delay(10))
              .subscribe(x => {
                this.step = x.divide(100).toDecimal(2);
                this.step$.next(x);
              });
          } else if (count > 200) {
            const add = count.divide(200);
            count = 200;
            this.range$ = from(this.onRange(oldValue, add))
              .pipe(delay(10))
              .subscribe(x => {
                this.step = x.divide(100).toDecimal(2);
                this.step$.next(x);
              });
          }
          this.step = data.data.coef.subtract(100).divide(100).toDecimal(2);
          this.step$.next(data.data.coef.subtract(100));

          if (this.betService.crashBetstate$.value == 'betcashout') {
            this.betService.crashCope$.next(this.step);
          }
          break;

        case 'actionCrashStopApi':
          // 所有用户达到兑奖 中奖消息 mainAccountId要来匹配
          if (data.data.mainAccountId === this.mainAccountId) {
            // 自己中奖了;
            if (this.isLoop) {
              this.winOrlose = true;
              const betAmount = Number(this.LoopData.oldmoney ?? this.LoopData.money);
              this.lotteryBetReturnAmount = Number(betAmount.subtract(this.rate));
              this.winProcess();
            }
            this.iconService.winAudioPlay();
          }
          // 中奖后，改变实时投注颜色
          this.realHistoryList.forEach((e: any) => {
            if (e.mainAccountId == data.data.mainAccountId) {
              e.winColor = true;
              e.stop = data.data.stop;
            }
          });
          this.orignalService.realHistoryList$.next(this.realHistoryList);

          // 漂浮动画
          this.startUserAnimation(data.data.mainAccountId);
          break;
        case 'actionCrashSettlementApi':
          // 停止发送倍数 actionCrashSettlementApi

          this.betService.crashBetstate$.next('betnext');
          this.svgContainer.select('#flyline').remove();
          this.isboom = true;
          this.iconService.boomAudioPlay();
          this.stepValue = data.data.coef.toDecimal(2);
          this.historyList.unshift(this.stepValue);
          // // 两秒动画效果
          // 出现伞兵
          setTimeout(() => {
            this.isParachute = true;
          }, 1000);
          setTimeout(() => {
            this.isboom = false;
            this.isFly = false;
            this.isParachute = false;
            this.stepValue = '1.00';
            this.step = '1.00';
            this.initPosition();
          }, 3000);

          if (this.isLoopbet) {
            if (this.rate > data.data.coef) {
              this.lotteryBetReturnAmount = 0;
              this.winOrlose = false;
              this.loseProcess();
            } else {
              // 赢了
              this.lotteryBetReturnAmount = this.rate.subtract(Number(this.LoopData.oldmoney ?? this.LoopData.money));
              this.winOrlose = true;
            }
            this.onSendLoop();
          }

          break;
        case 'actionCrashBalanceRefreshApi':
          // 结算金额
          // this.orignalService.refreshUserBanlance$.next(true)
          break;
        default:
          break;
      }
    }
  }

  onRange(oldValue: number, addnumber: number) {
    let step = oldValue.minus(1);
    return Array.apply(null, Array(200)).map((v, i) => {
      step = step.add(addnumber);
      return step;
    });
  }
  /**
   * @description 平滑度处理飞行倍数
   */
  // newDateTime: any = null
  // oldDateTime: any = null
  // onCrashFly(coef: number) {
  //   this.newDateTime = new Date().getTime()
  //   if (this.oldDateTime) {
  //     this.setpBreakup(coef, Number(this.step))
  //   } else {
  //     this.step = coef.toDecimal(2);

  //   }
  //   this.oldDateTime = this.newDateTime
  // }
  /**
   * @description 计算时间差所需要飞行的速度
   */
  // setpBreakup(newStep: number, oldStep: number) {
  //   if (this.stepTime) {
  //     clearTimeout(this.stepTime)
  //     this.stepTime = null
  //   }
  //   // 假设0.01数字往上加
  //   let dd: number = 0.01
  //   // 数字差值
  //   let diff: number = newStep.minus(oldStep)
  //   // 0.01往上加需要拆成的个数
  //   let breakNub: number = diff.divide(dd)
  //   // 时间差
  //   let timerDiff: number = this.newDateTime - this.oldDateTime
  //   // 计算在指定
  //   let intervalTime: number = timerDiff.divide(breakNub)

  //   this.stepTime = setTimeout(() => {
  //     this.step = Number(this.step).add(dd).toDecimal(2)
  //   }, intervalTime)
  // }
  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
  }
  /**
   * @description 初始化线条与飞艇图片位置
   */
  initPosition() {
    const svgElement = this.chartSvgElement.nativeElement as SVGElement;
    const height = svgElement.clientHeight;
    this.planeElement.nativeElement.style.top = `${height - 15 - 25}px`;
    this.planeElement.nativeElement.style.left = '5px';
    this.planeElement.nativeElement.style.transform = `rotate(0deg)`;
    console.log(this.planeElement.nativeElement.style.top);
  }

  flyStart() {
    if (this.isFly) return;
    this.isFly = true;
    if (this.betService.crashBetstate$.value == 'betsussceloading') {
      this.betService.crashBetstate$.next('betcashout');
    } else {
      this.betService.crashBetstate$.next('betnext');
    }
    const svgElement = this.chartSvgElement.nativeElement as SVGElement;
    const width = svgElement.clientWidth;
    const height = svgElement.clientHeight;
    if (!this.airshipElement) return;
    const airshipWidth = this.airshipElement.nativeElement.clientWidth;
    const airshipHeight = this.airshipElement.nativeElement.clientHeight;
    // 起始点为(0,600)，控制点在(600,600)，结束点为(600,0)
    const path = this.svgContainer
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr(
        'd',
        `M30, ${height - airshipHeight / 2 - 12} Q${width - airshipWidth / 2},${height - airshipHeight / 2} ${
          width - airshipWidth / 2
        }, ${airshipHeight + 10}`
      )
      .attr('id', 'line');
    const pathline: any = path.node();
    const len = pathline.getTotalLength();

    const mCircle = this.svgContainer.select('#m-circle').attr('r', width);

    this.startGameAnimation(path, pathline, len, mCircle);
  }

  /**
   * 飛機爆炸動畫
   *
   * @param path
   * @param pathline
   * @param len
   * @param mCircle
   */
  startGameAnimation(path: any, pathline: any, len: number, mCircle: any) {
    this.svgContainer.select('#flyline').remove();

    const airshipWidth = this.airshipElement.nativeElement.clientWidth;
    const airshipHeight = this.airshipElement.nativeElement.clientHeight;
    this.svgContainer
      .append('path')
      .attr('stroke', '#F04E23')
      .attr('fill', 'none')
      .attr('id', 'flyline')
      .attr('stroke-width', '8px')
      .attr('mask', 'url(#Mask)')
      .transition()
      .duration(3000)
      .attrTween('d', () => {
        if (this.action == 'actionCrashFlyApi' && !this.isboom) {
          const coord: any = path
            .attr('d')
            .replace(/(M|Q)/g, '')
            .match(/((\d|\.)+)/g);
          const x1 = +coord[0],
            y1 = +coord[1], // 起点
            x2 = +coord[2],
            y2 = +coord[3]; // 控制点

          return (t: any) => {
            const p = pathline.getPointAtLength(t * len);
            const x = (1 - t) * x1 + t * x2;
            const y = (1 - t) * y1 + t * y2;
            mCircle.attr('cx', p.x).attr('cy', p.y);
            // 火箭动画位置
            if (!this.isboom) {
              this.planeElement.nativeElement.style.top = `${p.y - airshipHeight / 2}px`;
              this.planeElement.nativeElement.style.left = `${p.x - airshipWidth / 2}px`;
              const plane = this.planeElement.nativeElement.parentElement?.getElementsByClassName(
                'plane'
              )[0] as HTMLElement;
              const angle = Math.atan2(p.x, p.y) * (180 / Math.PI);
              plane.style.transform = `rotate(${-angle}deg)`;
            }
            return `M${x1}, ${y1} Q${x},${y} ${p.x}, ${p.y}`;
          };
        }
        return '';
      });
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
      console.log('已截止');
      this.progressWidth = '0%';
      this.currentCountDown = '00:00';
      clearInterval(this.timerCount);
    }
  }
  /*
   * 用户投注信息动画效果
   *
   */
  startUserAnimation(name: string) {
    const svgElement = this.chartSvgElement.nativeElement as SVGElement;
    const div = this.renderer.createElement('div');
    div.innerHTML = name;
    this.renderer.addClass(div, 'user-data');
    this.renderer.appendChild(svgElement.parentElement, div);
    const top = this.planeElement.nativeElement.offsetTop;
    const left = this.planeElement.nativeElement.offsetLeft;
    const x = left + 20;
    const y = top + 32;
    div.style.top = `${y}px`;
    div.style.left = `${x}px`;
    div.style.opacity = 1;
    // // 开始动画淡入淡出动画
    let speed = 0;
    let speedop = 0;

    const userTimer = setInterval(() => {
      speed = speed + 0.2;
      speedop = speedop + 0.01;
      div.style.top = `${y + speed}px`;
      div.style.opacity = 1 - speedop;
      if (div.style.opacity <= 0) {
        clearInterval(userTimer);
        this.renderer.removeChild(svgElement.parentElement, div);
      }
    }, 10);
  }
  toBet(event: any) {
    this.iconService.betAudioPlay();
    const data = {
      betAmount: Number(event),
      currency: this.orignalService.currentCurrencyData.currency,
      autoStop: Number(this.rate),
      numberId: this.numberId,
      userId: this.uid,
    };
    const betData = {
      action: 'actionCrashBetApi',
      data: data,
      numberPublicKey: this.numberPublicKey,
    };

    if (this.isBet) {
      this.ws.sendMessage(betData);
      this.betService.crashBetstate$.next('betsussce');
    } else if (this.betService.crashBetstate$.value == 'betcashout') {
      // 如果是套现状态 点击套现
      this.ws.sendMessage({
        action: 'actionCrashStopApi',
        data: {
          userId: this.uid,
        },
      });
      // 回到下一轮状态
      this.betService.crashBetstate$.next('betnext');
    } else {
      // 显示取消
      this.betService.crashBetstate$.next('betcancel');
      this.betService.tempBet$.next({ action: 'actionCrashBetApi', data });
    }
  }
  //下注

  // {
  // "action":"actionCrashBetApi",
  // "data":{
  // "betAmount":1.002,
  // "currency":"usd"
  // }
  // }

  // //停止倍数

  // {
  // "action":"actionCrashStopApi",
  // "data":{
  // "rate":1.20
  // }
  // }

  historybackground(item: number) {
    if (item >= 1 && item <= 1.19) {
      return '#E04461';
    } else if (item >= 1.2 && item <= 1.99) {
      return '#3ECC7F';
    } else if (item >= 2 && item <= 4.99) {
      return '#32BFDE';
    } else if (item >= 5 && item <= 19.99) {
      return '#A054FF';
    } else if (item >= 20 && item <= 99.99) {
      return '#FF23CF';
    } else if (item >= 100) {
      return 'linear-gradient(180deg, #FFCF23 0%, #ECA00D 100%)';
    } else {
      return '';
    }
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
  submitLoop(loopInfo: any) {
    console.log(loopInfo);
    this.LoopData = loopInfo;
    const data = {
      isAuto: true,
      betAmount: Number(this.LoopData.oldmoney ?? this.LoopData.money),
      currency: this.orignalService.currentCurrencyData.currency,
      autoStop: Number(this.rate),
      numberId: this.numberId,
      userId: this.uid,
    };
    const betData = {
      action: 'actionCrashBetApi',
      data: data,
      numberPublicKey: this.numberPublicKey,
    };
    if (this.action == 'actionCrashBettingApi') {
      this.ws.sendMessage(betData);
    } else {
      this.betService.tempBet$.next({ action: 'actionCrashBetApi', data });
    }
  }
  // 真实连续投注

  onSendLoop() {
    if (this.LoopData.betNmb === 0) {
      this.stopAutoLoop();
      this.LoopData.betNmb = '';
      this.cacheService.loopInfos = { ...this.cacheService.loopInfos, betNmb: this.LoopData.betNmb };
      return;
    }

    // 投注成功

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

    if (this.LoopData.isLoop) {
      this.submitLoop(this.LoopData);
    } else {
      this.stopAutoLoop();
    }
  }

  /**
   * 连续投注赢了处理
   */
  winProcess() {
    /** 初始投注金额记住 ，此值保持不变*/
    const money = this.LoopData.money;
    /** 投注使用的金额 ，赢损增加满足后使用*/
    let oldmoney = this.LoopData.oldmoney ?? this.LoopData.money;
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
        this.winloseState = this.lotteryBetReturnAmount > 0 ? 1 : 2;
      } else {
        //赢了增加没填写的情况 金额变成初始投注值
        oldmoney = money;
      }
    } else {
      if (this.LoopData.winPercent && this.LoopData.winPercent != '') {
        oldmoney = Number(oldmoney).add(Number(this.LoopData.winPercent).divide(100).subtract(Number(oldmoney)));
        this.winloseState = this.lotteryBetReturnAmount > 0 ? 1 : 2;
      }
    }

    // 一轮总输赢统计
    this.betService.winLoseAmount = Number(
      this.betService.winLoseAmount.add(this.lotteryBetReturnAmount.minus(Number(oldmoney))).toDecimal(8)
    );

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
      this.lotteryBetReturnAmount,
      '-输赢返还--',
      Number(oldmoney),
      '-投注金-'
    );
    //检查是否有止盈
    if (this.LoopData.profitNmb != '' && this.betService.winLoseAmount >= this.LoopData.profitNmb) {
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
   * 连续投注输了处理
   */
  loseProcess() {
    /** 初始投注金额记住 ，此值保持不变*/
    const money = this.LoopData.money;
    /** 投注使用的金额 ，赢损增加满足后使用*/
    let oldmoney = this.LoopData.oldmoney ?? this.LoopData.money;

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
        this.winloseState = this.lotteryBetReturnAmount > 0 ? 1 : 2;
      } else {
        // 输了增加没填写的情况 金额变成初始投注值
        oldmoney = money;
      }
    } else {
      if (this.LoopData.losePercent && this.LoopData.losePercent != '') {
        oldmoney = Number(oldmoney).add(Number(this.LoopData.losePercent).divide(100).subtract(Number(oldmoney)));
        this.winloseState = this.lotteryBetReturnAmount > 0 ? 1 : 2;
      }
    }
    // 一轮总输赢统计
    this.betService.winLoseAmount = Number(this.betService.winLoseAmount.minus(Number(oldmoney)).toDecimal(8));

    console.log(
      this.betService.winLoseAmount,
      '一轮总输赢--',
      this.lotteryBetReturnAmount,
      '-输赢返还--',
      Number(oldmoney),
      '-投注金-'
    );
    // 检查是否有最大投注额
    if (
      this.LoopData.MaxbetNmb &&
      this.LoopData.MaxbetNmb != '' &&
      Number(oldmoney) > Number(this.LoopData.MaxbetNmb)
    ) {
      oldmoney = this.LoopData.MaxbetNmb;
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
    this.betService.tempBet$.next(null);
    this.betService.crashBetstate$.next('betting');
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
