import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { CustomizedTimeDialogComponent } from '../customized-time-dialog/customized-time-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-exchange-history',
  templateUrl: './exchange-history.component.html',
  styleUrls: ['./exchange-history.component.scss'],
})
export class ExchangeHistoryComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private layout: LayoutService,
    private popup: PopupService,
    private appService: AppService,
    private localeService: LocaleService
  ) {}

  isH5!: boolean;

  originalCoinMenu = false;
  coinTypeMenu = false;
  openTimeMenu = false;
  selectedOriginalCoin = 'USDT';
  selectedTime = this.localeService.getValue('past_b_d');
  selectedCoinType = this.localeService.getValue('all');

  // 原始币种数据
  originalCoinOptions = [
    { name: 'USDT', active: true, value: 'usdt' },
    { name: 'BTC', active: false, value: 'btc' },
  ];

  //搜索时间数据
  timeOptions = [
    { name: this.localeService.getValue('past_a_d'), active: true, value: 'week' },
    { name: this.localeService.getValue('past_b_d'), active: false, value: '30days' },
    { name: this.localeService.getValue('past_c_d'), active: false, value: '90days' },
    { name: this.localeService.getValue('past_d_d'), active: false, value: 'customize' },
  ];

  exchangeData = [
    {
      date: 1645083838540,
      currency: 'CNY',
      orderNum: 'D257714735181957',
      amount: 1000,
      successAmount: 1000,
      status: 'Success',
      original: 'TRX',
      coin: 'CNY',
    },
    {
      date: 1645083838540,
      currency: 'CNY',
      orderNum: 'D257714735181957',
      amount: 1000,
      successAmount: 1000,
      status: 'Fail',
      original: 'TRX',
      coin: 'CNY',
    },
    {
      date: 1645083838540,
      currency: 'CNY',
      orderNum: 'D257714735181957',
      amount: 1000,
      successAmount: 1000,
      status: 'xxxxx',
      original: 'TRX',
      coin: 'CNY',
    },
  ];
  currencies: any[] = [];
  // 选中的数据
  selectedItem?: any;

  // h5详情弹窗
  @ViewChild('detailData') detailDataRef!: TemplateRef<any>;
  detailDataPopup!: MatDialogRef<any>;

  ngOnInit() {
    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    // 读取本地币种
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
      this.currencies = x;
    });
  }

  /**
   * 点击资产菜单
   */
  showAssetsOptions() {
    this.originalCoinMenu = !this.originalCoinMenu;
  }

  /**
   * 选择资产选项
   *
   * @param item
   */
  originalCoinClick(item: any) {
    this.originalCoinOptions.forEach(x => (x.active = false));
    item.active = true;
    this.selectedOriginalCoin = item.name;
    this.originalCoinMenu = false;
  }

  /**
   * 点击币种菜单
   */
  showCoinMenu() {
    this.coinTypeMenu = !this.coinTypeMenu;
  }

  /**
   * 点击范围菜单
   */
  showTimeOptions() {
    this.openTimeMenu = !this.openTimeMenu;
  }

  /**
   * 点击范围选项
   *
   * @param item
   */
  timeClick(item: any) {
    this.timeOptions.forEach(x => (x.active = false));
    item.active = true;
    this.selectedTime = item.name;
    this.openTimeMenu = false;
    if (item.value === 'customize') {
      this.dialog.open(CustomizedTimeDialogComponent);
    }
  }

  /**
   * 选择币种下拉框选项
   *
   * @param item
   */
  coinTypeClick(item: any) {}

  closeAddDialogCallBack(callback: any) {}

  getStatusTemplate(status: string) {
    const statusList = new Map([
      ['Success', { text: this.localeService.getValue('exch_succe00'), calss: 'success' }],
      ['Fail', { text: this.localeService.getValue('exch_fail00'), calss: 'fail' }],
      ['default', { text: this.localeService.getValue('waitings'), calss: 'awit' }],
    ]);
    return statusList.get(status) || statusList.get('default');
  }

  //H5 搜索页
  // handleFilter() {
  //   this.dialog.open(HistoryMobileFilterComponent, { //废弃
  //     panelClass: 'single-page-dialog-container',
  //     data: { callback: this.closeAddDialogCallBack.bind(this) }
  //   });
  // }

  // 打开h5详情弹窗
  openh5Detail(item: any) {
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
