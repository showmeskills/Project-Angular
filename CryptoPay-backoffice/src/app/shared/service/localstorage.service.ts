import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { UserInfo, UserInfoData } from 'src/app/shared/interfaces/common.interface';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'token';
const USER_MENU = 'menu'; // 当前用户导航
const USER_INFO = 'userInfo';
const USER_INFO_RESOURCE_HOST = 'resourceHost'; // 资源服务器地址
const REDIRECT_PATH = 'redirectPath';
const LANGUAGE = 'lang'; // 语言

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  get redirectPath() {
    return LocalStorageService.getValue(REDIRECT_PATH);
  }

  set redirectPath(path: any) {
    LocalStorageService.setValue(REDIRECT_PATH, path);
  }

  get lang() {
    return (
      LocalStorageService.getValue(LANGUAGE) ||
      (['zh-CN', 'en-US'].includes(window.navigator.language) && window.navigator.language) || // 浏览器语言
      'zh-CN'
    );
  }

  set lang(lang: any) {
    LocalStorageService.setValue(LANGUAGE, lang);
  }

  /**
   * 是否有GB资源的用户
   */
  get isGB(): boolean {
    return this.userInfo?.isGB || false;
  }

  get userInfo(): UserInfoData {
    return JSON.parse(LocalStorageService.getValue(USER_INFO) as string) || {};
  }

  set userInfo(value: UserInfo | UserInfoData) {
    value = { ...value, isGB: value?.userResources?.some((e) => e.id == -1) || false } as UserInfoData;
    LocalStorageService.setValue(USER_INFO, JSON.stringify(value));
  }

  get token(): string | null {
    return LocalStorageService.getValue(TOKEN_KEY);
  }

  set token(value: string | null) {
    LocalStorageService.setValue(TOKEN_KEY, value);
  }

  private static getValue(key: string): string | null {
    return localStorage.getItem(key);
  }

  private static setValue(key: string, value: string | null) {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
      return;
    }

    value = typeof value === 'object' ? JSON.stringify(value) : value;

    localStorage.setItem(key, value);
  }

  /** 左侧导航菜单 */
  get menu() {
    return JSON.parse(LocalStorageService.getValue(USER_MENU) as string) || [];
  }

  set menu(value) {
    LocalStorageService.setValue(USER_MENU, JSON.stringify(value));
    this.#menu$.next(value);
  }

  #menu$ = new BehaviorSubject(this.menu);
  menu$ = this.#menu$.asObservable();

  /**
   * 获取菜单根据code
   * @param code
   */
  getMenuByCode(code: string) {
    let res: any = undefined; // 闭包一手变量 下面递归完成返回出去

    const nav = cloneDeep(this.menu);
    const loop = (nav: any[], code) => {
      return nav.find((e) => {
        if (e.code === code) {
          // 核心：根据名称匹配 待接口更新换判断方式
          const tmp = cloneDeep(e); // 拷贝对象
          delete tmp['subMenus']; // 删除子菜单
          res = tmp;

          return true;
        } else if (e.subMenus?.length) {
          return loop(e.subMenus, code);
        }
      });
    };

    loop(nav, code);

    return res || undefined;
  }

  /**
   * 资源host
   */
  get resourceHost(): { name: string; host: string }[] {
    return (this.userInfo?.[USER_INFO_RESOURCE_HOST] as any[]) || [];
  }
}
