import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { appOrWebDomain } from 'src/app/pages/friend/friend.helper';
import { environment } from 'src/environments/environment';
import {
  AgentApplyBody,
  CreateUserApplyBody,
  DefaultLink,
  GetCommissionInviteParams,
  GetCommissionReturnParams,
  GetCommissionTrendParams,
  GetDataViewParams,
  GetList,
  GetListParams,
  GetRelationList,
  GetRelationParams,
  PostCreateLinkBody,
  SetUserApplyBody,
  ShareImg,
  TopOne,
  TopRankParams,
  TopRankRepsonse,
  UpdateRemarkBody,
  UserApplyListParams,
} from '../interfaces/friend.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class FriendApi extends BaseApi {
  //获取默认推荐链接
  getDefault(): Observable<DefaultLink | null> {
    const url = `${environment.apiUrl}/v1/agent/invite/getdefault`;

    return this.get<ResponseData<DefaultLink>>(url).pipe(
      map(x => {
        if (x?.data) {
          const urlStr: string[] = x.data.inviteUrl?.split('/');
          const len = urlStr.length;
          return {
            ...x.data,
            inviteUrl: `${appOrWebDomain()}/${urlStr[len - 1]}`,
          };
        } else {
          return null;
        }
      }),
    );
  }

  //好友数据总览
  getDataView(params: GetDataViewParams): Observable<DataView> {
    const url = `${environment.apiUrl}/v1/agent/friend/dataview`;
    return this.get(url, params, 60 * 1000).pipe(
      map(
        (x: any) =>
          x?.data || {
            count: 0,
            countDiff: 0,
            profit: 0,
            profitDiff: 0,
            reward: 0,
            trading: 0,
            tradingDiff: 0,
          },
      ),
    );
  }
  //好友佣金返还
  getCommissionReturn(params: GetCommissionReturnParams) {
    const url = `${environment.apiUrl}/v1/agent/friend/commissionreturn`;
    return this.get(url, params).pipe(map((x: any) => x?.data || { total: 0, list: [] }));
  }
  //好友推荐返还
  getCommssionInvite(params: GetCommissionInviteParams) {
    const url = `${environment.apiUrl}/v1/agent/friend/commissioninvite`;
    return this.get(url, params).pipe(map((x: any) => x?.data || { list: [], total: 0 }));
  }

  //获取游戏类型
  getGameType(): Promise<ResponseData<Array<{ label: string; code: string }>>> {
    const url = `${environment.apiUrl}/v1/agent/friend/gametypes`;
    return firstValueFrom(this.get(url));
  }

  /**
   * 佣金返还走势
   *
   * @param params 佣金返还走势请求参数
   * @returns
   */
  getCommissionTrend(params: GetCommissionTrendParams) {
    const url = `${environment.apiUrl}/v1/agent/friend/commissiontrend`;
    return firstValueFrom(this.get(url, params));
  }

  //导出佣金返还 暂时不对接
  getExportReturn() {
    const url = `${environment.apiUrl}/v1/agent/friend/exportreturn`;
  }

  //导出推荐返还 暂时不对接
  getExportInvite() {
    const url = `${environment.apiUrl}/v1/agent/friend/exportinvite`;
  }

  //创建推荐链接
  postCreateLink(body: PostCreateLinkBody) {
    const url = `${environment.apiUrl}/v1/agent/invite/create`;
    return firstValueFrom(this.post(url, body));
  }

  /**
   * 推荐链接下好友列表
   *
   * @param params
   * @returns
   */
  getRelation(params: GetRelationParams): Observable<GetRelationList> {
    const url = `${environment.apiUrl}/v1/agent/invite/relation`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x.data;
          const list = data.list.map((item: any) => {
            return {
              ...item,
              time: this.generalService.toFullTimestamp(item.time),
            };
          });
          return {
            ...data,
            list,
          };
        }
        return {
          total: 0,
          list: [],
        };
      }),
    );
  }

  /**
   * 推荐链接列表
   *
   * @param params 推荐链接列表参数
   * @returns
   */
  getList(params: GetListParams): Observable<GetList> {
    const url = `${environment.apiUrl}/v1/agent/invite/list`;
    return this.get<ResponseData<GetList>>(url, params).pipe(
      map(x => {
        if (x?.data) {
          return {
            ...x.data,
            list:
              x?.data?.list
                ?.map(list => {
                  const urlStr: string[] = list?.inviteUrl?.split('/') || [];
                  const len = urlStr.length;
                  return {
                    ...list,
                    inviteUrl: `${appOrWebDomain()}/${urlStr[len - 1]}`,
                  };
                })
                ?.sort((a, b) => Number(b?.isDefault || 0) - Number(a?.isDefault || 0)) || [],
          };
        }

        return { total: 0, list: [] };
      }),
    );
  }

  /**
   * 更新推荐链接备注
   *
   * @param params 更新推荐链接备注参数
   * @returns
   */
  updateRemark(params: UpdateRemarkBody): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/agent/invite/updateremark`;
    return this.post(url, params).pipe(map((x: any) => x?.data || false));
  }

  /**
   * 设置为默认推荐链接
   *
   * @param params
   * @param params.inviteCode
   * @returns
   */
  setDefault(params: { inviteCode: string }): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/agent/invite/setdefault`;
    return this.post(url, params).pipe(map((x: any) => x?.data || false));
  }

  //获取转入申请
  getUserApply(): Observable<{}> {
    const url = `${environment.apiUrl}/v1/agent/friend/getuserapply`;
    return this.get(url).pipe(map((x: any) => x?.data || {}));
  }
  //确认转入申请
  setUserApply(body: SetUserApplyBody) {
    const url = `${environment.apiUrl}/v1/agent/friend/setuserapply`;
    return firstValueFrom(this.post(url, body));
  }
  //联盟代理申请
  agentApply(params: AgentApplyBody) {
    const url = `${environment.apiUrl}/v1/agent/friend/agentapply`;
    return firstValueFrom(this.post(url, params));
  }
  /**
   * 当前登录是否代理
   *
   * @returns boolean 判断用户是否已经加入联盟
   */
  getIsAgent(): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/agent/friend/isagent`;
    return this.get(url).pipe(map((x: any) => x?.data || false));
  }
  /**
   * 转入申请查询
   *
   * @param params
   * @returns
   */
  getUserApplyList(params: UserApplyListParams) {
    const url = `${environment.apiUrl}/v1/agent/friend/userapplylist`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x.data;
          const list = data.list.map((item: any) => {
            return {
              ...item,
              createTime: this.generalService.toFullTimestamp(item.createTime),
              regTime: this.generalService.toFullTimestamp(item.regTime),
            };
          });
          return {
            ...data,
            list,
          };
        }
        return {
          list: [],
          total: 0,
        };
      }),
    );
  }
  // 创建转入申请
  createUserApply(body: CreateUserApplyBody) {
    const url = `${environment.apiUrl}/v1/agent/friend/userapplycreate`;
    return firstValueFrom(this.post(url, body));
  }

  /**
   * 查询转入申请
   *
   * @param params 申请转入发送的参数
   * @returns
   */
  createUserApplyCheck(params: CreateUserApplyBody) {
    const url = `${environment.apiUrl}/v1/agent/friend/userapplycheck`;
    return this.post(url, params).pipe(map((x: any) => x?.data));
  }
  // 创建转入申请 图片
  // createUpLoadUrl(fileName?: string) {
  //   const url = `${environment.apiUrl}/v1/resource/upload/createuploadurl`;
  //   const params: any = {
  //     type: 'Agent',
  //     fileName: fileName,
  //   };
  //   return firstValueFrom(this.post(url, params));
  // }
  // 代理申请状态
  agentApplyStatus() {
    const url = `${environment.apiUrl}/v1/agent/friend/agentapplystatus`;
    return firstValueFrom(this.get(url));
  }

  //获取分享图片
  getShareImg(params: ShareImg) {
    const url = `${environment.apiUrl}/v1/agent/invite/getshareimage`;
    return firstValueFrom(this.get(url, params));
  }

  /**@getCommissionTopYesterday 获取昨日排名*/
  getCommissionTopYesterday(params: TopRankParams): Observable<TopRankRepsonse> {
    const url = `${environment.apiUrl}/v1/agent/friend/commissiontopyesterday`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x?.data as TopRankRepsonse;
          const list = data.list
            .map(info => ({
              ...info,
              avatar: this.avatartDefault.transform(info.avatar),
              name: info.name.length > 0 ? info.name : this.localeService.getValue('invisible'),
            }))
            .sort((a: any, b: any) => a.top - b.top);
          return { ...data, list };
        } else {
          return { total: 0, list: [] };
        }
      }),
    );
  }

  /**@getCommissionTopReal 获取实时排名 */
  getCommissionTopReal(params: TopRankParams): Observable<TopRankRepsonse> {
    const url = `${environment.apiUrl}/v1/agent/friend/commissiontopreal`;
    return this.get(url, params).pipe(
      map((x: any) => {
        if (x?.data) {
          const data = x?.data as TopRankRepsonse;
          const list = data.list
            .map(info => ({
              ...info,
              avatar: this.avatartDefault.transform(info.avatar),
              name: info.name.length > 0 ? info.name : this.localeService.getValue('invisible'),
            }))
            .sort((a: any, b: any) => a.top - b.top);
          return { ...data, list };
        } else {
          return { total: 0, list: [] };
        }
      }),
    );
  }

  /**@getCommissionTopOne  顶级推荐人排行榜-个人排行情况*/
  getCommissionTopOne(): Observable<TopOne> {
    const url = `${environment.apiUrl}/v1/agent/friend/commissiontopone`;
    return this.get(url).pipe(map((x: any) => x?.data || { commission: 0, reward: 0, uId: '' }));
  }
}
