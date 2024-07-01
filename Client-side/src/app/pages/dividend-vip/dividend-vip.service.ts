import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { ActivityList } from 'src/app/shared/interfaces/bonus.interface';
import { cacheValue } from 'src/app/shared/service/general.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DividendVipService {
  /** 活动列表订阅 */
  getActivitiesList$!: Observable<ActivityList>;

  constructor(private bounsApi: BonusApi) {}

  /**
   * 缓存活动列表
   *
   * @param params
   * @param params.equipment
   * @returns
   */
  public getActivitiesList(params: { equipment: string }) {
    return (
      this.getActivitiesList$ ??
      ((this.getActivitiesList$ = this.bounsApi
        .getActivityInfo(params)
        .pipe(environment.isApp ? cacheValue(0) : cacheValue(1000 * 60 * 10))),
      this.getActivitiesList$)
    );
  }
}
