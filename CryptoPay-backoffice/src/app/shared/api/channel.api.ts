import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { IAllocatedListParams, IChannnelConfigParams } from '../interfaces/exchange';
import { IChannelAccountParams } from 'src/app/shared/interfaces/channel_account';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import {
  IGetTranParams,
  ManualDepositParams,
  TransactionItem,
  WithdrawalApprovalItem,
} from 'src/app/shared/interfaces/transaction';
import {
  ChannelAssignLog,
  ChannelAssignLogExportParams,
  ChannelAssignLogParams,
  ChannelSelectItem,
  CurrencyRateAndRange,
  FiatChannelItem,
  FlowParams,
  MainChannelSupportCurrency,
  MerchantChannelAdjustment,
  MerchantChannelAdjustmentParams,
  PayChannelList,
  SubChannelItem,
  WithdrawalTypeEnum,
} from 'src/app/shared/interfaces/channel';
import { OrderState } from 'src/app/shared/interfaces/agent';
import BigNumber from 'bignumber.js';
import { downloadExcelFile, downloadFile } from 'src/app/shared/models/tools.model';
import { OrderCancelReason } from 'src/app/shared/interfaces/financial';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import { CommonSelect } from 'src/app/shared/interfaces/select.interface';
import { FinancialWithdrawStatus } from 'src/app/shared/interfaces/status';

@Injectable({
  providedIn: 'root',
})
export class ChannelApi extends BaseApi {
  private _url = `${environment.apiUrl}`;

  /**
   * 获取渠道列表
   */
  getChannelList(params: IChannnelConfigParams): Observable<PageResponse<FiatChannelItem>> {
    return this.get<any>(`${this._url}/channel/getchannelinfolist`, params);
  }

  /**
   * 获取渠道详情
   */
  getChannelDetail(channelId: string): Observable<any> {
    return this.post<any>(`${this._url}/channel/getchanneldetail?channelId=${channelId}`).pipe(
      map((res) => {
        res.payments = res.payments.map((e) => {
          const data = { ...e };

          data.details = data.details.map((j) => {
            j.feeRate = (j.feeRate * 1e6) / 1e4;
            j.weekDays = j.weekDays || [];
            j.riskControl = j.riskControl || [];
            j.maintenanceEndTime = j.maintenanceEndTime?.split(':').slice(0, 2).join(':') || data.maintenanceEndTime;
            j.maintenanceStartTime =
              j.maintenanceStartTime?.split(':').slice(0, 2).join(':') || data.maintenanceStartTime;

            return j;
          });

          return data;
        });
        return res;
      })
    );
  }

  /**
   * 获取子渠道下的商户列表
   * @param channelAccountId
   * @param merchantIds
   */
  getMerchantBySubChannel(channelAccountId: string): Observable<any[]> {
    return this.get<any>(`${this._url}/channelaccount/getmerchantsbysubchannel`, { channelAccountId });
  }

  /**
   * 添加子渠道商户关联
   * @param channelAccountId
   * @param merchantIds
   */
  addChannelMerchants(channelAccountId: string, merchantIds: number[]): Observable<any> {
    return this.post<any>(`${this._url}/channelaccount/addsubchannelmerchant`, {
      channelAccountId,
      merchantIds,
    });
  }

  /**
   * 删除子渠道与商户关联
   * @param channelAccountId
   * @param merchantIds
   */
  deleteChannelMerchants(channelAccountId: string, merchantIds: number[]): Observable<any> {
    return this.post<any>(`${this._url}/channelaccount/deletesubchannelmerchant`, {
      channelAccountId,
      merchantIds,
    });
  }

  /**
   * 删除渠道商户关联
   */
  updateChannel(params: any): Observable<any> {
    return this.post<any>(`${this._url}/channel/updatechannelinfo`, params);
  }

  /**
   * 获取子渠道账号列表(子账号详情)
   */
  getSubChannelDetail(channelId: string): Observable<any> {
    return this.get<any>(`${this._url}/channelaccount/channelaccountinfosbyid/${channelId}`).pipe(
      map((res) => {
        if (res?.details?.length) {
          res.details.forEach((e) => {
            if (!e) return;
            e?.balanceDetails.forEach((j) => {
              j.feeRate = new BigNumber(+j.feeRate || 0).multipliedBy(100).toNumber() || 0;
            });
          });
        }

        return res;
      })
    );
  }

  /**
   * 子渠道币种配置的列表
   */
  getSubChannelConfig(channelAccountId: string) {
    return this.get<any>(`${this._url}/channelaccount/currencysettings`, { channelAccountId }).pipe(
      map((res) => {
        if (res?.details?.length) {
          res.details.forEach((e) => {
            if (!e) return;
            e?.balanceDetails.forEach((j) => {
              j.feeRate = new BigNumber(+j.feeRate || 0).multipliedBy(100).toNumber() || 0;
            });
          });
        }

        return res;
      })
    );
  }

  /**
   * 子渠道 商户配置
   */
  getSubChannelMerchantInfo(channelAccountId: string) {
    return this.get<any>(`${this._url}/channelaccount/merchantapisettings`, { channelAccountId });
  }

  /**
   * 根据商户获取所有能使用的主渠道（子渠道编辑需要）
   */
  getChannels(merchantId: string | number): Observable<any> {
    return this.get<any>(`${this._url}/option/getchannels`, { merchantId });
  }

  /**
   * 获取渠道支持的支付方式
   * @param channelId {string} 渠道ID
   */
  getChannelSupport(channelId: string): Observable<MainChannelSupportCurrency> {
    return this.get<any>(`${this._url}/channel/getchannelinfobychannelid`, {
      channelId,
    }).pipe(
      map((res) => {
        // Marr: 币种的对象形式 key为小写为了匹配这里转换为大写，转换大写审核功能会出问题 - 2023-04-02
        res.supportedDepositPaymentMethods = Object.keys(res.supportedDepositPaymentMethods || {}).reduce((t, key) => {
          t[key.toUpperCase()] = res.supportedDepositPaymentMethods[key];
          return t;
        }, {} as any);
        res.supportedWithdrawalPaymentMethods = Object.keys(res.supportedWithdrawalPaymentMethods || {}).reduce(
          (t, key) => {
            t[key.toUpperCase()] = res.supportedWithdrawalPaymentMethods[key];
            return t;
          },
          {} as any
        );

        return res;
      })
    );
  }

  /**
   * 更新子渠道
   * @param params {} 更新的数据
   */
  updateSubChannel(params: any): Observable<any> {
    return this.put<any>(`${this._url}/channelaccount/updatecurrencysettings`, params);
  }

  /**
   * 更新子渠道 - 商户信息
   * @param params {} 更新的数据
   */
  updateSubChannelMerchantInfo(params: any): Observable<any> {
    return this.put<any>(`${this._url}/channelaccount/updatemerchantapisettings`, params);
  }

  /**
   * 新增子渠道
   * @param params {} 更新的数据
   */
  addSubChannel(params: any): Observable<any> {
    return this.post<any>(`${this._url}/channelaccount/addchannelaccount`, params);
  }

  /**
   * 获取渠道分配列表
   * @param params
   */
  getAllocatedList(params: IAllocatedListParams): Observable<any> {
    return this.get<any>(`${this._url}/channel/getallocatedlist`, params);
  }

  /**
   * 获取风控设定列表
   */
  getRisk(): Observable<any> {
    return this.get<any>(`${this._url}/option/getriskcontrol`).pipe(
      map((e) => (Array.isArray(e) ? e.filter((j) => j.code !== 'Undefined') : []))
    );
  }

  /**
   * 获取信用等级
   */
  getCredit(): Observable<any> {
    return this.get<any>(`${this._url}/option/getcreditrating`)
      .pipe
      // map(e => Array.isArray(e) ? e.filter(j => j.code !== 'Undefined') : [])
      ();
  }

  /**
   * 获取渠道分配日志
   * @param params
   */
  getChannelLog(params: ChannelAssignLogParams): Observable<PageResponse<ChannelAssignLog>> {
    return this.get<any>(`${this._url}/channel/getchannelallocatedhistory`, params);
  }

  /**
   * 获取渠道所有订单类型
   * @param appendAll
   */
  getChannelStatus(appendAll?: boolean): Observable<any> {
    return this.get<any>(`${this._url}/option/getorderhistorystatus`).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      switchMap((e) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ code: '', name: all }, ...e] : e))
        )
      )
    );
  }

  /**
   * 根据商户 货币 支付类别 支付方式获取可使用的渠道(渠道费用)
   * @param params
   */
  getChannelFee(params: any): Observable<any> {
    return this.get<any>(`${this._url}/channel/getchannelsandfeesinfo`, params);
  }

  /**
   * 添加提款 添加付款申请
   * @param params
   */
  addWithdraw(params: any): Observable<any> {
    return this.post<any>(`${this._url}/financialwithdraw/createfinancialwithdraw`, params);
  }

  /**
   * 提款审批列表
   * @param param
   * @returns
   */
  getReviewWithdrawList(param: any): Observable<PageResponse<WithdrawalApprovalItem>> {
    return this.get<any>(`${environment.apiUrl}/financialwithdraw/getfinancialwithdrawinfolist`, {
      ...param,
    });
  }

  /**
   * 取得子渠道账号列表
   */
  getChannelAccountInfo(params: IChannelAccountParams): Observable<PageResponse<SubChannelItem>> {
    return this.get<any>(`${this._url}/channelaccount/channelaccountinfos`, params);
  }

  /**
   * 获取所有主渠道
   * @param appendAll {boolean}
   * @param showAutoPay
   */
  getAllChannels(appendAll?: boolean, showAutoPay?: boolean): Observable<ChannelSelectItem[]> {
    return this.get<any>(`${this._url}/option/getallchannels`).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      map((e) => (!showAutoPay ? e?.filter((j) => j.code !== 'Undefined') : e)),
      switchMap((e) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ code: '', name: all }, ...e] : e))
        )
      ),
      switchMap((e) =>
        this.langService.get('common.autoAllocation').pipe(
          take(1),
          map((name) =>
            e.map((j) => ({
              ...j,
              name: j?.['code'] === 'Undefined' ? name : j.name,
            }))
          )
        )
      )
    );
  }

  /**
   * 根据商户获取子渠道
   * @param merchantId
   */
  getChannelsByMerchant(merchantId?: number): Observable<any> {
    return this.get<any>(`${this._url}/option/getchanneldetailsnames`, {
      merchantId: merchantId || undefined,
    }).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * 导出子渠道资金流水
   */
  channelaccount_exportchannelaccountflow(params?: any) {
    return this.get<any>(`${this._url}/channelaccount/exportchannelaccountflow`, params, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      responseType: 'blob',
    }).pipe(
      map((res) => {
        if (!res) return false;

        downloadExcelFile(res, `sub-channel-flow-list - ${Date.now()}.xlsx`);

        return true;
      })
    );
  }

  /**
   * 获取出款审批详情
   * @param id
   */
  getWithdrawDetail(id: number | string): Observable<any> {
    return this.get<any>(`${this._url}/financialwithdraw/getfinancialwithdraw`, {
      id,
    }).pipe(
      switchMap((res) => {
        res?.transactionDetails?.forEach((item) => {
          item.paymentCategory = 'Withdraw'; // 会有状态判断这里统一设置为出款
        });

        // const list = res?.transactionDetails || [];
        // const ids = list
        //   .filter(
        //     (e) => this.localStorageService.isGB && ['Allocating', 'Confirming'].includes(e.status) && !e.isDigital
        //   )
        //   .map((e) => e.orderRecordId)
        //   .join(',');

        return of(res);
        // if (!ids.length) return of(res);
        //
        // return (ids ? this.getOrderQueue(ids) : of([])).pipe(
        //   tap(() => this.appService.isContentLoadingSubject.next(false)),
        //   map((orderList) => {
        //     res.transactionDetails = list.map((e) => {
        //       // 组装 订单排队情况
        //       const detail =
        //         (Array.isArray(orderList) && orderList.find((j) => j.id === e.orderRecordId)?.detail) || {};
        //       e.matchCount = detail.matchCount;
        //       e.waitCount = detail.waitCount;
        //
        //       return e;
        //     });
        //
        //     return res; // 返回原始数据
        //   })
        // );
      })
    );
  }

  /**
   * 更新提款审批状态
   * 付款审批 一审
   * @param id
   * @param status
   * @param note
   */
  updateWithdrawStatus(id: number | string, status: FinancialWithdrawStatus, note: string): Observable<any> {
    return this.put<any>(`${this._url}/financialwithdraw/updatefinancialwithdrawstatus`, { id, status, note });
  }

  /**
   * 更新提款审批状态
   * 付款审批 二审
   * @param id
   * @param status
   * @param note
   */
  updateWithdrawStatus2(id: number | string, status: FinancialWithdrawStatus, note: string): Observable<any> {
    return this.put<any>(`${this._url}/financialwithdraw/FinancialWithdrawSecondApprove`, { id, status, note });
  }

  /**
   * 付款申请模板下载
   */
  withdrawDownloadTemplate(category: WithdrawalTypeEnum): Observable<any> {
    // 法币
    if (category === 'Currency') {
      return of(
        downloadFile(
          this.localStorageService.isGB
            ? 'https://d16j89jl5zb4v5.cloudfront.net/glaibo-platform-public-upload-storage/currencytemplate-1654848964999.xlsx'
            : 'https://d16j89jl5zb4v5.cloudfront.net/glaibo-platform-public-upload-storage/currencytemplate-1654848965999.xlsx'
        )
      );
    }

    return this.get<any>(
      `${this._url}/financialwithdraw/templatedownload`,
      {
        category,
      },
      {
        headers: new HttpHeaders({
          lang: this.langService.currentLang?.toLowerCase(),
          Authorization: `Bearer ${this.localStorageService.token}`,
        }),
        responseType: 'blob',
      }
    ).pipe(
      map((res) => {
        if (!res) return false;

        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileName = `withdraw - ${category} ${Date.now()}.xlsx`;
        if (window.navigator['msSaveOrOpenBlob']) {
          navigator['msSaveBlob'](blob, fileName);
        } else {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(link.href);
        }

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * 解析提款审批模板 - 法币
   * @param file
   * @param config
   */
  withdrawExcelParseFiat(file: File, config?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<any>(`${this._url}/financialwithdraw/uploadanddataanalysis`, formData, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      ...config,
    });
  }

  /**
   * 解析提款审批模板 - 虚拟币
   * @param file
   * @param config
   */
  withdrawExcelParseDigital(file: File, config?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<any>(`${this._url}/financialwithdraw/uploadanddataanalysiscoin`, formData, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      ...config,
    });
  }

  /**
   * 解析提款审批模板 - 换汇
   * @param file
   * @param config
   */
  withdrawExcelParseAsset(file: File, config?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<any>(`${this._url}/financialwithdraw/uploadanddatamanualwithdrawal`, formData, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      ...config,
    });
  }

  /**
   * 获取订单排队情况
   * @param params
   */
  getOrderQueue(params: any): Observable<any> {
    return this.get<any>(`${this._url}/order/getorderdistribution`, { ...params });
  }

  /**
   * 获取渠道交易列表
   * @param params
   */
  getChannelTradeList(params: any): Observable<PageResponse<TransactionItem>> {
    return this.get<any>(`${this._url}/order/gettransactionlist`, params).pipe(
      switchMap((res) => {
        const list = res?.list || [];
        const hasQueue = !!list.filter(
          (e) => this.localStorageService.isGB && ['Allocating', 'Confirming'].includes(e.status) /* && !e.isDigital*/
        ).length;

        return (
          hasQueue
            ? this.getOrderQueue({
                status: params.Status || undefined,
                startTime: params.startTime,
                endTime: params.endTime,
              })
            : of([])
        ).pipe(
          tap(() => this.appService.isContentLoadingSubject.next(false)),
          map((orderList) => {
            list.forEach((e) => {
              // 组装 订单排队情况
              const detail = (Array.isArray(orderList) && orderList.find((j) => j.id === e.id)?.detail) || {};
              e.matchCount = detail.matchCount;
              e.waitCount = detail.waitCount;
            });

            return res; // 返回原始数据
          })
        );
      })
    );
  }

  /**
   * 获取渠道交易详细
   * @param params
   */
  getOrderDetail(params: IGetTranParams): Observable<any> {
    return this.get<any>(`${this._url}/order/gettransaction`, params)
      .pipe
      // switchMap((detail) => {
      //   const hasQueue = this.localStorageService.isGB && ['Allocating', 'Confirming'].includes(detail?.status);
      //
      //   return (hasQueue ? this.getOrderQueue(detail.id) : of([])).pipe(
      //     tap(() => this.appService.isContentLoadingSubject.next(false)),
      //     map((orderList) => {
      //       const data = (Array.isArray(orderList) && orderList.find((j) => j.id === detail.id)?.detail) || {};
      //       detail.matchCount = data.matchCount;
      //       detail.waitCount = data.waitCount;
      //
      //       return detail; // 返回原始数据
      //     })
      //   );
      // })
      ();
  }

  /**
   * 获取所有订单类型
   * @param appendAll
   */
  getOrderStatus(appendAll?: boolean): Observable<OrderState[]> {
    return this.get<CommonSelect[]>(`${this._url}/option/getorderstatus`).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      switchMap((e) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ code: '', name: all, localName: all, enName: all }, ...e] : e))
        )
      ),
      map((e) => e.filter((j) => !['Undefined', 'UnKnow'].includes(j.code))),
      map((e) => e.map((j) => ({ ...j, name: this.langService.isLocal ? j.localName : j.enName })))
    );
  }

  /**
   * 重送查询渠道订单 重新查询渠道订单
   * @param id
   */
  resendQueryOrder(id?: any): Observable<any> {
    return this.get<any>(`${this._url}/order/rescanorderonpsp`, { id });
  }

  /**
   * 重送提款订单队列 修改订单状态(添加到渠道提款订单队列)
   * @param id
   */
  resendWithdrawOrder(id?: any): Observable<any> {
    return this.post<any>(`${this._url}/order/resendorderonpsp?id=${id}`);
  }

  /**
   * 重送回调 交易订单重新回调商户接口
   * @param id
   */
  resendCallbackOrder(id?: any): Observable<any> {
    return this.get<any>(`${this._url}/order/renotify`, { id });
  }

  /**
   * 取消提款订单 只有在Allocating状态下才能取消
   * @param params
   */
  sendCancelWithdraw(params: {
    id: number;
    imagePath: string[];
    cancelCategory: OrderCancelReason;
    remark: string;
  }): Observable<any> {
    return this.post<any>(`${this._url}/order/CancelWithdraw`, params);
  }

  /**
   * 冲正撤单 提款类型且成功状态下
   * @param params
   */
  sendRedemption(params: { id: number; receiveAmount: number; imagePath: string[] }): Observable<any> {
    return this.post<any>(`${this._url}/order/orderreverse`, params);
  }

  /**
   * 获取商户所支持的信息和货币（用于商户子渠道资金调账）
   * @param channelAccountId
   */
  getMerchantSupportInfo(channelAccountId?: string): Observable<MerchantChannelAdjustment[]> {
    return this.get<MerchantChannelAdjustment[]>(`${this._url}/channelaccount/getchanneladjustinfos`, {
      channelAccountId,
    });
  }

  /**
   * 获取商户所支持的信息和货币（用于商户子渠道资金调账）
   * @param params
   */
  merchantAdjustment(params: MerchantChannelAdjustmentParams): Observable<boolean | string> {
    return this.post<any>(`${this._url}/order/fundingAdjustment`, params);
  }

  /**
   * 获取子渠道资金流水列表
   * @param params
   */
  subChannelFlow(params: FlowParams): Observable<any> {
    return this.get<any>(`${this._url}/channelaccount/getchannelaccountflow`, params);
  }

  /**
   * 根据商户 货币 支付方式获取可使用的子渠道提款列表
   * @param params
   */
  getSubChannelList(params: any): Observable<PayChannelList[]> {
    return this.get<any>(`${this._url}/channelaccount/getchannelsbymerchant`, params).pipe(
      map((channel) => {
        if (Array.isArray(channel)) {
          this.payService.channelList = channel = channel.map((e) => {
            e['code'] = e.channelAccountId;
            e['name'] = e.channelAccountAlias || '';
            return e;
          });
        }

        return channel;
      })
    );
  }

  /**
   * 根据商户 货币 支付方式获取可使用的子渠道提款列表
   * @param params
   */
  getSubChannelListByDetail(params: any): Observable<any[]> {
    return this.get<any>(`${this._url}/channelaccount/getchanneldetailsbymerchant`, params).pipe(
      map((channel) => {
        if (Array.isArray(channel)) {
          this.payService.channelList = channel = channel.map((e) => {
            e['code'] = e.channelAccountId;
            e['name'] = e.channelAccountAlias || '';
            return e;
          });
        }

        return channel;
      })
    );
  }

  /**
   * 改变订单的子渠道
   * @param params
   */
  changeOrderChannel(params: any): Observable<any> {
    return this.post<any>(`${this._url}/order/changeorderchannel`, {}, { params });
  }

  /**
   * 改变订单的积分
   * @param params
   */
  changeOrderIntegrity(params: any): Observable<any> {
    return this.post<any>(`${this._url}/order/changeorderintegrals`, {}, { params });
  }

  /**
   * 获取积分详情
   * @param params
   */
  getPointDetail(params: any): Observable<any> {
    return this.get<any>(`${this._url}/channelaccount/getpointdetail`, params);
  }

  /**
   * 订单手动核对
   * @param params
   */
  orderManualCheck(params: any): Observable<any> {
    return this.post<any>(`${this._url}/order/manualcheck`, params);
  }

  /**
   * 订单手动上分提交
   * @param params
   */
  orderManualDeposit(params: ManualDepositParams): Observable<any> {
    return this.post<any>(`${this._url}/order/manualdeposit`, params);
  }

  /**
   * 导出订单记录导出
   * @param params
   */
  exportOrderRecord(params: any): Observable<any> {
    return this.get<any>(`${this._url}/order/exporttransactionlist`, params, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      responseType: 'blob',
      throwError: true,
    }).pipe(
      map((res) => {
        if (!res) return false;

        downloadExcelFile(res, `depositAndWithdrawTransaction - ${Date.now()}.xlsx`);

        return true;
      })
    );
  }

  /**
   * 获取币种汇率及存提款区间
   * @param filter {string} 筛选币种的符号(一个或多个（用逗号分隔）)
   */
  getCurrencyRateAndRange(filter: string): Observable<CurrencyRateAndRange[]> {
    return this.get<any>(`${this._url}/exchangeratesetting/getexchangerateandrangesetting`, { filter }).pipe(
      catchError(() => of([]))
    );
  }

  /**
   * 修复虚拟币提款异常状态的订单：psp已经扣款，但是未知原因导致DB保存订单状态异常
   */
  order_tryfixwithdraworder(merchantId: number, withdrawOrderId: string) {
    return this.post<boolean>(`${this._url}/order/tryfixwithdraworder`, { merchantId, withdrawOrderId });
  }

  /**
   * 渠道分配日志导出
   */
  exportChannelAllocatedLog(params: ChannelAssignLogExportParams): Observable<any> {
    return this.get<any>(`${this._url}/channel/getchannelallocatedhistoryexport`, params, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
      responseType: 'blob',
    }).pipe(
      map((res) => {
        if (!res) {
          this.appService.showToastSubject.next({ msgLang: 'payment.bankMap.downloadFailed' });
          return false;
        }

        downloadExcelFile(res, `channel-allocated-log - ${Date.now()}.xlsx`);

        return true;
      })
    );
  }
}
