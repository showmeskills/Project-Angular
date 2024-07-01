import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseData, ResponseListData } from '../interfaces/response.interface';
import {
  AllRateData,
  CheckPaymentAvailResult,
  ClearWithdrawallimitCurrency,
  CommissionParam,
  Commissionhistory,
  CurrencyBalance,
  GameWalletInforCallBackData,
  ReturnTypeSelect,
  Transerwalletbalance,
  TransferDataList,
  TransferWalletListData,
} from '../interfaces/wallet.interface';
import { BaseApi } from './base.api';

@Injectable({
  providedIn: 'root',
})
export class WalletApi extends BaseApi {
  /**
   * 获取用户钱包总览  /v1/asset/wallet/overview
   *
   * @returns
   */
  getUserWalletInfor() {
    const url = `${environment.apiUrl}/v1/asset/wallet/overview`;
    return firstValueFrom(this.get(url));
  }

  /**
   * 获取主钱包 /v1/asset/wallet/mainwallet
   *
   * @returns
   */
  getUserMainWallet() {
    const url = `${environment.apiUrl}/v1/asset/wallet/mainwallet`;
    return firstValueFrom(this.get(url));
  }

  /**
   *  获取用户所有币种余额 /v1/asset/wallet/userbalance
   *
   * @returns
   */
  getUserbalance(): Observable<CurrencyBalance[] | null> {
    const url = `${environment.apiUrl}/v1/asset/wallet/userbalance`;
    return this.get<ResponseData<CurrencyBalance[]>>(url).pipe(
      map(res => {
        if (res?.data) {
          const nsSlotGame = res.data?.find(item => item?.walletCategory === 'NSSlotGame');
          const nsLiveCasino = res.data?.find(item => item?.walletCategory === 'NSLiveCasino');

          return res.data
            ?.map(item => ({
              ...item,
              isShowNonSticky:
                item?.currency === nsSlotGame?.currency || item?.currency === nsLiveCasino?.currency ? true : false,
              nsSlotGame:
                item?.currency === nsSlotGame?.currency
                  ? {
                      isDigital: nsSlotGame?.isDigital || false,
                      currency: nsSlotGame?.currency || '',
                      balance: nsSlotGame?.balance || 0,
                    }
                  : null,
              nsLiveCasino:
                item?.currency === nsLiveCasino?.currency
                  ? {
                      isDigital: nsLiveCasino?.isDigital || false,
                      currency: nsLiveCasino?.currency || '',
                      balance: nsLiveCasino?.balance || 0,
                    }
                  : null,
            }))
            ?.map(item => ({
              ...item,
              // 钱包余额+非粘性余额
              nonStickyBalance: item.isShowNonSticky
                ? Number(item?.balance || 0)
                    .add(item?.currency === nsSlotGame?.currency ? Number(nsSlotGame?.balance || 0) : 0)
                    .add(item?.currency === nsLiveCasino?.currency ? Number(nsLiveCasino?.balance || 0) : 0)
                : item.balance,
            }))
            ?.filter(item => item?.walletCategory === 'Main')
            ?.sort((a, b) => a.sort - b.sort);
        } else {
          return null;
        }
      })
    );
  }

  /**
   *  获取汇率 /v1/asset/refdata/getrate
   *
   * @param baseCurrency --汇率计算基准币种
   * @param exchangeCurrencies --查询汇率的币种（大写字母），多个币种以逗号分隔
   * @returns
   */
  getRate(
    baseCurrency: string,
    exchangeCurrencies: string = 'CNY,USD,THB,VND,AUD,JPY,EUR,GBP,NZD,CAD,BTC,ETH,USDT,TRX,USDC'
  ): Observable<AllRateData> {
    const url = `${environment.apiUrl}/v1/asset/refdata/getrate?baseCurrency=${baseCurrency}&exchangeCurrencies=${exchangeCurrencies}`;
    return this.get<ResponseData<AllRateData>>(url).pipe(map(x => x?.data || null));
  }

  /**
   *  验证用户是否可以使用支付方式（调整改为正式数据) /v1/asset/wallet/checkpaymentavail
   *
   * @param code         -- 支付方式
   * @param currencyType -- 充值货种
   * @param category     -- Deposit / Withdraw
   * @returns
   */
  getPaymentAvail(
    code: string,
    currencyType: string,
    category: string
  ): Promise<ResponseData<CheckPaymentAvailResult>> {
    const url = `${environment.apiUrl}/v1/asset/wallet/checkpaymentavail?code=${code}&currencyType=${currencyType}&category=${category}`;
    return firstValueFrom(this.get(url));
  }

  /**
   *  获取买币汇率 /v1/asset/refdata/getexchangerate
   *
   * @param sellCurrency -- 卖出
   * @param buyCurrency -- 买入
   * @returns
   */
  getExchangeRate(sellCurrency: string, buyCurrency: string) {
    const url = `${environment.apiUrl}/v1/asset/refdata/getrate?sellCurrency=${sellCurrency}&buyCurrency=${buyCurrency}`;
    return firstValueFrom(this.get(url));
  }

  /**
   *  划转
   *
   * @param fromWalletCategory
   * @param toWalletCategory
   * @param currency
   * @param providerId
   * @param amount
   * @returns
   */
  postTransferWallet(
    fromWalletCategory: string,
    toWalletCategory: string,
    currency: string,
    providerId: string,
    amount: number
  ): Observable<any> {
    const url = `${environment.apiUrl}/v1/asset/wallet/transferwallet`;
    return this.post(url, {
      fromWalletCategory: fromWalletCategory,
      toWalletCategory: toWalletCategory,
      currency: currency,
      providerId: providerId,
      amount: amount,
    }).pipe(
      tap(res => {
        switch (res?.code) {
          case '2096':
            this.appService.showForbidTip('play');
            break;
          case '2100':
            this.appService.showForbidTip('income', res.message, this.localeService.getValue('transfer_close_t'));
            break;
          default:
            break;
        }
      })
    );
  }

  /**
   *  划转列表
   *
   * @returns
   */
  getTransferWalletList(): Observable<ResponseData<TransferWalletListData[]>> {
    const url = `${environment.apiUrl}/v1/asset/wallet/gettransferwallet`;
    return this.get(url);
  }

  /**
   *  转账钱包余额
   *
   * @param platformGroupCode
   * @param currency
   * @returns
   */
  getTransferWalletBalance(
    platformGroupCode: string,
    currency: string
  ): Observable<ResponseData<Transerwalletbalance>> {
    const url = `${environment.apiUrl}/v1/asset/wallet/transerwalletbalance?platformGroupCode=${platformGroupCode}&currency=${currency}`;
    return this.get(url);
  }

  /**
   *  钱包划转列表
   *
   * @param providerId
   * @param pageIndex
   * @param pageSize
   * @returns
   */
  getUserWalletInfoList(
    providerId: string,
    pageIndex: number,
    pageSize: number
  ): Observable<ResponseListData<TransferDataList[]>> {
    const url = `${environment.apiUrl}/v1/asset/wallet/gamewallethistory?providerId=${providerId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
    return this.get(url);
  }

  /**
   *  根据厂商id获取钱包信息
   *
   * @param providerId
   * @returns
   */
  getGameWalletInfor(providerId: string): Observable<ResponseListData<GameWalletInforCallBackData>> {
    const url = `${environment.apiUrl}/v1/asset/wallet/getgamewallet?providerId=${providerId}`;
    return this.get(url);
  }

  /**钱包历史记录 -> 查询佣金历史 */
  getCommissionHistory(params: CommissionParam): Observable<ResponseListData<Commissionhistory[]>> {
    return this.get<ResponseListData<Commissionhistory[]>>(
      `${environment.apiUrl}/v1/asset/wallet/getcommissionhistory`,
      params
    );
  }

  /**佣金类型下拉 */
  getReturnTypeSelect(): Observable<ResponseData<ReturnTypeSelect[]>> {
    return this.get<ResponseData<ReturnTypeSelect[]>>(`${environment.apiUrl}/v1/asset/wallet/getreturntypeselect`);
  }

  /**
   * 负值清零申请
   *
   * @param currency 币种
   * @returns
   */
  postNegativeClear(currency: string): Observable<ResponseData<boolean>> {
    return this.post<ResponseData<boolean>>(`${environment.apiUrl}/v1/member/negativeclear/apply`, { currency });
  }

  /**
   * 是否允许 提款
   *
   * @returns boolean
   */
  allowWithdrawal(): Observable<boolean> {
    return this.get<boolean>(`${environment.apiUrl}/v1/asset/wallet/allowwithdrawal`).pipe(
      map((x: any) => x?.data || false)
    );
  }

  /**
   * 获取可以进行 清除提款限额 的币种
   *
   * @param params
   * @returns
   */
  getClearWithdrawallimitCurrency(): Observable<ClearWithdrawallimitCurrency[]> {
    return this.get(`${environment.apiUrl}/v1/asset/wallet/getclearwithdrawallimitcurrency`).pipe(
      map((x: any) => x?.data || [])
    );
  }

  /**
   * 清除 提款限额
   *
   * @returns boolean
   */
  clearWithdrawallimit(): Observable<boolean> {
    return this.post<boolean>(`${environment.apiUrl}/v1/asset/wallet/clearwithdrawallimit`).pipe(
      map((x: any) => x?.data || false)
    );
  }

  /**
   * 清除低佣券
   *
   * @returns
   */
  clearCredit(): Observable<ResponseData<boolean>> {
    return this.post(`${environment.apiUrl}/v1/asset/wallet/clearcredit`);
  }
}
