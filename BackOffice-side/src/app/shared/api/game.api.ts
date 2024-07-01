import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import { GameListParams, ProviderParamsForMerchant, ProviderPT, SearchProvider } from '../interfaces/provider';
import { catchError, map } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { PageResponse } from 'src/app/shared/interfaces/base.interface';
import { GameTurnoverParams, gameTurnoverInfos } from '../interfaces/game';

@Injectable({
  providedIn: 'root',
})
export class GameApi extends BaseApi {
  private _url = `${environment.apiUrl}/game`;

  /**
   * 获取商户列表
   */
  getMerchantList(): Observable<any> {
    return this.get<any>(`${environment.apiUrl}/resource/merchant/getmerchant`, { page: 1, pageSize: 999 });
  }

  /**
   * 创建厂商 - 商户管理员
   */
  createProviderForMerchant(params: ProviderParamsForMerchant): Observable<any> {
    return this.post<any>(`${this._url}/createproviderdetail`, params);
  }

  /**
   * 厂商proxy状态更新
   */
  updateProxyStatus(baseId: string): Observable<boolean> {
    return this.post<any>(`${this._url}/updateproxybybaseid`, { baseId }).pipe(
      map((res) => (typeof res === 'boolean' ? res : false)),
      catchError(() => of(false))
    );
  }

  /**
   * 获取厂商详情
   */
  getProviderDetail(id: number): Observable<ProviderParamsForMerchant> {
    return this.get<any>(`${this._url}/getproviderbybaseid`, { id });
  }

  /**
   * 厂商列表
   */
  getProvider(params: SearchProvider): Observable<PageResponse<ProviderPT>> {
    return this.get<any>(`${this._url}/getprovider`, params);
  }

  /**
   * 更新厂商 - 商户管理员
   */
  updateProviderForMerchant(params: ProviderParamsForMerchant): Observable<any> {
    return this.post<any>(`${this._url}/updateproviderbase`, { ...params });
  }

  /**
   * 获取游戏清单
   */
  getGameList(params: GameListParams): Observable<any> {
    const sendData = {};
    Object.keys(params).forEach((key) => {
      if (params[key]) sendData[key] = params[key];
    });

    return this.get<any>(`${this._url}/getgame`, sendData);
  }

  /**
   * 获取游戏详情
   */
  getGameDetail(params: GameListParams): Observable<any> {
    return this.get<any>(`${this._url}/getonegame`, params);
  }

  /**
   * 新增游戏
   */
  createGame(params: any): Observable<any> {
    return this.post<any>(`${this._url}/creategame`, params);
  }

  /**
   * 更新游戏
   */
  updateGame(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updategame`, params);
  }

  /**
   * 更新游戏
   */
  updateGameImages(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updategameimages`, params, { skipToast: true }).pipe(
      catchError((err) =>
        of({
          errorList: Array.isArray(err?.errorList) ? err.errorList : params?.imageInfos?.map((e) => e.imageName) || [],
          success: false,
        })
      )
    );
  }

  /**
   * 下载游戏编辑模板
   */
  downloadGameTemplate(tenantId: any): Observable<any> {
    return this.get<any>(`${this._url}/downtemplate`, { tenantId }, { responseType: 'blob', throwError: true }).pipe(
      map((res) => {
        const dataType = res.type;
        const aDom = document.createElement('a');

        aDom.href = window.URL.createObjectURL(new Blob([res], { type: dataType }));
        aDom.setAttribute('download', 'gameTemplate.xlsx');
        aDom.click();

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * 下载游戏
   */
  downloadGame(parmas: any): Observable<any> {
    return this.get<any>(`${this._url}/downgame`, parmas, { responseType: 'blob', throwError: true }).pipe(
      map((res) => {
        const dataType = res.type;
        const aDom = document.createElement('a');

        aDom.href = window.URL.createObjectURL(new Blob([res], { type: dataType }));
        aDom.setAttribute('download', 'gameList.xlsx');
        aDom.click();

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * 上传表格批量更新游戏
   */
  uploadTemplateUpdateGame(merchantId: any, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<any>(`${this._url}/uploadgamefile?tenantId=${merchantId}`, formData, {
      headers: new HttpHeaders({
        lang: this.langService.currentLang?.toLowerCase(),
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
    });
  }

  /**
   * 获取厂商支持转账制游戏钱包
   */
  getTransferProviderSelect(tenantId: any): Observable<any> {
    return this.get<any>(`${this._url}/gettransferproviderselect`, {
      tenantId,
    });
  }

  /**
   * 获取 每日竞赛模版==> 查询游戏
   */
  getQueryGame(params): Observable<any> {
    return this.get<any>(`${this._url}/querygame`, params);
  }

  /**
   * 更新游戏排序
   */
  updateGameSort(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updategamesort`, params);
  }

  /**
   * 批量暂停游戏
   */
  updateGameOffLine(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updategameoffline`, params);
  }

  /**
   * 批量热门游戏
   */
  updateGameIsHot(params: any): Observable<any> {
    return this.post<any>(`${this._url}/updategameishot`, params);
  }

  /**
   * 保存游戏到标签中
   */
  savegametolabel(params: any): Observable<any> {
    return this.post<any>(`${this._url}/savegametolabel`, params);
  }

  /**
   * 获取游戏列表下拉菜单
   */
  getGameListSelect(params: any): Observable<any> {
    return this.get<any>(`${this._url}/select/getgamelistselect`, params);
  }

  /*****************************************************************************
   *                                奖品管理 - 非粘性奖金配置
   * 文档：https://gbd730.atlassian.net/wiki/spaces/Gaming/pages/2336849954/Non-Sticky+bonus+WIP#3.%E6%B4%BB%E5%8A%A8Activities
   ****************************************************************************/

  /**
   * 排除游戏 - 通过名字搜索游戏
   */
  getgamelistselectbyname(params: any): Observable<any> {
    return this.get<any>(`${this._url}/select/getgamelistselectbyname`, params);
  }

  /**
   * 排除游戏 - 通过游戏名字ids获取游戏列表
   */
  getgamelistbygameids(params: any): Observable<any> {
    return this.post<any>(`${this._url}/getgamelistbygameids `, params);
  }

  /**
   * 排除游戏 - 通过游戏标签ids获取游戏列表
   */
  getgamelistbylabelids(params: any): Observable<any> {
    return this.post<any>(`${this._url}/getgamelistbylabelids`, params);
  }

  /**
   *  排除游戏 - 通过游戏厂商ids获取游戏列表
   */
  getgamelistbyproviderids(params: any): Observable<any> {
    return this.post<any>(`${this._url}/getgamelistbyproviderids`, params);
  }

  /**
   *  排除游戏 - 保存排除游戏
   */
  saveexcludegames(params: any): Observable<any> {
    return this.post<any>(`${this._url}/saveexcludegames`, params);
  }

  /**
   *  排除游戏 - 获取排除游戏
   */
  getexcludegames(params: any): Observable<any> {
    return this.post<any>(`${this._url}/getexcludegames`, params);
  }

  /*****************************************************************************
   *                                奖品管理/优惠券管理 - freespin
   ****************************************************************************/

  /**
   *  适用游戏 - 获取freespin配置
   */
  getgamefreespinconfig(params): Observable<any> {
    return this.get<any>(`${this._url}/getgamefreespinconfig`, params);
  }

  /*****************************************************************************
   *                                第三方游戏管理
   ****************************************************************************/

  /**
   *   获取第三方游戏管理配置
   */
  getGameTurnover(tenantId: any): Observable<{ gameTurnoverInfos: gameTurnoverInfos[] }> {
    return this.get<any>(`${this._url}/getgameturnover`, { tenantId });
  }

  /**
   *   更新第三方游戏管理配置
   */
  updateGameTurnover(params: GameTurnoverParams): Observable<any> {
    return this.post<any>(`${this._url}/updategameturnover`, params);
  }
}
