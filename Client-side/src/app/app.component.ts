import { animate, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import {
  Observable,
  combineLatest,
  firstValueFrom,
  forkJoin,
  from,
  fromEvent,
  merge,
  of,
  throwError,
  timer,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  first,
  map,
  mergeMap,
  pairwise,
  retry,
  startWith,
  switchMap,
  take,
  timeout,
} from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppService } from './app.service';
import { CurrencyWalletService } from './layouts/currency-wallet/currency-wallet.service';
import { ActivityService } from './pages/activity/activity.service';
import { KycService } from './pages/kyc/kyc.service';
import { SettingsService } from './pages/settings/settings.service';
import { UserAssetsService } from './pages/user-asset/user-assets.service';
import { AccountApi } from './shared/apis/account.api';
import { AuthApi } from './shared/apis/auth.api';
import { CountryApi } from './shared/apis/country.api';
import { DepositApi } from './shared/apis/deposit.api';
import { ResourceApi } from './shared/apis/resource.api';
import { SettingsApi } from './shared/apis/settings.api';
import { CustomerServiceService } from './shared/components/customer-service/customer-service.service';
import { EddPopupService } from './shared/components/edd-popup/edd-popup.service';
import { CurrenciesInterface } from './shared/interfaces/deposit.interface';
import { TenantConfig } from './shared/interfaces/resource.interface';
import { defaultAvatarPc } from './shared/interfaces/settings.interface';
import { CacheService } from './shared/service/cache.service';
import { ChatService } from './shared/service/chat.service';
import { DataCollectionService } from './shared/service/data-collection.service';
import { EncryptService } from './shared/service/encrypt.service';
import { GeneralService } from './shared/service/general.service';
import { GlobalSizeChange, LayoutService } from './shared/service/layout.service';
import { LocaleService } from './shared/service/locale.service';
import { LOGIN_TOKEN_KEY, LocalStorageService } from './shared/service/localstorage.service';
import { NativeAppService } from './shared/service/native-app.service';
import { SentryService } from './shared/service/sentry.service';
import { SWService } from './shared/service/service-worker.service';
import { SignalrService } from './shared/service/signalr.service';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [style({ opacity: 0 }), animate('0.2s ease-in-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('0.2s ease-in-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private http: HttpClient,
    public appService: AppService,
    private layoutService: LayoutService, // 请勿删除，它需要初始化
    private activityService: ActivityService,
    private depositApi: DepositApi,
    private authApi: AuthApi,
    private localeService: LocaleService,
    private resourceApi: ResourceApi,
    private localStorageService: LocalStorageService,
    private encryptService: EncryptService,
    private accountApi: AccountApi,
    private countryApi: CountryApi,
    private kycService: KycService,
    private elementRef: ElementRef,
    private generalService: GeneralService,
    private cacheService: CacheService,
    private signalrService: SignalrService,
    private titleService: Title,
    private dataCollectionService: DataCollectionService,
    private route: ActivatedRoute,
    private nativeAppService: NativeAppService,
    private userAssetsService: UserAssetsService,
    private currencyWalletService: CurrencyWalletService,
    private eddPopup: EddPopupService,
    private sentryService: SentryService,
    private swService: SWService,
    private customerServiceService: CustomerServiceService,
    private settingsApi: SettingsApi,
    private settingsService: SettingsService,
    private chatService: ChatService,
  ) {}

  /** 是否为线上版本 */
  isOnline: boolean = true;

  /** 版本号 */
  version: string = '';

  /** 后端版本号 */
  backendVersion: string = '';

  /** 是否准备好 */
  isReady: boolean = false;

  /**根据IP地址获取当前货币 */
  countryCurrency!: string;

  /** 获取默认头像的url列表 */
  avatarList!: defaultAvatarPc[];

  /**
   * 检测storage变化
   *
   * @param event
   */
  @HostListener('window:storage', ['$event'])
  storageChange(event: StorageEvent) {
    if (event.key == this.localStorageService.getStorageFullKey(LOGIN_TOKEN_KEY)) {
      if ((!event.oldValue || !event.newValue) && event.oldValue != event.newValue) {
        this.appService.reFresh();
      }
    }
  }

  async ngOnInit() {
    // 已成功进入angualr程序
    this.appService.setGlobalWaitingTo(2);

    //是否线上环境
    this.isOnline = environment.isOnline;

    //版本号
    window.version = this.version = environment.version;

    // 创建manifest
    this.createManifest();

    // 后端版本号
    this.onBackendVersion();

    //设置Moment
    window.moment = moment;

    // 是不是原生app 访问
    this.onCheckNativeApp();

    //初始化语言
    if (!this.languageCodeInit()) return;

    // 初始化CacheStorage缓存对象
    if ('caches' in window && 'serviceWorker' in navigator) {
      this.appService.curCaches = await window.caches.open(this.appService.cacheName);
    }

    //初始化商户信息、ApiUrl
    if (!(await this.tenantInit())) return;

    // 已成功获取到商户配置
    this.appService.setGlobalWaitingTo(3);

    //初始化埋点
    this.dataCollectionService.init();
    this.dataCollectionService.setEnterTime('allpage');
    //初始化客服
    this.customerServiceService.init(this.appService.languageCode);
    //初始化语言文件、Token等
    await this.basicInit();

    //订阅全局内容尺寸变更，给 app-root 增减相应 padding
    this.appService.globalSizeChange$.pipe(untilDestroyed(this)).subscribe(v => v && this.changePadding(v));

    //退出登录
    this.appService.logoutSubject$.pipe(untilDestroyed(this)).subscribe(async () => {
      await firstValueFrom(this.authApi.logout());
      this.appService.softlyLogout();
    });

    //阻止Sfari双击
    this.generalService.blockSfariDoubleClick();

    //加载moment多语言
    if (this.appService.languageCode != 'en-us') {
      this.loadExternalScript(
        `assets/scripts/moment/locale/${this.appService.languageCode}.js`,
        `moment-${this.appService.languageCode}`,
      );
    }

    combineLatest([this.appService.ipInfoReady$, this.appService.isCountriesReady$])
      .pipe(
        untilDestroyed(this),
        mergeMap(([ipReady, isCountriesReady]) => {
          if (ipReady && isCountriesReady) {
            // 未登录
            this.appService.currentCountry$.next(
              this.cacheService.countries.find(x => x.iso === this.appService.countryCode),
            );
          }
          return this.appService.userInfo$.pipe(
            filter(v => !!v),
            take(1),
          );
        }),
      )
      .subscribe(userInfo => {
        if (userInfo?.mobileRegionCode) {
          //  已经绑定过手机 用户 且登录
          this.appService.currentCountry$.next(
            this.cacheService.countries.find(x => x.iso === userInfo?.mobileRegionCode),
          );
        }
      });
  }

  /** 获取后端版本号  */
  onBackendVersion() {
    if (this.isOnline) return;
    this.accountApi.getBackendVersion().subscribe(data => (this.backendVersion = data));
  }

  /**
   * 基础初始化
   *
   * @returns //
   */
  private async basicInit() {
    //准备多语言翻译文件
    if (!(await this.getLocale())) {
      // 翻译文件无缓存且请求失败，中断后续所有动作
      return;
    }

    // 已成功加载翻译文件
    this.appService.setGlobalWaitingTo(4);

    this.setGlobalWaitingText();

    //初始化BasicToken
    if (!this.localStorageService.token) {
      const tokenInit = await this.basicTokenInit();
      if (!tokenInit) return; //基础token请求失败，中断后续所有动作
    }

    // 已成功初始化token
    this.appService.setGlobalWaitingTo(5);

    // 当IP接口和货币接口 都请求完后开始调用过滤货币函数
    combineLatest([this.appService.currencies$.pipe(first(v => v.length > 0)), this.appService.ipInfoReady$])
      .pipe(untilDestroyed(this))
      .subscribe(([currenciies, ipInfoReady]) => {
        if (ipInfoReady) this.handleDefaultWalletCurrency(currenciies);
      });

    //获取IP信息
    this.getIpInfo();

    if (this.localStorageService.token) {
      this.getCountries();
      this.getLang();
      this.getCurrencies();
      timer(0, 1000 * 10 * 60)
        .pipe(untilDestroyed(this))
        .subscribe(() => {
          this.userAssetsService.getAllRate();
        });
    }

    if (this.localStorageService.loginToken) {
      this.getUserInfo();
    } else {
      this.customerServiceService.setVariables();
    }

    this.isReady = true;

    this.closeGlobalWaiting();

    this.afterReady();
  }

  /**
   * 初始化Language code
   *
   * @returns //
   */
  private languageCodeInit(): boolean {
    if (!window.languageCode) return false;
    this.appService.languageCode = window.languageCode;
    document.body.classList.add(this.appService.languageCode);
    return true;
  }

  /**
   * 获取IP信息
   */
  async getIpInfo() {
    const ipInfo = await firstValueFrom(this.authApi.getIpInfo());
    if (!ipInfo) return;
    this.dataCollectionService.setIpInfo(ipInfo?.ip);
    this.countryCurrency = ipInfo?.countryCurrency;
    if (ipInfo.countryCode) {
      this.appService.countryCode = ipInfo.countryCode;
    }

    this.appService.ipInfoReady$.next(true);
  }

  //获取语言选择数据
  async getLang() {
    const result = await firstValueFrom(this.countryApi.getalllanguage());
    if (result.length > 0) {
      this.appService.languages$.next(result);
      const curlang = result.find(x => x.code === this.appService.languageCode);
      if (!curlang) {
        window.checkLangSupport(
          this.appService.languageCode,
          result.map(x => x.code),
        );
      }
    }
  }

  /**
   * 加载翻译文件
   */
  async getLocale() {
    const result = await firstValueFrom(this.resourceApi.getLocale(this.appService.languageCode));
    if (result) {
      this.localeService.setLocaleData(result);
      this.appService.langFileReady$.next(true);
      //多语言加载完之后动态设置网站title
      this.titleService.setTitle(this.localeService.getValue('seo_title'));
    }
    return result;
  }

  /**
   * 获取国家数据
   */
  async getCountries() {
    const countries = await firstValueFrom(this.countryApi.getCountries());
    this.cacheService.countries = countries;
    this.appService.isCountriesReady$.next(true);
  }

  //给 app-root 增减相应 padding
  private changePadding(v: GlobalSizeChange) {
    const keys = Object.keys(v) as [];
    keys.forEach(x => {
      const val = v[x] as number;
      const styleKey = {
        top: '--root-padding-top',
        left: '--root-padding-left',
        right: '--root-padding-right',
        bottom: '--root-padding-bottom:',
      }[x];
      this.elementRef.nativeElement.style.setProperty(styleKey, val + 'px');
    });
  }

  /**
   * 获取所有币种并储存
   */
  private async getCurrencies() {
    const data = await firstValueFrom(this.depositApi.getCurrencies());
    if (data) {
      this.appService.currencies$.next(data);
    }
  }

  /**
   * 获取或设置默认币种 默认为为用户存储本地的值，如果没有默认使用USDT,如果没有默认使用第一个有效值
   *
   * @param allCurrencyData
   */
  private handleDefaultWalletCurrency(allCurrencyData: CurrenciesInterface[]) {
    const defaultCurrency =
      allCurrencyData.find(x => x.currency === this.countryCurrency && x.isVisible) ||
      allCurrencyData.find(x => x.currency === this.localStorageService.currentCurrency && x.isVisible) ||
      allCurrencyData.find(x => x.currency === 'USDT' && x.isVisible) ||
      allCurrencyData.find(x => x.isVisible);
    if (defaultCurrency) {
      this.localStorageService.currentCurrency = defaultCurrency.currency;
      this.appService.currentCurrency$.next(defaultCurrency);
    }
  }

  /**
   * 初始化BasicToken
   */
  private async basicTokenInit() {
    //获取visitorId
    let visitorId: string;
    if (this.localStorageService.visitorId) {
      visitorId = this.localStorageService.visitorId;
    } else {
      const fp = await FingerprintJS.load();
      const visitorIdObj = await fp.get();
      visitorId = visitorIdObj.visitorId;
      this.localStorageService.visitorId = visitorId;
    }

    const tenant = environment.common.tenant; //商户Id
    const market = '1';
    const content = `nonce=${visitorId}&lang=${this.appService.languageCode}&domain=${
      window.location.host.split(':')[0]
    }&tenant=${tenant}&market=${market}`;
    //Rsa加密
    const iniToken = this.encryptService.encrypt(content);
    const result = await firstValueFrom(this.authApi.getSetUpToken(`${iniToken}`));
    if (result?.data) {
      this.localStorageService.token = result.data.toString();
      return true;
    } else {
      return false;
    }
  }

  /**
   * 获取用户信息 ：登陆后；
   *
   * @returns //
   */
  async getUserInfo() {
    //获取用户信息
    const result = await firstValueFrom(this.accountApi.getUserAccountInfor());
    if (result?.success) {
      this.chatService.init();
      this.customerServiceService.setVariables();
      this.appService.userInfo$.next(result.data);
      if (result.data.userSetting) {
        const { defaultCurrencyType, isEnableCredit, invisibilityMode } = result.data.userSetting;
        this.settingsService.setAppServiceCurrentCurrency(defaultCurrencyType);
        this.settingsService.enableCredit$.next(isEnableCredit);
        this.settingsService.invisibleMode$.next(invisibilityMode);
      }
    }

    this.dataCollectionService.init();
  }

  /**
   * 动态加载JS
   *
   * @param url url
   * @param id id唯一标识
   * @param callback 成功onload后回调
   * @returns //
   */
  private loadExternalScript(url: string, id: string, callback: () => void = () => {}) {
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

  /** 创建manifest */
  private createManifest() {
    //检查是否已存在
    // @ts-ignore
    if (window['manifest-script-loaded']) return;
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = `${window.location.origin}/manifest.webmanifest?v=${window.version}`;
    document.head.appendChild(link);
    // @ts-ignore
    window['manifest-script-loaded'] = true;
  }

  /** 删除全局等待的dom */
  closeGlobalWaiting() {
    const el: HTMLDivElement | null = document.querySelector('.global-waiting');
    if (el) el.style.display = 'none';
  }

  /** 设置全局等待界面的多语言 */
  setGlobalWaitingText() {
    const el = document.querySelector('.global-waiting-txt');
    if (el) el.innerHTML = this.localeService.getValue('global_waiting_txt');
  }

  /** 设置网站图标、全局加载loding图片 */
  private setPageImage() {
    //更新全局加载loding图片
    const container = document.querySelector('.global-waiting-icon');
    const img = document.querySelector('.global-waiting-icon > img') as HTMLImageElement | null;
    if (this.appService.tenantConfig.loadingImg) {
      const src = `${environment.resourceUrl}/${this.appService.tenantConfig.loadingImg}`;
      if (container && this.localStorageService.globalWaitingIcon !== src) {
        if (img) {
          img.src = src;
        } else {
          const newImg = document.createElement('img');
          newImg.src = src;
          container.classList.add('customize');
          container.appendChild(newImg);
        }
      }
      this.localStorageService.globalWaitingIcon = src;
    } else {
      //恢复默认
      if (container && img) {
        img.remove();
        container.classList.remove('customize');
      }
      this.localStorageService.globalWaitingIcon = null;
    }
    //设置网站图标
    const faviconEl: HTMLLinkElement | null = document.querySelector('[rel=icon]');
    const appleTouchIconEl: NodeListOf<HTMLLinkElement> = document.querySelectorAll('[rel=apple-touch-icon]');
    if (faviconEl) faviconEl.href = this.appService.tenantConfig.config.favicon;
    appleTouchIconEl.forEach(x => (x.href = this.appService.tenantConfig.config.appleTouchIcon));
  }

  /**商户信息初始化、api初始化 */
  private async tenantInit() {
    const result: TenantConfig | null = await firstValueFrom(this.getTenantConfig());

    if (!result) return false;

    // 如果有域名列表，保存到本地
    const domainList = result.config.dl ?? null;
    if (domainList) this.localStorageService.domainList = domainList;

    this.appService.tenantConfig = result;

    // 更新resourceUrl地址
    environment.resourceUrl = result.config.resourceUrl;

    //如果本地没有存日夜版（即首次打开），设置日夜版默认值并存本地。
    if (!this.localStorageService.theme) {
      this.localStorageService.theme = result.colorScheme;
      this.appService.themeSwitch$.next(result.colorScheme);
    }

    //设置头部icon、全局加载loding图片
    this.setPageImage();

    // 节日主题样式
    const themeClass = result.config.themeClass ?? '';
    if (themeClass) document.body.classList.add(themeClass);

    //初始化调用数据
    this.appService.getAvatarList();

    this.signalrService.connectionInit();

    return true;
  }

  /**获取商户配置 */
  getTenantConfig(): Observable<TenantConfig | null> {
    let index = 0;
    const urls = environment.configUrls.split(',').map(x => {
      if (!x.startsWith('http')) x = window.location.origin + x;
      return x.replace('[tenant]', environment.common.tenant);
    });
    return of(true).pipe(
      switchMap(() =>
        this.http.get<TenantConfig>(urls[index] + '?t=' + Date.now(), { headers: { 'ngsw-bypass': 'true' } }),
      ),
      timeout(10 * 1000), //10秒超时
      retry({
        delay: error => {
          this.sentryService.apiError(urls[index], error);
          index = index + 1 >= urls.length ? 0 : index + 1;
          if (index === 0) {
            // 开始测试本地存储的域名并尝试跳转
            this.testDomainToturn();
            // 所有商户配置请求失败，抛出错误
            return throwError(() => new Error('The merchant configuration request failed'));
          } else {
            // 尝试下一个
            return of(true);
          }
        },
      }),
      catchError(() => of(null)),
    );
  }

  /**域名测试并跳转 */
  testDomainToturn() {
    const urls: string[] | null = this.localStorageService.domainList;
    if (!urls) return;

    // 创建所有可用域名的检测队列
    const obs = urls.map(url => {
      const apiUrl = url + '/v1/connect' + '?t=' + Date.now();
      return this.http.get<string>(apiUrl, { headers: { 'ngsw-bypass': 'true' }, responseType: 'text' as 'json' }).pipe(
        switchMap(x => {
          if (x === 'ok') {
            return of(url);
          } else {
            return throwError(() => new Error('The returned content is invalid'));
          }
        }),
        timeout(10 * 1000), //10秒超时
        catchError(error => {
          this.sentryService.apiError(apiUrl, error, undefined, undefined, { domain: url });
          return of(null);
        }),
      );
    });

    // 返回第一个响应可用的，如果都不可用，返回null
    merge(...obs)
      .pipe(
        first(x => !!x),
        catchError(() => of(null)),
      )
      .subscribe(availableUrl => {
        // 逻辑说明:
        // -首个测试可用的域名会自动跳转
        // -没有可用的域名且不支持serviceWorker，什么都不做，停留在loading界面
        // -没有可用的域名且支持serviceWorker，清除缓存，5秒后原地刷新
        if (availableUrl) {
          window.location.href = availableUrl + window.location.search;
        } else if ('serviceWorker' in navigator) {
          window.navigator.serviceWorker.getRegistrations().then(registrations => {
            if (registrations.length > 0) {
              const obs = registrations.map(registration => from(registration.unregister()));
              forkJoin(obs).subscribe(() => {
                // 所有sw缓存清除完毕
                this.delayReload();
              });
            } else {
              // 无缓存，直接去刷新
              this.delayReload();
            }
          });
        }
      });
  }

  /**5秒后原地刷新 */
  delayReload() {
    setTimeout(() => {
      this.appService.reFresh();
    }, 5000);
  }

  /** native app 访问 初始化 */
  onCheckNativeApp() {
    const appParams = new URLSearchParams(location.search);
    this.appService.isNativeApp = appParams.get('isApp') === '1' ? true : false;
    if (this.appService.isNativeApp) {
      // 登录token
      const token = appParams.get('token');
      // 未登录token
      const jwtToken = appParams.get('jwtToken');
      document.body.classList.add('isNativeApp');
      this.localStorageService.theme = appParams.get('isDark') === '1' ? 'moon' : 'sun';
      this.appService.themeSwitch$.next(this.localStorageService.theme);
      this.nativeAppService.webAction();
      if (jwtToken) {
        this.localStorageService.loginToken = null;
        this.localStorageService.token = jwtToken;
      } else {
        this.localStorageService.token = this.localStorageService.loginToken = token;
      }
    }
  }

  /**执行优先级较低的东西 */
  afterReady() {
    this.dataCollectionService.gtmPush('home_visit');

    // 订阅网络断网、页面不可见等
    combineLatest([
      merge(
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false)),
      ).pipe(startWith(navigator.onLine), distinctUntilChanged()),
      fromEvent(document, 'visibilitychange').pipe(
        map(e => (e.target as Document).visibilityState),
        startWith(document.visibilityState),
        map(v => v === 'visible'),
        distinctUntilChanged(),
      ),
    ])
      .pipe(untilDestroyed(this), startWith([null, null]), pairwise())
      .subscribe(([[PreOnline, PreVisibility], [online, visibility]]) => {
        if (!online && !this.appService.networkTips$.value) {
          // 显示断网提示
          this.appService.networkTips$.next(true);
        }
        if ((online && PreOnline === false) || (online && visibility && PreVisibility === false)) {
          if (this.localStorageService.loginToken) {
            // 重连操作
            this.appService.assetChanges$.next({ related: 'Wallet' });
          } else {
            this.appService.networkTips$.next(false);
          }
        }
      });

    this.route.queryParamMap.pipe(untilDestroyed(this)).subscribe(queryParam => {
      // 代理邀请码、aff邀请码
      const inviteCode = queryParam.get('inviteCode');
      const aff = queryParam.get('aff');
      if (inviteCode && inviteCode.length > 0) this.localStorageService.inviteCode = inviteCode;
      if (aff && aff.length > 0) this.localStorageService.myAffiliate = aff;

      const modal = queryParam.get('modal');

      if (modal) {
        switch (modal) {
          case 'wheel':
            this.activityService.openWheel();
            break;
          default:
            break;
        }
      }
    });

    if (this.localStorageService.defaultLang && this.localStorageService.loginToken) {
      this.settingsApi.setDefaultLang({ language: this.localStorageService.defaultLang }).subscribe(data => {
        if (data) {
          this.localStorageService.defaultLang = null;
        }
      });
    }

    // 执行未完事情
    while (window.eventBank.length > 0) {
      const e = window.eventBank.shift();
      switch (e.key) {
        case 'showForbidTip':
          this.appService.langFileReady$
            .pipe(first(v => !!v))
            .subscribe(() => this.appService.showForbidTip(e.payload));
          break;
        case 'regBonus':
          this.activityService.checkRegBonus();
          break;
        case 'checkUserDeposit':
          this.resourceApi.getUserDeposit().subscribe(data => {
            if (!data) this.appService.onRedirect('deposit#choose');
          });
          break;
        case 'eddCheck':
          this.eddPopup.onStart();
          break;
        case 'showAuthenticateForEuBanner':
          this.kycService.getQueryauthenticateForEu();
          break;
        default:
          break;
      }
    }

    // 自动打开一次大转盘
    // if (!this.activityService.openWheeled && !this.localStorageService.wheelShown && !this.appService.isNativeApp) {
    //   this.activityService.checkToOpenWheel(5 * 1000);
    // }

    this.userAssetsService.allRate.pipe(untilDestroyed(this)).subscribe(data => {
      this.currencyWalletService.updateRate(data);
    });

    this.signalrService.init();

    //初始化一些serviceWorker事件
    this.swService.init();
  }

  ngOnDestroy(): void {
    if (this.isReady) {
      this.dataCollectionService.addPoint({
        eventId: 30003,
        actionValue1: this.dataCollectionService.getTimDiff('allpage'),
      });
      // 提交上一次埋点信息
      this.dataCollectionService.destory();
    }
  }
}
