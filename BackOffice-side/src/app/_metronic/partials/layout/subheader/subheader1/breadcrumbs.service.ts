import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { getRouteData } from 'src/app/shared/models/tools.model';
import { Breadcrumbs } from 'src/app/shared/interfaces/common.interface';
import { isFunction } from 'lodash';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbsService {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.getCurBreadcrumb();

    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return;

      this.getCurBreadcrumb();
    });
  }

  /**
   * 是否初始化
   */
  public isInit$ = new BehaviorSubject(false);

  /** 面包屑列表 */
  public list: Breadcrumbs[] = [];

  /** 面包屑前缀的字段名 */
  private _field = 'breadcrumbsBefore';

  /** methods */
  /** 处理当前面包屑 */
  async getCurBreadcrumb() {
    const data: any = getRouteData(this.activatedRoute);

    // 应该通过注入的方式
    this.list = [...await this.getData(data?.[this._field]), data].filter(e => !!e);
    this.isInit$.next(true);
  }

  /** 获取面包屑data数据 */
  private async getData(data) {
    const process = (list) => {
      if (Array.isArray(list)) {
        return list;
      } else if (list instanceof Promise) {
        return list;
      }

      return []
    }

    if (isFunction(data)) {
      return process(data(this.list));
    }

    return process(data);
  }

  /** 外部调用更改面包屑列表 */
  public set(v: Breadcrumbs[]) {
    this.list = v;
  }

  /** 外部调用更改面包屑列表 - 除当前的 */
  public async setBefore(v: Breadcrumbs[]) {
    this.list = [...v, this.list.slice(-1)?.[0]].filter(e => !!e);
  }
}
