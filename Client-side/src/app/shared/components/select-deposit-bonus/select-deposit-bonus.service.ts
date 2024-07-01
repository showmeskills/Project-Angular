import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { BonusActivitCallBackData } from 'src/app/shared/interfaces/bank-card.interface';
import { BonusList } from 'src/app/shared/interfaces/bonus.interface';
import { cacheValue } from 'src/app/shared/service/general.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
@Injectable({
  providedIn: 'root',
})
export class SelectDepositBonusService {
  constructor(
    private localeService: LocaleService,
    private bonusApi: BonusApi,
    private appService: AppService,
  ) {}

  /**
   * 是否开启 欧洲 红利流程
   *
   * @returns
   */
  get switchEuBonusFlow() {
    return JSON.parse(this.appService.tenantConfig?.config?.switchEuBonusFlow || 'false');
  }

  /** 红利 兑换 是否开启  用于 红利弹窗 兼容欧洲用户弹窗*/
  isOpenCouponCodeDeposit: boolean = false;

  /** 是否是 兑换券 渠道 */
  isCouponCodeWay: boolean = false;

  /**红利缓冲池 */
  private topUpBonusBuffer: { [key: string]: Observable<any> } = {};

  /**重置缓冲池 */
  public resetBuffer() {
    this.topUpBonusBuffer = {};
  }

  /**
   * 非缓存获取红利
   *
   * @param currency
   * @param amount
   * @returns
   */
  public getTopUpBonus(currency: string = 'USDT', amount: number = 100000): Observable<BonusList[]> {
    return this.bonusApi.getBonusActivity({ currency, amount }).pipe(
      map(x => {
        const couponcodedeposit = x?.find(v => v?.bonusActivitiesNo === 'couponcodedeposit');

        if (couponcodedeposit) {
          this.isOpenCouponCodeDeposit = true;
        } else {
          this.isOpenCouponCodeDeposit = false;
        }

        return (
          x
            ?.filter(v => v?.bonusActivitiesNo !== 'couponcodedeposit') // 过滤 兑换券
            ?.map((item: BonusActivitCallBackData, key: number) => {
              const activityTypeName = this.getActivityType(item?.activityType, item?.labels);
              const grantTypeName = this.getGrantType(item?.prizeType);
              return {
                ...item,
                index: key,
                isActive: false,
                activityTypeName,
                grantTypeName,
              };
            }) || []
        );
      }),
    );
  }

  /**
   * 缓存红利
   *
   * @param currency
   * @param amount
   * @returns
   */
  public bufferTopUpBonus(currency: string, amount: number): Observable<BonusList[]> {
    const param = { currency, amount };
    const bufferKey = window.btoa(JSON.stringify(param));
    return (
      this.topUpBonusBuffer[bufferKey] ??
      ((this.topUpBonusBuffer[bufferKey] = this.getTopUpBonus(currency, amount).pipe(
        cacheValue(1000 * 60 * 1), //缓存1分钟
        map(x => JSON.parse(JSON.stringify(x))),
      )),
      this.topUpBonusBuffer[bufferKey])
    );
  }

  /**
   * 获取红利券类型
   *
   * @param type
   * @returns
   */
  getGrantType(type: number) {
    // 发放方式 1:现金券,2:抵用金,3:SVIP体验券,4:实物,5:装备,6:Free Spin,7:后发现金券
    const types: { [key: number]: string } = {
      1: this.localeService.getValue('cash_coupons'),
      2: this.localeService.getValue('select_coupon'),
      3: 'SVIP' + this.localeService.getValue('svip_coup'),
      4: this.localeService.getValue('in_kind_coupons'),
      5: this.localeService.getValue('equipment_coupons'),
      6: this.localeService.getValue('free_spin_coupons'),
      7: this.localeService.getValue('after_cash_coupons'),
      8: this.localeService.getValue('none_sticky'),
    };
    return types[type];
  }

  /**
   * 获取红利 活动类型
   *
   * @param type
   * @param labels
   * @returns
   */
  getActivityType(type: string, labels: string[]): string[] | [] {
    // 已经和后端沟通 需要变成活动标签
    //1=bonus，2=vip
    if (type == '1') {
      return labels;
    } else {
      return [this.localeService.getValue('vip_bene00'), ...labels];
    }
  }
}
