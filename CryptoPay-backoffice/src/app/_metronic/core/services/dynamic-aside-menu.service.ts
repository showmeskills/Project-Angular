import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynamicAsideMenuConfig } from '../../configs/dynamic-aside-menu.config';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { cloneDeep } from 'lodash';
import { AppService } from 'src/app/app.service';
import { Menu } from 'src/app/shared/interfaces/menu-item';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';

const emptyMenuConfig = {
  items: [],
};

@Injectable({
  providedIn: 'root',
})
export class DynamicAsideMenuService {
  private menuConfigSubject = new BehaviorSubject<any>(emptyMenuConfig);
  menuConfig$: Observable<any>; // 导航配置更新
  #menuData = [];

  constructor(private ls: LocalStorageService, private appService: AppService) {
    this.menuConfig$ = this.menuConfigSubject.asObservable();
    // this.loadMenu(); // 外部手动调用loadMenu这里只会初始化一次
  }

  // Here you able to load your menu from server/data-base/localStorage
  // Default => from DynamicAsideMenuConfig
  loadMenu() {
    this.setMenu(this.getConfig());
  }

  private setMenu(menuConfig) {
    this.menuConfigSubject.next(menuConfig);
  }

  private getMenu(): any {
    return this.menuConfigSubject.value;
  }

  getConfig(): any {
    if (
      environment.localNavUser &&
      Array.isArray(environment.localNavUser) &&
      environment.localNavUser.some((e) => this.ls.userInfo.userName === e) // 如果有本地配置的用户名，则显示本地配置的导航
    )
      return cloneDeep(DynamicAsideMenuConfig);

    if (!this.ls.menu?.length)
      return this.appService.showToastSubject.next({
        msg: '没有可用的权限',
      });
    const menu = cloneDeep(this.ls.menu);
    this.#menuData = menu;
    const localMenu = cloneDeep(DynamicAsideMenuConfig).items; // 本地导航配置

    /**
     * 递归获取可显示导航
     * @param e
     */
    const loopFilterMenu = (e: any) => {
      return e.filter((j) => {
        const isShow = j.state === 'Enabled' && j.hidden === false;

        if (!isShow) return false; // 隐藏不显示

        j.subMenus = loopFilterMenu(j.subMenus); // 递归子菜单显示

        return true;
      });
    };

    /**
     * 递归获取导航内容
     */
    const loopGetMenu = (nav: any[], item: Menu) => {
      let res: any = undefined; // 下面递归完成返回出去

      nav = cloneDeep(nav);
      const loop = (nav: any[], item: Menu) => {
        return nav.find((e) => {
          if (e.code === item.code) {
            // 核心：根据名称匹配 待接口更新换判断方式
            const tmp = cloneDeep(e); // 拷贝对象
            delete tmp['submenu']; // 删除子菜单
            delete tmp['thirdmenu']; // 删除三级菜单
            res = tmp;

            return true;
          } else if (e.submenu && e.submenu.length) {
            return loop(e.submenu, item);
          } else if (e.thirdmenu && e.thirdmenu.length) {
            return loop(e.thirdmenu, item);
          }
        });
      };

      loop(nav, item);

      return res;
    };

    /**
     * 递归生成导航内容
     */
    const loopMenu = (menu: Menu[]) => {
      const loop = (menu: Menu[], level = 0) => {
        let isIncrementLevel = false; // 是否递增过层级

        return menu
          .map((e) => {
            const res = loopGetMenu(localMenu, e); // 获取导航内容

            if (!res) {
              console.warn(`没有匹配到导航【${level}】`, e);
              return undefined;
            }

            res.title = e.name; // 设置标题

            // 如果有子菜单
            if (e.subMenus?.length) {
              // 每次递归层级子元素递归只加一次
              if (!isIncrementLevel) {
                level++;
                isIncrementLevel = true;
              }

              res[level == 1 ? 'submenu' : 'thirdmenu'] = loop(e.subMenus, level);
            }

            return res;
          })
          .filter((e) => {
            return !!e;
          });
      };

      return loop(menu, 0);
    };

    return {
      items: loopMenu(loopFilterMenu(menu)),
    };
  }

  /** 获取第一个有权限的导航 - ！没测试需再测再使用 */
  getFirstMenuPath(): any {
    const menu = this.getMenu();

    if (!(menu && menu?.items?.length)) return null;

    const firstMenu = menu.items[0];
    const res = firstMenu.submenu?.length ? firstMenu.submenu[0] : firstMenu;

    return res.thirdmenu?.length ? res.thirdmenu[0] : res;
  }

  /**
   * 根据path获取导航节点
   * @param path
   */
  findByPath(path: string) {
    let res;
    const loop = (e: any[]) => {
      return e.find((j) => {
        if (j.page === path) {
          res = j;
          return true;
        } else if ((j.submenu)?.length) {
          return loop(j.submenu);
        } else if (j?.thirdmenu?.length) {
          return loop(j?.thirdmenu);
        }

        return false;
      });
    }

    loop(this.getMenu().items);

    return res;
  };

  /**
   * 遍历传入字段，匹配字段值支持数组的值，获取当前导航节点，返回结果为找到的所有导航节点
   * @param menuData 导航API原数据
   * @param field 字段
   * @param value 字段值
   */
  private findByField<T>(menuData, field: string, value: T | T[]) {
    let res: any[] = [];

    const loop = (e: any[]) => {
      e.forEach((j) => {
        if ((j.subMenus)?.length) {
          loop(j.subMenus);
        }

        if (j?.permissions?.length) {
          loop(j?.permissions);
        }

        if (Array.isArray(value)) {
          if (value.includes(j[field])) {
            res.push(j);
          }
        } else {
          if (j[field] === value) {
            res.push(j);
          }
        }
      });
    }

    loop(cloneDeep(menuData));

    return res;
  }

  /**
   * 根据权限获取导航节点
   * @param permissionCode 权限code
   */
  getByCode(permissionCode: unknown | unknown[]) {
    return this.findByField(this.#menuData, 'code', permissionCode);
  }

  /**
   * 根据权限获取导航节点返回Observable
   * @param permissionCode 权限code
   */
  getByCode$(permissionCode: unknown | unknown[]) {
    return this.ls.menu$.pipe(
      tap((menu) => this.#menuData = cloneDeep(menu)),
      map(() => this.getByCode(permissionCode))
    );
  }

  /**
   * 根据权限获取导航节点 返回Observable
   * @param permissionCode 权限code
   * @param isAllMatch {boolean} 是否全部权限都有
   */
  getByCodeAll$(permissionCode: unknown | unknown[], isAllMatch: boolean = false) {
    return this.getByCode$(permissionCode).pipe(
      map((menuList) => ({
        permission: menuList.length >= (isAllMatch ? (Array.isArray(permissionCode) ? permissionCode.length : 1) : 1),
        matchList: menuList,
        needList: Array.isArray(permissionCode) ? permissionCode : [permissionCode],
      }))
    );
  }

  /**
   * 根据节点对象获取所有父节点
   */
  getParentNodesByNode(node: any) {
    let res: any = [];
    const loop = (e: any) => {
      if (e) {
        res.push(e);
        loop(this.findByPath(e.page));
      }
    };

    loop(node);

    return res;
  }
}
