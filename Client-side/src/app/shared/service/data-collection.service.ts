import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
// import { BehaviorSubject, Subject } from "rxjs";
import { catchError, firstValueFrom, of } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { LZStringService } from 'src/app/orignal/shared/services/lz-string.service';
import { environment } from 'src/environments/environment';
import { CollectionEvent } from '../interfaces/collection-event';
import { LocalStorageService } from './localstorage.service';
import { SentryService } from './sentry.service';

@Injectable({
  providedIn: 'root',
})
export class DataCollectionService {
  constructor(
    private http: HttpClient,
    private deviceDetectorService: DeviceDetectorService,
    private appService: AppService,
    private lzService: LZStringService,
    private localStorageService: LocalStorageService,
    private sentryService: SentryService,
  ) {}

  /**
   * 谷歌埋点提交
   *
   * @param event 事件名称
   * @param params 参数
   */
  gtmPush(event: string, params: { [key: string]: any } = {}) {
    if (window.dataLayer && window.dataLayer['push']) {
      window.dataLayer.push({
        event: event,
        ...params,
      });
    }
  }

  /**请求Url */
  private get methodUrl(): string {
    return `${environment.apiUrl}/v1/behavior/behavior/submit`;
  }

  /**累计数量，达到一定值自动提交 */
  autoSubmitCount = 100;
  /**默认自动提交时间，5分钟 */
  time = 5 * 60 * 1000;

  /**埋点数据列表 */
  private dataList: Array<CollectionEvent> = [];
  /**ip地址 */
  private ip = '';
  /**用户类型 */
  private userType!: number;
  /**系统类型 */
  private osType!: number;
  /**系统版本号 */
  private osVersion!: string;
  /**浏览器类型 */
  private browserType!: number;
  /** 自动发送埋点定时器 */
  private autoSendTimer: any;

  /** 公共属性 */
  publicInfo!: CollectionEvent;
  /** 进入时间集合 */
  enterTimes: { [key: string]: number } = {};

  //////////////正式环境移除/////////////////////////
  // pointInfoSubject: BehaviorSubject<CollectionEvent | null> = new BehaviorSubject<CollectionEvent | null>(null);
  // sendInfoSubject: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);
  // publicInfoSubject: Subject<string> = new Subject<string>();
  //////////////正式环境移除/////////////////////////

  /**
   * 增加埋点
   *
   * @param event
   */
  addPoint(event: CollectionEvent): void {
    setTimeout(() => {
      this.setPublicInfo();
      const data: CollectionEvent = {
        ...this.publicInfo,
        ...event,
        actionTime: new Date().toJSON().replace('Z', ''),
      };
      this.dataList.push(data);
      // if (!environment.isOnline) {
      //   this.pointInfoSubject.next(data);
      // }
      if (this.dataList.length >= this.autoSubmitCount) {
        this.submitDataPoint('post');
      }
    });
  }

  /**
   * 初始化埋点任务
   */
  async init(): Promise<void> {
    this.userType = !this.appService.userInfo$.value ? 2 : environment.isOnline ? 0 : 1;
    this.osType = this.getOsType();
    this.osVersion = this.getOsVersion();
    this.browserType = this.getBrowserType();
    // 自动发送埋点
    clearInterval(this.autoSendTimer);
    this.autoSendTimer = setInterval(() => {
      this.submitDataPoint('post');
    }, this.time);
    // 页面关闭时自动发送埋点数据
    window.onunload = () => {
      this.submitDataPoint('sendBeacon');
    };
    // 设置公共属性
    this.setPublicInfo();
    // 刷新埋点数据
    this.refreshPoint();
  }

  /**
   * 设置公共属性
   */
  setPublicInfo() {
    let referer = '';
    if (document.referrer) {
      const domain = document.referrer.split('/');
      if (domain[2]) {
        referer = domain[2];
      }
    }
    this.publicInfo = {
      uid: this.appService.userInfo$.value?.uid ?? '',
      userType: this.userType,
      appId: 3,
      appVersion: environment.version,
      tpid: environment.common.tenant,
      domain: window.location.host,
      httpReferer: referer,
      deviceType: this.deviceDetectorService.isMobile() ? 2 : 1,
      osType: this.osType,
      osVersion: this.osVersion,
      ip: this.ip || this.localStorageService.clientIp || '',
      browserType: this.browserType,
      language: this.appService.languageCode,
      appMajorVersion: 2,
      actionType: 0,
    };
    //正式环境移除
    // if (!environment.isOnline) {
    //   this.publicInfoSubject.next(`INIT`);
    //   Object.keys(this.publicInfo).forEach(x => {
    //     this.publicInfoSubject.next(`${x}:${(this.publicInfo as any)[x]}`)
    //   });
    // }
  }

  /**
   * 埋点销毁
   */
  destory() {
    clearInterval(this.autoSendTimer);
    //如果有埋点，先提交埋点
    this.submitDataPoint('post');
  }

  //刷新埋点数据
  private refreshPoint(): void {
    this.dataList.forEach((e, i) => {
      this.dataList[i] = {
        ...e,
        ...this.publicInfo,
      };
    });
  }

  /**
   * 提交埋点数据
   *
   * @param type
   */
  private async submitDataPoint(type: 'post' | 'sendBeacon'): Promise<void> {
    if (this.dataList.length < 1) return;
    const body = {
      RawBehaviour: this.lzService.compressBase64(JSON.stringify(this.dataList)),
    };
    switch (type) {
      case 'sendBeacon':
        fetch(this.methodUrl, {
          method: 'POST',
          body: JSON.stringify(body),
          keepalive: true,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.localStorageService.token}`,
            'ngsw-bypass': 'true',
          },
        });
        break;
      case 'post':
        try {
          await firstValueFrom(
            this.http
              .post(this.methodUrl, body, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.localStorageService.token}`,
                  'ngsw-bypass': 'true',
                },
              })
              .pipe(
                catchError(error => {
                  this.sentryService.apiError(this.methodUrl, error, body);
                  return of(null);
                }),
              ),
          );
          // if (!environment.isOnline) {
          //   this.sendInfoSubject.next(true);
          // }
        } catch {
          // if (!environment.isOnline) {
          //   this.sendInfoSubject.next(false);
          // }
        }
        break;
      default:
    }
    this.dataList = [];
  }

  /**
   * 获取系统类型
   *
   * @returns 系统类型
   */
  private getOsType(): number {
    const userAgent = navigator.userAgent;
    const iswindows = userAgent.indexOf('Windows', 0) != -1;
    const ismac =
      navigator.platform == 'Mac68K' ||
      navigator.platform == 'MacPPC' ||
      navigator.platform == 'Macintosh' ||
      navigator.platform == 'MacIntel';
    const isAndroid = userAgent.indexOf('Android') > -1 || userAgent.indexOf('Adr') > -1;
    const isiOS = /(iPhone|iPad|iPod|iOS)/.test(userAgent);
    if (isAndroid == true) return 1;
    if (isiOS == true) return 2;
    if (iswindows == true) return 4;
    if (ismac == true) return 3;
    return 99;
  }

  /**
   * 获取系统版本号
   *
   * @returns 系统版本号
   */
  private getOsVersion(): string {
    try {
      const u = navigator.userAgent;
      let version = '';
      if (u.indexOf('Mac OS X') > -1) {
        if (this.osType == 3) {
          version = 'Mac OS X';
        } else {
          //ios
          const exp = new RegExp('cpu iphone os (.*?) like mac os');
          const verinfo = exp.exec(u.toLowerCase());
          if (verinfo && verinfo[1]) {
            version = 'IOS ' + (verinfo[1].replace('_', '.').replace('_', '.') + '');
          } else {
            version = 'IOS';
          }
        }
      } else if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
        // android
        version = u.split(';')[1].trim();
      } else if (u.indexOf('BB10') > -1) {
        // 黑莓bb10系统
        version =
          'blackberry' + u.substr(u.indexOf('BB10') + 5, u.indexOf(';', u.indexOf('BB10')) - u.indexOf('BB10') - 5);
      } else if (u.indexOf('IEMobile') > -1) {
        // windows phone
        version =
          'winphone' +
          u.substr(u.indexOf('IEMobile') + 9, u.indexOf(';', u.indexOf('IEMobile')) - u.indexOf('IEMobile') - 9);
      } else {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('windows nt 5.0') > -1) {
          version = 'Windows 2000';
        } else if (userAgent.indexOf('windows nt 5.1') > -1 || userAgent.indexOf('windows nt 5.2') > -1) {
          version = 'Windows XP';
        } else if (userAgent.indexOf('windows nt 6.0') > -1) {
          version = 'Windows Vista';
        } else if (userAgent.indexOf('windows nt 6.1') > -1 || userAgent.indexOf('windows 7') > -1) {
          version = 'Windows 7';
        } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows 8') > -1) {
          version = 'Windows 8';
        } else if (userAgent.indexOf('windows nt 6.3') > -1) {
          version = 'Windows 8.1';
        } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows nt 10.0') > -1) {
          version = 'Windows 10';
        } else {
          version = 'Unknown';
        }
      }
      return version;
    } catch (ex) {
      return 'Unknown';
    }
  }

  /**
   * 获取浏览器类型
   *
   * @returns 浏览器类型
   */
  private getBrowserType(): number {
    const userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    const isEdge = userAgent.indexOf('Edg') > -1; //判断是否IE的Edge浏览器
    const isFF = userAgent.indexOf('Firefox') > -1; //判断是否Firefox浏览器
    const isSafari = userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') == -1; //判断是否Safari浏览器
    const isChrome = userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1; //判断Chrome浏览器
    const isUc = userAgent.indexOf('UCBrowser') > -1;

    if (isUc) return 5;
    if (isEdge) return 3;
    if (isFF) return 4;
    if (isSafari) return 2;
    if (isChrome) return 1;
    return 99;
  }

  /**
   * 储存一个开始时间
   *
   * @param key 标记这个时间的key
   */
  setEnterTime(key: string) {
    this.enterTimes[key] = Date.now();
  }

  /**
   * 获取时间差
   *
   * @param key 此前存的时间key
   * @returns //
   */
  getTimDiff(key: string): number {
    if (this.enterTimes.hasOwnProperty(key)) {
      const time = Date.now() - this.enterTimes[key];
      return Number((time / 1000).toFixed(0));
    } else {
      return 0;
    }
  }

  /**
   * 设置ip地址
   *
   * @param ip
   */
  setIpInfo(ip: string): void {
    if (!ip) return;
    this.ip = ip;
    this.init();
  }
}
