import { BaseInterface } from './base.interface';

export interface PokerInfor extends BaseInterface {
  num: string;
  color: string;
  index: number;
  cnColor: string;
  higher: string;
  lower: string;
  nextUpBetRate?: string;
  nextLowBetRate?: string;
  /** 0:小于  1:大于  2:等于  3:放弃  4:无 */
  compareFlag?: number;
}
