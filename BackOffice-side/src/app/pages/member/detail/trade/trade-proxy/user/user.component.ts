import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, NgIf } from '@angular/common';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'user-manager',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgFor,
    CurrencyIconDirective,
    WinDirective,
    WinColorDirective,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    EmptyComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgIf,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class UserComponent implements OnInit {
  constructor(
    private appService: AppService,
    private api: AgentApi,
    private route: ActivatedRoute
  ) {}

  EMPTY_DATA = {
    subUID: '', // 下级UID
    statisticsDate: [moment().subtract(1, 'months').toDate(), new Date()], // 统计日期
    registryDate: [], // 注册日期
  };

  uid;
  tenantId;
  data = { ...this.EMPTY_DATA };
  list: any[] = [];

  loading = false;
  pageSizes: number[] = [10, ...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(1, 10); // 分页

  ngOnInit(): void {
    const { uid, tenantId } = this.route.snapshot.queryParams;
    this.uid = uid;
    this.tenantId = tenantId;
    this.uid && this.loadData();
  }

  /** methods */
  /**
   * 加载数据
   * @description: 加载数据
   * @param resetPage
   */
  loadData(resetPage = false) {
    if (this.loading) return;

    resetPage && (this.paginator.page = 1);

    this.setLoading(true);
    this.api
      .getMemberManagerList({
        uid: this.data.subUID || undefined,
        beginTime: toDateStamp(this.data.statisticsDate[0]),
        endTime: toDateStamp(this.data.statisticsDate[1], true),
        registerBeginTime: toDateStamp(this.data.registryDate[0]),
        registerEndTime: toDateStamp(this.data.registryDate[1], true),
        page: this.paginator.page,
        pageSize: this.paginator.pageSize,
        proxyId: this.uid,
      })
      .subscribe((res) => {
        this.setLoading(false);
        this.list = res?.data?.list || [];
        this.paginator.total = res?.data?.total || 0;
      });
  }

  setLoading(v: boolean): void {
    this.loading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.data = { ...this.EMPTY_DATA };
    this.loadData(true);
  }
}
