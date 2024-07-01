import { Injectable } from '@angular/core';

export enum BatchMainType {
  login = 'login',
  game = 'game',
  pay = 'pay',
}

@Injectable({
  providedIn: 'root',
})
export class BatchService {
  BatchMainType = BatchMainType;

  /**
   * 存款列表
   */
  depositList = [
    { name: '法币', lang: 'member.overview.fiatCurrency', type: 'Legal' },
    { name: '信用卡买币', lang: 'member.overview.cradBuyCoins', type: 'BankCard' },
  ];

  /**
   * 提款列表
   */
  withdrawalList = [
    { name: '法币', lang: 'member.overview.fiatCurrency', type: 'Legal' },
    { name: '加密货币', lang: 'member.overview.cryptocurrency', type: 'Encryption' },
  ];

  mainList = [
    { main: BatchMainType.login, lang: 'member.list.login' },
    { main: BatchMainType.game, lang: 'common.game' },
    { main: BatchMainType.pay, lang: 'risk.batch.pay' },
  ];
}
