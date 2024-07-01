import { BaseInterface } from 'src/app/shared/interfaces/base.interface';

export interface StatusService extends BaseInterface {
  name?: string;
  value: string;
  type: string;
  lang: string[];
  langArgs: {};
}

/**
 * 付款审批 - 状态
 * 出款审批状态
 */
export enum FinancialWithdrawStatus {
  //  0 [Description("未知")]
  Unknown = 'Unknown',
  //  1 [Description("等待一审")]
  Waiting = 'Waiting',
  //  2 [Description("等待提交")]
  Permission = 'Permission',
  //  3 [Description("拒绝")]
  Rejected = 'Rejected',
  //  4 [Description("部分提交")]
  PartialProcessing = 'PartialProcessing',
  //  5 [Description("出款中")]
  Processing = 'Processing',
  //  6 [Description("已出款")]
  Success = 'Success',
  //  7 [Description("部分失败")]
  PartialFail = 'PartialFail',
  //  8 [Description("失败")]
  Fail = 'Fail',
  //  9 [Description("等待二审")]
  Waiting2 = 'Waiting2',
}
