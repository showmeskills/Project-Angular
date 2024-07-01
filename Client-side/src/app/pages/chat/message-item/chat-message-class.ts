import { ChatMessage, ChatMsgAsset } from 'src/app/shared/interfaces/chat.interface';
import { MessageItemComponent } from './message-item.component';

export const SPLIT_MIX_REGEXP = '(#\\{[+-]?\\d+\\}#)';
export const MATCH_MIX_REGEXP = '#\\{([+-]?\\d+)\\}#';

export type FailReason =
  | 'sendTimeout'
  | 'uploadResponseTimeout'
  | 'keyFileInvalid'
  | 'keyDataInvalid'
  | 'sendResponseFail'
  | 'riskFile'
  | 'uploadTooFast'
  | 'sendTooFast';

export class ChatMessageClass implements ChatMessage {
  private _from = '';
  get from() {
    return this._from;
  }
  private _seq = '';
  get seq() {
    return this._seq;
  }
  private _createTime = 0;
  get createTime() {
    return this._createTime;
  }
  private _msgType = 0;
  get msgType() {
    return this._msgType;
  }
  private _content = '';
  get content() {
    return this._content;
  }
  private _showTime = false;
  get showTime() {
    return this._showTime;
  }
  private _status?: number;
  get status() {
    return this._status;
  }
  private _asset: ChatMsgAsset[] = [];
  get asset() {
    return this._asset;
  }
  private _progress: number = 0;
  get progress() {
    return this._progress;
  }
  private _failType = 0;
  /**失败的类型，
   * `0` 未知失败，
   * `1` 重新发送ws，
   * `2` 需要重新上传再发送ws
   * `3` 风险文件，显示风险，应该停止触发、不显示重发按钮
   */
  get failType() {
    return this._failType;
  }

  component?: MessageItemComponent;

  constructor(data: ChatMessage) {
    this._from = data.from;
    this._seq = data.seq;
    this._createTime = data.createTime;
    this._msgType = data.msgType;
    this._content = data.content;
    this._showTime = data.showTime;
    this._from = data.from;
    this._status = data.status;
    if (data.asset) this._asset = data.asset;
  }

  /**
   * 更新状态消息状态
   *
   * @param {number} status 要更新的状态
   * - `-1` 正在发送
   * - `-2` 等待上传
   * - `0` 未发送成功
   * - `1` 已发送成功
   * - `2` 上传进行中
   * @param {string} reason 失败的原因，字符串方便追溯和阅读代码
   * - `sendTimeout` 消息已发送，ws超时无响应
   * - `uploadResponseTimeout` 上传文件时，超时无进度报告
   * - `keyFileInvalid` 上传文件时，关键文件无效
   * - `keyDataInvalid` 上传文件时，关键数据无效
   * - `sendResponseFail` 消息已发送，ws响应此操作失败
   * - `riskFile` 上传文件存在风险
   * - `uploadTooFast` 上传太快了
   * - `sendTooFast` 发送太快了
   */
  setStatus(status?: number, reason?: FailReason) {
    if (status === 0) {
      switch (reason) {
        case 'sendTimeout':
        case 'sendResponseFail':
        case 'sendTooFast':
          this._failType = 1;
          break;
        case 'uploadResponseTimeout':
        case 'keyFileInvalid':
        case 'keyDataInvalid':
        case 'uploadTooFast':
          this._failType = 2;
          break;
        case 'riskFile':
          this._failType = 3;
          break;
        default:
          this._failType = 0;
          break;
      }
      this.component?.showTips(reason);
    }
    this._status = status;
  }

  /**更新是否显示时间 */
  setShowTime(showTime: boolean) {
    this._showTime = showTime;
  }

  /**更新时间 */
  setCreateTime(createTime: number) {
    this._createTime = createTime;
  }

  /**更新为远程资源，清理 localData */
  setAsset(newAsset: ChatMsgAsset[]) {
    this._asset = newAsset;
  }

  /**更新消息内容 */
  setContent(newContent: string) {
    this._content = newContent;
  }

  /**设置上传进度 */
  setProgress(v: number) {
    this._progress = Math.floor(v);
  }

  /**设置component引用 */
  mountsTo(comp: MessageItemComponent) {
    this.component = comp;
  }
}
