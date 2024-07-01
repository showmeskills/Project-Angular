import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom, timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { StairsApi } from '../../shared/apis/stairs.api';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';
import { WsService } from '../../shared/services/ws.service';
import { StairsService } from './stairs.service';

@UntilDestroy()
@Component({
  selector: 'orignal-stairs',
  templateUrl: './stairs.component.html',
  styleUrls: ['./stairs.component.scss'],
})
export class StairsComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private stairsApi: StairsApi,
    private ws: WsService,
    private toast: ToastService,
    private localeService: LocaleService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
    private currencyValuePipe: CurrencyValuePipe,
    private stairsService: StairsService,
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
      this.multiplier.reverse();
    });
  }
  @ViewChild('board') boardElement!: ElementRef;
  @ViewChild('man') manElement!: ElementRef;
  @ViewChild('tabgroup') tabgroupElement!: ElementRef;

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
  betType = 'stairs';
  money: string = '0.00000000';
  /** 当前选择币种信息 */
  currentCurrencyData?: CurrenciesInterface;
  /** 投注中 */
  loading!: boolean;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 心跳定时器 */
  heartbeat: any = null;
  /** 赔率 */
  rate = 1;
  /** 是否显示投注胜利后的倍数提示框 */
  isShowWinTip = false;
  /** 是否显示投注胜利后的倍数提示框内倍数 */
  // winMultiple: any = {};
  /** 赢钱弹出框金额 */
  winMoney: string = '';

  /** 倍数列表 */
  multiplier: any = [];
  /** 所有倍数列表 */
  allmultiplier: any = [];

  rowStairs: any = [];
  /** 1人物跑动 2人物背面爬楼 3人物倒下 4登顶欢呼*/
  type: number = 1;
  /** 人物是否开始跑动 */
  isAnimate: boolean = false;
  /** 人物是否掉头 */
  isLeft: boolean = false;
  /** 人物当前方块位置 */
  runNumber: number = 0;
  /** 石头位置 */
  field: any = [['3', '6', '7', '10']];
  /** 爬楼高度 根据field数组length决定 */
  rowindex: number = 0;
  /** 炸弹数 */
  bombCounts = 4;
  /** 当前倍数Index */
  selected = 0;
  /** 倍数列表位移距离 */
  transformX = 0;
  /** 阻挡连续爬梯子 默认禁止爬梯*/
  stairFalg: boolean = false;

  ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.ws?.destory();
      if (this.heartbeat) clearInterval(this.heartbeat);
      this.clear();
      if (x) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/stairs/open?token=${this.orignalService.token}`);
      }
    });
    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    this.rowStairs = JSON.parse(JSON.stringify(this.stairsService.defaultRowStairs));
    // 操作声音初始化
    this.iconService.init('mines');

    let isFastKey = false;

    // 禁止空格键页面下滑s
    document.body.onkeydown = (e: any): any => {
      if (e.keyCode === 91) {
        isFastKey = true;
      }
      if (e.keyCode === 32) {
        e.preventDefault();
      }
    };

    // 添加键盘监听
    document.onkeyup = event => {
      const e = event || window.event; // 标准化事件对象
      if (isFastKey) {
        isFastKey = false;
        return;
      }

      if (this.isHotkey) {
        switch (e.keyCode) {
          // space-下注
          case 32:
            if (this.isBet) {
              this.operate = { value: 'bet' };
            } else if (!this.isBet && this.selected != 0) {
              this.operate = { value: 'submit' };
              this.iconService.balanceAudioPlay();
            }
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
          //q-自动选择
          case 81:
            if (!this.isBet) {
              this.autoSelect();
            }
            this.iconService.balanceAudioPlay();
            break;
          //w-炸弹变少
          case 87:
            if (this.isBet) {
              if (this.bombCounts > 1) this.bombCounts--;
            }
            this.iconService.balanceAudioPlay();
            break;
          //e-炸弹变多
          case 69:
            if (this.isBet) {
              if (this.bombCounts < 7) this.bombCounts++;
            }
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
      // 扣款失败都直接用code 判断
      // this.orignalService.showToast$.next({
      //   content: data.tKey ? this.localeService.getValue(data.tKey) : '',
      // });
      this.toast.show({ message: `${this.localeService.getValue(data.tKey)}!`, type: 'fail' });
      this.loading = false;
      this.isBet = false;
      this.ws.sendMessage({ action: 'actionPublicKeyApi' });
    }
    if (data.code == 0) {
      // eslint-disable-next-line default-case
      switch (data.action) {
        case 'JoinRoom':
          this.setMultiplier();
          // 开启定时发送心跳
          clearInterval(this.heartbeat);
          this.heartbeat = setInterval(() => {
            this.ws.sendMessage({ action: 'type' });
          }, 15000);

          break;
        case 'actionCurrentApi':
          if (data.data.currentFlag) {
            this.setCurrentBet(data.data);
            this.orignalService.chartMessage$.next({ gameId: 'stairs', amount: data.data.betAmount, type: 'bet' });
          } else {
            this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          }
          break;
        case 'actionPublicKeyApi':
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.isBet = true;
          this.betService.minesBetstate$.next({ betting: false });
          break;
        case 'actionMultiplierApi':
          this.allmultiplier = data.data;
          // 根据炸弹获取对应的赔率
          this.getMultiplier();
          // 初次进入 查询miens是否有未结算的注单
          this.ws.sendMessage({ action: 'actionCurrentApi' });
          break;
        case 'actionBetApi':
          // 开始成功
          this.rowStairs[12].disabled = false;
          this.stairFalg = true;
          this.orignalService.chartMessage$.next({ gameId: 'dice', amount: data.data.betAmount, type: 'bet' });
          break;
        case 'actionChooseApi':
          // 爬梯子
          this.stair = false;
          this.rate = data.data.realBetRate;
          const row = this.rowStairs[13 - this.selected];
          if (data.data.active) {
            //赢
            row.item.forEach((e: any) => {
              if (data.data.currentStonsIndex.includes(e.steps)) {
                e.stone = true;
              }
            });
            if (this.selected == 13) {
              this.isAnimate = true;
              this.type = 4;

              this.ws.sendMessage({
                action: 'actionSettlementApi',
              });
              this.iconService.stairsWinAudioPlay();
            } else {
              this.rowStairs[13 - this.selected - 1].disabled = false;
              this.isAnimate = false;
              this.type = 1;
            }
            this.iconService.diamondAudioPlay();
            this.stairFalg = true;
            this.isSettlement = false;
          } else {
            // 输
            this.isAnimate = true;
            this.type = 3;
            const field = data.data.field.reverse();
            this.rowStairs.forEach((e: any, i: number) => {
              e.item.forEach((j: any) => {
                if (field[i].includes(j.steps)) {
                  j.stone = true;
                }
              });
            });
            this.iconService.bombAudioPlay();
            this.betService.minesBetstate$.next({ betting: false });
            this.ws.sendMessage({ action: 'actionPublicKeyApi' });
            this.stairFalg = false;
            this.orignalService.chartMessage$.next({ gameId: 'stairs', amount: -data.data.betAmount, type: 'set' });
          }

          this.page();
          break;
        case 'actionSettlementApi':
          // 结算成功
          this.isSettlement = true;
          this.orignalService.chartMessage$.next({ gameId: 'stairs', amount: data.data.winLossAmount, type: 'set' });
          if (data.data.field) {
            const field = data.data.field.reverse();
            this.rowStairs.forEach((e: any, i: number) => {
              e.item.forEach((j: any) => {
                if (field[i].includes(j.steps)) {
                  j.stone = true;
                }
              });
            });
          }
          this.winMoney = this.currencyValuePipe.transform(
            Number(this.betService.money$.value).add(data.data.winLossAmount),
            this.currentCurrencyData?.currency ?? ''
          );
          this.showWinTip();
          this.iconService.minesSuccessAudioPlay();
          this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          break;
      }
    }
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
    const data = this.allmultiplier.filter((e: any) => e.stoneIndex == this.bombCounts);
    this.multiplier = data.sort((a: any, b: any) => {
      if (this.isH5) {
        return a.floorIndex - b.floorIndex;
      } else {
        return b.floorIndex - a.floorIndex;
      }
    });
  }
  /**
   * 投注
   *
   * @param event
   */
  async toBet(event: Event) {
    if (!this.isBet) return;
    this.clear();
    this.iconService.selectAudioPlay();
    this.betService.minesBetstate$.next({ betting: true });
    const betData = {
      action: 'actionBetApi',
      data: {
        betAmount: Number(event),
        numberId: this.fairnessData.numberId,
        currency: this.orignalService.currentCurrencyData.currency,
        stonesCount: this.bombCounts,
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    this.ws.sendMessage(betData);
    // this.ws.sendMessage(JSON.stringify({
    //     "action": "actionSettlementApi",
    // }))
  }

  /**
   * 阻止结算快速点击
   */
  isSettlement: boolean = false;
  /**
   * 结算请求
   *
   * @param event
   */
  async toSubmit(event: Event) {
    if (this.selected == 0 || this.isSettlement) return;
    this.ws.sendMessage({
      action: 'actionSettlementApi',
    });
    this.isSettlement = false;
    if (this.selected != 13) {
      this.rowStairs[12 - this.selected].disabled = true;
    }
    this.betService.minesBetstate$.next({ betting: false });
    this.stairFalg = false;
  }

  /**
   * 炸弹个数变化
   *
   * @param counts
   */
  bombCountsChange(counts: number) {
    this.bombCounts = counts;
    this.getMultiplier();
  }

  /**
   * 自动选择
   */
  autoSelect() {
    if (!this.isBet && this.betService.minesBetstate$.value?.betting && this.stairFalg) {
      console.log(!this.rowStairs[12 - this.selected].disabled);
      if (this.rowStairs[12 - this.selected].disabled) return;
      this.isSettlement = true;
      const randomIndex: any = {
        13: [5, 12],
        12: [5, 13],
        11: [4, 13],
        10: [1, 11],
        9: [0, 11],
        8: [0, 12],
        7: [3, 16],
        6: [3, 17],
        5: [1, 16],
        4: [0, 16],
        3: [1, 18],
        2: [1, 19],
        1: [0, 19],
      };
      this.selected = this.selected + 1;
      const m = randomIndex[this.selected][0];
      const n = randomIndex[this.selected][1];
      const random = Math.ceil(Math.random() * (n - m + 1) + m - 1);
      this.onStair(this.rowStairs[13 - this.selected], 13 - this.selected, random);
    }
  }
  setCurrentBet(data: any) {
    this.stairFalg = true;
    this.betService.minesBetstate$.next({ betting: true, money: data.betAmount });
    const field = data.openField;
    this.selected = data.openField.length;
    this.rowStairs.forEach((e: any, i: number) => {
      e.item.forEach((j: any) => {
        if (field[12 - i] && field[12 - i].includes(j.steps)) {
          j.stone = true;
        }
      });
    });
    this.rate = data.realBetRate;
    this.bombCounts = data.stonesCount;
    this.getMultiplier();
    if (data.openField.length < 13) {
      this.rowStairs[12 - data.openField.length].disabled = false;
    }
    if (this.selected > 0) {
      const steps = this.rowStairs[13 - data.openField.length].item.findIndex((e: any) => e.steps == data.steps);
      const manElement = this.manElement.nativeElement as HTMLElement;
      manElement.style.left = (2.5).add(steps.subtract(5)) + '%';
      manElement.style.bottom = (7.69231).subtract(this.selected) + '%';
      this.runNumber = steps;
    } else {
    }
  }
  /** 手动爬梯限制 */
  stair: boolean = false;
  /**
   * row 每行的数据
   * index，楼层
   * i 方块位置
   * steps 实际方块位置
   *
   * @param row
   * @param index
   * @param i
   */
  async onStair(row: any, index: number, i: number) {
    if (row.disabled || this.stair) return;
    this.iconService.balanceAudioPlay();
    this.stairFalg = false;
    this.stair = true;
    this.isSettlement = true;
    this.selected = 13 - index;
    this.isLeft = this.runNumber > i;
    row.item[i].stair = true;
    const manElement = this.manElement.nativeElement as HTMLElement;
    // 下层人物位置与当前要上去的方块不一样时，才执行人物跑动动画
    if (!this.isFastBet) {
      this.isAnimate = true;
    }
    if (i != this.runNumber) {
      this.type = 1;
    }
    manElement.style.left = (2.5).add(i.subtract(5)) + '%';
    if (!this.isFastBet) {
      await firstValueFrom(timer(i == this.runNumber ? 0 : 450));
    }
    this.rowStairs[index].disabled = true;
    if (!this.isFastBet) {
      this.type = 2;
    }
    manElement.style.bottom = (7.69231).subtract(13 - index) + '%';

    // 后续改成ws获取结果
    if (!this.isFastBet) {
      await firstValueFrom(timer(250));
    }
    this.ws.sendMessage({
      action: 'actionChooseApi',
      data: {
        steps: row.item[i].steps, //台阶坐标，从0开始，不能大于该层的最大台阶数
      },
    });

    // // 模拟炸弹为1
    // row.item.find((e: any) => e.steps == 1).stone = true
    // if (steps == 1) {
    //     this.isAnimate = true
    //     this.type = 3
    // } else {
    //     if (index != 0) {
    //         this.rowStairs[index - 1].disabled = false
    //     }
    //     this.isAnimate = false
    //     this.type = 1
    // }
    this.runNumber = i;
  }

  page(type?: string) {
    const tabgroupElement = this.tabgroupElement?.nativeElement as HTMLElement;
    if (!tabgroupElement) return;
    const item = tabgroupElement.getElementsByClassName('mat-mdc-tab')[0] as HTMLElement;
    const wrap = tabgroupElement.getElementsByClassName('mat-mdc-tab-group')[0] as HTMLElement;
    const wrapWidth = wrap.clientWidth;
    if (!item) return;
    const itemWidth = item.clientWidth;
    // 能完整展示的item个数
    const length = Math.floor(wrapWidth / itemWidth);
    const width = itemWidth * length;

    if (type === 'prev') {
      this.transformX -= width;
    } else if (type === 'next') {
      this.transformX += width;
    } else if (type === 'clear') {
      this.transformX = 0;
    } else {
      // 还需继续改造，获取父宽度 除以单个赔率宽度，来判断移动个数
      this.transformX = Math.floor((this.selected - 1) / length) * width;
    }
    if (this.transformX < 0) {
      this.transformX = 0;
    } else if (this.transformX > (this.multiplier.length - length) * itemWidth) {
      this.transformX = (this.multiplier.length - length) * itemWidth;
    }
    const el: any = document.querySelector('.mat-mdc-tab-list');
    el.style.transform = `translateX(${-this.transformX}px)`;
    el.style.transition = 'all .5s cubic-bezier(0.35, 0, 0.25, 1)';
  }
  // 赢钱弹出框
  showWinTip() {
    this.isShowWinTip = true;
    setTimeout(() => {
      this.isShowWinTip = false;
    }, 3000);
  }
  clear() {
    this.selected = 0;
    this.isBet = false;
    this.rate = 1;
    this.betService.minesBetstate$.next({ betting: false });
    this.isAnimate = false;
    this.type = 1;
    this.runNumber = 0;
    this.isLeft = false;
    const manElement = this.manElement?.nativeElement as HTMLElement;
    if (manElement) {
      manElement.style.left = '-2%';
      manElement.style.bottom = '0%';
    }
    this.isSettlement = false;
    this.rowStairs = JSON.parse(JSON.stringify(this.stairsService.defaultRowStairs));
    this.page('clear');
    this.isShowWinTip = false;
  }
  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    if (this.heartbeat) clearInterval(this.heartbeat);
  }
}
