import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  AccountInforData,
  DisableEmailParams,
  EnableEmailSubmit,
  SocialListData,
} from '../interfaces/account.interface';
import { VerifyAction, VerifyEmailParam, VerifyGoogleParam, VerifyPhoneParam } from '../interfaces/auth.interface';
import { ResponseData } from '../interfaces/response.interface';
import { defaultAvatarPc } from '../interfaces/settings.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class AccountApi extends BaseApi {
  /** 获取后端版本号 */
  getBackendVersion(): Observable<string> {
    const url = `${environment.apiUrl}/version`;
    return this.get(url);
  }

  /**
   *  获取用户基本信息  /v1/member/account/getuserinfo
   */
  getUserAccountInfor() {
    const url = `${environment.apiUrl}/v1/member/account/getuserinfo`;
    return this.get<ResponseData<AccountInforData>>(url).pipe(
      map(res => {
        if (res?.data) {
          this.localStorageService.localUserInfo = res.data;
          this.sentryService.setUser();
          window.setHotjarUser();
          // 如果是自己上传图片，则返回当前本地上传的
          if (res?.data?.avater?.startsWith('http')) {
            return res;
          } else {
            //通过标识符对筛选符合条件的头像
            const selAvatar: defaultAvatarPc | undefined = this.appService.avatarList.find(
              (v: defaultAvatarPc) => v.idx === res?.data?.avater,
            );
            //如果选中的头像没有获取到，就不替换
            if (selAvatar?.processedUrl) {
              res.data.avater = selAvatar.processedUrl;
            }
          }
        }
        return res;
      }),
    );
  }

  /**
   *  绑定手机第一步 获取唯一识别码（第二步需要）/v1/member/account/verifybindmobile
   *
   * @param password
   * @param googleCode
   */
  postVerifybindmobile(password: string, googleCode?: string) {
    const url = `${environment.apiUrl}/v1/member/account/verifybindmobile`;
    return firstValueFrom(
      this.post(url, {
        password,
        googleCode,
      }),
    );
  }

  /**
   *  绑定手机号  /v1/member/account/bindmobile
   *
   * @param areaCode
   * @param mobileNumber
   * @param uniCode
   * @param otpCode
   * @param smsVoice
   */
  postBindmobile(areaCode: string, mobileNumber: string, uniCode: string, otpCode: string, smsVoice: boolean) {
    const url = `${environment.apiUrl}/v1/member/account/bindmobile`;
    return firstValueFrom(
      this.post(url, {
        areaCode: `${areaCode}`,
        mobile: mobileNumber,
        uniCode,
        otpCode,
        smsVoice: smsVoice,
        otpType: 'BindMobile',
      }),
    );
  }
  /**
   *  修改手机号(第一步)  /v1/member/account/modifybindmobile
   *
   * @param areaCode
   * @param mobileNumber
   * @param password
   * @param googleCode
   * @param otpCode
   */
  postResetPhone(areaCode: string, mobileNumber: string, password: string, googleCode: string, otpCode: string) {
    const url = `${environment.apiUrl}/v1/member/account/modifybindmobile`;
    return firstValueFrom(
      this.post(url, {
        areaCode: areaCode,
        mobile: mobileNumber,
        password,
        googleCode,
        otpCode,
        otpType: 'BindMobile',
        smsVoice: true,
      }),
    );
  }

  /**
   *  解绑手机  /v1/member/account/unbindmobile
   *
   * @param areaCode
   * @param mobileNumber
   * @param password
   * @param googleCode
   * @param otpCode
   */
  postUnboundPhone(areaCode: string, mobileNumber: string, password: string, googleCode: string, otpCode: string) {
    const url = `${environment.apiUrl}/v1/member/account/unbindmobile`;
    return firstValueFrom(
      this.post(url, {
        areaCode,
        mobile: mobileNumber,
        password,
        googleCode,
        otpCode,
        otpType: 'BindMobile',
        smsVoice: true,
      }),
    );
  }

  /**
   * 解绑邮箱
   *
   * @param params 参数
   * @returns
   */
  disabledEmail(params: DisableEmailParams): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/account/unbindemail`;
    return this.post(url, params);
  }

  /**
   * 绑定邮箱第一步
   *
   * @param params.email
   * @param params
   * @returns 返回unicode 值；
   */
  enableEmailFirst(params: { email: string }): Observable<ResponseData<string>> {
    const url = `${environment.apiUrl}/v1/member/account/getemailverifycode`;
    return this.post(url, params);
  }

  /**
   * 绑定手机第二部提交表单
   *
   * @param params
   * @returns
   */
  enableEmailSubmit(params: EnableEmailSubmit): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/account/bindemail`;
    return this.post(url, params);
  }

  /**
   *  绑定谷歌验证器  /v1/member/account/bindgooglevalid
   *
   * @param areaCode
   * @param mobileNumber
   * @param otpCode
   * @param password
   * @param googleCode
   * @param smsVoice
   */
  postBindGoogle(
    areaCode: string,
    mobileNumber: string,
    otpCode: string,
    password: string,
    googleCode: string,
    smsVoice: boolean,
  ) {
    const url = `${environment.apiUrl}/v1/member/account/bindgooglevalid`;
    return firstValueFrom(
      this.post(url, {
        areaCode: `${areaCode}`,
        mobile: mobileNumber,
        otpCode,
        password,
        smsVoice,
        otpType: 'BindGoogleVerify',
        googleCode,
      }),
    );
  }

  /**
   *  解绑谷歌验证器  /v1/member/account/unbindgooglevalid
   *
   * @param areaCode
   * @param mobileNumber
   * @param password
   * @param otpCode
   * @param smsVoice
   */
  postUnboundGoogle(areaCode: string, mobileNumber: string, password: string, otpCode: string, smsVoice: boolean) {
    const url = `${environment.apiUrl}/v1/member/account/unbindgooglevalid`;
    return firstValueFrom(
      this.post(url, {
        areaCode,
        mobile: mobileNumber,
        password,
        otpCode,
        smsVoice,
        otpType: 'BindGoogleVerify',
      }),
    );
  }

  /**
   *  获取谷歌验证码信息  二维码  /v1/member/account/getgooglevalidcode
   *
   */
  postGoogleValiedCode() {
    const url = `${environment.apiUrl}/v1/member/account/getgooglevalidcode`;
    return firstValueFrom(this.post(url, {}));
  }

  /**
   *  修改/添加用户名 (一定步：获取唯一码，第二部需要)  /v1/member/account/verifymodifyusername
   *
   * @param password
   */
  postVerifyUsername(password: string) {
    const url = `${environment.apiUrl}/v1/member/account/verifymodifyusername`;
    return firstValueFrom(
      this.post(url, {
        password,
      }),
    );
  }

  /**
   *  修改/添加用户名   /v1/member/account/modifyusername
   *
   * @param uniCode
   * @param userName
   */
  postResetUserName(uniCode: string, userName: string) {
    const url = `${environment.apiUrl}/v1/member/account/modifyusername`;
    return firstValueFrom(
      this.post(url, {
        uniCode,
        userName,
      }),
    );
  }

  /**
   * 2fa验证otp
   *
   * @param uniCode
   * @param verifyAction
   * @param param 手机验证或谷歌验证
   * @returns
   */
  general2faVerify(
    verifyAction: VerifyAction,
    param: VerifyGoogleParam | VerifyPhoneParam | VerifyEmailParam | null,
  ): Observable<ResponseData<string>> {
    const url = `${environment.apiUrl}/v1/member/auth/general2faverify`;
    return this.post(url, { verifyAction, ...param });
  }

  /**
   * 获取用户社交账号绑定信息
   *
   * @returns 返回手机号，区号 和 用户社交账号信息
   */
  getSocialList(): Observable<SocialListData | null> {
    const url = `${environment.apiUrl}/v1/member/account/getmembersociallist`;
    return this.get<ResponseData<SocialListData>>(url).pipe(map(x => x?.data || null));
  }
  /**
   * 获取用户社交账号绑定信息
   *
   * @param params
   * @param params.socialUserId 用户社交账号ID
   * @param params.userType 用户社交账号类型
   * @param params.password 用户密码
   * @param params.areaCode 区号
   * @param params.otpCode otp 号码
   * @param params.smsVoice 是否是 音频
   * @param params.otpType otpType 类型
   * @param params.mobile 手机号
   * @returns boolean 值
   */
  socialUserUnbind(params: {
    socialUserId: string;
    userType: 'Google' | 'Telegram' | 'Line' | 'MetaMask';
    password: string;
    areaCode: string;
    otpCode: string;
    smsVoice: boolean;
    otpType: string;
    mobile: string;
  }): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/account/socialuserunbind`;
    return this.post(url, params);
  }
}
