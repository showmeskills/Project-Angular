import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionStatusService {
  constructor(private lang: LangService) {}

  state = [
    { code: 'Fail', type: 'danger', lang: ['payment.subChannel.fail'], langArgs: {} },
    { code: 'Success', type: 'success', lang: ['payment.transactionList.completed'], langArgs: {} },
    { code: 'Timeout', type: 'yellow', lang: ['payment.transactionList.expired'], langArgs: {} }, // 已过期
    { code: 'Cancel', type: 'danger', lang: ['payment.transactionList.manualCancellation'], langArgs: {} }, // 人工取消
    { code: 'Reverse', type: 'danger', lang: ['payment.transactionList.rushingToCancel'], langArgs: {} }, // 冲正取消
    { code: 'PartialReverse', type: 'info', lang: ['payment.transactionList.partialReverse'], langArgs: {} }, // 部分冲正取消
    { code: 'RequestException', type: 'danger', lang: ['payment.transactionList.requestException'], langArgs: {} }, // 请求异常
    { code: 'Processing', type: 'yellow', lang: ['payment.transactionList.processing'], langArgs: {} }, // 处理中
    { code: 'Confirming', type: 'primary', lang: ['payment.transactionList.assignedTips'], langArgs: {} }, // 已分配
    { code: 'UnKnow', type: 'default', lang: ['payment.transactionList.unknown'], langArgs: {} }, // 未知
  ];

  depositState = [
    { code: 'Confirming', type: 'primary', lang: ['payment.transactionList.toBeConfirmed'], langArgs: {} }, // 待确认
    { code: 'Allocating', type: 'primary', lang: ['payment.transactionList.pendingAllocation'], langArgs: {} }, // 待分配
    { code: 'Fail', type: 'danger', lang: ['payment.method.deposit', 'payment.subChannel.fail'], langArgs: {} },
  ];

  withdrawState = [
    { code: 'Confirming', type: 'primary', lang: ['payment.transactionList.assignedCountTips'], langArgs: {} }, // 已分配(1)
    { code: 'Allocating-wait', type: 'primary', lang: ['payment.transactionList.wait'], langArgs: {} }, // 等待
    { code: 'Allocating-waiting', type: 'primary', lang: ['payment.transactionList.waitingTips'], langArgs: {} }, // 等待中
    { code: 'Allocating-commit', type: 'primary', lang: ['payment.transactionList.commitTips'], langArgs: {} }, // 提交中
    { code: 'Fail', type: 'danger', lang: ['payment.method.withdrawal', 'payment.subChannel.fail'], langArgs: {} },
  ];

  getState = (data) => {
    const stateList = cloneDeep(this.state);
    const isDeposit = data.paymentCategory === 'Deposit';
    const isWithdraw = data.paymentCategory === 'Withdraw';

    let suffix = '';
    let stateOtherList: typeof this.state = [];
    let langArgs: any = {};

    isDeposit && (stateOtherList = cloneDeep(this.depositState));
    isWithdraw && (stateOtherList = cloneDeep(this.withdrawState));

    if (isWithdraw) {
      if (data.status === 'Confirming') {
        if (data.matchCount) {
          langArgs = { n: data.matchCount };
        } else {
          stateOtherList = [];
        }
      } else if (data.waitCount) {
        suffix = '-waiting';
        langArgs = { n: data.waitCount };
      } else if (!data.waitCount && data.matchCount) {
        suffix = '-commit';
        langArgs = { n: data.matchCount };
      } else if (!data.waitCount && !data.matchCount) {
        suffix = '-wait';
      }
    }

    const special = stateOtherList.find((e) => e.code === data.status + suffix);
    const normal = stateList.find((e) => e.code === data.status);
    const result = (special && { ...special, langArgs }) || normal || ({ langArgs: {} } as any);

    /**
     * 任何状态下：当 isShowRejectTips && rejectTimes 时，显示驳回次数
     * 1. isShowRejectTips: 字段为true 显示驳回
     * 2. rejectTimes 驳回次数
     */
    if (data?.isShowRejectTips && data?.rejectTimes) {
      result.lang = [...result.lang, 'payment.transactionList.rejectTips'];
      result.langArgs['rejectCount'] = data?.rejectTimes;
    }

    return result;
  };

  async getStateText(data) {
    const item = this.getState(data);

    if (!item?.lang?.length) return Promise.resolve('');

    return this.lang.getOneArr(item.lang, item.langArgs);
  }

  async getStateLabel(data) {
    const item = this.getState(data);
    let text = '';

    if (item?.lang?.length) {
      text = (await this.lang.getOneArr(item.lang, item.langArgs)) || '';
    }

    return { ...item, text: text || '' };
  }
}
