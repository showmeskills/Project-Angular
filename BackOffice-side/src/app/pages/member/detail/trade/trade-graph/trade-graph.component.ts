import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';

import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { AppService } from 'src/app/app.service';
import { SupplierApi } from 'src/app/shared/api/supplier';
import { ChartOptions } from 'src/app/shared/interfaces/chart-option';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TooltipDirective } from 'src/app/shared/directive/tooltip.directive';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf } from '@angular/common';
@Component({
  selector: 'trade-graph',
  templateUrl: './trade-graph.component.html',
  styleUrls: ['./trade-graph.component.scss'],
  providers: [CurrencyValuePipe],
  standalone: true,
  imports: [
    NgFor,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgApexchartsModule,
    TooltipDirective,
    NgIf,
    AngularSvgIconModule,
    LangPipe,
  ],
})
export class TradeGraphComponent implements OnInit {
  @Input() providerList: any = [];
  @Input() category = '';
  @Input() uid = '';

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> | any;

  constructor(
    private appService: AppService,
    private api: SupplierApi,
    private activatedRoute: ActivatedRoute,
    public lang: LangService,
    private currencyValuePipe: CurrencyValuePipe
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
        curve: 'smooth',
      },
      grid: {
        show: false,
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
        show: false,
      },
      tooltip: {
        x: {
          format: 'MM-dd',
        },
      },
      fill: {
        type: 'area',
        colors: 'red',
      },
    };
  }

  isLoading = false; // 是否加载中

  payoutTrendChart: any = []; // chart数据
  curProvider: any = ''; // 当前选择厂商

  get curProviderData() {
    return this.providerList.find((e) => e.id === this.curProvider);
  }

  timeMenuList: any = [
    // { title: '当日', value: 0 },
    { title: '近1个月', value: 1, lang: 'game.nearlyAMonth' },
    { title: '近3月', value: 2, lang: 'game.lastThreeMonths' },
    { title: '近6月', value: 3, lang: 'game.lastSixMonths' },
    { title: '近1年', value: 4, lang: 'game.nearlyAYear' },
  ];

  selectedTimeValue: any = 1;
  startTime?: any;
  endTime?: any;
  curGraphField = 'payoutAmount';
  graphType = [
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

  ngOnInit(): void {
    // 获取 uid
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.uid = v.uid;
      this.onTimeChange();
    });
  }

  // loading处理
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 输赢趋势图获取 数据
  getMemberPayOutTrendChart() {
    this.loading(true);
    const params = {
      Uid: this.uid,
      GameCategory: this.category,
      GameProvider: this.curProvider,
      StartTime: this.startTime,
      EndTime: this.endTime,
    };
    this.api.getMemberPayOutTrendChart(params).subscribe(async (res) => {
      this.loading(false);
      this.payoutTrendChart = res || [];

      this.updateChart();
    });
  }

  // 时间选择
  onTimeChange() {
    this.endTime = moment().set({ h: 23, m: 59, s: 59, ms: 999 }).valueOf();
    const val = this.selectedTimeValue;
    if (val) {
      this.startTime = moment()
        .set({ h: 0, m: 0, s: 0, ms: 0 })
        .subtract(val === 1 ? 1 : val === 2 ? 3 : val === 3 ? 6 : 1, val === 4 ? 'years' : 'months')
        .valueOf();
    } else {
      this.startTime = moment().set({ h: 0, m: 0, s: 0, ms: 0 }).valueOf();
    }

    this.getMemberPayOutTrendChart();
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

    if (this.payoutTrendChart.length > 0) {
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
