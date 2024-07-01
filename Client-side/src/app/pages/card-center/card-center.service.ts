import { Injectable, WritableSignal, signal } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { BonusList } from 'src/app/shared/interfaces/bonus.interface';
import { cacheValue } from 'src/app/shared/service/general.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';

@Injectable({
  providedIn: 'root',
})
export class CardCenterService {
  constructor(
    private bonusApi: BonusApi,
    private popup: PopupService,
    private localeService: LocaleService,
    private appService: AppService,
  ) {}

  /** 订阅卡劵数量 */
  bounsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  /** 是否重新更新 数据 */
  _loadData: WritableSignal<boolean> = signal(false);

  /** 刷新非粘性 */
  _reloadNonSticky: WritableSignal<boolean> = signal(false);
  /** 缓存卡券的文案内容 */
  private cardContentBuffer: { [key: string]: Observable<{ content: string }> } = {};

  /** 是否是当前非粘性活动 注册kyc 并且检查是否符合 kyc*/
  nonStickyWithKyc: WritableSignal<{
    bonusActivitiesNo: string;
    countryCheck: boolean;
  } | null> = signal(null);

  /**
   * 查找 非粘性相关红利
   *
   * @param bonusList
   * @returns
   */
  onNoneStickyWithBonus(bonusList: Array<BonusList>): BonusList | null {
    if (this.nonStickyWithKyc() && this.nonStickyWithKyc()?.countryCheck) {
      return (
        bonusList?.find(bonus => {
          if (bonus?.bonusActivitiesNo === this.nonStickyWithKyc()?.bonusActivitiesNo) {
            return {
              ...bonus,
              isActive: true,
            };
          }
          return null;
        }) || null
      );
    }

    return null;
  }

  /** 获取卡劵数量 */
  getBonusCount() {
    this.bonusApi.getBonusCount().subscribe(data => {
      this.bounsCount$.next(data);
    });
  }

  /**
   *  获取非粘性卡券文案
   *
   * @param params
   * @param params.code
   * @param params.isDeposit
   * @param params.category
   * @param params.isFreeSpin
   * @returns
   */
  public getNoneStickyDetail(params: {
    code: string;
    isDeposit: boolean;
    category: string;
    isFreeSpin?: boolean;
  }): Observable<{ content: string }> {
    const bufferKey = window.btoa(JSON.stringify(params));
    return (
      this.cardContentBuffer[bufferKey] ??
      ((this.cardContentBuffer[bufferKey] = this.bonusApi.getNoneStickyDetail(params).pipe(
        cacheValue(1000 * 60 * 10), //缓存10分钟
        map(x => x && this.newObj(x)),
      )),
      this.cardContentBuffer[bufferKey])
    );
  }

  private newObj(v: unknown) {
    return JSON.parse(JSON.stringify(v));
  }

  /** 非粘性检查 kyc */
  onNonStickyCheckPopup() {
    this.popup.open(StandardPopupComponent, {
      data: {
        type: 'warn',
        content: this.localeService.getValue('nonsticky_hint'),
        description: this.localeService.getValue('nonsticky_hint_msg'),
        buttons: [
          { text: this.localeService.getValue('cancels'), primary: false },
          { text: this.localeService.getValue('online_cs'), primary: true },
        ],
        callback: () => {
          this.appService.toOnLineService$.next(true);
        },
      },
    });
  }

  onReset() {
    this.nonStickyWithKyc.set(null);
  }
}
