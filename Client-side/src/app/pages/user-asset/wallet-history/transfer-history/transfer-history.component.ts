import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import {
  GetTransferHistoryInterface,
  TransferHistoryInterface,
  Transferwalletselect,
} from 'src/app/shared/interfaces/history.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { WalletHistoryService } from '../wallet-history.service';

@UntilDestroy()
@Component({
  selector: 'app-transfer-history',
  templateUrl: './transfer-history.component.html',
  styleUrls: ['./transfer-history.component.scss'],
})
export class TransferHistoryComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private layout: LayoutService,
    private popup: PopupService,
    private generalService: GeneralService,
    private historyApi: HistoryApi,
    private appService: AppService,
    private localeService: LocaleService,
    public walletHistoryService: WalletHistoryService
  ) {}

  isH5!: boolean;
  loading: boolean = false;
  transferData: TransferHistoryInterface[] = [];
  selectedFromWallet: string = 'Main';
  selectedToWallet: string = '';
  fromWalletOptions: Transferwalletselect[] = []; // 从钱包数据
  toWalletOptions: Transferwalletselect[] = [];
  allToWalletOption: Transferwalletselect = {
    code: '',
    description: this.localeService.getValue('all'),
  };

  // h5筛选弹窗
  @ViewChild('h5Filter') h5FilterRef!: TemplateRef<any>;
  h5FilterPopup!: MatDialogRef<any>;
  // h5详情弹窗
  @ViewChild('detailData') detailDataRef!: TemplateRef<any>;
  detailDataPopup!: MatDialogRef<any>;
  // 选中的数据
  selectedItem!: TransferHistoryInterface;
  // 状态
  selectedStatus: number = -1;
  statusOptions = [
    { name: this.localeService.getValue('all'), value: -1 },
    { name: this.localeService.getValue('completed'), value: 0 },
    { name: this.localeService.getValue('failed'), value: 1 },
  ];

  // 时间菜单
  selectedTime: number[] = this.generalService.getStartEndDateArray('30days');
  selectedTimeValue: string = '30days';
  timeOptions = [
    { name: this.localeService.getValue('past_a_d'), value: '7days' },
    { name: this.localeService.getValue('past_b_d'), value: '30days', default: true },
    { name: this.localeService.getValue('past_c_d'), value: '90days' },
    { name: this.localeService.getValue('past_d_d'), value: 'customize' },
  ];

  // 币种
  currencies: CurrenciesInterface[] = [];
  selectedCurrency: string = '';

  // 分页
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  async ngOnInit() {
    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    // 读取本地币种
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
      this.currencies = x;
    });
    await this.getWalletOpetions();
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const param: GetTransferHistoryInterface = {
      StartTime: this.selectedTime[0],
      EndTime: this.selectedTime[1],
      Currency: this.selectedCurrency,
      Status: this.selectedStatus,
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
      FromWallet: this.selectedFromWallet ? this.selectedFromWallet : 'Main',
      ToWallet: this.selectedToWallet,
    };
    this.historyApi
      .getTransferHistory(param)
      .pipe(
        map(v => v.data),
        finalize(() => (this.loading = false))
      )
      .subscribe(data => {
        this.paginator.total = data.total;
        if (this.isH5) {
          this.transferData.push(...(data.list as any));
        } else {
          this.transferData = data.list;
        }
      });
  }

  //获取钱包下拉菜单
  async getWalletOpetions() {
    const result = await firstValueFrom(this.historyApi.getTransferSelect());
    if (result) {
      this.fromWalletOptions = this.toWalletOptions = result.data;
      // this.selectedToWallet = this.toWalletOptions[0].code;
    }
  }

  changeFromWallet() {
    if (this.selectedFromWallet !== 'Main') {
      this.selectedToWallet = 'Main';
    } else {
      this.selectedToWallet = this.toWalletOptions[0].code;
    }
  }

  changeToWallet() {
    if (this.selectedToWallet === '') return;
    if (this.selectedToWallet !== 'Main') {
      this.selectedFromWallet = 'Main';
    } else if (this.selectedFromWallet === 'Main') {
      this.selectedFromWallet = this.fromWalletOptions[0].code;
    }
  }

  searchLoadData() {
    // 筛选下 页码归1 数据清0
    this.paginator.page = 1;
    this.transferData = [];
    this.loadData();
  }

  reset() {
    this.selectedFromWallet = '';
    this.selectedToWallet = '';
    this.selectedCurrency = '';
    this.selectedTime = [];
    this.selectedStatus = 0;
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

  /**
   * 从钱包与至钱包互换
   */
  switchWallet() {
    [this.selectedFromWallet, this.selectedToWallet] = [this.selectedToWallet, this.selectedFromWallet];
  }

  getStatusTemplate(status: string) {
    const statusList = new Map([
      ['Success', { text: this.localeService.getValue('succ_tran00'), calss: 'success' }],
      ['Fail', { text: this.localeService.getValue('no_succ_tran00'), calss: 'fail' }],
      ['default', { text: this.localeService.getValue('waitings'), calss: 'awit' }],
    ]);
    return statusList.get(status) || statusList.get('default');
  }

  closeAddDialogCallBack(callback: any) {}

  // 打开h5详情弹窗
  openh5Detail(item: TransferHistoryInterface) {
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
