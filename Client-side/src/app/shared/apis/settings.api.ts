import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ISetDefaultCurrency, setLangParams, setNoticeType } from 'src/app/shared/interfaces/settings.interface';
import { environment } from 'src/environments/environment';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class SettingsApi extends BaseApi {
  /**
   * 设定用户偏好抵用金
   *
   * @param param 是否开启参数
   * @param param.isEnable
   * @returns
   */
  setModifyCredit(param: { isEnable: boolean }): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/member/account/modifycredit`;
    return this.post(url, param).pipe(map((x: any) => x?.data || false));
  }

  //获取会员站内信设定
  getNoticeConfig(): Observable<any> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/getnoticeconfig`;
    return this.get(url);
  }

  /**
   * @param params
   * @setUserDefaultCurrency 用户设置默认货币
   * @retrun  boolean
   */
  setUserDefaultCurrency(params: ISetDefaultCurrency): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/member/account/setdefaultcurrency`;
    return this.post(url, params).pipe(map((x: any) => x?.data || null));
  }

  /**
   * @param params
   * @param params.oddsFormat
   * @modifyOddsFormat 设定用户偏好赔率格式
   * @params 设置赔率参数
   * @returns boolean
   */
  modifyOddsFormat(params: { oddsFormat: string }): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/member/account/modifyoddsformat`;
    return this.post(url, params).pipe(map((x: any) => x?.data || false));
  }
  /**
   * 设定用户偏好视图格式
   *
   * @param params
   * @param params.viewFormat
   * @params 设置是图片偏好的参数
   * @returns boolean
   */
  modifyViewFormat(params: { viewFormat: 'asia' | 'euro' | string }): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/member/account/modifyviewformat`;
    return this.post(url, params).pipe(map((x: any) => x?.data || false));
  }

  /**
   * @param params
   * @setNoticeLang 设定通知语言
   * @params 设置语言参数
   */
  setNoticeLang(params: setLangParams): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/setnoticelanguage`;
    return this.post(url, params).pipe(map((x: any) => x?.data));
  }

  /**
   * @param params
   * @setReceiveNoticeTypeList 设定接收通知类型
   * @params 设置通知类型参数
   */
  setReceiveNoticeTypeList(params: setNoticeType): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/sitemail/usernotice/setreceivenoticetypelist`;
    return this.post(url, params).pipe(map((x: any) => x?.data));
  }

  // /**
  //  * @param fileName
  //  * @createUpLoadUrl 创建转入申请 图片
  //  * @fileName 文件路径
  //  */
  // createUpLoadUrl(fileName?: string) {
  //   const url = `${environment.apiUrl}/v1/resource/upload/createuploadurl`;
  //   const params: any = {
  //     type: 'User',
  //     fileName: fileName,
  //   };
  //   return firstValueFrom(this.post(url, params));
  // }

  /**
   * 设置用户隐身模式
   *
   * @param mode 设置类型
   */
  setInvisibleMode(mode: 'ShowUserName' | 'ShowUid' | 'Invisibility' | ''): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/member/account/modifyinvisibilitymode`;
    const param = {
      invisibilityMode: mode,
    };
    return this.post(url, param).pipe(map((x: any) => x?.data || false));
  }

  /**
   * 设置用户默认语言
   *
   * @param params
   * @param params.language
   * @returns
   */
  setDefaultLang(params: { language: string }): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/member/account/setdefaultlanguage`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(v => v?.data));
  }
}
