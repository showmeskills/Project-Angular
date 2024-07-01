import { BaseInterface } from './base.interface';
/**
 * 原创--获取原创游戏 盈利率分析参数
 */
export interface OriginalRatewinParams extends BaseInterface {
  uid: string; //uid
  TenantId: number; // 商户号
  GameCode?: string; // 游戏名
  StartTime?: string; // 开始日期
  EndTime?: string; //结束日期
}

/**
 * 原创--获取原创游戏 盈利率分析数据
 */
export interface OriginalRatewinData {
  uid: string; // uid
  gameCode: string; // 游戏名称
  winLossAmountAll: number; // 输赢总金额
  betAmountAll: number; //下注总金额
  profitRate: number; //盈利率 (输赢总金额/下注总金额)
  winCountAll: number; // 赢笔数
  countAll: number; // 总笔数
  winRate: number; //胜率 (赢笔数/总笔数)
}
