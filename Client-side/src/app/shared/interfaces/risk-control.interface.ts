import { BaseInterface } from './base.interface';

/** 风险评估问卷表单Item */
export type AssesmentItem = {
  order: number;
  /** input attribute */
  label: string;
  input?: boolean;
  unit?: string;
  max?: number;
  type?: 'number' | 'text';
  value: string;
  errorTxt?: string;
  /** drop attribute */
  drop?: boolean;
  optionLists?: Array<{
    name?: string;
    value?: string;
    checked?: boolean;
  }>;
  selectType?: string;
};

/** 财富来源证明表单 */
export type IncomeSourceForm = {
  selectAmount: Item;
  foundSource: Item;
};

/** 财富来源证明表单Item */
export type Item = {
  order?: number;
  /** input attribute */
  label: string;
  input?: boolean;
  unit?: string;
  max?: number;
  type?: 'number' | 'text';
  value: string;
  errorTxt?: string;
  /** drop attribute */
  drop?: boolean;
  optionLists: Array<{
    name: string;
    value: string;
    checked?: boolean;
  }>;
  selectType?: string;
  btmText?: string;
  /** customzie item */
  customItem?: boolean;
};

export type UploadItem = {
  label: string;
  order?: number;
  value: string;
  /** 上传 区域 */
  upload?: boolean;
  infoLists?: any;
  fileList: string[];
  loading?: boolean;
  isShowSkeleton?: boolean;
  currentIdx?: number;
  /** 展示大图 */
  isShowEnlargeImg: boolean;
  /** 当图片放大时 关闭按钮一同展示 */
  isShowCloseBtn?: boolean;
  reqLimit?: string;
  isVideo?: boolean;
  videoUrl?: string;
};

/** 图片数据类型 */
export type ImgType = { type: string; data: string };

/** 风控表单返回类型 */
export interface RiskForm extends BaseInterface {
  id: number;
  type: RiskFormType;
}

/** 风控表单类型MAP*/
export enum RiskFormMap {
  RISKASSESSMENT = 'RiskAssessment',
  WEALTHSOURCE = 'WealthSource',
  FULLAUDIT = 'FullAudit',
}

export type RiskFormType = RiskFormMap.FULLAUDIT | RiskFormMap.RISKASSESSMENT | RiskFormMap.WEALTHSOURCE;

/** 获取最近一次审核的风控表单参数 */
export interface RiskAuditParam extends BaseInterface {
  type: RiskFormType;
  status: 'Normal' | 'Pending' | 'Finish' | 'Rejected';
}

/** 获取最近一次审核的风控表单返回数据 */
export interface RiskAuditFormRes extends BaseInterface {
  id: number;
  type: RiskFormType;
  status: 'Normal' | 'Pending' | 'Finish' | 'Rejected';
  remark: string;
  form: { [key: string]: any };
}

/** 用户认证信息 */
export interface RiskAuth extends BaseInterface {
  value: number;
  authenticationType: string;
  isAuthentication: boolean;
}

/** 提交风险评估问卷参数 */
export interface RiskAssessmentRequest extends BaseInterface {
  annualIncome: number;
  employStatus: string;
  companyName?: string;
  companyAddress?: string;
  netAsset: number;
  assetSource: string;
  id: number;
}

/**  提交财富来源证明参数 */
export interface WealthSourceRequest extends BaseInterface {
  id: number;
  depositLimit: string;
  moneySources: string[];
  salaryImages?: string[];
  soleTraderImages?: string[];
  depositsImages?: string[];
  pensionImages?: string[];
  stockImages?: string[];
  businessImages?: string[];
  investImages?: string[];
  gambleImages?: string[];
  saleHouseImages?: string[];
  rentImages?: string[];
  borrowMoneyImages?: string[];
  legacyImages?: string[];
  contributedImages?: string[];
  otherImages?: string[];
}

/** 提交全套审核参数 */
export interface FullAuditRequest extends BaseInterface {
  id?: number;
  frontsideImage: string;
  backsideImage: string;
  bankRecordImages?: string[];
  cryptoCurrencyRecordImages?: string[];
  videoUrl?: string;
}

/** 获取用户上传文档callback */
export interface RequestDocumentCallBack extends BaseInterface {
  code: string;
  success: boolean;
  message: string;
  data: RequestDocumentDataCallBack;
}

/** 获取用户上传文档callback */
export interface RequestDocumentDataCallBack extends BaseInterface {
  idVerification?: any;
  proofOfAddress?: any;
  paymentMethod?: any;
  customize?: any;
  sow?: Sow | null;
  kycAdvanced?: KycAdvanced | null;
}

/** 高级KYC 材料补充 */
export interface Sow extends KycAdvanced {
  type: 'WealthSourceDocument';
}

/** 高级kyc 提交后返回材料 */
export interface KycAdvanced extends BaseInterface {
  id: number;
  kycLevel: 'KycPrimary' | 'KycIntermediat' | 'KycAdvanced';
  status: 'Normal' | 'Pending' | 'Finish' | 'Rejected';
  document: {
    [key: string]: string[];
  };
}

/**获取用户上传的文档callback item*/
export interface RequestDocumentItem extends BaseInterface {
  document: any;
  /**
   * 风控表单审核状态
   *  Normal:0, //待提交
   * Pending:1, //待审核
   * Finish:2, //通过
   * Rejected:3, //不通过
   */
  status: string;
  /**
   * 风控表单类型
   * RiskAssessment:1, //风险评估问卷
   * WealthSource:2, //财富来源证明
   * FullAudit:3, //全套审核
   * ID:4, //ID
   * POA:5, //POA
   * PaymentMethod:6, //支付方式
   * Customize:99, //自定义
   */
  type: string;
}
/**上传ID params*/
export interface UploadIdParams extends BaseInterface {
  id: string;
  /**
   * ID类型
   * Identity, //身份证
   * Passport, //护照
   * DrivingLicense, //驾驶证
   */
  country: string;
  idType: string;
  frontImage: string;
  backImage: string;
  originalFileName?: string;
  originalBackImageName?: string;
  originalFrontImageName?: string;
}
/**上传POA 账单地址 POA params*/
export interface UploadPoaParams extends BaseInterface {
  id: string;
  /**国家代码 */
  country: string;
  address: string;
  city: string;
  postalCode: string;
  /**截图 */
  screenshotProof: string;
  originalFileName: string;
}
/**上传支付方式 params*/
export interface UploadPaymentParams extends BaseInterface {
  id: string;
  /**截图 */
  paymentName: string;
  screenshotProof: string;
  originalFileName: string;
}
/**上传自定义文件 params*/
export interface UploadCustomizeParams extends BaseInterface {
  id: string;
  customizeName: string;
  customizeValue: any;
  originalFileName: string;
}

/**补充财富证明 parames */
export type UploadSowParams = BaseInterface;
