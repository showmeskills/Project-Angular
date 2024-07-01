import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin, of, Subject, switchMap, zip } from 'rxjs';
import { catchError, combineLatestWith, finalize, takeUntil, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ChartOptions } from 'src/app/shared/interfaces/chart-option';
import { getRangeTime } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import moment from 'moment';
import { TransactionGeneralize, UserTrend } from 'src/app/shared/interfaces/supplier';
import { CurLangService, LangService } from 'src/app/shared/components/lang/lang.service';
import { DrawerService, MatModal } from 'src/app/shared/components/dialogs/modal';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AnalysisDetailPopupComponent } from './detail-popup/detail-popup.component';
import { Router, RouterLink } from '@angular/router';
import { DashboardApi } from 'src/app/shared/api/dashboard.api';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { searchFilter } from 'src/app/shared/pipes/array.pipe';
import { FormatMoneyArrPipe, FormatMoneyPipe, ReduceTotalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CurrencyIconDirective, IconCountryComponent } from 'src/app/shared/components/icon/icon.directive';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { TooltipDirective } from 'src/app/shared/directive/tooltip.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-analysis-new',
  templateUrl: './analysis-new.component.html',
  styleUrls: ['./analysis-new.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    RouterLink,
    LoadingDirective,
    NgIf,
    WinDirective,
    WinColorDirective,
    AngularSvgIconModule,
    NgApexchartsModule,
    TooltipDirective,
    EmptyComponent,
    NgbTooltip,
    IconCountryComponent,
    CurrencyIconDirective,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    FormWrapComponent,
    AsyncPipe,
    TimeFormatPipe,
    FormatMoneyPipe,
    FormatMoneyArrPipe,
    searchFilter,
    CurrencyValuePipe,
    ReduceTotalPipe,
    LangPipe,
  ],
})
export class AnalysisNewComponent implements OnInit, OnDestroy {
  background: any;
  constructor(
    private subHeader: SubHeaderService,
    private api: DashboardApi,
    public appService: AppService,
    public curLangService: CurLangService,
    public langService: LangService,
    private selectApi: SelectApi,
    private modalService: MatModal,
    private drawer: DrawerService,
    private router: Router,
    private currencyService: CurrencyService
  ) {}

  private _destroyed$ = new Subject<void>(); // 订阅流

  // 实时概括 - chart
  @ViewChild('realChart') chart!: ChartComponent;
  realBarChartOptions: Partial<ChartOptions> | any;

  // 交易概括- chart
  @ViewChild('tradeLineChart') tradeLineChart!: ChartComponent;
  tradeLineChartOptions!: ChartOptions | any; // 输赢 - chart
  tradeBarChartOptions!: ChartOptions | any; // 有效流水 - chart
  tredeLoading = true;
  tradeList: TransactionGeneralize[] = []; // 图表数据

  /** 会员趋势 */
  @ViewChild('userTrendChart') userTrendChart!: ChartComponent;
  userTrendChartOptions!: ChartOptions | any;
  userTrendList: UserTrend[] = [];
  userTrendLoading = true;
  userTrendData: any = {};

  /** 支付一览 */
  @ViewChild('payBarChart') payChart!: ChartComponent;
  payBarChartOptions!: ChartOptions | any;
  payList: any[] = [];

  // 头部筛选时间(YYYY-DD-MM)
  headerTime: any[] = [];
  headerTimeDiffDays: any;

  // 常用功能
  oftenList: any[] = [
    {
      label: '存款记录',
      langPath: 'breadCrumb.depositRecord',
      code: '292',
      to: '/finance/deposit',
      iconSrc: './assets/images/dashboard/often1.svg',
    },
    {
      label: '出款记录',
      langPath: 'breadCrumb.paymentRecord',
      code: '235',
      to: '/finance/withdrawals',
      iconSrc: './assets/images/dashboard/often4.svg',
    },
    {
      label: '代客充值',
      langPath: 'menu.financial.recharging',
      code: '293',
      to: '/finance/valet-recharge',
      iconSrc: './assets/images/dashboard/often2.svg',
    },
    {
      label: '实时监控列表',
      langPath: 'nav.realMonitoList',
      code: '267',
      to: '/risk/monitor',
      iconSrc: './assets/images/dashboard/often3.svg',
    },
    // {
    //   label: '币种配置',
    //   langPath: 'nav.currencyConfiguration',
    //   code: '235',
    //   to: '/pay/currency',
    //   iconSrc: './assets/images/dashboard/often4.svg',
    // },
    {
      label: '游戏管理',
      langPath: 'menu.game.list',
      code: '306',
      to: '/game/manage',
      iconSrc: './assets/images/dashboard/often5.svg',
    },
    {
      label: '资讯管理',
      langPath: 'menu.content.information',
      code: '274',
      to: '/content/announcement',
      iconSrc: './assets/images/dashboard/often6.svg',
    },
    {
      label: '活动管理',
      langPath: 'menu.member.activity',
      code: '205',
      to: '/bonus/activity-manage',
      iconSrc: './assets/images/dashboard/often7.svg',
    },
    {
      label: '会员管理',
      langPath: 'menu.member.list',
      code: '203',
      to: '/member/list',
      iconSrc: './assets/images/dashboard/often8.svg',
    },
    {
      label: '交易记录',
      langPath: 'menu.game.transactionRecord',
      code: '254',
      to: '/finance/transaction-report-chart',
      iconSrc: './assets/images/dashboard/often9.svg',
    },
    {
      label: '转账记录',
      langPath: 'nav.transferRecord',
      code: '228',
      to: '/finance/transfer-record',
      iconSrc: './assets/images/dashboard/often10.svg',
    },
  ];

  // 实时监控
  monitorLoading = true;
  monitorValue: any = 'depositAppeal';
  monitorList: any[] = [
    { name: '存款申诉', value: 'depositAppeal', lang: 'dashboard.info.depositAppeals' },
    // { name: '游戏申诉', value: 'gameAppeal', lang: 'dashboard.info.gameComplaints' },
    // { name: '代理审核', value: 'agentReview', lang: 'dashboard.info.agentAuit' },
    // { name: '存款失败', value: 'depositFailed', lang: 'dashboard.info.depFail' },
    { name: '活跃用户', value: 'activeMembers', lang: 'dashboard.info.activeUsers' },
    { name: '新首存', value: 'firstDeposit', lang: 'dashboard.info.newFirstDep' },
    { name: '新老首存', value: 'firstDepositTotal', lang: 'dashboard.info.newOldFirstDep' },
    { name: '新注册', value: 'newRegister', lang: 'dashboard.info.newRegister' },
    // { name: '异常会员', value: 'abnormalMember', lang: 'dashboard.info.excMembers' },
  ];

  // 实时概括
  realTimeSummaryLoading = true;
  realTimeSummaryData: any = {};
  realTimeColors: any[] = [
    '#AFD9FF',
    '#AFD9FF',
    '#FFA1B8',
    '#FADF99',
    '#DEBEFE',
    '#FFCFB4',
    '#AFD9FF',
    '#AFD9FF',
    '#FFA1B8',
    '#FADF99',
    '#DEBEFE',
    '#FFCFB4',
    '#FFCFB4',
    '#AFD9FF',
    '#AFD9FF',
    '#FFA1B8',
    '#FADF99',
    '#DEBEFE',
    '#FFCFB4',
    '#AFD9FF',
    '#AFD9FF',
    '#FFA1B8',
    '#FADF99',
    '#DEBEFE',
    '#FFCFB4',
  ];

  // 交易概括 - 选项
  tradeType: any = 'payoutAmount';
  tradeTypeList: any[] = [
    { name: '输赢', value: 'payoutAmount' },
    { name: '有效流水', value: 'activeFlowAmount' },
    { name: '交易单量', value: 'orderQuantity' },
  ];

  // 会员趋势 - 选项
  userTrendType: any = 'depositAndwager';
  userTrendTypeList: any[] = [
    { name: '存款&交易', value: 'depositAndwager' },
    { name: '注册&首存', value: 'registerAndDeposit' },
  ];

  /** 游戏排行列表 */
  gameRankLoading = true;
  gameRankList: any[] = [];
  gameRankSort: any = {
    sort: '',
    isAsc: true,
  };

  /** 游戏排行 - 当前选中的类型 */
  curGanmeRankValue = 1;

  /** 会员排行列表 */
  userRankLoading = true;
  userRankList: any[] = [];
  userRankSort: any = {
    sort: '',
    isAsc: true,
  };

  /** 国家排行列表 */
  countryRankLoading = true;
  countryRankList: any[] = [];
  countryRankSort: any = {
    sort: '',
    isAsc: true,
  };

  /** 货币排行列表 */
  currencyRankLoading = true;
  currencyRankList: any[] = [];
  currencyRankSort: any = {
    sort: '',
    isAsc: true,
  };

  // 支付一览
  payMentLoading = true;
  payCurrency: any = '';
  currencyList: any[] = [];
  searchGroup: any = {};

  // 用户存留率
  retainSearch: any = '';
  retainType: any = 'all';
  retainTypeList: any[] = [
    { name: '全部', value: 'all' },
    { name: '直客', value: 'straightOff' },
    { name: '推荐好友', value: 'referAfriend' },
    { name: '联盟计划', value: 'affiliateProgram' },
  ];

  retainTheadList: any[] = [
    '',
    'FTD',
    'ARPU',
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
    '9th',
    '10th',
    '11th',
    '12th',
  ];

  retainLoading = true;
  retainList: any[] = [];

  ngOnInit() {
    // 实时概括 - chartData
    this.realBarChartOptions = {
      series: [
        {
          name: '',
          data: [2, 4, 6, 7, 10, 6, 4],
        },
      ],
      chart: {
        width: 40,
        height: 40,
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
        categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
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
        opacity: 1,
      },
    };

    // 交易概括：输赢 - chartData
    this.tradeLineChartOptions = {
      series: [
        {
          name: '',
          data: [],
        },
      ],
      chart: {
        width: '100%',
        height: '220px',
        parentHeightOffset: 0,
        type: 'area',
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      colors: ['#63d8e4'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 2,
        curve: 'smooth',
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
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.2,
          opacityTo: 0.5,
          stops: [0, 100],
        },
      },
    };

    // 交易概括：有效流水 - chartData
    this.tradeBarChartOptions = {
      series: [
        {
          name: '',
          data: [],
        },
      ],
      chart: {
        type: 'bar',
        width: '100%',
        height: '220px',
        parentHeightOffset: 0,
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
        opacity: 1,
      },
      grid: {
        show: false,
      },
      tooltip: {
        x: {
          format: 'yyyy-MM-dd',
        },
        y: {
          formatter: (v: number) => Number(v),
        },
        onDatasetHover: {
          highlightDataSeries: false,
        },
      },
    };

    // 会员趋势 - chartData
    this.userTrendChartOptions = {
      series: [
        {
          name: '',
          data: [],
        },
      ],
      chart: {
        width: '100%',
        height: '260px',
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
          // datetimeUTC: false,
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
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.2,
          opacityTo: 0.5,
          stops: [0, 100],
        },
      },
    };

    // 支付一览 - chartData
    this.payBarChartOptions = {
      series: [],
      chart: {
        type: 'line',
        width: '100%',
        height: '400px',
        stacked: true,
        parentHeightOffset: 0,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      stroke: {
        width: [0, 4],
      },
      dataLabels: {
        enabled: false,
      },
      xAxis: {
        type: 'category',
        categories: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
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
        },
        tooltip: {
          enabled: false,
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
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        markers: {
          offsetY: 2,
        },
      },
      fill: {
        opacity: 1,
      },
      grid: {
        show: false,
      },
      tooltip: {
        x: {
          format: 'yyyy-MM-dd',
        },
        y: {
          formatter: (v: number) => Number(v),
        },
        onDatasetHover: {
          highlightDataSeries: false,
        },
      },
    };

    // 获取币种
    this.currencyService.list$.pipe(takeUntil(this._destroyed$)).subscribe((res: any[]) => {
      this.currencyList = [{ code: '' }, ...res];
    });

    this.subHeader.merchantId$
      .pipe(
        switchMap(() =>
          this.merchantChangeLoadData$().pipe(
            combineLatestWith(
              this.subHeader.countryCode$.pipe(switchMap(() => this.countryChangeLoadData$())),
              this.subHeader.timeCurrent$.pipe(switchMap(() => this.timeChangeLoadData$()))
            )
          )
        ),
        takeUntil(this._destroyed$)
      )
      .subscribe(() => {
        this.loadData();
      });
  }

  merchantChangeLoadData$() {
    return forkJoin([
      // 支付一览
      this.getPayMentList(),
    ]).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  countryChangeLoadData$() {
    return forkJoin([
      // 实时监控
      this.getRealtimeData(),
      // 用户留存率
      this.getRetainData(),
    ]).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  timeChangeLoadData$() {
    // 时间初始化
    this.headerTime = this.subHeader.curTime.length
      ? [moment(this.subHeader.curTime[0]).format('YYYY-MM-DD'), moment(this.subHeader.curTime[1]).format('YYYY-MM-DD')]
      : [];

    // 交易概括/会员趋势 -> 时间筛选小于7天或全部时间 - 先按7天显示
    const diffDays = moment(this.headerTime[1]).diff(moment(this.headerTime[0]), 'days');
    this.headerTimeDiffDays = diffDays < 7 ? 7 : diffDays;

    return forkJoin([
      // 国家排行榜
      this.getCountryRank(),
    ]).pipe(
      catchError(() => {
        return of([]);
      })
    );
  }

  loadData() {
    zip(
      // 游戏排行榜
      this.getGameRank(),
      // 会员排行榜
      this.getUserRank(),
      // 货币排行榜
      this.getCurrencyRank(),
      // 交易概括
      this.getTransactionSummary(),
      // 会员趋势
      this.getMemberTrends(),
      // 实时概括
      this.getRealTimeSummary()
    ).subscribe(() => {});
  }

  /** 实时监控 - 获取数据 */
  getRealtimeData() {
    this.monitorLoading = true;
    return this.api
      .getRealtimeData({
        TenantId: this.subHeader.merchantCurrentId,
        CountryCode: this.subHeader.countryCurrentCode,
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.monitorList.forEach((a) => {
              a.amount = res[a.value];
            });
          }
        }),
        finalize(() => (this.monitorLoading = false))
      );
  }

  /** 实时概括 - 获取数据 */
  getRealTimeSummary() {
    this.realTimeSummaryLoading = true;
    return this.api
      .getRealTimeSummary({
        TenantId: this.subHeader.merchantCurrentId,
        CountryCode: this.subHeader.countryCurrentCode,
        BeginDate: this.headerTime[0],
        EndDate: this.headerTime[1],
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.realTimeSummaryData = res;
            if (Array.isArray(this.realTimeSummaryData?.list)) {
              this.realTimeSummaryData?.list.forEach((item, i) => {
                item.color = this.realTimeColors[i] || '#AFD9FF';
              });
            }
          }
        }),
        finalize(() => (this.realTimeSummaryLoading = false))
      );
  }

  /** 实时概括 - 获取计算公式*/
  getFormulaLang(key: string) {
    const formulas = {
      NGR: 'dashboard.info.formula.ngr',
      BonusSummary: 'dashboard.info.formula.bonusSummary',
      RecommendCommission: 'dashboard.info.formula.recommendCommission',
    };

    return formulas[key] || 'common.unknown';
  }

  /** 游戏排行榜 - 切换娱乐场/真人娱乐场 */
  onGameRankTab(curTabValue: number) {
    this.curGanmeRankValue = curTabValue;
    this.getGameRank().subscribe();
  }

  /** 游戏排行榜 - 获取数据 */
  getGameRank() {
    const parmas = {
      TenantId: this.subHeader.merchantCurrentId,
      CountryCode: this.subHeader.countryCurrentCode,
      BeginDate: this.headerTime[0],
      EndDate: this.headerTime[1],
      Top: 7,
      ...(this.gameRankSort.sort
        ? {
            Sort: this.gameRankSort.sort,
            IsAsc: this.gameRankSort.isAsc,
          }
        : {}),
    };
    this.gameRankLoading = true;
    return this.api[this.curGanmeRankValue === 1 ? 'getslotchessrank' : 'getlivecasinorank'](parmas).pipe(
      tap((res) => {
        if (Array.isArray(res)) this.gameRankList = res;
      }),
      finalize(() => (this.gameRankLoading = false))
    );
  }

  /** 会员排行榜 - 获取数据 */
  getUserRank() {
    const parmas = {
      TenantId: this.subHeader.merchantCurrentId,
      CountryCode: this.subHeader.countryCurrentCode,
      BeginDate: this.headerTime[0],
      EndDate: this.headerTime[1],
      Top: 7,
      ...(this.userRankSort.sort
        ? {
            Sort: this.userRankSort.sort,
            IsAsc: this.userRankSort.isAsc,
          }
        : {}),
    };
    this.userRankLoading = true;
    return this.api.getUserGameRank(parmas).pipe(
      tap((res) => {
        if (Array.isArray(res)) this.userRankList = res;
      }),
      finalize(() => (this.userRankLoading = false))
    );
  }

  /** 国家排行榜 - 获取数据 */
  getCountryRank() {
    const parmas = {
      TenantId: this.subHeader.merchantCurrentId,
      // CountryCode: this.subHeader.countryCurrentCode,
      BeginDate: this.headerTime[0],
      EndDate: this.headerTime[1],
      Top: 8,
      ...(this.countryRankSort.sort
        ? {
            Sort: this.countryRankSort.sort,
            IsAsc: this.countryRankSort.isAsc,
          }
        : {}),
    };
    this.countryRankLoading = true;
    return this.api.getCountryGameRank(parmas).pipe(
      tap((res) => {
        if (Array.isArray(res)) this.countryRankList = res;
      }),
      finalize(() => (this.countryRankLoading = false))
    );
  }

  /** 货币排行榜 - 获取数据 */
  getCurrencyRank() {
    const parmas = {
      TenantId: this.subHeader.merchantCurrentId,
      CountryCode: this.subHeader.countryCurrentCode,
      BeginDate: this.headerTime[0],
      EndDate: this.headerTime[1],
      Top: 8,
      ...(this.currencyRankSort.sort
        ? {
            Sort: this.currencyRankSort.sort,
            IsAsc: this.currencyRankSort.isAsc,
          }
        : {}),
    };
    this.currencyRankLoading = true;
    return this.api.getCurrencyGameRank(parmas).pipe(
      tap((res) => {
        if (Array.isArray(res)) this.currencyRankList = res;
      }),
      finalize(() => (this.currencyRankLoading = false))
    );
  }

  /** 交易概括 - 类型选择 */
  selectTradeType(value: any) {
    this.tradeType = value;
    setTimeout(() => {
      this.updateTradeChart();
    }, 100);
  }

  /** 交易概括 - 获取数据 */
  getTransactionSummary() {
    // 时间筛选小于7天或全部时间 - 按7天算
    const [startTime, endTime] = getRangeTime(-7 + 1);
    const time =
      moment(this.headerTime[1]).diff(moment(this.headerTime[0]), 'days') < 7
        ? [moment(startTime).format('YYYY-MM-DD'), moment(endTime).format('YYYY-MM-DD')]
        : [this.headerTime[0], this.headerTime[1]];

    this.tredeLoading = true;
    return this.api
      .getTransactionSummary({
        tenantId: this.subHeader.merchantCurrentId,
        CountryCode: this.subHeader.countryCurrentCode,
        StartDate: time[0],
        EndDate: time[1],
      })
      .pipe(
        tap((res) => {
          if (Array.isArray(res)) {
            this.tradeList = res;
            this.updateTradeChart();
          }
        }),
        finalize(() => (this.tredeLoading = false))
      );
  }

  /** 交易概括 - 更新图表 */
  updateTradeChart() {
    const data = this.getChartMapData(this.tradeList, this.tradeType);

    this.curLangService
      .get('transaction.type.' + this.tradeType)
      .pipe(takeUntil(this._destroyed$))
      .subscribe((name) => {
        this.tradeLineChart && this.tradeLineChart?.updateSeries([{ name, data }]);
      });
  }

  /** 会员趋势 - 获取数据 */
  getMemberTrends() {
    // 时间筛选小于7天或全部时间 - 先按7天算
    const [startTime, endTime] = getRangeTime(-7 + 1);
    const time =
      moment(this.headerTime[1]).diff(moment(this.headerTime[0]), 'days') < 7
        ? [moment(startTime).format('YYYY-MM-DD'), moment(endTime).format('YYYY-MM-DD')]
        : [this.headerTime[0], this.headerTime[1]];

    this.userTrendLoading = true;
    return this.api
      .getMemberTrends({
        tenantId: this.subHeader.merchantCurrentId,
        CountryCode: this.subHeader.countryCurrentCode,
        StartDate: time[0],
        EndDate: time[1],
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.userTrendData = res;
            this.updateUserTrendChart();
          }
        }),
        finalize(() => (this.userTrendLoading = false))
      );
  }

  /** 会员趋势 - 类型选择 */
  selectTrendType(value: any) {
    this.userTrendType = value;
    setTimeout(() => {
      this.updateUserTrendChart();
    }, 100);
  }

  /** 会员趋势 - 更新图表 */
  async updateUserTrendChart() {
    const wagerCount = await this.langService.getOne('dashboard.memberTrend.type.wagerCount'); // 交易人数
    const registerCount = await this.langService.getOne('dashboard.memberTrend.type.registerCount'); // 注册人数
    const firstDepositCount = await this.langService.getOne('dashboard.memberTrend.type.depositFirstCount'); // 首存人数
    const depositCount = await this.langService.getOne('dashboard.memberTrend.type.depositCount'); // 存款人数

    const transactionsData = this.getChartMapData(this.userTrendData.transactions, 'value'); // 交易
    const registerCountData = this.getChartMapData(this.userTrendData.registers, 'value'); // 注册
    const firstDepositCountData = this.getChartMapData(this.userTrendData.firstDeposits, 'value'); // 首存
    const depositCountData = this.getChartMapData(this.userTrendData.deposits, 'value'); // 存款

    const isDepositAndwager: boolean = this.userTrendType === 'depositAndwager' ? true : false;

    this.userTrendChart &&
      this.userTrendChart?.updateOptions({
        series: [
          {
            name: isDepositAndwager ? depositCount : registerCount,
            data: isDepositAndwager ? depositCountData : registerCountData,
          },
          {
            name: isDepositAndwager ? wagerCount : firstDepositCount,
            data: isDepositAndwager ? transactionsData : firstDepositCountData,
          },
        ],
        colors: ['#7300f7', isDepositAndwager ? '#FC5AD8' : '#63d8e4'],
        legend: {
          position: 'top',
          horizontalAlign: 'center',
          markers: {
            width: 14,
            height: 2,
            offsetX: -2,
          },
        },
      });
  }

  getChartMapData(list: any, type: any) {
    return list.map((e) => [+moment(e.date).format('x'), e[type]] as [number, number]);
  }

  /** 打开可搜索过滤的下拉 */
  openSearchSelect(isOpen: boolean, key: string, el: HTMLInputElement): void {
    if (isOpen) {
      el.value = '';
      el.focus();
    } else {
      this.searchGroup[key] = '';
    }
  }

  /** 支付一览 - 数据获取 */
  getPayMentList() {
    let today: any;
    let averageSamePeriod: any;
    this.langService
      .get('dashboard.info.today')
      .pipe(takeUntil(this._destroyed$))
      .subscribe((name) => {
        today = name;
      });

    this.langService
      .get('dashboard.info.averageSamePeriod')
      .pipe(takeUntil(this._destroyed$))
      .subscribe((name) => {
        averageSamePeriod = name;
      });

    this.payMentLoading = true;
    return this.api
      .payMentList({
        TenantId: this.subHeader.merchantCurrentId,
        Currency: this.payCurrency,
      })
      .pipe(
        tap((res) => {
          if (res) {
            this.payChart &&
              this.payChart?.updateOptions({
                series: [
                  {
                    name: today,
                    type: 'column',
                    data: res?.todayPaymentList.map((v) => v.amount) || [],
                  },
                  {
                    name: averageSamePeriod,
                    type: 'line',
                    data: res?.pastWeekPaymentList.map((v) => v.amount) || [],
                  },
                ],
                colors: ['#329BFB', '#25F2FF'],
              });
          }
        }),
        finalize(() => (this.payMentLoading = false))
      );
  }

  /** 用户存留率 - 类型选择 */
  selecRetainType(value: any) {
    return this.appService.showToastSubject.next({
      msgLang: 'dashboard.info.undone',
      successed: false,
    });
    this.retainType = value;
  }

  /** 用户存留率 - 数据获取 */
  getRetainData() {
    this.retainLoading = true;
    return this.api
      .getRetentionRateOutPut({
        TenantId: this.subHeader.merchantCurrentId,
        CountryCode: this.subHeader.countryCurrentCode,
      })
      .pipe(
        tap((res) => {
          if (Array.isArray(res)) this.retainList = res;
        }),
        finalize(() => (this.retainLoading = false))
      );
  }

  /** 用户存留率 - 颜色获取 */
  getTdBg(value: any) {
    return {
      background: 'rgba(57, 136, 255, ' + (value / 140 + 0.3) + ')',
    };
  }

  // 排行榜 排序
  onRankSort(sortKey: any, streamField: any) {
    let list: any[] = [];
    let data: any;
    if (streamField === 'getGameRank') {
      list = this.gameRankList;
      data = this.gameRankSort;
    } else if (streamField === 'getUserRank') {
      list = this.userRankList;
      data = this.userRankSort;
    } else if (streamField === 'getCountryRank') {
      list = this.countryRankList;
      data = this.countryRankSort;
    } else if (streamField === 'getCurrencyRank') {
      list = this.currencyRankList;
      data = this.currencyRankSort;
    }

    if (!list.length) return;

    if (data.isAsc === false && data.sort === sortKey) {
      data.sort = '';
      data.isAsc = true;
      this.onRequestChange(streamField);
      return;
    }

    if (!data.sort || data.sort !== sortKey) {
      data.sort = sortKey;
      data.isAsc = false;
    }

    data.isAsc = !data.isAsc;
    this.onRequestChange(streamField);
  }

  /** 请求  field: string, value: any, */
  onRequestChange(streamField: string) {
    this[streamField]().subscribe();
  }

  /** 详情弹窗 */
  openDetailPopup(type: any) {
    if (type === 'abnormalMember') {
      this.router.navigate(['/risk/monitor']);
    } else {
      const modal = this.drawer.open(AnalysisDetailPopupComponent, { width: '60%', maxWidth: '800px' });
      modal.componentInstance['type'] = type;
      modal.componentInstance['tenantId'] = this.subHeader.merchantCurrentId;
      modal.componentInstance['curTime'] = this.subHeader.curTime;
      modal.componentInstance['countryCurrentCode'] = this.subHeader.countryCurrentCode;
      if (type === 'ganmeRank') modal.componentInstance['ganmeRankTypeValue'] = this.curGanmeRankValue;
      modal.result.then(() => {}).catch(() => {});
    }
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
