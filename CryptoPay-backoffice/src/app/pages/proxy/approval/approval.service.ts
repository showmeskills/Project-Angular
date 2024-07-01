import { Injectable } from '@angular/core';
import { LabelApprovalState } from 'src/app/shared/interfaces/agent';
import { FinancialWithdrawStatus as St } from 'src/app/shared/interfaces/status';

/**
 * 付款审批 - 状态服务
 */
@Injectable({
  providedIn: 'root',
})
export class ApprovalStatusService {
  constructor() {}

  statusList: LabelApprovalState[] = [
    { code: St[St.Unknown], colorType: 'default', name: '未知', langKey: 'payment.approval.unknown' },
    { code: St[St.Waiting], colorType: 'yellow', name: '等待一审', langKey: 'payment.approval.wait1' },
    { code: St[St.Permission], colorType: 'yellow', name: '等待提交', langKey: 'payment.approval.permission' },
    { code: St[St.Rejected], colorType: 'danger', name: '拒绝', langKey: 'payment.approval.rejected' },
    {
      code: St[St.PartialProcessing],
      colorType: 'info',
      name: '部分提交',
      langKey: 'payment.approval.partialProcessing',
    },
    { code: St[St.Processing], colorType: 'primary', name: '出款中', langKey: 'payment.approval.processing' },
    { code: St[St.Success], colorType: 'success', name: '已出款', langKey: 'payment.approval.success' },
    { code: St[St.PartialFail], colorType: 'info', name: '部分失败', langKey: 'payment.approval.partialFail' },
    { code: St[St.Fail], colorType: 'danger', name: '失败', langKey: 'payment.approval.fail' },
    { code: St[St.Waiting2], colorType: 'yellow', name: '等待二审', langKey: 'payment.approval.wait2' },
  ];

  /** 获取状态信息 */
  async get(code: string): Promise<LabelApprovalState> {
    return this.statusList.find((e) => e.code === code)! || this.statusList[0];
  }
}
