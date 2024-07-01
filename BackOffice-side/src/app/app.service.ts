import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Toast } from './shared/interfaces/common.interface';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { UploadType } from 'src/app/shared/interfaces/upload';
import { map } from 'rxjs/operators';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { Auth403 } from 'src/app/shared/api/auth403';
import { Clipboard } from '@angular/cdk/clipboard';
import { MerchantService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private localStorage = inject(LocalStorageService);
  private clipboard = inject(Clipboard);
  private lang = inject(LangService);
  private auth403 = inject(Auth403);
  public merchantService = inject(MerchantService);

  constructor() {
    this.lang.fetchLang();

    this.auth403.refreshChange$().subscribe((res) => {
      this.showToastSubject?.next({
        msgLang: 'common.permissionFail',
        msgChildren: res.map((e) => e.name),
        duration: 5e3,
        reactivateDuration: 3e3,
      });
    });
  }

  option: any = {}; //所有的搜索选项
  showToastSubject: Subject<Toast> = new Subject();
  isContentLoadingSubject = new BehaviorSubject<
    | boolean
    | {
        loading: boolean;
        msg: string;
        msgLang?: string;
      }
    | {
        loading: boolean;
        msg?: string;
        msgLang: string;
      }
  >(false);

  isLoginSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false); // 是否登录
  refresh: Subject<boolean> = new Subject(); //刷新页面
  loginPath = '/login';
  publicPath = [this.loginPath]; // 公共页面不做验证或记录的页面

  jumpToLogin() {
    // 刷新跳转到登录重置服务
    if (this.loginPath.includes(window.location.pathname)) return;
    window.location.pathname = this.loginPath;
    // this.router.navigate([this.loginPath]);
  }

  /**
   * 根据类型获取静态资源地址host
   * @param type {UploadType} 上传类型和接口类型一致
   */
  getStaticHost(type?: UploadType) {
    switch (type) {
      // 这里自定义类型进行返回相应的host
      //   case 'Proxy':
      default:
        return this.localStorage.resourceHost.find((e) => e.name === 'main')?.['host'] || '';
    }
  }

  joinHost(url: string, type?): string {
    if (!url) return '';
    if (!url.startsWith('http')) {
      return this.getStaticHost(type) + (url.startsWith('/') ? url.slice(1) : url);
    }
    return url;
  }

  /** loading流状态 */
  get loading$() {
    return this.isContentLoadingSubject.asObservable().pipe(
      map((e) => {
        return typeof e === 'object' ? e.loading : e;
      })
    );
  }

  /**
   * 复制文本到剪贴板
   * @param text
   */
  copy(text: string): boolean {
    if (!text) {
      this.showToastSubject.next({ msgLang: 'common.copyEmpty' });
      return false;
    }

    const successed = this.clipboard.copy(text);
    this.showToastSubject.next({
      msgLang: 'common',
      msgArgs: successed ? 'copySuccess' : 'copyFiled',
      successed,
    });

    return successed;
  }

  /**
   * 操作成功或失败提示
   */
  toastOpera(successed: boolean) {
    this.showToastSubject.next({
      msgLang: successed ? 'common.operationSuccess' : 'common.operationFailed',
      successed,
    });
  }
}
