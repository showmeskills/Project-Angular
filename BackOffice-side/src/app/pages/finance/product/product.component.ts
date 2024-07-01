import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ChartOptions } from 'src/app/shared/interfaces/chart-option';
import { PaginatorState, PageSizes } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import { DrawerService } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf } from '@angular/common';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { TooltipDirective } from 'src/app/shared/directive/tooltip.directive';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [
    NgApexchartsModule,
    TooltipDirective,
    CurrencyIconDirective,
    NgFor,
    AngularSvgIconModule,
    NgIf,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    PaginatorComponent,
    LangPipe,
  ],
})
export class ProductComponent implements OnInit {
  @ViewChild('chart') chart;
  public lineChart: Partial<ChartOptions> | any;
  public lineChart2: Partial<ChartOptions> | any;
  public barChartOptions: Partial<ChartOptions> | any;
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any = [{}, {}, {}, {}, {}, {}, {}];
  isLoading = false; // 是否处于加载
  listPopupKey = 0; // 是否处于加载
  constructor(
    private appService: AppService,
    private drawer: DrawerService
  ) {
    this.lineChart = {
      series: [
        {
          name: '',
          data: [
            [1666310400000, 3603014.78],
            [1666396800000, 12345.78],
            [1666483200000, 222436.78],
            [1666569600000, 54444.78],
            [1666669600000, 45345.78],
          ],
        },
      ],
      chart: {
        height: 320,
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
    this.lineChart2 = {
      series: [
        {
          data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6],
        },
      ],
      chart: {
        height: 300,
        toolbar: {
          show: false,
        },
        type: 'bar',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758'],
        },
      },

      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        position: 'top',
        labels: {
          offsetY: -18,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: 'gradient',
            gradient: {
              colorFrom: '#D8E3F0',
              colorTo: '#BED1E6',
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
          offsetY: -35,
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [50, 0, 100, 100],
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val) {
            return val + '%';
          },
        },
      },
      title: {
        text: 'Monthly Inflation in Argentina, 2002',
        floating: 0,
        offsetY: 320,
        align: 'center',
        style: {
          color: '#444',
        },
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

  ngOnInit(): void {}
  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  closeListPopup() {
    this.closeListDialog.close();
  }

  // 列表弹窗
  @ViewChild('listPopup') listPopup: TemplateRef<any>;
  closeListDialog: any;

  openPopup(listPopupKey: number) {
    this.listPopupKey = listPopupKey;
    this.closeListDialog = this.drawer.open(this.listPopup, {
      width: '660px',
    });
  }
}
