import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { OrignalService } from 'src/app/orignal/orignal.service';
import { ChipDataService } from 'src/app/orignal/pages/baccarat/chips.service';

import { ImgCarouselComponent } from 'src/app/shared/components/img-carousel/img-carousel.component';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CurrencyBalance } from 'src/app/shared/interfaces/wallet.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { DiceApi } from '../../apis/dice.api';
import { PlinkoApi } from '../../apis/plinko.api';
import { CurrencyValuePipe } from '../../pipes/currency-value.pipe';
import { BetService } from '../../services/bet.service';
import { CacheService } from '../../services/cache.service';
import { IconService } from '../../services/icon.service';
import { LocaleService } from '../../services/locale.service';
import { dialogTopUpComponent } from '../dialog-top-up/dialog-top-up.component';
import { AutoComponent } from './auto/auto.component';
@UntilDestroy()
@Component({
  selector: 'orignal-bet',
  templateUrl: './bet.component.html',
  styleUrls: ['./bet.component.scss'],
})
export class BetComponent implements OnInit, OnDestroy {
  /** 是否显示实时投注记录 */
  @Input() isRealHistory?: boolean = false;

  /** 是否是dice游戏，判断是否显示中间crash组件特有的按钮 */
  @Input() isDice!: boolean;
  /** 赔率-计算可赢金额 */
  @Input() rate!: number;
  @Output() rateChange = new EventEmitter();
  /** Coinflip下一个赔率-计算可赢金额 */
  @Input() nextMultiplier!: number;
  /** 赔率-计算可赢金额 */
  @Input() type!: string;

  /** 炸弹个数 */
  @Input() bombCounts: any = '';
  /** 炸弹个数变化 */
  @Output() bombCountsChange = new EventEmitter();
  /** mines自动选择 */
  @Output() autoSelect = new EventEmitter();
  /** tower清除自动投注内容*/
  @Output() autoClear = new EventEmitter();
  /** 按当前选择投注 */
  @Output() toSubmit = new EventEmitter();

  /** 风险等级 */
  @Output() riskSelect = new EventEmitter();
  /** 排数 */
  @Output() rowSelect = new EventEmitter();

  /** 投注 */
  @Output() toBet = new EventEmitter();
  /** 投注提交 */
  @Output() commitLoop: EventEmitter<any> = new EventEmitter();

  /** 停止自动投注 */
  @Output('stopLoop') stopLoopEvent: EventEmitter<any> = new EventEmitter();
  /** 开始自动投注，默认关闭 */
  @Input() isLoop: boolean = false;
  @Output() isLoopChange = new EventEmitter();
  /** 金额输入框 */
  @ViewChild('moneyInput') moneyInputElement!: ElementRef;

  /** 热键功能 */
  @Input() set operate(value: any) {
    switch (value?.value) {
      case 'bet':
        this.submit();
        break;
      case 'submit':
        if (this.money == '0.00000000' || this.money == '0.00') return;
        this.betService.money$.next(this.money);
        this.betService.winLoseAmount = 0;
        if (this.active == 0) {
          this.toSubmit.emit(this.money);
        }
        break;
      case 'min':
        this.handleMoney(0);
        break;
      case 'half':
        this.handleMoney(2);
        break;
      case 'double':
        this.handleMoney(3);
        break;
      case 'rateAdd':
        this.onAdd();
        break;
      case 'rateReduce':
        this.onReduce();
        break;
      default:
        break;
    }
  }
  /** hilo start*/
  /** 购买大小 */
  @Output() buyChangeEvent = new EventEmitter();
  /** 能否买大小操作 */
  @Input() canBuy?: boolean = false;
  @Output() guess: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** hilo end*/

  /** 头部切换选项 */
  list = [this.localeService.getValue('manual'), this.localeService.getValue('auto')];
  /** 头部切换选项选中index */
  active = 0;

  /** 自动投注-赢了-对应开关按钮的值 */
  win = false;
  /** 自动投注-亏损-对应开关按钮的值 */
  lose = false;

  /** 投注金额 */
  money: string = '0.00000000';

  loopInfo: any = {
    /** 自动投注 投注数 因为要实时同步所以放在对象内 */
    betNmb: '',
  };
  // /** 自动投注 投注数 */
  // betNmb: any = ''
  /** 自动投注 止盈 */
  profitNmb: any = '';
  /** 自动投注 止损 */
  lossNmb: any = '';
  /** 自动投注 最大投注数 */
  MaxbetNmb: any = '';
  /** 自动投注 赢了百分比 */
  winPercent: any = '';
  /** 自动投注 输了百分比 */
  losePercent: any = '';
  /** 余额 */
  private balanceSub!: Subscription;
  /** 用户余额 */
  balance: string = '0';
  // 所有币种余额
  allCurrencyBalance: CurrencyBalance[] = [];

  constructor(
    private router: Router,
    private orignalService: OrignalService,
    private appService: AppService,
    private dialog: MatDialog,
    private layout: LayoutService,
    private betService: BetService,
    private iconService: IconService,
    private localeService: LocaleService,
    private diceApi: DiceApi,
    private plinkoApi: PlinkoApi,
    private cacheService: CacheService,
    private currencyValuePipe: CurrencyValuePipe,
    private chipDataService: ChipDataService,
    private toast: ToastService
  ) {
    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) {
        console.log(v);
        this.currentCurrencyData = v;
        this.betService.limitList$.value?.length && this.setLimit();
        this.isDigital = v.isDigital;
        if (this.allCurrencyBalance.length > 0) {
          const item = this.allCurrencyBalance.find(e => e.currency == v.currency);
          if (item) {
            this.balance = item.balance.toString();
          }
        }
      }
    });
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });
  }

  /** 当前选中币种信息 */
  currentCurrencyData?: CurrenciesInterface;
  /** 是否为数字货币 */
  isDigital: boolean = false;
  /** 是否为H5模式 */
  isH5!: boolean;
  /** 最小最大投注额 */
  limit: any;

  /** 投注状态显示 */
  crashBetTest: string = '';
  crashBetStart: string = '';
  // crash停止投注
  loading: boolean = false;
  // crash 投注后，禁止任何输入操作
  isDisabled: boolean = false;
  isLogin: boolean = false;
  /** 限额*/
  betLimit: any = {};
  tempBet: any = [];
  get canSubmit(): boolean {
    if (!this.isLogin) {
      return false;
    }
    // crash结算时，可以点击投注按钮
    if (this.type == 'crash' && this.crashBetStart == 'betcashout') {
      return true;
    }
    if (['mines', 'hilo', 'stairs', 'tower', 'baccarat', 'blackjack', 'coinflip'].includes(this.type) && this.loading) {
      return true;
    }
    if (this.limitMsg()) {
      return false;
    }
    return Number(this.balance) > 0;
  }
  async ngOnInit() {
    if (this.type == 'crash' || this.type == 'limbo' || this.type == 'slide' || this.type == 'csgo') {
      // 初始化crash赔率
      this.rate = 2;
    }
    if (this.type == 'baccarat') {
      this.chipData = this.chipDataService.chipData;
    }

    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.isLogin = x ? true : false;
      if (x) {
        // const res: any = await this.diceApi.getBetLimit(this.type.toUpperCase());
        // if (res.code == 0) {
        //   this.betService.limitList$.next(res.data);
        this.setLimit();
        if (this.type == 'baccarat') {
          this.setChipData();
        }
        this.initMoney();
        // }

        // if (this.type == 'plinko') {
        //   this.setMultiplier()
        // }
      }
    });

    this.orignalService.userBalance$.pipe(untilDestroyed(this)).subscribe((data: any) => {
      // this.balance = data?.balance;
      if (data?.isInit) {
        // 暂时不用余额投注
        // if (this.isDigital) {
        //   this.money = Number(this.balance).toDecimal(8)
        // } else {
        //   this.money = Number(this.balance).toDecimal(2)
        // }
      }
    });
    //
    this.appService.userBalance$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) {
        this.allCurrencyBalance = v;
        const item = v.find(e => e.currency == this.currentCurrencyData?.currency);
        if (item) {
          this.balance = item.balance.toString();
        }
      }
    });
    this.betService.money$.pipe(untilDestroyed(this)).subscribe((money: any) => {
      if (money) {
        // 限制筹码投注
        if (this.type == 'baccarat' && this.limit) {
          this.setChipData();
        }
        let max_chars = 9;
        const rep = /[.]/;
        money = Number(money).toDecimal(this.isDigital ? 8 : 2);
        if (rep.test(money)) {
          max_chars = 10;
        }
        this.money = money.substr(0, max_chars);
      }
    });

    this.betService.crashBetstate$.pipe(untilDestroyed(this)).subscribe((e: string) => {
      // 1.开始投注 未投注只显示投注 状态betting
      // 2.开始投注 点击投注后，显示投注与已订购 betsussce
      // 3.停止投注，显示转圈圈效果, stoploading
      // 4.飞行过程 显示投注与下一轮 betnext
      // 5.不在开始投注倒计时内投注 只显示取消 betcancel
      // 6.不在倒计时内取消投注 betclear 然后由crash组建那边返回 betnext
      // 7.已投注 飞行过程中，投注显示套现CASHOUT，下面根据飞行倍数变换可盈 betcashout
      // 8.开始投注与停止投注 有2种状态，一种是未投注 直接开始stoploading,还有种已投注 betsussceloading,为了判断cashout
      // 不直接返回文字，是为了在取消状态时 再次点击可以取消暂存的投注
      this.loading = false;
      if (e == 'betclear') {
        // this.isDisabled = true
        return;
      }
      this.crashBetStart = e;
      let test = '';
      // eslint-disable-next-line default-case
      switch (e) {
        case 'betting':
          this.isDisabled = false;
          break;
        case 'betsussce':
          test = this.localeService.getValue('betted');
          this.loading = true;
          this.isDisabled = true;
          break;
        case 'stoploading':
          this.loading = true;
          this.isDisabled = true;
          break;
        case 'betsussceloading':
          this.loading = true;
          this.isDisabled = false;
          break;
        case 'betnext':
          test = this.localeService.getValue('next_turn');
          this.isDisabled = false;
          break;
        case 'betcancel':
          this.isDisabled = true;
          break;
        case 'betcashout':
          this.isDisabled = true;
          break;
      }
      this.crashBetTest = test;
    });
    this.betService.crashCope$.pipe(untilDestroyed(this)).subscribe((e: string) => {
      if (this.crashBetStart == 'betcashout') {
        // 如果到达倍数， 投注完成，可以进行下一次投注
        if (Number(e) >= this.rate) {
          this.betService.crashBetstate$.next('betnext');
        } else {
          // 可以套现时，下面计算可盈金额
          let crashBetTest = '';
          if (this.currentCurrencyData && this.limit) {
            const personTel = Number(this.money).subtract(Number(e)).minus(Number(this.money));
            if (personTel > this.limit.lotteryMaxQuota) {
              crashBetTest = this.currencyValuePipe.transform(
                this.limit.lotteryMaxQuota.add(Number(this.money)),
                this.currentCurrencyData.currency
              );
            } else {
              crashBetTest = this.currencyValuePipe.transform(
                personTel.add(Number(this.money)),
                this.currentCurrencyData.currency
              );
            }
          }
          this.crashBetTest = crashBetTest;
        }
      }
    });
    /** mines游戏是否已经开始投注 */
    this.betService.minesBetstate$.pipe(untilDestroyed(this)).subscribe((e: any) => {
      this.loading = e?.betting;
      if (e?.money) {
        let max_chars = 9;
        const rep = /[.]/;
        const money = e?.money.toDecimal(this.isDigital ? 8 : 2);
        if (rep.test(money)) {
          max_chars = 10;
        }
        this.money = money.substr(0, max_chars);
      }
    });

    this.betService.atuoActive$.pipe(untilDestroyed(this)).subscribe((active: boolean) => {
      this.active = active ? 1 : 0;
    });

    if (this.cacheService.loopInfos) {
      this.loopInfo.betNmb = this.cacheService.loopInfos.betNmb;
      this.profitNmb = this.cacheService.loopInfos.profitNmb;
      this.lossNmb = this.cacheService.loopInfos.lossNmb;
      this.MaxbetNmb = this.cacheService.loopInfos.MaxbetNmb;
      this.winPercent = this.cacheService.loopInfos.winPercent;
      this.losePercent = this.cacheService.loopInfos.losePercent;
      this.win = this.cacheService.loopInfos.win;
      this.lose = this.cacheService.loopInfos.lose;
    } else {
      this.setCacheLoop();
    }

    // plinko 与wheel 共用风险下拉框
    this.selectedRow = this.type == 'wheel' ? 50 : 12;
    this.selectedRisk = this.type == 'wheel' ? 'middling' : 'low';

    this.betService.tempBet$.pipe(untilDestroyed(this)).subscribe((data: any) => {
      this.tempBet = data;
      console.log(this.tempBet);
    });
  }
  limitMsg() {
    let msg = '';
    const betAmount = Number(this.money);
    // //
    // if (betAmount > 0) {

    if (Number(betAmount) > Number(this.balance)) {
      msg = 'insufficient'; // 已超出您的可用额度
    }
    if (betAmount > this.betLimit.lotteryMaxAmount) {
      msg = '投注金额超出限额'; // 投注金额超出限额
    } else if (betAmount < this.betLimit.lotteryMinAmount) {
      msg = '投注金额低于限额';
    }

    // }
    return msg;
  }

  setLimit() {
    const data = this.betService.limitList$.value.find(
      (cur: any) => cur.currency === this.currentCurrencyData?.currency
    );
    this.limit = data;
    this.betLimit = data;
  }

  /**
   * 投注金额操作按钮功能
   *
   * @param type
   */
  handleMoney(type: number) {
    if (this.isDisabled || this.isLoop) return;
    if (['mines', 'hilo', 'stairs', 'plinko', 'tower', 'blackjack', 'coinflip'].includes(this.type) && this.loading)
      return;
    if (this.type == 'baccarat' && Number(this.money) == 0) return;
    this.iconService.balanceAudioPlay();
    if (Boolean(this.balance) && Number(this.balance) > 0) {
      let money = '0';
      switch (type) {
        // 最小
        case 0:
          money = this.limit?.lotteryMinAmount.toDecimal(this.isDigital ? 8 : 2);
          break;
        // 最大
        case 1:
          if (this.type == 'baccarat') return;
          money = this.limit
            ? Math.min(Number(this.balance), Number(this.limit.lotteryMaxAmount)).toDecimal(this.isDigital ? 8 : 2)
            : '0';
          break;
        // 1/2
        case 2:
          money = Number(this.money)
            .divide(Number(2))
            .toDecimal(this.isDigital ? 8 : 2);
          break;
        // 2X
        case 3:
          money = Number(this.money)
            .subtract(Number(2))
            .toDecimal(this.isDigital ? 8 : 2);
          break;
        default:
          break;
      }
      if (this.type == 'baccarat') {
        // 金额未改变 或者计算后大于余额或者限额时，return
        if (
          Number(this.money) == Number(money) ||
          Number(money) > Number(this.balance) ||
          Number(money) > Number(this.limit.lotteryMaxAmount)
        ) {
          return;
        }
      }
      this.money = money;
      this.betService.changChipType$.next(type);
      this.setMoneyRange();
    }
  }

  /** 初始化投注金额 */
  setMoneyRange() {
    if (this.isDisabled || this.isLoop) return;
    if (this.type == 'baccarat') return;
    if (['mines', 'hilo', 'stairs', 'tower', 'baccarat', 'blackjack', 'coinflip'].includes(this.type) && this.loading)
      return;

    if (!this.balance || Number(this.balance) <= 0) return;
    const min = this.limit?.lotteryMinAmount.toDecimal(this.isDigital ? 8 : 2);
    if (Number(this.money) >= Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance))) {
      this.money = Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance)).toDecimal(
        this.isDigital ? 8 : 2
      );
      // if (this.isDigital) {

      //   this.money = Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance)).toDecimal(8)
      // } else {
      //   this.money = Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance)).toDecimal(2)
      // }
    } else if (Number(this.money) < Number(min)) {
      this.money = min;
    }

    // 处理投注金额位数
    let max_chars = 9;
    const rep = /[.]/;
    const money = Number(this.money).toDecimal(this.isDigital ? 8 : 2);
    if (rep.test(money)) {
      max_chars = 10;
    }
    this.money = money.substr(0, max_chars);
    // money = money.replace(/[^0-9.]+/, '');
    console.log(this.money);
    this.betService.money$.next(this.money);
    this.betService.inputMoney$.next(this.money);
  }
  /** 初始化默认投注金额 */
  initMoney() {
    // USDT/USDC/BUSD/EOS 默认投注额：1
    // TRX/DOGE 默认投注额：20
    // SHIB 默认投注额：100,000
    // BTC 默认投注额：0.00005
    // ETH 默认投注额：0.0005
    // BNB 默认投注额：0.005
    let inM = '';
    switch (this.currentCurrencyData?.currency) {
      case 'USDT':
      case 'USDC':
      case 'BUSD':
      case 'EOS':
        inM = '1.00000000';
        break;
      case 'TRX':
      case 'DOGE':
        inM = '20.0000000';
        break;
      case 'SHIB':
        inM = '100.000000';
        break;
      case 'BTC':
        inM = '0.00005000';
        break;
      case 'ETH':
        inM = '0.00050000';
        break;
      case 'BNB':
        inM = '0.00500000';
        break;
      case 'CNY':
        inM = '10';
        break;
      case 'THB':
        inM = '50';
        break;
      case 'VND':
        inM = '20000';
        break;
      case 'USD':
        inM = '1';
        break;
      case 'JPY':
        inM = '200';
        break;
      case 'EUR':
      case 'GBP':
        inM = '1';
        break;
      default:
        inM = '2.00000000';
        break;
    }

    if (this.type == 'baccarat') {
      // 筹码停留在默认投注金额
      this.currentIdx = this.findClosestObjectIndex(inM);
      this.betService.chip$.next(this.chipData[this.currentIdx]);
      this.chipMoney = this.chipData[this.currentIdx][this.isDigital ? 'digitalValue' : 'value'];
      inM = '0';
      this.sharedSwiper?.slideTo(this.currentIdx);
    }
    console.log(this.type);
    console.log(inM);
    this.betService.money$.next(inM);
    this.betService.inputMoney$.next(inM);
  }
  findClosestObjectIndex(target: any) {
    return this.chipData.reduce((prev: any, curr: any, index: number) => {
      const a = Number(this.chipData[prev][this.isDigital ? 'digitalValue' : 'value']);
      const b = Number(curr[this.isDigital ? 'digitalValue' : 'value']);
      return Math.abs(b - Number(target)) < Math.abs(a - Number(target)) && b <= Number(target) ? index : prev;
    }, 0);
  }
  /**
   * 规范输入框输入金额
   *
   * @param event
   * @param name
   */
  oninput(event: any, name: string | null) {
    let max_chars = 9;
    const rep = /[.]/;
    if (rep.test(event.target.value)) {
      max_chars = 10;
    }
    event.target.value = event.target.value.substr(0, max_chars);
    event.target.value = event.target.value.replace(/[^0-9.]/g, '');
    // 限制一个小数点
    event.target.value = event.target.value
      .replace(/\.{2,}/g, '.')
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.');
    if (this.isDigital) {
      event.target.value = event.target.value.replace(/^(\-)*(\d+)\.(\d\d\d\d\d\d\d\d).*$/, '$1$2.$3');
      if (event.target.value.substring(0, 2) == '00') {
        // 不能连续两个0
        event.target.value = parseFloat(event.target.value);
      }
    } else {
      const max_chars = 9;
      event.target.value = event.target.value.substr(0, max_chars);
      event.target.value = event.target.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
      if (event.target.value.substring(0, 2) == '00') {
        // 不能连续两个0
        event.target.value = parseFloat(event.target.value);
      }
      event.target.value = event.target.value
        .replace(/[^\d.]/g, '')
        .replace(/\.{2,}/g, '.')
        .replace('.', '$#$')
        .replace(/\./g, '')
        .replace('$#$', '.')
        .replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
        .replace(/^\./g, '');
    }

    let value = event.target.value;
    if (name == 'profitNmb') {
      // 止盈金额
      this.profitNmb = value || '';
      this.setCacheLoop();
      event.target.value = this.profitNmb || '';
    } else if (name == 'lossNmb') {
      // 止损金额
      this.lossNmb = value || '';
      this.setCacheLoop();
      event.target.value = this.lossNmb || '';
    } else if (name == 'MaxbetNmb') {
      // 最大投注额
      this.MaxbetNmb = value || '';
      this.setCacheLoop();
      event.target.value = this.MaxbetNmb || '';
    } else if (name == 'rate') {
      // 兑换倍数
      this.rate = value || '';
      event.target.value = this.rate || '';
      this.rateChange.emit(this.rate);
    } else {
      if (Number(value) >= Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance))) {
        value = Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance)).toDecimal(this.isDigital ? 8 : 2);
        value = value.substr(0, max_chars);
      }
      // 金额输入框
      this.money = value || '';
      event.target.value = this.money || '';
      this.betService.inputMoney$.next(this.money);
    }
  }
  /**
   * 止盈止损最大投注额输入框失去焦点后判断是否为0
   *
   * @param event
   * @param name
   */
  setNmb(event: any, name: string): void {
    if (event.target.value && !Number(event.target.value)) {
      if (name == 'profitNmb') {
        // 止盈金额
        this.profitNmb = '';
      } else if (name == 'lossNmb') {
        // 止损金额
        this.lossNmb = '';
      } else if (name == 'MaxbetNmb') {
        // 最大投注额
        this.MaxbetNmb = '';
      }
      this.setCacheLoop();
      event.target.value = '';
    }
  }
  // 返回可赢金额
  formatPersonTel(type: string = 'rate') {
    if (this.currentCurrencyData && this.limit && this.type != 'plinko') {
      const betVal = type == 'rate' ? Number(this.rate) : this.nextMultiplier;
      const personTel = Number(this.money)?.subtract(betVal).minus(Number(this.money));
      if (personTel > this.limit.lotteryMaxQuota) {
        return this.currencyValuePipe.transform(
          this.limit.lotteryMaxQuota.add(Number(this.money)),
          this.currentCurrencyData.currency
        );
      } else {
        return this.currencyValuePipe.transform(personTel.add(Number(this.money)), this.currentCurrencyData.currency);
      }
    }
    return type == 'rate' ? '' : '0.00000000';
  }
  tipTimer!: any;
  isTip: boolean = false;
  tipTest!: string;
  /** 投注 */
  submit() {
    if (!this.canSubmit) {
      const msg = this.limitMsg();
      if (msg == 'insufficient') {
        this.dialog.open(dialogTopUpComponent, {
          panelClass: 'single-page-dialog-container',
        });
      }
      return;
    }
    if (this.money === '0.00000000' || this.money === '0.00') return;
    if (
      (this.type == 'crash' || this.type == 'limbo' || this.type == 'slide' || this.type == 'csgo') &&
      (this.rate > 10000 || !this.rate || this.rate < 1.01)
    ) {
      if (this.rate > 10000) {
        this.tipTest = this.localeService.getValue('less_than_or_equal') + '9999.99';
      } else if (!this.rate) {
        this.tipTest = '请填写此字段';
      } else if (this.rate < 1.01) {
        this.tipTest = '值必须大于等于1.01';
      }
      this.isTip = true;
      if (this.tipTimer) clearTimeout(this.tipTimer);
      this.tipTimer = setTimeout(() => {
        this.isTip = false;
      }, 3 * 1000);
      return;
    }

    this.betService.money$.next(this.money);
    this.betService.winLoseAmount = 0;
    if (this.active == 0) {
      // crash 取消投注判断
      if (this.type == 'crash' || this.type == 'slide' || this.type == 'csgo') {
        if (this.crashBetStart == 'betcancel') {
          this.betService.crashBetstate$.next('betclear');
        } else if (
          this.crashBetStart == 'betsussce' ||
          this.crashBetStart == 'betsussceloading' ||
          this.crashBetStart == 'stoploading'
        ) {
          console.log('停止投注和已投注禁止点击');
          return;
        } else {
          this.toBet.emit(this.money);
        }
      } else if (['mines', 'hilo', 'stairs', 'tower', 'blackjack', 'coinflip'].includes(this.type)) {
        // mines以当前选择结算
        if (this.loading) {
          this.toSubmit.emit(this.money);
        } else {
          // 开始新一轮游戏
          this.toBet.emit(this.money);
        }
      } else {
        this.toBet.emit(this.money);
      }
    } else {
      // 设置止损止盈最大投注金额要超过 赌注
      //检查止盈
      if (this.profitNmb && this.profitNmb != '' && Number(this.profitNmb) && Number(this.money) > this.profitNmb) {
        this.toast.show({
          message: this.localeService.getValue('profitnmb_waiting_original'),
          type: 'fail',
          title: '',
        });
        return;
      }
      //检查止损
      if (this.lossNmb && this.lossNmb != '' && Number(this.lossNmb) && Number(this.money) > this.lossNmb) {
        this.toast.show({ message: this.localeService.getValue('lossnmb_waiting_original'), type: 'fail', title: '' });
        return;
      }
      //检查最大投注金额
      if (
        this.MaxbetNmb &&
        this.MaxbetNmb != '' &&
        Number(this.MaxbetNmb) &&
        Number(this.money) > Number(this.MaxbetNmb)
      ) {
        this.toast.show({ message: this.localeService.getValue('maxbet_waiting_original'), type: 'fail', title: '' });
        return;
      }
      // mines 自动投注需要判断是否预选
      if (['mines', 'tower'].includes(this.type) && this.betService.tempBet$.value.length == 0) return;
      this.isLoop = true;
      this.isLoopChange.emit(this.isLoop);
      this.loopInfo = {
        money: this.money,
        betNmb: this.loopInfo.betNmb != '' ? Number(this.loopInfo.betNmb) || '' : '',
        profitNmb: this.profitNmb != '' ? Number(this.profitNmb) || '' : '',
        lossNmb: this.lossNmb != '' ? Number(this.lossNmb) || '' : '',
        MaxbetNmb: this.MaxbetNmb != '' ? Number(this.MaxbetNmb) || '' : '',
        winPercent: this.winPercent != '' ? Number(this.winPercent) || '' : '',
        losePercent: this.losePercent != '' ? Number(this.losePercent) || '' : '',
        isLoop: this.isLoop,
        /** 自动投注-赢了-对应开关按钮的值 */
        win: this.win,
        /** 自动投注-亏损-对应开关按钮的值 */
        lose: this.lose,
        lotteryMaxAmount: this.limit.lotteryMaxAmount,
      };
      this.commitLoop.emit(this.loopInfo);
    }

    // crash音效
    if (this.type == 'crash' || this.type == 'limbo' || this.type == 'slide' || this.type == 'csgo') {
      this.iconService.betAudioPlay();
    }
  }

  /**
   * 切换头部tab
   *
   * @param i
   */
  changeTab(i: number) {
    console.log(this.betService.isChangeActive$.value)
    // dice 自动投注时，禁止切换
    if (this.isLoop && ['dice', 'tower', 'cryptos', 'mines', 'slide', 'csgo'].includes(this.type)) return;
    // mines初始化与投注中，禁止切换
    if (
      (this.loading && ['mines', 'tower', 'cryptos', 'slide', 'csgo'].includes(this.type)) ||
      (!this.betService.isChangeActive$.value && ['mines', 'tower', 'cryptos', 'slide', 'csgo'].includes(this.type))
    )
      return;
    this.active = i;
    this.betService.atuoActive$.next(i ? true : false);
    if (!this.cacheService.autoTipsShow && i == 1) {
      this.dialog.open(AutoComponent, {
        panelClass: 'no-border-radius',
        data: {
          type: this.type,
          flag: false,
        },
      });
    }
    if (this.isLoop) {
      this.isLoop = false;
      this.loopInfo.isLoop = false;
    }
    if (this.type == 'crash' || this.type == 'slide' || this.type == 'csgo') {
      this.betService.tempBet$.next(null);
      if (this.betService.crashBetstate$.value == 'betcancel') {
        this.betService.crashBetstate$.next('betnext');
      }
    }
  }

  /** 自动投注说明弹窗 */
  showModel() {
    this.dialog.open(AutoComponent, {
      panelClass: 'no-border-radius',
      data: {
        type: this.type,
        flag: true,
      },
    });
  }

  ngOnDestroy(): void {
    // this.balanceSub?.unsubscribe();
    console.log('销毁');

    this.stopLoop();
    this.betService.atuoActive$.next(false);
    this.betService.isChangeActive$.next(false);
  }

  /**
   * 自动投注参数检查
   *
   * @param event
   * @param name
   */
  oninputLoop(event: any, name: string) {
    event.target.value = event.target.value.replace(/[^0-9]+/, '');
    event.target.value = event.target.value.replace(/^(\-)*(\d+)\.(\d\d)*$/, '$1$2.$3');
    if (event.target.value.indexOf('.') < 0 && event.target.value != '') {
      // 首位是0的话去掉
      event.target.value = parseFloat(event.target.value);
    }
    if (event.target.value <= 0) {
      // 首位是0的话去掉
      event.target.value = '';
    }
    let value = event.target.value;

    // eslint-disable-next-line default-case
    switch (name) {
      case 'betNmb':
        if (value > 99999999) {
          value = 99999999;
        }
        this.loopInfo.betNmb = value || '';
        event.target.value = this.loopInfo.betNmb || '';
        break;

      case 'winPercent':
        if (value > 9999) {
          value = 9999;
        }
        this.winPercent = value || '';
        event.target.value = this.winPercent || '';
        break;
      case 'losePercent':
        if (value > 9999) {
          value = 9999;
        }
        this.losePercent = value || '';
        event.target.value = this.losePercent || '';
        break;
    }
    this.setCacheLoop();
  }

  /**
   * 止盈 止损开关
   *
   * @param event
   * @param name
   */
  toggleChange(event: any, name: string) {
    if (name == 'win') {
      this.win = event.checked;
      this.winPercent = '';
    } else {
      this.lose = event.checked;
      this.losePercent = '';
    }
    this.setCacheLoop();
  }

  /**
   * 中止连续开奖
   */
  stopLoop() {
    if (this.type == 'crash' || this.type == 'slide' || this.type == 'csgo') {
      this.active = 1;
      if (this.betService.crashBetstate$.value == 'betcancel') {
        this.betService.crashBetstate$.next('betnext');
      }
    }
    this.betService.tempBet$.next([]);
    this.isLoop = false;
    this.loopInfo.isLoop = this.isLoop;
    this.isLoopChange.emit(this.isLoop);
  }
  onblur(name: string) {
    if (this.isLoop) return;
    if (name == 'win') {
      this.win = true;
    } else {
      this.lose = true;
    }
    this.setCacheLoop();
  }
  focus(e: any) {
    console.log(9999999, e);
  }

  /**
   * crash减少兑换倍数
   */
  onReduce() {
    if (this.isDisabled || this.isLoop) return;
    this.iconService.balanceAudioPlay();
    if (Number(Number(this.rate).minus(1).toDecimal(0)) < 2) {
      this.rate = 1.01;
    } else {
      this.rate = Number(Number(this.rate).minus(1).toDecimal(0));
    }
    this.rateChange.emit(this.rate);
  }
  /**
   * crash增加兑换倍数
   */
  onAdd() {
    if (this.isDisabled || this.isLoop) return;
    this.iconService.balanceAudioPlay();
    this.rate = Number(Number(this.rate).add(1).toDecimal(0));
    this.rateChange.emit(this.rate);
  }

  oCopy(event: any) {
    this.moneyInputElement.nativeElement.select();
  }

  bombChange(e: any) {
    if (this.loading || this.isLoop) return;
    this.bombCounts = e.value;
    this.bombCountsChange.emit(e.value);
    if (!e.source) {
      this.iconService.balanceAudioPlay();
    }
  }

  autoSelectArea() {
    if (this.active == 1 && this.type != 'tower') return;
    this.autoSelect.emit();
  }
  onAutoClear() {
    this.autoClear.emit();
  }
  goToLogin() {
    this.orignalService.jumpToLogin();
  }

  handleBuyType(type: string) {
    this.buyChangeEvent.emit(type);
  }

  // 风险等级 low centre   high
  selectedRisk: any = 'low';
  riskChange(e: any) {
    if (this.loading || this.isLoop) return;
    this.riskSelect.emit(e.value);
  }
  selectedRow: any = 12;
  rowChange(e: any) {
    if (this.loading || this.isLoop) return;
    this.rowSelect.emit(e.value);
  }

  /*
   * 保存自动投注内容
   **/
  setCacheLoop() {
    this.cacheService.loopInfos = {
      betNmb: this.loopInfo.betNmb,
      profitNmb: this.profitNmb,
      lossNmb: this.lossNmb,
      MaxbetNmb: this.MaxbetNmb,
      winPercent: this.winPercent,
      losePercent: this.losePercent,
      win: this.win,
      lose: this.lose,
    };
  }
  /** 所有筹码数组 */
  chipData: {
    index: number;
    chip: number;
    value: string; //法币金额
    digitalValue: string; //数字币金额
    img: string;
    isDisabled: boolean; //是否能选择
  }[] = [];
  /** 筹码金额 */
  chipMoney: string = '';
  @ViewChild('sharedSwiperComponent') sharedSwiper!: ImgCarouselComponent;
  /** 筹码index */
  currentIdx: number = 1;
  onLastSlide() {
    this.sharedSwiper.slidePrev();
  }
  onNextSlide() {
    this.sharedSwiper.slideNext();
  }
  indexChange(e: any) {
    // if(this.chipDatae])
    this.currentIdx = e;
    console.log(this.currentIdx);
    this.chipMoney = this.chipData[this.currentIdx][this.isDigital ? 'digitalValue' : 'value'];
    this.betService.chip$.next(this.chipData[this.currentIdx]);
  }
  setChipData() {
    this.chipData.forEach(e => {
      const val = Number(e[this.isDigital ? 'digitalValue' : 'value']);
      const oldMoney = val.add(Number(this.betService.money$.value));
      if (
        Number(this.balance) < val ||
        this.limit.lotteryMaxAmount < val ||
        oldMoney > Number(this.balance) ||
        oldMoney > Number(this.limit.lotteryMaxAmount)
      ) {
        e.isDisabled = true;
      } else {
        e.isDisabled = false;
      }
    });
  }

  /**
   * 猜测正反
   *
   * @param isHeads
   */
  guessCoin(isHeads: boolean) {
    // 根据 isHeads 判断用户猜测的是正面还是反面
    this.guess.emit(isHeads);
  }
}
