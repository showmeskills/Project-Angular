/**
 * Banner类型
 */
export const BannerTypeObjEnum = {
  FrontPage: 'FrontPage', // 首页
  GamesPage: 'GamesPage', // 小游戏
  LotteryPage: 'LotteryPage', // 彩票
  Promotion: 'Promotion', // 优惠活动
} as const;

export type BannerTypeEnum = (typeof BannerTypeObjEnum)[keyof typeof BannerTypeObjEnum];

export interface BannerInfo {
  id: number;
  title: string;
  bannerUrl: string; // banner图片地址
  imageUrl: string; // 链接地址
  isPublish: true; // 是否发布 (true：已发布，false：未发布)
  createdUserName: string; // 创建人
  startTime: number; // 开始时间
  endTime: number; // 结束时间
  languageCode: string; // 语言Code
}

export interface BannerItem {
  bannerPageType: BannerTypeEnum;
  banners: BannerInfo[];
}

/**
 * Banner详情参数
 */
export interface BannerDetailParams {
  bannerPageType: BannerTypeEnum;
  banners: BannerDetailLang[];
  clientType: string; // banner平台类型     Web:1 Web端    App:2 App端
  id?: number;
  merchantId: number; // 商户ID
  releaseType: string; // 发布方式    Immediately:1, //立即发布  Appointment:2, //预约发布
  startTime: number; // 开始时间
  endTime: number; // 结束时间
  supportLangList?: string[] | null; // 支持的语言列表    Carl：SupportLangList 返回空，或者空数值，页面就全选
}

/**
 * Banner详情
 */
export interface BannerDetail extends BannerDetailParams {
  domain: string; // 图片域名
}

/**
 * Banner详情多语系
 */
export interface BannerDetailLang {
  bannerUrl: string;
  imageUrl: string;
  languageCode: string;
  title: string;
}
