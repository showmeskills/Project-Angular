import { ApexOptions } from 'ng-apexcharts/lib/model/apex-types';

/**
 * 各KYC等级认证时间段线性图标配置
 */
export const kycGraphOptions: ApexOptions = {
  series: [
    {
      name: '当日成功人数',
      data: [],
    },
  ],
  chart: {
    height: '330px',
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
    colors: ['#50cd89'], // 类型string[]
  },
  grid: {
    show: true,
    padding: {
      bottom: -15,
    },
  },
  xaxis: {
    type: 'datetime',
    // @ts-ignore
    lines: {
      show: true,
    },
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    labels: {
      show: true,
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
    enabled: true,
  },
  fill: {
    colors: ['rgba(80, 205, 137, 0.2)'],
    opacity: 1,
    type: 'solid',
  },
};

/**
 * 天眼查
 */
export const tianYanChaOptions: ApexOptions = {
  series: [0, 0, 0],
  chart: {
    width: '100%',
    height: 280,
    type: 'donut',
    redrawOnParentResize: true,
  },
  labels: ['失败', '成功', '审核中'],
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
    custom({ series, seriesIndex, w }) {
      return `
            <div class='lh-14 p-2 bg-fff px-5 py-4 lh-20'>
              <div class="fz-12 color-999">${w.globals.labels[seriesIndex]}</div>
              <div class='fz-18 color-222'>${series[seriesIndex]}%</div>
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
  colors: ['#e4e6ef', '#50cd89', '#8192f5'],
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
    fontSize: '14px',
    markers: {
      width: 8,
      height: 4,
      radius: 0,
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
    formatter: function (seriesName, opts) {
      return [
        '<span class="flex-1">',
        seriesName,
        '</span>',
        `<span class='color-ddd'>${opts.w.globals.series[opts.seriesIndex]}%</span>`,
      ];
    } as any,
  },
};

/**
 * Jumio图表配置
 */
export const jumioChatOptions: ApexOptions = {
  series: [0, 0, 0],
  chart: {
    width: '100%',
    height: 280,
    type: 'donut',
    redrawOnParentResize: true,
  },
  labels: ['失败', '成功', '审核中'],
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
    custom({ series, seriesIndex, w }) {
      return `
            <div class='lh-14 p-2 bg-fff px-5 py-4 lh-20'>
              <div class="fz-12 color-999">${w.globals.labels[seriesIndex]}</div>
              <div class='fz-18 color-222'>${series[seriesIndex]}%</div>
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
  colors: ['#e4e6ef', '#50cd89', '#8192f5'],
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
    fontSize: '14px',
    markers: {
      width: 8,
      height: 4,
      radius: 0,
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
    formatter: function (seriesName, opts) {
      return [
        '<span class="flex-1">',
        seriesName,
        '</span>',
        `<span class='color-ddd'>${opts.w.globals.series[opts.seriesIndex]}%</span>`,
      ];
    } as any,
  },
};

/**
 * 腾讯云慧图表配置
 */
export const tencentYunHuiChatOptions: ApexOptions = {
  series: [0, 0, 0],
  chart: {
    width: '100%',
    height: 280,
    type: 'donut',
    redrawOnParentResize: true,
  },
  labels: ['失败', '成功', '审核中'],
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
    custom({ series, seriesIndex, w }) {
      return `
            <div class='lh-14 p-2 bg-fff px-5 py-4 lh-20'>
              <div class="fz-12 color-999">${w.globals.labels[seriesIndex]}</div>
              <div class='fz-18 color-222'>${series[seriesIndex]}%</div>
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
  colors: ['#e4e6ef', '#50cd89', '#8192f5'],
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
    fontSize: '14px',
    markers: {
      width: 8,
      height: 4,
      radius: 0,
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
    formatter: function (seriesName, opts) {
      return [
        '<span class="flex-1">',
        seriesName,
        '</span>',
        `<span class='color-ddd'>${opts.w.globals.series[opts.seriesIndex]}%</span>`,
      ];
    } as any,
  },
};
