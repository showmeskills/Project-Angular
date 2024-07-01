import { inject, Injectable, OnDestroy } from '@angular/core';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import {
  BehaviorSubject,
  delay,
  filter,
  finalize,
  forkJoin,
  mergeAll,
  Observable,
  of,
  race,
  Subject,
  switchMap,
  take,
} from 'rxjs';
import { SessionWsService } from 'src/app/pages/session/session-ws.service';
import {
  IMTopicReply,
  SessionChatItem,
  SessionCommandEnum,
  SessionGetMsg,
  SessionJoin,
  SessionList,
  SessionMsg,
  SessionMsgBase,
  SessionMsgTypeEnum,
  SessionUser,
  TopicCategory,
  TopicItem,
} from 'src/app/shared/interfaces/session';
import { AppService } from 'src/app/app.service';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { MemberApi } from 'src/app/shared/api/member.api';
import { cloneDeep } from 'lodash';
import { AccountInfo } from 'src/app/shared/interfaces/member.interface';
import { getWsDomain } from 'src/app/shared/models/tools.model';

@Injectable()
export class SessionService implements OnDestroy {
  private ls = inject(LocalStorageService);
  private service = inject(SessionWsService);
  private destroy$ = new Subject<void>();
  private appService = inject(AppService);
  private memberApi = inject(MemberApi);
  isLogin = false;
  curSessionPullMsg = false; // 当前会话是否拉取消息中

  /**
   * 用户列表
   */
  userList: SessionUser[] = [];

  /**
   * 消息加载变化
   */
  _msgLoadChange = new Subject<void>();

  get msgLoadChange$() {
    return this._msgLoadChange.asObservable().pipe(takeUntil(this.destroy$));
  }

  /**
   * 当前会话的用户
   */
  _curSession = new BehaviorSubject<SessionUser | null>(null);
  #_curSession = new BehaviorSubject<SessionUser | null>({
    unreadCount: 1, // 未读消息数
    status: 'online',
    userId: '01000229',
    merchantId: '1', // IM商户ID
    userType: 1, // 用户类型 1=用户角色 2=运营角色
    source: 2,
    uid: '01000229',
    tenantId: 1,
    name: '',
    avatar: '',
  });

  get curSession$() {
    return this._curSession.asObservable().pipe(takeUntil(this.destroy$));
  }

  get curSession() {
    return this._curSession.value;
  }

  set curSession(val) {
    if (this.curSession && this.curSession.uid === val?.uid) return;
    this.setCurSession(val);
  }

  /**
   * 设置当前会话
   * @param val
   */
  setCurSession(val: SessionUser | null) {
    this._curSession.next(val);
    this._curSessionMsg.next([]);
    this.getHistoryMsg();
    this.clearTopic();

    if (!val) return;

    val.unreadCount && this.readMsg(val.uid);
    this.getTopic(val.uid);
  }

  /**
   * 当前会话的消息
   */
  _curSessionMsg = new BehaviorSubject<SessionChatItem[]>([]);

  get curSessionMsg$() {
    return this._curSessionMsg.asObservable().pipe(takeUntil(this.destroy$));
  }

  get curSessionMsg() {
    return this._curSessionMsg.value;
  }

  set curSessionMsg(val) {
    this._curSessionMsg.next(val);
  }

  /**
   * 单个会话消息查看
   * @param val
   * @param topic
   */
  setSession(
    val: Omit<SessionUser, 'source' | 'tenantId' | 'unreadCount' | 'status' | 'userType'>,
    topic?: IMTopicReply
  ) {
    this._curSession.next(val as any);
    this._curSessionMsg.next([]);
    this.setTopic(topic);
  }

  /**
   * 话题分类
   */
  #curTopicCategory = new BehaviorSubject<TopicCategory | null>(null);
  get curTopicCategory() {
    return this.#curTopicCategory.value;
  }

  curTopicCategory$() {
    return this.#curTopicCategory.asObservable().pipe(takeUntil(this.destroy$));
  }

  /**
   * 当前会话设置话题生成的id（分类+话题组合设置后的id，操作使用 -> Ethon）
   */
  curSessionTopicId = 0;

  /**
   * 话题
   */
  #curTopic = new BehaviorSubject<TopicItem | null>(null);
  get curTopic() {
    return this.#curTopic.value;
  }

  curTopic$() {
    return this.#curTopic.asObservable().pipe(takeUntil(this.destroy$));
  }

  /**
   * 清除当前会话
   */
  clearCurSession() {
    this._curSession.next(null);
    this._curSessionMsg.next([]);
  }

  /**
   * 会话列表（群组列表）
   */
  sessionList: SessionUser[] = [];

  /**
   * 运营人员列表
   */
  customerList: SessionUser[] = [];

  /**
   * 当前商户
   * @param merchantId
   */
  merchantId = '';

  /**
   * 当前商户的客服群组ID（商户下运营人员的groupId是（100+商户id）的拼接字符串id）
   */
  get customerGroupId() {
    return '100' + this.merchantId;
  }

  connectSubject = new Subject<void>();

  /**
   * 初始化
   * @param merchantId 商户ID
   * @param isDialoguePage 是否在会话页面
   */
  async init(merchantId: string, isDialoguePage = true) {
    this.clearCurSession();
    this.merchantId = merchantId;

    // this.connectSubject.next();
    // this.connectSubject.complete();
    this.connectSubject = new Subject();
    this.connectSubject.pipe(takeUntil(this.destroy$)).subscribe({
      complete: () => this.appService.isContentLoadingSubject.next(false),
      error: () => this.appService.isContentLoadingSubject.next(false),
    });

    await this.service.disconnect();

    this.service.isConnect$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(!res);
    });

    this.service.connect(
      `${getWsDomain()}/im/ws?type=2&token=${this.ls.token}&merchantId=${merchantId}`,
      this.connectSubject
    );
    this.service.onMessage$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
      const closeLoading = (res: SessionMsg) => {
        this.appService.isContentLoadingSubject.next(false);
        return this.appService.showToastSubject.next({ msg: res.msg });
      };

      switch (res?.command) {
        /**
         * 登录
         */
        case SessionCommandEnum.LOGIN_REPLY:
          this.isLogin = res?.code === 10007;
          // token过期
          if (res?.code === 10022) {
            this.appService.jumpToLogin();
            return closeLoading(res);
          }
          if (res?.code !== 10007) return closeLoading(res);

          // 获取会话列表（群组列表）
          this.getSessionList();
          break;

        /**
         * 会话列表
         */
        case SessionCommandEnum.GET_USER_INFO_REPLY:
          this.isLogin = res?.code === 10000;
          if (!this.isLogin || !res?.data) return closeLoading(res);
          this.appService.isContentLoadingSubject.next(false);
          this.loadSessionList(res.data, isDialoguePage);
          break;

        /**
         * 收到消息
         */
        case SessionCommandEnum.SEND_MSG:
          this.onMsg(res.data);
          break;

        /**
         * 历史记录
         */
        case SessionCommandEnum.GET_MSG_REPLY:
          if (res?.code !== 10000) return closeLoading(res);
          this.addHistoryMsg(res.data);
          break;

        /**
         * 加入会话
         * @Description 新用户进入不用加入会话列表，只有用户发消息才加入会话列表
         */
        // case SessionCommandEnum.JOIN_GROUP_NOTIFY:
        //   if (res?.code !== 10000) return closeLoading(res);
        //   this.joinSession(res as SessionJoin);
        //   break;

        /**
         * 收到结束会话通知
         */
        case SessionCommandEnum.CHAT_END_NOTIFY:
          if (res?.code !== 10000) return;
          this.removeSessionUser(res.data.userId);
          break;

        /**
         * 聊天已读消息推送到运营通知
         */
        case SessionCommandEnum.READ_MSG_NOTIFY:
          if (res?.code !== 10000) return;
          this.unreadCountReset(res.data.fromUserId);
          break;

        /**
         * 聊天推送所有运营主题变更通知
         */
        case SessionCommandEnum.TOPIC_CHANGE_NOTIFY:
          if (res?.code !== 10000) return;
          this.setTopic(res.data);
          break;

        /**
         * 聊天推送所有运营重新加载IM的通知
         */
        case SessionCommandEnum.RELOAD_NOTIFY:
          if (res?.code !== 10000) return;
          this.getSessionList();
          this.curSession?.uid && this.getTopic(this.curSession.uid);
          break;

        /**
         * 错误消息
         */
        case SessionCommandEnum.Error:
          this.closeAllLoading();
          break;
      }
    });
  }

  /**
   * 加载会话列表
   */
  loadSessionList(res: SessionList, isDialoguePage: boolean) {
    this.appService.isContentLoadingSubject.next(false);

    const group = res.groups?.find((e) => e.groupId === this.merchantId)?.users || [];

    // 会员：userType = 1
    const memberList = group.filter((e) => e.userType === 1);

    // 运营：运营人员列表 PS: 商户下运营人员的groupId是（100+商户id）的拼接字符串id
    const adminList = res.groups?.find((e) => e.groupId === this.customerGroupId)?.users || [];

    // errorTips：仅在对话页面中展示
    if (isDialoguePage) {
      // 暂无会话列表
      if (!memberList.length) this.appService.showToastSubject.next({ msgLang: 'session.emptySessionList' });
      // 暂无客服列表
      if (!adminList.length) this.appService.showToastSubject.next({ msgLang: 'session.emptyCustomerService' });
    }

    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.memberApi.getBatchUserInfo(
        this.merchantId,
        2,
        memberList.map((e) => e.userId)
      ),
      this.memberApi.getBatchUserInfo(
        this.merchantId,
        1,
        adminList.map((e) => e.userId)
      ),
    ])
      .pipe(
        finalize(() => this.appService.isContentLoadingSubject.next(false)),
        map(([member, admin]) => {
          return [
            memberList.map((e) => {
              const curMember = { ...e, ...member.find((m) => m.uid === e.userId) };
              curMember.avatar = this.getAvatarPath(curMember.avatar);
              /** ============== Hook代码IM系统没法校验来源UID需要后期gogaming提供校验接口给im后台 ============== */
              curMember.uid = curMember.uid || curMember.userId;
              curMember.name = curMember.name || curMember.uid;
              return curMember;
            }) as SessionUser[],
            adminList.map((e) => {
              const curAdmin = { ...e, ...admin.find((m) => m.uid === e.userId) };

              curAdmin.avatar = `./assets/images/avatar/40_40.png`; // 管理账号没有头像用占位图
              /** ============== Hook代码IM系统没法校验来源UID需要后期gogaming提供校验接口给im后台 ============== */
              curAdmin.uid = curAdmin.uid || curAdmin.userId;
              curAdmin.name = curAdmin.name || curAdmin.uid;
              return curAdmin;
            }) as SessionUser[],
          ];
        })
      )
      .subscribe(([member, admin]) => {
        // 更新用户列表
        this.userList = cloneDeep(member);

        // 更新会话列表
        this.sessionList = member;

        // 更新运营人员列表
        this.customerList = admin;

        // 排序会话列表
        this.sortSessionList();

        // 方式2：直接刷新当前会话消息这样不会有历史消息不同步问题，体验也还能接受
        // 重连还有当前会话
        if (this.curSession) {
          const hasCurSession = this.sessionList.some((e) => e.uid === this.curSession!.uid);
          this.setCurSession(
            hasCurSession
              ? this.curSession // 如果重连还有当前会话，重新获取历史消息
              : null // 置空
          ); // 直接刷新当前会话消息
        }
      });
  }

  /**
   * 加入会话（放置用户缓存收到消息再添加列表）
   * {"code":10011,"command":9,"group":"1","msg":"join group ok! 加入群组成功!","user":{"nick":"郭杭州","status":"online","userId":"01001912"}}
   */
  joinSession(join: SessionJoin) {
    if (!join?.user?.userId) return console.warn('加入会话失败！：没有uid', join);
    // 只有用户才加入用户缓存列表
    if (join.group !== this.merchantId) return;
    // 是否存在用户列表
    if (this.userList.some((e) => e.uid === join.user.userId)) return;

    const source = join.group === this.customerGroupId ? 1 : 2;
    this.memberApi.getBatchUserInfo(this.merchantId, source, [join.user.userId]).subscribe((res) => {
      const matchUser = res.find((e) => e.uid === join.user.userId)!;
      if (!matchUser) {
        console.warn('加入用户缓存失败！没有匹配的用户信息，可能是运营账号：', join, res);
      } else {
        this.userList.push({
          ...join.user,
          ...matchUser,
          avatar: this.getAvatarPath(matchUser.avatar),
        });

        /**
         * 获取最近一条消息进来，如果有就头加会话列表 unshift
         */
        this.getHistoryMsg(join.user.userId, { count: 1 });
        console.info(join.user.userId, '加入用户缓存成功！', matchUser);
      }
    });
  }

  /**
   * 创建会话数据
   */
  createSessionMsg(res: SessionMsgBase) {
    let source = 1;
    let curUser: SessionUser | undefined;
    // 客服消息（取客服的from）
    if (res.chatType === 1) {
      curUser = this.customerList.find((e) => e.uid === res.from);
      source = 1;
    } else if (res.chatType === 3) {
      // 用户消息（取用户的from）
      curUser = this.userList.find((e) => e.uid === res.from);
      source = 2;
    }

    if (res['assetInfo']) {
      try {
        res.asset = JSON.parse(res['assetInfo']);
      } catch (e) {
        /* empty */
      }
    }

    res.asset = (res.asset || []).map((e) => ({ ...e, isLoaded: e.isLoaded === undefined || e.isLoaded })) as any;

    return {
      ...res,
      source,
      name: curUser?.name || `(${res?.from || '-'})`,
      avatar: curUser?.avatar || ``,
      id: '',
      // 前台：trackBy 格式=商户id-3位随机数-时间戳
      seq: res?.['seq'] || `${this.merchantId}-${Math.random().toString().slice(-3)}-${Date.now()}`,
    };
  }

  /**
   * 生成当前会话数据
   */
  createCurrentSessionMsg(res: SessionMsgBase | SessionMsgBase[]) {
    res = (Array.isArray(res) ? res : [res]).filter((e) => e);
    if (!res || !res?.length) return [];

    // 过滤出当前会话的消息
    res = res.filter((e) => e && this.compareChatUserId(e, this.curSession?.uid));

    return res.map((e) => this.createSessionMsg(e));
  }

  /**
   * 添加当前会话消息
   */
  pushCurrentSessionMsg(res: SessionMsgBase | SessionMsgBase[]) {
    const resMsg = this.createCurrentSessionMsg(res);
    if (!resMsg.length) return;
    this.curSessionMsg = [...this.curSessionMsg, ...resMsg];
  }

  /**
   * 前加当前会话消息
   */
  unshiftCurrentSessionMsg(
    res: SessionMsgBase | SessionMsgBase[],
    beforeCallback?: (res: SessionMsgBase[]) => void,
    callback?: (res: SessionMsgBase[]) => void
  ) {
    const resMsg = this.createCurrentSessionMsg(res);
    if (!resMsg.length) return;
    beforeCallback && beforeCallback(resMsg);
    this.curSessionMsg = [...resMsg, ...this.curSessionMsg];
    callback && callback(resMsg);
  }

  /**
   * 收到消息
   * @example {"command":11,"data":{"chatType":3,"cmd":11,"content":"66666666","createTime":1710182694162,"from":"907382910779461","id":"7c2b86dc0c9a436a868610666e5be6ca","msgType":0,"seq":"1767260425434378240"}}
   */
  async onMsg(res: SessionGetMsg) {
    if (!res) return;
    await this.checkAndAddSessionList(res);
    this.pushCurrentSessionMsg(res as any);
    this.updateSessionUserAndLastMsg([res]);
    this.updateUnreadCountByReceive(res);
  }

  /**
   * 更新未读数量
   * @desc 根据收到的消息更新未读数量
   */
  updateUnreadCountByReceive(msg: SessionGetMsg) {
    const uid = this.getChatUserId(msg);
    if (!uid) return;

    const cur = this.sessionList.find((e) => e.uid === uid);
    if (!cur) return;

    // 正在处理当前会话，发送已读协议不做处理
    if (this.curSession && uid === this.curSession.uid) {
      this.readMsg(uid);
    } else {
      cur.unreadCount = (+cur.unreadCount || 0) + 1;
    }
  }

  /**
   * 新消息进入 检查该用户是否添加会话列表
   */
  checkAndAddSessionList(data: SessionGetMsg) {
    return new Promise((resolve, reject) => {
      /**
       * 收到消息是 chatType=3 用户给客服发消息
       *  1. 需要检查会话列表是否存在这个用户，不存在则添加
       *  2. 并获取最近一条消息进来，通过消息来判断是否添加会话列表
       */
      // chatType=3 用户给客服发消息，会话里没有找到用户就添加
      if (data.chatType === 3 && !this.sessionList.some((e) => e.uid === data.from)) {
        // 查找用户缓存列表是否有这个用户
        let curUser = this.userList.find((e) => e.uid === data.from);

        const genSessionUser = (e: AccountInfo) => ({
          ...e,
          status: 'online' as const,
          userId: data.from,
          merchantId: String(e?.tenantId || this.merchantId),
          userType: 1,
          messageBody: data,
          unreadCount: 0,
        });

        of(curUser)
          .pipe(
            map<SessionUser | undefined, Observable<SessionUser>>((res) =>
              res !== undefined
                ? of(genSessionUser(res))
                : this.memberApi.getBatchUserInfo(this.merchantId, 2, [data.from]).pipe(
                    map((e) => (Array.isArray(e) ? e[0] : ({} as any))),
                    map((e) => ({
                      ...genSessionUser(e),
                      avatar: this.getAvatarPath(e.avatar),
                    })),
                    tap((e) => {
                      // 避免并发重复添加
                      this.userList = [...this.userList.filter((e) => e.uid !== data.from), e];
                    })
                  )
            ),
            mergeAll(),
            catchError((err) => {
              reject(err);
              throw new Error('加入用户会失败！：没有匹配用户信息');
            })
          )
          .subscribe((result) => {
            if (!result || result.uid !== data.from) {
              if (!result) {
                console.error('加入用户会失败！：没有匹配的用户信息', data.from, result);
                this.appService.showToastSubject.next({ msgLang: 'session.joinSessionFail' });
              }

              return reject('加入用户会失败！没有匹配用户信息：' + data.from);
            }

            // 避免并发重复添加
            this.sessionList = this.sessionList.filter((e) => e.uid !== result.uid);
            this.sessionList.unshift(result);

            resolve(result);
          });
      } else {
        resolve(null);
      }
    });
  }

  /**
   * 检查是否添加和更新会话列表数据，根据聊天消息
   * @example { chatType: 1, content: '4', createTime: 1710229192011, from: '907382910779461', groupId: '1001', msgType: 0, seq: '1767455451338715136', to: '01000299' }
   */
  updateSessionUserAndLastMsg(data: SessionGetMsg[], skipSort = false) {
    if (!data || !data.length) return;
    const lastMsg = data.slice(-1)[0];
    const uid = this.getChatUserId(lastMsg);

    // 查找当前会话
    let curSession = this.sessionList.find((e) => e.uid === uid) || this.userList.find((e) => e.uid === uid);
    if (!curSession || !curSession.uid) return;

    // 这里不用判断是否存在，因为获取记录是存在之后才会调用这个方法
    curSession = cloneDeep(curSession);
    if (
      // 如果没有任何记录也进行更新
      !curSession.messageBody?.createTime ||
      // 如果是拉取的历史记录，这里比对一下最近消息时间
      curSession.messageBody.createTime <= lastMsg.createTime
    ) {
      curSession.messageBody = lastMsg;
    }

    this.sessionList.splice(this.sessionList.findIndex((e) => e.uid === curSession?.uid) >>> 0, 1, curSession);
    !skipSort && this.sortSessionList();
  }

  /**
   * 按照会话时间降序
   */
  sortSessionList() {
    this.sessionList = this.sessionList.sort((a, b) => {
      const aTime = a.messageBody?.createTime || 0;
      const bTime = b.messageBody?.createTime || 0;
      return bTime - aTime;
    });
  }

  /**
   * 发送消息
   * @example {"cmd":11,"createTime":1710182694162,"chatType":"3","msgType": "0","content": "66666666"}
   */
  async sendMsg(content: string, data?: Partial<SessionMsgBase>) {
    if (!content || (!content && !data)) return;

    const session = this.curSession;
    if (!session)
      // TODO unique key 失败了！
      return this.appService.showToastSubject.next({
        key: 'session.chooseSession',
        msgLang: 'session.chooseSession',
      });

    const uid = String(this.ls.userInfo.id);
    const seq = `${this.merchantId}-${Math.random().toString().slice(-3)}-${Date.now()}`;
    const sendData: SessionGetMsg = {
      chatType: 1, // 用户的时候，type 传1 ，制定具体的用户 to
      content,
      createTime: Date.now(),
      msgType: SessionMsgTypeEnum.Text,
      to: session.uid,
      from: String(this.ls.userInfo.id),
      ...data,
      command: SessionCommandEnum.SEND_MSG,
      id: '',
      // 前台：trackBy 格式=商户id-3位随机数-时间戳
      seq,
      asset: (data?.asset || []).map((e) => {
        const res = { ...e };
        delete res.isLoaded;
        delete res['coverUrl'];
        delete res.url;
        return res;
      }),
    };

    // 如果自己发的没有在运营列表里，添加到运营列表
    if (!this.customerList.some((e) => e.uid === uid)) {
      const user: SessionUser = {
        source: 1,
        uid,
        tenantId: this.ls.userInfo.tenantId,
        name: this.ls.userInfo.userName,
        avatar: '',
        unreadCount: 0, // 未读消息数
        status: 'online',
        userId: uid,
        merchantId: this.merchantId, // IM商户ID
        userType: 2, // 用户类型 1=用户角色 2=运营角色
      };

      const curList = this.customerList.filter((e) => e.uid !== String(this.ls.userInfo.id));
      this.customerList = [...curList, user];
    }

    sendData.asset?.forEach((e) => {
      e['isLoaded'] = false;
    });

    this.pushCurrentSessionMsg(sendData);
    this.updateSessionUserAndLastMsg([sendData]);
    this.#data$(sendData, SessionCommandEnum.SEND_MSG, SessionCommandEnum.SEND_MSG_REPLY, (res) => {
      // 超时
      if (res.code === SessionCommandEnum.Timeout) {
        sendData.asset!.forEach((e) => {
          e['isLoaded'] = true;
        });
      }
      return res.seq === seq;
    }).subscribe((res) => {
      if (!res.data) return;

      const curIndex = this.curSessionMsg.findIndex((e) => e.seq === seq);

      if (curIndex === -1) return;

      // 替换资源
      const curMsg = this.curSessionMsg[curIndex];
      curMsg!.asset = (data?.asset || []).map((e) => ({
        ...e,
        ...(res.data.extras.asset || []).find((j) => j.fId === e.fId),
        isLoaded: true,
      }));

      // 替换敏感词
      if (res.data.filterFlag) {
        curMsg.content = res.data.filteredContent;

        // 替换最近一条消息
        if (this.curSession) {
          this.curSession.messageBody = curMsg;
        }
      }
    });
  }

  /**
   * 是否有历史记录
   */
  hasHistory() {
    return this.curSessionMsg.length >= 20;
  }

  /**
   * 获取历史消息
   * @param fromUserId 用户ID
   * @param data 消息参数
   * @param data.lastTime 获取历史消息时间
   * @param data.type 1=历史消息   2=离线记录
   * @param data.count 分页大小PageSize
   * @private
   */
  getHistoryMsg(
    fromUserId = this.curSession?.userId,
    data?: { type?: string; count?: number; lastTime?: number; fromUserId?: string }
  ) {
    const sendData = {
      fromUserId,
      count: data?.count || 20,
      lastTime: data?.lastTime || Date.now(),
      type: data?.type || '1', // 1=历史消息   2=离线记录
      ...data,
    };

    if (sendData.fromUserId === this.curSession?.uid) {
      this.curSessionPullMsg = true;
    }

    if (!sendData.fromUserId) return;
    this.service.send.GET_MSG(sendData);
  }

  /**
   * 当前历史消息加载
   */
  #curSessionHistoryLoadBefore$ = new Subject();

  get curSessionHistoryLoadBefore$() {
    return this.#curSessionHistoryLoadBefore$.asObservable().pipe(takeUntil(this.destroy$));
  }

  /**
   * 添加历史消息
   * @example { chatType: 1, content: '4', createTime: 1710229192011, from: '907382910779461', groupId: '1001', msgType: 0, seq: '1767455451338715136', to: '01000299' }
   * @param data
   */
  addHistoryMsg(data: SessionGetMsg[]) {
    if (!data || !data.length) return;
    this.updateSessionUserAndLastMsg(data);
    this.unshiftCurrentSessionMsg(data, (res) => {
      const uid = this.getChatUserId(res?.[0]);
      uid && uid === this.curSession?.uid && this.#curSessionHistoryLoadBefore$.next(res);
    });
  }

  /**
   * 移除会话中用户
   */
  removeSessionUser(uid: string) {
    this.sessionList = this.sessionList.filter((e) => e.uid !== uid);
    // 如果当前会话是这个用户，清除当前会话
    if (this.curSession?.uid === uid) {
      this.clearCurSession();
      this.appService.showToastSubject.next({ msgLang: 'session.chat.curEnd' });
    }
  }

  /**
   * 比较聊天用户id
   */
  compareChatUserId(user: SessionMsgBase, uid: string | undefined | null): boolean {
    return this.getChatUserId(user) === uid;
  }

  /**
   * 获取聊天用户id
   */
  getChatUserId(user?: SessionMsgBase) {
    if (!user) return '';

    let uid = '';
    // chatType=1 客服给用户发消息
    if (user.chatType === 1) {
      uid = user.to || '';
      // chatType=3 用户给客服发消息
    } else if (user.chatType === 3) {
      uid = user.from;
    }

    return uid;
  }

  /**
   * 获取头像地址
   */
  getAvatarPath(ava: string | null | undefined) {
    let avatar = '40_40';
    if (ava && ava.startsWith('avatar-')) {
      avatar = ava;
    } else if (['http', '//'].some((e) => e.startsWith(ava || ''))) {
      return ava as string;
    }

    return `./assets/images/avatar/${avatar}.png`;
  }

  /**
   * 关闭所有loading
   */
  closeAllLoading() {
    this.curSessionPullMsg = false;
    this.appService.isContentLoadingSubject.next(false);
  }

  /**
   * 结束会话
   */
  endCurrentSession(fromUserId: string) {
    this.appService.isContentLoadingSubject.next(true);
    return this.#data$({ fromUserId }, SessionCommandEnum.CHAT_END, SessionCommandEnum.CHAT_END_REPLY).pipe(
      finalize(() => this.appService.isContentLoadingSubject.next(false)),
      tap(() => {
        this.removeSessionUser(fromUserId);
      })
    );
  }

  /**
   * 加载列表
   */
  getSessionList() {
    this.service.send.GET_USER_INFO({ type: 0 });
  }

  /**
   * 订阅一次数据
   * @param value
   * @param sendType
   * @param type
   * @param filterMsg 慎用，除非消息一定会到达你的预期！！！进一步筛选消息，返回true表示通过，false不通过直到返回超时
   * @private
   */
  #data$<T>(
    value: T,
    sendType: SessionCommandEnum,
    type: SessionCommandEnum,
    filterMsg?: (res: any) => boolean
  ): Observable<SessionMsg> {
    return of(value).pipe(
      tap(() => this.service.send[SessionCommandEnum[sendType]](value)),
      switchMap(() =>
        race(
          of({ code: SessionCommandEnum.Timeout, command: type, msg: `received ${type} timeout` }).pipe(delay(5_000)), // 5s 没收到 超时
          this.service.onMessage$.pipe(
            filter((e) => e.command === type),
            filter((res) => (filterMsg ? filterMsg(res) : true)),
            takeUntil(this.destroy$),
            take(1)
          )
        )
      ),
      take(1),
      tap((res) => {
        if (res?.code !== 10000) return this.appService.showToastSubject.next({ msg: res.msg });
      }),
      filter((e) => e.code === 10000)
    );
  }

  /**
   * 读消息
   */
  readMsg(fromUserId: string) {
    this.#data$({ fromUserId }, SessionCommandEnum.READ_MSG, SessionCommandEnum.READ_MSG_REPLY).subscribe(() => {
      // this.unreadCountReset(fromUserId);
    });
  }

  /**
   * 更新未读消息数
   * @param uid
   * @private
   */
  private unreadCountReset(uid: string) {
    const cur = this.sessionList.find((e) => e.uid === uid);
    if (!cur) return;
    cur.unreadCount = 0;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.service.disconnect();
    this.connectSubject?.complete();
    this.closeAllLoading();
  }

  /**
   * 获取话题的协议
   * @private
   */
  private getTopic(userId: string) {
    this.#data$(
      { userId, merchantId: this.merchantId },
      SessionCommandEnum.GET_TOPIC,
      SessionCommandEnum.GET_TOPIC_REPLY
    ).subscribe((res) => res.data && this.setTopic(res.data));
  }

  /**
   * 处理并设置话题
   */
  setTopic(data: IMTopicReply | undefined) {
    if (!data || this.curSession?.uid !== data?.uid) return; // 没有设置会话主题

    this.#curTopicCategory.next(data?.categoryRespBody || null);
    this.#curTopic.next(data?.subjectRespBody || null);
    this.curSessionTopicId = data.id || 0;
  }

  /**
   * 清除话题
   */
  clearTopic(skipClearIMTopicId = false) {
    !skipClearIMTopicId && (this.curSessionTopicId = 0);
    this.#curTopicCategory.next(null);
    this.#curTopic.next(null);
  }
}
