import { CdkDrag, Point } from '@angular/cdk/drag-drop';
import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ChartComponent } from 'ng-apexcharts';
import { Subject, combineLatest, timer } from 'rxjs';
import { delay, filter, startWith, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';

type GameData = {
  total: {
    reward: number;
    amount: number;
    win: number;
    lose: number;
  };
  chartData: { x: number; y: number }[];
};

type ReceiveData = {
  gameId: string;
  gameName: string;
  amount: number;
  type: string;
};

@UntilDestroy()
@Component({
  selector: 'app-statistics-panel',
  templateUrl: './statistics-panel.component.html',
  styleUrls: ['./statistics-panel.component.scss'],
  host: {
    '[style.zIndex]': 'zIndex',
    '[style.transform]': "show ? '' : 'none'",
  },
})
export class StatisticsPanelComponent implements OnInit {
  constructor(
    private appService: AppService,
    public layout: LayoutService,
    private localStorageService: LocalStorageService,
    private factory: ComponentFactoryResolver,
    private currencyValuePipe: CurrencyValuePipe,
  ) {}

  @ViewChild('dragCom') dragCom!: CdkDrag;
  @ViewChild('chartContainer', { read: ViewContainerRef }) chartContainer!: ViewContainerRef;

  ready!: boolean;
  currentCurrency!: string;
  currencies!: CurrenciesInterface;

  intersectChange$: Subject<boolean> = new Subject();
  show: boolean = false;
  transform!: string;
  defaultDragPosition: Point = { x: 20, y: 20 };
  currentDragPosition!: Point;
  zIndex: 18 | 16 = 18;

  selectMenu: number = 1;
  menus = [
    { name: '全部', value: 1 },
    { name: '投注', value: 2 },
    { name: '竞赛', value: 3 },
  ];

  get tzAct(): boolean {
    return this.selectMenu != 3;
  }
  get jsAct(): boolean {
    return this.selectMenu != 2;
  }

  selectGame: string = 'all';
  games: { name: string; id: string }[] = [
    {
      name: '全部',
      id: 'all',
    },
  ];
  datas: { [key: string]: GameData } = {
    all: {
      total: {
        reward: 0,
        amount: 0,
        win: 0,
        lose: 0,
      },
      chartData: [],
    },
  };

  get currentGameTotal(): GameData['total'] {
    return this.datas[this.selectGame].total;
  }

  chartOptions: any;
  chartComponentRef?: ComponentRef<ChartComponent>;
  updateChart$: Subject<boolean> = new Subject();

  ngOnInit() {
    combineLatest([this.layout.statisticsPanelState$, this.updateChart$])
      .pipe(
        untilDestroyed(this),
        filter(([state]) => state),
        delay(0),
      )
      .subscribe(_ => this.updateChart());

    this.layout.leftMenuBackdrop$.pipe(untilDestroyed(this)).subscribe(x => (this.zIndex = x ? 16 : 18));

    combineLatest([
      this.appService.currentCurrency$.pipe(
        filter(x => !!x),
        tap(x => {
          this.reset(false);
          this.ready = true;
          this.currencies = x;
          this.currentCurrency = x.currency;
        }),
      ),
      this.layout.statisticsPanelState$.pipe(
        tap(x => {
          this.show = x;
          //设置初始位置
          if (x) this.updatePosition(this.localStorageService.statisticsPanelPosition ?? this.defaultDragPosition);
        }),
      ),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([_, state]) => {
        if (state) {
          //创建动态图表
          this.buildChart();
        } else {
          //销毁动态图表
          this.destroyChart();
        }
      });

    /**超出边界修正 */
    combineLatest([
      this.layout.statisticsPanelState$,
      this.layout.resize$.pipe(startWith([document.body.offsetWidth, document.body.offsetHeight])),
      this.intersectChange$,
    ])
      .pipe(
        untilDestroyed(this),
        filter(([state]) => state),
        delay(0),
      )
      .subscribe(([_, [bodyw, bodyh], visible]) => {
        const eh = this.dragCom.element.nativeElement.offsetHeight;
        const ew = this.dragCom.element.nativeElement.offsetWidth;
        if (!visible) {
          const fixedPosition: Point = JSON.parse(JSON.stringify(this.currentDragPosition));
          if (this.currentDragPosition.x + ew > bodyw) {
            //右边超出边界
            if (bodyw > ew) fixedPosition.x = bodyw - ew;
          }
          if (this.currentDragPosition.y + eh > bodyh) {
            //下边超出边界
            if (bodyh > eh) fixedPosition.y = bodyh - eh;
          }
          if (this.currentDragPosition.x < 5) {
            //左边超出边界或距离很小（防抖）
            fixedPosition.x = 0;
          }
          if (this.currentDragPosition.y < 5) {
            //上边超出边界或距离很小（防抖）
            fixedPosition.y = 0;
          }
          this.updatePosition(fixedPosition);
        }
      });

    //TODO: 模拟更新
    // timer(1000, 3000).subscribe(x => {
    //   const r1 = Math.random() > 0.5;
    //   const r2 = Math.random() > 0.5;
    //   const mockData: ReceiveData = {
    //     gameId: r1 ? '123' : '456',
    //     gameName: r1 ? '白蛇传' : '勇者斗恶龙',
    //     amount: (Math.random() - Math.random()) * 50,
    //     type: r2 ? 'bet' : 'settle'
    //   };
    //   //收到数据
    //   this.receiveData(mockData);
    // })
  }

  receiveData(newData: ReceiveData) {
    console.log('---统计面板收到数据---', newData);
    if (!this.datas[newData.gameId]) {
      this.games.push({ name: newData.gameName, id: newData.gameId });
      this.datas[newData.gameId] = {
        total: {
          reward: 0,
          amount: 0,
          win: 0,
          lose: 0,
        },
        chartData: [],
      };
    }
    switch (newData.type) {
      case 'bet':
        this.datas[newData.gameId].total.amount += Math.abs(newData.amount);
        this.datas['all'].total.amount += Math.abs(newData.amount);
        break;
      case 'settle':
        if (newData.amount > 0) {
          this.datas[newData.gameId].total.win += 1;
          this.datas['all'].total.win += 1;
        } else if (newData.amount < 0) {
          this.datas[newData.gameId].total.lose += 1;
          this.datas['all'].total.lose += 1;
        }
        this.datas[newData.gameId].total.reward += newData.amount;
        this.datas['all'].total.reward += newData.amount;
        const data = { x: Date.now(), y: newData.amount };
        this.datas[newData.gameId].chartData.push(data);
        this.datas['all'].chartData.push(data);
        break;
    }
    this.updateChart$.next(true);
  }

  reset(reBuild: boolean = true) {
    this.selectGame = 'all';
    this.games = [
      {
        name: '全部',
        id: 'all',
      },
    ];
    this.datas = {
      all: {
        total: {
          reward: 0,
          amount: 0,
          win: 0,
          lose: 0,
        },
        chartData: [],
      },
    };
    if (reBuild) this.buildChart();
  }

  menuChange() {
    switch (this.selectMenu) {
      case 1:
      case 2:
        if (!this.chartComponentRef) {
          this.buildChart();
        }
        break;
      case 3:
        this.destroyChart();
        break;
    }
  }

  gameChange() {
    this.buildChart();
  }

  updatePosition(newPosition?: Point) {
    if (newPosition) {
      this.currentDragPosition = JSON.parse(JSON.stringify(newPosition));
    } else if (this.dragCom) {
      this.currentDragPosition = this.dragCom?.getFreeDragPosition();
    }
    this.localStorageService.statisticsPanelPosition = this.currentDragPosition;
  }

  buildChart() {
    if (!this.show || !this.tzAct) return;
    this.destroyChart();
    timer(0).subscribe(_ => {
      import('ng-apexcharts').then((module: any) => {
        const componentFactory = this.factory.resolveComponentFactory<ChartComponent>(module.ChartComponent);
        this.chartComponentRef = this.chartContainer.createComponent<ChartComponent>(
          componentFactory,
          undefined,
          this.chartContainer.injector,
        );
        this.chartComponentRef.instance.chart = { type: 'area', sparkline: { enabled: true } };
        this.chartComponentRef.instance.series = [];
        this.updateChart$.next(true);
      });
    });
  }

  destroyChart() {
    if (this.chartComponentRef) {
      this.chartComponentRef.destroy();
      this.chartComponentRef = undefined;
    }
  }

  updateChart() {
    if (!this.chartComponentRef || !this.tzAct) return;
    const defaultx = this.datas[this.selectGame].chartData[0] ? this.datas[this.selectGame].chartData[0].x - 1000 : 0;
    this.chartOptions = {
      series: [
        {
          data: [{ x: defaultx, y: 0 }, ...this.datas[this.selectGame].chartData],
          type: 'area',
        },
        {
          data: [{ x: defaultx, y: 0 }, ...this.datas[this.selectGame].chartData],
          type: 'line',
        },
      ],
      chart: {
        height: '100%',
        width: '100%',
        toolbar: {
          show: false,
        },
        events: {
          mouseMove: function (event: any) {
            if (event?.path?.length) {
              event.path[0].style.cursor = 'default';
            }
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: [0, 2],
      },
      legend: {
        show: false,
      },
      xaxis: {
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          show: true,
        },
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        show: false,
        tooltip: {
          enabled: false,
        },
      },
      fill: {
        type: ['gradient', 'gradient'],
        gradient: {
          type: 'vertical',
          colorStops: [],
        },
      },
      tooltip: {
        fixed: {
          enabled: true,
          position: 'topLeft',
          offsetX: -2,
          offsetY: -18,
        },
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const v = series[seriesIndex][dataPointIndex];
          return `<em class="${v < 0 ? 'lose' : 'win'}">${this.currencyValuePipe.transform(
            v,
            this.currentCurrency,
          )}</em><img src="${this.currencies.icon}">`;
        },
      },
      grid: {
        show: false,
      },
      annotations: {
        yaxis: [
          {
            y: 0,
            borderColor: 'var(--input-border-color)',
            strokeDashArray: 0,
            opacity: 0.7,
          },
        ],
      },
      markers: {
        colors: 'var(--tooltip-bg-color)',
        strokeWidth: 0,
      },
    };
    //根据 series 更新颜色
    const values: number[] = this.chartOptions.series[0].data
      .map((x: any) => Number(x.y))
      .sort((a: number, b: number) => b - a);
    if (values.length > 0) {
      const max = values[0];
      const min = values[values.length - 1];
      let p: number;
      if (max <= 0) {
        //没有正数
        p = 0;
      } else if (min >= 0) {
        //没有负数
        p = 100;
      } else {
        p = max / (max + Math.abs(min));
      }
      this.chartOptions.fill.gradient.colorStops = [
        [
          { offset: 0, color: '#1DCC14', opacity: 0.8 },
          { offset: p * 100, color: '#1DCC14', opacity: 0.05 },
          { offset: p * 100, color: '#FE2247', opacity: 0.05 },
          { offset: 100, color: '#FE2247', opacity: 0.8 },
        ],
        [
          { offset: 0, color: '#1DCC14', opacity: 1 },
          { offset: p * 100, color: '#1DCC14', opacity: 1 },
          { offset: p * 100, color: '#FE2247', opacity: 1 },
          { offset: 100, color: '#FE2247', opacity: 1 },
        ],
      ];
    }
    //更新组件
    this.chartComponentRef.instance.updateOptions(this.chartOptions);
  }
}
