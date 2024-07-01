import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import {
  CointxHistoryInterface,
  CurrencytxHistoryInterface,
  StatusListInterface,
} from 'src/app/shared/interfaces/history.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { WalletHistoryService } from '../wallet-history.service';

@UntilDestroy()
@Component({
  selector: 'app-withdraw-history',
  templateUrl: './withdraw-history.component.html',
  styleUrls: ['./withdraw-history.component.scss'],
})
export class WithdrawHistoryComponent implements OnInit {
  constructor(
    private historyApi: HistoryApi,
    public walletHistoryService: WalletHistoryService,
    private generalService: GeneralService,
    private layout: LayoutService,
    private popup: PopupService,
    private appService: AppService,
    private localeService: LocaleService
  ) {
    this.walletHistoryService.statusList$
      .pipe(untilDestroyed(this))
      .subscribe(statusList => (this.statusList = statusList));
    //订阅币种类型 自动带入 by lucy
    this.walletHistoryService.designatedWithdrawCurrencyHistory$.pipe(untilDestroyed(this)).subscribe(x => {
      if (x != null && x.length > 0) {
        if (x == 'isCurrency') {
          this.selectedAssetType = 'currency';
        } else {
          this.selectedAssetType = 'crypto';
        }
      }
    });
  }

  isH5!: boolean;

  /**h5筛选弹窗 */
  @ViewChild('h5Filter') h5FilterRef!: TemplateRef<any>;
  /**h5筛选弹窗引用 */
  h5FilterPopup!: MatDialogRef<any>;

  /**h5详情弹窗 */
  @ViewChild('detailData') detailDataRef!: TemplateRef<any>;
  /**h5详情弹窗引用 */
  detailDataPopup!: MatDialogRef<any>;
  /**选中的数据（h5详情使用） */
  selectedItem?: any;

  /**资产菜单 */
  selectedAssetType: string = 'crypto';
  assetTypeOptions = [
    { name: this.localeService.getValue('crypto'), value: 'crypto' },
    { name: this.localeService.getValue('fiat'), value: 'currency' },
  ];

  /**币种 */
  selectedCurrency: string = '';
  currencies!: CurrenciesInterface[];
  allCoinItem: CurrenciesInterface = this.walletHistoryService.CURRENCY_ALL;

  /**时间菜单 */
  selectedTime: number[] = this.generalService.getStartEndDateArray('30days');
  selectedTimeValue: string = '30days';
  timeOptions = [
    { name: this.localeService.getValue('past_a_d'), value: '7days' },
    { name: this.localeService.getValue('past_b_d'), value: '30days', default: true },
    { name: this.localeService.getValue('past_c_d'), value: '90days' },
    { name: this.localeService.getValue('past_d_d'), value: 'customize' },
  ];

  /**状态 */
  selectedStatus: string = '';
  statusList!: StatusListInterface[];
  allSatatusItem: StatusListInterface = {
    code: '',
    description: this.localeService.getValue('all'),
  };

  /**加载中 */
  loading!: boolean;
  /**数字货币List */
  cryptoHistory: CointxHistoryInterface[] = [];
  /**法币List */
  currencyHistory: CurrencytxHistoryInterface[] = [];
  /**分页数据 */
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  ngOnInit() {
    // 读取本地币种
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
      this.currencies = x;
    });
    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    // 首次获取数据
    this.onSearch();
  }

  /**点击筛选按钮 */
  searchLoadData() {
    this.paginator.page = 1;
    this.paginator.total = 0;
    this.currencyHistory = [];
    this.cryptoHistory = [];
    this.onSearch();
  }

  /**重置 */
  reset(all: boolean = true) {
    if (all) {
      this.selectedAssetType = 'crypto';
      this.selectedTime = [];
    }
    this.paginator.page = 1;
    this.paginator.total = 0;
    this.selectedCurrency = '';
    this.selectedStatus = '';
    this.currencyHistory = [];
    this.cryptoHistory = [];
  }

  /**选择的资产类型变化 */
  assetTypeChange() {
    this.reset(false);
    this.onSearch();
  }

  /**正式请求 */
  onSearch() {
    this.loading = true;
    const param = {
      category: 'Withdraw',
      startTime: this.selectedTime[0],
      endTime: this.selectedTime[1],
      currency: this.selectedCurrency,
      orderStatus: this.selectedStatus,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    if (this.selectedAssetType === 'currency') {
      this.historyApi
        .getCurrencytxHistory(param)
        .pipe(map(v => v?.data))
        .subscribe(data => {
          this.paginator.total = data?.total || 0;
          if (this.isH5) {
            this.currencyHistory.push(...(data?.list || []));
          } else {
            this.currencyHistory = data?.list || [];
          }
          this.loading = false;
        });
    } else {
      this.historyApi
        .getCointxHistory(param)
        .pipe(map(v => v?.data))
        .subscribe(data => {
          this.paginator.total = data?.total || 0;
          if (this.isH5) {
            this.cryptoHistory.push(...(data?.list || []));
          } else {
            this.cryptoHistory = data?.list || [];
          }
          this.loading = false;
        });
    }
  }

  /**获取订单状态 */
  getStatusTemplate(status: string) {
    const statusList = new Map([
      ['Success', { /*text: this.localeService.getValue('trans_success'),*/ calss: 'success' }],
      ['NotPassed', { /*text: this.localeService.getValue('tran_fail'),*/ calss: 'fail' }],
      ['Fail', { /*text: this.localeService.getValue('tran_fail'),*/ calss: 'fail' }],
      ['Review', { /*text: this.localeService.getValue('refunding'),*/ calss: 'awit' }],
      ['Passed', { /*text: this.localeService.getValue('reviewed'),*/ calss: 'awit' }],
      ['default', { /*text: this.localeService.getValue('waitings'),*/ calss: 'awit' }],
    ]);
    return statusList.get(status) || statusList.get('default');
  }

  /**处理地址格式 */
  getAddresseElipsis(addresse: string) {
    if (addresse) return addresse.slice(0, 7) + '...' + addresse.slice(-7);
    return '';
  }

  /**打开h5筛选窗口 */
  openh5Filter() {
    this.h5FilterPopup = this.popup.open(this.h5FilterRef, {
      inAnimation: 'fadeInRight',
      outAnimation: 'fadeOutRight',
      speed: 'fast',
      autoFocus: false,
      isFull: true,
    });
  }

  /**打开h5详情弹窗 */
  openh5Detail(item?: any) {
    this.selectedItem = item;
    this.detailDataPopup = this.popup.open(this.detailDataRef, {
      inAnimation: 'fadeInUp',
      outAnimation: 'fadeOutDown',
      position: { bottom: '0px' },
      speed: 'faster',
      autoFocus: false,
    });
  }

  cancelOrder(orderNum: string) {
    this.walletHistoryService.cancelCurrency(orderNum, this.searchLoadData.bind(this));
  }
}
