/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular-ivy';
import { Extras, Primitive, SeverityLevel } from '@sentry/types';
import { environment } from 'src/environments/environment';
import { API_ERROR_CODE_MAP, URL_REGEXP_MAP } from '../apis/error-code';
import { AccountInforData } from '../interfaces/account.interface';
import { IP_KEY, LOCAL_USER_INFO, LocalKeyPrefix } from './localstorage.service';

interface errorInfo {
  /**错误等级，可选 */
  level?: SeverityLevel;
  /**额外附加的数据 */
  extra?: Extras;
  /**额外附加的标签（方便筛选） */
  tags?: {
    [key: string]: Primitive;
  };
}

@Injectable({
  providedIn: 'root',
})
class SentryService {
  /**
   * 发送普通错误
   *
   * @param name 错误名称
   * @param message 错误消息
   * @param errorInfo 可选的，设置更多错误信息
   */
  error(name: string, message: string, errorInfo: errorInfo = {}) {
    Sentry.captureException(new SentryError(name, message), errorInfo);
  }

  /**
   * 设置当前用户
   */
  async setUser() {
    // 默认值
    let username = '';
    let id = '';
    let ip_address = 'unknown';
    // 本地查找
    const ip = window.localStorage.getItem(LocalKeyPrefix + IP_KEY);
    const userString = window.localStorage.getItem(LocalKeyPrefix + LOCAL_USER_INFO) || 'null';
    const user: AccountInforData | null = JSON.parse(userString);
    // 更新用户
    if (user) {
      username = user.userName;
      id = user.uid;
    }
    // 更新ip
    if (ip) {
      ip_address = ip;
    } else {
      const publicIp = await (await fetch('https://api.ipify.org')).text();
      if (publicIp) ip_address = publicIp;
    }
    // 设置用户信息
    Sentry.setUser({
      username,
      id,
      ip_address,
    });
  }

  /**
   * 报告api错误
   *
   * @param apiUrl api地址
   * @param error 错误对象
   * @param params 请求时的参数
   * @param isPut 是否是put请求
   * @param extra 更多的附加信息
   * @param tags 更多的附加标签
   * @returns //
   */
  apiError(
    apiUrl: string,
    error?: any,
    params?: { [k: string]: string },
    isPut?: boolean,
    extra: { [k: string]: string } = {},
    tags: { [k: string]: Primitive } = {},
  ) {
    // console.log('=========================\napiError:', error);
    const status = error?.status;
    if (status === 401 || status === 403 || status === 400) return null;
    const response = error?.error;
    const name = error?.name ?? 'UnknownHttpError';
    const httpStatus = name === 'TimeoutError' ? 'Timeout' : status || 'Disconnected';
    // 获取错误代码
    const codeInfo = this.getErrorCode(apiUrl, isPut);
    // 发送到日志中心，目前使用错误代码作为标题，错误的api路径为副标题
    const errorName = codeInfo?.code || name;
    const errorMessage = (codeInfo?.path ?? (httpStatus as string)) + '\n' + (error?.message ?? '');
    const errorInfo: errorInfo = {
      level: 'error',
      extra: {
        // 通用参数
        params: params,
        // url查询参数
        search: codeInfo?.search,
        // 响应或错误内容
        response: response,
        // 其它单独附加内容
        ...extra,
      },
      tags: {
        // http错误名称
        httpErrorName: name,
        // http错误状态
        httpStatus: httpStatus,
        // 标记为api错误
        apiError: true,
        // 其它单独附加标签
        ...tags,
      },
    };
    this.error(errorName, errorMessage, errorInfo);
    return codeInfo;
  }

  /**
   * 根据请求的url获取对应的code资讯
   *
   * @param apiUrl api地址
   * @param isPut 是否是put请求
   * @returns //
   */
  getErrorCode(
    apiUrl: string,
    isPut?: boolean,
  ): {
    // 请求的api相对路径
    path: string;
    // 请求的查询参数（如果有）
    search: string;
    // 错误code
    code: string;
  } | null {
    if (!apiUrl) return null;
    // 获取到api的相对路径（去除域名与查询参数）
    const urlData = new URL(apiUrl);
    const path = urlData.pathname;
    const search = urlData.search;
    // 从map找对应的code
    let code = API_ERROR_CODE_MAP.get(path);
    // 如果map没有对应的code，尝试从用正则匹配
    if (!code) {
      const key = URL_REGEXP_MAP.find(x => x.reg.test(path))?.key;
      // 正则匹配成功，再去map找对应的code;
      if (key) {
        code = API_ERROR_CODE_MAP.get(key);
      } else if (isPut) {
        code = API_ERROR_CODE_MAP.get('_unknown_put_');
      }
    }
    return {
      path,
      search,
      code: code ?? '',
    };
  }
}

class SentryError extends Error {
  // 原生错误对象再包装
  constructor(name: string, message: string) {
    super();
    this.name = name;
    this.message = message;
  }
}

/** sentry初始化 */
const sentryInit = async () => {
  const prefix = environment.isEur ? 'eu-' : '';
  // sentry可用性检测
  let dns = environment.sentryDsn;
  const urls = ['https://jxqrp.kzxdwqpl.com', 'https://fybzo.qnjwvkhd.com'];
  const checkUrls = async (urls: string[]) => {
    for (const url of urls) {
      try {
        const timeoutPromise = new Promise(resolve =>
          setTimeout(() => {
            resolve(null);
          }, 10 * 1000),
        );
        const requestPromise = fetch(url + '/health', {
          headers: {
            'Content-Type': 'application/json',
            'ngsw-bypass': 'true',
          },
        });
        const result: Response = await (Promise.race([timeoutPromise, requestPromise]) as Promise<Response>);
        if (result.ok) {
          if ((await result.text()) === 'OK') {
            return url;
          }
        }
      } catch (error) {}
    }
    return null;
  };

  const validUrl = await checkUrls(urls);
  if (validUrl) {
    dns = dns.replace('sentry.athena25.com', validUrl.replace('https://', ''));
  }
  Sentry.init({
    integrations: [Sentry.browserTracingIntegration()],
    dsn: dns,
    // 性能监控事务采样率
    tracesSampleRate: 0.2,
    tracePropagationTargets: [environment.apiUrl, environment.signalrUrl],
    // 版本号
    release: environment.version,
    // 是否带用户信息
    sendDefaultPii: true,
    environment: environment.isOnline ? prefix + 'prod' : prefix + 'sit',
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
  SentryService.prototype.setUser();
  Sentry.addEventProcessor(event => {
    // 全局拦截，备用。如果 return null 可以阻止日志发送
    // console.log('=========================\nSentrySend:', event);
    // return null;
    return event;
  });
};

export { SentryService, sentryInit };
