import { Injectable } from '@angular/core';
import { AdjustmentCategoryEnum } from 'src/app/shared/interfaces/member.interface';

@Injectable({
  providedIn: 'root',
})
export class DetailService {
  private _dataList = {};
  private _userIdListInfo = [];
  constructor() {
    const userIdListInfoStr = localStorage.getItem('userIdListInfo');
    if (userIdListInfoStr) {
      this._userIdListInfo = JSON.parse(userIdListInfoStr);
    }
  }

  get dataList(): any {
    return this._dataList;
  }

  set dataList(value: any) {
    this._dataList = value;
  }

  get userIdListInfo(): any {
    return this._userIdListInfo;
  }

  set userIdListInfo(value: any) {
    this._userIdListInfo = value;
    localStorage.setItem('userIdListInfo', JSON.stringify(value));
  }

  /** 调整 类型 */
  adjustmentTypeList: Array<{ name: string; lang: string; value: number; code: string }> = [
    { name: '存款', lang: 'game.proxy.deposit', value: 1, code: 'Deposit' },
    { name: '提款', lang: 'game.proxy.withdraw', value: 2, code: 'Withdraw' },
    { name: '红利', lang: 'game.proxy.bonus', value: 3, code: 'Bonus' },
    { name: '输赢', lang: 'dashboard.info.winLose', value: 4, code: 'Payout' },
    { name: '其他', lang: 'system.merchants.other', value: 0, code: 'Other' },
  ];

  /**
   * 调账种类
   */
  adjustmentCategoryList = [
    {
      name: '主账户',
      lang: 'member.overview.masterAccount',
      value: AdjustmentCategoryEnum.Main,
      code: AdjustmentCategoryEnum[AdjustmentCategoryEnum.Main],
    },
  ];
}
