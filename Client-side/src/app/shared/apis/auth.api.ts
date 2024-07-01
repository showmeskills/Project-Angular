import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  IpInfo,
  LoginByEmailParams,
  LoginByMobileParams,
  LoginByNameParams,
  LoginUser,
  RegisterByEmailParams,
  RegisterByMobileParams,
  RegisterByNameParams,
  SendEmailVerfiyParams,
  SendMobileVerifyParams,
  SocialByPass,
  SocialUserLoginData,
  SocialUserLoginParam,
  VerifyEmailParam,
  VerifyGoogleParam,
  VerifyPhoneParam,
} from '../interfaces/auth.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class AuthApi extends BaseApi {
  /**
   * 获取api 请求token
   *
   * @param iniToken
   * @returns //
   */
  getSetUpToken(iniToken: string): Observable<ResponseData<string> | null> {
    const url = `${environment.apiUrl}/v1/api/auth/setup?s=${encodeURIComponent(iniToken)}`;
    return this.http.get<ResponseData<string> | null>(url, { headers: { 'ngsw-bypass': 'true' } }).pipe(
      catchError(error => {
        this.sentryService.apiError(url, error);
        return of(null);
      }),
    );
  }

  /**
   * 获取验证码设置Id
   *
   * @returns //
   */
  getCaptchaId(): Observable<string> {
    const url = `${environment.apiUrl}/v1/api/auth/getcaptchaid`;
    return this.get<ResponseData<string>>(url, undefined, undefined, () => of(null)).pipe(
      map(result => result?.data ?? ''),
    );
  }

  /**
   * 用户名密码注册
   *
   * @param param
   * @returns //
   */
  userNameRegister(param: RegisterByNameParams): Observable<ResponseData<string>> {
    this.dataCollectionService.addPoint({ eventId: 30008, actionValue1: 1 });
    const url = `${environment.apiUrl}/v1/member/auth/registerbyuserpwd`;
    return this.generateVisitorId(() => {
      return this.post<ResponseData<string>>(url, param).pipe(
        tap(res => {
          if (res?.data) {
            // 注册成功，清空邀请码、Affiliate
            this.localStorageService.inviteCode = null;
            this.localStorageService.myAffiliate = null;
          }
        }),
      );
    });
  }

  /**
   * 手机注册
   *
   * @param param
   * @returns //
   */
  mobileRegister(param: RegisterByMobileParams): Observable<ResponseData<string>> {
    this.dataCollectionService.addPoint({ eventId: 30008, actionValue1: 0 });
    const url = `${environment.apiUrl}/v1/member/auth/registerbymobile`;
    return this.generateVisitorId(() => {
      return this.post<ResponseData<string>>(url, param).pipe(
        tap(res => {
          if (res?.data) {
            // 注册成功，清空邀请码、Affiliate
            this.localStorageService.inviteCode = null;
            this.localStorageService.myAffiliate = null;
          }
        }),
      );
    });
  }

  /**
   * 邮箱注册
   *
   * @param param
   * @returns //
   */
  emailRegister(param: RegisterByEmailParams): Observable<ResponseData<string>> {
    this.dataCollectionService.addPoint({ eventId: 30008, actionValue1: 2 });
    const url = `${environment.apiUrl}/v1/member/auth/registerbyemail`;
    return this.generateVisitorId(() => {
      return this.post<ResponseData<string>>(url, param).pipe(
        tap(res => {
          if (res?.data) {
            // 注册成功，清空邀请码、Affiliate
            this.localStorageService.inviteCode = null;
            this.localStorageService.myAffiliate = null;
          }
        }),
      );
    });
  }

  /**
   * 用户名登录
   *
   * @param param
   * @returns //
   */
  loginByName(param: LoginByNameParams): Observable<ResponseData<LoginUser>> {
    const url = `${environment.apiUrl}/v1/member/auth/loginbyname`;
    return this.generateVisitorId(() => {
      return this.post(url, param);
    });
  }

  /**
   * 发送手机Otp验证
   *
   * @param param
   * @returns //
   */
  sendMobileVerify(param: SendMobileVerifyParams): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/auth/sendmobileverify`;
    return this.post(url, param);
  }

  /**
   * 发送邮箱Otp验证
   *
   * @param param
   * @returns //
   */
  sendEmailVerify(param: SendEmailVerfiyParams): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/auth/sendemailverify`;
    return this.post(url, param);
  }

  /**
   * 手机登录
   *
   * @param param
   * @returns //
   */
  loginByMobile(param: LoginByMobileParams): Observable<ResponseData<LoginUser>> {
    const url = `${environment.apiUrl}/v1/member/auth/loginbymobile`;
    return this.generateVisitorId(() => {
      return this.post(url, param);
    });
  }

  /**
   * 邮箱登录
   *
   * @param param
   * @returns //
   */
  loginByEmail(param: LoginByEmailParams): Observable<ResponseData<LoginUser>> {
    const url = `${environment.apiUrl}/v1/member/auth/loginbyemail`;
    return this.generateVisitorId(() => {
      return this.post(url, param);
    });
  }

  /**
   * 第三方 绑定登录
   *
   * @param params
   * @returns //
   */
  socialUserLoginByMobile(params: LoginByMobileParams): Observable<ResponseData<LoginUser>> {
    const url = `${environment.apiUrl}/v1/member/auth/socialuserbindloginbymobile`;
    return this.generateVisitorId(() => {
      return this.post<ResponseData<LoginUser>>(url, params);
    });
  }

  /**
   * 获取MetaMask认证的Nonce
   *
   * @param address 通过WEB3库获取的地址
   * @returns //
   */
  getNonce(address: string): Observable<ResponseData<string>> {
    return this.get<ResponseData<string>>(`${environment.apiUrl}/v1/member/auth/getmetamasknonce?address=${address}`);
  }

  /**
   * 验证metamask登陆是否成功
   *
   * @param param 社交媒体登陆参数
   * autoLogin 下次自动登录
   * credential 回传凭证 (Request.Form["credential"])
   * token 回传令牌 （Request.Form["g_csrf_token"]）
   * cookiesToken Cookie 令牌 （Request.Cookies["g_csrf_token"])
   * address MetaMask地址
   * nonce
   * signature MetaMask签名信息
   * additionalProp
   * code Line 返回的信息
   * state
   * userType 登录方式 0-google 1-telegram 2-metamask 3-line
   * @returns //
   */
  verifyLogin(param: SocialUserLoginParam): Observable<ResponseData<SocialUserLoginData>> {
    const url = `${environment.apiUrl}/v1/member/auth/socialuserlogin`;
    return this.generateVisitorId(() => {
      return this.post<ResponseData<SocialUserLoginData>>(url, param);
    });
  }

  /**
   * 2fa验证otp
   *
   * @param uniCode
   * @param param 手机验证或谷歌验证
   * @returns //
   */
  post2faVerify(
    uniCode: string,
    param: VerifyGoogleParam | VerifyPhoneParam | VerifyEmailParam | null,
  ): Observable<ResponseData<string>> {
    const url = `${environment.apiUrl}/v1/member/auth/verify2fa`;
    return this.post(url, { uniCode, ...param });
  }

  /**
   *
   * @returns 登出用户
   */
  logout() {
    const url = `${environment.apiUrl}/v1/member/account/logout`;
    return this.post(url);
  }

  /**
   * 修改头像
   *
   * @param params
   * @param params.avatar
   * @returns boolean 或者 null
   */
  modifyAvatar(params: { avatar: string }): Observable<boolean | null> {
    const url = `${environment.apiUrl}/v1/member/account/modifyavatar`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(x => x?.data || null));
  }

  /**
   * 获取当前IP地址信息
   *
   * @returns //
   */
  getIpInfo(): Observable<IpInfo | null> {
    const url = `${environment.apiUrl}/v1/api/auth/getipinfo`;
    return this.get<ResponseData<IpInfo>>(url).pipe(
      map(x => {
        if (x?.data) {
          if (x.data.ip) {
            this.localStorageService.clientIp = x.data.ip;
            this.sentryService.setUser();
          }
          return x.data;
        }
        return null;
      }),
    );
  }

  /**
   * 第三方验证后跳过 绑定和注册
   *
   * @param params 第三方验证后直接登录的参数
   * @returns //
   */
  onSoicalByPass(params: SocialByPass): Observable<string | null> {
    const url = `${environment.apiUrl}/v1/member/auth/registerbysocial`;
    return this.generateVisitorId(() => {
      return this.post<ResponseData<string | null>>(url, params).pipe(map(x => x?.data || null));
    });
  }

  /**
   * 用户安全中心绑定 社交媒体
   *
   * @param params 与社交媒体登录参数保持一致
   * @returns boolean 值
   */
  socialUserBind(params: SocialUserLoginParam): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/account/memberbindsocialuser`;
    return this.post<ResponseData<boolean>>(url, params);
  }

  /**
   * 前置判断并尝试生成本地收费指纹，无论成功失败，都会继续执行业务
   *
   * @param cb 用函数包裹的 原本的业务请求
   * @returns 原请求
   */
  generateVisitorId<T>(cb: () => T): T {
    if (!this.localStorageService.visitorIdPro) {
      // 指纹请求，始终会有返回（10秒超时），成功会返回字符串，不成功会返回null之类
      const fpobs = from(this.fpService.getVisitorData()).pipe(
        map(x => x?.visitorId),
        catchError(() => {
          return of(null);
        }),
      );
      // 发起指纹请求，并在完成后（无论成功或失败）转到传入oobs请求
      return fpobs.pipe(
        switchMap(visitorId => {
          if (visitorId) this.localStorageService.visitorIdPro = visitorId;
          return cb() as Observable<unknown>;
        }),
      ) as T;
    } else {
      // 无需请求指纹，直接转到传入oobs请求
      return cb();
    }
  }
}
