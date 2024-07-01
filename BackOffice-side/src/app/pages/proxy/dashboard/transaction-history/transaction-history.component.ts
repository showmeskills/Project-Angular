import { Component, OnDestroy, OnInit } from '@angular/core';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { AppService } from 'src/app/app.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgSwitch, NgSwitchCase, NgIf } from '@angular/common';

@Component({
  selector: 'transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
  host: {
    class: 'card px-12 py-10',
  },
  standalone: true,
  imports: [
    NgFor,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  constructor(
    private api: AgentApi,
    private subHeader: SubHeaderService,
    private proxyService: ProxyService,
    private appService: AppService,
    private langService: LangService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false; // 是否加载中
  list: any[] = []; // 表格列表数据

  _destroy$ = new Subject<void>();

  /** lifeCycle */
  ngOnInit(): void {
    // this.paginator.pageSize = 10;

    this.proxyService.value$.pipe(takeUntil(this._destroy$)).subscribe(() => {
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

    this.loading(true);
    this.api
      .dashBoard_transaction_history({
        team: this.proxyService.curTeamId,
        tenantId: this.subHeader.merchantCurrentId,
        beginDate: this.proxyService.rangeMonth[0],
        endDate: this.proxyService.rangeMonth[1],
        current: this.paginator.page,
        size: this.paginator.pageSize,
        lang: this.langService.currentLang?.toLowerCase() || 'zh-cn',
      })
      .subscribe((res) => {
        this.loading(false);

        this.list = res?.data?.records || [];
        this.paginator.total = res?.data?.total || 0;
      });
  }

  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
