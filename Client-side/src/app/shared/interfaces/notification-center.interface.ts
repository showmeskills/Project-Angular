import { BaseInterface } from './base.interface';

/**@QueryNoticeParams 查询站站内信接口 */
export interface QueryNoticeParams extends BaseInterface {
  page?: number;
  pageSize?: number;
  noticeType?: string;
  isReaded?: boolean | undefined;
}

/**@DeleteParams 删除站内信参数接口 */
export interface DeleteParams extends BaseInterface {
  idList: number[];
}

/**@NoticeCount 各通知类型未读数量*/
export interface NoticeCount extends BaseInterface {
  All: number;
  System: number;
  Transaction: number;
  Activity: number;
  Information: number;
}
