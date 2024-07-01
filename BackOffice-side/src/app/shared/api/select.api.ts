import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { Currency } from 'src/app/shared/interfaces/currency';
import {
  ContinentCountryItem,
  Country,
  Merchant,
  Provider,
  ProviderGroupItem,
} from 'src/app/shared/interfaces/select.interface';
import { catchError } from 'rxjs/operators';
import { GameCategory, GameProviderGroupParams } from 'src/app/shared/interfaces/game';

@Injectable({
  providedIn: 'root',
})
export class SelectApi extends BaseApi {
  private _url = `${environment.apiUrl}/game/select`;
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
   * TODO：tenantId是必传参，在完成所有牵扯功能的测试和上线之前，进行选参调整
   */
  getProviderSelect(
    tenantId?: any,
    type?: GameCategory,
    isTransfer?: boolean,
    gameStatue?: string
  ): Observable<Provider[]> {
    return this.get<any>(`${this._url}/getproviderselect`, {
      tenantId,
      providerCategory: type || undefined,
      isTransfer,
      gameStatue,
    }).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      catchError(() => of([]))
    );
  }

  /**
   * 禁用 - 游戏交易厂商数据 （此接口SportsBook包含SportsBook+Esports）
   */
  getProviderGroupSelect(parmas: GameProviderGroupParams): Observable<ProviderGroupItem[]> {
    return this.get<any>(`${this._url}/getprovidergroupselect`, parmas).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      catchError(() => of([]))
    );
  }

  /**
   * 获取商户列表 - 仅供厂商编辑用
   */
  getProviderBaseSelect(): Observable<string[]> {
    return this.get<any>(`${this._url}/getproviderbaseselect`).pipe(
      map((res) => (Array.isArray(res) ? res : [])),
      catchError(() => of([]))
    );
  }

  /**
   * 游戏标签列表
   */
  getLabelSelect(tenantId: any, type?: GameCategory): Observable<any> {
    return this.get<any>(`${this._url}/getgamelabel`, {
      tenantId,
      providerCategory: type || undefined,
    });
  }

  /**
   * 游戏类别
   */
  getCategorySelect(
    tenantId: any,
    status?: Array<'Maintenance' | 'Online' | 'Offline' | 'None'>,
    category?: GameCategory,
    isExcluded?: boolean | undefined, // 是否可以被排除的游戏类别, true=可以排除，false=不可以排除，undefined=全部
    isFreeSpin?: boolean | null // 查询支持freeSpin的游戏类别
  ): Observable<any> {
    return this.get<any>(`${this._url}/getprovidercategory`, {
      tenantId,
      status: (status || []).join(','),
      category,
      isExcluded,
      isFreeSpin,
    });
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
    return this.get<any>(`${this._resourceUrl}/getsystemcurrency`, { isAll }).pipe(
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
            name: e['description'],
            value: e['code'],
          }))
          .filter((e) => (filterGB ? +e.value !== -1 : !0));
      }

      return [];
    };

    return this.get<any>(`${this._resourceUrl}/getmerchant`).pipe(map(mapData));
  }

  /**
   * 获取国家清单
   */
  getCountry(): Observable<ContinentCountryItem[]> {
    return this.get<any>(`${this._resourceUrl}/getcountry`).pipe(map((e) => (Array.isArray(e) ? e : [])));
  }

  /**
   * 获取国家清单拉成一维数组
   */
  getCountryFlat(appendAll?: boolean): Observable<Country[]> {
    return this.getCountry().pipe(
      map((e) => (Array.isArray(e) ? e : [])),
      map((e) => e.map((j) => j.countries || []).flat(Infinity) as Country[]),
      // 直接使用countryName会自动根据语系来渲染
      map((e) => e.map((j) => ({ ...j, countryName: this.langService.isLocal ? j.countryName : j.countryEnName }))),
      // 判断是否追加"全部"选项
      map((e) =>
        appendAll
          ? [
              {
                countryCode: '',
                countryIso3: '',
                countryName: this.langService.isLocal ? '全部' : 'all',
                countryEnName: 'All',
              },
              ...e,
            ]
          : e
      )
    );
  }
}
