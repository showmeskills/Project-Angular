import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom, timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CurrencyBalance } from 'src/app/shared/interfaces/wallet.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { NativeAppService } from 'src/app/shared/service/native-app.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { PlinkoApi } from '../../shared/apis/plinko.api';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';
import { WsService } from '../../shared/services/ws.service';

@UntilDestroy()
@Component({
  selector: 'orignal-plinko',
  templateUrl: './plinko.component.html',
  styleUrls: ['./plinko.component.scss'],
})
export class PlinkoComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private plinkoApi: PlinkoApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private currencyValuePipe: CurrencyValuePipe,
    private cacheService: CacheService,
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
  }
  @ViewChild('canvas') canvasElement!: ElementRef;
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
  betType = 'plinko';
  money: string = '0.00000000';
  /** 当前选择币种信息 */
  currentCurrencyData!: CurrenciesInterface;
  /** 投注中 */
  loading!: boolean;
  /** 是否在自动投注 */
  isLoop: boolean = false;
  /** 自动投注是否投注成功 */
  isLoopbet: boolean = false;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 心跳定时器 */
  heartbeat: any = null;
  /**用户余额 */
  userBalance!: any;
  isAuto: boolean = false;
  /** 是否登录 */
  isLogin: boolean = false;
  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.isLogin = x ? true : false;
      this.ws?.destory();
      this.isBet = false;
      if (x) {
        if (!this.orignalService.token) return;
        await this.setMultiplier();
        this.num = 0;
        this.plots = [];
        this.bottomPlot = [];
        if (this.ctx) {
          this.ctx.clearRect(0, 0, this.resolutionX, this.resolutionY);
          this.ctx1.clearRect(0, 0, this.resolutionX, this.resolutionY);
          this.grid(this.row + 3, this.row, this.resolutionX / ((this.row + 4) * 8));
          this.ctx.drawImage(this.ctx1.canvas, 0, 0);
        } else {
          await firstValueFrom(timer(200));
          this.ctx.clearRect(0, 0, this.resolutionX, this.resolutionY);
          this.ctx1.clearRect(0, 0, this.resolutionX, this.resolutionY);
          this.grid(this.row + 3, this.row, this.resolutionX / ((this.row + 4) * 8));
          this.ctx.drawImage(this.ctx1.canvas, 0, 0);
        }
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/plinko/open?token=${this.orignalService.token}`);
      }
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    // 操作声音初始化
    this.iconService.init('plinko');
    setTimeout(() => {
      this.ctx = this.canvas(true);
      this.ctx1 = this.canvas(false);
      this.kt = this.resolutionX / 2000;
      // this.row = 16

      this.run();
    }, 60);

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
  /** 排数 */
  row: number = 12;
  // 风险等级 low centre   high
  selectedRisk: string = 'low';
  kt: number = 0;
  resolutionX: number = 0;
  resolutionY: number = 0;
  /** 钉子个数*/
  num: number = 0;
  ctx!: any;
  ctx1!: any;
  plots: any = [];
  balls: any = [];
  runtime!: any;
  rowWidth: number = 77;
  // 赔率
  raleAll: any = [];
  // 赔率颜色 固定写死
  colorAll: any = {
    16: [
      '#EC23F0',
      '#FF2775',
      '#F02323',
      '#F05423',
      '#F06D23',
      '#F07923',
      '#F08523',
      '#F09223',
      '#F09E23',
      '#F09223',
      '#F08523',
      '#F07923',
      '#F06D23',
      '#F05423',
      '#F02323',
      '#FF2775',
      '#EC23F0',
    ],
    15: [
      '#EC23F0',
      '#FF2775',
      '#F02323',
      '#F05423',
      '#F06D23',
      '#F07923',
      '#F08523',
      '#F09223',
      '#F09223',
      '#F08523',
      '#F07923',
      '#F06D23',
      '#F05423',
      '#F02323',
      '#FF2775',
      '#EC23F0',
    ],
    14: [
      '#FF2775',
      '#F02323',
      '#F05423',
      '#F06D23',
      '#F07923',
      '#F08523',
      '#F09223',
      '#F09E23',
      '#F09223',
      '#F08523',
      '#F07923',
      '#F06D23',
      '#F05423',
      '#F02323',
      '#FF2775',
    ],
    13: [
      '#FF2775',
      '#F02323',
      '#F05423',
      '#F06D23',
      '#F07923',
      '#F08523',
      '#F09223',
      '#F09223',
      '#F08523',
      '#F07923',
      '#F06D23',
      '#F05423',
      '#F02323',
      '#FF2775',
    ],
    12: [
      '#F02323',
      '#F05423',
      '#F06D23',
      '#F07923',
      '#F08523',
      '#F09223',
      '#F09E23',
      '#F09223',
      '#F08523',
      '#F07923',
      '#F06D23',
      '#F05423',
      '#F02323',
    ],
    11: [
      '#F02323',
      '#F05423',
      '#F06D23',
      '#F07923',
      '#F08523',
      '#F09223',
      '#F09223',
      '#F08523',
      '#F07923',
      '#F06D23',
      '#F05423',
      '#F02323',
    ],
    10: [
      '#F05423',
      '#F06D23',
      '#F07923',
      '#F08523',
      '#F09223',
      '#F09E23',
      '#F09223',
      '#F08523',
      '#F07923',
      '#F06D23',
      '#F05423',
    ],
    9: ['#F05423', '#F06D23', '#F07923', '#F08523', '#F09223', '#F09223', '#F08523', '#F07923', '#F06D23', '#F05423'],
    8: ['#F05423', '#F06D23', '#F07923', '#F08523', '#F09E23', '#F08523', '#F07923', '#F06D23', '#F05423'],
  };
  // 搜集掉落洞口的坐标
  coordinates: any[] = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
  historyData: any = [{ num: 0, color: '#EC23F0' }];
  bottomY!: number;
  /** 赔率 */
  rate = 1;
  allCurrencyBalance: CurrencyBalance[] = [];

  // 虚拟小球
  virtualBalls: any = [];
  /**
   * @param msg
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
      this.loading = false;
      this.isBet = false;
      // this.ws.sendMessage(JSON.stringify({ action: "actionPlinkoPublicKeyApi" }))
    }
    if (data.code == 0) {
      switch (data.action) {
        case 'JoinRoom':
          // 初次进入 获取投注key
          // this.ws.sendMessage(JSON.stringify({ action: "actionPlinkoPublicKeyApi" }))
          // 开启定时发送心跳
          clearInterval(this.heartbeat);
          this.heartbeat = setInterval(() => {
            this.ws.sendMessage({ action: 'type' });
          }, 15000);
          if (data.data && data.data.result.length > 0) {
            this.historyData = [{ num: 0, color: '#EC23F0' }];
            data.data.result.reverse().forEach((e: number) => {
              const rale = this.raleAll.find((j: any) => j.multiplier == e);
              if (rale) {
                this.historyData.unshift(rale);
                if (this.historyData.length > 7) {
                  this.historyData.pop();
                }
              }
            });
          }
          this.isBet = true;
          break;
        case 'actionPlinkoPublicKeyApi':
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };

          const betData1 = {
            betAmount: Number(this.money),
            currency: this.currentCurrencyData.currency,
            risk: this.selectedRisk,
            bayNumber: this.row.toString(),
            numberId: this.fairnessData.numberId.toString(),
            isAuto: this.isAuto,
          };
          const betData = {
            action: 'actionPlinkoBetApi',
            numberPublicKey: this.fairnessData.numberPublicKey,
            data: betData1,
          };
          this.ws.sendMessage(betData);

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
          } else {
            this.stopAutoLoop();
          }

          if (this.isLoopbet) {
            this.submitLoop(this.LoopData);
          }
          break;
        case 'actionPlinkoBetApi':
          // 投注结果
          // setTimeout(async () => {
          this.orignalService.chartMessage$.next({ gameId: 'plinko', amount: data.data.lotteryAmount, type: 'bet' });
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
          if (!this.isFastBet) {
            this.addPlot(data.data);
            this.appService.originalAutoBet$.next(true);
          } else {
            this.noFastBet(data.data.lotteryBetDetail);
            this.orignalService.chartMessage$.next({ gameId: 'plinko', amount: data.data.winLossAmount, type: 'set' });
            if (item) {
              // 余额更新
              const amount = data.data.winLossAmount.add(data.data.lotteryAmount);
              item.nonStickyBalance = item.nonStickyBalance.add(amount);
              this.appService.userBalance$.next([...this.allCurrencyBalance]);
              const winLossAmount = this.currencyValuePipe.transform(amount, this.currentCurrencyData.currency);
              this.appService.assetChangesAnimation$.next(winLossAmount);
              if (this.appService.isNativeApp) {
                this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item.nonStickyBalance);
              }
            }
          }
          //

          // this.loading = false;

          // this.isBet = false;
          // }, this.isFastBet ? 0 : 1000);
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
    if (this.runtime) clearInterval(this.runtime);
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.appService.assetChangesLock$.next(false);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(false);
    }
    this.appService.originalAutoBet$.next(false);
    if (this.isLogin) {
      this.appService.assetChanges$.next({ related: 'Wallet' });
    }
  }

  /**
   * 投注
   *
   * @param event
   */
  async toBet(event: any) {
    if (this.loading || !this.isBet) return;
    const item = this.allCurrencyBalance.find(
      balanceItem => balanceItem.currency === this.currentCurrencyData.currency
    );
    if (item) {
      if (Number(event) > item.nonStickyBalance) return;
    }
    this.ws.sendMessage({ action: 'actionPlinkoPublicKeyApi' });
    this.appService.assetChangesLock$.next(true);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    // this.loading = true;
    this.betService.minesBetstate$.next({ betting: true });
    this.money = event;
    this.isAuto = false;
  }
  LoopData: any = {};
  /**
   * 自动投注
   *
   * @param loopInfo
   */
  async submitLoop(loopInfo: any) {
    if (this.loading || !this.isBet) return;

    const item = this.allCurrencyBalance.find(
      balanceItem => balanceItem.currency === this.currentCurrencyData.currency
    );
    if (item) {
      if (Number(loopInfo.money) > item.nonStickyBalance) {
        this.stopAutoLoop();
        return;
      }
    }
    this.ws.sendMessage({ action: 'actionPlinkoPublicKeyApi' });
    this.appService.assetChangesLock$.next(true);
    if (this.appService.isNativeApp) {
      this.nativeAppService.onLockTitleMoney(true);
    }
    // this.loading = true;
    this.LoopData = loopInfo;
    this.betService.minesBetstate$.next({ betting: true });
    this.money = this.LoopData.oldmoney ?? this.LoopData.money;
    this.isAuto = true;
    // let data = {
    //     isAuto: true,
    //     betAmount: Number(this.LoopData.oldmoney ?? this.LoopData.money),
    //     currency: this.currentCurrencyData.currency,
    //     risk: this.selectedRisk,
    //     bayNumber: this.row.toString(),
    //     numberId: this.fairnessData.numberId.toString(),
    // };
    // let betData = {
    //     action: "actionPlinkoBetApi",
    //     data: this.lZStringService.compressBase64(this.encryptService.encrypt(JSON.stringify(data), environment.orignal.originalRsaPublicKey)),
    //     numberPublicKey: this.fairnessData.numberPublicKey
    // }
    // this.ws.sendMessage(JSON.stringify(betData))
  }
  /**
   * 停止自动投注，状态初始化
   */
  stopAutoLoop() {
    this.isLoop = false;
    this.isLoopbet = false;
  }

  /**
   * 风险等级
   *
   * @param e
   */
  riskChange(e: string) {
    this.selectedRisk = e;
    this.setMultiplier();
  }
  /**
   * 排数
   *
   * @param e
   */
  rowChange(e: number) {
    this.row = e;
    this.setMultiplier();
    this.num = 0;
    this.plots = [];
    this.bottomPlot = [];
    this.ctx.clearRect(0, 0, this.resolutionX, this.resolutionY);
    this.ctx1.clearRect(0, 0, this.resolutionX, this.resolutionY);
    this.grid(this.row + 3, this.row, this.resolutionX / ((this.row + 4) * 8));
    this.ctx.drawImage(this.ctx1.canvas, 0, 0);
  }

  // 获取plinko赔率
  async setMultiplier() {
    const data = this.row + '_' + this.selectedRisk;
    const response = await this.plinkoApi.getMultiplier({ gameCode: 'PLINKO', type: data });

    if (response.code == 0) {
      response.data.sort((a: any, b: any) => a.index - b.index);
      response.data.forEach((e: any, i: number) => {
        e.color = this.colorAll[this.row][i];
      });
      this.raleAll = response.data;
    }
  }

  drawBall(ball: any) {
    this.ctx.beginPath();
    this.ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
    // 球的颜色
    this.ctx.fillStyle = 'hsl(216, 100%, 57%)';
    this.ctx.fill();
  }
  drawPlot(ball: any) {
    this.ctx1.beginPath();
    this.ctx1.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);

    this.ctx1.fillStyle = 'hsl(223, ' + (12 - ball.light * 0.33) + '%, ' + (54 + ball.light) + '%)';
    this.ctx1.fill();
    this.ctx1.strokeStyle = this.theme == 'sun' ? '#fff' : '#000';
    this.ctx1.stroke();
  }

  collision(ball: any, Plot: any) {
    // 撞击后
    const dx = ball.x - Plot.x;
    const dy = ball.y - Plot.y;
    // 取得数值的反正切值
    const a = Math.atan2(dy, dx);
    // 正弦
    const s = Math.sin(a);
    // 反弦
    const c = Math.cos(a);
    const vx = -ball.vx * c - ball.vy * s;
    const vy = -ball.vx * s + ball.vy * c;
    ball.vx = vx * c - vy * s;
    ball.vy = vx * s + vy * c;
    ball.x = Plot.x + (ball.r + Plot.r) * c;
    ball.y = Plot.y + (ball.r + Plot.r) * s;
  }

  move(ball: any) {
    // 下落速度
    ball.vy += 0.6;
    ball.vx *= 0.97;
    ball.vy *= 0.97;
    ball.y += ball.vy * this.kt;
    ball.x += ball.vx * this.kt;
    if (!ball.virtual) {
      this.drawBall(ball);
    }
    if (ball.y > this.bottomY + ball.r && !ball.active) {
      // 查询掉落的洞口
      if (!ball.virtual) {
        this.iconService.plinkoBottomAudioPlay();
      }
      const bottomIndex = this.bottomPlot.findIndex((e: number) => ball.x < e);
      if (bottomIndex <= 0) return;
      if (!this.coordinates[bottomIndex - 1].includes(ball.randomNumber)) {
        if (this.coordinates[bottomIndex - 1].length < 20) {
          this.coordinates[bottomIndex - 1].push(ball.randomNumber);
        }
      }
      ball.active = true;
      if (!ball.virtual) {
        this.raleAll[bottomIndex - 1].active = true;
        this.historyData.unshift(this.raleAll[bottomIndex - 1]);
        if (this.historyData.length > 7) {
          this.historyData.pop();
        }
        setTimeout(() => {
          this.raleAll[bottomIndex - 1].active = false;
        }, 500);
      }
    }

    if (ball.y > this.resolutionY + ball.r) {
      if (!ball.virtual) {
        const item = this.allCurrencyBalance.find(
          balanceItem => balanceItem.currency === this.currentCurrencyData.currency
        );
        this.orignalService.chartMessage$.next({ gameId: 'plinko', amount: ball.amount, type: 'set' });
        if (item) {
          item.nonStickyBalance = item.nonStickyBalance.add(ball.winLossAmount);
          this.appService.userBalance$.next([...this.allCurrencyBalance]);
          const winLossAmount = this.currencyValuePipe.transform(ball.winLossAmount, this.currentCurrencyData.currency);
          this.appService.assetChangesAnimation$.next(winLossAmount);
          if (this.appService.isNativeApp) {
            this.nativeAppService.onCurrentMoney(this.currentCurrencyData.currency, item.nonStickyBalance);
          }
        }
      }
      return false;
    }
    return true;
  }

  falg = true;
  reset(ball: any) {
    // 根据this.r * aa 判断落入的洞口
    ball.x = 0.5 * this.resolutionX + 0.5 * ball.r - ball.r * ball.randomNumber;
    ball.y = -ball.r;
    ball.vx = 0;
    ball.vy = 0;
  }

  collision1(e: any) {
    let m = 99999,
      dist = 0,
      plot;
    for (let i = 0; i < this.num; i++) {
      const p = this.plots[i];
      if (!p) return;
      if (p.light > 0) {
        if (!e.virtual) {
          this.drawPlot(p);
        }
        p.light -= 2;
      }
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = dx * dx + dy * dy;
      if (d < m) {
        m = d;
        dist = d;
        plot = p;
      }
    }
    // 两个圆相切，说明碰撞开始，https://www.cnblogs.com/HelloCG/archive/2009/01/14/1375573.html
    if (Math.sqrt(dist) <= e.r + plot?.r) {
      if (!e.virtual) {
        this.iconService.plinkoCollisionAudioPlay();
      }
      this.collision(e, plot);
      plot.light = 50;
    }
  }

  run() {
    // requestAnimationFrame(this.run);
    this.runtime = setTimeout(() => {
      this.run();
    }, 1000 / 60);
    // fadeOut();

    if (this.balls.length == 0) return;
    this.ctx.clearRect(0, 0, this.resolutionX, this.resolutionY);
    this.balls = this.balls.filter((e: any) => {
      this.collision1(e);
      this.ctx.drawImage(this.ctx1.canvas, 0, 0);
      const ball = this.move(e);
      return ball;
    });

    if (this.balls.length == 0) {
      this.appService.originalAutoBet$.next(false);
      this.betService.minesBetstate$.next({ betting: false });
    }
  }
  virtualRun() {
    this.virtualBalls = this.virtualBalls.filter((e: any) => {
      this.collision1(e);
      // this.ctx.drawImage(this.ctx1.canvas, 0, 0);
      const ball = this.move(e);
      return ball;
    });
    if (this.virtualBalls.length == 0) return;
    this.virtualRun();
  }

  canvas(dom: boolean) {
    const canvas = this.canvasElement.nativeElement as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (dom) {
      this.resolutionX = canvas.offsetWidth;
      this.resolutionY = canvas.offsetHeight;
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.resolutionX;
      canvas.height = this.resolutionY;
      return ctx;
    }
    canvas.width = this.resolutionX;
    canvas.height = this.resolutionY;
    return ctx;
  }

  // 底部洞口坐标
  bottomPlot: any = [];
  grid(nx: number, ny: number, radius: number) {
    const dx = this.resolutionX / (nx + 1);
    const dy = this.resolutionY / (ny + 1);
    const hang = nx;

    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        if (y % 2 === 1 && x === nx - 1) continue;
        // 过滤左右圆点
        // 第一行留3个 第二行留4个。。。
        let top = 3;
        if ((this.row & 1) === 0) {
          top = y % 2 == 1 ? dx * 0.5 : 0;
        } else {
          // top = 4
          top = y % 2 == 1 ? 0 : dx * 0.5;
        }

        const a = (hang - (3 + y)) / 2;
        if (x < Math.trunc(a)) continue;
        if (x > a + 3 + y - 1) continue;
        this.plots[this.num] = {
          x: dx + x * dx + top,
          y: dy + y * dy,
          r: radius,
          vx: 0,
          vy: 0,
          light: 0,
        };
        if (y == ny - 1) {
          //
          this.bottomPlot.push(dx + x * dx + top);
          this.bottomY = dy + y * dy;
        }
        this.drawPlot(this.plots[this.num++]);
      }
    }
    this.rowWidth =
      Math.round(
        ((this.bottomPlot[this.bottomPlot.length - 1] - this.bottomPlot[0] + radius * 2) / this.resolutionX) * 10000
      ) / 100.0;

    // 收集洞口坐标
    this.coordinates = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
    this.onVirtual();
  }
  async addPlot(data: any) {
    const location = this.coordinates[data.lotteryBetDetail];
    const randomNumber = location[Math.floor(Math.random() * location.length)];
    // setInterval(() => {
    const ball = {
      x: 0,
      y: 0,
      r: this.resolutionX / ((this.row - 2) * (this.row != 16 ? 8 : 7)),
      vx: 0,
      vy: 0,
      light: 0,
      randomNumber: randomNumber,
      winLossAmount: data.winLossAmount.add(data.lotteryAmount),
      amount: data.winLossAmount,
    };
    this.reset(ball);
    this.balls.push(ball);
    // }, 60)
  }
  onVirtual() {
    for (let index = 0; index < 2000; index++) {
      let randomNumber = Math.random() + 1;
      if (this.falg) {
        randomNumber = Math.random() + 1;
        this.falg = false;
      } else {
        randomNumber = Math.random() - 1;
        this.falg = true;
      }
      const r = this.resolutionX / ((this.row - 2) * (this.row != 16 ? 8 : 7));
      const ball = {
        x: 0.5 * this.resolutionX + 0.5 * r - r * randomNumber,
        y: -r,
        r: r,
        vx: 0,
        vy: 0,
        light: 0,
        randomNumber: randomNumber,
        virtual: true,
      };
      this.virtualBalls.push(ball);
    }

    this.virtualRun();
  }
  noFastBet(lotteryBetDetail: number) {
    this.raleAll[lotteryBetDetail].active = true;
    this.historyData.unshift(this.raleAll[lotteryBetDetail]);
    if (this.historyData.length > 7) {
      this.historyData.pop();
    }
    this.iconService.plinkoBottomAudioPlay();
    setTimeout(() => {
      this.raleAll[lotteryBetDetail].active = false;
    }, 500);

    if (this.balls.length == 0) {
      this.betService.minesBetstate$.next({ betting: false });
    }
  }

  clearCanvas() {
    clearInterval(this.runtime);
  }
}
