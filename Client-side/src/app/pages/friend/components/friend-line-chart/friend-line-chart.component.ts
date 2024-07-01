import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import { AppService } from 'src/app/app.service';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { FriendService } from './../../friend.service';
export type DialogDataSubmitCallback<T> = (row: T) => void;
@UntilDestroy()
@Component({
  selector: 'app-friend-line-chart',
  templateUrl: './friend-line-chart.component.html',
  styleUrls: ['./friend-line-chart.component.scss'],
})
export class FriendLineChartComponent implements OnInit {
  isH5!: boolean;

  btnList: any[] = [
    { name: this.localeService.getValue('amount'), value: 0 },
    { name: this.localeService.getValue('num_peop00'), value: 1 },
  ]; //按钮数组

  isActiveBtnIndex: number = 0;

  btnListTwo: any[] = [
    { name: this.localeService.getValue('aff_c_jy') },
    { name: this.localeService.getValue('back') },
  ]; //按钮数组2

  isActiveBtnTwoIndex!: number;

  gameType: string = 'All';

  projectList: any[] = [];

  loading: boolean = false;

  total: number = 0;

  count: number = 0; //交易金额

  commission: number = 0; //返还金额

  beginTime: any = 0;

  endTime: any = 0;

  series: any[] = []; //统计表

  categories: any[] = []; //统计表

  chartReady!: boolean;

  constructor(
    private dialogRef: MatDialogRef<FriendLineChartComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { callback: DialogDataSubmitCallback<any>; title: string },
    private appService: AppService,
    private friendService: FriendService,
    private friendApi: FriendApi,
    private layout: LayoutService,
    private localeService: LocaleService,
    private generalService: GeneralService,
  ) {}

  /** 限定最多三个月*/
  get maxDate() {
    if (this.beginTime) return moment(this.beginTime).add(89, 'days');
    return undefined;
  }

  /** 选择日期 */
  onDateChange() {
    this.loadData();
  }

  //chart
  form!: any;
  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.friendService.gameType$.subscribe(list => {
      this.projectList = list || [];
    });
    this.loadData();
  }

  // 虽然已经对接 这个功能是暂时关闭的
  async loadData() {
    this.loading = true;
    const params = {
      type: this.btnList[this.isActiveBtnIndex].value,
      gameType: this.gameType,
      beginTime: this.beginTime,
      endTime: this.endTime,
    };
    try {
      const { success, data }: any = await this.friendApi.getCommissionTrend(params);
      if (success) {
        if (data) {
          this.count = data.count;
          this.commission = data.commission;
          this.total = data.total;
          this.categories = data.data.map((item: any) => this.getDate(item.date));
          if (this.isActiveBtnTwoIndex == null) {
            this.series = data.data.map((item: any) => item.total);
          } else if (this.isActiveBtnTwoIndex == 0) {
            this.series = data.data.map((item: any) => item.count);
          } else {
            this.series = data.data.map((item: any) => item.commission);
          }
        }
      }
    } catch (e) {
      throw new Error('friend-line-chart error');
    } finally {
      this.loading = false;
      this.createLineChart();
      this.chartReady = true;
    }
  }

  //创建图形
  createLineChart() {
    const amountText: string = this.localeService.getValue('amount_transaction');
    this.form = {
      series: [{ data: this.series }],
      markers: {
        // 图标
        colors: '#fb6943',
        shape: undefined,
        strokeColors: undefined,
        strokeWidth: 0,
      },
      tooltip: {
        fixed: {
          enabled: false,
          position: 'topLeft',
        },
        custom: function (options: any) {
          return `
              <div class="arrow-box">
                <p>2022-${options.w.globals.categoryLabels[options.dataPointIndex]}</p>
                <p>${amountText}</p>
                <p>${options.series[options.seriesIndex][options.dataPointIndex]}</p>
              </div>
            `;
        },
      },
      chart: {
        id: 'friendLineChart',
        height: 350,
        type: 'line',
        toolbar: {
          show: false,
        },
      },
      title: {
        show: false,
      },
      xaxis: {
        labels: {
          trim: false,
        },
        categories: this.categories,
      },
      grid: {
        borderColor: '#f1f1f1',
      },
    };
  }

  /**@onChangeSelect 选择游戏类型*/
  onChangeSelect() {}

  //获取日志
  getDate(timeStamp: number) {
    return moment(timeStamp).format('MM-DD');
  }

  //切换按钮
  onClickItem(idx: number): void {
    this.isActiveBtnIndex = idx;
    this.loadData();
  }

  //切换按钮2
  onClickItemMethod(idx: number): void {
    this.isActiveBtnTwoIndex = idx;
    if (idx == 0) {
      this.total = this.count;
    } else {
      this.total = this.commission;
    }
    this.loadData();
  }

  //关闭弹窗
  close(): void {
    this.dialogRef.close();
  }
}
