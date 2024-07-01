import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { Currency } from 'src/app/shared/interfaces/currency';
import { PayChannelList, WithdrawalTypeEnum } from 'src/app/shared/interfaces/channel';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PayService {
  constructor() {}

  curCurrencyTab = 0; // 币种type索引
  _currencyList: Currency[] = [];
  get currencyList() {
    return this._currencyList;
  }

  set currencyList(list: Currency[]) {
    this._currencyList = list;
    this.currencyListSignal.set(list);
  }

  /**
   * 币种列表
   */
  currencyListSignal: WritableSignal<Currency[]> = signal([]);

  /**
   * 法币列表
   */
  currencyListFiatSignal = computed(() => this.currencyListSignal().filter((e) => !e.isDigital));

  /**
   * 数字货币列表
   */
  currencyListDigitalSignal = computed(() => this.currencyListSignal().filter((e) => e.isDigital));

  channelListChange$ = new Subject();

  private _channelList: PayChannelList[] = [];
  #channelListSignal = signal<PayChannelList[]>([]);

  /**
   * 支付渠道列表信号
   */
  channelListByAllSignal = computed(() => this.#channelListSignal());

  /**
   * 可用的支付渠道列表信号
   */
  channelListSignal = computed(() => this.#channelListSignal().filter((e) => e.isEnable));

  get channelList() {
    return this._channelList.filter((e) => e.isEnable);
  }

  set channelList(list: PayChannelList[]) {
    this._channelList = list;
    this.channelListChange$.next(list);
    this.#channelListSignal.set(list);
  }

  get channelListByAll() {
    return this._channelList;
  }

  currencyListType: any[] = [
    { name: '法币', label: 'budget.fiatCurrency', value: WithdrawalTypeEnum.Currency },
    { name: '数字货币', label: 'budget.digitalCurrency', value: WithdrawalTypeEnum.Coin },
    // { name: '资产下发', label: 'budget.asset', value: WithdrawalTypeEnum.ManualWithdrawal, onlyGBShow: true },
    { name: '换汇', label: 'budget.asset', value: WithdrawalTypeEnum.CurrencyExchange, onlyGBShow: true },
    // {label: '系统内部转账', value: 2}
  ];

  findCurrencyType(value?: string) {
    return this.currencyListType.find((e) => e.value === value);
  }
}
