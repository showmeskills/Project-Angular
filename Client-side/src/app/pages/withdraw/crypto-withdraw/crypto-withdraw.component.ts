import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, firstValueFrom } from 'rxjs';
import { filter, finalize, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { SelectNetworkDialogComponent } from 'src/app/pages/top-up/digital/select-network-dialog/select-network-dialog.component';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { WithdrawApi } from 'src/app/shared/apis/withdraw.api';
import { SelectCurrencyComponent } from 'src/app/shared/components/select-currency/select-currency.component';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { CurrenciesInterface, TokenNetworksFlatInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CointxHistoryInterface } from 'src/app/shared/interfaces/history.interface';
import { CurrencyBalance } from 'src/app/shared/interfaces/wallet.interface';
import { DataCollectionService } from 'src/app/shared/service/data-collection.service';
import { GeneralService } from 'src/app/shared/service/general.service';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { TokenNetworksValidationService } from 'src/app/shared/service/token-networks-validation';
import { KycService } from '../../kyc/kyc.service';
import { ClearBonusComponent } from '../../user-asset/clear-bonus/clear-bonus.component';
import { UserAssetsService } from '../../user-asset/user-assets.service';
import { WithdrawService } from '../withdraw.service';
import { SelectAddressDialogComponent } from './select-address-dialog/select-address-dialog.component';
import { SubmitDialogComponent } from './submit-dialog/submit-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-crypto-withdraw',
  templateUrl: './crypto-withdraw.component.html',
  styleUrls: ['./crypto-withdraw.component.scss'],
})
export class CryptoWithdrawComponent implements OnInit, OnDestroy {
  constructor(
    private kycService: KycService,
    private dialog: MatDialog,
    private popup: PopupService,
    private router: Router,
    private withdrawApi: WithdrawApi,
    private localStorageService: LocalStorageService,
    private historyApi: HistoryApi,
    private tokenNetworksValidationService: TokenNetworksValidationService,
    private userAssetsService: UserAssetsService,
    private appService: AppService,
    private layout: LayoutService,
    private localeSer: LocaleService,
    private route: ActivatedRoute,
    private generalService: GeneralService,
    public withdrawService: WithdrawService,
    private dataCollectionService: DataCollectionService,
    private kycDialogService: KycDialogService
  ) {}
  isGuide: boolean = true; //步骤UI
  isAbnormal: boolean = false; //账户异常
  selectedCurrency?: CurrenciesInterface; // 选择的币种
  selectedNetwork?: TokenNetworksFlatInterface; // 选择的网络
  coinLimitData: any; //用户资产限额数据 //availQuota 可用限额 withdrawQuota 提款限额 balance 余额 freezeAmount 锁定金额 todayQuota 单日限额 usedQuota 已使用额度
  selectedAddress: any = null; //地址簿中被选中地址
  selectedAddressInfo: any = null; //地址簿中被选中地址详情
  isOpen: boolean = false;
  selectedTabIndex: number = 0;
  address: string = '';
  amount: number = 0;
  showToops: boolean = false; //hoverUI

  loadingAddress!: boolean;
  // addressInfor: TokenAddress[] = [];
  cryptoWithdrawHistory: CointxHistoryInterface[] = []; //数字货币提款历史记录
  kycPrimary: any;
  realAmount: number = 0; //到账数量
  isLoading: boolean = false;
  isFirstViewPage: boolean = false; //是否第一次进入页面
  walletSub!: Subscription; //订阅钱包数据
  digitalCurrencyBalance: CurrencyBalance[] = []; //数字货币钱包信息
  filterCurrencyRates: any = []; //数字货币汇率信息
  cryptoCurrencyData: any = []; //数字货币重组数据（包括：汇率；币种全名；兑换成USD金额。。。）

  errText: string = '';
  isCanNext: boolean = false;

  isH5!: boolean;
  addressValid: any = {
    isValid: false,
    text: '',
    isValid1: false,
    isValid2: false,
  };

  amountValid: any = {
    isValid: false,
  };
  queryCurrency: string | null = null;
  defaultCurrency: string = 'BTC';

  userInfo: AccountInforData | null = null;
  disabledAddress: boolean = false;

  async ngOnInit() {
    this.appService.userInfo$
      .pipe(
        untilDestroyed(this),
        filter(v => !!v)
      )
      .subscribe(userInfo => {
        if (!this.onCheckKycLevel(userInfo?.kycGrade)) {
          this.disabledAddress = true;
          return;
        }
        this.checkWithdrawVaild();
        this.userInfo = userInfo;
      });

    this.dataCollectionService.addPoint({ eventId: 30012, actionValue1: 0 });
    this.queryCurrency = this.route.snapshot.queryParamMap.get('currency');

    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
    });

    this.isFirstViewPage = this.checkFirstView();

    this.getCryptoHistory();
    this.getCurrencies();
    this.getBalanceData();
  }

  /**
   * 检查kyc
   *
   * @param kycGrade
   * @returns
   */
  onCheckKycLevel(kycGrade: 'KycPrimary' | 'KycIntermediat' | 'KycAdvanced' | undefined) {
    if (!kycGrade && this.withdrawService.kycVerifyCryptoWidthdraw) {
      this.kycDialogService.showKycError(null, 1, false);
      return false;
    }

    return true;
  }

  ngOnDestroy(): void {
    this.withdrawService.onResetValue();
  }

  //是否第一次访问页面
  checkFirstView() {
    const checkValue = this.localStorageService.getValueByJsonParse('withdrawPage');
    if (checkValue == 'cryptoWithdraw') {
      return false;
    } else {
      this.localStorageService.setValueByJsonStringify('withdrawPage', 'cryptoWithdraw');
      return true;
    }
  }

  //检查是否可以提款
  checkWithdrawVaild() {
    this.withdrawService.allowWithdrawal().subscribe(data => {
      if (!data) {
        // 取消，=> 跳转钱包总览
        // 清零，=> 直接弹清零弹窗 => 成功后回调再次检查执行 checkWithdrawVaild
        this.popup
          .open(ClearBonusComponent, { speed: 'faster' })
          .beforeClosed()
          .subscribe(e => {
            if (e) {
              this.checkWithdrawVaild();
            } else {
              this.router.navigateByUrl(`/${this.appService.languageCode}/wallet/overview`);
            }
          });
      }
    });
  }

  //--------获取数字货币提现历史记录
  getCryptoHistory() {
    const param = {
      category: 'Withdraw',
      startTime: this.generalService.getStartEndDateArray('30days')[0],
      endTime: this.generalService.getStartEndDateArray('30days')[1],
      currency: '',
    };
    this.isLoading = true;
    this.historyApi
      .getCointxHistory(param)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(res => {
        if (res?.data) {
          if (res.data.list.length > 0) {
            const newData = res.data.list;
            this.cryptoWithdrawHistory = newData.slice(0, 3);
          }
        }
      });
  }

  getCurrencies() {
    this.appService.currencies$
      .pipe(
        map(v => v.filter(x => x.isDigital && x.isVisible)),
        untilDestroyed(this)
      )
      .subscribe(v => {
        if (v.length > 0) {
          //设置预设币种
          const matched = v.find((e: any) => e.currency == (this.queryCurrency || this.defaultCurrency));
          if (matched) this.closeDialogCallBack(matched);
        }
      });
  }

  /**
   * 切换tab
   * 关闭指引
   *
   * @param event
   */
  closeGuide(event: any) {
    this.isGuide = event;
  }

  /**
   * 切换tab
   *
   * @param index TabIndex
   */
  onChangeTab(index: number) {
    this.selectedTabIndex = index;
    this.selectedNetwork = undefined;
    this.selectedAddress = null;
    this.selectedAddressInfo = null;
    this.address = '';
    this.realAmount = 0;
    this.amount = 0;
    this.isCanNext = false;
    this.addressValid = {
      isValid: false,
      text: '',
      isValid1: false,
      isValid2: false,
    };
    //使用地址簿，加载地址列表 10/18 地址簿组件自己请求 暂注释
    // if (index === 1 && this.addressInfor.length < 1) {
    //   this.loadingAddress = true;
    //   this.withdrawService.loadAddressList().subscribe(res => {
    //     this.loadingAddress = false;
    //     if (res?.success) this.addressInfor = res.data;
    //   });
    // }
  }

  /**
   * 选择提款全部金额
   */
  handleSelectAll() {
    this.amount = Number(this.coinLimitData?.availQuota);
    if (this.selectedTabIndex == 1) {
      this.realAmount = Number(this.coinLimitData?.availQuota) - Number(this.selectedAddressInfo?.withdrawFee);
    } else {
      this.realAmount = Number(this.coinLimitData?.availQuota) - Number(this.selectedNetwork?.withdrawFee);
    }
    this.onAmountInput(this.amountValid);
  }

  /**
   * 地址输入
   *
   * @param element
   */
  onNetWorkInput(element: any) {
    //判断地址是否正确
    if (this.selectedCurrency && this.selectedCurrency.currency) {
      this.addressValid.isValid1 = this.tokenNetworksValidationService.checkAdressVailedByCurrency(
        this.selectedCurrency.currency,
        this.address
      );
    } else {
      this.addressValid.isValid1 = false;
    }

    if (this.selectedNetwork) {
      this.addressValid.isValid2 = this.tokenNetworksValidationService.checkNetWorkValied(
        this.selectedNetwork.name,
        this.selectedNetwork.network,
        this.address
      );
    } else {
      this.addressValid.isValid2 = false;
    }
    //判断显示文字
    if (this.address.length === 0 && (element.foc || element === '')) {
      this.addressValid.isValid = false;
      this.isCanNext = false;
      this.addressValid.text = this.localeSer.getValue('enter_wd_ad');
    } else if (!this.addressValid.isValid1) {
      this.addressValid.isValid = false;
      this.isCanNext = false;
      this.addressValid.text = this.localeSer.getValue('add_format_error');
    } else if (this.selectedNetwork && !this.addressValid.isValid2) {
      this.addressValid.isValid = false;
      this.isCanNext = false;
      this.addressValid.text = this.localeSer.getValue('check_ad');
    } else {
      this.addressValid.isValid = true;
      this.isCanNext = true;
    }
    this.amount = 0;
  }

  /**
   * 金额输入
   *
   * @param element
   */
  onAmountInput(element: any) {
    // console.log(this.selectedNetwork)
    if (Number(this.amount) <= 0) {
      element.isValid = false;
      this.errText = this.localeSer.getValue('less_than_single');
      this.realAmount = 0;
    } else {
      if (this.coinLimitData?.availQuota > 0) {
        if (this.selectedTabIndex == 1) {
          //地址薄选择

          this.realAmount = Number(this.amount).minus(Number(this.selectedAddressInfo?.withdrawFee));
        } else {
          //使用新地址
          this.realAmount = Number(this.amount).minus(Number(this.selectedNetwork?.withdrawFee));
        }
      } else {
        this.realAmount = 0;
      }

      if (Number(this.amount) < this.selectedNetwork?.minAmount) {
        this.errText = this.localeSer.getValue('less_than_single');
        element.isValid = false;
      } else if (Number(this.amount) > this.coinLimitData?.availQuota) {
        this.errText = this.localeSer.getValue('more_than_amount');
        element.isValid = false;
      } else if (Number(this.amount) > this.selectedNetwork?.maxAmount) {
        this.errText = this.localeSer.getValue('exceed_more');
        element.isValid = false;
      } else {
        element.isValid = true;
        this.errText = '';
      }
    }
    if (this.selectedTabIndex == 1) {
      this.isCanNext = element.isValid;
    } else {
      this.isCanNext =
        this.addressValid.isValid && this.addressValid.isValid1 && this.addressValid.isValid2 && element.isValid;
    }
  }

  //获取用户所有余额
  async getBalanceData() {
    const allUesrBalance = await this.userAssetsService.getUserbalance();
    this.digitalCurrencyBalance = allUesrBalance.filter((x: any) => x.isDigital);
    this.userAssetsService.allRate.pipe(untilDestroyed(this)).subscribe(e => {
      const allRates: any = e;
      if (!allRates.rates) return;
      this.filterCurrencyRates = allRates.rates.filter((e: any) =>
        this.digitalCurrencyBalance.find(i => i.currency == e.currency)
      );
      //数据重组
      this.cryptoCurrencyData = this.digitalCurrencyBalance.map((e: any) => {
        const rate = this.filterCurrencyRates.find((i: any) => i.currency == e.currency)?.rate ?? 0;
        const currencyFullName = this.appService.currencies$.value.find((j: any) => j.currency == e.currency)?.name;
        const exchangedAmount = e.balance * rate;
        return {
          ...e,
          rate,
          currencyFullName,
          exchangedAmount,
        };
      });
    });
  }

  /**
   *
   * 选择货币
   */
  handleSelectCurrency() {
    if (!this.onCheckKycLevel(this.userInfo?.kycGrade)) return;
    this.dialog
      .open(SelectCurrencyComponent, {
        panelClass: 'custom-dialog-container',
        data: {
          showBalance: true,
          isDigital: true,
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) this.closeDialogCallBack(result);
      });
  }

  /**
   *
   * 选择货币后
   *
   * @param data
   */
  closeDialogCallBack(data: CurrenciesInterface) {
    this.selectedCurrency = data;
    this.coinLimitData = null;
    this.getCoinLimit(data.currency);
    if (this.selectedTabIndex == 0) {
      //有地址情况下再次验证地址格式
      if (this.address) {
        this.addressValid.isValid1 = this.tokenNetworksValidationService.checkAdressVailedByCurrency(
          this.selectedCurrency.currency,
          this.address
        );
        this.onNetWorkInput(this.address);
      }
    }
    //每次选择币种，清空网络
    this.selectedNetwork = undefined;
    //清空有提币地址
    this.selectedAddress = null;
    //清空有输入金额
    this.amount = 0;
    this.isCanNext = false;
  }

  //获取当前币种限额等信息
  async getCoinLimit(currentCurrency: string) {
    const result = await firstValueFrom(this.withdrawApi.getCoinLimit(currentCurrency));
    if (result?.data) this.coinLimitData = result.data;
  }

  /**
   *
   * 选择网络
   */
  handleTransNetWork() {
    if (!this.onCheckKycLevel(this.userInfo?.kycGrade)) return;
    this.dialog.open(SelectNetworkDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        callback: this.closeNetworkDialogCallBack.bind(this),
        selectedCurrency: this.selectedCurrency,
        address: this.address,
        addressValied: this.addressValid.isValid1,
        isDeposit: false,
      },
    });
  }

  /**
   * 选择网络后
   *
   * @param data
   */
  closeNetworkDialogCallBack(data: TokenNetworksFlatInterface) {
    //对地址进行格式验证
    this.addressValid.isValid2 = this.tokenNetworksValidationService.checkNetWorkValied(
      data.name,
      data.network,
      this.address
    );
    this.selectedNetwork = data;

    this.isCanNext = false;
    this.amount = 0;

    // 更改网路后需要再检查一次地址格式
    this.onNetWorkInput(this.address);
  }

  /**
   * 提现
   */
  submit() {
    let data = {};
    if (this.selectedTabIndex === 1) {
      // 地址簿，不需要2fa
      console.log(this.selectedAddress);
      data = {
        icon: this.selectedCurrency,
        currency: this.selectedCurrency?.currency,
        address: this.selectedAddress?.address,
        addressId: this.selectedAddress?.id,
        network: this.selectedAddress?.network,
        amount: this.amount, //realAmount,
        fee: this.selectedAddressInfo?.withdrawFee,
      };
    } else {
      // 使用新地址,需要2fa验证
      //判断数字货币地址是否满足条件
      if (!this.address) {
        return;
      }
      data = {
        icon: this.selectedCurrency,
        currency: this.selectedCurrency?.currency,
        address: this.address,
        network: this.selectedNetwork?.network,
        amount: this.amount, //realAmount,
        fee: this.selectedNetwork?.withdrawFee,
      };
    }
    this.dialog.open(SubmitDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        callback: (response: any) => {
          this.withdrawService.closeSubmitCallBack(response);
        },
        submitData: data,
        submitWay: 'cryptoWithdraw',
        need2fa: this.selectedTabIndex === 0,
      },
      disableClose: true,
    });
  }

  /**
   *
   * 地址选择弹出框
   */
  handleSelectAddress() {
    if (!this.onCheckKycLevel(this.userInfo?.kycGrade)) return;
    console.log(this.selectedCurrency?.currency);
    this.dialog
      .open(SelectAddressDialogComponent, {
        panelClass: 'custom-dialog-container',
        data: {
          // addressInfor: this.addressInfor,
          currency: this.selectedCurrency?.currency,
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) this.closeSelectAddressCallBack(result);
      });
  }

  /**
   *
   * 获取被选中地址
   *
   * @param item
   */
  closeSelectAddressCallBack(item: any) {
    this.selectedAddress = item;
    this.selectedAddressInfo = item.networkInfo;

    this.selectedNetwork = item.networkInfo;

    this.isCanNext = false;
    this.amount = 0;
  }

  getLink(): string {
    return `/${this.appService.languageCode}/wallet/overview`;
  }

  openAddressPage(): string {
    return `/${this.appService.languageCode}/wallet/address`;
  }
}
