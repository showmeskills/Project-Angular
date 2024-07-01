import { BaseInterface } from './base.interface';

/**用户反馈记录(列表) */
export interface FeedbackRecord extends BaseInterface {
  id: number;
  title: string;
  feedbackType: string;
  createdTime: number;
}

/**用户反馈记录详情 */
export interface FeedbackDetail extends BaseInterface {
  id: number;
  feedbackType: string;
  productType: string;
  clientType: string[];
  languageCode: string;
  device: string;
  version: string;
  title: string;
  detail: string;
  url: string;
  urlList: string[];
  createdTime: number;
}

/**用户反馈下拉选项 */
export interface FeedbackOptionList extends BaseInterface {
  /**平台类型 */
  clientTypeOptionList: {
    /**平台文字 */
    description: string;
    /**平台值 */
    code: string;
  }[];
  /**建议类型 */
  feedbackTypeOptionList: {
    /**建议类型文字 */
    description: string;
    /**建议类型值 */
    code: string;
    /**建议类型下的产品类型 */
    productOptionList: {
      /**产品类型文字 */
      description: string;
      /**产品类型值 */
      code: string;
    }[];
  }[];
}

/**新增意见反馈参数 */
export interface CreateFeedbackParams extends BaseInterface {
  feedbackType: string;
  productType: string;
  clientType: string[];
  languageCode: string;
  device: string;
  version: string;
  title: string;
  detail: string;
  url: string;
  urlList: string[];
}
