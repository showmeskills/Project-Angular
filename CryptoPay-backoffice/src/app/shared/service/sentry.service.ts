import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular-ivy';
import { Extras, User } from '@sentry/types';
import { UserInfo } from 'src/app/shared/interfaces/common.interface';

@Injectable({
  providedIn: 'root',
})
export class SentryService {
  /**
   * 发送 sentry 报错
   *
   * @param name 错误名
   * @param extra sentry 记录日志内容
   * @param user 用户信息 {id: 1, username: 'xxx'}
   */
  error(name: string | Object | Error, extra: Extras, user?: User) {
    Sentry.captureException(this.errorObject(name), {
      extra,
      user,
    });
  }

  errorObject(errArg: string | Object | Error) {
    if (errArg instanceof Error) return errArg;

    const err = new Error();
    err.message = typeof errArg === 'string' ? errArg : errArg?.['message'] || JSON.stringify(errArg);
    err.stack = errArg?.['stack'] || err.stack;

    return err;
  }

  /**
   * 设置用户信息
   * @param user 用户信息
   */
  setUser(user?: UserInfo) {
    Sentry.setUser(user ? { ...user, username: user.userName, email: user.mail } : null);
  }
}
