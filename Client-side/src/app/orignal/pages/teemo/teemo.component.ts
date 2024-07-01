import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { environment } from 'src/environments/environment';
import { OrignalService } from '../../orignal.service';
import { CurrencyValuePipe } from '../../shared/pipes/currency-value.pipe';
import { BetService } from '../../shared/services/bet.service';
import { CacheService } from '../../shared/services/cache.service';
import { IconService } from '../../shared/services/icon.service';
import { LocaleService } from '../../shared/services/locale.service';
import { LZStringService } from '../../shared/services/lz-string.service';
import { WsService } from '../../shared/services/ws.service';
@UntilDestroy()
@Component({
  selector: 'app-teemo',
  templateUrl: './teemo.component.html',
  styleUrls: ['./teemo.component.scss'],
})
export class TeemoComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private layout: LayoutService,
    private orignalService: OrignalService,
    private appService: AppService,
    private betService: BetService,
    private iconService: IconService,
    private ws: WsService,
    private encryptService: EncryptService,
    private lZStringService: LZStringService,
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

  /** theme主题 */
  theme: string = '';
  /** 用户余额 */
  // balance: string = "0";
  /** 当前选择币种信息 */
  currentCurrencyData?: CurrenciesInterface;

  /** 公平性验证的numberid和pubkey */
  fairnessData: any;

  //投注类型
  money: string = '0.00000000';

  /** 倍数列表 */
  multiplier: any = [];
  /** 当前倍数Index */
  selected = 0;
  /** 倍数列表位移距离 */
  transformX = 0;

  /** 是否显示投注胜利后的倍数提示框 */
  isShowWinTip = false;
  /** 是否显示投注胜利后的倍数提示框内倍数 */
  winMultiple: any = {};
  /** 是否点击了投注按钮 */
  isBetting = false;
  list: any = [...new Array(25)].map(cur => {
    cur = { type: 1 };
    return cur;
  });
  /** 炸弹数 */
  bombCounts = 4;
  /** 钻石数 */
  diamondCounts = 21;
  /** 赔率 */
  rate = 1;
  /** 手动与自动状态 */
  active: boolean = false;
  /** 暂存预选投注*/
  tempBet: Array<number> = [];

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
  async ngOnInit() {
    // this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
    //   if (x) {
    //     this.getNextNumberId();
    //     await this.setMultiplier();

    //     await this.setCurrentBet()
    //   }
    // })

    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.ws?.destory();
      this.betService.atuoActive$.next(false);
      this.betService.isChangeActive$.next(false);
      this.isLoop = false;
      this.winloseState = '';
      this.isLoopbet = false;
      this.isBetting = false;
      this.isBet = false;
      this.selected = 0;
      this.rate = 1;
      this.tempBet = [];
      this.betService.tempBet$.next(this.tempBet);
      this.betService.minesBetstate$.next({ betting: false });
      this.isLottery = false;
      this.isShowWinTip = false;
      this.appService.originalAutoBet$.next(false);
      if (this.loopTime) clearTimeout(this.loopTime);
      if (this.heartbeat) clearInterval(this.heartbeat);
      if (x) {
        if (!this.orignalService.token) return;
        this.ws.init(`${environment.orignal.orignalNewWsUrl}/ws/teemo/open?token=${this.orignalService.token}`);
      }
    });

    // this.appService.currentCurrency$.pipe(map(v => v?.currency), distinctUntilChanged()).subscribe(v => {
    //   console.log("选择当前币种", v)
    //   this.stopAutoLoop()
    // });

    this.orignalService.crashMessage$.pipe(untilDestroyed(this)).subscribe(data => {
      if (data) {
        this.onmessage(data);
      }
    });

    // 操作声音初始化
    this.iconService.init('mines');

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
            if (!this.isBetting) {
              this.operate = { value: 'bet' };
            } else if (this.isBetting && this.selected) {
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
            if (this.isBetting) {
              this.autoSelect();
            }
            this.iconService.balanceAudioPlay();
            break;
          //w-炸弹变少
          case 87:
            if (!this.isBetting) {
              if (this.bombCounts > 1) this.bombCounts--;
            }
            this.iconService.balanceAudioPlay();
            break;
          //e-炸弹变多
          case 69:
            if (!this.isBetting) {
              if (this.bombCounts < 24) this.bombCounts++;
            }
            this.iconService.balanceAudioPlay();
            break;
          default:
            break;
        }
      }
    };

    this.betService.atuoActive$.pipe(untilDestroyed(this), distinctUntilChanged()).subscribe((active: boolean) => {
      if (this.isfirst) return;
      this.active = active;
      // if (active) {
      this.isBetting = active;
      // }
      this.list = [...new Array(25)].map(cur => {
        cur = { type: 1 };
        return cur;
      });
      this.selected = 0;
      this.rate = 1;
      this.diamondCounts = 25 - this.bombCounts;
      setTimeout(() => {
        this.page('clear');
      });
      this.tempBet = [];
      this.betService.tempBet$.next(this.tempBet);
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
      this.betService.minesBetstate$.next({ betting: false });
      this.ws.sendMessage({ action: 'actionGameCodePublicKeyApi', data: { userId: this.uid } });
    }
    if (data.code == 0) {
      switch (data.action) {
        case 'JoinRoom':
          this.stopAutoLoop(false);
          this.isfirst = false;
          // 初次进入 查询miens是否有未结算的注单
          this.ws.sendMessage({ action: 'actionMinesCurrentApi', data: { userId: this.uid } });
          // 开启定时发送心跳
          clearInterval(this.heartbeat);
          this.heartbeat = setInterval(() => {
            this.ws.sendMessage({ action: 'type' });
          }, 15000);
          break;
        case 'actionMinesCurrentApi':
          // 初次进入 查询miens是否有未结算的注单
          if (data.data) {
            // this.setCurrentBet(data.data)
            this.orignalService.chartMessage$.next({ gameId: 'teemo', amount: data.data.lotteryAmount, type: 'bet' });
            this.isLottery = data.data ? true : false;
            if (this.isLottery) {
              this.currentBetData = data.data;
            }
            this.bombCounts = data.data.minesCount;
            this.betService.isChangeActive$.next(false);
          } else {
            this.betService.isChangeActive$.next(true);
          }
          this.setMultiplier();
          break;
        case 'actionGameCodePublicKeyApi':
          this.fairnessData = {
            numberPublicKey: data.data.numberPublicKey,
            numberId: data.data.numberId,
          };
          this.isBet = true;
          this.betService.minesBetstate$.next({ betting: false });
          this.betService.isChangeActive$.next(true);
          if (this.LoopData.isLoop) {
            // 还原后 延迟1秒继续自动投注
            if (this.loopTime) clearTimeout(this.loopTime);
            this.loopTime = setTimeout(() => {
              this.list = [...new Array(25)].map((cur, index) => {
                cur = { type: this.tempBet.includes(index) ? 4 : 1 };
                return cur;
              });
              this.submitLoop(this.LoopData);
            }, 1000);
          } else {
            if (this.active) {
              this.stopAutoLoop();
            } else {
              this.isLoop = false;
              this.winloseState = '';
              this.isLoopbet = false;
              // 让结束
              this.tempBet = [];
              this.betService.tempBet$.next(this.tempBet);
            }
          }

          break;
        case 'actionMinesMultiplierApi':
          this.multiplier = data.data;
          if (this.isLottery) {
            this.setCurrentBet(this.currentBetData);
          } else {
            this.ws.sendMessage({ action: 'actionGameCodePublicKeyApi', data: { userId: this.uid } });
          }

          break;
        case 'actionMinesBetApi':
          // 开始成功
          this.isBetting = true;
          // this.betService.minesBetstate$.next({ betting: true });
          // this.orignalService.refreshUserBanlance$.next(true);
          this.orignalService.chartMessage$.next({ gameId: 'teemo', amount: data.data.betAmount, type: 'bet' });
          if (this.tempBet.length > 0) {
            this.ws.sendMessage({
              //mines开奖
              action: 'actionMinesLotteryApi',
              data: {
                index: this.tempBet,
                userId: this.uid,
              },
            });
          }

          // 投注结果
          // setTimeout(async () => {
          //   this.winLossAmount = data.data.winLossAmount;
          //   // this.orignalService.refreshUserBanlance$.next(true);
          //   this.list.unshift({
          //     lotteryBetDetail: data.data.lotteryBetDetail,
          //     lotteryBetReturnAmount: data.data.winLossAmount
          //   });
          //   // 播放输钱音效
          //   if (data.data.winLossAmount <= 0) {
          //     this.iconService.loseAudioPlay();
          //   } else {
          //     // 播放赢钱音效
          //     this.iconService.winAudioPlay();
          //   }

          //   //
          //   if (this.isLoop) {
          //     this.isLoopbet = true
          //     this.winOrLossProcess(data)

          //     // 投注数量减1
          //     if (this.LoopData.betNmb != '') {
          //       this.LoopData.betNmb = this.LoopData.betNmb - 1
          //     }
          //     if (this.LoopData.betNmb === 0) {
          //       this.stopAutoLoop()
          //       this.LoopData.betNmb = ''
          //     }
          //   } else {
          //     this.stopAutoLoop()
          //   }

          // }, this.isFastBet ? 0 : 1000);

          break;
        case 'actionMinesLotteryApi':
          // 翻牌成功
          this.openItem(data.data);
          break;
        case 'actionMinesSettlementApi':
          // 结算成功
          this.list = this.list.map((cur: any, index: number) => {
            cur.type = data.data.result.includes(index) ? 3 : 2;
            return cur;
          });
          const multiplier = this.multiplier.find((cur: any) => cur.index === this.selected).multiplier;
          this.winMoney = this.currencyValuePipe.transform(
            Number(this.betService.money$.value).add(data.data.winLossAmount),
            this.currentCurrencyData?.currency ?? ''
          );
          this.orignalService.chartMessage$.next({ gameId: 'teemo', amount: data.data.winLossAmount, type: 'set' });
          this.showWinTip({ multiplier });
          this.iconService.minesSuccessAudioPlay();
          this.isBetting = this.active;
          this.isLottery = false;
          this.ws.sendMessage({ action: 'actionGameCodePublicKeyApi', data: { userId: this.uid } });
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
    this.isBetting = true;
    this.betService.minesBetstate$.next({ betting: true, money: data.lotteryAmount });
    this.bombCounts = data?.minesCount;
    if (!data.isLottery) {
      this.list = this.list.map((cur: any, index: number) => {
        if (data.result.includes(index)) {
          cur.type = 2;
          cur.isOpen = true;
        }
        return cur;
      });
      this.selected = this.multiplier.find((t: any) => t.multiplier === (data.realBetRate || data.lotteryOdds)).index;
      this.rate = data.realBetRate || data.lotteryOdds;
      this.diamondCounts = 25 - this.bombCounts - this.selected;
      setTimeout(() => {
        this.page();
      });
    } else {
      this.rate = 1;
    }
  }

  /**
   * 根据炸弹数获取赔率
   */
  async setMultiplier() {
    // let response = await this.minesApi.getMultiplier(this.bombCounts, 25 - this.bombCounts);
    // this.multiplier = response.data;
    this.ws.sendMessage({
      action: 'actionMinesMultiplierApi',
      data: {
        bomb: this.bombCounts,
        diamond: 25 - this.bombCounts,
        userId: this.uid,
      },
    });
  }

  /** 获取numberId用于投注、numberPublicKey用于公平性页面展示 */
  async getNextNumberId() {
    // let res = await this.minesApi.getNumberId();
    // this.fairnessData = res.data;
    this.ws.sendMessage({
      action: 'actionGameCodePublicKeyApi',
      data: { userId: this.uid },
    });
  }

  /**
   * 投注
   *
   * @param event
   */
  async toBet(event: any) {
    if (this.isBetting || !this.isBet) return;
    this.isBet = false;
    this.list = [...new Array(25)].map(cur => {
      cur = { type: 1 };
      return cur;
    });
    this.selected = 0;
    this.rate = 1;
    this.page('clear');
    this.diamondCounts = 25 - this.bombCounts;
    // let data = await this.minesApi.toBet({
    //   betAmount: Number(event),
    //   numberId: this.fairnessData.numberId,
    //   numberPublicKey: this.fairnessData.numberPublicKey,
    //   currency: this.orignalService.currentCurrencyData.currency,
    //   minesCount: this.bombCounts,
    // })
    // if (data.code === 0) {
    //   this.isBetting = true;
    //   this.betService.minesBetstate$.next({ betting: true });
    //   this.orignalService.refreshUserBanlance$.next(true),
    //     this.iconService.selectAudioPlay();
    //   // 获取下次投注numberId
    //   await this.getNextNumberId()
    // }
    this.betService.minesBetstate$.next({ betting: true });
    this.iconService.selectAudioPlay();
    const betData = {
      action: 'actionMinesBetApi',
      data: {
        userId: this.uid,
        betAmount: Number(event),
        numberId: this.fairnessData.numberId,
        currency: this.orignalService.currentCurrencyData.currency,
        minesCount: this.bombCounts,
        isAuto: false,
      },
      numberPublicKey: this.fairnessData.numberPublicKey,
    };
    this.ws.sendMessage(betData);
  }

  /**
   * 返回type=rate:赔率、type=success:获胜的机会
   *
   * @param type
   */
  returnRate(type: string) {
    return 0;
  }

  /**
   * 倍数翻页动画
   *
   * @param type
   */
  page(type?: string) {
    const marginWidth = this.isH5 ? 5 : 10;

    const tabgroupElement = this.tabgroupElement.nativeElement as HTMLElement;
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
  showWinTip(data: any) {
    this.winMultiple = data;
    this.isShowWinTip = true;
    setTimeout(() => {
      this.isShowWinTip = false;
    }, 1000);
  }

  /** 普通投注翻牌编号 */
  itemIndex!: number;
  /**
   * 翻牌请求
   *
   * @param i
   */
  async setItem(i: number) {
    if (!this.active) {
      if (!this.isBetting) return;
      this.iconService.balanceAudioPlay();
      if (this.list[i].type === 1) {
        // let res: any = await this.minesApi.toOpen([i]);
        this.itemIndex = i;
        this.ws.sendMessage({
          //mines开奖
          action: 'actionMinesLotteryApi',
          data: {
            index: [i],
            userId: this.uid,
          },
        });
        this.list[i].boardAnimation = true;
        this.isBetting = false;
      }
    } else {
      // 自动，预选
      if (this.tempBet.length >= 25 - this.bombCounts) return;
      this.iconService.sliderAudioPlay();
      if (this.list[i].type === 1) {
        this.list[i].type = 4;
        this.tempBet.push(i);
      } else {
        this.list[i].type = 1;
        this.tempBet = this.tempBet.filter(item => {
          return item !== i;
        });
      }
      this.selected = this.tempBet.length;
      this.betService.tempBet$.next(this.tempBet);
      this.page();
    }
  }
  /**
   * 翻牌后，根据返回值判断
   *
   * @param data
   */
  openItem(data: any) {
    const isDiamonds = data.active;
    if (!this.active) {
      this.list[this.itemIndex].boardAnimation = false;
      if (isDiamonds) {
        // 开出钻石
        this.isBetting = true;
        this.list[this.itemIndex].type = 2;
        this.list[this.itemIndex].isOpen = true;
        this.iconService.diamondAudioPlay();
        this.rate = data.realBetRate;
        this.diamondCounts = this.diamondCounts - 1;
      } else {
        // 开出炸弹
        this.list[this.itemIndex].type = 3;
        this.list[this.itemIndex].isOpen = true;
        this.list = this.list.map((cur: any, index: number) => {
          cur.type = data.result.includes(index) ? 3 : 2;
          return cur;
        });
        this.isBetting = false;
        this.isLottery = false;
        this.iconService.bombAudioPlay();
        this.betService.minesBetstate$.next({ betting: false });
        this.orignalService.chartMessage$.next({ gameId: 'teemo', amount: -data.betAmount, type: 'set' });
        this.ws.sendMessage({ action: 'actionGameCodePublicKeyApi', data: { userId: this.uid } });
      }
      this.list = [...this.list];
      // 设置赔率选择框
      const length = this.list.filter((cur: any) => cur.type == 2 && cur.isOpen).length;
      this.selected = length;
      this.page();
    } else {
      if (isDiamonds) {
        // 开出钻石
        this.rate = data.realBetRate;
        this.tempBet.forEach(e => {
          this.list[e].type = 2;
          this.list[e].isOpen = true;
        });
        this.winOrLossProcess(true);
        this.ws.sendMessage({
          action: 'actionMinesSettlementApi',
          data: { userId: this.uid },
        });
        console.log('自动投注赢');
      } else {
        // 开出炸弹
        this.tempBet.forEach(e => {
          this.list[e].type = 3;
          this.list[e].isOpen = true;
        });
        this.list = this.list.map((cur: any, j: number) => {
          cur.type = data.result.includes(j) ? 3 : 2;
          return cur;
        });
        this.isBetting = true;
        this.iconService.bombAudioPlay();
        this.betService.minesBetstate$.next({ betting: false });

        this.iconService.loseAudioPlay();
        // 自动投注参数判断
        console.log('自动投注输');
        this.winOrLossProcess(false);
        this.ws.sendMessage({ action: 'actionGameCodePublicKeyApi', data: { userId: this.uid } });
      }

      // }

      // 播放输钱音效
      // if (data.data.lotteryBetReturnAmount <= 0) {
      //   this.iconService.loseAudioPlay();
      // } else {
      //   // 播放赢钱音效
      //   this.iconService.winAudioPlay();
      // }
      // // 投注数量减1
      // if (LoopData.betNmb != '') {
      //   LoopData.betNmb = LoopData.betNmb - 1
      // }
    }
    this.list = [...this.list];
  }
  /**
   * 结算请求
   *
   * @param event
   */
  async toSubmit(event: any) {
    if (!this.list.find((e: any) => e.type != 1)) return;
    this.iconService.selectAudioPlay();
    this.isBetting = false;
    this.isLottery = false;
    this.ws.sendMessage({
      action: 'actionMinesSettlementApi',
      data: { userId: this.uid },
    });
  }

  /**
   * 炸弹个数变化
   *
   * @param counts
   */
  bombCountsChange(counts: number) {
    this.bombCounts = counts;
    this.diamondCounts = 25 - counts;
    this.setMultiplier();
  }
  /**
   * 自动选择
   */
  autoSelect() {
    if (!this.isBetting) return;
    const list: any = [];
    this.list.forEach((cur: any, index: number) => {
      if (cur.type == 1) {
        list.push(index);
      }
    });
    this.setItem(list[Math.floor(Math.random() * list.length)]);
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
    if (this.tempBet.length == 0) return;
    if (!this.fairnessData.numberPublicKey || !this.fairnessData.numberId) return;
    const LoopData = loopInfo;
    /** 初始投注金额记住 ，此值保持不变*/
    const money = LoopData.money;
    /** 投注使用的金额 ，赢损增加满足后使用*/
    const oldmoney = LoopData.oldmoney ?? LoopData.money;
    this.isBetting = false;
    if (LoopData.betNmb === 0) {
      this.isLoop = false;
      this.isBetting = true;
      LoopData.betNmb = '';
      this.cacheService.loopInfos = { ...this.cacheService.loopInfos, betNmb: this.LoopData.betNmb };
      return;
    }
    this.LoopData = loopInfo;
    this.appService.originalAutoBet$.next(true);
    const betData = {
      action: 'actionMinesBetApi',
      data: {
        isAuto: true,
        betAmount: Number(oldmoney) || Number(money),
        numberId: this.fairnessData.numberId,
        currency: this.orignalService.currentCurrencyData.currency,
        minesCount: this.bombCounts,
        userId: this.uid,
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

  // async updateAll() {
  //   Promise.all([
  //     this.orignalService.refreshUserBanlance$.next(true),
  //     this.getNextNumberId()
  //   ])
  //   setTimeout(() => {
  //     this.list = [...new Array(25)].map((cur, index) => {
  //       cur = { type: this.tempBet.includes(index) ? 4 : 1 };
  //       return cur;
  //     });
  //   }, 2000)
  // }

  /**
   * 停止自动投注，状态初始化
   *
   * @param loop
   * @parem loop 是否是自动投注需要的，自动投注需要延时1秒，
   */
  stopAutoLoop(loop: boolean = true) {
    if (this.isfirst) return;
    console.log(1);
    this.isLoop = false;
    this.winloseState = '';
    this.isLoopbet = false;
    this.isBetting = this.active;
    this.isBet = true;
    this.appService.originalAutoBet$.next(false);
    this.diamondCounts = 25 - this.bombCounts;
    // 让结束
    setTimeout(
      () => {
        this.list = [...new Array(25)].map(cur => {
          cur = { type: 1 };
          return cur;
        });
        this.selected = 0;
        this.rate = 1;
        this.tempBet = [];
        this.betService.tempBet$.next(this.tempBet);
      },
      loop ? 1000 : 0
    );
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

  ngOnDestroy(): void {
    this.ws?.destory();
    document.body.onkeydown = null;
    document.onkeyup = null;
    if (this.loopTime) clearTimeout(this.loopTime);
    if (this.heartbeat) clearInterval(this.heartbeat);
  }
}
