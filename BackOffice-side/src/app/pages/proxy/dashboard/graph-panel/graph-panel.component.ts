import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartOptions } from 'src/app/shared/interfaces/chart-option';
import { AgentApi } from 'src/app/shared/api/agent.api';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AppService } from 'src/app/app.service';
import { take } from 'rxjs/operators';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TooltipDirective } from 'src/app/shared/directive/tooltip.directive';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'graph-panel',
  templateUrl: './graph-panel.component.html',
  styleUrls: ['./graph-panel.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgApexchartsModule,
    TooltipDirective,
    AngularSvgIconModule,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class GraphPanelComponent implements OnInit {
  constructor(
    private api: AgentApi,
    private proxyService: ProxyService,
    private subHeader: SubHeaderService,
    private appService: AppService
  ) {
    this.lineChartOptions = {
      series: [
        {
          // name: "Desktops",
          name: '',
          data: [],
        },
      ],
      chart: {
        width: '100%',
        height: '100%',
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
        width: 2,
        curve: 'smooth',
        colors: ['#c70f3d'], // 类型string[]
      },
      grid: {
        show: false,
        padding: {
          left: 0,
          right: 0,
          bottom: -15,
        },
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
          show: false,
          style: {
            colors: '#a1a5b7',
          },
          offsetY: -3,
          datetimeUTC: false,
          datetimeFormatter: {
            year: 'yyyy',
            month: "'yy-MM",
            day: 'MM-dd',
            hour: 'HH:mm',
          },
        },
      },
      tooltip: {
        enabled: false,
      },
      yAxis: {
        y: 0,
        show: false,
      },
      fill: {
        colors: ['transparent'],
        opacity: 1,
        type: 'solid',
      },
    };
  }

  @ViewChild('chart') chart;
  public lineChartOptions: Partial<ChartOptions> | any;

  current = {
    type: 0, // 类型（0：全部 1：体育 2：娱乐场 3：彩票 4：棋牌） 默认:0
    dateType: 0, // 统计时间(0:当天 1:近7天 2:近30天) 默认当天
    queryType: 0, // 0：贡献度 1：交易量 2：活跃 3:存/提
  };

  queryType = [
    { label: '贡献度', value: 0, field: 'contribution', lang: 'dashboard.info.contribution' },
    { label: '交易量', value: 1, field: 'trade', lang: 'dashboard.info.transVolum' },
    { label: '活跃', value: 2, field: 'active', lang: 'dashboard.info.active' },
    { label: '存/提', value: 3, field: 'deposit', lang: 'dashboard.info.deposit' },
  ];

  dateType = [
    { label: '今日', value: 0, lang: 'dashboard.info.theDay' },
    { label: '近7天', value: 1, lang: 'dashboard.info.sevenDays' },
    { label: '近30天', value: 2, lang: 'dashboard.info.lastDays' },
  ];

  type = [
    { value: 0, label: '全部', lang: 'common.all' },
    { value: 1, label: '体育', lang: 'dashboard.info.sport' },
    { value: 2, label: '娱乐场', lang: 'dashboard.info.casino' },
    { value: 3, label: '彩票', lang: 'dashboard.info.lottery' },
    { value: 4, label: '棋牌', lang: 'dashboard.info.chessCards' },
  ];

  data: any = {};

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    this.proxyService.value$.pipe(take(1)).subscribe(() => {
      this.getData();
    });
  }

  getData() {
    this.api
      .dashBoard_trend({
        dateType: this.current.dateType, // 统计时间(0:当天 1:近七天 2:近30天) 默认当天
        queryType: this.current.queryType, // 查询类型（0：贡献度 1：交易量 2：活跃 3:存/提） 默认:0
        team: this.proxyService.curTeamId,
        tenantId: this.subHeader.merchantCurrentId,
        type: this.current.type, // 类型（0：全部 1：体育 2：娱乐场 3：彩票 4：棋牌） 默认:0
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!res?.data) {
          res.data = { list: [] };
        }

        if (!res?.data?.list) {
          res.data.list = [];
        }

        this.data = res.data;

        this.chart &&
          this.chart?.updateSeries([
            {
              name: '',
              data:
                this.data?.list?.map((e) => [
                  e.date,
                  e[this.queryType.find((e) => e.value === this.current.queryType)?.field || ''] || 0,
                ]) || [],
            },
          ]);
      });
  }

  onChange(field: string, value) {
    this.current[field] = value;
    this.loadData();
  }

  loadData() {
    this.appService.isContentLoadingSubject.next(true);
    this.getData();
  }
}
