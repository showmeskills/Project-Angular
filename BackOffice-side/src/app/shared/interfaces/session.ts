import { BaseInterface } from 'src/app/shared/interfaces/base.interface';
import { AccountInfo } from 'src/app/shared/interfaces/member.interface';
import { Upload } from 'src/app/shared/interfaces/upload';

export enum SessionCodeEnum {
  C10000 = 10000, // 通用处理成功,
  C10001 = 10001, // 通用处理失败,
  C10002 = 10002, // 消息发送失败,数据格式不正确,
  C10003 = 10003, // 获取用户信息成功!,
  C10004 = 10004, // 获取用户信息失败!,
  C10005 = 10005, // 获取所有在线用户信息成功!,
  C10006 = 10006, // 获取所有离线用户信息成功!,
  C10007 = 10007, // 登录成功!,
  C10008 = 10008, // 登录失败!,
  C10009 = 10009, // 用户不在线!,
  C10010 = 10010, // 鉴权失败!,
  C10012 = 10012, // 加入群组失败!,
  C10013 = 10013, // 协议版本号不匹配!,
  C10014 = 10014, // 不支持的cmd命令!,
  C10015 = 10015, // 获取用户消息失败!,
  C10017 = 10017, // 未知的cmd命令!,
  C10019 = 10019, // 用户在线,
  C10020 = 10020, // 非法请求!,
  C10022 = 10022, // 登录失败,token过期!,
  C10023 = 10023, // 发送消息失败,您已经禁止发言!,
}

/**
 * 会话命令枚举
 */
export enum SessionCommandEnum {
  /**
   * 自定义的状态码
   */
  Timeout = -2, // 超时

  Error = 0, // 错误
  HANDSHAKE = 1, // 握手请求
  HANDSHAKE_REPLY = 2, // 握手响应
  AUTH = 3, // 请求鉴权
  AUTH_REPLY = 4, // 鉴权响应
  LOGIN = 5, // 请求登录
  LOGIN_REPLY = 6, // 登录响应
  JOIN_GROUP = 7, // 请求入群
  JOIN_GROUP_REPLY = 8, // 进群响应
  JOIN_GROUP_NOTIFY = 9, // 进群通知
  QUIT_GROUP_NOTIFY = 10, // 退群通知
  SEND_MSG = 11, // 请求发送聊天
  SEND_MSG_REPLY = 12, // 聊天消息响应
  HEARTBEAT = 13, // 请求心跳
  CLOSE = 14, // 请求关闭
  RECALL_MSG = 15, // 请求撤回消息
  RECALL_MSG_REPLY = 16, // 收到撤回消息响应
  GET_USER_INFO = 17, // 请求获取用户信息
  GET_USER_INFO_REPLY = 18, // 收到用户信息响应
  GET_MSG = 19, // 请求获取聊天记录
  GET_MSG_REPLY = 20, // 收到获取聊天消息响应
  READ_MSG = 21, // 请求消息已读
  READ_MSG_REPLY = 22, // 消息已读响应
  CHAT_END = 25, // 聊天手动结束
  CHAT_END_REPLY = 26, // 聊天手动结束消息响应
  GET_TOPIC = 33, // 用户主题协议获取
  GET_TOPIC_REPLY = 34, // 用户主题协议获取响应

  CHAT_END_NOTIFY = 1030, // 聊天结束通知 endType类型( 1:自动结束 2:运营结束）
  READ_MSG_NOTIFY = 1031, // 聊天已读消息推送到运营通知
  TOPIC_CHANGE_NOTIFY = 1032, // 聊天推送所有运营主题变更通知
  RELOAD_NOTIFY = 1033, // 聊天推送所有运营是否重新加载IM的通知
}

/**
 * 会话消息类型枚举
 */
export enum SessionMsgTypeEnum {
  Text = 0, // 文本
  Image = 1, // 图片
  Voice = 2, // 语音
  Video = 3, // 视频
  Music = 4, // 音乐
  News = 5, // 图文
  File = 7, // 文件
  Mix = 8, // 图文混排
}

/**
 * 协议34 - 用户主题协议获取响应
 */
export interface IMTopicReply extends SessionBase {
  categoryRespBody: IMTopicCategory;
  fromUid: string; // 设置者UID
  id: number; // 当前会话设置的话题记录id
  subjectRespBody: IMTopicItem;
  uid: string; // 用户UID
}

/**
 * 协议34 - 用户主题协议话题分类
 */
export interface IMTopicCategory extends TopicCategory {}

/**
 * 协议34 - 用户主题协议话题
 */
export interface IMTopicItem extends TopicItem {}

/**
 * IM文件上传
 */
export interface IMUpload {
  success: boolean;
  upload: Upload;
  data?: { fid: string; data?: any } | null;
  file?: File; // 上传的文件，自定义的字段
}

/**
 * IM文件通用基本信息
 */
export interface IMFileBase {
  fId: string; // 文件ID
  isLoaded?: boolean; // 是否加载完成
  name: string; // 文件名
  size: number; // 文件大小
  type: string; // 文件类型 png
  url?: string; // 文件地址
}

/**
 * IM图片信息
 */
export interface IMFileImg extends IMFileBase {
  width: number; // 文件宽度
  height: number; // 文件高度
}

/**
 * IM文件信息
 */
export interface IMFileFile extends IMFileBase {}

/**
 * IM视频信息
 */
export interface IMFileVideo extends IMFileBase {
  cover: string;
  coverUrl: string; // 视频封面图完整地址
  width: number; // 文件宽度
  height: number; // 文件高度
  duration: number; // 文件时长
}

/**
 * IM文件集合信息
 */
export type IMFile = IMFileImg | IMFileFile | IMFileVideo;

/**
 * 话题标签基础类型
 */
export interface TopicLabelBase {
  label: string; // 标签类型(前端自定义用于匹配标签颜色)
  nameCn: string; // 中文名称
  nameEn: string; // 英文名称
  deleteFlag?: number; // 标签删除状态 1为删除
}

/**
 * 话题分类类型
 */
export interface TopicCategory extends TopicLabelBase {
  id: string;
}

/**
 * 话题级联查询所有
 */
export interface TopicCategoryAll extends TopicCategory {
  subjectList: TopicItem[];
}

/**
 * 话题
 */
export interface TopicItem extends TopicLabelBase {
  id: string;
  categoryId: string;
}

/**
 * 设置会话话题 - 请求参数
 */
export interface SetSessionTopicParams {
  categoryId: string; // 话题分类ID
  createTime: number; // 创建时间
  subjectId: string; // 话题ID
  uid: string; // 用户ID
}

/**
 * 编辑会话话题 - 请求参数
 */
export interface EditSessionTopicParams extends SetSessionTopicParams {
  topicId?: number; // 当前的会话话题ID
}

export enum SessionCodeEnum {
  LoginSuccess = 10007, // 登录成功
}

/**
 * 获取单次会话消息 - 请求参数
 */
export interface getMsgSingleParams {
  current: number; // 当前页数
  size: number; // 单页大小
  topicId: number; // 话题ID
  userId: string; // 用户ID
}

/**
 * 聊天框发送事件
 */
export interface SessionSendEvent {
  msg: string;
  data?: Partial<SessionMsgBase>;
  done: () => void;
}

/**
 * 批量发送消息请求参数
 */
export interface MassMsgParams {
  asset?: IMFile[]; // 资源信息
  adminUid: string; // 管理员UID
  categoryId?: string; // 话题分类ID
  subjectId?: string; // 话题ID
  content: string; // 消息内容
  createTime: number; // 消息时间
  msgType: SessionMsgTypeEnum; // 0:text、1:image、2:voice、3:video、4:music、5:news
  seq: string; // 消息序列号
  uids: string; // uids 多个用;隔开
}

/**
 * 接收到会话消息基础类型
 */
export interface SessionBase {
  code?: number;
  command?: SessionCommandEnum;
  msg?: string;
}

/**
 * 接收到的会话消息
 */
export interface SessionMsg<T = any> extends BaseInterface {
  code?: number;
  command?: SessionCommandEnum;
  msg?: string;
  data?: T;
}

/**
 * 会话列表
 */
export interface SessionList {
  groups: SessionGroup[];
}

/**
 * 群组用户信息
 */
export interface GroupUserItem {
  unreadCount: number; // 未读消息数
  status: 'online' | 'offline';
  userId: string;
  merchantId: string; // IM商户ID
  messageBody?: SessionGetMsg; // 最新聊天
  userType: number; // 用户类型 1=用户角色 2=运营角色
}

/**
 * 会话用户组
 */
export interface SessionGroup {
  groupId: string;
  users: GroupUserItem[];
}

/**
 * 会话用户信息
 */
export interface SessionUser extends GroupUserItem, AccountInfo {}

/**
 * 会话消息基础发送类型
 */
export interface SessionMsgBase {
  asset?: IMFile[]; // 资源信息
  chatType: number; // 1=群聊消息 2=私聊消息 3=客服消息       chatType=3 用户给客服发消息   chatType=1 客服给用户发消息
  command: SessionCommandEnum; // 收和发消息都为11
  content: string; // 消息内容
  createTime: number; // 消息时间
  msgType: SessionMsgTypeEnum; // 0:text、1:image、2:voice、3:video、4:music、5:news
  to?: string; // 接收者UID
  from: string; // 发送者UID
}

/**
 * 会话得到消息（单聊协议）
 */
export interface SessionGetMsg extends SessionMsgBase {
  id: string; // 消息ID
  seq: string; // 消息序列号
}

/**
 * 聊天消息
 */
export interface SessionChatItem extends SessionGetMsg {
  source?: number; // source 1=管理后台账号 2=用户
  name: string; // 发送者名称
  avatar: string; // 发送者头像
}

/**
 * 收到加入会话
 */
export interface SessionJoin extends SessionBase {
  group: string; // 群组ID
  user: GroupUserItem;
}

/**
 * 单次对话记录 - 请求参数
 */
export interface SinglePageListParams {
  categoryId: number | null; // 类别id（父级id）;示例值(1)
  endTime?: number; // 结束时间
  startTime?: number; // 开始时间
  subjectId: number | null; // 主题id
  uids: string; // uid集合
  current: number; // 页数
  size: number; // 单页大小
}

/**
 * 单次对话记录 - 请求参数
 */
export interface SinglePageListItem {
  total: number;
  pages: number;
  current: number; // 页数
  size: number; // 单页大小
  records: SinglePageListRecords[];
}

export interface SinglePageListRecords {
  categoryLabel: string; // 类别标签
  subjectLabel: string; // 主题标签
  categoryNameCn: string; // 类别名
  categoryNameEn: string; // 类别名
  cusName: string; // 客服
  endTime: number;
  msgSummary: string; // 概要
  lastName: string; // 最后一条消息的名称
  startTime: number;
  subjectNameCn: string;
  subjectNameEn: string;
  topicId: number; // 会话ID
  uid: string;
  userName: string;
  categoryDelFlag: number; // 类别删除状态 1为删除
  subjectDelFlag: number; // 主题删除状态 1为删除
  checked?: boolean;
}

/** 敏感词汇 */
export interface SensitiveLexiconItem {
  content: string;
  languageCode: string;
}

/**
 * 全部对话记录 - 请求参数
 */
export interface AllPageListParams {
  endTime?: number; // 结束时间
  startTime?: number; // 开始时间
  uids: string; // uid集合
  current: number; // 页数
  size: number; // 单页大小
}

/**
 * 全部对话记录 - 请求参数
 */
export interface AllPageListItem {
  total: number;
  pages: number;
  current: number; // 页数
  size: number; // 单页大小
  records: AllPageListRecords[];
}

export interface AllPageListRecords {
  id: number;
  avatar: number; // 头像
  endTime: number;
  msgSummary: string; // 概要
  lastName: string; // 最后一条消息的名称
  uid: string;
  userName: string;
  checked?: boolean;
}

/**
 * 获取全部会话消息 - 请求参数
 */
export interface getMsgAllParams {
  current: number; // 当前页数
  size: number; // 单页大小
  userId: string; // 用户ID
}

/**comm100 历史记录列表页 */
export interface Comm100Payloads {
  /** 商户ID */
  tenantId: string | null;
  /** 客服 */
  agent: string;
  /** 时间 */
  time: Array<number | Date | null>;
  uid: string;
  userName: string;
  /** 用户IP */
  playerIp: string;
}

export type Comm100Pick = Pick<Comm100Payloads, 'tenantId' | 'agent' | 'uid' | 'userName' | 'playerIp'>;

/**查询参数 */
export interface Comm100ApiPayloads extends Comm100Pick {
  current: number;
  size: number;
  startTime: string | undefined;
  endTime: string | undefined;
}

export interface Comm100List {
  agent: string;
  category: string;
  chatData: string;
  duration: string;
  endTime: number;
  playerIp: string;
  referralUrl: string;
  requestPage: string;
  startTime: number;
  tenantId: number;
  uid: string;
  userName: string;
}

export enum Agents {
  Moringa = 'Moringa',
  Peter = 'Peter',
  YF = '伊芙琳',
  JX = '佳欣',
  XQ = '小琪',
  XF = '幸福',
  PD = '彼得',
  WZX = '王祖贤',
  ZX = '知夏',
  LLS = '莉莉丝',
  XX = '萱萱',
  NE = '觅儿',
  AL = '阿璃',
  JINGX = '静香',
}
