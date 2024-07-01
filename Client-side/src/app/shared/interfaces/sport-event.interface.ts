import { BaseInterface } from './base.interface';

export interface SportEvent extends BaseInterface {
  /** 球种 */
  sportId: number;
  /** 联赛id */
  tournamentId: string;
  /** 联赛名稱 */
  tournament: string;
  /** 比赛id */
  matchId: string;
  /** 主队 队伍编号 */
  home: string;
  /** 主队 队伍名称 */
  homeName: string;
  /** 主队 队伍logo */
  homeLogo: string;
  /** 客队 队伍编号 */
  away: string;
  /** 客队 队伍名称 */
  awayName: string;
  /** 客队 队伍logo */
  awayLogo: string;
  /** 開赛時間 */
  matchTime: number;
  /** 現在時間 */
  gameTime: number;
  /** 1:prematch 2:live */
  matchType: number;
  /** 状态名 */
  matchStageName: string;
  /** 狀態 */
  matchStage: number;
  /** 賠率 */
  homeOdds: number | null;
  drawOdds: number | null;
  awayOdds: number | null;
}
