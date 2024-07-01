import { Component, OnInit } from '@angular/core';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { MemberApi } from 'src/app/shared/api/member.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { getTime, toDateStamp } from 'src/app/shared/models/tools.model';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, KeyValuePipe } from '@angular/common';
import { LabelComponent } from 'src/app/shared/components/label/label.component';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    FormRowComponent,
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    WinDirective,
    WinColorDirective,
    NgIf,
    InputTrimDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    CurrencyIconDirective,
    NgSwitch,
    NgSwitchCase,
    PaginatorComponent,
    KeyValuePipe,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    LabelComponent,
  ],
})
export class TransferComponent implements OnInit {
  _destroyed: any = new Subject<void>(); // 订阅商户的流

  pageSizes: number[] = [...PageSizes, 2e3, 3e3, 5e3]; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页

  constructor(
    private appService: AppService,
    public subHeaderService: SubHeaderService,
    private api: MemberApi,
    private gameApi: GameApi
  ) {}

  isLoading = false;

  // 余额统计 筛选
  timeMenuList: any = [
    { title: 'common.sameDay', value: '1D' },
    { title: 'common.lastSevenDays', value: '7D' },
    { title: 'common.lastThirtyDays', value: '1M' },
  ];

  selectedTimeValue: any = '1D';

  time: Date[] = [];

  balanceData: any = [];

  // 交易详情 筛选
  detialTime: Date[] = [];
  uid: any = '';
  oddNum: any = '';

  manuList: any = [];
  selectedManuValue: any = '';

  contentList: any = [];
  selectedContentValue: any = '';

  transactionList: any = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed)).subscribe(() => {
      if (!this.subHeaderService.merchantCurrentId) return;
      this.loadData();
    });
  }

  loadData() {
    // 余额统计
    this.onSelectTimeMenu(this.selectedTimeValue);

    forkJoin([
      this.gameApi.getTransferProviderSelect(this.subHeaderService.merchantCurrentId), // 交易详情 - 游戏厂商
      this.api.getTransferTypeSelect(), // 交易详情 - 交易内容
    ]).subscribe(([gameList, transferType]) => {
      this.manuList = gameList || [];
      this.contentList = transferType || [];

      // 交易详情 - 页面数据
      // this.paginator.pageSize = 10;
      this.getTransferHistoryList(true);
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 余额统计
  getWagerstatList() {
    this.loading(true);
    const param = {
      TenantId: this.subHeaderService.merchantCurrentId,
      ...(this.time[0]
        ? { StartTime: toDateStamp(this.time[0], false) }
        : { StartTime: getTime(this.selectedTimeValue)[0] }),
      ...(this.time[1]
        ? { EndTime: toDateStamp(this.time[1], true) }
        : { EndTime: getTime(this.selectedTimeValue)[1] }),
    };
    this.api.getWagerstat(param).subscribe((res) => {
      this.loading(false);
      this.balanceData = res || [];
    });
  }

  endTimeChange() {
    this.selectedTimeValue = '';
    this.getWagerstatList();
  }

  onSelectTimeMenu(value: any) {
    this.time = [];
    this.selectedTimeValue = value;

    // 余额统计
    this.getWagerstatList();
  }

  // 交易详情
  getTransferHistoryList(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const param = {
      TenantId: this.subHeaderService.merchantCurrentId,
      Uid: this.uid, // UID
      TransactionId: this.oddNum, // 交易单号
      ProviderId: this.selectedManuValue, // 游戏厂商
      TransferType: this.selectedContentValue, // 交易内容
      ...(this.detialTime[0] ? { StartTime: +this.detialTime[0] } : {}),
      ...(this.detialTime[1] ? { EndTime: +this.detialTime[1] } : {}),
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
      IsQueryAll: true, // herman: 查询全部状态订单
    };
    this.api.getTransferHistoryList(param).subscribe((res) => {
      this.loading(false);
      this.transactionList = res.list || [];
      this.paginator.total = res.total || 0;
    });
  }

  getTransferType(type: any) {
    return this.contentList.find((v) => v.transferType === type)['categoryDescription'] || '-';
  }

  onReset() {
    this.uid = '';
    this.oddNum = '';
    this.selectedManuValue = '';
    this.selectedContentValue = '';
    this.detialTime = [];
  }
}
