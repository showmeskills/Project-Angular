import { ApplicationRef, Inject, Injectable, InjectionToken, OnDestroy, Optional } from '@angular/core';
import * as _ from 'lodash';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, lastValueFrom, Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';

import { KTUtil } from 'src/assets/js/components/util';
import KTLayoutAsideToggle from 'src/assets/js/layout/base/aside-toggle';
import KTLayoutStickyCard from 'src/assets/js/layout/base/sticky-card';
import KTLayoutStretchedCard from 'src/assets/js/layout/base/stretched-card';
import KTLayoutBrand from 'src/assets/js/layout/base/brand';
import KTLayoutAside from 'src/assets/js/layout/base/aside';
import KTLayoutAsideMenu from 'src/assets/js/layout/base/aside-menu';
import { interpolationExpression } from 'src/app/shared/models/tools.model';
import { LangKey, LangParams } from 'src/app/shared/interfaces/common.interface';
import { environment } from 'src/environments/environment';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { HttpClient } from '@angular/common/http';

export const LangPrefix = new InjectionToken<string>('LanguageTranslatePrefix');

@Injectable({
  providedIn: 'root',
})
export class LangService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ApplicationRef,
    private ls: LocalStorageService
  ) {
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return;

      this.getLangType(true);
    });
  }

  langList: { [key: string]: string } = {};
  supportLang = ['en-US', 'zh-CN'];
  private _currentLang = this.getLangType();
  private langList$ = new BehaviorSubject(this.langList);
  private _currentLang$ = new BehaviorSubject(this.currentLang);

  get currentLang$() {
    return this._currentLang$.asObservable();
  }

  get currentLang() {
    return this._currentLang;
  }

  set currentLang(lang: string) {
    document.documentElement.setAttribute('lang', lang);
    if (this._currentLang === lang) return;

    this._currentLang = lang;
    this._currentLang$.next(lang);
    this.fetchLang();
  }

  /** getters */
  /**
   * 是否是中文
   */
  get isLocal() {
    return this.currentLang === 'zh-CN';
  }

  /** methods */
  private getLangType(isPull = false) {
    const pathLang = window.location.pathname.match(/^\/(.*?)\//)?.[1] || '';
    const type = this.supportLang.includes(pathLang) ? pathLang : this.ls.lang;

    this.ls.lang = type;

    if (isPull) {
      this.currentLang = type;
    } else {
      this._currentLang = type;
    }

    return type;
  }

  /**
   * 拉取语言列表
   */
  public fetchLang() {
    this.getLangType();

    this.http.get(`assets/i18n/${this.currentLang}.json?=${environment.version}`).subscribe((res: any) => {
      this.langList$.next(res);
      this.initDom();
    });
  }

  /**
   * 获取语言
   * @param key
   * @param params {LangParams}
   */
  public get(key: LangKey, params?: LangParams): Observable<string | undefined | any> {
    return this.langList$.pipe(
      map((list) => _.get(list, key, undefined)), // 获取语言
      map((res: any) => this.mapParam(res, params)), // 参数和插值处理
      map((res) => this.mapContent(res)) // 内容处理
    );
  }

  /**
   * 参数和插值处理
   * @param content
   * @param params
   * @private
   */
  private mapParam(content: string | undefined, params?: LangParams) {
    let res = content;
    let obj: any = {};
    let defaultValue = undefined;

    if (params !== undefined) {
      let arg = params;

      if (typeof arg === 'object') {
        arg = arg.$path;
        obj = params;
        defaultValue = params.$defaultValue;
      }

      if (typeof arg === 'number') {
        res = _.get(res, `[${arg}]`, undefined);
      } else if (typeof arg === 'string') {
        res = _.get(res, arg, undefined);
      }
    }

    return res === undefined ? defaultValue : interpolationExpression(res, obj);
  }

  /**
   * 获取语言返回Promise
   * @param key
   * @param params {LangParams}
   */
  public getOne<T = any>(key: LangKey, params?: LangParams): Promise<string | undefined | T> {
    return lastValueFrom(this.get(key, params).pipe(take(1)));
  }

  /**
   * 获取语言返回Promise
   * @param key
   * @param params {LangParams}
   */
  public getOneArr<T = any>(key: LangKey[], params?: LangParams): Promise<string | undefined | T> {
    return Promise.all(key.map((k) => lastValueFrom(this.get(k, params).pipe(take(1))))).then((res) => {
      return res.join('');
    });
  }

  /**
   * 内容处理
   * @param content
   * @private
   */
  private mapContent(content: string | undefined) {
    return content;
  }

  /**
   * 切换语言
   * @param lang
   */
  public async use(lang: string) {
    if (!this.supportLang.includes(lang)) return console.error('【LangService】 not found lang: ', lang);

    await this.router.navigateByUrl('/' + lang + this.getPath());
  }

  /**
   * 切换语言(大刷新)
   * @param lang
   */
  public async toggle(lang: string) {
    if (!this.supportLang.includes(lang)) {
      return console.error('【LangService】 not found lang: ', lang);
    } else {
      await this.router.navigateByUrl('/' + lang + this.getPath());
      location.reload();
    }
  }

  /**
   * 初始化dom
   * @private
   */
  private initDom() {
    // 切换语言后，重新初始化 有的会刷新dom导致事件失效
    KTUtil.ready(() => {
      setTimeout(() => {
        // Init Brand Panel For Logo
        KTLayoutBrand.init('kt_brand');
        // Init Aside
        KTLayoutAside.init('kt_aside');
        // Init Aside Menu
        KTLayoutAsideMenu.init('kt_aside_menu');
        KTLayoutAsideToggle.init('kt_aside_toggle');

        // Init Sticky Card
        KTLayoutStickyCard.init('kt_page_sticky_card');
        // Init Stretched Card
        KTLayoutStretchedCard.init('kt_page_stretched_card');

        this.cdr.tick();
      }, 100);
    });
  }

  private getPath() {
    const path = window.location.pathname.match(/^\/(.*?)\/(.*?)$/)?.[2] || '';
    return `/${path}${window.location.search}${window.location.hash}`;
  }
}

@Injectable()
export class CurLangService implements OnDestroy {
  constructor(private langService: LangService, @Optional() @Inject(LangPrefix) private langPrefix: string) {}

  private _destroy$ = new Subject<void>();

  /**
   * 获取当前环境的语言数据
   * @param key
   * @param params {LangParams}
   */
  public get(key: LangKey, params?: LangParams): Observable<string | undefined> {
    key = this.langPrefix ? this.langPrefix + '.' + key : key;

    return this.langService.get(key, params).pipe(takeUntil(this._destroy$));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
