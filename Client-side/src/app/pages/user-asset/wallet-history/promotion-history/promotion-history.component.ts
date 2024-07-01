import { Component, OnInit, TemplateRef, ViewChild, WritableSignal, computed, signal } from '@angular/core';
import { MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { BonusApi } from 'src/app/shared/apis/bonus.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { BonusGrantListData, GrantTypeSelect } from 'src/app/shared/interfaces/bonus.interface';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { WalletHistoryService } from '../wallet-history.service';

@UntilDestroy()
@Component({
  selector: 'app-promotion-history',
  templateUrl: './promotion-history.component.html',
  styleUrls: ['./promotion-history.component.scss'],
})
export class PromotionHistoryComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private popup: PopupService,
    private generalService: GeneralService,
    private bonusApi: BonusApi,
    private appService: AppService,
    private localeService: LocaleService,
    public walletHistoryService: WalletHistoryService,
  ) {}

  isH5!: boolean;

  //发放方式
  selectedGrantType: string = '';
  grantTypeSelect: GrantTypeSelect[] = [];
  allGrantType = {
    code: '',
    description: this.localeService.getValue('all'),
  };
  // 币种
  currencies: CurrenciesInterface[] = [];
  selectedCurrency: string = '';

  // 时间菜单
  selectedTime: number[] = this.generalService.getStartEndDateArray('30days');
  selectedTimeValue: string = '30days';
  timeOptions = [
    { name: this.localeService.getValue('past_a_d'), value: '7days' },
    { name: this.localeService.getValue('past_b_d'), value: '30days', default: true },
    { name: this.localeService.getValue('past_c_d'), value: '90days' },
    { name: this.localeService.getValue('past_d_d'), value: 'customize' },
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
  bonusHistoryData: BonusGrantListData[] = [];

  // 选中数据索引与数据
  selectedIndex?: number;
  selectedItem?: any;

  // h5筛选弹窗
  @ViewChild('h5Filter') h5FilterRef!: TemplateRef<any>;
  h5FilterPopup!: MatDialogRef<any>;

  // h5详情弹窗
  @ViewChild('detailData') detailDataRef!: TemplateRef<any>;
  detailDataPopup!: MatDialogRef<any>;

  // 非粘性详情弹窗
  @ViewChild('noneStickyDetails') noneStickyPopupRef!: TemplateRef<Element>;
  noneStickyPopup!: MatDialogRef<Element>;
  noneStickyDetails: WritableSignal<BonusGrantListData | null> = signal(null);
  renderNoneStickyDetails = computed(() => {
    if (this.noneStickyDetails()) return this.noneStickyDetails();
    return null;
  });

  // 免費旋轉詳情
  @ViewChild('freeSpinDetails') freeSpinPopupRef!: TemplateRef<Element>;
  freeSpinPopup!: MatDialogRef<Element>;
  freeSpinDetails: WritableSignal<BonusGrantListData | null> = signal(null);
  renderFreeSpinDetails = computed(() => {
    if (this.freeSpinDetails()) return this.freeSpinDetails();
    return null;
  });

  ngOnInit() {
    // 读取本地币种
    this.appService.currencies$.pipe(untilDestroyed(this)).subscribe(x => {
      this.currencies = x;
    });
    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    // 获取数据
    this.getGrantType();
    this.loadData();
  }

  loadData() {
    this.loading = true;
    const param = {
      startTime: this.selectedTime[0],
      endTime: this.selectedTime[1],
      currency: this.selectedCurrency,
      grantType: this.selectedGrantType,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.bonusApi
      .getBonusGrantList(param)
      .pipe(map(v => v?.data))
      .subscribe(data => {
        this.paginator.total = data?.total || 0;
        this.loading = false;
        if (this.isH5) {
          this.bonusHistoryData.push(...(data?.list || []));
        } else {
          this.bonusHistoryData = data?.list || [];
        }
      });
  }

  searchLoadData() {
    // 筛选下 页码归1 数据清0
    this.paginator.page = 1;
    this.bonusHistoryData = [];
    this.loadData();
  }

  reset() {
    this.selectedGrantType = '';
    this.selectedCurrency = '';
    this.selectedTime = [];
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
  openh5Detail(item: BonusGrantListData) {
    this.selectedItem = item;

    if (item.grantType === 'NonSticky' || item.grantType === 'FreeSpin') {
      this.openWebDetail(item);
      return;
    }

    this.detailDataPopup = this.popup.open(this.detailDataRef, {
      inAnimation: 'fadeInUp',
      outAnimation: 'fadeOutDown',
      position: { bottom: '0px' },
      speed: 'faster',
      autoFocus: false,
    });
  }

  async getGrantType() {
    const result = await firstValueFrom(this.bonusApi.getGrantTypeSelect());
    if (result?.data) {
      this.grantTypeSelect = result.data;
    }
  }

  /**
   * web打开详情
   * 限定非粘性与免费旋转
   *
   * @param item 表格单项
   */
  openWebDetail(item: BonusGrantListData) {
    const popupConfig = {
      inAnimation: 'fadeInUp',
      outAnimation: 'fadeOutDown',
      position: { bottom: this.isH5 ? '0px' : '' },
      speed: 'faster',
      autoFocus: false,
    };
    switch (item.grantType) {
      case 'NonSticky':
        this.noneStickyDetails.set({
          ...item,
          betProgress: Number(item?.betProgress || 0) >= 100 ? 100 : Number(item?.betProgress || 0),
        });
        this.noneStickyPopup = this.popup.open(this.noneStickyPopupRef, popupConfig as MatDialogConfig);
        break;
      case 'FreeSpin':
        this.freeSpinDetails.set(item);
        this.freeSpinPopup = this.popup.open(this.freeSpinPopupRef, popupConfig as MatDialogConfig);
        break;
      default:
        break;
    }
  }
}
