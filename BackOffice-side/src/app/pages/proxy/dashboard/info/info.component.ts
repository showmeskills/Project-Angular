import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from 'src/app/shared/interfaces/chart-option';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { AppService } from 'src/app/app.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe, FormatNumberDecimalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { ProgressComponent } from 'src/app/shared/components/progress/progress.component';
import { TooltipDirective } from 'src/app/shared/directive/tooltip.directive';

@Component({
  selector: 'info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
  standalone: true,
  imports: [
    NgApexchartsModule,
    TooltipDirective,
    ProgressComponent,
    FormatMoneyPipe,
    FormatNumberDecimalPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class InfoComponent implements OnInit, OnDestroy {
  constructor(
    private api: AgentApi,
    private subHeader: SubHeaderService,
    private proxyService: ProxyService,
    private appService: AppService
  ) {
    this.chartOptions = {
      series: [
        {
          // name: "Desktops",
          name: undefined,
          data: [
            [Date.now() + 1 * 864e5, 1],
            [Date.now() + 2 * 864e5, 2],
            [Date.now() + 3 * 864e5, 2],
            [Date.now() + 4 * 864e5, 3],
            [Date.now() + 5 * 864e5, 0],
            [Date.now() + 6 * 864e5, 1],
            [Date.now() + 7 * 864e5, 2],
            [Date.now() + 8 * 864e5, 3],
            [Date.now() + 9 * 864e5, 0],
            [Date.now() + 10 * 864e5, 2],
            [Date.now() + 11 * 864e5, 3],
            [Date.now() + 12 * 864e5, 4],
            [Date.now() + 13 * 864e5, 0],
          ],
        },
      ],
      chart: {
        height: 10,
        parentHeightOffset: 0,
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        colors: [''], // 类型string[]
      },
      grid: {
        // 图表边距
        show: false,
        padding: {
          top: -30,
          left: 0,
          right: 0,
          bottom: -15,
        },
      },
      tooltip: {
        enabled: false,
      },
      xAxis: {
        show: false,
        type: 'datetime',
        lines: {
          show: true,
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
          color: '#ffbf00',
        },
        labels: {
          show: false,
        },
      },
      yAxis: {
        y: 0,
        show: false,
      },
      fill: {
        colors: ['#ffbf00'],
        opacity: 1,
        type: 'solid',
      },
    };

    this.barChartOptions = {
      series: [
        {
          name: 'Net Profit',
          data: [44, 55, 57, 56, 61, 58, 63, 40, 66, 36, 18, 8, 40, 66, 36, 18, 8],
        },
      ],
      chart: {
        height: 30,
        parentHeightOffset: 0,
        type: 'bar',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      // stroke: {
      //   curve: "smooth",
      //   colors: [''], // 类型string[]
      // },
      grid: {
        // 图表边距
        show: false,
        padding: {
          top: -30,
          left: 0,
          right: 0,
          bottom: -15,
        },
      },
      tooltip: {
        enabled: false,
      },
      xAxis: {
        show: false,
        categories: [
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Oct',
          'Oct',
          'Oct',
          'Oct',
          'Oct',
          'Oct',
          'Oct',
          'Oct',
          'Oct',
        ],
        lines: {
          show: true,
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
          color: '#ffbf00',
        },
        labels: {
          show: false,
        },
      },
      yAxis: {
        y: 0,
        show: false,
      },
      fill: {
        colors: ['#5891f5'],
        opacity: 1,
      },
    };
  }

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> | any;
  public barChartOptions: Partial<ChartOptions> | any;

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false; // 是否加载中
  list: any[] = []; // 表格列表数据
  infoData: any = {}; // info数据
  amountData: any = {}; // amount数据
  _destroy$ = new Subject<void>();

  /** lifeCycle */
  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    this.proxyService.value$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      zip([
        this.api.dashBoard_info({
          team: this.proxyService.curTeamId,
          tenantId: this.subHeader.merchantCurrentId,
          beginDate: this.proxyService.rangeMonth[0],
          endDate: this.proxyService.rangeMonth[1],
        }),
        this.api.lineamount(this.proxyService.curTeamId),
      ]).subscribe(([res, amount]) => {
        this.appService.isContentLoadingSubject.next(false);
        this.infoData = res?.data || {};
        this.amountData = amount?.data || {};
      });
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
