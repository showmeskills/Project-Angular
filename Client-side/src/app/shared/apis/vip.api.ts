import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseData } from '../interfaces/response.interface';
import { UserVipData, VipDetailListData, VipSimpleListData, VipTemplateInfo } from '../interfaces/vip.interface';
import { BaseApi } from './base.api';
@Injectable({
  providedIn: 'root',
})
export class VipApi extends BaseApi {
  /**
   * 查询用户VIP信息
   *
   * @returns UserVipData
   */
  getUserVip(): Observable<UserVipData | null> {
    const url = `${environment.apiUrl}/v1/member/vipa/getuserdetail`;
    return this.get<ResponseData<UserVipData>>(url).pipe(map(x => x?.data || null));
  }

  /**
   * 获取简单的vip每个等级（或指定等级）的信息
   *
   * @param vipLevel VIP等级
   * @param levelId 等级Id
   * @returns VipSimpleListData[]
   */
  getVipSimpleList(vipLevel?: number, levelId?: number): Observable<VipSimpleListData[] | null> {
    const url = `${environment.apiUrl}/v1/member/vipa/getlevelsimplelist`;
    return this.getByCaches<ResponseData<VipSimpleListData[]>>(url, { levelId, vipLevel }).pipe(
      map(x => x?.data || null)
    );
  }

  /**
   * 获取详细的vip每个等级（或指定等级）的信息
   *
   * @param vipLevel VIP级别
   * @param levelId 等级主键
   * @param vipGroupId VIP分组ID
   * @param vipTemplateId 模板ID
   * @param LevelStatus 级别状态 1:无效 2:有效
   * @returns VipDetailListData[]
   */
  getVipDetailList(
    vipLevel?: number,
    levelId?: number,
    vipGroupId?: number,
    vipTemplateId?: number,
    LevelStatus?: number
  ): Observable<VipDetailListData[] | null> {
    const url = `${environment.apiUrl}/v1/member/vipa/getleveldetaillist`;
    return this.getByCaches<ResponseData<VipDetailListData[]>>(url, {
      levelId,
      vipLevel,
      vipGroupId,
      vipTemplateId,
      LevelStatus,
    }).pipe(map(x => x?.data || null));
  }

  /**
   * 获取vip模板详情
   *
   * @param templateId 模板ID
   * @param templateNo 模板编号
   * @returns VipTemplateInfo
   */
  getVipTemplateInfo(templateId?: number, templateNo?: string): Observable<VipTemplateInfo | null> {
    const url = `${environment.apiUrl}/v1/member/vipa/gettemplateinfo`;
    return this.getByCaches<ResponseData<VipTemplateInfo>>(url, { templateId, templateNo }).pipe(
      map(x => x?.data || null)
    );
  }
}
