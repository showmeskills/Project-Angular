import { Injectable } from '@angular/core';
import { SessionService } from 'src/app/pages/session/session.service';
import { IMTopicReply, SessionMsgBase, SessionUser } from 'src/app/shared/interfaces/session';
import { cloneDeep } from 'lodash';

@Injectable()
export class SessionDetailService extends SessionService {
  /**
   * 单个会话消息查看
   * @param val
   * @param topic
   */
  setData(val: Omit<SessionUser, 'source' | 'tenantId' | 'unreadCount' | 'status' | 'userType'>, topic?: IMTopicReply) {
    val = cloneDeep(val);
    this._curSession.next(val as any);
    this._curSessionMsg.next([]);
    this.setTopic(topic);
  }

  /**
   * 创建会话数据
   */
  override createSessionMsg(res: SessionMsgBase) {
    let source = 1;
    let curUser: SessionUser | undefined;
    // 客服消息（取客服的from）
    if (res.chatType === 1) {
      curUser = {
        userId: res.from,
        userType: 2,
        uid: res.from,
        name: res['userName'],
        avatar: '',
      } as any;
      source = 1;
    } else if (res.chatType === 3) {
      // 用户消息（取用户的from）
      curUser = {
        userId: res.from,
        userType: 1,
        uid: res.from,
        name: res['userName'],
        avatar: this.curSession?.avatar,
      } as any;
      source = 2;
    }

    return {
      ...res,
      source,
      name: curUser?.name || `(${res?.from || '-'})`,
      avatar: curUser?.avatar || ``,
      id: '',
      // 前台：trackBy 格式=商户id-3位随机数-时间戳
      seq: `${this.merchantId}-${Math.random().toString().slice(-3)}-${Date.now()}`,
    };
  }
}
