import { Injectable } from '@angular/core';
import { catchError, from, of, timeout } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { StandardPopupComponent } from '../components/standard-popup/standard-popup.component';
import { LocaleService } from './locale.service';
import { PopupService } from './popup.service';

interface NotificationParam {
  title: string;
  options?: NotificationOptions;
}

@Injectable({
  providedIn: 'root',
})
export class GnService {
  constructor(
    private popup: PopupService,
    private localeService: LocaleService,
    private appService: AppService,
  ) {}

  /**
   * 离线推送公钥，生成与调试 https://web-push-codelab.glitch.me/
   * 目前这个对应的私钥：wyKpjkC6-g60F6gM-k9tPY-bVqM8Ot7sgw6wE5SGA9k
   */
  private publickey = 'BCiW6kZSsU31RcffC4mPznPhpTDyKCn5vBfe9TUVtawr_fTYYW2hdIpdkBBA-GFP_rl3cOd3O2hiwL_REl9PVZ8';

  /**ServiceWorker注册实例 */
  swReg?: ServiceWorkerRegistration;
  /**当前是否订阅 */
  isSubscribed: boolean = false;
  /**当前是否完整订阅（含离线） */
  isFullSubscribed: boolean = false;
  /**初始化完成（赋值sw实例、确认当前是否已被订阅） */
  inited: boolean = false;
  /**当前页面是否可见 */
  pageVisible: boolean = true;

  /**是否支持通知 */
  enable: boolean = false;
  /**用于chat的通知显示参数 */
  chatParam?: NotificationParam;

  /**初始化 */
  async init() {
    this.enable = 'serviceWorker' in navigator && 'PushManager' in window;
    if (!this.enable) return;
    this.swReg = await navigator.serviceWorker.ready;
    if (this.swReg) {
      // 检查订阅状态
      const subscription = await this.swReg.pushManager.getSubscription();
      if (subscription) {
        this.isFullSubscribed = true;
        this.initMessagesProcess();
        console.log('已有完整订阅：', subscription);
      } else {
        this.isFullSubscribed = false;
        this.isSubscribed = await this.checkPermission();
      }
      // 初始化一些公共内容
      this.initNotificationParam();
    }
    this.inited = true;
  }

  /**初始化chat的公共参数 */
  initNotificationParam() {
    this.chatParam = {
      title: this.localeService.getValue('chat'),
      options: {
        icon: `${environment.resourceUrl}/${this.appService.tenantConfig.h5LogoSun || ''}`,
        data: {
          //默认点击事件 https://angular.io/guide/service-worker-notifications#operations
          onActionClick: {
            default: {
              operation: 'focusLastFocusedOrOpen',
            },
          },
        },
      },
    };
  }

  /**弹出提示窗口准备订阅 */
  showSubscribePop() {
    this.popup.open(StandardPopupComponent, {
      disableClose: true,
      data: {
        content: this.localeService.getValue('chat_noti_sub_tit'),
        description: this.localeService.getValue('chat_noti_sub_con'),
        type: 'warn',
        buttons: [
          { text: this.localeService.getValue('no_thanks'), primary: false },
          { text: this.localeService.getValue('enable_button'), primary: true },
        ],
        callback: () => {
          this.subscribeUser();
        },
      },
    });
  }

  /**请求通知权限 */
  private async askPermission(): Promise<boolean> {
    const permissionResult = await new Promise(function (resolve, reject) {
      const req = Notification.requestPermission(function (result) {
        resolve(result);
      });
      if (req) req.then(resolve, reject);
    });
    return permissionResult === 'granted';
  }

  /**检查通知权限 */
  private async checkPermission(): Promise<boolean> {
    const status = await navigator.permissions.query({ name: 'notifications' });
    return status.state === 'granted';
  }

  /**订阅用户 */
  async subscribeUser() {
    // 环境不支持、未初始化等各种情况时中止
    if (!this.enable || this.isFullSubscribed || !this.swReg || !this.inited) return;
    // 查询和请求权限
    if ((await this.checkPermission()) || (await this.askPermission())) {
      // 已获取到权限
      this.initMessagesProcess();
      // 处理离线消息
      console.log('开始请求第三方 Push Service 尝试实现离线订阅...');
      from(this.swReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: this.publickey }))
        .pipe(
          timeout(10 * 1000),
          catchError(e => {
            console.log('离线订阅失败！原因：', e);
            return of(undefined);
          }),
        )
        .subscribe(e => {
          if (e) {
            // 离线订阅成功 TODO: 离线实现需把e相关内容发送给后端
            this.isFullSubscribed = true;
            console.log('离线订阅成功，后续可由后端直接推送通知到用户设备上：', e);
          } else {
            if (e !== undefined) {
              console.log('离线订阅失败！原因：', e);
            }
          }
        });
    } else {
      console.log('订阅失败！原因：用户未同意权限');
    }
  }

  /**初始化消息处理 */
  private initMessagesProcess() {
    this.isSubscribed = true;
    console.log('在线系统通知发送功能已就绪！');
  }

  /**用于chat显示，在页面不可见时候显示通知 */
  showChatNotification(v: string) {
    if (document.visibilityState === 'visible' || !this.chatParam) return;
    this.showNotification({
      title: this.chatParam.title,
      options: {
        ...this.chatParam.options,
        body: v,
      },
    });
  }

  /**显示在线通知（离线通知不是这里触发的，必须由后端发送，自动在 ngsw-worker.js 里触发） */
  showNotification(msg: NotificationParam) {
    if (!this.swReg || !this.isSubscribed) return;
    this.swReg.showNotification(msg.title, msg.options);
  }
}
