import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, from } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ExchangeService } from 'src/app/pages/exchange/exchange.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { AllRateData, MainWalletData } from 'src/app/shared/interfaces/wallet.interface';
import { PaymentIqService } from '../../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { UserAssetsService } from '../user-assets.service';
import { WalletSortingDialogComponent } from '../wallet-sorting-dialog/wallet-sorting-dialog.component';
import { WalletTransferComponent } from '../wallet-transfer/wallet-transfer.component';
@UntilDestroy()
@Component({
  selector: 'app-main-wallet',
  templateUrl: './main-wallet.component.html',
  styleUrls: ['./main-wallet.component.scss'],
})
export class MainWalletComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private appService: AppService,
    public userAssetsService: UserAssetsService,
    public exchangeService: ExchangeService,
    private piqService: PaymentIqService,
  ) {}

  currentCurrencyData: any;
  mockAssetData: any = []; //所有资产 api模拟数据
  mockCurentType: string = 'BTC';
  btnGroup = [
    { name: 'deposit', isActive: true },
    { name: 'withdraw', isActive: false },
    { name: 'trans', isActive: false },
  ];

  searchedCurrency: string = ''; //绑定搜索
  currentCurrency: any = {}; //当前顶部钱包选中币种
  currentWalletCurrency: string = ''; //当前顶部钱包被选中币种
  allRate!: AllRateData; //所有汇率、
  mainWallet!: MainWalletData;
  mainCurrencies: any = []; //钱包数据

  totalAsset: number = 0;

  walletDataLoading = true;

  expandInfo: boolean = false; //H5：展开table

  ishideSmallAmount: boolean = false; //隐藏金额

  currencies: CurrenciesInterface[] = [];

  ngOnInit() {
    //订阅汇率变化
    this.userAssetsService.allRate.pipe(untilDestroyed(this)).subscribe(e => this.allRateChange(e));

    //顶部钱包当前币种
    this.appService.currentCurrency$.pipe(untilDestroyed(this)).subscribe(x => {
      if (!x) return;
      this.currentWalletCurrency = x.currency;
    });

    // 读取本地币种
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
      this.currencies = x;
    });

    //订阅余额刷新（含初始化）
    this.appService.userBalance$.pipe(untilDestroyed(this)).subscribe(x => x && this.getMainWalletData());
  }

  /** 更新主钱包数据订阅 */
  updateMainWallet$!: Subscription;

  /**更新主钱包数据 */
  getMainWalletData() {
    this.walletDataLoading = true;
    this.updateMainWallet$?.unsubscribe();
    this.updateMainWallet$ = from(this.userAssetsService.getMainWallet())
      .pipe(untilDestroyed(this))
      .subscribe(mainWalletData => {
        if (mainWalletData) {
          this.totalAsset = mainWalletData.totalAsset;
          this.mainWallet = mainWalletData;
          if (this.mainWallet.mainCurrencies.length > 0) {
            this.mainCurrencies = this.mainWallet.mainCurrencies.map(e => {
              return {
                ...e,
                isActive: false,
                showH5FrezzeNotice: false,
                openH5Options: false,
              };
            });
          }
          this.walletDataLoading = false;
        }
      });
  }

  //订阅汇率变化
  allRateChange(e: AllRateData) {
    if (!e || Object.keys(e).length < 1) return;
    this.allRate = e;
  }

  //当前顶部钱包币种汇率转换
  afterRate(v: number, currency: string) {
    if (!this.allRate) return 0;
    const rateItem = this.allRate?.rates?.find(x => x?.currency === currency);
    if (!rateItem) return 0;
    return v.divide(rateItem.rate);
  }

  handleTopUp(index: number) {
    switch (index) {
      case 0:
        this.piqService.allowRoute.set(false);
        this.router.navigate([this.appService.languageCode, 'deposit']);
        break;
      case 1:
        this.router.navigate([this.appService.languageCode, 'withdrawal']);
        break;
      case 2:
        this.dialog.open(WalletTransferComponent, {
          disableClose: true,
          autoFocus: false,
          panelClass: 'custom-dialog-container',
          data: {
            category: 'Main',
          },
        });
        break;
      default:
        break;
    }
  }

  sortingUp(type: string, sortRange: string) {
    switch (type) {
      case 'currency':
        this.sortingLetter('up');
        break;
      case 'number':
        this.sortingAmountUp(sortRange);
        break;
    }
  }

  sortingDown(type: string, sortRange: string) {
    switch (type) {
      case 'currency':
        this.sortingLetter('down');
        break;
      case 'number':
        this.sortingAmountDown(sortRange);
        break;
    }
  }

  //根据金额(大--->小)排序
  sortingAmountUp(sortRange: string) {
    if (sortRange == 'totalAmount') {
      this.mainCurrencies = [...this.mainWallet.mainCurrencies].sort((a, b) =>
        Number(this.exchangeUSDT(b.total, b.currency)).minus(Number(this.exchangeUSDT(a.total, a.currency))),
      );
    } else if (sortRange == 'freezeAmount') {
      this.mainCurrencies = [...this.mainWallet.mainCurrencies].sort((a, b) =>
        Number(this.exchangeUSDT(b.freezeAmount, b.currency)).minus(
          Number(this.exchangeUSDT(a.freezeAmount, a.currency)),
        ),
      );
    } else if (sortRange == 'canUseAmount') {
      this.mainCurrencies = [...this.mainWallet.mainCurrencies].sort((a, b) =>
        Number(this.exchangeUSDT(b.canUseAmount, b.currency)).minus(
          Number(this.exchangeUSDT(a.canUseAmount, a.currency)),
        ),
      );
    }
  }
  //根据金额(小--->大)排序
  sortingAmountDown(sortRange: string) {
    if (sortRange == 'totalAmount') {
      this.mainCurrencies = [...this.mainWallet.mainCurrencies].sort((a, b) =>
        Number(this.exchangeUSDT(a.total, a.currency)).minus(Number(this.exchangeUSDT(b.total, b.currency))),
      );
    } else if (sortRange == 'freezeAmount') {
      this.mainCurrencies = [...this.mainWallet.mainCurrencies].sort((a, b) =>
        Number(this.exchangeUSDT(a.freezeAmount, a.currency)).minus(
          Number(this.exchangeUSDT(b.freezeAmount, b.currency)),
        ),
      );
    } else if (sortRange == 'canUseAmount') {
      this.mainCurrencies = [...this.mainWallet.mainCurrencies].sort((a, b) =>
        Number(this.exchangeUSDT(a.canUseAmount, a.currency)).minus(
          Number(this.exchangeUSDT(b.canUseAmount, b.currency)),
        ),
      );
    }
  }

  //根据字母排序
  sortingLetter(way: string) {
    if (way == 'up') {
      this.mainCurrencies = [...this.mainWallet.mainCurrencies].sort((a: any, b: any) =>
        a.currency.localeCompare(b.currency),
      );
    } else {
      this.mainCurrencies = [...this.mainWallet.mainCurrencies].sort((a: any, b: any) =>
        b.currency.localeCompare(a.currency),
      );
    }
  }

  hideMinAmountFactor = (item: any) => {
    return this.exchangeUSDT(item.total, item.currency) >= 10;
  };

  exchangeUSDT(value: number, currency: string) {
    return value.subtract(this.allRate?.rates?.find(x => x?.currency === currency)?.rate ?? 0);
  }

  //点击展开（钱包交易）
  openOptions(event: any) {
    event.openH5Options = !event.openH5Options;
    event.active = true;
  }

  //H5下  排序弹出框
  openSorting() {
    this.dialog.open(WalletSortingDialogComponent, {
      panelClass: 'custom-dialog-container',
      data: {
        ishideSmallAmount: this.ishideSmallAmount,
        callback: this.callBackSorting.bind(this),
        hideMinAmount: (hide: boolean) => {
          this.ishideSmallAmount = hide;
        },
      },
    });
  }

  callBackSorting(data: any) {
    const { up, down, type, sortRange } = data;
    if (up) {
      this.sortingUp(type, sortRange);
    } else if (down) {
      this.sortingDown(type, sortRange);
    }
  }

  //充值
  handleToUp({ currency }: any) {
    //判断充值币种类型
    const isDigital = this.isDigital(currency);
    this.router.navigate([this.appService.languageCode, 'deposit', isDigital ? 'crypto' : 'fiat'], {
      queryParams: {
        currency,
      },
    });
  }
  //提现
  handleWithdraw({ currency }: any) {
    //判断充值币种类型
    const isDigital = this.isDigital(currency);
    this.router.navigate([this.appService.languageCode, 'withdrawal', isDigital ? 'crypto' : 'fiat'], {
      queryParams: {
        currency,
      },
    });
  }
  //购买
  handleBuy({ currency }: any) {
    this.router.navigate([this.appService.languageCode, 'exChange', 'purchase'], {
      queryParams: {
        currency,
      },
    });
  }

  //兑现
  handleExchange(item: any) {}

  isDigital(currency: string) {
    return this.currencies.find((e: any) => e.currency === currency)?.isDigital;
  }

  isCanBuyCurrency(currency: string) {
    return this.exchangeService.canBuyCurrency.includes(currency);
  }
}
