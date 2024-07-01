import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from 'src/app/shared/interfaces/chart-option';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Router } from '@angular/router';
import { combineLatestWith, forkJoin, Subject } from 'rxjs';
import { KycApi } from 'src/app/shared/api/kyc.api';
import { AppService } from 'src/app/app.service';
import { takeUntil } from 'rxjs/operators';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import moment from 'moment';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { KYCProcessItem } from 'src/app/shared/interfaces/kyc';
import { KycService } from 'src/app/pages/kyc/kyc.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import {
  jumioChatOptions,
  kycGraphOptions,
  tencentYunHuiChatOptions,
  tianYanChaOptions,
} from 'src/app/pages/kyc/kyc-graph/kyc-graph-option';
import { cloneDeep } from 'lodash';
import { ApexOptions } from 'ng-apexcharts/lib/model/apex-types';

import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TooltipDirective } from 'src/app/shared/directive/tooltip.directive';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProgressComponent } from 'src/app/shared/components/progress/progress.component';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { SubHeaderDirective } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';

@Component({
  templateUrl: './kyc-graph.component.html',
  styleUrls: ['./kyc-graph.component.scss'],
  providers: [DatePipe],
  standalone: true,
  imports: [
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    ProgressComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    NgApexchartsModule,
    TooltipDirective,
    NgIf,
    AngularSvgIconModule,
    LabelComponent,
    PaginatorComponent,
    LangPipe,
    LoadingDirective,
    SubHeaderDirective,
    FormRowComponent,
    EmptyComponent,
    TimeFormatPipe,
  ],
})
export class KycGraphComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(
    public router: Router,
    private api: KycApi,
    private appService: AppService,
    public subHeaderService: SubHeaderService,
    public lang: LangService,
    public kycService: KycService,
    public ls: LocalStorageService
  ) {
    this.lineChartOptions = cloneDeep(kycGraphOptions);
    this.ttyChartOptions = cloneDeep(tianYanChaOptions);
    this.circleChartOptions = cloneDeep(jumioChatOptions);
    this.tencentChartOptions = cloneDeep(tencentYunHuiChatOptions);
  }

  @ViewChild('chart') chart;
  @ViewChild('ttyChart') ttyChart;
  @ViewChild('cirChart') cirChart;
  @ViewChild('tencentChart') tencentChart;
  public lineChartOptions: Partial<ApexOptions> | any;
  public ttyChartOptions: Partial<ChartOptions> | any;
  public circleChartOptions: Partial<ChartOptions> | any;
  public tencentChartOptions: Partial<ChartOptions> | any;
  // 下拉列表
  statusList: any[] = [
    { code: 0, name: 'member.kyc.basis' },
    { code: 1, name: 'member.kyc.middle' },
    { code: 2, name: 'member.kyc.adv' },
    { code: 3, name: 'member.kyc.vivoAuthentication' },
    { code: 4, name: 'member.kyc.depositHistory' },
    { code: 5, name: 'member.kyc.proSource' },
  ];

  // 下拉列表选中
  listStatus: any = 0;
  // 认证记录列表
  list: KYCProcessItem[] = [];
  pageSizes: number[] = [6, ...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;
  time: any[] = []; // 时间区间
  _destroy$ = new Subject<void>();
  reporAllcountList: any = {};
  reportCountrysumList: any[] = [];
  reportSucceedcountList: any[] = [];
  reportCallthirdList: any = {};

  ngOnInit() {}

  ngAfterViewInit() {
    this.subHeaderService.merchantId$
      .pipe(combineLatestWith(this.kycService.curRegion$), takeUntil(this._destroy$))
      .subscribe(() => this.loadData());
  }

  async initLabels() {
    const fail = await this.lang.getOne('common.fail');
    const success = await this.lang.getOne('common.success');
    const underReview = await this.lang.getOne('member.kyc.underReview');
    this.circleChartOptions.labels = [fail, success, underReview];
    this.ttyChartOptions.labels = [fail, success, underReview];
    const name = await this.lang.getOne('member.kyc.todaySuccessPeople');
    this.chart && this.chart?.updateSeries([{ name }]);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  // ngAfterViewInit() {}
  loadData() {
    if (this.isLoading) return;

    // 没有商户
    if (!this.subHeaderService.merchantCurrentId) return;
    this.loading(true);
    //取到商户id并转换类型
    const params = this.getParams();

    forkJoin([
      this.api.postReportAllcount(params), //所有认证分析
      this.api.postReportCountrysum(params), //国家分析
      this.api.postReportCallthird(params), //第三方调用统计
    ]).subscribe(([reporAllcountList, reportCountrysumList, reportCallthirdList]) => {
      this.loading(false);
      this.reporAllcountList = reporAllcountList;
      this.reportCountrysumList = reportCountrysumList;
      this.reportCallthirdList = reportCallthirdList || {};

      // Jumio计算百分比
      let jumioFailRate = Number(this.reportCallthirdList.jumioFailRate?.slice(0, -1) || 0);
      let jumioSuccessRate = Number(this.reportCallthirdList.jumioSuccessRate?.slice(0, -1) || 0);
      let jumioAuditRate = 0;
      if (jumioFailRate === 0 && jumioSuccessRate === 0) {
        jumioAuditRate = 0;
      } else {
        jumioAuditRate = 100 - jumioFailRate - jumioSuccessRate;
      }

      // 天眼查计算百分比
      let ttyFailRate = Number(this.reportCallthirdList.ttyFailRate?.slice(0, -1) || 0);
      let ttySuccessRate = Number(this.reportCallthirdList.ttySuccessRate?.slice(0, -1) || 0);
      let ttyAuditRate = 0;
      if (ttyFailRate === 0 && ttySuccessRate === 0) {
        ttyAuditRate = 0;
      } else {
        ttyAuditRate = 100 - ttyFailRate - ttySuccessRate;
      }

      // 腾讯云慧计算百分比
      let tencentFailRate = Number(this.reportCallthirdList.tencentFailRate?.slice(0, -1) || 0);
      let tencentSuccessRate = Number(this.reportCallthirdList.tencentSuccessRate?.slice(0, -1) || 0);
      let tencentAuditRate = 0;
      if (tencentFailRate === 0 && tencentSuccessRate === 0) {
        tencentAuditRate = 0;
      } else {
        tencentAuditRate = 100 - tencentFailRate - tencentSuccessRate;
      }

      this.initLabels();
      this.ttyChart?.updateSeries([ttyFailRate, ttySuccessRate, ttyAuditRate]);
      this.cirChart?.updateSeries([jumioFailRate, jumioSuccessRate, jumioAuditRate]);
      this.tencentChart?.updateSeries([tencentFailRate, tencentSuccessRate, tencentAuditRate]);

      this.onreportSucceedcountList({ ...params, kycType: this.listStatus });
      //分页加入特殊数6
      this.paginator.pageSize = 6;
      this.onList();
    });
  }

  onList() {
    this.loading(true);
    const params = {
      size: this.paginator.pageSize,
      page: this.paginator.page,
    };
    this.api.postProcessNormal(params).subscribe((res) => {
      this.loading(false);
      this.list = res?.pageData || [];
      //根据时间排序
      this.list = this.list.sort((a, b) => {
        return a.createTime < b.createTime ? 1 : -1;
      });
      this.paginator.total = res.rowCount;
    });
  }

  onreportSucceedcountList(params) {
    //成功认证分析
    this.loading(true);
    this.api.postReportSucceedcount(params).subscribe((res) => {
      this.reportSucceedcountList = [];
      this.loading(false);
      if (res[0]?.daytime.length === 13) {
        for (const item in res) {
          this.reportSucceedcountList.push([this.toDateNumber(res[item].daytime + ':00:00'), res[item].num]);
        }
      } else {
        for (const item in res) {
          this.reportSucceedcountList.push([this.toDateNumber(res[item].daytime + ' 00:00:00'), res[item].num]);
        }
      }
      this.chart &&
        this.chart?.updateSeries([
          {
            data: this.reportSucceedcountList,
          },
        ]);
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  onPageChange(): void {
    const paramSucceedcount = {
      ...this.getParams(),
      kycType: this.listStatus,
    };
    this.onreportSucceedcountList(paramSucceedcount);
  }

  onReset() {
    this.time = [];
  }

  getParams(): { createTimeStart?: number; createTimeEnd?: number } {
    const params: { createTimeStart?: number; createTimeEnd?: number } = {};

    // 开始时间
    if (this.time[0]) {
      params.createTimeStart = toDateStamp(this.time[0], false);
    }

    // 结束时间
    if (this.time[1]) {
      params.createTimeEnd = toDateStamp(this.time[1], true);
    }

    return params;
  }

  //字符串转时间戳
  toDateNumber(time): number | undefined {
    return time && moment(time).valueOf();
  }

  //计算进度条
  toDate(num: number, total: number) {
    if (isNaN(num) || isNaN(total)) {
      return 0;
    }
    return total <= 0 ? 0 : Math.round((num / total) * 100);
    //成功数num 总数total
  }

  onTime() {
    if (this.time && this.time[0] && this.time[1]) {
      this.loadData();
    }
  }

  /** 进入配置管理 */
  onOption() {
    this.router.navigate(['/kyc/count/option'], {
      queryParams: { tenantId: this.subHeaderService.merchantCurrentId, region: this.kycService.curRegion },
    });
  }
}
