import { BaseInterface } from './base.interface';

/**
 * Geetest滑动验证返回数据
 */
export interface VerifyData extends BaseInterface {
  captcha_output?: string;
  gen_time?: string;
  lot_number?: string;
  pass_token?: string;
}

/** 验证后定时 */
export const TIMER_MS = 90000;

/** 验证的类型 */
export type VerifyType = 'PHONE' | 'EMAIL' | 'GOOGLE';

/**
 * 2fa和Geetest 验证参数
 */
export type VerifyAction =
  | 'Register'
  | 'Login'
  | 'ResetPwd'
  | 'BindGoogleVerify'
  | 'BindMobile'
  | 'ModifyUserName'
  | 'AddTokenAddress'
  | 'AddBankCard'
  | 'DelBankCard'
  | 'BatchDelBankCard'
  | 'Withdraw'
  | 'DeleteTokenAddress'
  | 'JoinWhiteList'
  | 'RemoveWhiteList'
  | 'WhiteListSwitch'
  | 'UnBindSocial'
  | 'UnBindEmail'
  | 'BindEmail';

/**
 * 发送手机 otp验证参数
 */
export interface SendMobileVerifyParams extends BaseInterface {
  lotNumber?: string;
  captchaOutput?: string;
  passToken?: string;
  genTime?: string;
  areaCode: string;
  mobile: string;
  smsVoice: boolean;
  otpType: VerifyAction;
}

/**
 * 发送邮箱 otp验证参数
 */
export interface SendEmailVerfiyParams extends BaseInterface {
  lotNumber?: string;
  captchaOutput?: string;
  passToken?: string;
  genTime?: string;
  email: string;
  otpType: VerifyAction;
}

/**
 * 手机登录参数
 */
export interface LoginByMobileParams extends BaseInterface {
  lotNumber?: string;
  captchaOutput?: string;
  passToken?: string;
  genTime?: string;
  areaCode: string;
  mobile: string;
  password: string;
  autoLogin: boolean;
  /** 第三方 验证后登录参数 */
  socialUserId?: string;
  /** 第三方 验证后登录参数 */
  socialUserType?: 'Google' | 'MetaMask' | 'Line' | 'Telegram';
}

/** 邮箱登录参数 */
export interface LoginByEmailParams extends BaseInterface {
  lotNumber: string;
  captchaOutput: string;
  passToken: string;
  genTime: string;
  email: string;
  password: string;
  autoLogin: boolean;
  clientName?: string;
}

/**
 * 用户名登录参数
 */
export interface LoginByNameParams extends BaseInterface {
  lotNumber: string;
  captchaOutput: string;
  passToken: string;
  genTime: string;
  userName: string;
  password: string;
  autoLogin: boolean;
}

/**
 * 手机注册
 */
export interface RegisterByMobileParams extends BaseInterface {
  areaCode: string;
  mobile: string;
  password: string;
  otpCode: string;
  smsVoice: boolean;
  referrer?: string;
  aff?: string;
  /**邮箱 */
  email?: string;
  /**社交账号id */
  socialUserId?: string;
  /**社交账号类型 Google, Telegram, MetaMask, Line */
  socialUserType?: string;
}

/** 邮箱注册 */
export interface RegisterByEmailParams extends BaseInterface {
  /** 注册邮箱 */
  email: string;
  /** 密码 */
  password: string;
  otpCode: string;
  referrer?: string;
  clientName?: string;
  aff?: string;
}

/**
 * 用户名注册
 */
export interface RegisterByNameParams extends BaseInterface {
  userName: string;
  password: string;
  validate?: string;
  lotNumber?: string;
  captchaOutput?: string;
  passToken?: string;
  genTime?: string;
  referrer?: string;
  aff: string;
  /**邮箱 */
  email?: string;
}

/**
 * 登录成功后返回用户验证信息
 */
export interface LoginUser extends BaseInterface {
  need2Fa: boolean;
  token: string;
  uniCode: string;
  tFaMobile: boolean;
  mobile: string;
  tFaGoogle: boolean;
  /** 新增 邮件 */
  email: string;
  /** 新增邮件 2fa */
  tFaEmail: boolean;
}

//2fa手机参数
export interface VerifyPhoneParam extends BaseInterface {
  areaCode: string; //手机区号
  mobile: string; //手机号
  otpCode: string; //验证码
  smsVoice: boolean; //是否语音验证
}

//2fa谷歌验证
export interface VerifyGoogleParam extends BaseInterface {
  googleCode: string; //谷歌验证码
}

/** 2fa 邮件验证 */
export interface VerifyEmailParam extends BaseInterface {
  /** 邮箱验证码 */
  emailCode: string;
  /** 邮箱 */
  email: string;
}

/** 登录2fa 回调 geetestData */
export interface GeetestData extends BaseInterface, VerifyPhoneParam, VerifyGoogleParam, VerifyEmailParam {
  verifyType: 'PHONE' | 'GOOGLE' | 'EMAIL';
}

/**
 * Api返回IP地址信息
 */
export interface IpInfo {
  /** 语言code */
  lang: string;
  /** 国家编码 */
  countryCode: string;
  /** 未登录时候 更具IP 获取货币 */
  countryCurrency: string;
  /** 用户ip地址 */
  ip: string;
}

/**
 * 社交媒体登陆参数
 */
export interface SocialUserLoginParam extends BaseInterface {
  /** 下次自动登录 */
  autoLogin?: boolean;
  /** Google新增 socialUserId */
  socialUserId?: string;
  /** MetaMask地址 */
  address?: string;
  /** 接口返回的随机数 */
  nonce?: string;
  /** metamask签字 */
  signature?: string;
  /** google 登录邮箱 */
  socialUserName?: string;
  /** telegram */
  additionalProp?: { [key: string]: string };
  /** Line 返回的信息 */
  code?: string;
  /** Line */
  state?: string;
  /** 选择登陆的社交媒体 */
  userType: 'Google' | 'Telegram' | 'MetaMask' | 'Line';
}

/**
 * 验证登陆接口返回的数据
 */
export interface SocialUserLoginData extends BaseInterface {
  /** 验证是否通过 */
  isVerified: boolean;
  /** 是否注册平台账号 */
  isRegister: boolean;
  /** 第三方id */
  socialUserId: string;
  /** 登录结果 */
  loginResult: Need2Fa;
  /** 选择登陆的社交媒体 */
  socialUserType: 'Google' | 'Telegram' | 'MetaMask' | 'Line';
}

/** 需要 2fa的返回值 */

export interface Need2Fa extends BaseInterface {
  /** 是否需要2Fa */
  need2Fa?: boolean;
  /** 登录成功token(不需要二次验证） */
  token?: string;
  /** 二次验证的唯一码  */
  uniCode?: string;
  /** 手机区号 */
  areaCode?: string;
  /** 手机号码 */
  mobile?: string;
  /** 是否可以手机号码验证 */
  tFaMobile?: boolean;
  /** 是否可以google验证器验证  */
  tFaGoogle?: boolean;
  /** 是否可以邮箱验证 */
  tFaEmail?: boolean;
  /** 邮箱 */
  email?: string;

  /** 自定义属性 */
  hidePhoneNum?: string;
  hideEmailNum?: string;
}

export interface SocialByPass extends BaseInterface {
  /** 第三方id */
  socialUserId: string;
  /** 选择登陆的社交媒体 */
  socialUserType: 'Google' | 'Telegram' | 'MetaMask' | 'Line';
}

/** 邮箱重置密码 */
export interface ResetPwdVerifyByEmailParams extends BaseInterface {
  /** 邮箱验证码 */
  emailCode: string;
  /** 邮箱地址 */
  email: string;
  /** opt 类型 */
  otpType: VerifyAction;
}

/** 邮箱重置返回值 */
export interface ResetPwdVerifyByEmailResponse extends BaseInterface {
  /** 唯一码 */
  uniCode: string;
  /** 账号是否注册 */
  isExisted: boolean;
}
