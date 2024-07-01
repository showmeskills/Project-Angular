import { RiskApi } from 'src/app/shared/api/risk.api';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { cloneDeep } from 'lodash';
import { takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { DestroyService, toDateStamp } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Router } from '@angular/router';
import moment from 'moment';

@Component({
  selector: 'ip-monitoring',
  templateUrl: './ip-monitoring.component.html',
  styleUrls: ['./ip-monitoring.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    LoadingDirective,
    LabelComponent,
    AngularSvgIconModule,
  ],
})
export class IpMonitoringComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    public appService: AppService,
    private riskApi: RiskApi,
    public router: Router
  ) {}

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 获取详情loading */
  detailLoading = false;

  dataEmpty = {
    ip: '',
    uid: '', // UID
    time: [moment().subtract(3, 'day').add(1, 'days').toDate(), new Date()] as Date[], // 时间
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list = [];

  ngOnInit() {
    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onReset();
    });
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      uid: this.data.uid,
      ip: this.data.ip,
      startTime: moment(Number(toDateStamp(this.data.time[0]))).format('YYYY-MM-DD'),
      endTime: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD'),
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.riskApi.getiplist(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.list = Array.isArray(res?.list) ? res.list : [];
      this.paginator.total = res?.total || 0;
    });
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  onDetail(item) {
    this.router.navigate(['risk/ip-monitoring-query'], {
      queryParams: {
        ip: item.createIp,
        date: item.date,
        tenantId: this.subHeaderService.merchantCurrentId,
      },
    });
  }
}
