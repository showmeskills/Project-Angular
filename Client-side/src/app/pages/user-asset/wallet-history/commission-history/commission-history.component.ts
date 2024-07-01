import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { WalletApi } from 'src/app/shared/apis/wallet.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { Commissionhistory, ReturnTypeSelect } from 'src/app/shared/interfaces/wallet.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';

@UntilDestroy()
@Component({
  selector: 'app-commission-history',
  templateUrl: './commission-history.component.html',
  styleUrls: ['./commission-history.component.scss'],
})
export class CommissionHistoryComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private popup: PopupService,
    private generalService: GeneralService,
    private walletApi: WalletApi,
    private localeService: LocaleService
  ) {}

  isH5!: boolean;

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
  loading: boolean = true;

  // h5筛选弹窗
  @ViewChild('h5Filter') h5FilterRef!: TemplateRef<any>;
  h5FilterPopup!: MatDialogRef<any>;

  commissionList: Commissionhistory[] = []; //返回佣金数据
  returnTypeList: ReturnTypeSelect[] = []; //返回佣金类型
  returnType: string = '';

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.walletApi.getReturnTypeSelect().subscribe(res => {
      if (res.success && res?.data) {
        this.returnTypeList = [{ code: '', description: this.localeService.getValue('all') }, ...res.data];
        this.loadData();
      }
    });
  }

  /**读取佣金数据 */
  loadData() {
    this.loading = true;
    const params = {
      returnType: this.returnType,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      startTime: this.selectedTime[0],
      endTime: this.selectedTime[1],
    };
    this.walletApi.getCommissionHistory(params).subscribe(res => {
      this.loading = false;
      if (res?.data) {
        this.paginator.total = res.data.total;
        if (this.isH5) {
          this.commissionList.push(...(res.data.list as any));
        } else {
          this.commissionList = res.data.list;
        }
      }
    });
  }

  onSearch() {
    this.paginator.page = 1;
    this.paginator.total = 0;
    this.commissionList = [];
    this.loadData();
  }

  /**重置 */
  reset() {
    this.paginator.page = 1;
    this.paginator.total = 0;
    this.returnType = '';
    this.commissionList = [];
    this.selectedTime = [];
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
}
