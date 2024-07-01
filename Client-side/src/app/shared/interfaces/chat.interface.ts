import { MessageItemComponent } from 'src/app/pages/chat/message-item/message-item.component';
import { BaseInterface } from './base.interface';

/**chat ws消息 */
export interface ChatWsReceived extends BaseInterface {
  code: number;
  command: number;
  msg: string;
  user?: ChatUserInfo;
  seq?: string;
  data?: unknown;
  /**禁言状态 1:禁言 2:正常 */
  muteStatus?: number;
}

/**自己发的消息响应 */
export interface ChatWsSendResponse {
  /**服务器记录的时间 */
  createTime: number;
  /**含媒体类型的消息回传的信息 */
  extras?: {
    asset: ChatMsgAsset[];
  };
  /**是否过滤了 0:不过滤 1:过滤 */
  filterFlag: number;
  /**过滤后消息内容 filterFlag=1 时生效 */
  filteredContent: string;
}

/**未读消息数量响应 */
export interface ChatUnreadCountData {
  count: number;
}

/**历史消息响应 */
export interface ChatHistoryMsgItem extends BaseInterface {
  chatType: number;
  content: string;
  createTime: number;
  from: string;
  groupId: string;
  /**0=>文本,1=>图片,3=>视频,7=>文件,8=>图文混排 */
  msgType: number;
  seq: string;
  asset?: ChatMsgAsset[];
}

/**客服消息响应 */
export interface ChatCsMsgItem extends BaseInterface {
  command: number;
  chatType: number;
  content: string;
  createTime: number;
  /**来自谁 */
  from: string;
  id: string;
  /**0=>文本,1=>图片,3=>视频,7=>文件,8=>图文混排 */
  msgType: number;
  seq: string;
  /**发给谁 */
  to: string;
  asset?: ChatMsgAsset[];
}

/**ws 用户信息 */
export interface ChatUserInfo extends BaseInterface {
  /**用户id */
  userId: string;
  /**用户头像 */
  avatar: string;
  /**用户昵称 */
  nick: string;
  /**在线状态 */
  status: string;
  /**连接方式 */
  terminal: string;
  /**所属商户 */
  merchantId: string;
  userType: number;
  lastChatTime: number;
  /**禁言状态 1:禁言 2:正常 */
  muteStatus: number;
}

export interface ChatSendMsg extends BaseInterface {
  /**序列id */
  seq: string;
  /**11 */
  command?: number;
  /**本地生成时间 */
  createTime: number;
  /**0=>文本,1=>图片,3=>视频,7=>文件,8=>图文混排 */
  msgType: number;
  /**1:群聊 2:单聊 3:自动客服 */
  chatType?: number;
  /**内容 */
  content: string;
  /**媒体资源 */
  asset?: ChatMsgAsset[];
}

/**聊天媒体资源 */
export interface ChatMsgAsset {
  /**资源id，消息发送前是'-1'， 消息发送完成后是字符串id */
  fId?: string;
  /**资源类型 jpg、mp4、pdf...之类 */
  type?: string;
  /**资源的大小 */
  size?: number;
  /**资源的尺寸高 只有图片和视频有 */
  height?: number;
  /**资源的尺寸宽 只有图片和视频有 */
  width?: number;
  /**资源的完整地址 */
  url?: string;
  /**只有视频有，封面图id */
  cover?: string;
  /**只有视频有视频封面图完整地址 */
  coverUrl?: string;
  /**资源名称 */
  name?: string;
  /**视频时长 */
  duration?: number;
  /**本地资源（未发送完成时使用，发送完成后需清理释放内存） */
  localData?: ChatMsgAssetLocalCache;
}

/**聊天媒体资源本地缓冲（用于未上传完成时候上屏显示） */
export interface ChatMsgAssetLocalCache {
  /**主要文件 */
  file?: File;
  /**视频的封面图文件 对应 */
  thumbFile?: File;
  /**主要预览路径 */
  dataUrl?: string;
  /**视频的封面图路径 */
  thumbDataUrl?: string;
}

export interface ChatGetHistory extends BaseInterface {
  /**19 */
  command: number;
  /**不传即默认当前时间 */
  lastTime?: number;
  /**显示消息数量,非必填,禁止小于0大于30,不传即默认20条 */
  count: number;
  /**0:离线消息,1:历史消息 */
  type: number;
}

/**本地 聊天消息 类型 */
export interface ChatMessage {
  /**来自谁 */
  from: string;
  /**序列id */
  seq: string;
  /**消息时间 */
  createTime: number;
  /**0=>文本,1=>图片,3=>视频,7=>文件,8=>图文混排 */
  msgType: number;
  /**内容 */
  content: string;
  /**媒体资源 */
  asset?: ChatMsgAsset[];
  /**是否显示时间 */
  showTime: boolean;
  /**状态 空 => 无状态 -1 => 正在发送 -2 => 等待上传 0 => 未发送成功 1 => 已发送成功 2 => 上传进行中 */
  status?: number;
  /**status=2时的上传进度  */
  progress?: number;
  /**组件引用，调用mountsTo后才有 */
  component?: MessageItemComponent;
}

// C10000(10000,"通用处理成功"),
// C10001(10001,"通用处理失败"),
// C10002(10002,"消息发送失败,数据格式不正确"),
// C10003(10003,"获取用户信息成功!"),
// C10004(10004,"获取用户信息失败!"),
// C10005(10005,"获取所有在线用户信息成功!"),
// C10006(10006,"获取所有离线用户信息成功!"),
// C10007(10007,"登录成功!"),
// C10008(10008,"登录失败!"),
// C10009(10009,"用户不在线!"),
// C10010(10010,"鉴权失败!"),
// C10012(10012,"加入群组失败!"),
// C10013(10013,"协议版本号不匹配!"),
// C10014(10014,"不支持的cmd命令!"),
// C10015(10015,"获取用户消息失败!"),
// C10017(10017,"未知的cmd命令!"),
// C10019(10019,"用户在线"),
// C10020(10020,"非法请求!"),
// C10022(10022,"登录失败,token过期!"),
// C10023(10023,"发送消息失败,您已经禁止发言!")
