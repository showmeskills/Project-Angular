import { BaseInterface } from './base.interface';

export interface Response extends BaseInterface {
  code: number;
  message: string;
  data: any;
}

export interface ReceiveData extends BaseInterface {
  /**游戏英文名 */
  gameId: string;
  /**投注金额 ，也是结算后的金额，输了传负数 */
  amount: number;
  /**投注状态传bet 结算状态传 set  */
  type: string;
}
