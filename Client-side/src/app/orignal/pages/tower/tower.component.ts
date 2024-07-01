import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom, timer } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { WsService } from '../../shared/services/ws.service';
@UntilDestroy()
@Component({
  selector: 'app-tower',
  templateUrl: './tower.component.html',
  styleUrls: ['./tower.component.scss'],
})
export class TowerComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private layout: LayoutService,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private ws: WsService,
    private localeService: LocaleService,
    private cacheService: CacheService,
    private currencyValuePipe: CurrencyValuePipe,
    private toast: ToastService
  ) {
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe((v: AccountInforData | null) => {
      if (v) {
        this.uid = v.uid;
      }
    });
    this.appService.currentCurrency$.pipe(distinctUntilChanged(), untilDestroyed(this)).subscribe(x => {
      if (x) {
        this.currentCurrencyData = x;
        this.isDigital = x.isDigital;
      }
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
  @ViewChild('tabgroup') tabgroupElement!: ElementRef;

  isH5!: boolean;
  /** 用户id */
  uid: string = '';
  /** 是否开启快速投注 */
  isFastBet!: boolean;
  /** 是否开启热键 */
  isHotkey!: boolean;
  /** 键盘操作 */
  operate: any;
  /** 是否在自动投注 */
  isLoop: boolean = false;
  /** 是否开启动画 */
  isAnimation!: boolean;
  /** theme主题 */
  theme: string = '';
  /** 用户余额 */
  // balance: string = "0";
  /** 当前选择币种信息 */
  currentCurrencyData?: CurrenciesInterface;

  /** 公平性验证的numberid和pubkey */
  fairnessData: any;

  //投注类型
  betType = 'tower';
  money: string = '0.00000000';

  /** 倍数列表 */
  multiplier: any = [];
  /** 所有倍数列表 */
  allmultiplier: any = [];

  /** 当前倍数Index */
  selected = 9;
  /** 倍数列表位移距离 */
  transformX = 0;

  /** 是否显示投注胜利后的倍数提示框 */
  isShowWinTip = false;
  /** 页面方块列表 */
  coefficients: any = [...new Array(10)].map(cur => {
    cur = {
      rate: 0,
      disabled: true, //--disabled(禁止按钮点击) --active（当前可选择项目） （自动投注时，--active下面一栏为2个状态都没有，可以选择的意思）
      active: false, //--disabled(禁止按钮点击) --active（当前可选择项目） （自动投注时，--active下面一栏为2个状态都没有，可以选择的意思）
      rateActive: false, //--active（当前栏目已被选择后，倍数高亮显示）
      rowlose: false, //tru，说明当前行 输了
      rowwin: false,
      list: [...new Array(5)].map(i => {
        i = {
          type: 1, //1 默认，2普通 3炸单
          winType: '', //--lose（当前按钮选择到炸弹）--win（当前按钮选择赢了）
        };
        return i;
      }),
    };
    return cur;
  });
  /** 炸弹数 */
  bombCounts = 2;
  /** 赔率 */
  rate = 1;
  /** 手动与自动状态 */
  active: boolean = false;
  /** 暂存预选投注*/
  tempBet: Array<number> = [];
  /** 克隆暂存预选投注 停止自动投注后需要回显*/
  cloneTempBet: Array<number> = [];

  /** 自动投注是否投注成功 */
  isLoopbet: boolean = false;
  /** 记录投注的ID，与中奖ID判断自己是否中奖 */
  mainAccountId!: number;
  /** 自动投注输赢判断 */
  winOrlose: boolean = false;
  /** 是否能投注， */
  isBet: boolean = false;
  /** 投注获得利润 */
  winLossAmount: number = 0;
  /** 赢钱弹出框金额 */
  winMoney: string = '';
  /** 未接注单信息 */
  currentBetData: any = {};
  /** 是否有未接注单 */
  isLottery: boolean = false;
  /** 心跳定时器 */
  heartbeat: any = null;
  /** 卡片动画效果 */
  boardAnimation: boolean = false;
  /** 自动投注延迟时间 */
  loopTime: any = null;
  /** 是否为数字货币 */
  isDigital: boolean = false;
  /** 是否是第一次进入房间 */
  isfirst: boolean = true;
  /** 是否正在翻牌，翻牌中，禁止结算*/
  isChoose: boolean = false;
  async ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.ws?.destory();
      this.betService.atuoActive$.next(false);
      this.betService.isChangeActive$.next(false);
      this.isLoop = false;
      this.winloseState = '';
      this.isLoopbet = false;
      this.isBet = false;
      this.isChoose = false;
      this.appService.originalAutoBet$.next(false);
      this.clear();
      if (this.loopTime) clearTimeout(this.loopTime);
      if (this.heartbeat) clearInterval(this.heartbeat);
      if (x) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/tower/open?token=${this.orignalService.token}`);
      }
    });

    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });
    this.isAnimation = this.cacheService.animation;
    // 操作声音初始化
    this.iconService.init('tower');

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
            if (this.isBet) {
              this.operate = { value: 'bet' };
            } else if (!this.isBet && this.selected) {
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
            this.autoSelect();
            this.iconService.balanceAudioPlay();
            break;
          //w-炸弹变少
          case 87:
            if (this.isBet) {
              if (this.bombCounts > 1) {
                this.bombCounts--;
                this.bombCountsChange(this.bombCounts);
              }
            }
            this.iconService.balanceAudioPlay();
            break;
          //e-炸弹变多
          case 69:
            if (this.isBet) {
              if (this.bombCounts < 4) {
                this.bombCounts++;
                this.bombCountsChange(this.bombCounts);
              }
            }
            this.iconService.balanceAudioPlay();
            break;
          default:
            break;
        }
      }
    };

    this.betService.atuoActive$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe((active: boolean) => {
      // if (this.isfirst) return;
      this.active = active;
      // if (active) {
      // }
      this.clear();
    });

    setTimeout(() => {
      this.iconService.towerBGAudioPlay();
    }, 500);
  }

  /**
   * @param data
   * @description 接收消息
   */
  onmessage(data: any) {
    if (data.code != 0) {
      this.toast.show({ message: `${this.localeService.getValue(data.tKey)}!`, type: 'fail' });
      // this.loading = false;
      this.stopAutoLoop();
      this.isBet = false;
      this.isChoose = false;
      this.ws.sendMessage({ action: 'actionPublicKeyApi' });
    }
    if (data.code == 0) {
      switch (data.action) {
        case 'JoinRoom':
          this.isfirst = false;
          this.stopAutoLoop(false);
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
            this.orignalService.chartMessage$.next({ gameId: 'tower', amount: data.data.betAmount, type: 'bet' });
          } else {
            this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          }
          break;
        case 'actionMultiplierApi':
          // 根据炸弹获取对应的赔率
          this.allmultiplier = data.data;
          this.getMultiplier();
          this.ws.sendMessage({ action: 'actionCurrentApi' });
          break;
        case 'actionPublicKeyApi':
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.isBet = true;
          this.isChoose = false;
          this.betService.minesBetstate$.next({ betting: false });
          this.betService.isChangeActive$.next(true);
          if (this.isLoop) {
            // 还原后 延迟1秒继续自动投注
            // if (this.loopTime) clearTimeout(this.loopTime);
            // this.loopTime = setTimeout(() => {
            //   this.list = [...new Array(25)].map((cur, index) => {
            //     cur = { type: this.tempBet.includes(index) ? 4 : 1 };
            //     return cur;
            //   });
            //   this.submitLoop(this.LoopData);
            // }, 1000);
            this.submitLoop(this.LoopData);
          } else {
            if (this.active) {
              this.stopAutoLoop();
            } else {
              this.isLoop = false;
              this.winloseState = '';
              this.isLoopbet = false;
              // 让结束
              // this.tempBet = [];
              // this.betService.tempBet$.next(this.tempBet);
            }
          }

          break;
        case 'actionBetApi':
          // 开始成功
          this.orignalService.chartMessage$.next({ gameId: 'tower', amount: data.data.betAmount, type: 'bet' });
          if (this.tempBet.length > 0) {
            this.ws.sendMessage({
              //tower开奖
              action: 'actionChooseApi',
              data: {
                steps: this.tempBet,
              },
            });
          } else {
            this.coefficients[this.selected].disabled = false;
            this.coefficients[this.selected].active = true;
          }

          break;
        case 'actionChooseApi':
          // 翻牌成功
          this.openItem(data.data);
          break;
        case 'actionSettlementApi':
          // 结算成功
          this.isSettlement = true;
          if (data.data.field) {
            const field = data.data.field.reverse();
            this.coefficients.forEach((e: any, i: number) => {
              e.list.forEach((j: any, index: number) => {
                if (field[i].includes(index)) {
                  j.type = 2;
                } else {
                  j.type = 3;
                }
              });
            });
          }
          if (this.selected >= 0) {
            this.coefficients[this.selected].disabled = true;
          }
          this.iconService.minesSuccessAudioPlay();
          // const multiplier = this.multiplier.find((cur: any) => cur.index === this.selected).multiplier;
          this.winMoney = this.currencyValuePipe.transform(
            Number(this.betService.money$.value).add(data.data.winLossAmount),
            this.currentCurrencyData?.currency ?? ''
          );
          this.showWinTip();
          // this.iconService.towerSuccessAudioPlay();
          this.isLottery = false;
          this.ws.sendMessage({ action: 'actionPublicKeyApi' });
          this.orignalService.chartMessage$.next({ gameId: 'tower', amount: data.data.winLossAmount, type: 'set' });
          break;
        default:
          break;
      }
    }
  }

  /**
   * 获取当前用户未结算注单信息
   *
   * @param data
   */
  async setCurrentBet(data: any) {
    this.betService.minesBetstate$.next({ betting: true, money: data.betAmount });
    this.bombCounts = data?.stonesCount;
    const field = data.openField;
    this.selected = 9 - data.openField.length;
    this.coefficients.forEach((e: any, i: number) => {
      if (field[9 - i] && field[9 - i].length > 0) {
        e.rateActive = true;
        e.list.forEach((j: any, index: number) => {
          if (field[9 - i].includes(index)) {
            j.type = 2;
          } else {
            j.type = 3;
          }
          if (data.flopRecord[9 - i] === index) {
            j.winType = 'win';
          }
        });
      }
    });
    this.isBet = false;
    this.coefficients[this.selected].disabled = false;
    this.coefficients[this.selected].active = true;
    this.rate = data.openField.length == 0 ? 1 : this.multiplier[data.openField.length - 1].multiplier;
  }
  /** 普通投注翻牌编号 */
  itemIndex!: number;
  /**
   * 翻牌请求
   *
   * @param index
   * @param i
   */
  async setItem(index: number, i: number) {
    if (this.isLoop) return;
    if (this.isChoose) return;
    if (!this.active) {
      if (this.coefficients[index].active) {
        this.selected = this.selected - 1;
        this.iconService.balanceAudioPlay();
        this.itemIndex = i;
        this.coefficients[index].active = false;
        this.ws.sendMessage({
          action: 'actionChooseApi',
          data: {
            steps: [i], //台阶坐标，从0开始，不能大于该层的最大台阶数
          },
        });
        // 发送翻牌请求后，禁止结算，等待后端返回后才能结算
        this.isChoose = true;
      }
    } else {
      // 自动投注预选 判断是删除还是增加
      this.selected = this.selected - 1;
      if (this.coefficients[index].active) {
        this.iconService.sliderAudioPlay();
        this.tempBet.push(i);
        this.coefficients[index].disabled = false;
        this.coefficients[index].rateActive = true;
        this.coefficients[index].active = false;
        if (index != 9) {
          this.coefficients[index + 1].disabled = true;
        }
        if (index != 0) {
          this.coefficients[index - 1].disabled = false;
          this.coefficients[index - 1].active = true;
        }
        this.coefficients[index].list[i].winType = 'win';
      } else {
        if (
          !this.coefficients[index].active &&
          !this.coefficients[index].disabled &&
          this.coefficients[index].list[i].winType
        ) {
          this.iconService.sliderAudioPlay();
          this.tempBet = this.tempBet.slice(0, 9 - index);
          this.coefficients[index].active = true;
          this.coefficients[index].list[i].winType = '';
          if (index != 0) {
            this.coefficients[index - 1].disabled = true;
            this.coefficients[index - 1].active = false;
            this.coefficients[index - 1].rateActive = false;
          }
          if (index != 9) {
            this.coefficients[index + 1].disabled = false;
          }
        }
      }
      this.betService.tempBet$.next(this.tempBet);

      console.log(this.tempBet);
    }
  }
  /**
   * 翻牌后，根据返回值判断
   *
   * @param data
   */
  async openItem(data: any) {
    const isDiamonds = data.active;
    const row = this.coefficients[this.selected + 1];
    if (!this.active) {
      this.coefficients[this.selected + 1].disabled = true;
      if (isDiamonds) {
        this.isChoose = false;
        this.coefficients[this.selected + 1].rateActive = true;
        this.rate = this.multiplier[9 - (this.selected + 1)].multiplier;
        row.list.forEach((e: any, i: number) => {
          if (i == this.itemIndex) {
            e.winType = 'win';
          }
          if (data.currentStonsIndex.includes(i)) {
            e.type = 2;
          } else {
            e.type = 3;
          }
        });
        if (this.selected + 1 == 0) {
          this.ws.sendMessage({
            action: 'actionSettlementApi',
          });
        } else {
          this.iconService.diamondAudioPlay();
          this.coefficients[this.selected].disabled = false;
          this.coefficients[this.selected].active = true;
        }
      } else {
        this.iconService.towerLoseAudioPlay();
        const field = data.field.reverse();
        this.coefficients.forEach((e: any, i: number) => {
          e.list.forEach((j: any, index: number) => {
            if (field[i].includes(index)) {
              j.type = 2;
            } else {
              j.type = 3;
            }
            // if (data.flopRecord[9 - i] === index) {
            //   j.winType = 'win';
            // }
          });
        });
        this.rate = 1;
        this.coefficients[this.selected + 1].rowlose = true;
        row.list[this.itemIndex].winType = 'lose';
        this.betService.minesBetstate$.next({ betting: false });
        this.ws.sendMessage({ action: 'actionPublicKeyApi' });
        this.orignalService.chartMessage$.next({ gameId: 'tower', amount: -data.betAmount, type: 'set' });
      }
    } else {
      this.init();
      // if (isDiamonds) {
      // } else {
      const field = data.field.reverse();
      let flag = false;
      for (let i = this.coefficients.length - 1; i >= 0; i--) {
        // str=str+''+arr[i];
        const e = this.coefficients[i];

        if (typeof data.steps[9 - i] !== 'undefined' && !flag) {
          if (i != 0 && !this.isFastBet && !flag) {
            await firstValueFrom(timer(300));
          }
          if (field[i].includes(data.steps[9 - i])) {
            e.rateActive = true;
            e.list[data.steps[9 - i]].winType = 'win';
          } else {
            e.rowlose = true;
            e.list[data.steps[9 - i]].winType = 'lose';
            flag = true;
          }
        }
        e.list.forEach((j: any, index: number) => {
          if (field[i].includes(index)) {
            j.type = 2;
          } else {
            j.type = 3;
          }
        });
      }
      if (isDiamonds) {
        this.coefficients[10 - this.tempBet.length].rowwin = true;
        this.iconService.minesSuccessAudioPlay();
        this.winMoney = this.currencyValuePipe.transform(
          Number(this.betService.money$.value).add(data.winLossAmount),
          this.currentCurrencyData?.currency ?? ''
        );
        this.rate = data.realBetRate;
        this.showWinTip();
      } else {
        this.rate = 1;
        this.iconService.towerLoseAudioPlay();
      }
      //
      this.betService.minesBetstate$.next({ betting: false });
      await firstValueFrom(timer(1000));
      this.winOrLossProcess(isDiamonds);
      this.ws.sendMessage({ action: 'actionPublicKeyApi' });
      // }
    }
  }
  /**
   * 根据炸弹数获取赔率
   */
  async setMultiplier() {
    this.ws.sendMessage({
      action: 'actionMultiplierApi',
    });
  }

  /**
   * 投注
   *
   * @param event
   */
  async toBet(event: any) {
    if (!this.isBet) return;
    this.isBet = false;
    this.clear();

    this.betService.minesBetstate$.next({ betting: true });
    this.iconService.selectAudioPlay();
    const betData = {
      action: 'actionBetApi',
      data: {
        betAmount: Number(event),
        numberId: this.fairnessData?.numberId,
        currency: this.orignalService.currentCurrencyData.currency,
        target: this.bombCounts,
        isAuto: false,
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    this.ws.sendMessage(betData);
  }

  // 赢钱弹出框
  showWinTip() {
    this.isShowWinTip = true;
    setTimeout(() => {
      this.isShowWinTip = false;
    }, 1000);
  }

  isSettlement: boolean = false;
  /**
   * 结算请求
   *
   * @param event
   */
  async toSubmit(event: any) {
    if (this.selected == 9 || this.isSettlement) return;
    if (this.isChoose) return;
    this.iconService.selectAudioPlay();
    this.isSettlement = false;
    this.ws.sendMessage({
      action: 'actionSettlementApi',
    });
    this.betService.minesBetstate$.next({ betting: false });
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
   * 清除预选
   */
  autoClear() {
    if (this.isLoop) return;
    if (this.active && !this.isBet) return;
    if (this.tempBet.length > 0 && !this.isLoop) {
      this.iconService.selectAudioPlay();
      this.clear();
    }
  }
  /**
   * 自动选择
   */
  autoSelect() {
    if (this.isLoop) return;
    if (this.active && !this.isBet) return;
    if (this.selected >= 0) {
      this.setItem(this.selected, Math.floor(Math.random() * 5));
    }
  }

  /**
   * 自动投注
   *
   * @param loopInfo
   */
  LoopData: any = {};
  /** 记录上一把输赢*/
  winloseState: any = '';
  /** 投注获得利润 */
  lotteryBetReturnAmount: number = 0;
  // 是否达到条件
  async submitLoop(loopInfo: any) {
    if (!this.isBet) return;
    if (this.tempBet.length == 0 && this.isLoop) return;
    if (!this.fairnessData.numberPublicKey || !this.fairnessData.numberId) return;
    this.isBet = false;
    this.init();
    const LoopData = loopInfo;
    /** 初始投注金额记住 ，此值保持不变*/
    const money = LoopData.money;
    /** 投注使用的金额 ，赢损增加满足后使用*/
    const oldmoney = LoopData.oldmoney ?? LoopData.money;
    if (LoopData.betNmb === 0) {
      this.isLoop = false;
      LoopData.betNmb = '';
      this.cacheService.loopInfos = { ...this.cacheService.loopInfos, betNmb: this.LoopData.betNmb };
      return;
    }
    this.LoopData = loopInfo;
    this.betService.isChangeActive$.next(false);
    // this.betService.minesBetstate$.next({ betting: true });
    this.appService.originalAutoBet$.next(true);
    const betData = {
      action: 'actionBetApi',
      data: {
        isAuto: true,
        betAmount: Number(oldmoney) || Number(money),
        numberId: this.fairnessData.numberId,
        currency: this.orignalService.currentCurrencyData.currency,
        target: this.bombCounts,
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    this.ws.sendMessage(betData);
  }

  /**
   * 连续投注输赢处理
   *
   * @param isDiamonds
   */
  winOrLossProcess(isDiamonds: boolean) {
    /** 初始投注金额记住 ，此值保持不变*/
    const money = this.LoopData.money;
    /** 投注使用的金额 ，赢损增加满足后使用*/
    let oldmoney = this.LoopData.oldmoney ?? this.LoopData.money;

    // 投注数量减1
    if (this.LoopData.betNmb != '') {
      this.LoopData.betNmb = this.LoopData.betNmb - 1;
    }
    if (this.LoopData.betNmb === 0) {
      this.stopAutoLoop();
      this.isLoopbet = false;
      this.LoopData.betNmb = '';
    }
    this.cacheService.loopInfos = { ...this.cacheService.loopInfos, betNmb: this.LoopData.betNmb };
    if (isDiamonds) {
      // 一轮总输赢统计
      this.betService.winLoseAmount = Number(
        this.betService.winLoseAmount.add(this.rate.subtract(Number(oldmoney)).minus(Number(oldmoney))).toDecimal(8)
      );
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
          this.winloseState = isDiamonds ? 1 : 2;
        } else {
          //赢了增加没填写的情况 金额变成初始投注值
          oldmoney = money;
        }
      } else {
        if (this.LoopData.winPercent && this.LoopData.winPercent != '') {
          oldmoney = Number(oldmoney).add(Number(this.LoopData.winPercent).divide(100).subtract(Number(oldmoney)));
          this.winloseState = isDiamonds ? 1 : 2;
        }
      }
    } else {
      // 检查是增加还是重置
      this.betService.winLoseAmount = Number(this.betService.winLoseAmount.minus(Number(oldmoney)).toDecimal(8));
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
          this.winloseState = isDiamonds ? 1 : 2;
        } else {
          // 输了增加没填写的情况 金额变成初始投注值
          oldmoney = money;
        }
      } else {
        if (this.LoopData.losePercent && this.LoopData.losePercent != '') {
          oldmoney = Number(oldmoney).add(Number(this.LoopData.losePercent).divide(100).subtract(Number(oldmoney)));
          this.winloseState = isDiamonds ? 1 : 2;
        }
      }
      // 一轮总输赢统计
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
   *
   * @param loop
   * @parem loop 是否是自动投注需要的，自动投注需要延时1秒，
   */
  stopAutoLoop(loop: boolean = true) {
    console.log(11111);
    if (this.isfirst) return;
    this.isLoop = false;
    this.winloseState = '';
    this.isLoopbet = false;
    this.isBet = true;
    this.appService.originalAutoBet$.next(false);
    // 让结束
    // setTimeout(
    //   () => {
    this.init();
    this.selected = 9 - this.tempBet.length;
    this.rate = 1;
    this.betService.tempBet$.next(this.tempBet);
    if (this.tempBet.length > 0) {
      this.tempBet.forEach((e: any, index: number) => {
        const co = 9 - index;
        this.coefficients[co].disabled = false;
        this.coefficients[co].rateActive = true;
        this.coefficients[co].active = false;
        if (co != 9) {
          this.coefficients[co + 1].disabled = true;
        }
        if (co != 0) {
          this.coefficients[co - 1].disabled = false;
          this.coefficients[co - 1].active = true;
        }
        this.coefficients[co].list[e].winType = 'win';
      });
    } else {
      this.coefficients[this.selected].disabled = !this.active;
      this.coefficients[this.selected].active = this.active;
    }

    //   },
    //   loop ? 1000 : 0
    // );
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
  /**
   * 清除状态
   */
  clear() {
    console.log(22222222222);
    this.init();
    this.selected = 9;
    this.coefficients[this.selected].disabled = !this.active;
    this.coefficients[this.selected].active = this.active;
    this.rate = 1;
    this.tempBet = [];
    this.isShowWinTip = false;
    this.isSettlement = false;
    this.betService.minesBetstate$.next({ betting: false });
    this.betService.tempBet$.next(this.tempBet);
  }
  /**
   * 列表重置
   */
  init() {
    this.coefficients = [...new Array(10)].map((cur, i) => {
      cur = {
        rate: this.multiplier.length > 0 ? this.multiplier[9 - i].multiplier : 0,
        disabled: true, //--disabled(禁止按钮点击) --active（当前可选择项目） （自动投注时，--active下面一栏为2个状态都没有，可以选择的意思）
        active: false, //--disabled(禁止按钮点击) --active（当前可选择项目） （自动投注时，--active下面一栏为2个状态都没有，可以选择的意思）
        rateActive: false, //--active（当前栏目已被选择后，倍数高亮显示）
        rowlose: false,
        rowwin: false,
        list: [...new Array(5)].map(i => {
          i = {
            type: 1, //1 默认，2炸弹 3普通
            winType: '', //--lose（当前按钮选择到炸弹）--win（当前按钮选择赢了）
          };
          return i;
        }),
      };
      return cur;
    });
  }
  /**
   * 获取倍数数据
   */
  getMultiplier() {
    const data = this.allmultiplier.filter((e: any) => Number(e.type) == this.bombCounts);
    this.multiplier = data.sort((a: any, b: any) => {
      return a.index - b.index;
    });
    this.coefficients.forEach((e: any, i: number) => {
      e.rate = this.multiplier[9 - i].multiplier;
    });
  }
  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    this.iconService.towerBGAudioStop();
    if (this.loopTime) clearTimeout(this.loopTime);
    if (this.heartbeat) clearInterval(this.heartbeat);
  }
}
