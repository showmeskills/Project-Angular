import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { AdjusttxHistoryInterface } from 'src/app/shared/interfaces/history.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { WalletHistoryService } from '../wallet-history.service';

@UntilDestroy()
@Component({
  selector: 'app-adjustment-history',
  templateUrl: './adjustment-history.component.html',
  styleUrls: ['./adjustment-history.component.scss'],
})
export class AdjustmentHistoryComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private historyApi: HistoryApi,
    private popup: PopupService,
    private generalService: GeneralService,
    private appService: AppService,
    private localeService: LocaleService,
    private walletHistoryService: WalletHistoryService
  ) {}

  isH5!: boolean;

  // 资产菜单
  selectedAssetType: string = '';
  assetTypeOptions = [
    { name: this.localeService.getValue('all'), value: '' },
    { name: this.localeService.getValue('crypto'), value: 'crypto' },
    { name: this.localeService.getValue('fiat'), value: 'currency' },
  ];

  // 币种
  currencies!: CurrenciesInterface[];
  selectedCurrency: string = '';
  allCoinItem: CurrenciesInterface = this.walletHistoryService.CURRENCY_ALL;

  get currencyList(): CurrenciesInterface[] {
    if (this.currencies.length > 0) {
      if (this.selectedAssetType === 'crypto') {
        return this.currencies.filter(v => v.isDigital);
      } else if (this.selectedAssetType === 'currency') {
        return this.currencies.filter(v => !v.isDigital);
      }
      return [this.walletHistoryService.CURRENCY_ALL, ...this.currencies];
    }
    return [];
  }

  // 时间菜单
  selectedTime: number[] = this.generalService.getStartEndDateArray('30days');
  selectedTimeValue: string = '30days';
  timeOptions = [
    { name: this.localeService.getValue('past_a_d'), value: '7days' },
    { name: this.localeService.getValue('past_b_d'), value: '30days', default: true },
    { name: this.localeService.getValue('past_c_d'), value: '90days' },
    { name: this.localeService.getValue('past_d_d'), value: 'customize' },
  ];

  // 账户菜单
  selectedAccount: string = 'Main';
  accountOptions: any = [
    { name: this.localeService.getValue('main'), value: 'Main' },
    { name: this.localeService.getValue('wd_limit'), value: 'WithdrawLimit' },
  ];

  // 状态
  selectedStatus: number = 0;
  statusOptions = [
    { name: this.localeService.getValue('all'), value: 0 },
    { name: this.localeService.getValue('add'), value: 1 },
    { name: this.localeService.getValue('deductions'), value: 2 },
  ];

  // 分页
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  // 加载状态
  loading!: boolean;

  // 渲染数据
  adjustmentHistoryData: AdjusttxHistoryInterface[] = [];

  // 选中数据索引与数据
  selectedIndex?: number;
  selectedItem?: AdjusttxHistoryInterface;

  // h5筛选弹窗
  @ViewChild('h5Filter') h5FilterRef!: TemplateRef<any>;
  h5FilterPopup!: MatDialogRef<any>;

  // h5详情弹窗
  @ViewChild('detailData') detailDataRef!: TemplateRef<any>;
  detailDataPopup!: MatDialogRef<any>;

  ngOnInit() {
    // 读取本地币种
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
      this.currencies = x;
    });
    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    // 获取数据
    this.loadData();
  }

  assetValueChange(v: string) {
    this.selectedCurrency = v === '' ? '' : this.currencyList[0].currency;
  }

  loadData() {
    this.loading = true;
    const param = {
      StartTime: this.selectedTime[0],
      EndTime: this.selectedTime[1],
      Currency: this.selectedCurrency,
      Category: this.selectedAccount,
      Status: this.selectedStatus,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };

    this.historyApi
      .getAdjusttxHistory(param)
      .pipe(
        map(v => v.data),
        finalize(() => (this.loading = false))
      )
      .subscribe(data => {
        this.paginator.total = data.total;
        if (this.isH5) {
          this.adjustmentHistoryData.push(...(data.list as any));
        } else {
          this.adjustmentHistoryData = data.list;
        }
        // this.adjustmentHistoryData = MOCK_DATA;
        // this.paginator.total = 10;
      });
  }

  searchLoadData() {
    // 筛选下 页码归1 数据清0
    this.paginator.page = 1;
    this.adjustmentHistoryData = [];
    this.loadData();
  }

  reset() {
    this.selectedAssetType = '';
    this.selectedCurrency = '';
    this.selectedTime = [];
    this.selectedAccount = '';
    this.selectedStatus = 0;
  }

  getAccountName(account: string) {
    return this.accountOptions.find((v: { value: string }) => v.value === account).name;
  }

  // 打开h5筛选窗口
  openh5Filter() {
    this.h5FilterPopup = this.popup.open(this.h5FilterRef, {
      inAnimation: 'fadeInRight',
      outAnimation: 'fadeOutRight',
      speed: 'fast',
      autoFocus: false,
      isFull: true,
    });
  }

  // 打开h5详情弹窗
  openh5Detail(item: AdjusttxHistoryInterface) {
    this.selectedItem = item;
    this.detailDataPopup = this.popup.open(this.detailDataRef, {
      inAnimation: 'fadeInUp',
      outAnimation: 'fadeOutDown',
      position: { bottom: '0px' },
      speed: 'faster',
      autoFocus: false,
    });
  }
}
