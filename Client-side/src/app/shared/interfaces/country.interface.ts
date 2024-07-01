/**
 * Api返回国家数据
 */
export interface Country {
  /** 国家代号 示例：China */
  code: string;
  /** 手机区号 示例：+86*/
  areaCode: string;
  /** 是否可以发送短信 */
  hasSms: boolean;
  /** ISO 示例：CN */
  iso: string;
  /** 国家名称 */
  name: string;
}

/**
 * Api返回语言信息
 */
export interface LangModel {
  /** 语言代码 示例：zh-cn */
  code: string;
  /** 使用国家 */
  countryUser: string;
  id: number;
  /** 语言名称 */
  name: string;
}
