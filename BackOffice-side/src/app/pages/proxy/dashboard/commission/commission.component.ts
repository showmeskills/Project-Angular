import { Component, OnDestroy, OnInit } from '@angular/core';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { AppService } from 'src/app/app.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { toDateStamp13Pad } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { NgFor } from '@angular/common';

@Component({
  selector: 'commission',
  templateUrl: './commission.component.html',
  styleUrls: ['./commission.component.scss'],
  standalone: true,
  imports: [NgFor, CurrencyValuePipe, LangPipe],
})
export class CommissionComponent implements OnInit, OnDestroy {
  constructor(
    private api: AgentApi,
    private subHeader: SubHeaderService,
    private proxyService: ProxyService,
    private appService: AppService,
    public lang: LangService
  ) {}

  isLoading = false; // 是否加载中
  list: any[] = []; // 表格列表数据
  infoData: any = {}; // info数据
  _destroy$ = new Subject<void>();
  year: string | undefined = '';
  month: string | undefined = '';
  /** lifeCycle */
  async ngOnInit() {
    this.year = await this.lang.getOne('common.year');
    this.month = await this.lang.getOne('common.month');
    this.proxyService.value$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.loading(true);
      this.api
        .dashBoard_month_proxy({
          team: this.proxyService.curTeamId,
          tenantId: this.subHeader.merchantCurrentId,
          beginDate: this.proxyService.rangeMonth[0],
          endDate: this.proxyService.rangeMonth[1],
          current: 1,
          size: 4, // 显示4条
        })
        .subscribe((res) => {
          this.loading(false);
          this.list = (res?.data?.records || []).map((e) => ({
            ...e,
            date: toDateStamp13Pad(e.date),
          }));
        });
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 时间多语言
  formatDate(timestamp) {
    const date = new Date(timestamp); // 创建 Date 对象
    const year = date.getFullYear(); // 获取年份
    const month = date.getMonth() + 1; // 获取月份（注意：月份从 0 开始计数，因此需要加 1）
    return `${year}${this.year}${month}${this.month}`;
  }
}
