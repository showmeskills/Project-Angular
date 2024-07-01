import { Component, OnDestroy, OnInit } from '@angular/core';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { AppService } from 'src/app/app.service';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'manager-rank',
  templateUrl: './manager-rank.component.html',
  styleUrls: ['./manager-rank.component.scss'],
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, FormsModule, NgFor, MatOptionModule, LangPipe],
})
export class ManagerRankComponent implements OnInit, OnDestroy {
  constructor(
    private api: AgentApi,
    private appService: AppService,
    private subHeader: SubHeaderService,
    private proxyService: ProxyService
  ) {}

  _destroy$ = new Subject<void>();
  curType = 1;
  typeList: any[] = [
    // 1:贡献 2:活跃 3:交易量
    { value: 1, label: '贡献', lang: 'dashboard.info.contribute' },
    { value: 2, label: '活跃', lang: 'dashboard.info.active' },
    { value: 3, label: '交易量', lang: 'dashboard.info.tradingVolume' },
  ];

  list: any[] = [];

  /** lifeCycle */
  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.proxyService.value$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
      this.getData(true);
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  getData(reset = false) {
    if (reset) {
      this.curType = 1;
    }

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .dashboardManagerRank({
        beginDate: this.proxyService.rangeMonth[0],
        endDate: this.proxyService.rangeMonth[1],
        team: this.proxyService.curTeamId,
        tenantId: this.subHeader.merchantCurrentId,
        type: this.curType,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.list = res?.data || [];
      });
  }
}
