import { EventEmitter, Injectable, inject, OnDestroy, Pipe, PipeTransform, TemplateRef } from '@angular/core';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, combineLatestWith, filter, Observable, of, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { getRouteData, getTime, toDateStamp } from 'src/app/shared/models/tools.model';
import { Country } from 'src/app/shared/interfaces/select.interface';
import { environment } from 'src/environments/environment';
import { KYCRegionEnum } from 'src/app/shared/interfaces/kyc';
import { cloneDeep } from 'lodash';


/**
 * 商户服务
 * @description 基础服务里面不要放置别的服务，否则会造成循环依赖
 */
@Injectable({
  providedIn: 'root',
})
export class MerchantService {
  _merchantList: { value: string, name: string }[] = []; // 商户下拉列表
  _merchantCurrentId$ = new BehaviorSubject<string>('');

  /**
   * 当前商户所选id
   */
  _merchantCurrentId = '';

  /**
   * SIT 22719699803205     UAT/PROD 23014054398789 (TODO：与后端沟通过，暂无其他方法区别商户5与其他商户，目前只能根据商户ID进行区分)
   */
  protected readonly isMerchant5 = [22719699803205, 23014054398789];

  /**
   * 是否商户5
   * SIT 22719699803205     UAT/PROD 23014054398789 (TODO：与后端沟通过，暂无其他方法区别商户5与其他商户，目前只能根据商户ID进行区分)
   */
  get isFiveMerchant() {
    return this.isMerchant5.includes(+this._merchantCurrentId);
  }

  isFiveMerchantFn(v) {
    return this.isMerchant5.includes(+v);
  }

}

@Pipe({
  name: 'merchantName',
  standalone: true,
  pure: false,
})
export class SubHeaderPipe implements PipeTransform, OnDestroy {
  constructor(private subHeaderService: SubHeaderService) {
    subHeaderService.merchantInit$().subscribe();
  }

  get value() {
    return this._value || this._nullValue;
  }

  private _value = '';
  private _nullValue = '-';
  private _recordId = '';
  private _destroyed$ = new Subject<void>();

  transform(id: any, merchantList?: any[], nullValue = '-'): any {
    if (this._nullValue !== nullValue) {
      this._nullValue = nullValue;
    }

    if (this._recordId === id) return this.value;
    this._recordId = id;

    this.subHeaderService.merchantList$.pipe(takeUntil(this._destroyed$)).subscribe((res) => {
      this._value = res.find(e => {
        return e.value === this._recordId;
      })?.name || '';
    });

    return this.value;
  }

  ngOnDestroy(): void {
    console.log('destroy$');
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}

@Injectable({
  providedIn: 'root',
})
export class SubHeaderService implements OnDestroy {
  private merchantService = inject(MerchantService);
  private selectAPI = inject(SelectApi);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.loadMerchant();
    this.goMoneyLoadMerchant(); // TODO 有时间再优化goMoney商户菜单

    this.curMerchantRouteData = getRouteData(this.activatedRoute) || {};
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => getRouteData(this.activatedRoute) || {}),
        takeUntil(this._destroyed),
      )
      .subscribe((data: any) => {
        this.curMerchantRouteData = data;

        // 如果是GB切换其他商户
        // if (+this._merchantCurrentId$.value === -1 && !this.showMerchantGB) {
        //   if (this.merchantList.length) {
        //     this.merchantCurrentId = this.merchantList[0]['value'] || ''; // 并通知change
        //   } else {
        //     this.merchantCurrentId = '';
        //   }
        // }
      });
  }

  timeList = [
    { label: '1D', value: '1D' }, // 864e5
    { label: '7D', value: '7D' }, // 7*864e5
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' },
    { label: 'YTD', value: 'YTD' }, // 年初至今
    { label: 'ALL', value: '' },
    { label: '自定义', value: 'custom' },
  ]; // 国家下拉列表
  customTime: any[] = [];
  regionList: { name: string, value: KYCRegionEnum, lang: string }[] = [
    { name: '全部', value: KYCRegionEnum.Unknown, lang: 'common.all' },
    { name: '亚洲', value: KYCRegionEnum.Asia, lang: 'member.kyc.region.Asia' },
    { name: '欧洲', value: KYCRegionEnum.Europe, lang: 'member.kyc.region.Europe' },
  ]; // 地区下拉列表
  countryList: Country[] = []; // 国家下拉列表
  goMoneyMerchantList: any[] = []; // 商户下拉列表
  showMerchantList: boolean = true; // 预算管理全局调整是否显示商户下拉（全局搜索再做调整）
  merchantList$ = new BehaviorSubject<{ value: string, name: string }[]>([]);

  private _destroyed = new Subject<void>();

  private _regionCurrent$ = new BehaviorSubject<KYCRegionEnum>(KYCRegionEnum.Unknown);
  private _goMoneyMerchantCurrentId$ = new BehaviorSubject<number>(0);
  private _countryCurrentCode$ = new BehaviorSubject<string>('');
  private _timeCurrent$ = new BehaviorSubject<number[]>([]);

  /** 商户列表过滤GB的 */
  get merchantList() {
    // return this._merchantList.filter((e) => this.showMerchantGB ? true : +e.value !== -1);
    return this.merchantService._merchantList;
  }

  set merchantList(v: any) {
    this.merchantService._merchantList = v;
    this.merchantList$.next(v);
  }

  get merchantListAll() {
    return this.merchantService._merchantList;
  }

  /** 实时获取商户 merchantCurrentId */
  get merchantId$() {
    return this.merchantService._merchantCurrentId$.asObservable().pipe(
      // 转Observable 外部没有next方法
      filter((e) => !!e),
      takeUntil(this._destroyed),
    );
  }

  /** 当前区域所选 */
  private _regionCurrent = KYCRegionEnum.Unknown;
  get regionCurrent() {
    return this._regionCurrent;
  }

  set regionCurrent(v: KYCRegionEnum) {
    // if (this._regionCurrent === v) return;

    this._regionCurrent = v;
    this._regionCurrent$.next(v);
  }

  private _combineLatestData(data$: Observable<any>[]) {
    if (!(Array.isArray(data$) && data$.length)) return of(undefined);

    return data$[0].pipe(combineLatestWith(...data$.slice(1)));
  }

  /** 地区 */
  get region$() {
    return this._regionCurrent$.asObservable().pipe(
      takeUntil(this._destroyed),
    );
  }

  /**
   * 观察商户源和地区源
   */
  get merchantRegion$(): Observable<string[]> {
    return this._combineLatestData([this.merchantId$, this._regionCurrent$]) as Observable<string[]>;
  }

  /** 当前商户所选id */
  get merchantCurrentId() {
    return this.merchantService._merchantCurrentId;
  }

  set merchantCurrentId(v: string) {
    // if (this._merchantCurrentId === v) return;

    this.merchantService._merchantCurrentId = v;
    this.merchantService._merchantCurrentId$.next(v);
  }

  /**
   * 是否是商户5
   */
  get isFiveMerchant() {
    return this.merchantService.isFiveMerchant;
  }

  /**
   * 是否是商户5
   */
  isFiveMerchantFn(v: any) {
    return this.merchantService.isFiveMerchantFn(v)
  }

  /** 实时获取国家 */
  get countryCode$() {
    return this._countryCurrentCode$.asObservable().pipe(
      // 转Observable 外部没有next方法
      // filter((e) => !!e),
      takeUntil(this._destroyed),
    );
  }

  /** 当前国家所选id */
  private _countryCurrentCode: string = '';
  get countryCurrentCode() {
    return this._countryCurrentCode;
  }

  set countryCurrentCode(v: string) {
    // if (this._countryCurrentCode === v) return;

    this._countryCurrentCode = v;
    this._countryCurrentCode$.next(v);
  }

  /** 当前时间所选 */
  private _timeCurrent: string = '';
  get timeCurrent() {
    return this._timeCurrent;
  }

  set timeCurrent(v: string) {
    this._timeCurrent = v;

    this._timeCurrent$.next(this.curTime);
  }

  get curTime() {
    switch (this._timeCurrent) {
      case 'custom':
        return [toDateStamp(this.customTime[0]) as number, toDateStamp(this.customTime[1], true) as number];
      default:
        return getTime(this._timeCurrent);
    }
  }

  get timeCurrent$() {
    return this._timeCurrent$.asObservable().pipe(
      takeUntil(this._destroyed),
    );
  }

  /** 当前绑定路由的data */
  private _curMerchantRouteData: any = {};
  get curMerchantRouteData() {
    return this._curMerchantRouteData;
  }

  set curMerchantRouteData(v: any) {
    const oldShow = this.showMerchant;
    const oldGoMoneyShow = this.showGoMoneyMerchant;
    const oldCountryShow = this.showCountry;

    this._curMerchantRouteData = v;

    // 初始化请求
    this.showMerchant && !oldShow && this.loadMerchant();
    this.showGoMoneyMerchant && !oldGoMoneyShow && this.goMoneyLoadMerchant();
    this.showCountry && !oldCountryShow && this.loadCountry();
  }

  /** 是否显示时间过滤 */
  get showTime(): boolean {
    return (this.showMerchantList && this.curMerchantRouteData?.['showTime']) ?? false;
  }

  /** 是否显示区域 */
  get showRegion(): boolean {
    return this.curMerchantRouteData?.['showRegion'] ?? false;
  }

  /** 是否显示商户 */
  get showMerchant(): boolean {
    return (this.showMerchantList && this.curMerchantRouteData?.['showMerchant']) ?? false;
  }

  /** 是否显示GB商户 */
  get showMerchantGB(): boolean {
    return (this.showMerchantList && this.curMerchantRouteData?.['showMerchantGB']) ?? false;
  }

  /** 是否显示GoMoney商户 */
  get showGoMoneyMerchant(): boolean {
    return this.curMerchantRouteData?.['showGoMoneyMerchant'] ?? false;
  }

  /** 是否显示国家 */
  get showCountry(): boolean {
    return this.curMerchantRouteData?.['showCountry'] ?? false;
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** 拉取商户 */
  loadMerchant(skip?: boolean): void {
    if (!this.showMerchant && !skip) return; // 有显示才进行请求
    if (this.isInit) return; // 已经初始化过了
    if (this.merchantList && this.merchantList.length) return;

    this.getMerchantList().subscribe();
  }

  /**
   * 拉取一次商户列表，如果有拉取过则直接返回
   * @private
   */
  private isInit = false;

  merchantInit$() {
    if (!this.isInit) {
      return this.getMerchantList();
    } else {
      return of(this.merchantList);
    }
  }

  private getMerchantList(): Observable<any> {
    this.isInit = true;
    return this.selectAPI.getMerchantList().pipe(
      tap((res) => {
        this.merchantList = res;

        if (this.merchantList.length) {
          let fistId = this.merchantList[0]['value'] || ''; // 并通知change

          if (!environment.isOnline) {
            fistId = this.merchantList.find(e => e.value === 908740293083205)?.value || fistId;
          }

          this.merchantCurrentId = fistId;
        }
      }),
    );
  }

  /** 拉取GoMoney商户 */
  goMoneyLoadMerchant(skip?: boolean): void {
    if (!this.showGoMoneyMerchant && !skip) return; // 有显示才进行请求
    if (this.goMoneyMerchantList && this.goMoneyMerchantList.length) return;

    this.goMoneyGetMerchantList().subscribe();
  }

  private goMoneyGetMerchantList(): Observable<any> {
    return this.selectAPI.goMoneyGetMerchant().pipe(
      tap((res) => {
        this.goMoneyMerchantList = res;

        if (res.length) {
          this.merchantCurrentId = res[0]['id'] && String(res[0]['id']) || ''; // 并通知change
        }
      }),
    );
  }

  /** 拉取国家 */
  loadCountry(skip?: boolean): void {
    if (!this.showCountry && !skip) return; // 有显示才进行请求
    if (this.countryList && this.countryList.length) return;

    this.getCountryList().subscribe();
  }

  private getCountryList(): Observable<any> {
    return this.selectAPI.getCountryFlat(true).pipe(
      tap((res) => {
        this.countryList = res;
      }),
    );
  }

  /** 自定义模板渲染内容 */
  _renderList: any[] = [];
  renderListChange$ = new BehaviorSubject<any[]>([]);

  get renderList(): Observable<any[]> {
    return this.renderListChange$.asObservable();
  }

  pushRender(tpl: any): void {
    this._renderList.push(tpl);
    this.renderListChange$.next([...this._renderList]);
  }

  popRender(tpl: TemplateRef<any>): void {
    const oldLen = this._renderList.length;
    this._renderList = this._renderList.filter((e) => e !== tpl);

    // 没有找到需要移除的元素
    if (this._renderList.length === oldLen) return;
    this.renderListChange$.next([...this._renderList]);
  }

  // 获取商户名字
  getMerchantName(merchantId: any, list?: any[]): string {
    return (list || this.merchantListAll).find((e) => +e.value === +merchantId)?.name || '';
  }

  clearMerchant(): void {
    this.merchantList = [];
    this.goMoneyMerchantList = [];
    this._renderList = [];
  }
}
