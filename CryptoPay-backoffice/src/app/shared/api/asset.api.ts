import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  CurrencyCreateParams,
  CurrencyParams,
  TenantCurrency,
  UpdateCurrencyParams,
  UpdateCurrencyStatusParams,
} from '../interfaces/currency';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AssetApi extends BaseApi {
  private _url = `${environment.apiUrl}/currency`;
  private _urlAdmin = `${environment.apiUrl}/admin/adminoperateaudit`;

  /**
   * 币别清单
   */
  getCurrencyList(params: CurrencyParams): Observable<TenantCurrency[]> {
    return this.get<TenantCurrency[]>(`${this._url}/getcurrencies`, params).pipe(
      map((res) => (Array.isArray(res) ? res : []))
    );
  }

  /**
   * 更新支付方式
   */
  updatePaymentMethod(params?: any): Observable<any> {
    return this.post<any>(`${this._url}/updatepaymentmethod`, params);
  }

  /**
   * 更新状态
   */
  updateCurrencyState(params: UpdateCurrencyStatusParams): Observable<any> {
    return this.post<any>(`${this._url}/updatestatus`, params);
  }

  /**
   * 删除币别
   */
  deleteCurrencyList(id: number): Observable<any> {
    return this.delete<any>(`${this._url}/deletecurrency`, undefined, {
      params: { id },
    });
  }

  /**
   * 创建币别
   */
  createCurrency(params: CurrencyCreateParams): Observable<any> {
    return this.post<any>(`${this._url}/createcurrency`, params);
  }

  /**
   * 更新币别
   */
  updateCurrency(params: UpdateCurrencyParams): Observable<any> {
    return this.post<any>(`${this._url}/updatecurrency`, params);
  }

  /**
   * 排序币别
   */
  updateSort(merchantId, sortCurrencies: string[]): Observable<any> {
    return this.post<any>(`${this._url}/updatesort`, { merchantId, sortCurrencies });
  }

  /**
   * 获取支付方式列表
   */
  getPayMethodsList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getpaymentmethod`, params);
  }

  /**
   * 获取支付方式详情
   */
  getPayMethodDetail(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getpaymentmethoddetail`, params).pipe(
      tap((res) => {
        // 置顶中文
        if (res?.list?.[0]?.tipsInfo?.length && res?.list?.[0]?.tipsInfo?.some((e) => e.languageCode === 'zh-cn')) {
          res.list[0].tipsInfo.unshift(
            res.list[0].tipsInfo.splice(
              res.list[0].tipsInfo.findIndex((e) => e.languageCode === 'zh-cn'),
              1
            )[0]
          );
        }
      })
    );
  }

  /**
   * 获取调账列表 （废弃）
   */
  getBillList(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getadjusthistory`, params);
  }

  /**
   * 获取调账列表 (新)
   */
  getBillQuery(params: any): Observable<any> {
    return this.get<any>(`${this._urlAdmin}/query`, params);
  }

  /**
   * 修改账户金额
   */
  adjustAccount(params: any): Observable<any> {
    return this.post<any>(`${this._url}/adjustaccount`, params);
  }

  /**
   * 修改账户金额 (新)
   */
  myAddAdjustWallet(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/myaddadjustwallet`, params);
  }

  /**
   * 新增重置手机号码
   */
  myAddResetBindMobile(params: any): Observable<any> {
    return this.post<any>(`${this._urlAdmin}/myaddresetbindmobile`, params);
  }

  /**
   * 检查手机号码是否存在
   */
  checkMobileExist(params: any): Observable<any> {
    return this.get<any>(`${this._urlAdmin}/checkmobileexist`, params);
  }

  /**
   * 获取用户绑定的提款地址信息
   */
  getMemberBindAddress(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getmemberbindaddress`, params);
  }

  /**
   * 获取支付方式管理 标签列表
   */
  getlabellist(tenantId: any): Observable<any> {
    return this.get<any>(`${this._url}/getlabellist`, { tenantId }).pipe(
      map((res) => {
        if (!Array.isArray(res)) return [];

        res.forEach((e) => {
          e.name = e.item.find((j) => j.languageCode === 'zh-cn').name;
        });

        return res;
      })
    );
  }

  /**
   * 新增或修改支付方式管理 标签
   */
  addorupdatelabel(tenantId, labelId, lableInfo): Observable<any> {
    return this.post<any>(`${this._url}/addorupdatelabel`, {
      tenantId,
      labelId,
      lableInfo /*[
        {
          "name": "string",
          "languageCode": "string"
        }
      ]*/,
    });
  }

  /**
   * 删除支付方式管理 标签
   */
  deletelabel(tenantId, labelId): Observable<any> {
    return this.post<any>(`${this._url}/deletelabel`, { tenantId, labelId });
  }

  /**
   * 新增或编辑优惠券 多语言
   */
  addOrupDateExchange(params: any): Observable<any> {
    return this.post<any>(`${this._url}/addorupdateexchange`, params);
  }

  /**
   * 获取优惠券 多语言
   */
  getExchangeDetail(params: any): Observable<any> {
    return this.get<any>(`${this._url}/getexchangedetail`, params);
  }

  /**
   * 支付方式标签排序
   */
  updateLabelSort(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updatepaymentmethodlabelsort`, params);
  }
}
