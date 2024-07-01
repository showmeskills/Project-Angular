import { DestroyRef, Injectable, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, filter, mergeMap, of, take } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { BindMobilePopupComponent } from 'src/app/shared/components/bind-mobile-popup/bind-mobile-popup.component';
import { BonusList } from 'src/app/shared/interfaces/bonus.interface';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { CardCenterService } from '../../../../pages/card-center/card-center.service';
import { TopUpService } from '../../../../pages/top-up/top-up.service';
import { SelectDepositBonusService } from '../select-deposit-bonus.service';
import { SelectDividendDialogComponent } from '../select-dividend-dialog/select-dividend-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class PaymentIqService {
  constructor(
    private appService: AppService,
    private topUpService: TopUpService,
    private kycDialogService: KycDialogService,
    private dialog: MatDialog,
    private bonusApi: BonusApi,
    private router: Router,
    private destroyRef: DestroyRef,
    private cardCenterService: CardCenterService,
    private selectDepositBonusService: SelectDepositBonusService,
  ) {}

  seletedDividend: WritableSignal<BonusList | null> = signal(null);
  currentKycLevel: WritableSignal<number | null> = signal(null);
  /** 允许前往 充值页面 */
  allowRoute: WritableSignal<boolean> = signal(true);
  /** 检查kyc和红利 */
  checkedLoading: WritableSignal<boolean> = signal(false);
  /** 选择红利后回调 */
  selectedLoading: WritableSignal<boolean> = signal(false);
  /** 选择 存款币种 */
  selectDepositMethod: WritableSignal<'fiat' | 'crypto'> = signal('fiat');

  /** 防止其他 kyc 验证后弹红利 */
  skipBonusPopup: string[] = ['bankcard'];

  get limitPiqCurrencies(): string {
    return JSON.parse(this.appService.tenantConfig.config?.limitPiqCurrency || '[]');
  }

  /**
   * 当用户选择CNY VND THB，但是打开了PIQ 弹出弹窗并且重新选择货币
   *
   * @param currency 选择货币
   * @returns
   */
  onCurrencyCheck(currency: string): boolean {
    if (this.limitPiqCurrencies.includes(currency)) return false;
    return true;
  }

  /** 检查 kyc 和 红利 */
  checkKycForPaymentIq() {
    this.checkedLoading.set(true);
    this.appService.userInfo$
      .pipe(
        filter(v => !!v),
        take(1),
        takeUntilDestroyed(this.destroyRef),
        mergeMap(userInfo => {
          if (userInfo) {
            // 不为null时， 已做过初级
            if (userInfo?.kycGrade !== null) {
              return of(true);
            } else {
              this.allowRoute.set(false);
              this.kycDialogService.showKycError(null, 1);
            }
          }

          return of(null);
        }),
      )
      .subscribe(data => {
        if (data !== null) {
          this.onProcessPopup();
        }
        this.checkedLoading.set(false);
      });
  }

  /** 检查 kyc 和 红利 虚拟货币 */
  checkKycForCrypto() {
    // 后台商户配置未开启 手机验证
    if (!this.topUpService.phoneVerifyCryptoDeposit) {
      this.onProcessPopup();
      return;
    }

    this.checkedLoading.set(true);
    this.appService.userInfo$
      .pipe(
        filter(v => !!v),
        take(1),
        takeUntilDestroyed(this.destroyRef),
        mergeMap(userInfo => {
          if (userInfo) {
            // 通过手机验证
            if (userInfo.isBindMobile) {
              return of(true);
            } else {
              this.allowRoute.set(false);
              this.openBindMobilePopup(() => {
                this.autoOpen();
              });
            }
          }

          return of(null);
        }),
      )
      .subscribe(data => {
        if (data !== null) {
          this.onProcessPopup();
        }
        this.checkedLoading.set(false);
      });
  }

  onProcessPopup() {
    if (this.cardCenterService.nonStickyWithKyc() && this.cardCenterService.nonStickyWithKyc()?.countryCheck) {
      this.openPiqBonusOptions();
    } else {
      this.seletedDividend.set(null);
      this.openPiqBonusOptions();
    }
  }

  /**
   * 绑定手机号弹窗
   *
   * @param callback
   */
  openBindMobilePopup(callback?: () => void) {
    this.dialog.open(BindMobilePopupComponent, {
      panelClass: ['animate__fadeIn', 'animate__animated'],
      disableClose: true,
      data: {
        callback,
      },
    });
  }

  /** 欧洲验证 KYC 后自动 */
  autoOpen() {
    if (!this.selectDepositBonusService.switchEuBonusFlow) return;

    if (this.allowRoute() || this.skipBonusPopup.includes(this.router.url.split('/').pop() || '')) return;

    if (this.cardCenterService.nonStickyWithKyc()) {
      // 如何非粘性 有值
      if (this.cardCenterService.nonStickyWithKyc()?.countryCheck) {
        // 符合当前 kyc 谈红利
        this.openPiqBonusOptions();
      } else {
        // 不符合弹 客服
        this.cardCenterService.onNonStickyCheckPopup();
      }
    } else {
      // 其他 kyc 流程后弹出红利
      this.seletedDividend.set(null);
      this.openPiqBonusOptions();
    }
  }

  /**
   * 打开PIQ 红利弹窗
   *
   * @param payloads
   * @param payloads.amount
   * @param payloads.currency
   */
  openPiqBonusOptions(payloads?: { amount: number; currency: string }) {
    this.dialog.open(SelectDividendDialogComponent, {
      panelClass: 'dividend-dialog-container',
      disableClose: true,
      data: {
        callback: this.handlePiqCallback.bind(this),
        bonusList: [],
        seletedDividend: this.seletedDividend(),
        isShowTimes: true,
        isPiq: true,
        couponCodeParams: {
          amount: payloads?.amount || 0,
          currency: payloads?.currency || '',
        },
      },
    });
  }

  /**
   * 红利回调
   *
   * @param item
   */
  handlePiqCallback(item: BonusList | null) {
    this.seletedDividend.set(item);
    this.allowRoute.set(true);
    if (this.selectDepositMethod() === 'fiat') {
      this.router.navigateByUrl(`${this.appService.languageCode}/deposit/fiat`);
    } else if (this.selectDepositMethod() === 'crypto') {
      this.router.navigate([this.appService.languageCode, 'deposit', 'crypto'], {
        queryParams: {
          currency: this.appService.currentCurrency$.value?.currency,
        },
      });
    }
  }

  /**
   * 区分 法币 红利 还是 虚拟货币红利
   *
   * @param item
   * @returns
   */
  onCallActivity(item: BonusList | null): Observable<boolean> {
    if (this.selectDepositMethod() === 'fiat') {
      return this.bonusApi.onPiqActivityNo({
        activityNo: item?.bonusActivitiesNo || 'unknowtmpcode',
      });
    }
    return this.bonusApi.onCryptoActivityNo({
      activityNo: item?.bonusActivitiesNo || 'unknowtmpcode',
    });
  }
}
