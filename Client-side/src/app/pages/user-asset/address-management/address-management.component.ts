import { Component, DestroyRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest, filter, map } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { TokenAddressApi } from 'src/app/shared/apis/tokenaddress.api';
import {
  StandardPopupComponent,
  StandardPopupData,
} from 'src/app/shared/components/standard-popup/standard-popup.component';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import {
  BatchdeleteParam,
  EwPaymentlist,
  GetAddParam,
  InOutWhitelistParam,
  TokenAddress,
} from 'src/app/shared/interfaces/tokenaddress.interface';
import { General2faverifyService } from 'src/app/shared/service/general2faverify.service';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { WithdrawService } from '../../withdraw/withdraw.service';
import { WalletHistoryService } from '../wallet-history/wallet-history.service';
import { AddAddressDialogComponent } from './add-address-dialog/add-address-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-address-management',
  templateUrl: './address-management.component.html',
  styleUrls: ['./address-management.component.scss'],
})
export class AddressManagementComponent implements OnInit {
  isH5!: boolean;
  bottomBarActive: boolean = true;

  constructor(
    private dialog: MatDialog,
    private tokenAddressApi: TokenAddressApi,
    private router: Router,
    private general2faverifyService: General2faverifyService,
    private toast: ToastService,
    private popupService: PopupService,
    private layout: LayoutService,
    private appService: AppService,
    private walletHistoryService: WalletHistoryService,
    private localeService: LocaleService,
    private destroyRef: DestroyRef,
    private withdrawService: WithdrawService,
    private kycDialogService: KycDialogService
  ) {
    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    //订阅移动设备软键盘
    this.layout.h5Keyboard$.pipe(untilDestroyed(this)).subscribe(e => (this.bottomBarActive = !e));
  }

  //币种筛选
  selectedCoinType = '';
  /**所有币种 */
  currencies: CurrenciesInterface[] = [];
  /**所有数字货币币种 */
  digitalCurrencies: CurrenciesInterface[] = [];
  /**所有电子钱包的币种 */
  allewCurrencies: CurrenciesInterface[] = [];
  /**筛选币种 */
  realCurrencies: CurrenciesInterface[] = [];
  allCoinItem: CurrenciesInterface = this.walletHistoryService.CURRENCY_ALL;

  //支付方式筛选
  selectedAddressType: string = '';
  addressType = [
    { name: this.localeService.getValue('all'), value: '' },
    { name: this.localeService.getValue('crypto'), value: '1' },
    { name: this.localeService.getValue('ew'), value: '2' },
  ];

  //类型筛选
  selectedType: null | boolean = null;
  searchType = [
    { name: this.localeService.getValue('all'), value: null },
    { name: this.localeService.getValue('common_add'), value: true },
    { name: this.localeService.getValue('general_add'), value: false },
  ];

  /**当前选择的电子钱包 */
  selectedpaymentMethod: string = '';
  /**电子钱包选项 */
  paymentMethod: EwPaymentlist[] = [];
  allPaymentMethod: EwPaymentlist = {
    code: '',
    name: this.localeService.getValue('all'),
    walletAddressValid: '',
    supportCurrency: [],
  };

  //白名单筛选
  selectedWhitelist: null | boolean = null;
  searchWhitelist = [
    { name: this.localeService.getValue('all'), value: null },
    { name: this.localeService.getValue('w_add'), value: true },
    { name: this.localeService.getValue('nw_add'), value: false },
  ];

  //地址搜索
  searchAddress: string = '';

  selectloading: boolean = true;
  tableData: TokenAddress[] = []; //地址列表数据
  loading!: boolean; //地址列表加载中
  checkStatusloading!: boolean; //检查白名单是否开启加载中
  whiteliststatus!: boolean; //白名单开启状态
  editMode: boolean = false; //管理（多选）模式
  selectAll: boolean = false; //全选
  selectLength: number = 0; //当前已选择地址数量

  @ViewChild('h5FilterPopupTemplate') h5FilterPopupTemplate!: TemplateRef<any>;
  h5FilterPopup!: MatDialogRef<any>;
  h5BottomOperateAreaSticky!: boolean;

  /** 用户信息 */
  userInfo = toSignal(this.appService.userInfo$);

  checkSize(remarkBox: HTMLElement, remarkText: HTMLElement, tooltip: MatTooltip) {
    setTimeout(() => {
      const el1w = remarkBox.offsetWidth;
      const el2w = remarkText.offsetWidth;
      if (el2w > el1w) {
        tooltip.disabled = false;
      }
    });
  }

  ngOnInit() {
    combineLatest([
      this.appService.currencies$.pipe(filter(x => x.length > 0)),
      this.tokenAddressApi.getewalletpaymentlist().pipe(map(x => x?.data || [])),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([currencies, ewalletpaymentlist]) => {
        this.currencies = currencies;
        this.paymentMethod = ewalletpaymentlist;

        // 所有数字货币
        this.digitalCurrencies = this.currencies.filter(x => x.isDigital);

        // 找出电子钱包的币种
        this.allewCurrencies = [...new Set(this.paymentMethod.map(x => x.supportCurrency).flat())].reduce(
          (a: CurrenciesInterface[], b) => {
            const c = this.currencies.find(y => y.currency === b);
            if (c) a.push(c);
            return a;
          },
          []
        );

        this.selectloading = false;
        this.onSelectChange(false, true);
      });

    this.checkWhiteliststatus();
    this.loadAddressList();
  }

  //检查是否开启了白名单
  checkWhiteliststatus() {
    this.checkStatusloading = true;
    this.tokenAddressApi.checkWhiteliststatus().subscribe(res => {
      this.checkStatusloading = false;
      this.whiteliststatus = res?.success && res?.data;
    });
  }

  /**
   * 选项改变的时候，修改币种列表
   *
   * @param req
   * @param setCurrencies
   */
  onSelectChange(req: boolean, setCurrencies: boolean = false) {
    if (setCurrencies) {
      switch (this.selectedAddressType) {
        case '': {
          this.realCurrencies = [...this.allewCurrencies, ...this.digitalCurrencies];
          this.selectedCoinType = '';
          break;
        }
        case '1': {
          this.realCurrencies = this.digitalCurrencies;
          this.selectedCoinType = '';
          break;
        }
        case '2': {
          if (this.selectedpaymentMethod) {
            const curew = this.paymentMethod.find(x => x.code === this.selectedpaymentMethod);
            this.realCurrencies = this.allewCurrencies.filter(x => curew?.supportCurrency?.includes(x.currency));
          } else {
            this.realCurrencies = this.allewCurrencies;
          }
          this.selectedCoinType = '';
          break;
        }
        default:
          break;
      }
    }

    if (req) this.loadAddressList();
  }

  //读取地址列表
  loadAddressList() {
    const param: GetAddParam = {
      currency: this.selectedCoinType,
      isWhiteList: this.selectedWhitelist,
      isUniversalAddress: this.selectedAddressType === '1' ? this.selectedType : undefined,
      address: this.searchAddress,
      walletAddressType: this.selectedAddressType,
      paymentMethod: this.selectedAddressType === '2' ? this.selectedpaymentMethod : undefined,
    };

    this.loading = true;
    this.tokenAddressApi.getTokenadd(param).subscribe(res => {
      this.loading = false;
      if (res?.success) this.tableData = res.data;
    });
  }

  //选择全部
  selectAllItem(checked: boolean) {
    this.selectAll = checked;
    this.selectLength = checked ? this.tableData.length : 0;
    this.tableData.forEach(v => (v.select = checked));
  }

  //半选状态
  someSelect(): boolean {
    return this.tableData.some(v => v.select) && !this.selectAll;
  }

  //切换选择单个
  selectItem(item: any) {
    item.select = !item.select;
    if (item.select) {
      this.selectAll = this.tableData.every(v => v.select);
      this.selectLength += 1;
    } else {
      this.selectAll = false;
      this.selectLength -= 1;
    }
  }

  // 加入/移出白名单
  handleInOut(items: TokenAddress | TokenAddress[], isJoin: boolean) {
    if (!this.whiteliststatus) {
      this.popupService.open(StandardPopupComponent, {
        speed: 'faster',
        inAnimation: this.isH5 ? 'fadeInUp' : undefined,
        outAnimation: this.isH5 ? 'fadeOutDown' : undefined,
        data: {
          type: 'warn',
          content: this.localeService.getValue('hint'),
          buttons: [
            { text: this.localeService.getValue('cancels'), primary: false },
            { text: this.localeService.getValue('g_t_open00'), primary: true },
          ],
          description:
            this.localeService.getValue('bef_add_white00') + '\n' + this.localeService.getValue('bef_add_white01'),
          callback: () => {
            this.goToSetWhiteliststatus();
          },
        },
      });
      return;
    }

    const param: InOutWhitelistParam = {
      ids: Array.isArray(items) ? items.map(x => x.id) : [items.id],
      isJoin: isJoin,
      key: '',
    };

    //2fa验证弹窗
    this.general2faverifyService.launch(isJoin ? 'JoinWhiteList' : 'RemoveWhiteList').subscribe(verifyStatus => {
      if (verifyStatus.status) {
        param.key = verifyStatus.key;
        //正式请求删除
        this.tokenAddressApi.inOutWhitelist(param).subscribe(res => {
          if (res?.success && res?.data) {
            this.toast.show({
              type: 'success',
              message: isJoin ? this.localeService.getValue('add_white_s') : this.localeService.getValue('rewhite_s'),
            });
            //刷新列表
            this.loadAddressList();
          } else {
            this.toast.show({
              message: isJoin ? this.localeService.getValue('add_white_f') : this.localeService.getValue('rewhite_f'),
              type: 'fail',
            });
          }
        });
      }
    });
  }

  /**
   * 添加地址
   *
   * @returns
   */
  handleAdd() {
    if (!this.userInfo()?.kycGrade && this.withdrawService.kycVerifyCryptoWidthdraw) {
      this.kycDialogService.showKycError(null, 1, false);
      return;
    }

    this.dialog
      .open(AddAddressDialogComponent, {
        disableClose: true,
        autoFocus: false,
        panelClass: 'single-page-dialog-container',
        data: {
          whiteliststatus: this.whiteliststatus,
          tableData: this.tableData,
          currencies: [...this.digitalCurrencies, ...this.allewCurrencies],
          paymentMethod: this.paymentMethod,
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) this.loadAddressList();
      });
  }

  //删除地址
  handleDel(items: TokenAddress | TokenAddress[]) {
    const param: BatchdeleteParam = {
      ids: Array.isArray(items) ? items.map(x => x.id) : [items.id],
      key: '',
    };

    const confirmData: StandardPopupData = {
      type: 'warn',
      content:
        param.ids.length > 1
          ? this.localeService.getValue('del_addres00')
          : this.localeService.getValue('del_addres01'),
      description: this.localeService.getValue('oper_can_be00'),
    };

    //确认弹窗
    this.popupService.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        ...confirmData,
        callback: () => {
          //2fa验证弹窗
          this.general2faverifyService.launch('DeleteTokenAddress').subscribe(verifyStatus => {
            if (verifyStatus.status) {
              param.key = verifyStatus.key;
              //正式请求删除
              this.tokenAddressApi.deleteAddress(param).subscribe(res => {
                if (res?.success && res?.data) {
                  this.toast.show({ message: this.localeService.getValue('dele_add_s'), type: 'success' });
                  //刷新列表
                  this.loadAddressList();
                } else {
                  this.toast.show({ message: this.localeService.getValue('dele_add_f'), type: 'fail' });
                }
              });
            }
          });
        },
      },
    });
  }

  //删除多个地址
  handleDelMultiple() {
    this.handleDel(this.tableData.filter(x => x.select));
  }

  //多个加入/移出白名单
  handleInOutMultiple(isJoin: boolean) {
    this.handleInOut(
      this.tableData.filter(x => x.select),
      isJoin
    );
  }

  //前往开关白名单
  goToSetWhiteliststatus() {
    this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/security`);
  }

  //完成管理
  finish() {
    this.selectAllItem(false);
    this.editMode = false;
  }

  //打开h5选择窗口
  openh5Filter() {
    this.h5FilterPopup = this.popupService.open(this.h5FilterPopupTemplate, {
      inAnimation: 'fadeInRight',
      outAnimation: 'fadeOutRight',
      speed: 'fast',
      autoFocus: false,
      isFull: true,
    });
  }

  //重置h5筛选
  resetH5Filter() {
    this.selectedCoinType = '';
    this.selectedType = null;
    this.selectedWhitelist = null;
  }

  //判断是否开启底部区域 Sticky 模式
  h5BottomOperateAreaintersectChange(entries: IntersectionObserverEntry[]) {
    entries.forEach(x => {
      // x.boundingClientRect.top > 200 用于剔除向上滚动导致的消失
      this.h5BottomOperateAreaSticky = x.intersectionRatio !== 1 && x.boundingClientRect.top > 200;
    });
  }
}
