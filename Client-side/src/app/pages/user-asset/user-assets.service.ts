import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, firstValueFrom } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { DepositApi } from 'src/app/shared/apis/deposit.api';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import {
  AllNetWorks,
  TokenNetworksInterface,
  TokenNetworksParamInterface,
  TranserWalletBalanceParamInterface,
  TranserWalletListParamInterface,
} from 'src/app/shared/interfaces/deposit.interface';
import {
  AllRateData,
  CurrencyBalance,
  MainWalletData,
  Transerwalletbalance,
  TransferWalletListData,
  WalletViewData,
} from 'src/app/shared/interfaces/wallet.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@Injectable({
  providedIn: 'root',
})
export class UserAssetsService {
  constructor(
    private walletApi: WalletApi,
    private depositApi: DepositApi,
    private appService: AppService,
    private popupService: PopupService,
    private localeService: LocaleService,
    private toast: ToastService
  ) {}

  baseCurrency: string = 'USDT';
  allRate: BehaviorSubject<any> = new BehaviorSubject({}); //汇率数据                  //所有汇率
  orderStepSubject: BehaviorSubject<number> = new BehaviorSubject(1); //未使用
  withdrawTokenNetworks$: BehaviorSubject<any> = new BehaviorSubject<any | null>(null); //提款所用数字货币地址
  buyCurrencyType: string = 'USD'; //初始花费币种
  sellCurrencyType: string = 'BTC'; //初始买入币种

  //获取用户钱包总览
  async getWalletInfor(): Promise<WalletViewData | null> {
    const walletInfo: any = await this.walletApi.getUserWalletInfor();
    if (walletInfo?.data) return walletInfo.data;
    return null;
  }

  //获取用户钱包总览
  async getMainWallet(): Promise<MainWalletData | null> {
    const mianWallet: any = await this.walletApi.getUserMainWallet();
    if (mianWallet?.data) return mianWallet.data;
    return null;
  }

  //获取用户所有币种余额
  async getUserbalance(): Promise<CurrencyBalance[]> {
    const data = await firstValueFrom(this.walletApi.getUserbalance());
    return data || [];
  }

  /**
   * 获取所有汇率
   *
   * @param baseCurrency 汇率计算基准币种
   * @returns
   */
  async getAllRate() {
    const currencies = await firstValueFrom(this.appService.currencies$.pipe(first(x => x.length > 0)));
    const strCurrencies = currencies.map(x => x.currency).join(',');
    this.walletApi.getRate('USDT', strCurrencies).subscribe(data => {
      this.allRate.next(
        data || {
          baseCurrency: '',
          rates: [],
        }
      );
    });
  }

  getRatesBaseCurrency(data: AllRateData, baseCurrency?: string) {
    return {
      baseCurrency: baseCurrency ? baseCurrency : data.baseCurrency,
      rates: data.rates?.map((cur: any) => {
        const baseRate = (baseCurrency && data.rates?.find((t: any) => t.currency === baseCurrency)?.rate) || 1;
        return {
          ...cur,
          rate: cur.rate / baseRate,
        };
      }),
    };
  }

  //获取买币汇率
  async getExchangeRate() {
    const callBackResul: any = await this.walletApi.getExchangeRate(this.sellCurrencyType, this.buyCurrencyType);
    if (callBackResul?.data) return callBackResul.data;
  }

  //获取虚拟货币地址相关（withdraw）
  async getWithdrawTokenNetWorks(category: string): Promise<TokenNetworksInterface[]> {
    const param: TokenNetworksParamInterface = {
      category: category, //'Withdraw',
    };
    const res: any = await firstValueFrom(this.depositApi.getTokenNetworks(param).pipe(map(v => v?.data)));
    if (res) {
      this.withdrawTokenNetworks$.next(res);
      return res;
    }
    return [];
  }

  //获取虚拟货币网络
  async getAllNetWorksInfor(): Promise<AllNetWorks[]> {
    const callBackResul = await firstValueFrom(this.depositApi.getAllNetWorks());
    if (callBackResul?.data) {
      return callBackResul.data;
    }
    return [];
  }

  //获取钱包列表
  async getWalletList(): Promise<TransferWalletListData[]> {
    const res = await firstValueFrom(this.walletApi.getTransferWalletList());
    if (res?.data) return res.data;
    return [];
  }

  //获取转账钱包余额
  async getTranserWalletBalance(param: TranserWalletBalanceParamInterface): Promise<Transerwalletbalance | null> {
    const callback = await firstValueFrom(
      this.walletApi.getTransferWalletBalance(param.platformGroupCode, param.currency)
    );
    if (callback?.data) {
      return callback.data;
    }
    return null;
  }

  //获取转账钱包余额（订阅）
  getTransferWalletBalance(providerId: string, currency: string): Observable<Transerwalletbalance | null> {
    return this.walletApi.getTransferWalletBalance(providerId, currency).pipe(map(x => x?.data || null));
  }

  //钱包划转列表
  async getTransWalletList(param: TranserWalletListParamInterface) {
    const callback = await firstValueFrom(
      this.walletApi.getUserWalletInfoList(param.providerId, param.pageIndex, param.pageSize)
    );
    return callback.data;
  }

  //根据厂商id获取钱包信息
  async getGameWalletInfor(providerId: string) {
    const callback = await firstValueFrom(this.walletApi.getGameWalletInfor(providerId));
    if (callback?.data) {
      return callback.data;
    }
    return false;
  }

  /**
   * 清除负值资产
   *
   * @param currency 币种
   * @param callback 回调 注意需要 .bind(this)
   */
  clearNegativeAssets(
    currency: string,
    callback = (_: boolean) => {
      /* default empty */
    }
  ) {
    const popup = this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        autoCloseAfterCallback: false,
        type: 'warn',
        content: this.localeService.getValue('precautions02'),
        description: this.localeService.getValue('c_n_assets_t', currency),
        info: `<ul style="line-height: 2;padding: 0 10%;list-style: disc;">
          <li>${this.localeService.getValue('c_n_assets_n1')}</li>
          <li>${this.localeService.getValue('c_n_assets_n2')}</li>
          <li>${this.localeService.getValue('c_n_assets_n3')}</li>
        </ul>
        `,
        buttons: [{ text: this.localeService.getValue('apply_imm'), primary: true }],
        callback: (loading$: Subject<boolean>) => {
          //禁用弹窗的外部点击关闭
          popup.disableClose = true;
          //发送loading状态
          loading$.next(true);
          this.walletApi.postNegativeClear(currency).subscribe(res => {
            popup.close();
            if (res?.data) {
              this.toast.show({ message: this.localeService.getValue('app_s'), type: 'success' });
              callback(true);
            } else {
              this.toast.show({ message: res?.message || this.localeService.getValue('fail'), type: 'fail' });
              callback(false);
            }
          });
        },
      },
    });
  }
}
