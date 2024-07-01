/**
 * 自定义多语言 - 类型
 */
export enum MultiLangType {
  None = 0,
  OA = 1, // 旧活动,OldActivity
  NA = 2, // 新活动,NewActivity
  GG = 3, // GoGaming
}

/**
 * 自定义多语言 - 获取语言参数
 */
export interface MultiLangParams {
  tenantId: number | string;
  source: MultiLangType;
  keys: string[];
}

/**
 * 自定义多语言 - 语言返回体
 */
export interface MultiLang<T extends Object = any> {
  key: string;
  infos: MultiLangInfo<T>[];
}

/**
 * 自定义多语言 - 语言返回体信息
 */
export interface MultiLangInfo<T extends Object> extends MultiLangInfoBase<T> {
  isJsonObject: boolean; // content是否是json对象
}
export interface MultiLangInfoBase<T extends Object> {
  content: T; // 内容
  lanageCode: string; // 语言代码
}

/**
 * 自定义多语言 - 语言提交参数
 */
export interface MultiLangSubmitParams {
  tenantId: number | string;
  source: MultiLangType;
  list: MultiLangInfoParam[];
}

/**
 * 自定义多语言 - 语言返回体
 */
export interface MultiLangInfoParam<T extends Object = any> {
  key: string;
  infos: MultiLangInfoBase<T>[];
}
