import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { AppService } from 'src/app/app.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'alliance',
  templateUrl: './alliance.component.html',
  styleUrls: ['./alliance.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class AllianceComponent implements OnInit, OnDestroy {
  constructor(
    private api: AgentApi,
    private subHeader: SubHeaderService,
    private proxyService: ProxyService,
    private appService: AppService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false; // 是否加载中
  list: any[] = []; // 表格列表数据

  curTab = 0;
  _destroy$ = new Subject<void>();

  /** lifeCycle */
  ngOnInit(): void {
    // this.paginator.pageSize = 10;

    this.appService.isContentLoadingSubject.next(true);
    this.proxyService.value$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
      this.loadData(true);
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  loadData(resetPage = false): void {
    resetPage && (this.paginator.page = 1);
    this.appService.isContentLoadingSubject.next(true);
    this.api[this.curTab ? 'dashboard_invite_top' : 'dashboardAllianceRank']({
      beginDate: this.proxyService.rangeMonth[0],
      endDate: this.proxyService.rangeMonth[1],
      current: this.paginator.page,
      size: this.paginator.pageSize,
      team: this.proxyService.curTeamId,
      tenantId: this.subHeader.merchantCurrentId,
    }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.list = res?.data?.records || [];
      this.paginator.total = res?.data?.total || 0;
    });
  }

  onChangeTab(tab: number) {
    this.curTab = tab;
    this.loadData(true);
  }
}
