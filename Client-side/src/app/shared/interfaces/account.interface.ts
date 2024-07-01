import { VerifyAction } from './auth.interface';
import { BaseInterface } from './base.interface';
import { UserSetting } from './settings.interface';

/**
 * 用户基本信息
 */
export interface AccountInforData extends BaseInterface {
  /**头像地址 */
  avater: string;
  /**是否绑定谷歌验证码 */
  isBindGoogleValid: boolean;
  /**是否绑定手机 */
  isBindMobile: boolean;
  /**最后一次登录IP */
  lastLoginIp: string;
  /**最近一次登录时间（时间戳） */
  lastLoginTime: string;
  /**手机号码 */
  mobile: string;
  /**uid */
  uid: string;
  /**用户名 */
  userName: string;
  /**手机区号 */
  areaCode: string;
  /**是否开启提款白名单 */
  hasWhiteList: boolean;
  /** 用户注册 ISO  */
  mobileRegionCode: string;
  /**邮箱 */
  email: string;
  /**地址 */
  address: string;
  /** 第三方 跳过没有密码 */
  hasPassword: boolean;
  /** 是否绑定邮箱 */
  isBindEmail: boolean;
  /** 是否是 vip */
  isVip: boolean;
  /** 是否是 svip */
  isSVip: boolean;
  /** vip 等级 */
  viPGrade: number;
  /** KYC 等级 */
  kycGrade?: 'KycPrimary' | 'KycIntermediat' | 'KycAdvanced';
  /** Kyc 认证的姓名 */
  kycName?: string;
  userSetting: UserSetting;
  /** 用于中级 后区分 用户是否为 亚洲 或者 欧洲用户 */
  isEurope: boolean;
}

export interface VerifyBindMobileData extends BaseInterface {
  data: string;
  message: any;
  success: boolean;
}

export interface GoogleValidCodeData extends BaseInterface {
  manualEntryKey: string;
  qrCodeUrl: string;
}

/** 安全账户社交 list的idea */
export type SocialData = {
  /** socialUserId 社交账号id */
  socialUserId: string | null;
  /** socialUserType 社交媒体类型 */
  socialUserType: 'Google' | 'Telegram' | 'MetaMask' | 'Line';
  /** socialUserName 社交媒体名字 */
  socialUserName: string | null;
  /** 是否已经绑定社交媒体 */
  isBinded: boolean;
};

/** 用户社交账号绑定信息 */
export interface SocialListData extends BaseInterface {
  /** 用户社交媒体信息 */
  socialInfoList: Array<SocialData>;
}

/** 解绑邮箱参数 */
export interface DisableEmailParams extends BaseInterface {
  /** 区号 */
  areaCode: string;
  /** 手机号 */
  mobile: string;
  /** 手机验证码 */
  otpCode: string;
  /** 验证类型 */
  otpType: string;
  /** 手机语言 */
  smsVoice: boolean;
  /** 邮箱验证码 */
  emailCode: string;
}

/** 绑定邮箱第二步 参数 */
export interface EnableEmailSubmit extends BaseInterface {
  uniCode: string;
  areaCode: string;
  mobile: string;
  otpCode: string;
  smsVoice: boolean;
  otpType: VerifyAction;
  password: string;
  email: string;
  emailCode: string;
}

/** 邮箱在安全中心绑定 */
export interface EnableEmailFirstParams extends BaseInterface {
  lotNumber?: string;
  captchaOutput?: string;
  passToken?: string;
  genTime?: string;
  email: string;
}

/**
 * 请求初级验证参数
 */
export interface PostPrimaryParams extends BaseInterface {
  /** 手机区号,已绑定手机则不带 未绑定手机必填 */
  areaCode?: string;
  /** 手机号,已绑定手机则不带 未绑定手机必填 */
  mobile?: string;
  /** otp码, 已绑定手机则不带 未绑定手机必填 */
  otpCode?: string;
  /** otp码,已绑定手机则不带 未绑定手机必填 */
  smsVoice: boolean;
  /** 类型 未绑定手机必填*/
  otpType: string;
  /** 国家代码 未绑定手机必填 */
  countryCode: string;
  /** 全名 必填*/
  fullName?: string;
  /** 出生日期 */
  dob?: string | '';
  /** 地址 */
  address?: string;
  /** 城市 */
  city?: string;
  /** 邮政编号 */
  zipCode?: string;
  /** 名 */
  firstName?: string;
  /** 姓 */
  lastName?: string;
}
