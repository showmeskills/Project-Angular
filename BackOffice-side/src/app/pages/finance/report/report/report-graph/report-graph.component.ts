import { Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { ChartOptions } from 'src/app/shared/interfaces/chart-option';
import { GraphHeaderRightDirective } from 'src/app/pages/finance/report/report/report-graph/report-graph.directive';
import { merge, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AppService } from 'src/app/app.service';
import { SupplierApi } from 'src/app/shared/api/supplier';
import { toDateStamp } from 'src/app/shared/models/tools.model';
import { ReportDetailService } from 'src/app/pages/finance/report/report.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormsModule } from '@angular/forms';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { TooltipDirective } from 'src/app/shared/directive/tooltip.directive';
import { NgFor, NgIf } from '@angular/common';
import moment from 'moment';
@Component({
  selector: 'report-graph',
  templateUrl: './report-graph.component.html',
  styleUrls: ['./report-graph.component.scss'],
  standalone: true,
  imports: [NgFor, NgApexchartsModule, TooltipDirective, NgIf, EmptyComponent, FormsModule, LangPipe],
})
export class ReportGraphComponent implements OnInit, OnDestroy {
  constructor(
    public appService: AppService,
    private subHeader: SubHeaderService,
    private api: SupplierApi,
    private reportDetail: ReportDetailService,
    private lang: LangService
  ) {
    this.chartOptions = {
      series: [
        {
          name: '输赢',
          data: [],
        },
      ],
      chart: {
        height: 201,
        width: '100%',
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
        curve: 'straight',
      },
      grid: {
        show: true,
        borderColor: '#e4e6ef',
        strokeDashArray: 2,
      },
      xAxis: {
        type: 'datetime',
        lines: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: '#a1a5b7',
          },
          offsetY: -3,
          datetimeUTC: false,
          datetimeFormatter: {
            year: 'yyyy',
            month: 'MM-dd',
            day: 'MM-dd',
            hour: 'HH:mm',
          },
        },
      },
      yAxis: {
        y: 0,
        show: true,
      },
      tooltip: {
        x: {
          format: 'yyyy-MM-dd',
        },
      },
      fill: {
        type: 'gradient',
        opacity: 0.9,
        gradient: {
          // type: 'vertical',
          // shadeIntensity: 0.25,
          // gradientToColors: undefined,
          // inverseColors: true,
          // opacityFrom: 1,
          // opacityTo: 0.2,
          // stops: [25, 80, 100],
          // colorStops: [],
        },
      },
    };
  }

  @Input() category = '';
  @Output() timeChange = new EventEmitter();

  @ViewChild('chart') chart!: ChartComponent;
  @ContentChild(GraphHeaderRightDirective)
  headerRight!: GraphHeaderRightDirective;

  public chartOptions: Partial<ChartOptions> | any;

  private _destroy = new Subject<void>();

  isLoading = false; // 是否加载中
  payoutTrendChart: any = []; // chart数据
  timeMenuList: any = [
    // { title: '当日', value: 0 },
    { title: '近1个月', value: '1M', lang: 'finance.time.nearlyOneM' },
    { title: '近3月', value: '3M', lang: 'finance.time.nearlyThreeM' },
    { title: '近6月', value: '6M', lang: 'finance.time.nearlySixM' },
    { title: '近1年', value: '1Y', lang: 'finance.time.nearlyOneY' },
  ];

  selectedTimeValue: any = '1M';
  startTime?: any;
  endTime?: any;
  curGraphField = 'payoutAmount';
  graphType = [
    { name: '活跃用户', lang: 'finance.graphType.activeCount', field: 'activeCount' },
    { name: '输赢', lang: 'finance.graphType.win', field: 'payoutAmount' },
    { name: '有效流水', lang: 'finance.graphType.flow', field: 'activeFlowAmount' },
  ];

  /** getters */
  /** 当前图表类型 */
  get currentGraphType() {
    return this.graphType.find((e) => e.field === this.curGraphField)!;
  }

  /**
   * 当前图表数组
   */
  get currentGraphData() {
    return this.payoutTrendChart.map((e: any) => e[this.curGraphField]);
  }

  /** lifeCycle */
  ngOnInit(): void {
    merge(this.subHeader.merchantId$, this.reportDetail.confirm)
      .pipe(takeUntil(this._destroy))
      .subscribe(() => this.loadData());
    // this.subHeader.merchantCurrentId && this.loadData();
  }

  loadData() {
    this.onTimeChange();
  }

  // loading处理
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 输赢趋势图获取 数据
   */
  getPayOutTrendChart() {
    this.chart &&
      this.chart?.updateOptions({
        chart: {
          height: 0,
        },
      });
    this.loading(true);
    const params = {
      TenantId: this.subHeader.merchantCurrentId,
      GameCategory: this.category,
      GameProvider: this.reportDetail.data.provider,
      StartTime: this.startTime,
      EndTime: this.endTime,
    };
    this.api.getPayOutTrendChart(params).subscribe((res) => {
      this.loading(false);
      this.payoutTrendChart = res || [];

      this.updateChart();
    });
  }

  /**
   * 时间选择
   */
  onTimeChange() {
    this.startTime = moment(Number(toDateStamp(this.reportDetail.data.tradeChartTime[0], false))).format('YYYY-MM-DD');
    this.endTime = moment(Number(toDateStamp(this.reportDetail.data.tradeChartTime[1], false))).format('YYYY-MM-DD');
    this.getPayOutTrendChart();
  }

  /** lifeCycle */
  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  /**
   * 类型切换
   * @param field
   */
  onType(field: string) {
    this.curGraphField = field;
    this.updateChart();

    // this.getPayOutTrendChart();
  }

  /**
   * 更新图表
   */
  async updateChart() {
    const name = await this.lang.getOne(this.currentGraphType?.lang);

    if (this.payoutTrendChart?.length) {
      this.chart &&
        this.chart?.updateOptions({
          chart: {
            height: 201,
          },
          series: [
            {
              name,
              data: this.payoutTrendChart.map((e) => [e.date, e[this.curGraphField]]),
            },
          ],
        });
    } else {
      this.chart &&
        this.chart?.updateOptions({
          chart: {
            height: 0,
          },
        });
    }
  }
}
