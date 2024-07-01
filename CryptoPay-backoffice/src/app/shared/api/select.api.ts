import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { Currency } from 'src/app/shared/interfaces/currency';
import { Adjustment, FlowType, PaymentMethod } from 'src/app/shared/interfaces/channel';
import { ApprovalState } from 'src/app/shared/interfaces/agent';
import { GoMoneyCurrency } from 'src/app/shared/interfaces/common.interface';
import {
  AdjustmentType,
  CommonSelect,
  Country,
  GoMoneyMerchant,
  Merchant,
} from 'src/app/shared/interfaces/select.interface';
import { catchError, take } from 'rxjs/operators';
import { CodeName } from 'src/app/shared/interfaces/base.interface';

@Injectable({
  providedIn: 'root',
})
export class SelectApi extends BaseApi {
  private _url = `${environment.apiUrl}/game/select`;
  private _option = `${environment.apiUrl}/option`;
  private _resourceUrl = `${environment.apiUrl}/resource/select`;
  private _asset = `${environment.apiUrl}/asset/asset`;

  private _ = (() =>
    this.setOptions({
      skipThrowError: true,
    }))();

  /**
   * 获取厂商下拉列表
   */
  getProvider(): Observable<any> {
    return this.get<any>(`${this._url}/getplatformgroupselect`);
  }

  /**
   * 取得游戏商下拉选单
   */
  getProviderSelect(type?: any, isTransfer?: boolean, gameStatue?: string): Observable<any> {
    return this.get<any>(`${this._url}/getproviderselect`, {
      providerCategory: type || undefined,
      isTransfer,
      gameStatue,
    });
  }

  /**
   * 游戏标签列表
   */
  getLabelSelect(): Observable<any> {
    return this.get<any>(`${this._url}/getgamelabel`);
  }

  /**
   * 游戏类别
   */
  getCategorySelect(): Observable<any> {
    return this.get<any>(`${this._url}/getprovidercategory`);
  }

  /**
   * 游戏状态
   */
  getStatus(): Observable<any> {
    return this.get<any>(`${this._url}/getstatus`);
  }

  /**
   * 获取司法区域
   */
  getLegalarea(): Observable<any> {
    return this.get<any>(`${this._url}/getlegalarea`);
  }

  /**
   * 获取币种选择列表
   * @param isDigital
   * @param isAll {boolean} 是否返回全部或者开启；默认返回全部
   */
  getCurrencySelect(isDigital: boolean | undefined = undefined, isAll = true): Observable<Currency[]> {
    return this.get<any>(`${this._option}/getsystemcurrency`, { isAll }).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      map((e) => (isDigital === undefined ? e : e.filter((j) => j.isDigital === isDigital)))
    );
  }

  /**
   * 获取商户所支持的币种列表
   */
  getCurrencyListByMerchant(tenantId: any): Observable<any> {
    return this.get<any>(`${this._asset}/gettenantcurrencybytenantid`, { tenantId }).pipe(catchError(() => of([])));
  }

  /**
   * goMoney获取商户列表
   * @param appendAll {boolean} 是否返回全部项
   */
  goMoneyGetMerchant(appendAll?: boolean): Observable<GoMoneyMerchant[]> {
    return this.get<any>(`${this._option}/getMerchants`).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      switchMap((e) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ id: 0, name: all }, ...e] : e))
        )
      )
    );
  }

  /**
   * goMoney获取币种列表
   * @param appendAll {boolean} 是否返回全部项
   * @param showAutoPay
   */
  goMoneyGetCurrencies(appendAll?: boolean, showAutoPay?: boolean): Observable<GoMoneyCurrency[]> {
    return this.get<any>(`${environment.apiUrl}/option/getcurrencies`).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      map((e) => (!showAutoPay ? e?.filter((j) => j.code !== 'Unknown') : e)),
      switchMap((e) =>
        this.langService.get('common.autoAllocation').pipe(
          take(1),
          map((name) =>
            e.map((j) => ({
              ...j,
              ...(j?.['code'] === 'Unknown' ? { name, code: 'Unknown' } : {}),
            }))
          )
        )
      ),
      switchMap((e) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ code: '', name: all }, ...e] : e))
        )
      )
    );
  }

  /**
   * goMoney获取币种类型下拉
   */
  goMoneyGetCurrenciesCategory(): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/option/getcurrenciescategory`).pipe(
      map((e) => (Array.isArray(e) ? e?.filter((j) => j.code !== 'Unknown') : []))
    );
  }

  /**
   * goMoney获取银行下拉
   */
  goMoneyGetBankList(appendAll = false, params?: any): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/bankcode/bankcodeinfo`, {
      ...params,
      pageIndex: 1,
      pageSize: -1,
    }).pipe(
      map((e) => (Array.isArray(e?.list) ? e?.list?.filter((j) => j.code !== 'Unknown') : [])),
      switchMap((e) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ bankCode: '', bankNameLocal: all }, ...e] : e))
        )
      )
    );
  }

  /**
   * goMoney获取支付方式
   * @param appendAll {boolean} 是否返回全部项
   */
  goMoneyGetPaymentMethods(appendAll?: boolean): Observable<PaymentMethod[]> {
    return this.get<AdjustmentType[]>(`${environment.apiUrl}/option/getpaymentmethods`).pipe(
      map((e) => (Array.isArray(e) ? e : ([] as AdjustmentType[]))),
      switchMap((e: AdjustmentType[]) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ code: '', localName: all, enName: 'All' }, ...e] : e)),
          map((e) => e.map((j) => ({ ...j, name: this.langService.isLocal ? j.localName : j.enName })))
        )
      )
    );
  }

  /**
   * 获取子渠道资金流水类型
   */
  goMoneyGetSubChannelFlowType(): Observable<FlowType[]> {
    return this.get<CommonSelect[]>(`${environment.apiUrl}/option/getchannelflowchangetype`).pipe(
      map((e) => (Array.isArray(e) ? e : ([] as CommonSelect[]))),
      map((e) => e.map((j) => ({ ...j, name: this.langService.isLocal ? j.localName : j.enName })))
    );
  }

  /**
   * 获取子渠道资金调账类型、调整原因
   */
  goMoneyGetAdjustmentList(appendAll?: boolean, params?: any): Observable<Adjustment[]> {
    return this.get<CommonSelect[]>(`${environment.apiUrl}/option/getFundingAdjustment`, params).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      switchMap((e) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ code: '', name: all, localName: all, enName: all }, ...e] : e)),
          map((e) => e.map((j) => ({ ...j, name: this.langService.isLocal ? j.localName : j.enName })))
        )
      )
    );
  }

  /**
   * goMoney地区
   * @param appendAll {boolean} 是否返回全部项
   */
  goMoneyGetCountries(appendAll?: boolean): Observable<CodeName[]> {
    return this.get<any>(`${environment.apiUrl}/option/getcountries`).pipe(
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
   * goMoney订单审批状态
   * @param appendAll {boolean} 是否返回全部项
   */
  goMoneyGetOrderStatus(appendAll?: boolean): Observable<ApprovalState[]> {
    return this.get<any>(`${environment.apiUrl}/option/getfinancialorderstatus`).pipe(
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
   * 提款标签列表
   */
  getDrawLabelList(goMoneyMerchantId: number | string, appendAll?: boolean): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/withdrawtab/getallwithdrawtab`, {
      merchantId: goMoneyMerchantId,
    }).pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      switchMap((e) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ id: '', name: all }, ...e] : e))
        )
      )
    );
  }

  /**
   * 新增提款标签列表
   */
  addDrawLabel(goMoneyMerchantId: number, name: string): Observable<any> {
    return this.post<any>(`${environment.apiUrl}/withdrawtab/addwithdrawtab`, {
      merchantId: goMoneyMerchantId,
      name,
    });
  }

  /**
   * 删除提款标签列表
   */
  deleteDrawLabel(id: number): Observable<any> {
    return this.delete<any>(`${environment.apiUrl}/withdrawtab/deletewithdrawtabinfo?id=${id}`);
  }

  /**
   * 获取商户列表
   */
  getMerchantList(filterGB = false): Observable<Merchant[]> {
    // PS:2023-03-06 紧急，需要展示过滤的GB商户
    filterGB = false;

    // 统一下
    const mapData = (data: Merchant[]) => {
      if (data && Array.isArray(data)) {
        return data
          .map((e) => ({
            id: e.id,
            name: e.name,
            value: e.id,
          }))
          .filter((e) => (filterGB ? e.value !== -1 : !0));
      }

      return [];
    };

    return this.get<any>(`${environment.apiUrl}/option/getmerchants`).pipe(map(mapData));
  }

  /**
   * 获取国家清单
   */
  getCountry(): Observable<any> {
    return this.get<any>(`${this._resourceUrl}/getcountry`).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * 获取国家清单拉成一维数组
   */
  getCountryFlat(appendAll?: boolean): Observable<Country[]> {
    return this.getCountry().pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      map((e) => e.map((j) => j.countries || []).flat(Infinity)),
      switchMap((e) =>
        this.langService.get('common.all').pipe(
          take(1),
          map((all) => (appendAll ? [{ countryCode: '', countryName: all }, ...e] : e))
        )
      )
    );
  }

  /**
   * 获取币种列表
   */
  getCurrenciesList(appendAll?: boolean, showAutoPay?: boolean): Observable<any> {
    return this.goMoneyGetCurrencies(appendAll, showAutoPay);
  }
}
