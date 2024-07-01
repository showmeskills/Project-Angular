import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PostPrimaryParams } from '../interfaces/account.interface';
import {
  AdvancedAuthForEu,
  EddParams,
  GlobalIntermediate,
  IdEuParams,
  KycAdvancedForEu,
  KycContactInfo,
  KycMemberLimit,
  KycSettingsLimit,
  KycStatus,
  KycVerifyCountry,
  LiveCheckConnect,
  PoaEuParams,
  PrimaryForEuParams,
  PrimaryKycForm,
  ProcessDetailForEu,
  SupplymentaryKycAdvancedForEu,
  UserBasicInfor,
  UserVerificationForEu,
} from '../interfaces/kyc.interface';
import { ResponseData } from '../interfaces/response.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class KycApi extends BaseApi {
  TANYAN_APPID: string = 'rkLw99xYXDxyAWbc';
  TANYAN_SECRET: string = 'rkLw99xYXDxyAWbc7Fl81c1sA6htijpR';

  get iovationBlackbox(): string {
    let v = '';
    if (window.IGLOO && window.IGLOO.getBlackbox) {
      const o = window.IGLOO.getBlackbox();
      v = (o && o.blackbox) ?? '';
    }
    return encodeURIComponent(v);
  }

  /**
   * 查询用户KYC信息
   */
  getKycContactInfo(): Observable<ResponseData<KycContactInfo>> {
    const url = `${environment.apiUrl}/v1/member/kyc/kycinfo`;
    return this.get(url);
  }

  /**
   * 查询用户KYC限额
   *
   * @returns
   */
  getUserKycSettings(): Observable<Array<KycSettingsLimit>> {
    const url = `${environment.apiUrl}/v1/member/kyc/getkycsettings`;
    return this.get<ResponseData<{ kycLimit: KycSettingsLimit[] }>>(url).pipe(map(v => v?.data?.kycLimit || []));
  }

  /**
   *
   * 取得KYC相关设定 /v1/member/kyc/memberkyclimit
   *
   * @returns
   */
  getMemberKycLimit(): Observable<KycMemberLimit | null> {
    const url = `${environment.apiUrl}/v1/member/kyc/memberkyclimit`;
    return this.get<ResponseData<KycMemberLimit>>(url).pipe(map(v => v?.data || null));
  }

  /**
   * 获取用户KYC状态
   *
   * @returns
   */
  getUserKycStatus(): Observable<KycStatus[]> {
    const url = `${environment.apiUrl}/v1/member/kyc/kyc`;
    // return of<ResponseData<KycStatus[]>>({
    //   success: true,
    //   code: '200',
    //   message: '',
    //   data: [
    //     {
    //       type: 'KycPrimary',
    //       value: '媛媛',
    //       countryCode: 'MO',
    //       status: 'S',
    //       remark: null,
    //       createTime: 1690873722486,
    //       modifyTime: null,
    //     },
    //     {
    //       type: 'KycIntermediat',
    //       value: ' ',
    //       countryCode: 'MO',
    //       status: 'S',
    //       remark: null,
    //       createTime: 1690873957779,
    //       modifyTime: null,
    //     },
    //     {
    //       type: 'KycAdvanced',
    //       value: ' ',
    //       countryCode: 'MO',
    //       status: 'S',
    //       remark: null,
    //       createTime: 1690873957779,
    //       modifyTime: null,
    //     },
    //   ],
    // }).pipe(map(v => v?.data || []));
    return this.get<ResponseData<KycStatus[]>>(url).pipe(map(v => v?.data || []));
  }

  /**
   *  kyc基础认证
   *
   * @param params 初级kyc 参数
   * @returns
   */
  postPrimary(params: PostPrimaryParams): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/kyc/primary`;
    this.dataCollectionService.gtmPush('kyc_basic');
    return this.post(url, {
      ...params,
      iovationBlackbox: this.iovationBlackbox,
    });
  }

  /**
   * kyc中国区中级认证
   *
   * @param name 真实姓名
   * @param idCardNumber 身份证号
   * @param bankCard 银行卡号
   * @param phoneNumber 电话号码
   * @param bankName 银行名称
   * @returns
   */
  postIntermediate(
    name: string,
    idCardNumber: string,
    bankCard: string,
    phoneNumber: string
  ): Promise<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/kyc/intermediate`;
    return firstValueFrom(
      this.post(url, {
        fullName: name,
        idcard: idCardNumber,
        bankcard: String(bankCard).replace(/ /g, ''),
        mobile: phoneNumber,
        iovationBlackbox: this.iovationBlackbox,
      })
    );
  }

  /**
   * 中级验证状态更新接口
   *
   * @param intermediateVerificationStatus  中级验证状态
   * @param verification3rdRefKey 第三方验证关联ID
   * @returns
   */
  updateStatus(intermediateVerificationStatus: any, verification3rdRefKey: any) {
    const url = `${environment.apiUrl}/v1/member/kyc/updatestatus`;
    return firstValueFrom(
      this.post(url, {
        intermediateVerificationStatus,
        verification3rdRefKey,
      })
    );
  }

  /**
   * 发送验证码
   *
   * @param phoneNumber
   * @param phone
   */
  sendSms(phone: string) {
    const url = `${environment.apiUrl}/v1/member/kyc/sendsms`;
    return firstValueFrom(this.get(url, { phone }));
  }

  /**
   * 验证码校验
   *
   * @param phoneNumber
   * @param phone
   * @param smsCode
   * @returns
   */
  verifySms(phone: string, smsCode: string): Promise<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/kyc/verifysms`;
    return firstValueFrom(
      this.post(url, {
        phone,
        smsCode,
      })
    );
  }

  // verifyBankCard(cardNumber: string) {
  //   const timestamp: number = Date.now();
  //   const sign: string = this.generateTANYANSign(timestamp);
  //   console.log('sign init', sign);

  //   const url = `https://api.shumaidata.com/v4/bank_info/query?appid=${this.TANYAN_APPID}&timestamp=${timestamp}&sign=${sign}&bankcard=${cardNumber}`;
  //   return this.get(url);
  // }

  // private generateTANYANSign(timestamp: number): string {
  //   const beforeSign: string = `${this.TANYAN_APPID}&${timestamp}&${this.TANYAN_SECRET}`;
  //   //@ts-ignore
  //   return md5(beforeSign).toString();
  // }

  /**
   * 查询jumio支持的验证类型
   *
   * @param countryCode
   * @returns ResponseData<KycVerifyCountry>
   */
  verifyCountry(countryCode: string): Observable<ResponseData<KycVerifyCountry>> {
    const url = `${environment.apiUrl}/v1/member/kyc/country`;
    return this.get<ResponseData<KycVerifyCountry>>(url, { countryCode });
  }

  // country: string,
  // name?: string,
  // frontImage: string | null,
  // backImage: string | null,
  // idType: string,
  // firstName?: string,
  // lastName?: string

  /**
   * KYC中级验证国外 只是ID
   *
   * @param params
   * @returns
   */
  globalintermediate(params: GlobalIntermediate): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/kyc/globalintermediate`;
    return this.post(url, {
      ...params,
      iovationBlackbox: this.iovationBlackbox,
    });
  }

  // /**
  //  * KYC高级第三方验证
  //  *
  //  * @param fileName 国家代码
  //  * @returns
  //  */
  // createUpLoadUrl(fileName: string = ''): Observable<ResponseData<CreateIamgeCallBack>> {
  //   const url = `${environment.apiUrl}/v1/resource/upload/createuploadurl`;
  //   const params: CreateIamgeParams = {
  //     type: 'Kyc',
  //     fileName: fileName,
  //   };
  //   return this.post(url, params);
  // }

  // /**
  //  * KYC高级第三方api
  //  *
  //  * @param url
  //  * @param body
  //  * @param imgType
  //  * @returns
  //  */
  // putUrl(url: string, body: any, imgType: string) {
  //   const opitons = {
  //     headers: new HttpHeaders({
  //       'Content-Type': `${imgType}`,
  //     }),
  //   };
  //   return this.put(url, body, opitons);
  // }

  /**
   * KYC高级验证
   *
   * @param countryCode 国家代码
   * @param idType      证件类型
   * @param postalCode  邮编
   * @param city        城市
   * @param address     地址
   * @param networkImgeUrl 带地址的证件照
   * @returns
   */
  postAdanced(
    countryCode: string,
    idType: string,
    postalCode: string,
    city: string,
    address: string,
    networkImgeUrl: string
  ): Promise<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/kyc/advanced`;
    return firstValueFrom(
      this.post(url, {
        countryCode: countryCode,
        idType: idType,
        postalCode: postalCode,
        city: city,
        address: address,
        networkImgeUrl: networkImgeUrl,
        iovationBlackbox: this.iovationBlackbox,
      })
    );
  }

  /**
   * 活体人脸 验证
   *
   * @param param 语言参数
   * @param param.locale
   * @returns
   */
  getLiveCheckConnect(param: { locale: string }): Observable<ResponseData<LiveCheckConnect>> {
    const url = `${environment.apiUrl}/v1/member/kyc/getlivecheckconnect`;
    return this.post(url, param);
  }

  /**
   * KYC用户查询认证 EU
   *
   * @returns
   */
  getQueryUserVerificationForEu(): Observable<UserVerificationForEu | null> {
    const url = `${environment.apiUrl}/v1/member/kyc/queryuserverificationforeu`;
    return this.get<ResponseData<UserVerificationForEu>>(url).pipe(map(v => v?.data || null));
  }

  /**
   * kyc审核详情 EU
   *
   * @param params
   * @param kycType 认证类型(0:初级 1:中级 2:高级) 可以拿到我已经的材料状态
   * @param params.kycType
   * @returns
   */
  postProcessdDetailForEu(params: { kycType: number }): Observable<ProcessDetailForEu> {
    const url = `${environment.apiUrl}/v1/member/kyc/processdetailforeu`;
    return this.post<ResponseData<ProcessDetailForEu>>(url, params).pipe(map(v => v?.data || null));
  }

  /**
   * KYC初级认证  EU
   *
   * @param params  PrimaryForEuParams
   */
  postPrimaryForEu(params: PrimaryForEuParams): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/kyc/primaryforeu`;
    this.dataCollectionService.gtmPush('kyc_basic');
    return this.post(url, {
      ...params,
      iovationBlackbox: this.iovationBlackbox,
    });
  }

  /**
   * KYC中级ID认证
   *
   * @param params
   */
  postInterMediatedCardForEu(params: IdEuParams): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/kyc/intermediateidcardforeu`;
    return this.post(url, {
      ...params,
      iovationBlackbox: this.iovationBlackbox,
    });
  }

  /**
   * KYC中级POA认证
   *
   * @param params
   */
  postInterMediatedPoaForEu(params: PoaEuParams): Observable<ResponseData<boolean>> {
    const url = `${environment.apiUrl}/v1/member/kyc/intermediatepoaforeu`;
    return this.post(url, {
      ...params,
      iovationBlackbox: this.iovationBlackbox,
    });
  }
  /*
   * 确定是否可以有高级认证 许可
   * @returns 返回是否可以
   */
  getQueryauthenticateForEu(): Observable<Array<AdvancedAuthForEu>> {
    const url = `${environment.apiUrl}/v1/member/kyc/queryauthenticateforeu`;
    return this.get<ResponseData<Array<AdvancedAuthForEu>>>(url).pipe(map(v => v?.data || []));
  }

  /**
   * 高级EUkyc提交
   *
   * @param params
   * @returns
   */
  onSubmitAdvanceKycEu(params: KycAdvancedForEu): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/member/kyc/kycadvancedforeu`;
    return this.post<ResponseData<boolean>>(url, {
      ...params,
      iovationBlackbox: this.iovationBlackbox,
    }).pipe(map(v => v?.data));
  }

  /**
   * 高级EU Kyc 补充资料上传
   *
   * @param params
   * @returns
   */
  onUploadAdvanceSow(params: SupplymentaryKycAdvancedForEu): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/riskform/riskform/uploadsow`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(v => v?.data));
  }

  /**
   * EDD 问卷调查提交
   *
   * @param params
   * @returns boolean
   */
  onSubmitEdd(params: EddParams): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/riskform/riskform/submitedd`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(v => v?.data));
  }

  /**
   * 获取用户基本信息
   */
  getMemberBasicInfo(): Promise<ResponseData<UserBasicInfor | null>> {
    const url = `${environment.apiUrl}/v1/member/kyc/getmemberbasicinfo`;
    return firstValueFrom(this.get(url));
  }

  /**
   * 保存用户初级kyc信息
   
   * @param params
   * @returns
   */
  onSavePrimaryKycForm(params: PrimaryKycForm): Observable<boolean> {
    const url = `${environment.apiUrl}/v1/member/kyc/cacheprimaryinfo`;
    return this.post<ResponseData<boolean>>(url, params).pipe(map(v => v?.data));
  }

  /**
   * 或用户已提交过的初级KYC
   *
   * @returns
   */
  getSavePrimaryKycForm(): Observable<PrimaryKycForm> {
    const url = `${environment.apiUrl}/v1/member/kyc/getprimarycacheinfo`;
    return this.get<ResponseData<PrimaryKycForm>>(url).pipe(map(v => v?.data));
  }
}
