import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { first } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { UserAssetsService } from 'src/app/pages/user-asset/user-assets.service';
import {
  AllNetWorks,
  CryptoNetWorkItem,
  CurrenciesInterface,
  MainNetWork,
  NetworksInterface,
  TokenNetworksFlatInterface,
  TokenNetworksInterface,
} from '../interfaces/deposit.interface';
import { AllRateData } from '../interfaces/wallet.interface';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class TokenNetworksValidationService {
  constructor(private userAssetsService: UserAssetsService, private appService: AppService) {
    //订阅数字货币地址
    this.userAssetsService.withdrawTokenNetworks$.pipe(untilDestroyed(this)).subscribe(e => {
      if (e) {
        this.withdrawTokenNetworksChange(e);
      }
    });
    this.getNetWorks();
    this.getAllRateByUsd();
    this.getAllDigitalCurrencyInfor();
  }

  tokenNetworks: TokenNetworksInterface[] = [];
  allNetWorksInfor: AllNetWorks[] = [];
  allRate!: AllRateData;
  isDigitalCurrencyList: CurrenciesInterface[] = [];

  //获取以USD兑换汇率 :数字货币提款中弹出框需要显示兑换率
  async getAllRateByUsd() {
    this.userAssetsService.allRate.pipe(untilDestroyed(this)).subscribe(e => {
      this.allRate = e;
    });
  }

  //订阅数字货币地址
  withdrawTokenNetworksChange(e: any) {
    if (!e || Object.keys(e).length < 1) return;
    this.tokenNetworks = e;
  }

  //获取通用网络
  async getNetWorks() {
    this.allNetWorksInfor = await this.userAssetsService.getAllNetWorksInfor();
  }

  //
  getAllDigitalCurrencyInfor() {
    this.appService.currencies$.pipe(first(x => x.length > 0)).subscribe(x => {
      this.isDigitalCurrencyList = x.filter(y => y.isDigital);
    });
  }

  //地址是否匹配
  checkNetWorkValied(currency: string, token: string, inputValue: string) {
    const mactehItemList = this.tokenNetworks.find((x: any) => x.currency == currency)?.networks;
    const currentItem = mactehItemList?.find((x: any) => x.network == token)?.addressRegex;
    return TokenNetworksValidationService._vailed(inputValue, currentItem);
  }

  //判断条件可能是多个
  checkAdressVailedByCurrency(currency: string, inputValue: string) {
    const mactehItemList = this.tokenNetworks.find((x: any) => x.currency == currency)?.networks;
    const addressValiedList = mactehItemList?.map(({ addressRegex }) => {
      return TokenNetworksValidationService._vailed(inputValue, addressRegex);
    });
    return addressValiedList?.some(e => e);
  }

  //在所有币种里进行格式判断
  checkAdressVailed(inputValue: string) {
    let isValied: boolean = false;
    for (const item of this.tokenNetworks) {
      const { networks } = item;
      const netWorkValied = networks.map(({ addressRegex }: any) => {
        return TokenNetworksValidationService._vailed(inputValue, addressRegex);
      });
      const matchedList = netWorkValied?.some((e: any) => e);
      if (matchedList) {
        isValied = matchedList;
      }
    }
    return isValied;
  }

  //从所以币种判断条件中进行正则判断
  checkAllAdressVailed(inputValue: string) {
    const netWorkValied = this.allNetWorksInfor.map(({ network, addressRegex }: AllNetWorks) => {
      return TokenNetworksValidationService._vailed(inputValue, addressRegex);
    });
    return netWorkValied?.some(e => e);
  }

  //判断网络数据是否可用
  getValiedStatusList(inputValue: string, addressValied?: boolean) {
    if (addressValied && inputValue.length > 0) {
      const newList: MainNetWork[] = this.allNetWorksInfor.map((e: AllNetWorks) => {
        const isValied = TokenNetworksValidationService._vailed(inputValue, e.addressRegex);
        return {
          name: e.name,
          network: e.network,
          desc: e.desc,
          isActive: false,
          isValied,
        };
      });
      const sortList = [...newList].sort((a: any, b: any) => Number(b.isValied).minus(Number(a.isValied)));
      return sortList;
    } else {
      //未输入地址 && 地址格式错误
      const newList: MainNetWork[] = this.allNetWorksInfor.map((e: AllNetWorks) => {
        return {
          name: e.name,
          network: e.network,
          desc: e.desc,
          isActive: false,
          isValied: true,
        };
      });
      return newList;
    }
  }

  getCurrentNetWorkValiedStatusList(currentCurrency: string, token: string, inputValue: string) {
    const mactehItemList: any = this.tokenNetworks.find((x: any) => x.currency == currentCurrency)?.networks;
    const newList: MainNetWork[] = mactehItemList?.map((e: any) => {
      const isValied = this.checkNetWorkValied(currentCurrency, token, inputValue);
      return {
        name: currentCurrency,
        network: e.network,
        desc: e.desc,
        isActive: false,
        isValied,
      };
    });
    const sortList = [...newList].sort((a: any, b: any) => Number(b.isValied).minus(Number(a.isValied)));
    return sortList;
  }

  //数字货币提现选择网络 ：有币种和地址情况下
  getCryptoWithdrawNetWorkValiedList(currentCurrency: string, inputValue: string) {
    const matchRateItem = this.allRate?.rates?.find(x => x?.currency === currentCurrency);
    const mactehItemList = this.tokenNetworks?.find(x => x?.currency == currentCurrency) as TokenNetworksInterface;
    const newList: CryptoNetWorkItem[] = mactehItemList.networks?.map(e => {
      const isValied = TokenNetworksValidationService._vailed(inputValue, e?.addressRegex);
      const transferAmount = Number(e?.withdrawFee || 0).divide(Number(matchRateItem?.rate || 0));
      return {
        ...e,
        name: currentCurrency,
        network: e.network,
        desc: e.desc,
        isActive: false,
        isValied,
        transferAmount,
      };
    });
    return [...newList].sort((a: any, b: any) => b.isValied - a.isValied);
  }

  //数字货币提现选择网络 ：仅只有币种情况下，获取此币种所有网络
  getCryptoWithdrawNetWorkNuValiedList(currentCurrency: string) {
    const matchRateItem = this.allRate?.rates?.find(x => x?.currency === currentCurrency);
    const mactehItemList = this.tokenNetworks?.find(x => x?.currency == currentCurrency) as TokenNetworksInterface;
    const temp: CryptoNetWorkItem[] = [];
    mactehItemList?.networks?.forEach(e => {
      const transferAmount = Number(e?.withdrawFee || 0).subtract(Number(matchRateItem?.rate || 0));
      temp.push({
        ...e,
        name: currentCurrency,
        network: e.network,
        desc: e.desc,
        isActive: false,
        isValied: true,
        transferAmount,
      });
    });
    return temp;
  }

  //数字货币充值选择网络
  getCryptoDepositNetWorkNuValiedList(currentCurrency: string): TokenNetworksFlatInterface[] {
    const matched: TokenNetworksInterface = this.tokenNetworks.find(
      x => x.currency === currentCurrency
    ) as TokenNetworksInterface;
    const temp: TokenNetworksFlatInterface[] = [];
    matched?.networks.forEach((n: NetworksInterface) => {
      temp.push({
        ...matched,
        networkInfo: {
          ...n,
        },
      });
    });
    return temp;
  }

  //数字货币提款：寻找通用地址匹配币种信息
  getGeneralCurrency(inputValue: string, network: string) {
    const matchedList = this.allNetWorksInfor.filter(
      (e: AllNetWorks) => TokenNetworksValidationService._vailed(inputValue, e.addressRegex) && e.network == network
    );
    //获取数字货币信息，数据重组
    return matchedList.map((e: AllNetWorks) => {
      const x = this.isDigitalCurrencyList.filter((j: CurrenciesInterface) => j.name == e.name);
      return x[0];
    });
  }

  public static _vailed(value: any, reg: any): boolean {
    const x = RegExp(reg);
    return x.test(value);
  }
}
