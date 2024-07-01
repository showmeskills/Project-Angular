import { Injectable, NgZone, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject, Subject, distinctUntilChanged, fromEvent, map, merge, of, skip } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StandardPopupComponent } from './shared/components/standard-popup/standard-popup.component';
import { AccountInforData } from './shared/interfaces/account.interface';
import { LangModel } from './shared/interfaces/country.interface';
import { CurrenciesInterface } from './shared/interfaces/deposit.interface';
import { TenantConfig } from './shared/interfaces/resource.interface';
import { defaultAvatarPc } from './shared/interfaces/settings.interface';
import { UserVipData } from './shared/interfaces/vip.interface';
import { CurrencyBalance } from './shared/interfaces/wallet.interface';
import { GlobalSizeChange } from './shared/service/layout.service';
import { LocaleService } from './shared/service/locale.service';
import { LocalStorageService } from './shared/service/localstorage.service';
import { PopupService } from './shared/service/popup.service';
import { signalrMessage } from './shared/service/signalr.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(
    private localStorageService: LocalStorageService,
    private localeService: LocaleService,
    private popup: PopupService,
    private router: Router,
    private ngZone: NgZone,
    private deviceService: DeviceDetectorService,
  ) {
    if (this.deviceService.isDesktop()) {
      document.body.classList.add('is-desktop');
    } else {
      document.body.classList.add('is-mobile');
    }

    merge(of(navigator.userAgent), fromEvent(window, 'resize').pipe(map(() => navigator.userAgent)))
      .pipe(distinctUntilChanged(), skip(1))
      .subscribe(() => {
        this.refresh$.next(true);
      });

    //日夜间版切换
    this.themeSwitch$.subscribe(v => {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      switch (v) {
        case 'moon':
          document.body.classList.add('dark');
          if (metaThemeColor) metaThemeColor.setAttribute('content', '#1a2c38');
          break;
        case 'sun':
          document.body.classList.remove('dark');
          if (metaThemeColor) metaThemeColor.setAttribute('content', '#fcfcfc');
          break;
        default:
          break;
      }
    });

    // 软刷新
    this.refresh$.subscribe(() =>
      this.ngZone.runOutsideAngular(() => {
        window.reBuild();
      }),
    );
  }

  /** 判断顶部钱包是否显示 使用中的状态 */
  isShowTopWalletPalying$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /** 保存的触发者 */
  showPalyingTriggeredBy!: string;

  /**
   * 设置顶部钱包显示“游戏使用中”
   *
   * @param key 触发者key
   * @param on 开关
   */
  turnShowPalying(key: string, on: boolean) {
    if (!this.showPalyingTriggeredBy || this.showPalyingTriggeredBy === key) {
      this.isShowTopWalletPalying$.next(on);
      this.showPalyingTriggeredBy = on ? key : '';
    }
  }

  /** 原生app访问 */
  isNativeApp!: boolean;

  /** 商户信息 */
  tenantConfig!: TenantConfig;

  /** 国家编码ISO */
  countryCode: string = 'CN';

  /**语言代码 */
  languageCode: string = '';

  /** 默认头像列表 */
  avatarList!: defaultAvatarPc[];

  /**CacheStorage 缓存对象  */
  curCaches?: Cache;

  /**缓存命名空间 */
  get cacheName() {
    return this.languageCode + '-' + window.location.host + '-v' + environment.cacheKey;
  }

  /* --------------------------------- Subject START-------------------------------- */

  /** 当前选择的国家区号信息 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentCountry$: BehaviorSubject<any> = new BehaviorSubject(null);

  /** 多语言列表 */
  languages$: BehaviorSubject<LangModel[]> = new BehaviorSubject<LangModel[]>([]);

  /** 语言文件准备完毕 */
  langFileReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** 币种列表 */
  currencies$: BehaviorSubject<CurrenciesInterface[]> = new BehaviorSubject<CurrenciesInterface[]>([]);

  /** 用户信息 */
  userInfo$: BehaviorSubject<AccountInforData | null> = new BehaviorSubject<AccountInforData | null>(null);

  /**当前选择币种 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentCurrency$: BehaviorSubject<CurrenciesInterface> = new BehaviorSubject<any>(undefined);

  /**退出登录 */
  logoutSubject$: Subject<boolean> = new Subject();

  h5LangSelectPop$: Subject<boolean> = new Subject();

  /**全局尺寸改变（目前仅用于app下载提示） */
  globalSizeChange$: BehaviorSubject<GlobalSizeChange | null> = new BehaviorSubject<null | GlobalSizeChange>(null);

  /**所有类型通知数量 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  noticeCounts$: BehaviorSubject<any> = new BehaviorSubject<any>({});

  /**当前Vip等级 */
  vipUserInfo$: BehaviorSubject<UserVipData | null> = new BehaviorSubject<UserVipData | null>(null);

  /**平台signalr销毁 */
  signalrDestory$: Subject<boolean> = new Subject();
  /**chat聊天退出 */
  chatLogout$: Subject<boolean> = new Subject();

  /**资产变动 */
  assetChanges$: Subject<signalrMessage> = new Subject<signalrMessage>();
  /**资产变动 是否锁住 */
  assetChangesLock$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  /**资产变动更新动画 */
  assetChangesAnimation$: Subject<string> = new Subject();

  /** 主题切换 */
  themeSwitch$: BehaviorSubject<'sun' | 'moon'> = new BehaviorSubject<'sun' | 'moon'>(
    this.localStorageService.theme || 'sun',
  );

  /**跳转在线客服 */
  toOnLineService$: Subject<boolean> = new Subject();

  //钱包数据
  userBalance$: BehaviorSubject<CurrencyBalance[] | null> = new BehaviorSubject<CurrencyBalance[] | null>(null);

  /**软刷新 */
  refresh$: Subject<boolean> = new Subject();

  /**原创专属重复登录弹出框订阅，不直接引用原创内容来执行清空，是为了防止引入后打包内容过大 */
  logoutShowTip$: Subject<boolean> = new Subject();

  /**原创如果再自动投注时，禁止切换币种 */
  originalAutoBet$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** ip info 加载完毕 */
  ipInfoReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** 国家接口准备 */
  isCountriesReady$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** 断网提示 */
  networkTips$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /* ------------------------------- Subject END ------------------------------ */

  jumpToLogin(skipSave: boolean = false, reload: boolean = false, replaceUrl: boolean = false) {
    //存储当前访问界面的url
    if (!skipSave) this.saveUrl();
    this.router.navigate(['/', this.languageCode, 'login'], { replaceUrl: replaceUrl }).then(() => {
      if (reload) this.reFresh();
    });
  }

  jumpToRegister(skipSave: boolean = false) {
    //存储当前访问界面的url
    if (!skipSave) this.saveUrl();
    this.router.navigate(['/', this.languageCode, 'register']);
  }

  jumpToHome() {
    window.location.href = `/${this.languageCode}`;
  }

  saveUrl() {
    this.localStorageService.nowUrl = window.location.href.replace(window.location.origin, '');
  }

  selectLangFun(targetCode: string) {
    this.localStorageService.defaultLang = targetCode;
    this.localStorageService.languageCode = targetCode;
    const nowCode = this.languageCode;
    this.saveUrl();
    window.location.href = window.location.origin + this.localStorageService.nowUrl.replace(nowCode, `${targetCode}`);
  }

  /**
   * 登录成功后1
   *
   * @param token 登录成功后的token
   * @param checkRegBonus 是否检查新用户红利
   * @param checkUserDeposit 检查用户是否 有首存记录
   * @returns //
   */
  logged(token: string, checkRegBonus: boolean = false, checkUserDeposit: boolean = true) {
    this.localStorageService.token = this.localStorageService.loginToken = token;
    if (checkRegBonus) window.eventBank.push({ key: 'regBonus' });
    if (checkUserDeposit) window.eventBank.push({ key: 'checkUserDeposit' });
    // window.eventBank.push({ key: 'showRiskBanner' });
    window.eventBank.push({ key: 'eddCheck' });
    window.eventBank.push({ key: 'showAuthenticateForEuBanner' });
    this.signalrDestory$.next(true);
    this.refresh$.next(true);
  }

  reFresh() {
    window.location.reload();
  }

  /**轻退出 */
  softlyLogout() {
    this.localStorageService.token = this.localStorageService.loginToken = null;
    // 清空中级kyc cahce
    this.localStorageService.kycValidationBanner = null;
    // 退出signalr
    this.signalrDestory$.next(true);
    // 退出chat
    this.chatLogout$.next(true);
    // 当退出时 edd 为null
    this.localStorageService.eddPopup = null;
    //软刷新
    this.refresh$.next(true);
  }

  getAppUrl = computed(() => {
    let query = '';
    const inviteCode = this.localStorageService.inviteCodeSignal();
    const myAffiliate = this.localStorageService.myAffiliateSignal();
    if (inviteCode) query += `&inviteCode=${inviteCode}`;
    if (myAffiliate) query += `&aff=${myAffiliate}`;
    return `${this.tenantConfig.config.appDownloadPage}/?lang=${this.languageCode}` + query;
  });

  _repeatLoginTip: unknown;
  /**
   * 显示重复登录提示
   *
   * @param isPlatform 是否是平台
   * @returns //
   */
  showRepeatLoginTip(isPlatform: boolean = true) {
    if (this._repeatLoginTip) return;
    if (isPlatform) {
      // 原创销毁
      this.logoutShowTip$.next(true);
      // 平台清空token
      this.localStorageService.loginToken = this.localStorageService.token = null;
    }
    this._repeatLoginTip = this.popup.open(StandardPopupComponent, {
      disableClose: true,
      data: {
        description: this.localeService.getValue('rep_log_tip'),
        type: 'warn',
        buttons: [{ text: this.localeService.getValue('confirm_button'), primary: true }],
        callback: () => {
          this.reFresh();
        },
      },
    });
  }

  _invalidCurrencyTip: unknown;
  /**
   * 显示币种不支持提示
   *
   * @returns //
   */
  showInvalidCurrencyTip() {
    if (this._invalidCurrencyTip) return;
    this._invalidCurrencyTip = this.popup.open(StandardPopupComponent, {
      disableClose: true,
      data: {
        description: this.localeService.getValue('inv_currency_tip'),
        type: 'warn',
        buttons: [{ text: this.localeService.getValue('confirm_button'), primary: true }],
        callback: () => {
          this.router.navigate([this.languageCode]);
          this._invalidCurrencyTip = undefined;
        },
      },
    });
  }

  _forbidTip: unknown;
  /**
   * 显示会员禁用提示、或其它提示
   *
   * @param type 类型，登录、进入游戏
   * @param message
   * @param title
   * @returns //
   */
  showForbidTip(type: 'login' | 'play' | 'income', message?: string, title?: string) {
    if (this._forbidTip) return;
    let text = '';
    let content = this.localeService.getValue('acc_d_tit'); //'账号已被禁用'
    switch (type) {
      case 'login':
        text = this.localeService.getValue('acc_d_con'); // 您的账号存在异常已被禁用，可联系客服查询详细原因
        break;
      case 'play':
        text = this.localeService.getValue('acc_prov_d_con'); // 您的账号已被禁止进行该厂商的游戏交易，可联系客服查询详细原因
        break;
      case 'income':
        if (message) text = message; // 自定义传入
        if (title) content = title; // 自定义传入
        break;
      default:
        break;
    }
    this._forbidTip = this.popup.open(StandardPopupComponent, {
      disableClose: true,
      data: {
        content: content,
        description: text,
        type: 'warn',
        buttons: [
          { text: this.localeService.getValue('cancels'), primary: false },
          { text: this.localeService.getValue('con_cus_ser00'), primary: true },
        ],
        callback: [
          () => {
            this._forbidTip = undefined;
          },
          () => {
            this._forbidTip = undefined;
            this.toOnLineService$.next(true);
          },
        ],
      },
    });
  }

  /**
   * 动态加载JS
   *
   * @param url url
   * @param id id唯一标识
   * @param callback 成功onload后回调
   * @returns //
   */
  public loadExternalScript(url: string, id: string, callback: () => void = () => {}) {
    //检查是否已存在
    // @ts-ignore
    if (window[`${id}-script-loaded`]) {
      callback();
      return;
    }
    const body = <HTMLDivElement>document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = true;
    script.defer = true;
    script.id = id;

    body.appendChild(script);
    script.onload = () => {
      // @ts-ignore
      window[`${id}-script-loaded`] = true;
      callback();
    };
  }

  /**
   * 缓存默认头像列表
   *
   * @returns 返回默认头像列表
   */
  getAvatarList() {
    this.avatarList = this.tenantConfig?.defaultAvatarPc?.length
      ? this.tenantConfig?.defaultAvatarPc
          .filter((x: string) => !!x)
          .map((v: string, i: number) => ({
            url: 'avatar-' + (i + 1), //选择后台没有上传默认头像时候占位 从avatar-1开始
            active: false,
            processedUrl: `${environment.resourceUrl}/` + v, //选择了后台有上传默认头像的
            idx: 'avatar-' + (i + 1), //标识符 从avatar-1开始
          }))
      : [
          {
            url: 'avatar-1',
            active: false,
            processedUrl: 'assets/images/settings-center/avatar-1.png',
            idx: 'avatar-1',
          },
          {
            url: 'avatar-2',
            active: false,
            processedUrl: 'assets/images/settings-center/avatar-2.png',
            idx: 'avatar-2',
          },
          {
            url: 'avatar-3',
            active: false,
            processedUrl: 'assets/images/settings-center/avatar-3.png',
            idx: 'avatar-3',
          },
          {
            url: 'avatar-4',
            active: false,
            processedUrl: 'assets/images/settings-center/avatar-4.png',
            idx: 'avatar-4',
          },
          {
            url: 'avatar-5',
            active: false,
            processedUrl: 'assets/images/settings-center/avatar-5.png',
            idx: 'avatar-5',
          },
        ];
  }

  /**
   * 路由跳转
   *
   * @param route
   */
  onRedirect(route: string) {
    this.router.navigateByUrl(`${this.languageCode}/${route}`);
  }

  /**
   * 设置全局加载骰子的状态
   *
   * @param num 要设置的节点
   * 1 => 代表成功加载了html文件，
   * 2 => 表示成功进入了angular，
   * 3 => 表示成功加载了商户配置，
   * 4 => 表示成功加载了语言，
   * 5 => 表示成功搞到了初始token，
   * 6 => 暂未使用
   */
  setGlobalWaitingTo(num: number) {
    const imgs = Array.from(
      document.querySelector('.global-waiting-icon .default')?.children ?? [],
    ) as HTMLImageElement[];
    const target = imgs[num - 1];
    if (target) {
      imgs.forEach(x => (x.style.opacity = '0'));
      target.style.opacity = '1';
    }
  }
}
