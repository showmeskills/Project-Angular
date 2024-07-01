import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { GameApi } from 'src/app/shared/api/game.api';
import { MemberApi } from 'src/app/shared/api/member.api';
import { getTime, toDateStamp } from 'src/app/shared/models/tools.model';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf, KeyValuePipe, NgSwitch, NgSwitchCase } from '@angular/common';
import { LabelComponent } from 'src/app/shared/components/label/label.component';

@Component({
  selector: 'app-trade-balance',
  templateUrl: './trade-balance.component.html',
  styleUrls: ['./trade-balance.component.scss'],
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
    CurrencyIconDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    KeyValuePipe,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    NgSwitch,
    NgSwitchCase,
    LabelComponent,
  ],
})
export class TradeBalanceComponent implements OnInit {
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  constructor(
    private appService: AppService,
    private api: MemberApi,
    private route: ActivatedRoute,
    private gameApi: GameApi
  ) {}

  isLoading = false;

  uid!: string;
  tenantId!: string;

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
  contentList: any = [];
  transactionList: any = [];

  ngOnInit() {
    this.route.queryParams.pipe().subscribe((v: any) => {
      this.uid = v.uid;
      this.tenantId = v.tenantId;
      if (this.uid != undefined && this.tenantId != undefined) this.loadData();
    });
  }

  loadData() {
    // 余额统计
    this.onSelectTimeMenu(this.selectedTimeValue);
    // 交易列表
    this.api.getTransferTypeSelect().subscribe((transferType) => {
      this.contentList = transferType || [];
    });
    // 交易详情 - 页面数据
    // this.paginator.pageSize = 10;
    this.getTransferHistoryList();
  }

  onSelectTimeMenu(value: any) {
    this.time = [];
    this.selectedTimeValue = value;
    // 余额统计
    this.getWagerstatList();
  }

  // 余额统计
  getWagerstatList() {
    this.loading(true);
    const param = {
      TenantId: this.tenantId,
      Uid: this.uid,
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

  // 交易详情
  getTransferHistoryList() {
    this.loading(true);
    const param = {
      TenantId: this.tenantId,
      Uid: this.uid, // UID
      IsQueryAll: true,
      // TransactionId: this.oddNum,  // 交易单号
      // ProviderId: this.selectedManuValue,  // 游戏厂商
      // TransferType: this.selectedContentValue, // 交易内容
      // ...this.detialTime[0] ? { StartTime: +this.detialTime[0] } : {},
      // ...this.detialTime[1] ? { EndTime: +this.detialTime[1] } : {},
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.api.getTransferHistoryList(param).subscribe((res) => {
      this.loading(false);
      this.transactionList = res.list;
      this.paginator.total = res.total;
    });
  }

  endTimeChange() {
    this.selectedTimeValue = '';
    this.getWagerstatList();
  }

  getTransferType(type: any) {
    return this.contentList.find((v) => v.transferType === type)['categoryDescription'] || '-';
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
