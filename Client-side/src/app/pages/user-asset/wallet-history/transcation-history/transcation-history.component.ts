import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { ProviderCategoryInterface, ProviderInterface } from 'src/app/shared/interfaces/game.interface';
import {
  StatusListInterface,
  WagerHistoryInterface,
  WagerStatusListInterface,
} from 'src/app/shared/interfaces/history.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import {
  CustomizedTimeDialogComponent,
  CustomizedTimeDialogResInterface,
} from '../customized-time-dialog/customized-time-dialog.component';
import { WalletHistoryService } from '../wallet-history.service';
import { TranscationDetailComponent } from './transcation-detail/transcation-detail.component';
@UntilDestroy()
@Component({
  selector: 'app-transcation-history',
  templateUrl: './transcation-history.component.html',
  styleUrls: ['./transcation-history.component.scss'],
})
export class TranscationHistoryComponent implements OnInit {
  statusList!: StatusListInterface[];

  constructor(
    private dialog: MatDialog,
    private historyApi: HistoryApi,
    private appService: AppService,
    private walletHistoryService: WalletHistoryService,
    private localeService: LocaleService,
    private generalService: GeneralService
  ) {
    this.statusList = walletHistoryService.statusList;
  }

  // 资产菜单数据
  showAssetTypeMenu = false;
  selectedAssetType: 'currency' | 'crypto' = 'crypto';
  assetTypeOptions = [
    { name: this.localeService.getValue('crypto'), active: true, value: 'crypto' },
    { name: this.localeService.getValue('fiat'), active: false, value: 'currency' },
  ];

  // 币种菜单
  coinTypeMenu = false;
  currencies!: CurrenciesInterface[];
  selectedCoinType = '';
  allCoinItem: CurrenciesInterface = this.walletHistoryService.CURRENCY_ALL;

  //搜索时间数据
  openTimeMenu = false;
  selectedTime: '7days' | '30days' | '90days' | 'customize' = '30days';
  timeOptions = [
    { name: this.localeService.getValue('past_a_d'), active: false, value: '7days' },
    { name: this.localeService.getValue('past_b_d'), active: true, value: '30days' },
    { name: this.localeService.getValue('past_c_d'), active: false, value: '90days' },
    { name: this.localeService.getValue('custom_time'), active: false, value: 'customize' },
  ];
  startDate!: number;
  endDate!: number;

  // 类别
  categoryMenu = false;
  selectedCategory = 'SportsBook';
  categoryData!: ProviderCategoryInterface[];
  loading: boolean = false; //对接接口时调整
  // 场馆
  providerMenu = false;
  selectedProvider = '';
  providerData!: ProviderInterface[];
  allProviderItem: any = {
    providerCatId: '',
    providerName: this.localeService.getValue('all'),
    // webLogo: '',
    // h5Logo: '',
    // appLogo: '',
    // status: '',
    // gameCount: 0
  };

  wagerHistory: WagerHistoryInterface[] = [];

  // 状态
  selcetedSatatusCode = '';
  statusMenuFlag = false;
  wagerStatusList!: WagerStatusListInterface[]; // 交易记录状态数据
  allSatatusItem: WagerStatusListInterface = {
    code: '',
    description: this.localeService.getValue('all'),
  };

  // loading!:boolean;             //操作数据加载中
  paginator: PaginatorState = {
    //登录数据分页
    page: 1,
    pageSize: 10,
    total: 0,
  };

  ngOnInit() {
    // 读取本地币种
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
      this.currencies = x;
    });

    // 设置默认30天的时间范围
    this.setStartEndDate('30days');

    // 判断厂商列表、游戏类型、交易状态是否准备好，没准备好先拉取
    if (
      !this.walletHistoryService.providerList ||
      !this.walletHistoryService.providerCategory ||
      !this.walletHistoryService.wagerStatusList
    ) {
      this.walletHistoryService.getProviderInfo().subscribe(res => {
        this.categoryData = res.providerCategory;
        this.providerData = res.providerList;
        this.wagerStatusList = res.wagerStatusList;
        this.onSearch(this.selectedAssetType);
      });
    } else {
      this.categoryData = this.walletHistoryService.providerCategory;
      this.providerData = this.walletHistoryService.providerList;
      this.wagerStatusList = this.walletHistoryService.wagerStatusList;
      this.onSearch(this.selectedAssetType);
    }
  }

  //------------------类别菜单
  showCategoryMenu() {
    this.categoryMenu = !this.categoryMenu;
  }
  categoryClick(item: ProviderCategoryInterface) {
    if (item.code === this.selectedCategory) return;
    this.selectedCategory = item.code;
  }

  //------------------ 场馆菜单
  showProviderMenu() {
    this.providerMenu = !this.providerMenu;
  }
  providerClick(item: ProviderInterface) {
    if (item.providerCatId === this.selectedProvider) return;
    this.selectedProvider = item.providerCatId;
  }

  //------------------资产菜单
  showAssetsOptions() {
    this.showAssetTypeMenu = !this.showAssetTypeMenu;
  }
  // 选择资产下拉框选项
  assetTypeClick(item: any) {
    if (item.value === this.selectedAssetType) return;
    this.assetTypeOptions.forEach(x => (x.active = false));
    item.active = true;
    this.selectedAssetType = item.value;
    this.coinTypeClick(this.allCoinItem); //切换币种类型，清空币种选择为'全部'
    this.resetData(); //切换币种类型，清空已显示数据
  }
  // 清空已显示数据
  resetData() {
    this.wagerHistory = [];
  }

  //----------------------币种菜单
  showCoinMenu() {
    this.coinTypeMenu = !this.coinTypeMenu;
  }
  // 选择币种下拉框选项
  coinTypeClick(item: CurrenciesInterface) {
    if (item.currency === this.selectedCoinType) return;
    this.currencies.forEach(x => (x.active = false));
    this.allCoinItem.active = false;
    item.active = true;
    this.selectedCoinType = item.currency;
  }

  //----------------------范围菜单
  showTimeOptions() {
    this.openTimeMenu = !this.openTimeMenu;
  }
  // 点击范围选项
  timeClick(item: any) {
    const doAfter = () => {
      this.timeOptions.forEach(x => (x.active = false));
      item.active = true;
      this.selectedTime = item.value;
    };
    if (item.value === 'customize') {
      this.dialog
        .open(CustomizedTimeDialogComponent, {
          data: {
            startDate: this.startDate,
            endDate: this.endDate,
          },
        })
        .afterClosed()
        .subscribe((v: CustomizedTimeDialogResInterface) => {
          if (v && v.startTime && v.endTime) {
            this.setStartEndDate('customize', v.startTime, v.endTime);
            doAfter();
          }
        });
    } else {
      this.setStartEndDate(item.value);
      doAfter();
    }
  }

  setStartEndDate(type: string, start?: number, end?: number): void {
    switch (type) {
      case '7days':
        this.startDate = this.generalService.getStartEndDateArray(type)[0];
        this.endDate = this.generalService.getStartEndDateArray(type)[1];
        break;
      case '30days':
        this.startDate = this.generalService.getStartEndDateArray(type)[0];
        this.endDate = this.generalService.getStartEndDateArray(type)[1];
        break;
      case '90days':
        this.startDate = this.generalService.getStartEndDateArray(type)[0];
        this.endDate = this.generalService.getStartEndDateArray(type)[1];
        break;
      case 'customize':
        this.startDate = start as number;
        this.endDate = end as number;
        break;
    }
  }

  //----------------------状态菜单
  showStatusMenu() {
    this.statusMenuFlag = !this.statusMenuFlag;
  }
  statusClick(item: WagerStatusListInterface) {
    if (item.code === this.selcetedSatatusCode) return;
    this.selcetedSatatusCode = item.code;
  }

  onReset() {
    // 重置资产类型
    this.assetTypeClick(this.assetTypeOptions.find(x => x.value === 'crypto'));

    // 清空现有数据
    this.resetData();

    // 重置币种为全部
    this.coinTypeClick(this.allCoinItem);

    // 重置时间范围为30天
    this.timeClick(this.timeOptions.find(x => x.value === '30days'));

    // 重置状态为全部
    this.statusClick(this.allSatatusItem);
  }

  onSearch(type: string) {
    const param = {
      startTime: this.startDate,
      endTime: this.endDate,
      currency: this.selectedCoinType,
      isDigital: type === 'crypto',
      gameCategory: this.selectedCategory,
      gameProvider: this.selectedProvider,
      OrderStatus: this.selcetedSatatusCode,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.loading = true;
    this.historyApi
      .getWagerHistory(param)
      .pipe(
        map(v => v.data),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(data => {
        this.wagerHistory = data.list;
        this.paginator.total = data.total;
      });
  }

  // 筛选
  onReLoad(type: string) {
    this.paginator.page = 1;
    this.onSearch(type);
  }

  //H5 搜索页
  // handleFilter() {
  //   this.dialog.open(HistoryMobileFilterComponent, { //废弃
  //     panelClass: 'single-page-dialog-container',
  //     data: { callback: this.closeAddDialogCallBack.bind(this), isTranscation: true }
  //   });
  // }

  closeAddDialogCallBack(callback: any) {}

  //提现详情弹出框
  openDetail(item: any) {
    item.isSelected = !item.isSelected;
    this.dialog.open(TranscationDetailComponent, {
      panelClass: 'custom-dialog-container',
      data: { callback: this.closeReceiptCallBack.bind(this), item },
    });
  }

  //绑定接收DigitalReceiptDialogComponent 关闭后触发
  closeReceiptCallBack(data: any) {
    data.isSelected = false;
  }
}
