import { BaseInterface } from './base.interface';
/**
 * 	 返回用户存款限额设定
 */
export interface ModifyDepositLimit extends BaseInterface {
  /** 每日限额 */
  dailyLimit: number | null;
  /** 每周限额 */
  weeklyLimit: number | null;
  /** 每月限额 */
  monthlyLimit: number | null;
  /** 预设每日限额 */
  dailyLimitPreset: number | null;
  /** 预设每日限额生效时间(UTC+0) */
  dailyLimitPresetEffectiveTime: string | null;
  /** 预设每周限额 */
  weeklyLimitPreset: number | null;
  /** 预设每周限额生效时间(UTC+0) */
  weeklyLimitPresetEffectiveTime: string | null;
  /** 预设每月限额 */
  monthlyLimitPreset: number | null;
  /** 预设每月限额生效时间(UTC+0) */
  monthlyLimitPresetEffectiveTime: string | null;
}
