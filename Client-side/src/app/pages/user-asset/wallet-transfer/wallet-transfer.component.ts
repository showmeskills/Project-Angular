import { Location } from '@angular/common';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import { SelectCurrencyComponent } from 'src/app/shared/components/select-currency/select-currency.component';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { AllRateData, TransferWalletListData } from 'src/app/shared/interfaces/wallet.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { PaymentIqService } from '../../../shared/components/select-deposit-bonus/payment-iq/payment-iq.service';
import { UserAssetsService } from '../user-assets.service';
import { ResultDialogComponent } from './result-dialog/result-dialog.component';

interface AvailableCurrencies {
  name?: string;
  exchangedAmount?: number;
  balance: number;
  currency: string;
}

@Component({
  selector: 'app-wallet-transfer',
  templateUrl: './wallet-transfer.component.html',
  styleUrls: ['./wallet-transfer.component.scss'],
})
export class WalletTransferComponent implements OnInit {
  constructor(
    public location: Location,
    private dialog: MatDialog,
    private walletApi: WalletApi,
    private userAssetsService: UserAssetsService,
    private router: Router,
    private appService: AppService,
    private dialogRef: MatDialogRef<WalletTransferComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { category: string } | undefined,
    private toastService: ToastService,
    private localeService: LocaleService,
    private piqService: PaymentIqService,
  ) {}

  /**初始化加载中 */
  loading!: boolean;
  /**提交请求中 */
  submitLoading!: boolean;
  /**币种信息准备中 */
  currencyLoading!: boolean;
  /**没有钱、提示充值（目前仅用于noMainWallet的时候） */
  moneyLess!: boolean;
  /**是否没有主钱包（即没有存款记录、未激活） */
  noMainWallet!: boolean;
  /**平台所有汇率 */
  allRates!: AllRateData;
  /**平台所有币种 */
  allCurrencies: CurrenciesInterface[] = [];
  /**金额输入错误提示文字 */
  errorAmountTip: string = '';

  /**用户所有有效钱包列表 */
  walletList: TransferWalletListData[] = [];
  /**默认主账户（仅用于填充界面显示） */
  defaultMainWallet: TransferWalletListData = {
    category: 'Main',
    providerCategorys: [],
    currencies: [],
    isFirst: false,
    outMinAmount: 0,
    providerId: '',
    walletName: this.localeService.getValue('main_w_acc'),
  };

  /**可用于选择的币种 */
  availableCurrencies: AvailableCurrencies[] = [];

  /**选择的转出钱包category */
  selectedFromValue: string = 'Main';
  /**选择的转入钱包category */
  selectedToValue: string = '';
  /**选择的币种代码 */
  selectedCurrencyValue: string = '';
  /**金额值 */
  inputAmountValue: string = '';

  /**转出钱包 */
  get fromWallet(): TransferWalletListData | undefined {
    return this.walletList.find(x => x.category === this.selectedFromValue);
  }

  /**转入钱包 */
  get toWallet(): TransferWalletListData | undefined {
    return this.walletList.find(x => x.category === this.selectedToValue);
  }

  /**主账户钱包 */
  get mainWallet(): TransferWalletListData | undefined {
    return this.walletList.find(x => x.category === 'Main');
  }

  /**所有游戏钱包 */
  get gameWallets(): TransferWalletListData[] {
    return this.walletList.filter(x => x.category !== 'Main');
  }

  /**当前游戏钱包 */
  get gameWallet(): TransferWalletListData | undefined {
    return [this.fromWallet, this.toWallet].find(x => x?.category !== 'Main');
  }

  /**是否能提交 */
  get canSubmit() {
    if (
      Number(this.inputAmountValue) <= 0 ||
      Number(this.inputAmountValue) > this.maxAmount ||
      Number(this.inputAmountValue) < this.minAmount
    )
      return false;
    return (
      !this.loading &&
      !this.currencyLoading &&
      this.inputAmountValue &&
      this.selectedFromValue &&
      this.selectedToValue &&
      this.selectedCurrencyValue &&
      !this.errorAmountTip
    );
  }

  /**是否阻止操作 */
  get blockControl() {
    return this.loading || this.submitLoading || this.currencyLoading;
  }

  /**当前最大可使用金额 */
  get maxAmount() {
    return this.availableCurrencies.find(x => x.currency === this.selectedCurrencyValue)?.balance || 0;
  }

  /**当前最小可使用金额 */
  get minAmount() {
    return 10; //需求写死恒定最小10
    // const outMin = this.fromWallet?.outMinAmount || 0;
    // const inMin = this.toWallet?.currencies.find(x => x.currency === this.selectedCurrencyValue)?.minAmount || 0;
    // return outMin > inMin ? outMin : inMin;
  }

  /** 获取越南盾 需要限制prodiverId */
  get vndProviderIds(): string[] {
    return JSON.parse(this.appService.tenantConfig?.config.vndProviderIds || '[]');
  }

  ngOnInit(): void {
    this.checkCategoryVailed(this.data?.category || 'Main');
  }

  /**
   * 初始化 目前默认主钱包转出，外部只能自定义转入的钱包
   *
   * @param category 转入什么钱包，如果是'Main',则转入钱包自动默认一个
   * @returns
   */
  async checkCategoryVailed(category: string) {
    this.loading = true;
    this.walletList = await this.userAssetsService.getWalletList();

    //没有任何有效的钱包 或 只有主钱包 或 接口报错，中断返回
    if (this.gameWallets.length === 0) return;

    //默认 from 始终为主钱包
    this.selectedFromValue = 'Main';

    if (category === 'Main') {
      // 没明确指定，to自动使用第一个
      this.selectedToValue = this.gameWallets[0].category;
    } else {
      // 指定了某个游戏，设置to为指定值
      this.selectedToValue = category;
      // 检查设置的to游戏如果不存在，重新设置to为数组第一个
      if (!this.toWallet) this.selectedToValue = this.gameWallets[0].category;
    }

    //没有主钱包、代表没钱，没有存款记录，中断返回
    //手动压入主钱包(仅用于显示)，并提示充值，隐藏币种、金额输入框...
    if (!this.mainWallet) {
      this.moneyLess = true;
      this.noMainWallet = true;
      this.walletList.push(this.defaultMainWallet);
      this.loading = false;
      return;
    }
    this.loading = false;

    //检查、设置默认币种和数据
    this.checkAndBuildCurrencyData();
  }

  /**检查和创建币种数据 */
  async checkAndBuildCurrencyData() {
    // 主账户没激活，中断返回
    if (this.noMainWallet) return;
    this.currencyLoading = true;

    // 获取平台所有的币种
    this.allCurrencies = await firstValueFrom(this.appService.currencies$.pipe(first(x => x.length > 0)));
    // 获取平台最新汇率
    this.allRates = this.userAssetsService.allRate.value;

    // 查找当前选择的游戏钱包 和平台所有币种 重合的部分
    const currencies: AvailableCurrencies[] = [];
    const supportCurrencys = this.gameWallet!.currencies.map(y => y.currency);
    this.allCurrencies.forEach(x => {
      if (supportCurrencys.includes(x.currency)) {
        //主钱包转出 => 使用主钱包余额 , 未划转过的游戏钱包转出 => 0
        const balance =
          this.selectedFromValue !== 'Main' && this.fromWallet!.isFirst
            ? 0
            : this.mainWallet?.currencies.find(y => y.currency === x.currency)?.balance || 0;
        const rate = this.allRates.rates.find(r => r.currency === x.currency)?.rate || 0; //防止报错如果找不到就按汇率0处理
        const item: AvailableCurrencies = {
          balance: balance,
          exchangedAmount: Number(balance).subtract(rate),
          currency: x.currency,
          name: x.name,
        };
        currencies.push(item);
      }
    });

    // 没有找到相同币种（平台没有找到游戏方的币种），无法继续，中断返回
    if (currencies.length === 0) return;

    //从划转过的游戏钱包转出
    if (this.selectedFromValue !== 'Main' && !this.fromWallet!.isFirst) {
      //已划转过，获取可用币种的最新余额
      const getList = currencies.map(x => {
        return this.userAssetsService.getTransferWalletBalance(this.fromWallet!.providerId, x.currency);
      });
      //集中请求余额
      forkJoin(getList).subscribe(resArr => {
        currencies.forEach((x, i) => {
          const balance = resArr[i]?.availBalanceForWithdraw || 0;
          const rate = this.allRates.rates.find(r => r.currency === x.currency)?.rate || 0; //防止报错如果找不到就按汇率0处理
          x.balance = balance;
          x.exchangedAmount = Number(balance).subtract(rate);
        });
        this.availableCurrencies = currencies;
        this.setDefaultCurrency();
        this.currencyLoading = false;
      });
    } else {
      this.availableCurrencies = currencies;
      this.setDefaultCurrency();
      this.currencyLoading = false;
    }
  }

  /**提交划转请求 */
  @HostListener('document:keydown.enter')
  submit() {
    if (!this.canSubmit) return;
    this.submitLoading = true;
    this.walletApi
      .postTransferWallet(
        this.selectedFromValue,
        this.selectedToValue,
        this.selectedCurrencyValue,
        this.gameWallet!.providerId,
        Number(this.inputAmountValue),
      )
      .subscribe(res => {
        if (res?.data) {
          if (res.data.result?.resultCode === '0000000') {
            this.dialog.open(ResultDialogComponent, {
              panelClass: 'custom-dialog-container',
              disableClose: false,
              data: {
                status: 'success',
                fromWallet: this.fromWallet?.walletName,
                toWallet: this.toWallet?.walletName,
                date: res.data.timeStamp || 0,
                orderId: res.data.data?.transactionId || '',
                amount: this.inputAmountValue,
                curreny: this.selectedCurrencyValue,
              },
            });
            this.close(true);
          } else {
            const message = res.code === '2093' ? res.message : this.localeService.getValue('tran_wallet_f');
            this.toastService.show({ message: message, type: 'fail', title: '' });
          }
        } else {
          // data 为null 时 肯定为 失败
          // 划转失败
          this.toastService.show({
            message: this.localeService.getValue('tran_wallet_f'),
            type: 'fail',
            title: '',
          });
        }
        this.submitLoading = false;
      });
  }

  /**设置默认币种 */
  setDefaultCurrency() {
    //设置默认选择的币种
    //如果支持USDT且USDT有钱，自动使用USDT | 使用第一个有钱的币种 | 使用列表第一个
    if (this.availableCurrencies.find(x => x.currency === 'USDT' && x.balance > 0)) {
      this.selectedCurrencyValue = 'USDT';
    } else {
      const hasMoney = this.availableCurrencies.find(x => x.balance > 0);
      if (hasMoney) {
        this.selectedCurrencyValue = hasMoney.currency;
      } else {
        this.selectedCurrencyValue = this.availableCurrencies[0].currency;
      }
    }
    this.amountValueChange(this.inputAmountValue);
  }

  /**转出 钱包选择变更，根据选择自动设置 转入钱包 两者必须有一个是主账户*/
  onFromValueSelect() {
    if (this.selectedFromValue !== 'Main') {
      this.selectedToValue = 'Main';
    } else {
      this.selectedToValue = this.gameWallets[0].category;
    }
    this.checkAndBuildCurrencyData();
  }

  /**转入 钱包选择变更，根据选择自动设置 转出钱包 两者必须有一个是主账户*/
  onToValueSelect() {
    if (this.selectedToValue !== 'Main') {
      this.selectedFromValue = 'Main';
    } else {
      this.selectedFromValue = this.gameWallets[0].category;
    }
    this.checkAndBuildCurrencyData();
  }

  /**交换转入转出 */
  swapWalletValue() {
    [this.selectedFromValue, this.selectedToValue] = [this.selectedToValue, this.selectedFromValue];
    this.checkAndBuildCurrencyData();
  }

  /**输入金额格式化 */
  amountValueFormat = (v: string) => {
    // 格式化，最多接受两位小数
    const float = v.split('.')[1];
    if (float && float.length > 2) {
      //去除多余的0、保留2位小数、统一成字符串
      return Number(Number(v).toDecimal(2)).toString();
    } else {
      if (v.startsWith('0') && Number(v) >= 1) {
        //去除0开头、统一成字符串
        return Number(v).toString();
      } else {
        return v;
      }
    }
  };

  /**输入金额变化 */
  amountValueChange(v: string) {
    // Ag 的 VND 只能输入10的倍数 Ag = '20006' AGSlot, Ky = "40010"
    if (this.selectedCurrencyValue === 'VND' && this.vndProviderIds.includes(this.gameWallet?.providerId || '')) {
      this.errorAmountTip = Number(v) % 10 !== 0 ? this.localeService.getValue('hind_vdn') : '';
    } else {
      this.errorAmountTip = '';
    }
  }

  /**打开币种选择窗口（原 app-customize-selec 组件仅作展示用） */
  openCurrencySelectPop() {
    this.dialog
      .open(SelectCurrencyComponent, {
        panelClass: 'custom-dialog-container',
        data: {
          showBalance: true,
          useData: this.availableCurrencies,
        },
      })
      .afterClosed()
      .subscribe((result: AvailableCurrencies | undefined) => {
        if (result) {
          this.selectedCurrencyValue = result.currency;
          this.amountValueChange(this.inputAmountValue);
        }
      });
  }

  /**填入最大金额 */
  setMaxValueAmount() {
    this.inputAmountValue = this.amountValueFormat(String(this.maxAmount));
    this.amountValueChange(this.inputAmountValue);
  }

  /**前往充值 */
  toTopUp() {
    this.piqService.allowRoute.set(false);
    this.router.navigate([this.appService.languageCode, 'deposit']);
    this.close();
  }

  /**关闭 */
  close(status: any | null = null) {
    this.dialogRef.close(status);
  }
}
