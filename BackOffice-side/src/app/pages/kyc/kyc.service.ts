import { Injectable } from '@angular/core';
import { KYCRegionEnum } from 'src/app/shared/interfaces/kyc';
import { BehaviorSubject, filter, finalize } from 'rxjs';
import { ResourceApi } from 'src/app/shared/api/resource.api';
import { ResourceRegionItem } from 'src/app/shared/interfaces/resource';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { AppService } from 'src/app/app.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';

@Injectable({
  providedIn: 'root',
})
export class KycService {
  constructor(
    private resourceApi: ResourceApi,
    private ls: LocalStorageService,
    private appService: AppService,
    private subHeaderService: SubHeaderService
  ) {
    this.isLoading = true;
    this.resourceApi
      .regionList()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe((res) => {
        this.regionListCache = res;
        this.updateRegionList();
      });
  }

  /**
   * 是否加载中
   */
  public isLoading = false;

  /**
   * goGaming的地区大洲列表
   */
  private _goGamingRegionList: ResourceRegionItem[] = [];
  regionListCache: ResourceRegionItem[] = [];
  get regionList() {
    return this._goGamingRegionList || [];
  }

  set regionList(value) {
    this._goGamingRegionList = value;
  }

  /**
   * 当前大洲地区
   */
  private _curRegion = KYCRegionEnum.Unknown;
  private _curRegion$ = new BehaviorSubject(this._curRegion);

  get curRegion$() {
    return this._curRegion$.asObservable().pipe(filter((e) => !!e));
  }

  get curRegion(): KYCRegionEnum {
    return this._curRegion;
  }

  set curRegion(value: KYCRegionEnum) {
    this._curRegion = value;
    this._curRegion$.next(value);
  }

  /**
   * 是否是亚洲
   */
  public get isAsia(): boolean {
    return this.curRegion === KYCRegionEnum.Asia;
  }

  /**
   * 处理当前商户是否有可用的地区
   */
  public updateRegionList() {
    this.regionList =
      this.ls.userInfo.isSuperAdmin && +this.subHeaderService.merchantCurrentId !== 1
        ? this.regionListCache // 超管可使用所有地区
        : (this.ls.userInfo.continentalities
            .map((e) => {
              const matchedItem = this.regionListCache.find((j) => j.id === e.id);
              // 未匹配上的地区抛出提示
              if (!matchedItem)
                this.appService.showToastSubject.next({
                  msgLang: ['form.notFound', 'member.kyc.region.' + e.name],
                });
              return matchedItem;
            })
            .filter((e) => !!e) as ResourceRegionItem[]);

    // 没有可使用的地区
    if (!this.regionList.length && +this.subHeaderService.merchantCurrentId === 1) {
      this.appService.showToastSubject.next({ msgLang: 'member.kyc.noUsableRegion' });
    }

    // 默认选中第一个可用大洲
    this.curRegion = this.regionList[0]?.name || KYCRegionEnum.Unknown;
  }
}
