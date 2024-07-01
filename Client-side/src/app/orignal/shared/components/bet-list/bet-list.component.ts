import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { OrignalService } from 'src/app/orignal/orignal.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CurrencyBalance } from 'src/app/shared/interfaces/wallet.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { DiceApi } from '../../apis/dice.api';
import { CurrencyValuePipe } from '../../pipes/currency-value.pipe';
import { BetService } from '../../services/bet.service';
import { IconService } from '../../services/icon.service';
import { LocaleService } from '../../services/locale.service';

@UntilDestroy()
@Component({
  selector: 'orignal-bet-list',
  templateUrl: './bet-list.component.html',
  styleUrls: ['./bet-list.component.scss'],
})
export class BetListComponent implements OnInit, OnDestroy {
  /** 是否显示实时投注记录 */
  @Input() isRealHistory?: boolean = false;

  /** 游戏类型 */
  @Input() type!: string;
  @Input() betList!: any;

  /** 投注 */
  @Output() toBet = new EventEmitter();
  /** 停止自动投注 */
  @Output() stopLoop: EventEmitter<any> = new EventEmitter();
  /** 热键功能 */
  @Input() set operate({ value, item }: any) {
    switch (value) {
      case 'bet':
        this.submit(item);
        break;
      case 'min':
        this.handleMoney(3, item);
        break;
      case 'half':
        this.handleMoney(0, item);
        break;
      case 'double':
        this.handleMoney(1, item);
        break;
      case '1':
      case '2':
      case '3':
      case '4':
        if (!this.moneyfocus) {
          this.selector = Number(value);
        }
        break;
      case 'rateReduce':
        // this.onReduce(item);
        break;
      default:
        break;
    }
  }
  /** 用户余额 */
  balance: string = '0';
  // 所有币种余额
  allCurrencyBalance: CurrencyBalance[] = [];
  constructor(
    private orignalService: OrignalService,
    private appService: AppService,
    private dialog: MatDialog,
    private layout: LayoutService,
    private betService: BetService,
    private iconService: IconService,
    private localeService: LocaleService,
    private diceApi: DiceApi,
    private currencyValuePipe: CurrencyValuePipe,
    private toast: ToastService
  ) {
    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(v => {
      if (v) {
        this.currentCurrencyData = v;
        this.betService.limitList$.value?.length && this.setLimit();
        this.isDigital = v.isDigital;
        if (this.allCurrencyBalance.length > 0) {
          const item = this.allCurrencyBalance.find(e => e.currency == v.currency);
          if (item) {
            this.balance = item.balance.toString();
          }
        }
        this.initMoney();
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

  isLogin: boolean = false;
  /** 限额*/
  betLimit: any = {};

  isAuto: boolean = false;
  isLoop: boolean = false;
  /** 金额输入框焦点*/
  moneyfocus: boolean = false;
  /** 选择器选中*/
  selector: number = 1;
  async ngOnInit() {
    this.orignalService.orignalLoginReady$.pipe(untilDestroyed(this)).subscribe(async (x: boolean | null) => {
      this.isLogin = x ? true : false;
      if (x) {
        const res: any = await this.diceApi.getBetLimit(this.type.toUpperCase());
        if (res.code == 0) {
          this.betService.limitList$.next(res.data);
          this.setLimit();
        }
      }
    });

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
        let max_chars = 9;
        const rep = /[.]/;
        money = Number(money).toDecimal(this.isDigital ? 8 : 2);
        if (rep.test(money)) {
          max_chars = 10;
        }
        // item.money = money.substr(0, max_chars);
        this.betList.forEach((e: any) => {
          e.money = money.substr(0, max_chars);
        });
      }
    });
  }
  limitMsg(item: any) {
    let msg = true;
    const betAmount = Number(item.money);
    // //
    // if (betAmount > 0) {

    if (Number(betAmount) > Number(this.balance)) {
      // this.toast.show({ message: `${this.localeService.getValue(data.tKey)}!`, type: 'fail' });
      this.toast.show({ message: `${this.localeService.getValue('excess_amount')}!`, type: 'fail' });
      msg = false; // 已超出您的可用额度
    } else if (betAmount > this.limit.lotteryMaxAmount) {
      this.toast.show({ message: `${this.localeService.getValue('excess_limit')}!`, type: 'fail' });
      msg = false; // 投注金额超出限额
    } else if (betAmount < this.limit.lotteryMinAmount) {
      this.toast.show({ message: `${this.localeService.getValue('below_limit')}!`, type: 'fail' });
      msg = false;
    }

    // }
    return msg;
  }

  setLimit() {
    const data = this.betService.limitList$.value.find(
      (cur: any) => cur.currency === this.currentCurrencyData?.currency
    );
    this.limit = data;
  }

  /**
   * 投注金额操作按钮功能
   *
   * @param type
   * @param item
   */
  handleMoney(type: number, item: any) {
    console.log(item);
    if (!this.isLogin) return;
    if (item.isAuto && item.betAuto) return;
    this.iconService.balanceAudioPlay();
    if (Boolean(this.balance) && Number(this.balance) > 0) {
      switch (type) {
        // 最大
        case 2:
          item.money = this.limit
            ? Math.min(Number(this.balance), Number(this.limit.lotteryMaxAmount)).toDecimal(this.isDigital ? 8 : 2)
            : '0';
          break;
        // 1/2
        case 0:
          item.money = Number(item.money)
            .divide(Number(2))
            .toDecimal(this.isDigital ? 8 : 2);
          break;
        // 2X
        case 1:
          item.money = Number(item.money)
            .subtract(Number(2))
            .toDecimal(this.isDigital ? 8 : 2);
          break;
        case 3:
          item.money = this.limit?.lotteryMinAmount.toDecimal(this.isDigital ? 8 : 2);
          break;
        default:
          break;
      }
      this.setMoneyRange(item);
    }
  }

  /**
   * 初始化投注金额
   *
   * @param item
   */
  setMoneyRange(item: any) {
    console.log(item);
    this.moneyfocus = false;
    if (!this.balance || Number(this.balance) <= 0) return;
    const min = this.limit?.lotteryMinAmount.toDecimal(this.isDigital ? 8 : 2);
    if (Number(item.money) >= Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance))) {
      item.money = Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance)).toDecimal(
        this.isDigital ? 8 : 2
      );
      // if (this.isDigital) {

      //   item.money = Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance)).toDecimal(8)
      // } else {
      //   item.money = Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance)).toDecimal(2)
      // }
    } else if (Number(item.money) < Number(min)) {
      item.money = min;
    }

    // 处理投注金额位数
    let max_chars = 9;
    const rep = /[.]/;
    const money = Number(item.money).toDecimal(this.isDigital ? 8 : 2);
    if (rep.test(money)) {
      max_chars = 10;
    }
    item.money = money.substr(0, max_chars);
    // money = money.replace(/[^0-9.]+/, '');
  }
  /** 初始化默认投注金额 */
  initMoney() {
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
    this.betService.money$.next(inM);
  }
  /**
   * 规范输入框输入金额
   *
   * @param event
   * @param item
   */
  oninput(event: any, item: any) {
    if (!this.isLogin) return;
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

    if (Number(value) >= Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance))) {
      value = Math.min(Number(this.limit.lotteryMaxAmount), Number(this.balance)).toDecimal(this.isDigital ? 8 : 2);
      value = value.substr(0, max_chars);
      // 金额输入框
      item.money = value || '';
      event.target.value = item.money || '';
    }
  }

  oCopy(event: any) {
    event.target.select();
  }

  tipTimer!: any;
  isTip: boolean = false;
  tipTest!: string;
  /**
   * 投注
   *
   * @param item
   */
  submit(item: any) {
    if (!this.isLogin) {
      this.goToLogin();
    }
    if (item.loading) return;
    if (item.money === '0.00000000' || item.money === '0.00') return;
    if (!this.limitMsg(item)) return;
    if (Number(this.balance) <= 0) return;
    this.iconService.balanceAudioPlay();
    this.toBet.emit(item);
  }

  onFocus() {
    this.moneyfocus = true;
  }

  ngOnDestroy(): void {
    // this.balanceSub?.unsubscribe();
    console.log('销毁');
  }

  goToLogin() {
    this.orignalService.jumpToLogin();
  }

  toggleChange(event: any, item: any) {
    if (!item.isAuto) {
      item.betAuto = false;
    }
  }
}
