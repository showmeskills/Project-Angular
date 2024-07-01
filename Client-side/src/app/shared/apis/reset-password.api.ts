import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ResponseData } from 'src/app/shared/interfaces/response.interface';
import { environment } from 'src/environments/environment';
import { ResetPwdVerifyByEmailParams, ResetPwdVerifyByEmailResponse } from '../interfaces/auth.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class ResetPassWordApi extends BaseApi {
  /**
   * 重置密码/修改密码
   *
   * @param password
   * @param uniCode
   */
  postResetPwd(password: string, uniCode: string) {
    const url = `${environment.apiUrl}/v1/member/auth/resetpwd`;
    return this.post(url, {
      uniCode: uniCode,
      password: password,
    });
  }

  /**
   * 找回密码验证手机OtpCode
   *
   * @param areaCode
   * @param mobileNumber
   * @param otpCode
   * @param smsVoice
   */
  postResetOpt(areaCode: string, mobileNumber: string, otpCode: string, smsVoice: boolean) {
    // for test
    const url = `${environment.apiUrl}/v1/member/auth/resetpwdmobileverify`;
    return firstValueFrom(
      this.post(url, {
        areaCode: `${areaCode}`,
        mobile: mobileNumber,
        otpCode: otpCode,
        smsVoice: smsVoice,
        otpType: 'ResetPwd',
      })
    );
  }

  /**
   * 重置密码通过 邮箱获取验证码
   *
   * @param param
   * @returns
   */
  onResetPwdVerifyByEmail(param: ResetPwdVerifyByEmailParams): Observable<ResponseData<ResetPwdVerifyByEmailResponse>> {
    const url = `${environment.apiUrl}/v1/member/auth/resetpwdemailverify`;
    return this.post(url, param);
  }

  /**
   * 已登录修改密码
   *
   * @param oldPwd  旧密码
   * @param newPwd  新密码
   * @returns
   */
  modifyPassword(oldPwd: string, newPwd: string) {
    const url = `${environment.apiUrl}/v1/member/account/modifypassword`;
    return firstValueFrom(
      this.post(url, {
        oldPassword: oldPwd,
        newPassword: newPwd,
      })
    );
  }

  /**
   * 第三方验证登录后 首次设置密码
   *
   * @param params.newPassword 新密码
   * @param params
   * @returns boolean值
   */
  onSetPassword(params: { newPassword: string }): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/account/setpassword`;
    return this.post(url, params);
  }
}
