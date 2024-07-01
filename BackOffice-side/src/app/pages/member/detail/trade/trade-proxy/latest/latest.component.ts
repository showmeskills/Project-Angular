import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MemberService } from 'src/app/pages/member/member.service';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ActivatedRoute } from '@angular/router';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { SelectApi } from 'src/app/shared/api/select.api';
import moment from 'moment';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'latest',
  templateUrl: './latest.component.html',
  styleUrls: ['./latest.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    CurrencyIconDirective,
    NgIf,
    LabelComponent,
    WinDirective,
    WinColorDirective,
    EmptyComponent,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class LatestComponent implements OnInit {
  constructor(
    private appService: AppService,
    private api: AgentApi,
    private selectApi: SelectApi,
    private memberService: MemberService,
    private route: ActivatedRoute
  ) {}

  uid;
  tenantId;
  pageSizes: number[] = [10, ...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(1, 10); // 分页
  isLoading = false; // 是否加载中
  list: any[] = []; // 表格列表数据

  siteList: any[] = []; // 场馆列表
  statusList = [
    { name: '全部', value: '', lang: 'common.all' },
    { name: '未结算', value: 0, lang: 'game.unsettle' },
    { name: '已结算', value: 1, lang: 'game.settled' },
  ]; // 状态列表

  EMPTY_DATA = {
    uid: '',
    site: '', // 场馆
    status: '',
    betDate: [moment().subtract(1, 'weeks').toDate(), new Date()], // 投注日期
  };

  data = { ...this.EMPTY_DATA };

  ngOnInit(): void {
    const { uid, tenantId } = this.route.snapshot.queryParams;
    this.uid = uid;
    this.tenantId = tenantId;

    this.selectApi.getProviderSelect(this.tenantId).subscribe((res) => {
      this.siteList = res;

      uid && this.loadData();
    });
  }

  /**
   * 加载数据
   * @param resetPage
   */
  loadData(resetPage = false): void {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);

    this.loading(true);
    this.api
      .getGameRecord({
        proxyId: this.uid,
        uid: this.data.uid,
        betBeginTime: toDateStamp(this.data.betDate[0], false),
        betEndTime: toDateStamp(this.data.betDate[1], true),
        providerCode: this.data.site,
        status: this.data.status === '' ? undefined : +this.data.status,
        page: this.paginator.page,
        pageSize: this.paginator.pageSize,
      })
      .subscribe((data) => {
        this.loading(false);

        this.list = data?.data?.list || [];
        this.paginator.total = data?.data.total;
      });
  }

  /**
   * 加载状态
   * @param v
   */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onReset() {
    this.data = { ...this.EMPTY_DATA };
    this.loadData(true);
  }
}
