import { inject, Injectable } from '@angular/core';
import { captureException, setUser } from '@sentry/angular-ivy';
import { Extras, User } from '@sentry/types';
import { UserInfo } from 'src/app/shared/interfaces/common.interface';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class SentryService {
  private ls = inject(LocalStorageService);

  /**
   * 发送 sentry 报错
   *
   * @param name 错误名
   * @param extra sentry 记录日志内容
   * @param user 用户信息 {id: 1, username: 'xxx'}
   */
  async error(name: string | Object | Error, extra: Extras, user?: User) {
    if (!this.ls.ip) {
      await this.setUser({});
    }

    captureException(this.errorObject(name), {
      extra: extra,
      user,
    });
  }

  errorObject(errArg: string | Object | Error) {
    if (errArg instanceof Error) return errArg;

    const err = new Error();
    err.message = typeof errArg === 'string' ? errArg : errArg?.['message'] || JSON.stringify(errArg);
    err.stack = errArg?.['stack'] || err.stack;
    err.cause = errArg?.['cause'] || err.cause;

    return err;
  }

  private cacheUserInfo: User = {};
  /**
   * 设置用户信息
   * @param user 用户信息
   */
  async setUser(user?: UserInfo | User) {
    const ip = this.ls.ip || (await this.getIp());

    this.cacheUserInfo = user
      ? {
          ...this.cacheUserInfo,
          ...(user ? { ip_address: ip, ...user, username: user.userName, email: user.mail } : null),
        }
      : { ip_address: ip };
    setUser(user ? this.cacheUserInfo : null);
  }

  /**
   * 获取用户IP
   */
  cacheRequestIP: Promise<string>;
  async getIp() {
    if (this.ls.ip) return this.ls.ip;
    if (this.cacheRequestIP) return this.cacheRequestIP;
    this.cacheRequestIP = fetch('https://api.ipify.org?format=json')
      .then((r) => r.json())
      .then((r: { ip: string }) => r.ip)
      .catch(() => '');

    this.ls.ip = await this.cacheRequestIP;
    return this.cacheRequestIP;
  }
}
