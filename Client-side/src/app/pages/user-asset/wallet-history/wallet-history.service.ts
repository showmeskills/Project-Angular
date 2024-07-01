import { Injectable } from '@angular/core';
import { Subject } from '@microsoft/signalr';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/apis/game.api';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { WithdrawApi } from 'src/app/shared/apis/withdraw.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { ProviderCategoryInterface, ProviderInterface } from 'src/app/shared/interfaces/game.interface';
import { StatusListInterface, WagerStatusListInterface } from 'src/app/shared/interfaces/history.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class WalletHistoryService {
  constructor(
    private historyApi: HistoryApi,
    private appService: AppService,
    private withdrawApi: WithdrawApi,
    private gameApi: GameApi,
    private popupService: PopupService,
    private toast: ToastService,
    private localeService: LocaleService
  ) {}

  CURRENCY_ALL: CurrenciesInterface = {
    currency: '',
    name: this.localeService.getValue('all'),
    icon: '',
    symbol: '',
    minDeposit: 0,
    isDigital: false,
    isVisible: true,
    sort: 0,
  };

  /**自动带入币种  提款历史记录 */
  designatedWithdrawCurrencyHistory$: BehaviorSubject<any> = new BehaviorSubject({});

  /**自动带入币种  存款历史记录 */
  designatedDepositeCurrencyHistory$: BehaviorSubject<any> = new BehaviorSubject({});
  statusList$: BehaviorSubject<StatusListInterface[]> = new BehaviorSubject<StatusListInterface[]>([]);
  wagerStatusList?: WagerStatusListInterface[];
  providerList?: ProviderInterface[];
  providerCategory?: ProviderCategoryInterface[];

  getProviderInfo(): Observable<any> {
    return forkJoin([
      this.gameApi.getProviderList(), // 获取厂商列表
      this.gameApi.getProviderCategory(), // 游戏类型下拉
      this.historyApi.getWagerStatusList(), // 获取交易状态
    ]).pipe(
      map(v => ({
        providerList: v[0].data,
        providerCategory: v[1].data,
        wagerStatusList: v[2].data,
      })),
      tap(v => {
        this.providerList = v.providerList;
        this.providerCategory = v.providerCategory;
        this.wagerStatusList = v.wagerStatusList;
      })
    );
  }

  // 获取状态选项
  getStatusList(isDeposit: boolean, callback?: Function) {
    this.historyApi
      .getStatusList({ isDeposit })
      .pipe(map(v => v?.data || []))
      .subscribe(data => {
        this.statusList$.next(data);
        callback && callback();
      });
  }

  // 获取厂商列表
  getProviderList(callback?: Function) {
    this.gameApi
      .getProviderList()
      .pipe(map(v => v?.data || []))
      .subscribe(data => {
        this.providerList = data;
        callback && callback();
      });
  }

  // 游戏类型下拉
  getProviderCategory(callback?: Function) {
    this.gameApi
      .getProviderCategory()
      .pipe(map(v => v.data))
      .subscribe(data => {
        this.providerCategory = data;
        callback && callback();
      });
  }

  /**
   * 取消法币提现
   *
   * @param orderNum 订单号
   * @param callback 回调 注意需要 .bind(this)
   */
  cancelCurrency(
    orderNum: string,
    callback = (_: boolean) => {
      /* default empty */
    }
  ) {
    const popup = this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        autoCloseAfterCallback: false,
        type: 'warn',
        content: this.localeService.getValue('cancel_c_t'),
        description: this.localeService.getValue('cancel_c_d'),
        callback: (loading$: Subject<boolean>) => {
          //禁用弹窗的外部点击关闭
          popup.disableClose = true;
          //发送loading状态
          loading$.next(true);
          this.withdrawApi.cancelcurrency(orderNum).subscribe(res => {
            popup.close();
            if (res?.data) {
              //手动更新余额
              this.appService.assetChanges$.next({ related: 'Wallet' });
              this.toast.show({ message: this.localeService.getValue('cancel_c_s'), type: 'success' });
              callback(true);
            } else {
              this.toast.show({ message: this.localeService.getValue('cancel_c_f'), type: 'fail' });
              callback(false);
            }
          });
        },
      },
    });
  }
}
