import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  CointxHistoryInterface,
  CurrencytxHistoryInterface,
  DeviceHistory,
  GetAdjusttxHistoryInterface,
  GetAssetHistoryInterface,
  GetTransferHistoryInterface,
  GetWagerHistoryInterface,
  StatusListInterface,
  TransferParam,
  Transferwalletselect,
} from '../interfaces/history.interface';
import { ResponseData, ResponseListData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class HistoryApi extends BaseApi {
  private get memberHistoryUrl(): string {
    return `${environment.apiUrl}/v1/member/history`;
  }
  private get assetHistoryUrl(): string {
    return `${environment.apiUrl}/v1/asset/history`;
  }

  /**
   * 获取设备的操作记录
   *
   * @param pageIndex
   * @param pageSize
   * @returns DeviceHistory
   */
  getDevices(pageIndex: number, pageSize: number): Observable<ResponseListData<DeviceHistory[]>> {
    return this.get<ResponseListData<DeviceHistory[]>>(`${this.memberHistoryUrl}/devices`, {
      pageIndex: pageIndex,
      pageSize: pageSize,
    });
  }

  /**
   * 删除设备
   *
   * @param deviceId
   * @returns
   */
  deleteDevice(deviceId: number) {
    return this.post(`${this.memberHistoryUrl}/deletedevice`, { deviceId: deviceId });
  }

  /**
   * 获取用户操作记录
   *
   * @param start 开始时间（时间戳,精确到毫秒）
   * @param end 结束时间（时间戳，精确到毫秒）
   * @param status 状态： 0：全部，1：成功；2：失败
   * @param pageIndex
   * @param pageSize
   * @returns UserActivityLog
   */
  getOpreationHistory(
    start: number,
    end: number,
    status: number,
    pageIndex: number,
    pageSize: number
  ): Observable<any> {
    return this.get(`${this.memberHistoryUrl}/operationhistory`, {
      start: start,
      end: end,
      status: status,
      pageIndex: pageIndex,
      pageSize: pageSize,
    });
  }

  /**
   * 获取设备操作记录
   *
   * @param deviceId
   * @param pageIndex
   * @param pageSize
   * @returns DeviceLog
   */
  getDeviceLog(deviceId: number, pageIndex: number, pageSize: number): Observable<any> {
    return this.get(`${this.memberHistoryUrl}/getdevicelog`, {
      deviceId: deviceId,
      pageIndex: pageIndex,
      pageSize: pageSize,
    });
  }

  /**
   * 获取用户登录历史记录
   *
   * @param start
   * @param end
   * @param pageIndex
   * @param pageSize
   * @returns UserActivityLog
   */
  getLoginHistory(start: number, end: number, pageIndex: number, pageSize: number): Observable<any> {
    return this.get(`${this.memberHistoryUrl}/loginhistory`, {
      start: start,
      end: end,
      pageIndex: pageIndex,
      pageSize: pageSize,
    });
  }

  /**
   * 数字货币存款/提款交易
   *
   * @param GetAssetHistoryInterface
   * @param param
   * @returns CointxHistoryInterface
   */
  getCointxHistory(param: GetAssetHistoryInterface): Observable<ResponseListData<CointxHistoryInterface[]>> {
    return this.get(`${this.assetHistoryUrl}/cointx`, param);
  }

  /**
   * 法币存款/提款交易
   *
   * @param GetAssetHistoryInterface
   * @param param
   * @returns CurrencytxHistoryInterface
   */
  getCurrencytxHistory(param: GetAssetHistoryInterface): Observable<ResponseListData<CurrencytxHistoryInterface[]>> {
    return this.get(`${this.assetHistoryUrl}/currencytx`, param).pipe(
      map((x: any) => {
        if (param.category === 'Withdraw') {
          let list: CurrencytxHistoryInterface[] = [];
          let total: number = 0;
          if (x?.data?.list.length) {
            // 部分成功提示
            list = x.data.list.map((item: CurrencytxHistoryInterface) => ({
              ...item,
              statusName:
                item.status === 'Success'
                  ? Number(item.amount).minus(item.fee) > Number(item.receiveAmount)
                    ? this.localeService.getValue('partial_success')
                    : item.statusName
                  : item.statusName,
            }));
            total = x?.data?.total || 0;
          }

          return {
            ...x,
            data: {
              list,
              total,
            },
          };
        }
        return x;
      })
    );
  }

  /**
   * 投注交易记录
   *
   * @param GetWagerHistoryInterface
   * @param param
   * @returns WagerHistoryInterface
   */
  getWagerHistory(param?: GetWagerHistoryInterface): Observable<any> {
    return this.get(`${this.assetHistoryUrl}/wager`, param);
  }

  /**
   * 历史记录状态和对应显示文字
   *
   * @param params
   * @param params.isDeposit
   * @returns StatusListInterface
   */
  getStatusList(params?: { isDeposit: boolean }): Observable<ResponseData<StatusListInterface[]>> {
    return this.get(`${this.assetHistoryUrl}/status`, params);
  }

  /**
   * 划转钱包下拉
   *
   * @returns StatusListInterface
   */
  getTransferSelect(): Observable<ResponseData<Transferwalletselect[]>> {
    return this.get(`${this.assetHistoryUrl}/transferwalletselect`);
  }

  /**
   * 划转记录
   *
   * @param param
   * @returns
   */
  getTransferHistory(param: GetTransferHistoryInterface): Observable<any> {
    return this.get(`${this.assetHistoryUrl}/transfer`, param);
  }

  /**
   * 注交易记录状态和对应显示文字
   *
   * @returns StatusListInterface
   */
  getWagerStatusList(): Observable<any> {
    return this.get(`${this.assetHistoryUrl}/wagerstatus`);
  }

  /**
   * 调账记录
   *
   * @param GetAdjusttxHistoryInterface
   * @param param
   * @returns AdjusttxHistoryInterface
   */
  getAdjusttxHistory(param: GetAdjusttxHistoryInterface): Observable<any> {
    return this.get(`${this.assetHistoryUrl}/adjusttx`, param);
  }

  /**
   *  获取划转
   *
   * @param status 状态(-1全部 0划转成功 1划转失败)
   * @param currency 币种
   * @param fromWallet string(query)	钱包(从)
   * @param toWallet  钱包(至)
   * @param startTime 开始时间
   * @param endTime 结束时间
   * @param page  起始页
   * @param pageSize 每页笔数
   * @param param
   * @returns
   */
  getUserWalletInfor(param: TransferParam) {
    return this.get(`${this.assetHistoryUrl}/transfer`, param);
  }
}
