import { BaseInterface } from './base.interface';

export interface BetListData extends BaseInterface {
  money: string;
  /** 初始按钮文字 */
  betTest: string;
  /** 点击投注后，三个点动画 */
  loading: boolean;
  /** 开启自动投注后，是否点击投注 */
  betAuto: boolean;
  /** 是否开启自动投注 */
  isAuto: boolean;
  /** 按钮颜色 */
  betcolor: string;
}
