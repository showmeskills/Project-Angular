import { ConnectedPosition } from '@angular/cdk/overlay';
import { Component, Inject, OnInit, WritableSignal, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject, combineLatest, from, takeUntil, timer } from 'rxjs';
import { TokenAddressApi } from 'src/app/shared/apis/tokenaddress.api';
import { SelectCurrencyComponent } from 'src/app/shared/components/select-currency/select-currency.component';
import { AllNetWorks, CurrenciesInterface, TokenNetworksInterface } from 'src/app/shared/interfaces/deposit.interface';
import {
  AddAddressParam,
  AddEwAddressParam,
  EwPaymentlist,
  TokenAddress,
} from 'src/app/shared/interfaces/tokenaddress.interface';
import { General2faverifyService } from 'src/app/shared/service/general2faverify.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { UserAssetsService } from '../../user-assets.service';
import { SelectMainNetworkDialogComponent } from '../select-main-network-dialog/select-main-network-dialog.component';

export type NwList = {
  network: string;
  desc: string;
  regExp: string;
};

@Component({
  selector: 'app-add-address-dialog',
  templateUrl: './add-address-dialog.component.html',
  styleUrls: ['./add-address-dialog.component.scss'],
})
export class AddAddressDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<AddAddressDialogComponent>,
    private dialog: MatDialog,
    private tokenAddressApi: TokenAddressApi,
    private toast: ToastService,
    private general2faverifyService: General2faverifyService,
    private layout: LayoutService,
    private userAssetsService: UserAssetsService,
    private localeService: LocaleService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      whiteliststatus: boolean;
      tableData: TokenAddress[];
      currencies: CurrenciesInterface[];
      paymentMethod: EwPaymentlist[];
    },
  ) {}

  /**订阅是否h5 */
  isH5 = toSignal(this.layout.isH5$);

  /**支付方式筛选 */
  selectedAddressType: string = '';
  addressType = [{ name: this.localeService.getValue('crypto'), value: '_crypto' }];

  addressValid = { valid: false, text: '' };
  remarkValid = false;

  selectedNetwork: string = '';
  networkOptions: NwList[] = [];

  addressRegExp: WritableSignal<string> = signal('');
  addressRegExpWatch$ = toObservable(this.addressRegExp).pipe(takeUntilDestroyed());

  tokenNetworks: TokenNetworksInterface[] = [];
  allNetWorks: AllNetWorks[] = [];
  netWorksLoading: boolean = true;

  address: string = '';
  remark: string = '';
  /**是否通用地址 */
  isCommon: boolean = false;
  /**是否添加白名单 */
  isWhiteList: boolean = false;
  isLoading: boolean = false;

  addressExietTip$: Subject<boolean> = new Subject();

  positions: ConnectedPosition[] = [
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      panelClass: 'cdk-overlay-panel-auto-width-center',
    }, // h5
    { originX: 'center', originY: 'center', overlayX: 'center', overlayY: 'center' }, // web
  ];

  selectedCoinType = '';

  ngOnInit() {
    this.getNetworks();
    this.data.paymentMethod.forEach(x => {
      this.addressType.push({
        name: x.name,
        value: x.code,
      });
    });
    this.addressRegExpWatch$.subscribe(() => {
      this.onAddressChange();
    });
  }

  onAddressChange() {
    const regExp = this.addressRegExp();
    if (regExp) {
      // 根据当前正则验证
      const r = new RegExp(regExp).test(this.address);
      if (r) {
        this.addressValid.valid = true;
      } else {
        this.addressValid.valid = false;
        this.addressValid.text = this.selectedNetwork ? 'enter_addr02' : 'enter_addr01';
      }
    } else {
      //数字货币时候如果没有选网络，自动选中首个可能匹配的网络
      if (this.selectedAddressType === '_crypto' && !this.selectedNetwork) {
        if (this.networkOptions.length > 0) {
          this.networkOptions.some(x => {
            const r = new RegExp(x.regExp).test(this.address);
            if (r) {
              this.addressValid.valid = true;
              this.selectedNetwork = x.network;
              this.addressRegExp.set(x.regExp);
              return true;
            } else {
              this.addressValid.valid = false;
              this.addressValid.text = 'enter_addr01';
              return false;
            }
          });
        } else {
          // 沒有可选网络 translate:请检查提现地址，提现地址必须和主网络匹配
          this.addressValid.valid = false;
          this.addressValid.text = 'enter_addr02';
        }
      } else {
        // 重置验证状态
        this.addressValid.valid = false;
        this.addressValid.text = '';
      }
    }
  }

  /**准备网络 */
  getNetworks() {
    combineLatest([
      from(this.userAssetsService.getWithdrawTokenNetWorks('Withdraw')),
      from(this.userAssetsService.getAllNetWorksInfor()),
    ]).subscribe(([tokenNetworks, allNetWorks]) => {
      if (tokenNetworks.length > 0 && allNetWorks.length > 0) {
        this.tokenNetworks = tokenNetworks;
        this.allNetWorks = allNetWorks;
        this.netWorksLoading = false;
      }
    });
  }

  /**选择支付方式 */
  handleSelectedAddressType() {
    this.reset();
    if (this.selectedAddressType && this.selectedAddressType !== '_crypto') {
      const cur = this.data.paymentMethod.find(x => x.code === this.selectedAddressType)?.walletAddressValid;
      if (cur) this.addressRegExp.set(cur);
    }
  }

  /**选择是否通用 */
  isCommonChange() {
    // 更新当前可选网络列表
    this.updateNetworkOptions();
    // 检查之前选择的网络
    if (this.selectedNetwork) {
      const cur = this.networkOptions.find(x => x.network === this.selectedNetwork);
      if (!cur) {
        this.selectedNetwork = '';
        this.addressRegExp.set('');
      }
    }
  }

  /**更新可选网络 */
  updateNetworkOptions() {
    if (this.isCommon) {
      this.networkOptions = this.allNetWorks.map(x => {
        return {
          network: x.network,
          desc: x.desc,
          regExp: x.addressRegex,
        };
      });
      return;
    }
    if (this.selectedCoinType) {
      const curnw = this.tokenNetworks.find(x => x.currency === this.selectedCoinType);
      if (curnw) {
        this.networkOptions = curnw.networks.map(x => {
          return {
            network: x.network,
            desc: x.desc,
            regExp: x.addressRegex,
          };
        });
        return;
      }
    }
    this.networkOptions = [];
    this.selectedNetwork = '';
    this.addressRegExp.set('');
  }

  /**选择币种 */
  handleSelectCurrencyType() {
    if (!this.selectedAddressType) return;

    const data: {
      showBalance: boolean;
      isDigital: boolean;
      useData?: CurrenciesInterface[];
    } = { showBalance: false, isDigital: true, useData: undefined };

    if (this.selectedAddressType !== '_crypto') {
      const curew = this.data.paymentMethod.find(x => x.code === this.selectedAddressType);
      data.useData = this.data.currencies.filter(x => curew?.supportCurrency?.includes(x.currency));
    }

    this.dialog
      .open(SelectCurrencyComponent, {
        panelClass: 'custom-dialog-container',
        data: data,
      })
      .afterClosed()
      .subscribe((result: CurrenciesInterface) => {
        if (result) {
          this.selectedCoinType = result.currency;
          if (this.selectedAddressType === '_crypto') {
            const curnw = this.tokenNetworks.find(x => x.currency === this.selectedCoinType);
            // 如果该币种有多个网络，清空网络，
            // 如果该币种只有一种网络，自动选中
            if (curnw?.networks?.length === 1) {
              this.selectedNetwork = curnw.networks[0].network;
              this.addressRegExp.set(curnw.networks[0].addressRegex);
            } else {
              this.selectedNetwork = '';
              this.addressRegExp.set('');
            }
            // 更新当前可选网络列表
            this.updateNetworkOptions();
            // 检查之前选择的网络
            this.onAddressChange();
          }
        }
      });
  }

  /**备注输入 */
  onRemarkChange() {
    this.remarkValid = this.remark.length >= 4 && this.remark.length <= 20;
  }

  /**选择转账网络 */
  handleSelectedNetwork() {
    this.dialog
      .open(SelectMainNetworkDialogComponent, {
        panelClass: 'custom-dialog-container',
        data: {
          data: this.networkOptions,
          address: this.address,
        },
      })
      .afterClosed()
      .subscribe((v: NwList) => {
        if (v) {
          this.selectedNetwork = v.network;
          this.addressRegExp.set(v.regExp);
        }
      });
  }

  submit() {
    if (this.isLoading) return;
    if (!this.canSubmit()) return;
    // 检查地址是否存在
    const isAddressExiet = this.data.tableData.some(x => x.address == this.address);
    if (isAddressExiet) {
      this.addressExietTip$.next(true);
      timer(3000)
        .pipe(takeUntil(this.addressExietTip$))
        .subscribe(_ => {
          this.addressExietTip$.next(false);
        });
    } else {
      this.isLoading = true;
      this.general2faverifyService.launch('AddTokenAddress').subscribe(res => {
        if (res.status) {
          if (this.selectedAddressType === '_crypto') {
            this.addTokenaddress(res.key);
          } else {
            this.addewalletaddress(res.key);
          }
        } else {
          this.isLoading = false;
        }
      });
    }
  }

  addTokenaddress(key: string) {
    const post: AddAddressParam = {
      remark: this.remark,
      token: this.isCommon ? '' : this.selectedCoinType,
      network: this.selectedNetwork,
      address: this.address,
      key: key,
      isWhiteList: this.isWhiteList,
    };
    this.tokenAddressApi.addTokenaddress(post).subscribe(res => {
      this.toast.show({
        message: res?.data ? this.localeService.getValue('add_addr_s') : res?.message || '',
        type: res?.data ? 'success' : 'fail',
      });
      this.isLoading = false;
      this.dialogRef.close(res?.data);
    });
  }

  addewalletaddress(key: string) {
    const post: AddEwAddressParam = {
      remark: this.remark,
      currency: this.selectedCoinType,
      paymentMethod: this.selectedAddressType,
      address: this.address,
      key: key,
      isWhiteList: this.isWhiteList,
    };
    this.tokenAddressApi.addEwalletaddress(post).subscribe(res => {
      this.toast.show({
        message: res?.data ? this.localeService.getValue('add_addr_s') : res?.message || '',
        type: res?.data ? 'success' : 'fail',
      });
      this.isLoading = false;
      this.dialogRef.close(res?.data);
    });
  }

  /**重置 */
  reset() {
    this.selectedCoinType = '';
    this.selectedNetwork = '';
    this.networkOptions = [];
    this.address = '';
    this.addressValid.valid = false;
    this.addressValid.text = '';
    this.isCommon = false;
    this.isWhiteList = false;
    this.addressRegExp.set('');
  }

  canSubmit() {
    switch (this.selectedAddressType) {
      case '':
        return false;
      case '_crypto':
        return (
          this.remark &&
          this.remarkValid &&
          (this.selectedCoinType || this.isCommon) &&
          this.selectedNetwork &&
          this.address &&
          this.addressValid.valid
        );
      default:
        return (
          this.remark &&
          this.remarkValid &&
          this.selectedCoinType &&
          this.selectedAddressType &&
          this.address &&
          this.addressValid.valid
        );
    }
  }
}
