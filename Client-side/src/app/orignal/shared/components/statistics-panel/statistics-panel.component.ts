import { CdkDrag, Point } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subject, combineLatest } from 'rxjs';
import { delay, filter, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { OrignalService } from 'src/app/orignal/orignal.service';
import { CurrenciesInterface } from 'src/app/shared/interfaces/deposit.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { ReceiveData } from '../../interfaces/response.interface';
type GameData = {
  total: {
    reward: number;
    amount: number;
    win: number;
    lose: number;
  };
  chartData: { x: number; y: number }[];
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
export class StatisticsPanelComponent implements OnInit, OnDestroy {
  constructor(
    private appService: AppService,
    public layout: LayoutService,
    public orignalService: OrignalService,
    private currencyValuePipe: CurrencyValuePipe,
  ) {}

  @ViewChild('dragCom') dragCom!: CdkDrag;

  currentCurrency!: string;
  currencies!: CurrenciesInterface;

  show: boolean = false;

  defaultDragPosition: Point = { x: 20, y: 20 };
  currentDragPosition!: Point;
  zIndex: 18 | 16 = 18;

  selectGame: string = 'all';

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

  updateChart$: Subject<boolean> = new Subject();

  chartOptions: any;

  chartReday = false;

  ngOnInit() {
    combineLatest([this.orignalService.statisticsPanelState$, this.updateChart$])
      .pipe(
        untilDestroyed(this),
        filter(([state]) => state),
        delay(300),
      )
      .subscribe(() => {
        this.updateChart();
      });

    combineLatest([
      this.appService.currentCurrency$.pipe(
        filter(x => !!x),
        tap(x => {
          this.currencies = x;
          this.currentCurrency = x.currency;
          this.reset();
        }),
      ),
      this.orignalService.statisticsPanelState$.pipe(
        tap((x: boolean) => {
          this.show = x;
          //设置初始位置
          if (x) {
            this.updatePosition(this.defaultDragPosition);
          }
        }),
      ),
    ])
      .pipe(untilDestroyed(this))
      .subscribe(([_, state]) => {
        if (!state) {
          //销毁动态图表
          this.chartReday = false;
        }
      });

    this.orignalService.chartMessage$.subscribe(data => this.receiveData(data));
  }

  ngOnDestroy(): void {
    this.orignalService.statisticsPanelState$.next(false);
    this.chartReday = false;
  }

  /**收到新数据 */
  receiveData(newData: ReceiveData) {
    if (!this.datas[newData.gameId]) {
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
      case 'set': {
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
      default:
        break;
    }
    this.updateChart$.next(true);
  }

  /**重置图表数据 */
  reset() {
    this.selectGame = 'all';
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
    this.chartReday = false;
    this.updateChart();
  }

  /**更新面板位置 */
  updatePosition(newPosition?: Point) {
    if (newPosition) {
      this.currentDragPosition = JSON.parse(JSON.stringify(newPosition));
    } else if (this.dragCom) {
      this.currentDragPosition = this.dragCom?.getFreeDragPosition();
    }
  }

  /**更新(同时激活)图表数据 */
  updateChart() {
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
    this.chartReday = true;
  }
}
