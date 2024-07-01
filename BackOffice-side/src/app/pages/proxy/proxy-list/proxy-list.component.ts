import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { ProxyTransferComponent } from 'src/app/pages/proxy/proxy-list/proxy-transfer/proxy-transfer.component';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { AppService } from 'src/app/app.service';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { lastValueFrom, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import {
  SelectChildrenDirective,
  SelectDirective,
  SelectGroupDirective,
  SelectTplDirective,
} from 'src/app/shared/directive/select.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { MatOptionModule } from '@angular/material/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SubHeaderDirective } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.directive';

@Component({
  selector: 'proxy-list',
  templateUrl: './proxy-list.component.html',
  styleUrls: ['./proxy-list.component.scss'],
  standalone: true,
  imports: [
    SubHeaderDirective,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    NgFor,
    MatOptionModule,
    FormRowComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    SelectChildrenDirective,
    SelectTplDirective,
    NgIf,
    SelectGroupDirective,
    SelectDirective,
    WinDirective,
    WinColorDirective,
    AngularSvgIconModule,
    PaginatorComponent,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    AsyncPipe,
  ],
})
export class ProxyListComponent implements OnInit, OnDestroy {
  constructor(
    private modal: MatModal,
    private api: AgentApi,
    public appService: AppService,
    public proxyService: ProxyService,
    public lang: LangService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = [];
  detail: any = {};
  isLoading = false;
  data: any = {};
  defaultData: object = {
    team: '',
    channelManager: '',
    proxyId: '',
    isDaily: 0,
    sateType: 0, // 代理状态（0活跃，1非活，2负值）
    applyTimeBeginTime: undefined,
  };

  private _destroy$ = new Subject<void>();

  /** getters */
  get checkItems(): any[] {
    return this.list.filter((e) => e.checked);
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.proxyService.value$.pipe(takeUntil(this._destroy$)).subscribe(() => this.onReset());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  onReset(): void {
    this.data = { ...this.defaultData };
    this.loadData(true);
  }

  // 获取数据
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    if (!this.proxyService.curTeamId) {
      this.list = [];
      this.paginator.total = 0;

      return;
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .agentList({
        ...this.data,
        tenantId: this.proxyService.curTenantId,
        current: this.paginator.page,
        size: this.paginator.pageSize,
        team: this.proxyService.curTeamId,
        applyTimeBeginTime: toDateStamp(this.data.applyTimeBeginTime?.[0]),
        applyTimeEndTime: toDateStamp(this.data.applyTimeBeginTime?.[1], true),
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.detail = res?.data;
        this.list = this.detail?.records || [];
        this.paginator.total = this.detail?.total || 0;
      });
  }

  async openTransfer(item?: any): Promise<void> {
    const list = item ? [item] : this.checkItems;

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'marketing.list.selectAgentTransfer' });
    const modal = this.modal.open(ProxyTransferComponent, { minWidth: 1080, maxWidth: 1280 });
    modal.componentInstance.list = item ? [item] : this.checkItems;

    if (!(await lastValueFrom(modal.afterClosed()))) return;
    this.loadData();
  }

  // 代理类型切换
  onType(number: number) {
    this.data.sateType = number;
    this.loadData(true);
  }

  toInt(state: any) {
    return Math.abs(state);
  }

  onSwitchUSDTCommission(item: any) {
    this.appService.isContentLoadingSubject.next(true);
    this.api.details_updateusdt(+item.usdtStatus, item.proxyId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      const successed = res?.data === true;
      const msgLang = successed ? 'common.operationSuccess' : 'common.operationFailed';

      this.appService.showToastSubject.next({ msgLang, successed });
      this.loadData();
    });
  }
}
