import { Injectable, OnDestroy } from '@angular/core';
import { AgentApi } from 'src/app/shared/api/agent.api';
import {
  BehaviorSubject,
  combineLatestWith,
  distinctUntilChanged,
  filter,
  finalize,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { skipUntil, takeUntil, tap } from 'rxjs/operators';
import moment from 'moment';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { Team } from 'src/app/shared/interfaces/agent';
import { isEqual } from 'lodash';
import { AppService } from 'src/app/app.service';

@Injectable({ providedIn: 'root' })
export class ProxyService implements OnDestroy {
  constructor(
    private api: AgentApi,
    private subHeader: SubHeaderService,
    private appService: AppService
  ) {
    /** 订阅改变触发值 */
    this.proxyChange$.subscribe();
  }

  public navCount: any = {}; // 头部统计数据
  private _teamList$ = new Subject<{ groupName: string; id: number }[]>();
  private _destroyed$ = new Subject<void>();
  private _curTeamId$ = new BehaviorSubject<number>(0);
  private _curTeamId = 0; // 当前所选团队id
  public selfTeamId = 0; // 自己所在团队id
  public selfTeamList: Team[] = []; // 自己所在团队列表
  private access = new Subject<void>(); // 是否有访问团队
  private throwMsg = new Subject<void>(); // 是否要抛出消息
  public _year$ = new BehaviorSubject<number>(new Date().getFullYear());
  public _month$ = new BehaviorSubject<number>(new Date().getMonth() + 1);
  teamList: { groupName: string; id: number }[] = [];

  private nowMerchantId = '';

  // 1. 初始值完成之后通过behavior触发流请求
  // 2. 如果商户和团队和年份和月份有一个进行改变了也要触发请求

  private _proxyInit = new BehaviorSubject<boolean | undefined>(undefined);
  private _merchant = this.subHeader.merchantId$.pipe(
    tap(() => this._proxyInit.next(undefined)),
    switchMap(() => this.api.group_getgroupid(this.subHeader.merchantCurrentId)),
    tap((res) => {
      this.selfTeamList = res?.data && JSON.stringify(res.data) !== '[{}]' ? res.data : [];
      if (!this.selfTeamList.length) this.appService.showToastSubject.next({ msgLang: 'dashboard.popup.ips' });

      this.selfTeamId = this.teamList.find((e) => this.selfTeamList.some((j) => j.id === e.id))?.id || 0;

      if (this.selfTeamId === 0) {
        this._curTeamId = 0;
      }

      if (this._proxyInit.value !== undefined) {
        this.curTeamIdChange(this.selfTeamId || this._curTeamId);
      }
    }),
    switchMap(() => this.loadTeamList()),
    tap(() => this._proxyInit.next(true)),
    takeUntil(this._destroyed$)
  );

  // 代理数据初始化
  private get init$(): Observable<boolean> {
    return this._proxyInit.asObservable().pipe(filter<any>((init) => init !== undefined));
  }

  // 代理团队、商户、年份、月份改变
  private get proxyChange$(): Observable<any> {
    return this._merchant.pipe(
      combineLatestWith(this.year$, this.month$, this.curTeamId$),
      skipUntil(this.init$), // 必须要过滤初始化undefined值否则要请求多次
      takeUntil(this._destroyed$),
      tap(() => {
        this._value$.next(this._value);
      })
    );
  }

  get month$() {
    return this._month$.asObservable().pipe(
      filter((e) => !isNaN(+e) && typeof e === 'number'),
      takeUntil(this._destroyed$)
    );
  }

  get month() {
    return this._month$.value;
  }

  set month(month: number) {
    this._month$.next(month);
  }

  get year$() {
    return this._year$.asObservable().pipe(
      filter((e) => !isNaN(+e) && typeof e === 'number'),
      takeUntil(this._destroyed$)
    );
  }

  get year() {
    return this._year$.value;
  }

  set year(year: number) {
    this._year$.next(year);
  }

  yearList = [
    new Date().getFullYear() + 2,
    new Date().getFullYear() + 1,
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
  ];

  monthList: any[] = [
    { name: '一月', value: 1, lang: 'common.months.January' },
    { name: '二月', value: 2, lang: 'common.months.february' },
    { name: '三月', value: 3, lang: 'common.months.march' },
    { name: '四月', value: 4, lang: 'common.months.april' },
    { name: '五月', value: 5, lang: 'common.months.may' },
    { name: '六月', value: 6, lang: 'common.months.june' },
    { name: '七月', value: 7, lang: 'common.months.july' },
    { name: '八月', value: 8, lang: 'common.months.august' },
    { name: '九月', value: 9, lang: 'common.months.september' },
    { name: '十月', value: 10, lang: 'common.months.october' },
    { name: '十一月', value: 11, lang: 'common.months.november' },
    { name: '十二月', value: 12, lang: 'common.months.december' },
  ];

  private _value$ = new BehaviorSubject<any>({
    year: this.year,
    month: this.month,
    merchant: this.subHeader.merchantCurrentId,
    team: this._curTeamId,
  });

  private get _value() {
    return {
      year: this.year,
      month: this.month,
      merchant: this.subHeader.merchantCurrentId,
      team: this._curTeamId,
    };
  }

  /** 代理值 */
  get value$() {
    return this._value$.asObservable().pipe(
      distinctUntilChanged(isEqual), // 保证改变值后再触发流，避免重复触发，这个操作符需要放置前面
      filter((e) => !!e), // 过滤空值
      filter((e) => e.merchant && e.team)
    );
  }

  get rangeMonth() {
    const now = moment()
      .set({ year: this.year, month: this.month - 1 })
      .startOf('month');

    return [now.format('x'), now.endOf('month').format('x')];
  }

  /** lifeCycle */
  ngOnDestroy(): void {
    // Root注入，永驻内存不会触发销毁
    this._destroyed$.next();
    this._destroyed$.complete();
    this._proxyInit.complete();
    this.throwMsg.complete();
    this.access.complete();
  }

  // 获取团队列表
  get getTeamList$() {
    return this._teamList$.asObservable().pipe(
      tap(() => this.access.next()),
      takeUntil(this._destroyed$)
    );
  }

  /** 拉取团队 */
  loadTeamList() {
    if (this.nowMerchantId === this.subHeader.merchantCurrentId) {
      return this.getTeamList$;
    } else {
      this.nowMerchantId = this.subHeader.merchantCurrentId;
    }

    this.appService.isContentLoadingSubject.next(true);
    return this.api.group_getgrouplist(this.subHeader.merchantCurrentId).pipe(
      finalize(() => this.appService.isContentLoadingSubject.next(false)),
      tap((res) => {
        res = res.filter((e) => this.selfTeamList.some((j) => j.id === e.id));

        if (!res.length) {
          // this.appService.showToastSubject.next({ msg: '当前账号所选的商户没有自己团队' });
          this.curTeamIdChange(0);
        } else if (!res.some((e) => e.id === this._curTeamId)) {
          // 如果有自己的团队，且当前所选团队不在团队列表里，更新当前团队id
          this.curTeamIdChange(res[0].id);
        }

        this.teamList = res;
        this._teamList$.next(res);
      }),
      takeUntil(this._destroyed$)
    );
  }

  get curTenantId(): string {
    return this.subHeader.merchantCurrentId;
  }

  get curTeamId(): number {
    return this._curTeamId;
  }

  set curTeamId(v: number) {
    this.curTeamIdChange(v);
  }

  curTeamIdChange(id: number) {
    this._curTeamId = id;
    this._curTeamId$.next(id);
  }

  get curTeamId$(): Observable<number> {
    return this._curTeamId$.asObservable().pipe(filter((e) => !!e));
  }

  /** 触发改变流 */
  triggerChange() {
    this._value$.next(undefined); // 置空存入缓存distinctUntilChanged进行对比通过filter过滤掉
    this._value$.next(this._value); // 重新设置新值触发流更新
  }

  /** 清空 -> 账号登录需清空，重复数据会造成缓存情况 */
  clear() {
    this.navCount = {}; // 头部统计数据
    this._proxyInit.next(undefined);
    this._teamList$.next([]);
    this._destroyed$ = new Subject<void>();
    this._curTeamId$.next(0);
    this._curTeamId = 0; // 当前所选团队id
    this.selfTeamId = 0; // 自己所在团队id
    this.selfTeamList = []; // 自己所在团队列表
    this.access = new Subject<void>(); // 是否有访问团队
    this.throwMsg = new Subject<void>(); // 是否要抛出消息
    this._month$ = new BehaviorSubject<number>(new Date().getMonth() + 1);
    this.teamList = [];
    this.nowMerchantId = '';
    this._value$.next(undefined);
  }
}
