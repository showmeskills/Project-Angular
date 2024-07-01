import { BaseInterface } from './base.interface';

export interface KycContactInfo {
  email: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface KycRespData extends BaseInterface {
  countryCode: string;
  createTime: string;
  modifyTime: string;
  remark: string;
  status: string;
  type: string;
  value: string;
}

/**查询用户kyc状态 */
export interface KycStatus {
  /**
   * KycPrimary:0, //初级认证
   * KycIntermediat:1, //中级验证
   * KycAdvanced:2, //高级验证
   */
  type: 'KycPrimary' | 'KycIntermediat' | 'KycAdvanced';
  value: string;
  /**认证国家代码 */
  countryCode: string;
  /**验证状态 I = Initial P = Pending S = Passed R = Reject */
  status: string;
  /**备注 */
  remark: string | null;
  /**修改时间 */
  modifyTime: number | null;
  createTime: number;
}

export interface KycLevelInforItem {
  [index: number]: ProcessDetailForEu;
}

export interface ProcessDetailForEu {
  advancedProcessLog: ProcessDetailItem;
  idcardProcessLog: IdEuParams;
  poaProcessLog: PoaEuParams;
  primaryProcessLog: ProcessDetailItem;
  userInfo: ProcessDetailUserInfo;
}
export interface ProcessDetailItem {
  address: string;
  city: string;
  countryCode: string;
  dob: string;
  firstName: string;
  lastName: string;
  zipCode: string;
}
export interface ProcessDetailUserInfo {
  address: string;
  advancedVerificationStatus: string;
  advancedVerificationTime: string;
  birthDay: string;
  city: string;
  clientKey: string;
  entityCountryCode: string;
  entityId: string;
  firstName: string;
  fullName: string;
  idType: string;
  idVerificationRejectReason: string;
  idVerificationStatus: string;
  intermediateVerificationCreateTime: number;
  intermediateVerificationStatus: string;
  intermediateVerificationTime: number;
  lastName: string;
  middleName: string;
  poaVerificationRejectReason: string;
  poaVerificationStatus: string;
  primaryVerificationStatus: string;
  primaryVerificationTime: number;
  rejectReason: string;
  zipCode: string;
  /** 新增字段 1为不通过， 2为通过, null 为未提交过中级 */
  idFileStatus: number | null;
  poaFileStatus: number | null;
}

export interface KycSettingLimit {
  kycLimit: KycSettingsLimit[];
}

export interface KycMemberLimit {
  fiatDepositLimit: string;
  fiatToVirtualLimit: string;
  fiatWithdrawLimit: string;
  kycType: string;
  mid: number;
  virtualDepositLimit: string;
  virtualWithdrawLimit: string;
}

/**
 * KYC外国验证
 * 查询jumio支持的验证类型
 */
export interface KycVerifyCountry extends BaseInterface {
  /**
   * 国家名称 ex:china
   */
  country: string;
  /**
   * 是否支持Id（正面）类型
   */
  idcardAllowed: boolean;
  /**
   * 是否支持Id（背面）类型
   */
  idcardBack: boolean;
  /**
   * 是否支持护照类型
   */
  passportAllowed: boolean;
  /**
   * 是否支持驾照（正面）类型
   */
  driverLicenseAllowed: boolean;
  /**
   * 是否支持驾照（背面）类型
   */
  driverLicenseBack: boolean;
  /**
   * 国家码(3位)
   */
  countryCode: string;
}

export interface KycConfig extends BaseInterface {
  acInforConfig: any;
  cardInfor: any;
  discrible: string;
  header: string;
  id: number;
  status: string;
  time: string;
}

export interface UIpLoadUrl extends BaseInterface {
  url: string;
  fullUrl: string;
}

export interface KycSettingsLimit {
  fiatDepositLimit: string;
  fiatToVirtualLimit: string;
  fiatWithdrawLimit: string;
  kycType: 'KycPrimary' | 'KycIntermediat' | 'KycAdvanced';
  title: string;
  virtualDepositLimit: string;
  virtualWithdrawLimit: string;
}

export interface KycMemberLimit extends BaseInterface {
  fiatDepositLimit: string;
  fiatToVirtualLimit: string;
  fiatWithdrawLimit: string;
  kycType: string;
  mid: number;
  virtualDepositLimit: string;
  virtualWithdrawLimit: string;
}

/** 自定义 当前已经 验证通过的 KYC属性 */
export interface CurrentPassedKycStatus {
  /** 自定义属性 */
  kycStatusName: string;
  /** 0 未验证 1 初 2 中 3 高 */
  level: number;
  /** 当前用户 已 通过的KYC */
  type: 'KycPrimary' | 'KycIntermediat' | 'KycAdvanced';
  value: string;
  /**认证国家代码 */
  countryCode: string;
  /**验证状态 I = Initial P = Pending S = Passed R = Reject */
  status: string;
  /**备注 */
  remark: string | null;
  /**修改时间 */
  modifyTime: number | null;
  createTime: number;
}

/** 活体接口返回 */
export interface LiveCheckConnect extends BaseInterface {
  clientKey: string;
  country: string;
  entityId: string;
  locale: string;
  /** 活体认证 iframe 返回的 url */
  redirectUrl: string;
}

/** 中级海外kyc 认证 */
export interface GlobalIntermediate extends BaseInterface {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  countryCode: string;
  idType: string;
  backsideImage: string;
  frontsideImage: string;
}

/** 初级Eu kyc 认证 */
export interface PrimaryForEuParams extends BaseInterface {
  countryCode: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  idCardNumber?: string;
  dob: string;
  address: string;
  city: string;
  zipCode: string;
  middleName?: string;
  areaCode: string;
  mobile: string;
  otpCode: string;
  smsVoice: boolean;
  email: string;
}

/** 中级Eu ID kyc 认证 */
export interface IdEuParams extends BaseInterface {
  /**地址 */
  address: string;
  /**证件背面照 */
  backsideImage: string;
  /**证件正面照 MimeType */
  backsideImageMimeType?: string;
  callbackGranularity?: string;
  callbackUrl?: string;
  /**国家 */
  country: string;
  customerId?: string;
  /**出生日期 */
  dob?: string;
  enabledFields?: string;
  expiry?: string;
  faceImage?: string;
  faceImageMimeType?: string;
  frontsideImage?: string;
  frontsideImageMimeType?: string;
  fullName?: string;
  firstName?: string;
  idType: string;
  lastName?: string;
  merchantIdScanReference?: string;
  merchantReportingCriteria?: string;
  middleName?: string;
  number?: string;
  personalNumber?: string;
  usState?: string;
  originalFileName?: string;
}
/** 中级Eu POA kyc 认证 */
export interface PoaEuParams extends BaseInterface {
  /**地址 */
  address: string;
  /**城市 */
  city: string;
  /**商户key */
  clientKey: string;
  /**国家 */
  country: string;
  /**idType */
  idType?: string;
  /**networkImgeUrl */
  networkImgeUrl: string;
  /**postalCode */
  postalCode: string;
  /**uid */
  uid: string;
  /**原始文件名 */
  originalFileName?: string;
}

/** 用户kyc状态详情 */
export interface UserVerificationForEu extends BaseInterface {
  address: string;
  advancedVerificationStatus: string;
  advancedVerificationTime: number;
  birthDay: string;
  city: string;
  clientKey: string;
  entityCountryCode: string;
  entityId: string;
  firstName: string;
  fullName: string;
  idType: string;
  idVerificationStatus: string;
  intermediateVerificationCreateTime: number;
  intermediateVerificationStatus: string;
  intermediateVerificationTime: number;
  lastName: string;
  middleName: string;
  poaVerificationStatus: string;
  primaryVerificationStatus: string;
  primaryVerificationTime: number;
  rejectReason: string;
  zipCode: string;
  /** 新增字段 1为不通过， 2为通过, null 为未提交过中级 */
  idFileStatus: number | null;
  poaFileStatus: number | null;
}

/** 用户是否可以 进行高级认证 */
export interface AdvancedAuthForEu extends BaseInterface {
  id: number;
  /** 如何返回 KycAdvanced 可以高级*/
  type: EuAuthType;
}

export type EuAuthType =
  | 'RiskAssessment'
  | 'WealthSource'
  | 'FullAudit'
  | 'ID'
  | 'POA'
  | 'PaymentMethod'
  | 'WealthSourceDocument'
  | 'KycIntermediate'
  | 'KycAdvanced'
  | 'Customize'
  | 'EDD';

export interface UserDocuments extends BaseInterface {
  [key: string]: {
    label: string;
    isSelected: boolean;
    order: number;
    documents: {
      title: string;
      intro: string[];
      uploads: Array<{ url: string; fileType: File | null }>;
      loading: boolean;
      currentIndex: number;
    };
  };
}

export interface KycAdvancedForEu extends BaseInterface {
  id: number;
  moneySources: string[];
  salaryImages: string[];
  selfEmployedIncomeImages: string[];
  savingsImages: string[];
  allowanceImages: string[];
  pensionImages: string[];
  dividendsProfitFromCompanyImages: string[];
  daytradingImages: string[];
  gamblingImages: string[];
  passiveIncomeImages: string[];
  loansMortgagesImages: string[];
  saleOfFinancialAssetsImages: string[];
  salesOfRealEstateOrOtherAssetsImages: string[];
  inheritanceImages: string[];
  donationsImages: string[];
  cryptoMiningImages: string[];
}

export interface SupplymentaryKycAdvancedForEu extends BaseInterface {
  id: string | number | null;
}

/** Edd 提交接口参数 */
export interface EddParams extends BaseInterface {
  monthlySalary: number;
  currency: string;
  employmentStatus: string;
  occupation?: string;
  sourceOfFunds: string;
}

/**驗證提示 */
export interface AuthPromptInputItem extends BaseInterface {
  mode: string;
  title: string;
  cont: string;
  cont2: string;
  btn1: string;
  currentAreaCode: string;
  phoneNum: string;
}
/**poa资料规则 config */
export interface PoaDetailConfig extends BaseInterface {
  title: string;
  detailList: string[];
}

/**kyc资料规则 config */
export interface NoticeConfig extends BaseInterface {
  title: string;
  list: string[];
}
/**kyc资料规则 config */
export interface DetailConfigItem extends BaseInterface {
  icon: string;
  value: string;
}

/**上传资源 params */
export interface CreateIamgeParams extends BaseInterface {
  type: string;
  fileName: string;
}

/**上传资源 返回数据 */
export interface CreateIamgeCallBack extends BaseInterface {
  url: string;
  fullUrl: string;
}

/** level 类型 */
export type KycLevelTye = 'KycPrimary' | 'KycIntermediat' | 'KycAdvanced';

/** businessType 类型 */
export type BusinessTypes = 'EddCreate' | 'KycAdvancedForEuCreate' | 'IDVerification' | 'IDVerificationNoApproved';

/**kyc用户基本信息 */
export interface UserBasicInfor extends BaseInterface {
  uid: string;
  firstName: string;
  lastName: string;
  fullName: string;
  countryCode: string;
  birthday: number;
  city: string;
  zipCode: string;
  address: string;
  email: string;
}

export interface PrimaryKycForm {
  countryCode?: string;
  areaCode?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  email?: string;
  mobile?: string;
}
