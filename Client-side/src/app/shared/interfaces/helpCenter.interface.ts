import { BaseInterface } from './base.interface';

/**@ArticleByTag  根据标签获取相关资讯(最多5条) 目前参数只用到了 法币充值 法币提取 数字货币充值 数字货币提取 返回的数据*/
export interface ArticleByTag extends BaseInterface {
  articleCode: string;
  categoryId: number;
  categoryParentId: number;
  id: number;
  releaseTime: number;
  title: string;
}

/**@HotFaq  获取热门问题(最多6条)*/
export interface HotFaq extends BaseInterface {
  articleCode: string;
  categoryCode: string;
  categoryId: number;
  categoryParentId: number;
  id: number;
  title: string;
}

/**@AnnouncementArticleDetail 获取公告中心详情 */
export interface AnnouncementArticleDetail extends BaseInterface {
  categoryId: number;
  content: string;
  releaseTime: number;
  title: string;
}

/**@AnnouncementArticleListById  根据主题分类ID获取公告列表 最多返回15条数据*/
export interface AnnouncementArticleListById extends BaseInterface {
  list: Array<{
    articleCode: string;
    categoryCode: string;
    categoryId: number;
    categoryParentId: number;
    content: string;
    id: number;
    releaseTime: number;
    title: string;
  }>;
  total: number;
}

/**@LatestArticle 最新文章返回数据 */
export interface LatestArticle extends BaseInterface {
  articleCode: string;
  categoryCode: string;
  categoryId: number;
  categoryParentId: number;
  content: number;
  id: number;
  releaseTime: number;
  title: string;
}

/**@HomeArticle  三条公告中心返回的数据*/
export interface HomeArticle extends BaseInterface {
  articleCode: string;
  categoryId: number;
  categoryParentId: number;
  id: number;
  releaseTime: number;
  title: string;
}
/**@CategoryInfo  查询资讯主题分类返回数据*/
export interface CategoryInfo extends BaseInterface {
  categoryCode: number;
  children: Array<{
    active: boolean;
    categoryCode: 1;
    children: [];
    description: string;
    icon: string;
    iconAddress: string;
    id: number;
    parentId: number;
    title: string;
  }>;
  description: string;
  icon: string;
  iconAddress: string;
  id: number;
  parentId: number;
  title: string;
}

/**@FaqArticleList  根据主题分类ID获取文章列表返回数据*/
export interface FaqArticleList extends BaseInterface {
  articleCode: string;
  categoryCode: string;
  categoryId: number;
  categoryParentId: number;
  id: number;
  title: string;
}

/**@FaqDetail 获取资讯详情及相关文章返回数据*/
export interface FaqDetail extends BaseInterface {
  categoryId: number;
  content: string;
  relationArticleList: Array<{
    rticleCode: string;
    categoryCode: string;
    categoryId: number;
    categoryParentId: number;
    id: number;
    title: string;
  }>;
  releaseTime: number;
  title: string;
}
export interface GetCategoryInfoParams extends BaseInterface {
  CategoryType?: string; //分类标识(FAQ:常见问题,Announcement:公告中心,不传为全部)
  IsChchildren?: boolean; //默认false,true为获取子集
}

// announcement
export interface GetHomeArticle extends BaseInterface {
  ClientType: string; //客户端类型(Web、H5、App)
}

export interface GetFaqArticleListById extends BaseInterface {
  ClientType: string; //required 客户端类型(Web、H5、App)
  CategoryId: string; //主题分类ID
}

export interface GetAnnouncementArticleDetail extends BaseInterface {
  id: string; //文章编码
}

export interface Getlatestarticle extends BaseInterface {
  ClientType: string; //required 客户端类型(Web、H5、App)
  isAnnouncement?: boolean; //"是否获取最新公告,默认为true;传false,代表获取最新文章(不区分公告和常见问题)"
}

export interface GetAnnouncementArticleListById extends BaseInterface {
  ClientType: string; // "客户端类型(Web、H5、App)"
  CategoryId: string; //"主题分类ID"
  Page?: number;
  PageSize?: number;
}

export interface Gethotfaq extends BaseInterface {
  ClientType: string; //客户端类型(Web、H5、App)
  isFaq?: boolean; // 是否获取热门问题,默认为true;传false,代表获取热门文章(不区分公告和常见问题)
}

export interface Getfaqdetail extends BaseInterface {
  id: string; //文章编码
}

export interface GetSearchList extends BaseInterface {
  ClientType: string; //"客户端类型(Web、H5、App)",
  Type?: number | string; // "分类标识(1:常见问题,2:公告中心,不转为全部)",
  Keywords: string; //"搜索内容",
  Page?: number; //"起始页数",
  PageSize?: number; //"每页笔数"
}

export interface SearchResult extends BaseInterface {
  list:
    | Array<{
        articleCode: string;
        categoryCode: string;
        categoryId: number;
        categoryParentId: number;
        categoryTitle: string;
        content: string;
        id: number;
        releaseTime: number;
        title: string;
      }>
    | [];
  total: number;
}

export type GetTasSelect = BaseInterface;

export interface GetArticleByTag extends BaseInterface {
  ClientType: string; //"客户端类型(Web、H5、App)",
  Tag: string; //"标签类型(法币充值，法币提现，数字货币充值，数字货币提现，购买，兑换)"
}

/**常规文章结构*/
export interface StandardByCode extends BaseInterface {
  content: string;
  title: string;
  activityImgUrl: string;
  detailImgUrl: string;
  id: number;
}
