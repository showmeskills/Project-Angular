import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, zip } from 'rxjs';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { SupplierApi } from 'src/app/shared/api/supplier';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AppService } from 'src/app/app.service';
import { take, takeUntil, tap } from 'rxjs/operators';
import { getRangeTime, reduceTotal, toFormatMoney } from 'src/app/shared/models/tools.model';
import { ChartOptions } from 'src/app/shared/interfaces/chart-option';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import {
  AppealStat,
  GameRank,
  LiveTransaction,
  SourceCount,
  TransactionGeneralize,
  UserRank,
  UserTrend,
} from 'src/app/shared/interfaces/supplier';
import moment from 'moment';
import { CurLangService, LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import {
  FormatMoneyPipe,
  NumberSignPipe,
  FormatMoneyArrPipe,
  FormatNumberDecimalPipe,
  ReduceTotalPipe,
} from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { TooltipDirective } from 'src/app/shared/directive/tooltip.directive';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { WinColorDirective } from 'src/app/shared/directive/common.directive';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, AsyncPipe, SlicePipe } from '@angular/common';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    RouterLink,
    AngularSvgIconModule,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    WinColorDirective,
    NgbTooltip,
    NgApexchartsModule,
    TooltipDirective,
    AsyncPipe,
    SlicePipe,
    TimeFormatPipe,
    FormatMoneyPipe,
    NumberSignPipe,
    FormatMoneyArrPipe,
    FormatNumberDecimalPipe,
    LangPipe,
    ReduceTotalPipe,
    CurrencyValuePipe,
  ],
})
export class AnalysisComponent implements OnInit, OnDestroy {
  constructor(
    public proxyService: ProxyService,
    private api: SupplierApi,
    private subHeader: SubHeaderService,
    public appService: AppService,
    public curLangService: CurLangService,
    public langService: LangService
  ) {}

  data = {
    generalizeType: 'transactionAmount',
    generalizeDay: 7,
    userTrendType: 'wagerCount',
    userTrendDay: 7,
    gameDay: 7,
    personDay: 7,
    sourceType: 'registerCount',
    sourceDay: 7,
    gameRankType: 1, // 排名方式： 1：输赢 2：有效流水 3：交易单量
    userRankType: 1, // 排名方式： 0：下注 1：流水 2：输赢
  };

  oftenList: any[] = [
    {
      label: '存提款列表',
      langPath: 'menu.financial.depositAndWithdrawals',
      code: '227',
      to: '/money/transactionList',
    },
    { label: '代客充值', langPath: 'menu.financial.recharging', code: '232', to: '/finance/valet-recharge' },
    { label: '子渠道配置', langPath: 'menu.payment.fiatSubChannel', code: '239', to: '/money/subChannel' },
    { label: '游戏管理', langPath: 'menu.game.list', code: '252', to: '/game/list' },
    { label: '活动管理', langPath: 'menu.member.activity', code: '205', to: '/bonus/activity-manage' },
    { label: '会员管理', langPath: 'menu.member.list', code: '203', to: '/member/list' },
    // { label: '供应商报表', langPath: 'menu.financial.providerReport', code: '230', to: '/finance/report' },
    { label: '交易记录', langPath: 'menu.game.transactionRecord', code: '254', to: '/finance/transaction-report-list' },
    { label: '资讯管理', langPath: 'menu.content.information', code: '274', to: '/content/announcement' },
  ];

  generalizeTypeList: any[] = [
    { name: '交易金额', value: 'transactionAmount' },
    { name: '单量', value: 'orderQuantity' },
    { name: '有效流水', value: 'activeFlowAmount' },
    { name: '输赢', value: 'payoutAmount' },
  ];

  VIPList: any[] = [
    { name: '交易人数', value: 'wagerCount' },
    { name: '注册人数', value: 'registerCount' },
    { name: '存款人数', value: 'depositCount' },
    { name: '首存人数', value: 'depositFirstCount' },
  ];

  sourceList: any[] = [
    { name: '注册人数', value: 'registerCount', rate: 'registerRate' },
    { name: '登录人数', value: 'loginCount', rate: 'loginRate' },
  ];

  gameRankTypeList: any[] = [
    { name: '累计输赢', value: 1 },
    { name: '有效流水', value: 2 },
    { name: '交易单量', value: 3 },
  ];

  userRankTypeList: any[] = [
    { name: '累计输赢', value: 2 },
    { name: '有效流水', value: 1 },
    { name: '交易单量', value: 0 },
  ];

  dayList: number[] = [7, 15, 30];
  lineChartOptions!: ChartOptions | any;
  lineChartOptionsUser!: ChartOptions | any;
  circleChartOptions!: ChartOptions | any;

  /** 当前渠道翻译数据 */
  curSourceLang: any = {};

  /** 产品排行列表 */
  productRankList: any[] = [{}];

  /** 游戏排行列表 */
  gameRankList: GameRank[] = [];

  /** 会员排行列表 */
  userRankList: UserRank[] = [];

  /** 国家排行列表 */
  countryRankList: any[] = [{}];

  /** 实时概括 */
  transactionLive: LiveTransaction = {} as LiveTransaction;

  /** 实时监控 */
  appealStat: AppealStat;

  /** 会员趋势 */
  userTrend: UserTrend[] = [];
  @ViewChild('userTrendChart') userTrendChart!: ChartComponent;

  /** 交易概括 */
  generalize: TransactionGeneralize[] = [];
  @ViewChild('generalizeChart') generalizeChart!: ChartComponent;

  /** 注册渠道比列 */
  source: SourceCount[] = [];
  @ViewChild('sourceChart') sourceChart!: ChartComponent;

  private _destroyed$ = new Subject<void>();

  /** getters */
  /** 当前交易概括类型 */
  get curGeneralizeType() {
    return this.generalizeTypeList.find((e) => e.value === this.data.generalizeType) || {};
  }

  /** 当前会员趋势类型 */
  get curUserTrendType() {
    return this.VIPList.find((e) => e.value === this.data.userTrendType) || {};
  }

  /** 当前注册渠道类型 */
  get curSourceType() {
    return this.sourceList.find((e) => e.value === this.data.sourceType) || {};
  }

  /** lifeCycle */
  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    this.lineChartOptions = {
      series: [
        {
          name: '',
          data: [],
        },
      ],
      chart: {
        width: '100%',
        height: '240px',
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
        colors: ['#63d8e4'], // 类型string[]
      },
      grid: {
        show: false,
        padding: {
          left: 10,
          right: 0,
          bottom: 0,
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
          style: {
            colors: '#969bad',
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
        tooltip: {
          enabled: false,
        },
      },
      tooltip: {
        // enabled: false,
        x: {
          format: 'yyyy-MM-dd',
        },
        y: {
          formatter: (v: number) => Number(v),
        },
        onDatasetHover: {
          highlightDataSeries: false,
        },
        marker: {
          fillColors: ['#63d8e4'],
        },
      },
      yAxis: {
        labels: {
          style: {
            fontSize: '12px',
            colors: ['#a1a5b7'],
          },
          formatter: (v: number) => Number(v),
        },
      },
      fill: {
        type: 'gradient',
        colors: ['#c1f9d4'],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.2,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
    };

    this.lineChartOptionsUser = {
      series: [
        {
          name: this.curUserTrendType.name,
          data: [],
        },
      ],
      chart: {
        width: '100%',
        height: '280px',
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
        colors: ['#7300f7'], // 类型string[]
      },
      grid: {
        show: false,
        padding: {
          left: 10,
          right: 0,
          bottom: 0,
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
          style: {
            colors: '#969bad',
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
        tooltip: {
          enabled: false,
        },
      },
      tooltip: {
        // enabled: false,
        x: {
          format: 'yyyy-MM-dd',
        },
        y: {
          formatter: (v: number) => Number(v),
        },
        onDatasetHover: {
          highlightDataSeries: false,
        },
        marker: {
          fillColors: ['#7300f7'],
        },
      },
      yAxis: {
        labels: {
          style: {
            fontSize: '12px',
            colors: ['#a1a5b7'],
          },
          formatter: (v: number) => Number(v),
        },
      },
      fill: {
        type: 'gradient',
        colors: ['#e3aaff'],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.2,
          opacityTo: 1,
          stops: [0, 100],
        },
      },
    };

    this.circleChartOptions = {
      series: [],
      chart: {
        width: '100%',
        height: 280,
        type: 'donut',
        redrawOnParentResize: true,
      },
      labels: [],
      dataLabels: {
        enabled: false,
      },
      plotOptions: {
        pie: {
          startAngle: -180,
          endAngle: 180,
          donut: {
            size: '76%',
          },
        },
      },
      tooltip: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        custom({ series, seriesIndex, dataPointIndex, w }) {
          return `
            <div class="lh-14 p-2 bg-fff px-5 py-4 lh-20">
              <div class="fz-16 color-999 mb-4">${w.globals.labels[seriesIndex]}</div>
              <div>
                <span class="fz-12 color-999 source-circle-chart-name">${that.curSourceLang.name}：</span>
                <span class="fz-14 color-222">${that.getSourceCount(seriesIndex)}</span>
              </div>
              <div>
                <span class="fz-12 color-999 source-circle-chart-proportion">
                  ${that.curSourceLang.name}${that.curSourceLang.proportion}：
                </span>
                <span class="fz-16 color-222">${series[seriesIndex]}%</span>
              </div>
            </div>
          `;
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              show: false,
            },
          },
        },
      ],
      // colors: ['#68deb7', '#ef8afd', '#8192f5', '#ff9494', '#ffbb27', '#b79381', '#e4e6ef'],
      colors: ['#68deb7', '#ef8afd', '#8192f5', '#ff9494', '#ffbb27', '#b79381', '#e4e6ef', 'blue'],
      states: {
        hover: {
          filter: {
            type: 'none',
          },
        },
        active: {
          filter: {
            type: 'none',
          },
        },
      },
      legend: {
        position: 'bottom',
        height: 80,
        // width: 260,
        // tooltipHoverFormatter: function(seriesName, opts) {
        //   return seriesName + ' - <strong>' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + '</strong>'
        // }
        // formatter: function (seriesName /*opts*/) {
        //   return ['<span class="flex-1">', seriesName, '</span>'];
        // },
        fontSize: 14,
        markers: {
          width: 12,
          height: 12,
          radius: 12,
          onClick: undefined,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 0,
        },
        onItemClick: {
          toggleDataSeries: false,
        },
        onItemHover: {
          highlightDataSeries: false,
        },
      },
    };

    this.subHeader.merchantId$.pipe(takeUntil(this._destroyed$)).subscribe(() => {
      this.appService.isContentLoadingSubject.next(true);

      zip(
        this.getGameRank(),
        this.getUserRank(),
        this.getTransaction(),
        this.getAppealStat(),
        this.getUserTrend(),
        this.getGeneralize(),
        this.getSource()
      ).subscribe(() => {
        this.appService.isContentLoadingSubject.next(false);

        this.curLangService
          .get('source.type.' + this.curSourceType.value)
          .pipe(takeUntil(this._destroyed$))
          .subscribe((name) => {
            this.curSourceLang.name = name;
          });

        this.curLangService
          .get('source.proportion')
          .pipe(takeUntil(this._destroyed$))
          .subscribe((proportion) => {
            this.curSourceLang.proportion = proportion;
          });
      });
    });
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  /** methods */
  /** 会员趋势天数变化 */
  onUserDay(item: number) {
    this.data.userTrendDay = item;
    this.updateUserTrend();
  }

  /** 交易概括天数变化 */
  onGeneralizeDay(day: number) {
    this.data.generalizeDay = day;

    this.appService.isContentLoadingSubject.next(true);
    this.getGeneralize().subscribe(() => this.appService.isContentLoadingSubject.next(false)); // 数据不一样需重新请求
  }

  /** 注册天数变化 */
  onSourceDay(item: number) {
    this.data.sourceDay = item;

    this.appService.isContentLoadingSubject.next(true);
    this.getSource().subscribe(() => this.appService.isContentLoadingSubject.next(false)); // 数据不一样需重新请求
  }

  /** 实时概括 */
  getTransaction() {
    return this.api
      .getTransaction({
        tenantId: this.subHeader.merchantCurrentId,
      })
      .pipe(
        tap((res) => {
          this.transactionLive = res || ({} as LiveTransaction);
        })
      );
  }

  /** 获取游戏排行榜 */
  getGameRank() {
    const [StartTime, EndTime] = getRangeTime(-this.data.gameDay + 1);

    return this.api
      .getGameRank({
        TenantId: this.subHeader.merchantCurrentId,
        StartTime,
        EndTime,
        Rank: 8,
        RankType: this.data.gameRankType,
      })
      .pipe(
        tap((res) => {
          this.gameRankList = res;
        })
      );
  }

  /** 获取会员排行榜 */
  getUserRank() {
    return this.api
      .getUserRank({
        tenantId: this.subHeader.merchantCurrentId,
        n1: this.data.personDay,
        n2: 8,
        sort: this.data.userRankType,
      })
      .pipe(
        tap((res) => {
          this.userRankList = res;
        })
      );
  }

  /** 会员趋势 */
  getUserTrend() {
    return this.api.getUserTrend({ tenantId: this.subHeader.merchantCurrentId, n: 30 }).pipe(
      tap((res) => {
        this.userTrend = res;
        this.updateUserTrend();
      })
    );
  }

  /** 更新会员趋势图表 */
  updateUserTrend() {
    const data = this.userTrend
      .slice(-this.data.userTrendDay)
      .map((e) => [+moment(e.date).format('x'), e[this.data.userTrendType]] as [number, number]);

    this.curLangService
      .get('memberTrend.type.' + this.curUserTrendType.value)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((name) => {
        this.userTrendChart?.updateSeries([{ name, data }]);
      });
  }

  /** 获取交易概括 */
  getGeneralize() {
    const [startTime, endTime] = getRangeTime(-this.data.generalizeDay + 1); // 因为结束时间为第二天的整点 这里需加一天补齐

    return this.api
      .getGeneralize({
        tenantId: this.subHeader.merchantCurrentId,
        startTime,
        endTime,
      })
      .pipe(
        tap((res) => {
          this.generalize = res;
          this.updateGeneralize();
        })
      );
  }

  /** 更新交易概括图表 */
  updateGeneralize() {
    const data = this.generalize.map(
      (e) => [+moment(e.date).format('x'), e[this.data.generalizeType]] as [number, number]
    );

    this.curLangService
      .get('transaction.type.' + this.curGeneralizeType.value)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((name) => {
        this.generalizeChart?.updateSeries([{ name, data }]);
      });
  }

  /** 申述统计 */
  getAppealStat() {
    return this.api.getAppealStat({ tenantId: this.subHeader.merchantCurrentId }).pipe(
      tap((res) => {
        this.appealStat = res;
      })
    );
  }

  /** 会员渠道统计 */
  getSource() {
    return this.api.getSource({ tenantId: this.subHeader.merchantCurrentId, n: this.data.sourceDay }).pipe(
      tap((res) => {
        this.source = res;
        this.updateSource();
      })
    );
  }

  /** 更新会员渠道统计图表 */
  updateSource() {
    this.sourceChart?.updateOptions({
      series: this.source.map((e) => e[this.curSourceType.rate]),
      labels: this.source.map((e) => e.channel),
    });

    this.curLangService
      .get('source.type.' + this.curSourceType.value)
      .pipe(take(1))
      .subscribe((name) => {
        this.curSourceLang.name = name;
      });

    this.curLangService
      .get('source.proportion')
      .pipe(take(1))
      .subscribe((proportion) => {
        this.curSourceLang.proportion = proportion;
      });
  }

  /** 获取来源数据人数 */
  getSourceCount(i: number) {
    return toFormatMoney((this.source[i] || {})[this.curSourceType.value]);
  }

  /** 排行榜变化 */
  onRankChange(field: string, value: any, streamField: string) {
    this.data[field] = value;
    this.appService.isContentLoadingSubject.next(true);
    this[streamField]().subscribe(() => this.appService.isContentLoadingSubject.next(false));
  }

  protected readonly reduceTotal = reduceTotal;
}
