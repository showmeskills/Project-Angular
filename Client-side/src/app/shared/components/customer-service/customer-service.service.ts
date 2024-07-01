import { Injectable, Injector, WritableSignal, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { WidgetConfig } from '@livechat/widget-angular';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { AccountInforData } from '../../interfaces/account.interface';
import { LangvarService } from '../../service/langvar.service';
import { LocalStorageService } from '../../service/localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerServiceService {
  constructor(
    private localStorageService: LocalStorageService,
    private appService: AppService,
    private injector: Injector,
    private langvarService: LangvarService,
  ) {}

  chatType: 'liveChat' | 'zendesk' = 'liveChat';
  chatReady: WritableSignal<boolean> = signal(false);

  liveChatConfig: WidgetConfig = {
    visibility: 'hidden',
    license: '',
    group: '',
    customerName: undefined,
    customerEmail: undefined,
    sessionVariables: undefined,
  };

  /**
   * 初始化客服
   *
   * @param lang
   */
  init(lang: string) {
    // 设置客服类型
    if (['zh-cn', 'vi', 'th'].includes(lang)) {
      this.chatType = 'liveChat';
    } else {
      this.chatType = 'zendesk';
    }
    switch (this.chatType) {
      case 'liveChat':
        this.initLiveChat();
        break;
      case 'zendesk':
        this.initZendesk();
        break;
      default:
        break;
    }
  }

  /**
   * 设置客服变量
   *
   * @param userInfo 用户信息(未登录为null)
   */
  setVariables(userInfo: AccountInforData | null = null) {
    switch (this.chatType) {
      case 'liveChat':
        this.setLiveChatVar(userInfo);
        break;
      case 'zendesk':
        // this.setZendeskVar(userInfo);
        break;
      default:
        break;
    }
  }

  /** 初始化livechat客服 */
  initLiveChat() {
    this.liveChatConfig = {
      ...this.liveChatConfig,
      license: this.appService.tenantConfig.config.liveChatLicense || '',
      group: JSON.parse(this.appService.tenantConfig.config.liveChatGroup || '{}')[this.appService.languageCode] ?? '',
    };
  }

  /** 初始化Zendesk客服 */
  initZendesk() {
    const zendeskUrl = this.appService.tenantConfig.config['zendeskUrl'] as string;
    if (!zendeskUrl) return;
    this.appService.loadExternalScript(zendeskUrl, 'ze-snippet', () => {
      window.zE('messenger:set', 'locale', this.langvarService.zELang);
      window.zE(() => {
        this.chatReady.set(true);
      });
    });
  }

  /**
   * 设置LiveChat客服变量
   *
   * @param info
   */
  setLiveChatVar(info: AccountInforData | null = null) {
    const contact = this.localStorageService.csTouristsContact;
    const userInfo = info ?? this.localStorageService.localUserInfo;
    const customerName = userInfo?.userName || userInfo?.uid || contact || undefined;
    const customerEmail = contact || undefined;
    const customerUid = userInfo?.uid || undefined;
    const sessionVariables: { username?: string; uid?: string; email?: string; version: string } = {
      version: environment.version,
    };

    if (customerName) sessionVariables.username = customerName;
    if (customerUid) sessionVariables.uid = customerUid;
    if (customerEmail) sessionVariables.email = customerEmail;

    this.liveChatConfig.customerName = customerName;
    this.liveChatConfig.customerEmail = customerEmail;
    this.liveChatConfig.sessionVariables = sessionVariables;
  }

  /**
   * 设置Zendesk客服变量（目前无用到，备用）
   *
   * @param userInfo
   */
  setZendeskVar(userInfo: AccountInforData | null = null) {
    if (userInfo) {
      //
    }
    const conversationFields: { id: string; value: string | number }[] = [];
    const obs = toObservable(this.chatReady, { injector: this.injector }).subscribe(x => {
      if (x) {
        window.zE('messenger:set', 'conversationFields', conversationFields);
        obs.unsubscribe();
      }
    });
  }
}
