import { BaseInterface } from './base.interface';

/**
 * 图片第一次地址返回
 */
export interface UploadURL extends BaseInterface {
  url: string; // 上传接口url 客户端直接使用该地址put请求，header 要添加content-type，把文件上传
  filePath: string; // 文件路径
  fullUrl: string; // 上传成功后，文件访问地址
}

/**
 * 图片请求类型
 * 图片上传类型跟后台上传type保持一致，需要不同的上传类型 需找Ring进行添加
 */
export type UploadType =
  | 'Merchant'
  | 'Currency'
  | 'GameProvider'
  | 'Games'
  | 'Article'
  | 'Bonus'
  | 'PaymethodIcon'
  | 'Proxy'
  | 'GameLabel'
  | 'Footer'
  | 'Member'
  | 'TxReview' // gomoney 那些审核的订单
  | 'AdminOperateAudit'; // 代表后台审批的文件上传

/**
 * 上传状态
 */
export interface Upload<T = any> {
  progress: number;
  state: 'PENDING' | 'UPLOADING' | 'DONE' | 'FAILED';
  total?: number; // 总量
  loaded?: number; // 已上传
  body?: T; // 上传完成回调
}

/**
 * 上传改变事件
 */

export interface UploadChange<T = any> {
  upload: Upload<T>;
  uploadURL: UploadURL;
}
