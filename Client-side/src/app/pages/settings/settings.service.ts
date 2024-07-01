import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SettingsApi } from 'src/app/shared/apis/settings.api';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { ISetDefaultCurrency } from 'src/app/shared/interfaces/settings.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { PaymentIqService } from '../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(
    private settingsApi: SettingsApi,
    private toast: ToastService,
    private localeService: LocaleService,
    private appService: AppService,
    private piqService: PaymentIqService,
  ) {
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(currencies => {
      this.currencies = currencies;
    });
  }

  /** 所有货币啊 */
  currencies!: CurrenciesInterface[];

  /**  设置默认货币订阅 */
  setDefaultCurrencyLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** 是否开启低佣金 */
  enableCredit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** 隐身模式 */
  invisibleMode$: BehaviorSubject<'ShowUserName' | 'ShowUid' | 'Invisibility' | ''> = new BehaviorSubject<
    'ShowUserName' | 'ShowUid' | 'Invisibility' | ''
  >('');

  /**
   * 设置用户默认币种
   *
   * @param params 默认货币api 参数
   * @param currency 当前选择的默认货币
   */
  setUserDefaultCurrency(params: ISetDefaultCurrency, currency: string): void {
    this.setDefaultCurrencyLoading$.next(true);
    this.piqService.checkedLoading.set(true);
    this.settingsApi.setUserDefaultCurrency(params).subscribe(data => {
      this.setDefaultCurrencyLoading$.next(false);
      this.piqService.checkedLoading.set(false);
      if (data) {
        this.toast.show({ message: this.localeService.getValue('set_s'), type: 'success' });
        this.setAppServiceCurrentCurrency(currency);
      } else {
        this.toast.show({ message: this.localeService.getValue('set_f'), type: 'fail' });
      }
    });
  }

  /**
   * 设置 全局货币与默认货币关联起来
   *
   * @param defaultCurrency 设置默认货币
   */
  setAppServiceCurrentCurrency(defaultCurrency: string) {
    if (!defaultCurrency) return;
    const currency = this.currencies.filter(currency => currency.currency === defaultCurrency)[0];
    if (currency) this.appService.currentCurrency$.next(currency);
    //console.log("订阅默认货币了", currency)
  }
}
