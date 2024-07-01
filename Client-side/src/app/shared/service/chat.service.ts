import { DestroyRef, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Subject, Subscription, filter, firstValueFrom, takeUntil, timer } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ChatMessageClass, MATCH_MIX_REGEXP } from 'src/app/pages/chat/message-item/chat-message-class';
import {
  ChatCsMsgItem,
  ChatGetHistory,
  ChatHistoryMsgItem,
  ChatMessage,
  ChatSendMsg,
  ChatUnreadCountData,
  ChatWsReceived,
  ChatWsSendResponse,
} from 'src/app/shared/interfaces/chat.interface';
import { PopupService } from 'src/app/shared/service/popup.service';
import { environment } from 'src/environments/environment';
import { ChatComponent } from '../../pages/chat/chat.component';
import { ChatApi } from '../apis/chat.api';
import { GnService } from './global-notification.service';
import { LayoutService } from './layout.service';
import { LocalStorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    private appService: AppService,
    private popup: PopupService,
    private chatApi: ChatApi,
    private layout: LayoutService,
    private destroyRef: DestroyRef,
    private localStorageService: LocalStorageService,
    private gnService: GnService,
  ) {}

  /**uid 同平台用户id */
  uid = '';
  /**是否启用聊天 */
  chatEnabled = false;
  /**是否启用聊天与访问权限中间判断 */
  chatConfig = false;
  /**聊天是否打开中 */
  chatActive = signal(false);
  /**连接令牌 */
  chatToken: string = '';
  /**消息长连接 */
  private connection: WebSocket | null = null;
  /**是否已由用户销毁 */
  isUserDestory = false;

  /**长连接活着 */
  wsAlive$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**聊天禁言 true=>已禁言 false=>未禁言 */
  muteState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**重连订阅 */
  reConnectionSubscription: Subscription | null = null;

  /**拉取历史加载中 */
  loadingHistory$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**是否还有历史消息 */
  hasMore = true;
  /**更新历史消息时候是否充值消息列表 */
  needCleanMsgList = true;
  /**历史消息超时，必须存在，才会处理历史消息的响应 */
  historyWaiter: Subscription | null = null;
  /**单次获取历史消息的长度 */
  historyOnceCount = 10;

  /**消息 */
  messages: ChatMessageClass[] = [];
  /**指定消息滚动位置 */
  scrollToIndex$: Subject<number | 'bottom' | 'top'> = new Subject();
  /**上一次滚动的位置 */
  lastScrollIndex?: number;

  /**消息之间显示时间的间隔 */
  showTimeSeptal = 10 * 60 * 1000;

  /**未读消息总数 */
  unreadCount = 0;
  /**是否需要清除已读 */
  needcleanUnread = false;

  /**上传能接受的格式和大小等配置 */
  imgAcceptOpt = [
    { type: 'image/jpg', name: 'jpg', category: 'image', placeholder: '[IMAGE]', size: 1024 * 1024 * 5, msgType: 1 },
    { type: 'image/jpeg', name: 'jpeg', category: 'image', placeholder: '[IMAGE]', size: 1024 * 1024 * 5, msgType: 1 },
    { type: 'image/png', name: 'png', category: 'image', placeholder: '[IMAGE]', size: 1024 * 1024 * 5, msgType: 1 },
    { type: 'image/bmp', name: 'bmp', category: 'image', placeholder: '[IMAGE]', size: 1024 * 1024 * 5, msgType: 1 },
    { type: 'image/gif', name: 'gif', category: 'image', placeholder: '[IMAGE]', size: 1024 * 1024 * 5, msgType: 1 },
    { type: 'image/webp', name: 'webp', category: 'image', placeholder: '[IMAGE]', size: 1024 * 1024 * 5, msgType: 1 },
    { type: 'video/mp4', name: 'mp4', category: 'image', placeholder: '[VIDEO]', size: 1024 * 1024 * 100, msgType: 3 },
    {
      type: 'video/quicktime',
      name: 'mov',
      category: 'image',
      placeholder: '[VIDEO]',
      size: 1024 * 1024 * 100,
      msgType: 3,
    },
    {
      type: 'application/pdf',
      name: 'pdf',
      category: 'file',
      placeholder: '[FILE]',
      size: 1024 * 1024 * 5,
      msgType: 7,
    },
  ];

  init() {
    // 从商户配置里获取是否启用聊天
    this.chatConfig = JSON.parse(this.appService.tenantConfig?.config?.chatEnabled || 'false');
    this.uid = this.localStorageService.localUserInfo?.uid || '';
    // 初始化token
    if (!this.initToken()) return;
    // 初始化系统级通知
    this.gnService.init();
    // 订阅退出ws
    this.appService.chatLogout$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.logout());
    // 切换h5时候关闭显示的聊天窗口
    this.layout.isH5$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.chatActive()) this.closeChat();
    });
    // 聚焦回来后执行动作
    this.layout.pageVisible$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      if (v === 'focus') this.refresh();
    });
  }

  /**获取ws连接需要的token */
  async initToken() {
    const { appId, appSecret } = JSON.parse(this.appService.tenantConfig?.config?.chatConfig || '{}');
    // 未启用chat、未登录或无uid，中止
    if (!this.chatConfig || !appId || !appSecret || !this.uid || !this.localStorageService.loginToken) return false;
    // 请求令牌
    const response = await firstValueFrom(this.chatApi.generateToken(this.uid, appId, appSecret));
    if (!response?.data?.access) {
      this.chatEnabled = false;
      return false;
    }
    if (response?.data?.accesstoken) {
      console.log('chat令牌获取成功,正在建立ws连接...');
      this.chatToken = response.data.accesstoken;
      this.chatEnabled = true;
      this.isUserDestory = false;
      this.connectionInit();
    } else {
      console.log('chat令牌获取失败,终止活动!');
    }

    return true;
  }

  /**chat连接 */
  connectionInit() {
    if (!this.chatToken || this.isUserDestory) return;
    this.reConnectionSubscription?.unsubscribe();
    this.reConnectionSubscription = null;
    const domain = environment.chatSignalrUrl.split('://');
    const url = { http: 'ws://', https: 'wss://' }[domain[0]] + domain[1] + '?type=1&token=' + this.chatToken;
    this.connection = new WebSocket(url);
    this.connection.onmessage = e => {
      this.received(JSON.parse(e?.data || 'null'));
    };
    this.connection.onerror = () => {
      if (!this.wsAlive$.value) {
        // 重连
        this.reConnection();
      }
    };
    this.connection.onclose = () => {
      // ws关闭了，停止心跳、销毁等
      this.wsAlive$.next(false);
      // 销毁
      this.connection = null;
      if (this.isUserDestory) {
        this.chatToken = '';
        this.messages = [];
        console.log('chat成功关闭');
      } else {
        // 重连
        this.reConnection();
      }
    };
  }

  /**chat重连 */
  reConnection() {
    if (this.reConnectionSubscription) return;
    console.log('chat连接失败或断了,10S后自动重连...');
    this.reConnectionSubscription = timer(10 * 1000).subscribe(() => this.connectionInit());
  }

  /**发聊天消息 cmd=11 */
  send(msg: ChatSendMsg) {
    const msgitem = { ...msg, from: this.uid, showTime: false };
    switch (msg.msgType) {
      case 0: // 文字
        this.updataMessagesList([{ ...msgitem, status: -1 }], 'push');
        break;
      case 1: // 图片
      case 3: // 视频
      case 7: // 文档
        this.updataMessagesList([{ ...msgitem, status: -2 }], 'push');
        break;
      default:
        break;
    }
  }

  sendMsg(msg: ChatSendMsg) {
    this.wsSend(11, { chatType: 3, ...msg });
  }

  /**退出 cmd=14 */
  logout() {
    this.isUserDestory = true;
    this.wsSend(14);
  }

  /**心跳 cmd=13 */
  heartbeat() {
    timer(0, 5 * 1000)
      .pipe(takeUntil(this.wsAlive$.pipe(filter(x => !x))))
      .subscribe(() => {
        this.wsSend(13);
      });
  }

  /**全部已读 cmd=21 */
  readAll() {
    if (!this.needcleanUnread) return;
    this.wsSend(21);
  }

  /**获取未读数量 cmd=23 */
  getUnreadCount() {
    this.wsSend(23);
  }

  /**获取历史 cmd=19 */
  getHistory(lastTime?: number) {
    if (this.loadingHistory$.value) return;
    this.loadingHistory$.next(true);
    const param: ChatGetHistory = {
      command: 19,
      count: this.historyOnceCount,
      type: 1,
    };
    if (lastTime) param.lastTime = lastTime;
    this.wsSend(param.command, param);
    this.historyWaiter = timer(10 * 1000).subscribe(() => {
      this.loadingHistory$.next(false);
      this.historyWaiter = null;
    });
  }

  /**
   * 最终发出ws消息
   *
   * @param command
   * @param param
   */
  wsSend(command: number, param: { [key: string | number]: unknown } | object = {}) {
    this.connection?.send(
      JSON.stringify({
        ...param,
        command: command,
      }),
    );
  }

  /**
   * 更新消息到消息列表
   *
   * @param msgs 需要更新的消息
   * @param mode 要附加到开头还是末尾
   */
  updataMessagesList(msgs: ChatMessage[], mode: 'unshift' | 'push') {
    // 目前时间对比逻辑：
    // -如果要插入位置的前面没有更早的消息，就处理 msgs 内部对比即可
    // -如果要插入位置的前面有消息，则往前查找最近有显示时间那条消息，对比判断处理新 msgs 的时间是否显示
    let lastShowTime = 0;
    if (mode === 'push') {
      // 从末尾往前遍历查找 showTime 是 true 的消息，获取它的时间
      for (let i = this.messages.length - 1; i >= 0; i--) {
        const item = this.messages[i];
        if (!item) {
          break;
        } else if (item.showTime) {
          lastShowTime = item.createTime;
          break;
        } else {
          lastShowTime = item.createTime;
        }
      }
    }
    msgs.forEach(item => {
      if (item.createTime - lastShowTime >= this.showTimeSeptal) {
        lastShowTime = item.createTime;
        item.showTime = true;
      } else {
        item.showTime = false;
      }
    });
    switch (mode) {
      case 'unshift':
        this.messages.unshift(...msgs.map(x => new ChatMessageClass(x)));
        break;
      case 'push':
        this.messages.push(...msgs.map(x => new ChatMessageClass(x)));
        this.scrollToIndex$.next('bottom');
        break;
      default:
        break;
    }
  }

  /**
   * 更新指定seq的消息位置，更新时间，并触发重发
   *
   * @param seq
   */
  updataMessagesListByReSend(seq: string) {
    const index = this.messages.findIndex(x => x.seq === seq);
    if (index > -1) {
      let lastShowTime = 0;
      // 从末尾往前遍历查找 showTime 是 true 的消息，获取它的时间
      for (let i = this.messages.length - 1; i >= 0; i--) {
        if (i === index) continue;
        const item = this.messages[i];
        if (!item) {
          break;
        } else if (item.showTime) {
          lastShowTime = item.createTime;
          break;
        } else {
          lastShowTime = item.createTime;
        }
      }
      // 更新时间
      this.messages[index].setCreateTime(Date.now());
      if (this.messages[index].createTime - lastShowTime >= this.showTimeSeptal) {
        this.messages[index].setShowTime(true);
      } else {
        this.messages[index].setShowTime(false);
      }
      // 重置状态并触发处理
      switch (this.messages[index].failType) {
        case 1:
          this.messages[index].setStatus(-1);
          break;
        case 2:
          this.messages[index].setStatus(-2);
          break;
        default:
          break;
      }
      this.messages[index].component?.processStatus();
      // 更新位置
      this.messages.push(...this.messages.splice(index, 1));
      this.scrollToIndex$.next('bottom');
    }
  }

  /**收到消息 */
  async received(data: ChatWsReceived | null) {
    if (!data) return;
    switch (data.command) {
      case 6: {
        if (data.code === 10007) {
          // 登录成功
          console.log('chat登录成功: ', data.user);
          // 设置禁言状态
          this.muteState$.next(data.user?.muteStatus === 1);
          // 销毁重连订阅
          this.reConnectionSubscription?.unsubscribe();
          this.reConnectionSubscription = null;
          // 报告全局
          this.wsAlive$.next(true);
          // 标记下一次历史消息响应时候先清空消息列表
          this.needCleanMsgList = true;
          // 重置更多历史消息的判断
          this.hasMore = true;
          // 初始获取一次历史记录
          this.getHistory();
          // 获取未读消息数量
          this.getUnreadCount();
          // 开始心跳
          this.heartbeat();
          break;
        }
        if (data.code === 10008) {
          // 登录失败
          console.log('chat登录失败');
          this.reConnection();
          break;
        }
        if (data.code === 10022) {
          // token过期
          console.log('chat登录失败,token已过期!');
          this.initToken();
          break;
        }
        break;
      }
      case 11: {
        // 收到客服的聊天消息
        if (data.data) {
          const msgs: ChatMessage[] = [];
          ([data.data].flat() as ChatCsMsgItem[]).forEach(x => {
            // 处理通知文字
            let notificationText = x.content.replace(/\n|\r/g, '').replace(/\s+/g, ' ');
            if (x.msgType !== 0) {
              notificationText = notificationText.replace(new RegExp(MATCH_MIX_REGEXP, 'gi'), (m, id) => {
                let r = m;
                if (x.asset) {
                  const assetItem = x.asset.find(x => String(x.fId) === id) ?? x.asset[0];
                  r = this.imgAcceptOpt.find(x => x.name === (assetItem?.type ?? '').toLowerCase())?.placeholder ?? '';
                }
                return r;
              });
            }
            // 调用系统通知服务
            this.gnService.showChatNotification(notificationText);
            // 收集
            msgs.push({ ...x, showTime: false });
          });
          this.updataMessagesList(msgs, 'push');
          // 非打开状态，消息累加
          if (!this.chatActive()) this.unreadCount += msgs.length;
          // 标记后续需要清除未读
          this.needcleanUnread = true;
        }
        break;
      }
      case 12: {
        // 自己发送的聊天消息的响应
        const index = this.messages.findIndex(x => x.seq === data.seq);
        if (index > -1) {
          switch (data.code) {
            case 10000:
              if (this.messages[index].status !== 0) {
                this.messages[index].setStatus(1);
                const res = data.data as ChatWsSendResponse;
                if (res.extras || res.filteredContent) {
                  this.messages[index].component?.buildContents(res.extras?.asset, res.filteredContent);
                }
              }
              break;
            case 10025:
              // 消息发送频繁
              this.messages[index].setStatus(0, 'sendTooFast');
              break;
            default:
              this.messages[index].setStatus(0, 'sendResponseFail');
              break;
          }
          this.messages[index].component?.clean();
        }
        break;
      }
      case 20: {
        // 请求19历史消息响应
        if (this.historyWaiter) {
          this.historyWaiter?.unsubscribe();
          this.historyWaiter = null;
          if (data.data) {
            if (this.needCleanMsgList) {
              this.messages = [];
              this.needCleanMsgList = false;
            }
            const msgs: ChatMessage[] = (data.data as ChatHistoryMsgItem[]).map(x => {
              return {
                ...x,
                showTime: false,
              } as ChatMessage;
            });
            const length = msgs.length;
            if (length > 0) this.updataMessagesList(msgs, 'unshift');
            this.hasMore = length >= this.historyOnceCount;
          }
          this.loadingHistory$.next(false);
        }
        break;
      }
      case 22:
        // 请求21标记已读的响应
        this.unreadCount = 0;
        this.needcleanUnread = false;
        break;
      case 24:
        // 请求23的未读数量响应
        if (data.data) {
          this.unreadCount = (data.data as ChatUnreadCountData).count;
          this.needcleanUnread = this.unreadCount > 0;
        }
        break;
      case 16:
        // 请求15撤回的消息响应
        break;
      case 1029:
        // 收到禁言状态更新 1:禁言 2:正常
        if (data.muteStatus) {
          this.muteState$.next(data.muteStatus === 1);
        }
        break;
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 13:
      case 14:
      case 7:
      case 8:
      case 9:
      case 10:
      case 18:
      case 26:
      case 1030:
        // 这个集合是对前端无意义的可以忽略的消息，有需要可以查询下面文档
        // https://gbd730.atlassian.net/wiki/spaces/GOL/pages/2545287246/ImChat
        break;
      case 0:
        console.log('chat报告了一个错误内容: ', data);
        break;
      default:
        console.log('chat收到意料之外的内容: ', data);
        break;
    }
  }

  /**刷新chat内容（用于页面重新聚焦后同步状态） */
  refresh() {
    // 暂无需处理
  }

  /**用于web显示时候的开关 */
  chatPop = false;

  /**用于h5时候chat弹窗的引用 */
  chatPopup?: MatDialogRef<ChatComponent>;

  /**显示/关闭chat窗口 */
  toggleChat(isH5?: boolean, value?: boolean) {
    if (value !== undefined) {
      value ? this.openChat(isH5) : this.closeChat();
      return;
    }
    const active = this.chatActive();
    active ? this.closeChat() : this.openChat(isH5);
  }

  /**显示chat窗口 */
  openChat(isH5: boolean = false) {
    if (isH5) {
      this.chatPopup = this.popup.open(ChatComponent, {
        disableClose: true,
        speed: 'faster',
        hasBackdrop: false,
        autoFocus: false,
        inAnimation: 'fadeInRight',
        outAnimation: 'fadeOutRight',
        isFull: true,
        panelClass: 'mask-penetration',
      });
    } else {
      this.chatPop = true;
    }
    this.chatActive.set(true);
  }

  /**关闭chat窗口 */
  closeChat() {
    this.chatPopup?.close();
    this.chatPop = false;
    this.chatActive.set(false);
  }
}
