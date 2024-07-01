import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { BaseApi } from './base.api';
import {
  ActivityCreateStep1,
  ActivityCreateStep2ParentInfo,
  ActivityCreateStep2ParentInfoParams,
  ActivityListItem,
  ActivityListParams,
  ActivityQualificationsParams,
  ActivityQualificationsStep1,
  ActivityQualificationsStep2,
  ActivityQualificationsStep2Params,
  DepositCouponStep3Response,
  GetBonusReleaseRecordListParams,
  GetPrizeListParams,
  GetPrizeSendRecordListParams,
  LuckRecordParams,
  NewContestListItem,
  NonStickyPrizeSendDetailParams,
  NonStickySendDetaiItem,
  Prize,
  PrizeInfo,
  PrizeParams,
  PrizeSendRecord,
  PrizeTypeItem,
  TurntableCreate3,
  TurntableListItem,
  TurntableRecord,
  TurntableRecordPrize,
  TurntableStep1Period,
  TurntableTypeEnum,
  TurntableUpdateStep3TimeParams,
  UpdateCouponCodeParams,
  VipSignInStep3Params,
  VipSignInStep3Response,
} from 'src/app/shared/interfaces/activity';
import { catchError, map } from 'rxjs/operators';
import {
  ActivityResponse,
  ActivityResponsePage,
  JPage,
  JResponse,
  JResponse2,
  QualificationsResponse,
} from 'src/app/shared/interfaces/base.interface';
import { HttpHeaders } from '@angular/common/http';
import { PrizePage } from 'src/app/shared/interfaces/page';
import { ExtraRewardParams } from 'src/app/shared/interfaces/activityExtraReward';
import { FreeSpinStat } from '../interfaces/member.interface';
import { downloadExcelFile } from 'src/app/shared/models/tools.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityAPI extends BaseApi {
  private _bounus = `${environment.apiUrl}/bonus`;
  private _newBonus = `${environment.apiUrl}/newbonus`;
  private _bonus = `${environment.apiUrl}/bonus`;
  private _agent = `${environment.apiUrl}/agent`;
  private _alliance = `${environment.apiUrl}/alliance`;
  private _resource = `${environment.apiUrl}/resource/activity`;
  private _resourcePrize = `${environment.apiUrl}/resource/prize`;
  private _vipA = `${environment.apiUrl}/vipa`;

  /**
   * 获取等级列表
   */
  getVipList(tenantId: any): Observable<Array<{ name: string; value: string }>> {
    return this.get<any>(`${this._vipA}/getactivityqualificationlevellist`, { tenantId }).pipe(
      catchError(() => of({})),
      map((res) => Object.keys(res).map((key) => ({ name: res[key], value: key }))),
      map((res) => {
        // 置顶新用户
        const newUser = res.findIndex((e) => e.value === '-1');

        if (newUser !== -1) {
          res.unshift(res.splice(newUser, 1)[0]);
        }

        return res;
      })
    );
  }

  /**
   * 会员总览 - 竞赛：用户参与活动详情
   */
  getuserjoinnewrank(params: { uid: string; tenantId: number }) {
    return this.get<any>(`${this._resource}/getuserjoinnewrank`, params);
  }

  /*****************************************************************************
   *                                活动流程通用步骤、资格模块
   * 文档：http://gogaming-bonus-sit-100351440.ap-northeast-1.elb.amazonaws.com:3888/doc.html#/default/%E6%96%B0%E7%89%88%E6%A8%A1%E6%9D%BF%E7%AE%A1%E7%90%86%E6%8E%A5%E5%8F%A3/tmpCfgStepOneSaveOrUpdateUsingPOST
   ****************************************************************************/
  /**
   * 获取资格模板 step 2 信息    GET    /api/v1/newbonus/qualifications_getsteptwo
   */
  qualifications_getsteptwo(
    tmpCode: any,
    tenantId: any
  ): Observable<QualificationsResponse<ActivityQualificationsStep2> | undefined> {
    return this.get<any>(`${this._bounus}/qualifications_getsteptwo`, {
      tenantId,
      tmpCode,
    }).pipe(catchError(() => of(undefined)));
  }

  /**
   * 资格模板删除配置    POST    /api/v1/newbonus/qualifications_del
   */
  qualifications_del() {
    return this.post<any>(`${this._bounus}/qualifications_del`);
  }

  /**
   * 资格模板状态变更    POST    /api/v1/newbonus/qualifications_cos
   */
  qualifications_cos(params: ActivityQualificationsParams) {
    return this.post<any>(`${this._bounus}/qualifications_cos`, params);
  }

  /**
   * 资格模板新增或者修改 step 2    POST    /api/v1/newbonus/qualifications_updatesteptwo
   */
  qualifications_updatesteptwo(params: ActivityQualificationsStep2Params) {
    return this.post<any>(`${this._bounus}/qualifications_updatesteptwo`, params);
  }

  /**
   * 资格模板新增或者修改 step 1    POST    /api/v1/newbonus/qualifications_updatestepone
   */
  activityQualificationsStep1(params: ActivityQualificationsStep1): Observable<QualificationsResponse> {
    return this.post<QualificationsResponse>(`${this._bounus}/qualifications_updatestepone`, params);
  }

  /**
   * 新增活动流程通用（第一步）
   */
  activityCreateStep1(params: ActivityCreateStep1): Observable<{ id: number; activityCode: string }> {
    return this.post<any>(`${this._resource}/createactivity`, params);
  }

  /**
   * 更新活动流程通用（第一步）
   */
  activityUpdateStep1(params: ActivityCreateStep1): Observable<{ id: number; activityCode: string }> {
    return this.post<any>(`${this._resource}/updateactivity`, params);
  }

  /**
   * 获取活动流程通用（第一步）
   */
  activityDetailStep1(id: any, tenantId: any): Observable<any> {
    return this.get<any>(`${this._resource}/get`, { id, tenantId });
  }

  /**
   * 获取活动流程通用（第一步） walle的周期接口
   */
  activityDetailStep1Cycle(tmpCode: any, tenantId: any): Observable<QualificationsResponse<TurntableStep1Period>> {
    return this.get<any>(`${this._bounus}/qualifications_getstepone`, { tmpCode, tenantId });
  }

  /*****************************************************************************
   *                                大转盘
   * 文档：http://20.24.35.241:9000/swagger/index.html?urls.primaryName=Backend#/
   ****************************************************************************/

  /**
   * 新增更新转盘活动（第三步）
   * api/v1/newbonus/turntable_setting -> /api/Backend/Turntable/Setting
   */
  turntable_create3(params: TurntableCreate3): Observable<any> {
    return this.post<any>(`${this._newBonus}/turntable_setting`, { turntableActivity: params });
  }

  /**
   * 新增更新转盘活动（第三步）
   * api/v1/newbonus/turntable_setting -> /api/Backend/Turntable/Setting
   */
  turntable_update3(params: TurntableCreate3): Observable<any> {
    return this.put<any>(`${this._newBonus}/turntable_setting`, { turntableActivity: params });
  }

  /**
   * 获取大转盘格子类型根据商户编辑设置（第三步）
   * api/v1/newbonus/turntable_setting -> /api/Backend/Turntable/Setting
   */
  getTurntableType(tenantId: string | number): Observable<TurntableTypeEnum> {
    return this.get<any>(`${this._resource}/getturntabletype`, { tenantId });
  }

  /**
   * 更新转盘活动的时间接口（用于第一步）
   */
  turntable_update3Time(params: TurntableUpdateStep3TimeParams): Observable<any> {
    return this.put<any>(`${this._newBonus}/turntable_activityupdatetime`, params);
  }

  /**
   * 获取大转盘活动设定信息（编辑）
   * api/v1/newbonus/turntable_getactivity -> /api/Backend/Turntable/GetActivity/{activityId}
   */
  turntable_getactivity(activityId: any, params: any): Observable<any> {
    return this.get<any>(`${this._newBonus}/turntable_getactivity/${activityId}`, params);
  }

  /**
   * 更新大转盘活动状态（上架、停止）
   * /api/v1/newbonus/turntable_activityaudit    --》/api/Backend/Audit/ActivityAudit
   */
  turntable_activityaudit(params?: any): Observable<any> {
    return this.post<any>(`${this._newBonus}/turntable_activityaudit`, { ...params });
  }

  /**
   * (这个将会忽略掉，需要数据结合查询)
   * api/v1/newbonus/turntable_getactivities -> /api/Backend/Turntable/GetActivities
   */
  turntable_list(params?: any): Observable<ActivityResponsePage<TurntableListItem[]>> {
    return this.get<any>(`${this._resource}/getlist`, params);
  }

  /**
   * 抽奖记录
   * api/v1/newbonus/turntable_getdrawdetail -> /api/Backend/Turntable/GetDrawDetail
   */
  turntable_getdrawdetail(params: LuckRecordParams): Observable<ActivityResponsePage<TurntableRecord[]>> {
    return this.get<any>(`${this._newBonus}/turntable_getdrawdetail/${params?.activityId || ''}`, params);
  }

  /*****************************************************************************
   *                                存款送活动/新人任务
   * 文档：http://gogaming-bonus-sit-100351440.ap-northeast-1.elb.amazonaws.com:3888/doc.html#/home
   ****************************************************************************/

  /**
   * 新模板 - 分页查询 (Walle)
   */
  newtmp_allpage(params: any): Observable<any> {
    return this.post<any>(`${this._bonus}/newtmp_allpage`, params);
  }

  /**
   * 新模板 - 分页查询 (Tolan)
   */
  getOldBonusList(params: ActivityListParams): Observable<JPage<ActivityListItem>> {
    return this.get<any>(`${this._resource}/getoldbonuslist`, params);
  }

  /**
   * 新模板 - 列表排序查询 (Walle)
   */
  back_queryorder(params: any): Observable<any> {
    return this.post<any>(`${this._bonus}/back_queryorder`, params);
  }

  /**
   * 新模板 - 列表排序查询 (Tolan)
   */
  getoldbonusactivityorderdata(params: any): Observable<any> {
    return this.get<any>(`${this._resource}/getoldbonusactivityorderdata`, params);
  }

  /**
   * 新模板 - 列表排序提交
   */
  back_ordersubmit(params: any): Observable<any> {
    return this.post<any>(`${this._bonus}/back_ordersubmit`, params);
  }

  /**
   * 新模板 - 发放查询 (Walle)
   */
  newtmp_releasepage(params: any): Observable<any> {
    return this.post<any>(`${this._bonus}/newtmp_releasepage`, params);
  }

  /**
   * 新模板 - 发放查询 (Tolan)
   */
  getOldBonusReleaseRecordList(params: GetBonusReleaseRecordListParams): Observable<any> {
    return this.get<any>(`${this._resource}/getoldbonusreleaserecordlist`, params);
  }

  /**
   * 存款活动新增或者修改 step 3
   */
  deposit_stepthree(params: any): Observable<any> {
    return this.post<any>(`${this._bonus}/deposit_stepthree`, params);
  }

  /**
   * 查询存款活动的 step 3
   */
  deposit_getstepthree(params: any): Observable<any> {
    return this.get<any>(`${this._bonus}/deposit_getstepthree`, params);
  }

  /**
   * 新人活动新增或者修改 step 3
   */
  newuser_stepthree(params: any): Observable<any> {
    return this.post<any>(`${this._bonus}/newuser_stepthree`, params);
  }

  /**
   * 查询新人活动的 step 3
   */
  newuser_getstepthree(params: any): Observable<any> {
    return this.get<any>(`${this._bonus}/newuser_getstepthree`, params);
  }

  /*****************************************************************************
   *                                新竞赛活动
   * 文档：https://gbd730.atlassian.net/wiki/spaces/Gaming/pages/2347335779/Tournament
   ****************************************************************************/

  /**
   * step 1 - 活动新增或者修改 (bonus子服务)
   * /api/v1/bonus/newrank_addorupdate_stepone -> /newrank/back/addorupdate/stepone
   */
  newrank_addorupdate_stepone(params): Observable<any> {
    return this.post<any>(`${this._bounus}/newrank_addorupdate_stepone`, params);
  }

  /**
   * step 1 - 活动查询 (bonus子服务)
   * /api/v1/bonus/newrank_get_stepone -> /newrank/back/get/stepone
   */
  newrank_get_stepone(tmpCode, tenantId): Observable<any> {
    return this.get<any>(`${this._bounus}/newrank_get_stepone`, { tmpCode, tenantId });
  }

  /**
   * step 2 - 活动新增或者修改 (bonus子服务)
   * /api/v1/bonus/newrank_addorupdate_stepone -> /newrank/back/addorupdate/stepone
   */
  newrank_addorupdate_steptwo(params): Observable<any> {
    return this.post<any>(`${this._bounus}/newrank_addorupdate_steptwo`, params);
  }

  /**
   * step 2 - 新竞赛名单模板下载 (bonus子服务)
   */
  newrank_download_template(): Observable<any> {
    return this.get<any>(
      `${this._bounus}/file/newrank_download_template`,
      {},
      { responseType: 'blob', throwError: true }
    ).pipe(
      map((res) => {
        const dataType = res.type;
        const aDom = document.createElement('a');

        aDom.href = window.URL.createObjectURL(new Blob([res], { type: dataType }));
        aDom.setAttribute('download', 'memberListTemplate.xlsx');
        aDom.click();

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * step 2 - 通用资格第二步名单模板下载  paul
   */
  step2DownloadUserTemplate(): Observable<any> {
    return this.get<any>(`${this._bounus}/file/download_excel`, {}, { responseType: 'blob', throwError: true }).pipe(
      map((res) => {
        downloadExcelFile(res, 'memberListTemplate.xlsx', res.type);

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * step 2 - 新竞赛名单模板上传 (bonus子服务)
   */
  newrank_import_data(file: any): Observable<any> {
    const data = new FormData();
    data.append('file', file);
    return this.post<any>(`${this._bounus}/newrank_import_data `, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
    });
  }

  /**
   * step 2 - 通用资格第二步名单模板上传 - paul
   */
  step2UploadUserTemplate(file: any): Observable<any> {
    const data = new FormData();
    data.append('file', file);
    return this.post<any>(`${this._bounus}/actmpcfg_import`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
    });
  }

  /**
   * step 2 - 活动查询 (bonus子服务)
   * /api/v1/bonus/newrank_get_stepone -> /newrank/back/get/stepone
   */
  newrank_get_steptwo(tmpCode, tenantId): Observable<any> {
    return this.get<any>(`${this._bounus}/newrank_get_steptwo`, { tmpCode, tenantId });
  }

  /**
   * step 3 - 活动新增或者修改 (bonus子服务)
   * /api/v1/bonus/newrank_addorupdate_stepone -> /newrank/back/addorupdate/stepone
   */
  newrank_addorupdate_stepthree(params): Observable<any> {
    return this.post<any>(`${this._bounus}/newrank_addorupdate_stepthree`, params);
  }

  /**
   * step 3 - 活动查询 (bonus子服务)
   * /api/v1/bonus/newrank_get_stepone -> /newrank/back/get/stepone
   */
  newrank_get_stepthree(tmpCode, tenantId): Observable<any> {
    return this.get<any>(`${this._bounus}/newrank_get_stepthree`, { tmpCode, tenantId });
  }

  /**
   * 活动列表 - 查询 (bonus子服务)
   */
  getnewranklist(params): Observable<JPage<NewContestListItem>> {
    return this.post<any>(`${this._resource}/getnewranklist`, params);
  }

  /**
   * 活动列表 - 活动开启/停止 (bonus子服务)
   */
  newrank_state_update(params): Observable<any> {
    return this.post<any>(`${this._bounus}/newrank_state_update`, params);
  }

  /**
   * 报表详情 - 参与者排行榜 (bonus子服务)
   */
  getnewrankranking(params): Observable<any> {
    return this.post<any>(`${this._resource}/getnewrankranking`, params);
  }

  /**
   * 报表详情 - 参与游戏概况 (bonus子服务)
   */
  getnewrankinjoingamelist(params): Observable<any> {
    return this.post<any>(`${this._resource}/getnewrankinjoingamelist`, params);
  }

  /*****************************************************************************
   *                                存款额外奖励
   ****************************************************************************/
  /**
   * 存款额外奖励 - 新增或者修改
   */
  extraBonus(params: ExtraRewardParams): Observable<JResponse<ExtraRewardParams>> {
    return this.post<any>(`${this._bounus}/eWallet_addorupdateStepthree`, params);
  }

  /**
   * 存款额外奖励
   */
  getExtraBonus(tenantId: number | string, tmpCode: string): Observable<JResponse<ExtraRewardParams>> {
    return this.get<any>(`${this._bounus}/eWallet_getStepthree`, { tenantId, tmpCode });
  }

  /*****************************************************************************
   *                                券码存款
   ****************************************************************************/
  /**
   * 券码存款 - 新增或者修改
   */
  couponCodeStep3(params: DepositCouponStep3Response): Observable<JResponse<DepositCouponStep3Response>> {
    return this.post<any>(`${this._bounus}/coupncodedeposit_stepthree`, params);
  }

  /**
   * 券码存款
   */
  getCouponCodeStep3(tenantId: number | string, tmpCode: string): Observable<JResponse<DepositCouponStep3Response>> {
    return this.get<any>(`${this._bounus}/coupncodedeposit_getstepthree`, { tenantId, tmpCode });
  }

  /**
   * 券码存款 - 更新活动Code
   */
  updateCouponCode(params: UpdateCouponCodeParams): Observable<boolean> {
    return this.post<any>(`${this._resource}/updatecouponcode`, params);
  }

  /*****************************************************************************
   *                                签到活动
   ****************************************************************************/
  /**
   * 签到活动第三步 - 新增或者修改
   */
  vipSignInStep3(params: VipSignInStep3Params): Observable<JResponse<VipSignInStep3Response>> {
    return this.post<any>(`${this._bounus}/vipsignin_stepthree`, params);
  }

  /**
   * 签到活动活动第三步 - 获取详情
   */
  getVipSignInStep3(tenantId: number | string, tmpCode: string): Observable<JResponse<VipSignInStep3Response>> {
    return this.get<any>(`${this._bounus}/vipsignin_getstepthree`, { tenantId, tmpCode });
  }

  /*****************************************************************************
   *                                专属VIP活动
   * 文档：https://gbd730.atlassian.net/wiki/spaces/Gaming/pages/2466677015/VIP+WIP
   ****************************************************************************/
  /**
   * step 2 - 活动新增或者修改
   * /api/v1/bonus/vipexclusive_edit_steptwo -> /actmpcfg/back/vipexclusive/addorupdate/steptwo
   */
  vipexclusive_edit_steptwo(params): Observable<any> {
    return this.post<any>(`${this._bounus}/vipexclusive_edit_steptwo`, params);
  }

  /**
   * step 2 - 活动查询
   * /api/v1/bonus/vipexclusive_query_steptwo -> /actmpcfg/back/vipexclusive/get/steptwo
   */
  vipexclusive_query_steptwo(tmpCode, tenantId): Observable<any> {
    return this.get<any>(`${this._bounus}/vipexclusive_query_steptwo`, { tmpCode, tenantId });
  }

  /**
   * 活动列表：发券审核 - 列表
   * /api/v1/bonus/vipexclusive_backpag -> /activeReleaseDetail/back/page
   */
  vipexclusive_backpag(params): Observable<any> {
    return this.post<any>(`${this._bounus}/vipexclusive_backpage`, params);
  }

  /**
   * 活动列表：发券审核 - 审核
   * /api/v1/bonus/vipexclusive_reviewcallback -> /activeReleaseDetail/back/reviewcallback
   */
  vipexclusive_reviewcallback(params): Observable<any> {
    return this.post<any>(`${this._bounus}/vipexclusive_reviewcallback`, params);
  }

  /**
   * 活动列表：发券 - 通过会员UID发券
   * /api/v1/bonus/vipexclusive_sendprizestousers -> /actmpcfg/back/vipexclusive/get/steptwo
   */
  vipexclusive_sendprizestousers(params): Observable<any> {
    return this.post<any>(`${this._bounus}/vipexclusive_sendprizestousers`, params);
  }

  /**
   * 活动列表：发券 - 通过会员渠道发券
   * /api/v1/bonus/vipexclusive_sendprizestoagency -> /actmpcfg/back/vipexclusive/get/steptwo
   */
  vipexclusive_sendprizestoagency(params): Observable<any> {
    return this.post<any>(`${this._bounus}/vipexclusive_sendprizestoagency`, params);
  }

  /**
   * 活动列表：发券 - 发券模板下载
   * /api/v1/bonus/file/vipexclusive_download -> /actmpcfg/back/excel/download
   */
  vipexclusive_download(): Observable<any> {
    return this.get<any>(
      `${this._bounus}/file/vipexclusive_download`,
      {},
      { responseType: 'blob', throwError: true }
    ).pipe(
      map((res) => {
        downloadExcelFile(res, 'memberListTemplate.xlsx', res.type);

        return true;
      }),
      catchError(() => of(false))
    );
  }

  /**
   * 活动列表：发券 - 发券模板上传
   * /api/v1/bonus/vipexclusive_import -> /actmpcfg/back/excel/import
   *
   */
  vipexclusive_import(file: any): Observable<any> {
    const data = new FormData();
    data.append('file', file);
    return this.post<any>(`${this._bounus}/vipexclusive_import `, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.localStorageService.token}`,
      }),
    });
  }

  /*****************************************************************************
   *                                奖品模块
   ****************************************************************************/

  /**
   * 新增奖品
   * /api/v1/newbonus/prize_setting -> /api/Backend/Prize/Setting
   */
  prize_setting(params?: any): Observable<any> {
    return this.post<any>(`${this._newBonus}/prize_setting`, params);
  }

  /**
   * 更新奖品
   * /api/v1/newbonus/prize_setting -> /api/Backend/Prize/Setting
   */
  update_prize_setting(params?: any): Observable<any> {
    return this.put<any>(`${this._newBonus}/prize_setting`, params);
  }

  /**
   * 奖品编辑
   * /api/v1/newbonus/prize_getprizeinfo -> /api/Backend/Prize/GetPrizeInfo/{prizeId}
   */
  prize_getprizeinfo(params?: any): Observable<any> {
    return this.get<any>(`${this._newBonus}/prize_getprizeinfo/${params?.prizeId}`, {
      merchantId: params?.merchantId,
    });
  }

  /**
   * 获取所有奖品类型
   * /api/v1/newbonus/prize_getprizetypes -> /api/Backend/Prize/GetPrizeTypes
   */
  prize_getprizetypes(merchantId: string | number): Observable<ActivityResponse<PrizeTypeItem[]>> {
    return this.get<any>(`${this._newBonus}/prize_getprizetypes`, {
      merchantId,
      lang: this.langService.currentLang.toLowerCase(),
    }).pipe(
      catchError((err) => {
        console.error(err);
        return of({ data: [], success: true });
      })
    );
  }

  /**
   * 抽奖记录-取得活动下的奖品（名称、ID）
   * /api/v1/newbonus/turntable_getactivityprizes -> /api/Backend/Turntable/GetActivityPrizes/{activityId}
   */
  turntable_getactivityprizes(
    activityId: number,
    merchantId: string | number,
    lang: string
  ): Observable<ActivityResponse<TurntableRecordPrize[]>> {
    return this.get<any>(`${this._newBonus}/turntable_getactivityprizes/${activityId}`, { merchantId, lang }).pipe(
      catchError(() => of({ data: [], success: true }))
    );
  }

  /**
   * 取得指定类型的所有奖品
   * /api/v1/newbonus/prize_getprizesbytype -> /api/Backend/Prize/GetPrizesByType
   */
  prize_getprizesbytype(
    params: GetPrizeListParams
  ): Observable<ActivityResponse<{ prizes: Prize[]; totalCount: number }>> {
    return this.get<any>(`${this._newBonus}/prize_getprizesbytype`, params);
  }

  /**
   * 根据奖品代码获取奖品信息
   * GET /api/v1/newbonus/prize_getprizeinfobycode -> /api/Backend/Prize/GetPrizeInfoByCode
   */
  prize_getprizesbycode(prizeCode: string): Observable<ActivityResponse<PrizeInfo>> {
    return this.get<any>(`${this._newBonus}/prize_getprizeinfobycode/${prizeCode}`);
  }

  /**
   * 取得奖品列表
   * /api/v1/newbonus/prize_getprizes -> /api/Backend/Prize/GetPrizes
   */
  prize_getprizes(params: PrizeParams): Observable<JResponse2<{ prizes: Prize[]; totalCount: number }>> {
    return this.get<any>(`${this._newBonus}/prize_getprizes`, params);
  }

  /**
   * 更新奖品状态（审核、下架）
   * /api/v1/newbonus/prize_setstatus -> /api/Backend/Prize/SetStatus
   */
  prize_setstatus(params?: any): Observable<any> {
    return this.put<any>(`${this._newBonus}/prize_setstatus`, params);
  }

  /**
   * 取得奖品发放记录
   */
  prize_getPrizeSendDetail(
    params?: GetPrizeSendRecordListParams
  ): Observable<ActivityResponse<PrizePage<PrizeSendRecord>>> {
    return this.get<any>(`${this._resourcePrize}/getprizesenddetail`, params);
  }

  /**
   * 非粘性奖金领取名单
   */
  prize_getNonStickyPrizeSendDetail(params?: NonStickyPrizeSendDetailParams): Observable<NonStickySendDetaiItem> {
    return this.get<any>(`${this._resourcePrize}/getnonstickyprizesenddetail`, params);
  }

  /**
   * 奖品/优惠卷 - freeSpin领取名单：统计
   */
  getfreespinbonusstat(tenantId: number, prizeId?: string, tmpCode?: string): Observable<FreeSpinStat> {
    return this.get<any>(`${this._resourcePrize}/getfreespinbonusstat`, { tenantId, prizeId, tmpCode });
  }

  /**
   * 奖品/优惠卷 - freeSpin领取名单：列表
   */
  getfreespinlist(params): Observable<any> {
    return this.get<any>(`${this._resourcePrize}/getfreespinlist`, params);
  }

  /**
   * 奖品/优惠卷 - freeSpin领取名单：查看奖金详情
   */
  getfreespindetail(id: number): Observable<any> {
    return this.get<any>(`${this._resourcePrize}/getfreespindetail`, { id });
  }

  /**
   * 根据信息查询上级信息
   */
  referral_getSuperList(params: ActivityCreateStep2ParentInfoParams): Observable<JPage<ActivityCreateStep2ParentInfo>> {
    return this.post(
      this.appService.merchantService.isFiveMerchant
        ? `${this._alliance}/referral_getSuperList`
        : `${this._agent}/referral_getSuperList`,
      params
    );
  }
}
