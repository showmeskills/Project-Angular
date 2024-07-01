/**
 * 额外存款奖励活动
 */

import { PaymentMethodGoMoneyItem } from 'src/app/shared/interfaces/payment-method-management';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Prize } from 'src/app/shared/interfaces/activity';

/**
 * 额外奖励 - 第三步参数
 */
export interface ExtraRewardParams {
  dailyMaxLimit: number; // 当日累计限额
  number: number; // 组合方式数量
  prizeItems: ExtraRewardPrizeParams[];
  tenantId: number;
  tmpCode: string;
}

/**
 * 额外奖励 - 奖品参数
 */
export interface ExtraRewardPrizeParams {
  firstDepositPrize: ExtraRewardDepositPrizeParams;
  otherDepositPrizeNum: number; // 下次存款奖励次数
  otherDepositPrizeType: string; // 下次存款奖励类型(same=每次相同/different=每次不同)
  otherDepositPrizes: ExtraRewardDepositPrizeParams[];
  paymentMethods: string[]; // 支付方式组合
}

/**
 * 额外奖励 - 奖品参数（存款奖励对象）
 */
export interface ExtraRewardDepositPrizeParams {
  minDepositUsdt: number; // 最低存款Usdt
  number: number; // 奖励序号
  prizeId: string; // 奖品 ID
}

/**
 * 额外奖励 - 第三步表单
 */
export type ExtraRewardForm = {
  payment: FormControl<PaymentMethodGoMoneyItem[] | null>;
  first: ExtraRewardFormPrize;
  nextExtraRewardType: FormControl<string | null>;
  nextExtraRewardCount: FormControl<number | null>;
  next: FormArray<ExtraRewardFormPrize>;
};

/**
 * 额外奖励 - 第三步表单奖励
 */
export type ExtraRewardFormPrize = FormGroup<{
  minDepositUsdt: FormControl<number | null>;
  number: FormControl<number | null>;
  prizeId: FormControl<Prize | null>;
}>;
