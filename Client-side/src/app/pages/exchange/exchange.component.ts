import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { DepositApi } from 'src/app/shared/apis/deposit.api';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import {
  CurrenciesInterface,
  CurrencyPurchaseInferface,
  WalletInfor,
} from 'src/app/shared/interfaces/deposit.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { UserAssetsService } from '../user-asset/user-assets.service';
import { ExchangeUtils } from './exchange-utils';
export const TIMER_MS = 10000;

@UntilDestroy()
@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss'],
})
export class ExchangeComponent implements OnInit {
  constructor(
    private router: Router,
    private walletApi: WalletApi,
    private exchangeUtils: ExchangeUtils,
    private userAssetsService: UserAssetsService,
    private depositApi: DepositApi,
    private appService: AppService,
    private toast: ToastService,
    private localeService: LocaleService
  ) {}

  @ViewChild('iSearchBuy', { static: false }) private searchBuyElement!: ElementRef;
  @ViewChild('iSearch', { static: false }) private searchElement!: ElementRef;
  @ViewChild('iSell', { static: false }) private sellElement!: ElementRef; //买入输入框
  @ViewChild('iBuy', { static: false }) private buyElement!: ElementRef; //卖出输入框

  @HostListener('click', ['$event.target'])
  btnStatus: string = 'disable'; //disable: 输入今额  ,preView:预览兑换结果
  btnTxt = {
    disable: this.localeService.getValue('ent_amount'),
    preView: this.localeService.getValue('pre_resul00'),
  };
  isExchange: boolean = false;
  isOpenSell: boolean = false;
  isOpenBuy: boolean = false;
  selectSellCurrency: any = {}; //所有币种（法币&&虚拟货币）
  selectBuyCurrency: any = {}; //虚拟货币
  canSubmit: boolean = false;
  searchCurreny: string = '';
  sellMaxAmount: string = '';
  buyMaxAmount: string = '';
  mockSellMaxAmount: string = '1-2500000';
  mockBuyMaxAmount: string = '0.0003-50';
  sellAmount: string = ''; //买入金额
  buyAmount: string = ''; //卖出金额
  exChangeB: number = 0; //当前用于兑换的金额
  submitCallBack: string = ''; // success:兑换成功 ,isVaild: 条件允许进行兑换  ， timeout: 兑换超时 ，fail ：失败
  timer = TIMER_MS / 1000; //计时器
  noticeConfig = this.exchangeUtils.NOTICE_INFOR_CONFIG;
  currencyInfor1: WalletInfor[] = [];
  currencyInfor2: WalletInfor[] = [];
  stepType: string = 'first-step'; //second-step
  isSending: boolean = false;
  exchangeRate: any = {}; //兑换汇率

  /** 所有币种 --- 如果需要显示币种图标信息之类请使用它 --- */
  currencies: CurrenciesInterface[] = [];
  /** 合并余额和币种信息（ 已剔除 isVisible = false 的 ） */
  allCurrencyInfor: WalletInfor[] = [];

  currentRate: string = ''; //当前兑换基准币种进行兑换的币种
  realAmont: number = 0; //兑换汇率后金额
  amount: string = ''; //输入金额
  baseCurrency: string = ''; //当前兑换基准币种
  exchangeCurrency: string = '';

  async ngOnInit() {
    //获取所有币种
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x.length > 0) {
        this.currencies = x;
        //获取钱包余额
        this.getBalanceData(x.filter(v => v.isVisible));
      }
    });
  }

  //获取用户所有余额   合并余额和币种信息
  async getBalanceData(allCurrencyInfor: CurrenciesInterface[]) {
    const allUesrBalance = await this.userAssetsService.getUserbalance();
    const formatWallet: WalletInfor[] = allCurrencyInfor.map((item: any) => {
      const matchedItem = allUesrBalance.find(e => e.currency == item.currency)!;
      const { isDigital, balance } = matchedItem;
      return {
        ...item,
        isDigital,
        balance,
        isSelected: false,
      };
    });
    this.allCurrencyInfor = formatWallet;
    this.currencyInfor1 = [...formatWallet];
    this.currencyInfor2 = [...formatWallet].filter(e => e.isDigital);
    // 默认花费显示USD，到账显示BTC
    this.selectSellCurrency = [...formatWallet].find(e => e.currency == 'USDT');
    this.selectBuyCurrency = [...formatWallet].find(e => e.currency == 'BTC');
  }

  //返回主页面
  handleBack() {
    console.log('333');
    // 资产主页
    this.router.navigate([this.appService.languageCode, 'wallet', 'overview']);
  }

  /**
   * Input Focus事件
   *
   * @param element
   */
  onFocus(element: any) {
    element.isFocus = true;
  }

  /**
   * Input Focus事件
   *
   * @param element
   */
  onBlur(element: any) {
    element.timer = setTimeout(() => {
      element.isFocus = false;
    }, 200);
  }

  /**
   * 金额则验证---- 卖出
   *
   * @param element
   */
  onSellInput(element: any) {
    //element.value = element.value.replace(/[^\d]/g, '');
    this.sellAmount = element.value;
    if (this.sellAmount === '') {
      this.buyAmount = '';
      this.canSubmit = false;
      this.stepType = 'first-step';
    } else {
      this.buyAmount = '--';
    }
  }

  /**
   * 金额则验证---- 买入
   *
   * @param element
   */
  onBuyInput(element: any) {
    // element.value = element.value.replace(/[^\d]/g, '');
    this.buyAmount = element.value;
    if (this.buyAmount === '') {
      this.sellAmount = '';
      this.canSubmit = false;
      this.stepType = 'first-step';
    } else {
      this.sellAmount = '--';
    }
  }

  isInvalidAmount(value: string) {
    const num = Number(value);
    if (value === '' || Number.isNaN(num)) {
      return false; // ignore --
    }
    this.amount = value;
    const isValid = num < 1;
    this.canSubmit = num >= 1;
    return isValid;
  }

  /**
   * 清除输入框的内容
   *
   * @param element
   */
  handleClean(element: any) {
    element.value = '';
    element.focus();
    element.dispatchEvent(new InputEvent('input'));
    if (element.timer) {
      clearTimeout(element.timer);
    }
  }

  /**
   * 搜索
   *
   * @param element
   */
  onSearchInput(element: any) {
    element.isValid = false;
  }

  //卖出货币展开下拉：自动input focus，
  handleOpenSell() {
    this.isOpenSell = !this.isOpenSell;
    this.searchCurreny = '';

    if (this.isOpenSell) {
      this.searchElement.nativeElement.focus();
    }
  }

  handleOpenBuy() {
    this.isOpenBuy = !this.isOpenBuy;
    this.searchCurreny = '';
    if (this.isOpenBuy) {
      this.searchBuyElement.nativeElement.focus();
    }
  }

  /**
   * 自动input focus，--------------- 卖出下拉 click out side
   *
   * @param event
   */
  hanbleOutsideSell(event: any) {
    const targetDom = event.target.className;
    const isSearchTarget = targetDom.includes('search-input');
    const isCleanTarget = targetDom.includes('close-icon');
    if (isSearchTarget || isCleanTarget) {
      return;
    } else {
      this.isOpenSell = false;
    }
  }

  /**
   * 自动input focus，--------------- 买入下拉 click out side
   *
   * @param event
   */
  hanbleOutsideBuy(event: any) {
    const targetDom = event.target.className;
    const isSearchTarget = targetDom.includes('search-input');
    const isCleanTarget = targetDom.includes('close-icon');
    if (isSearchTarget || isCleanTarget) {
      return;
    } else {
      this.isOpenBuy = false;
    }
  }

  /**
   * 转换事件
   */
  handleExChange() {
    this.isExchange = !this.isExchange;
    this.canSubmit = false;
    this.stepType = 'first-step';
    //但前如果有输入金额情况下，恢复默认
    if (this.sellAmount.length > 0 || this.buyAmount.length > 0) {
      this.sellAmount = '';
      this.buyAmount = '';
    }
  }

  /**
   *  选择
   *
   * @param item
   * @param type
   * @param event
   */
  handleSelect(item: any, type: string, event: any) {
    if (type == 'buy') {
      this.selectBuyCurrency = item;
    } else if (type == 'sell') {
      this.selectSellCurrency = item;
    }
    item.isSelected = true;
  }
  //预览兑换结果
  async handleSubmit() {
    // 1:判断当前兑换结果 余额不足：fail，报价过期：timeout， 条件允许进行兑换：isVaild
    //余额不足：可用金额不足
    //报价过期：汇率刷新
    //条件允许进行兑换：有可用金额
    //2:条件允许进行兑换时，stepType = "second-step" 进入兑换流程
    this.stepType = 'second-step';
    //当前是否有足够余额
    if (this.isExchange) {
      this.getRate(this.selectBuyCurrency, this.selectSellCurrency.currency);
      const current = this.selectBuyCurrency.balance;
      this.exChangeB = current;
      this.exchangeCurrency = this.selectSellCurrency.currency;
    } else {
      this.getRate(this.selectSellCurrency, this.selectBuyCurrency.currency);
      const current = this.selectSellCurrency.balance;
      this.exChangeB = current;
      this.exchangeCurrency = this.selectBuyCurrency.currency;
    }

    //预算vaild判断
    if (this.exChangeB > Number(this.sellAmount)) {
      this.submitCallBack = 'isVaild';
    } else {
      this.submitCallBack = 'fail';
    }
  }

  isSpend() {
    if (Number(this.sellAmount) > 0) {
      return false;
    } else if (Number(this.buyAmount) > 0) {
      return true;
    }
    return true;
  }

  async getRate({ currency, isDigital }: WalletInfor, buyType: string) {
    const rate = await this.getAllRate(currency);
    const { rates, baseCurrency } = rate;
    this.baseCurrency = baseCurrency;
    this.currentRate = rates.find((e: any) => e.currency == buyType).rate;
    if (isDigital) {
      this.realAmont = Number(this.amount) * Number(this.currentRate);
    } else {
      this.realAmont = Number(this.amount) / Number(this.currentRate);
    }
  }

  async getAllRate(currentBaseCurrency: string) {
    const userbalance: any = this.userAssetsService.getRatesBaseCurrency(
      this.userAssetsService.allRate.value,
      currentBaseCurrency
    );
    const { success, data } = userbalance;
    if (success) {
      return data;
    }
  }

  submitExchange() {
    this.getCurrencyPruhase();
    //倒计时 60秒
    // this.timer = TIMER_MS / 1000;
    // this.isSending = true;
    // let timer = setInterval((): any => {
    //   if (this.timer === 1) {
    //     clearInterval(timer);
    //     this.isSending = false;
    //     let mockCallBack = "success";  //模拟报价超时, 改成 timeout
    //     if (mockCallBack == "success") {
    //       this.submitCallBack = "success"
    //     } else {
    //       this.submitCallBack = "timeout"
    //     }
    //   }
    //   this.timer -= 1;
    // }, 1000);
  }

  getCurrencyPruhase() {
    const param: CurrencyPurchaseInferface = {
      currency: this.isExchange ? this.selectBuyCurrency.currency : this.selectSellCurrency.currency,
      token: this.isExchange ? this.selectSellCurrency.currency : this.selectBuyCurrency.currency,
      amount: Number(this.realAmont),
    };
    console.log('param-->', param);
    this.depositApi
      .getCurrencyPurchase(param)
      .pipe(finalize(() => {}))
      .subscribe(res => {
        console.log('res-->', res);
        const { success, data } = res;
        if (success) {
          this.router.navigate([this.appService.languageCode, 'exChange', 'purchase']);
        } else {
          // ---------此处错误弹出框 暂时显示，待设计稿出后进行调整 ！！！！
          this.toast.show({ message: res.message, type: 'fail' });
        }
      });
  }

  //返回兑换表单
  backFormPage() {
    this.submitCallBack = '';
    this.defaultFormat();
  }

  //表单数据清空
  defaultFormat() {
    this.canSubmit = false;
    this.stepType = 'first-step';
    this.sellAmount = '';
    this.buyAmount = '';
  }

  //返回用户资产首页
  back() {
    this.router.navigate([this.appService.languageCode, 'wallet', 'overview']);
  }
}
