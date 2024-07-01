import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexResponsive,
  ApexStates,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart?: ApexChart;
  xAxis?: ApexXAxis;
  yAxis?: ApexYAxis;
  grid?: ApexGrid;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  responsive?: ApexResponsive;
  plotOptions?: ApexPlotOptions;
  states?: ApexStates;
  labels?: string[];
  tooltip?: ApexTooltip;
};
