export interface CollectionEvent {
  /** 用户Id */
  uid?: string;

  /** 用户类型 */
  userType?: number;

  /** 产品Id 1 体育，2彩票, 3 平台 */
  appId?: number;

  /** 客户端版本号 */
  appVersion?: string;

  /** 商户Id */
  tpid?: string;

  /** 当前页面域名 */
  domain?: string;

  /** 从哪里进入的网站 */
  httpReferer?: string;

  /** 设备类型 1-web, 2-mobile, 3-app */
  deviceType?: number;

  /** 设备机型，比如iphone 12 , web 不用传 */
  deviceModel?: string;

  /** 系统类型，1=Android,2=Ios,3=Mac,4=Windows,99=Others */
  osType?: number;

  /** 系统版本号 */
  osVersion?: string;

  /** 用户ip地址 */
  ip?: string;

  /** 浏览器类型，1 = chrome ,2 = safari ,3 = microsoft edge ,4 = firefox ,5 = uc browser ,99 = others ,-1 = non-browser */
  browserType?: number;

  /** 语言代码 */
  language?: string;

  /** 主版本号，固定2 */
  appMajorVersion?: number;

  /** 无意义，固定0 */
  actionType?: number;

  // -----------------------------------------------------------------------

  /**触发时间 例：2021-01-25T08:00:00.123 */
  actionTime?: string;

  /** 具体埋点代码 https://gbd730.atlassian.net/wiki/spaces/Gaming/pages/2172257034/Gogaming */
  eventId?: number;

  /** 额外自定义参数 */
  actionValue1?: any;
  actionValue2?: any;
  actionValue3?: any;
  actionValue4?: any;
  actionValue5?: any;
  actionValue6?: any;
  actionValue7?: any;
  actionValue8?: any;
  actionValue9?: any;
  actionValue10?: any;
}
