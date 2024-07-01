import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { finalize, map } from 'rxjs/operators';
import { HistoryApi } from 'src/app/shared/apis/history.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { StatusListInterface, UserActivityLog } from 'src/app/shared/interfaces/history.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';

@UntilDestroy()
@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
})
export class ActivitiesComponent implements OnInit {
  constructor(
    private historyApi: HistoryApi,
    private popup: PopupService,
    private layout: LayoutService,
    private localeService: LocaleService,
    private generalService: GeneralService
  ) {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => {
      this.isH5 = e;
      // 切换模式如果有数据需要清空数据重新初始化，因为h5数据是全部显示的，web是只显示当前10个
      if (this.loginHistoryData.length > 0) this.reLoadLoginHistory(true);
      if (this.operationHistoryData.length > 0) this.reLoadOperationHistory(true);
    });
  }

  isH5!: boolean;
  statusLabels: StatusListInterface[] = []; //
  selectedTabIndex = 0; //当前选择tab 0:登录活动 1:安全操作

  loginHistoryData: UserActivityLog[] = []; //登录数据
  loginHistoryLoading!: boolean; //登录数据加载中
  loginHistoryPaginator: PaginatorState = {
    //登录数据分页
    page: 1,
    pageSize: 10,
    total: 0,
  };

  operationHistoryData: UserActivityLog[] = []; //操作数据
  operationHistoryLoading!: boolean; //操作数据加载中
  operationHistoryPaginator: PaginatorState = {
    //操作数据分页
    page: 1,
    pageSize: 10,
    total: 0,
  };

  @ViewChild('h5FilterPopupTemplate') h5FilterPopupTemplate!: TemplateRef<any>;
  H5FilterPopup!: MatDialogRef<any>;

  //搜索时间
  // selectedTime: number = 1;   //当前选择，默认1天
  // searchTime = [
  //   { name: this.localeService.getValue('one_d'), value: 1 },
  //   { name: this.localeService.getValue('seven_day'), value: 7 },
  //   { name: this.localeService.getValue('one_month'), value: 30 },
  //   { name: this.localeService.getValue('three_m'), value: 90 }
  // ];

  /**时间菜单 */
  selectedTime: number[] = this.generalService.getStartEndDateArray('today');
  selectedTimeValue: string = 'today';
  timeOptions = [
    { name: this.localeService.getValue('today'), value: 'today', default: true },
    { name: this.localeService.getValue('seven_days'), value: '7days' },
    { name: this.localeService.getValue('thirty_days'), value: '30days' },
    { name: this.localeService.getValue('past_c_d'), value: '90days' },
    { name: this.localeService.getValue('custom_time'), value: 'customize' },
  ];

  // selectedTime: number[] = this.generalService.getStartEndDateArray("30days");
  // selectedTimeValue: string = '30days';
  // timeOptions = [
  //   { name: this.localeService.getValue("past_a_d"), value: "7days" },
  //   { name: this.localeService.getValue("past_b_d"), value: "30days", default: true },
  //   { name: this.localeService.getValue("past_c_d"), value: "90days" },
  //   { name: this.localeService.getValue("past_d_d"), value: "customize" }
  // ];

  //搜索状态
  selectedStatus: number = 0; //当前选择，默认全部
  searchStatus = [
    { name: this.localeService.getValue('all'), value: 0 },
    { name: this.localeService.getValue('complete'), value: 1 },
    { name: this.localeService.getValue('failed'), value: 2 },
  ];

  ngOnInit() {
    this.historyApi.getStatusList().subscribe(e => (this.statusLabels = e?.data || []));
    this.loadLoginHistory();
    this.loadOperationHistory();
  }

  //获取登录历史 后端最长允许180天，产品确认默认显示180天
  loadLoginHistory() {
    const [start, end] = this.generalService.getStartEndDateArray(179); // 含当天，所以实际需要-1天，否则超了后端数据会变空
    this.loginHistoryLoading = true;
    this.historyApi
      .getLoginHistory(start, end, this.loginHistoryPaginator.page, this.loginHistoryPaginator.pageSize)
      .pipe(
        map(v => v.data),
        finalize(() => (this.loginHistoryLoading = false))
      )
      .subscribe(data => {
        this.loginHistoryPaginator.total = data.total;
        if (this.isH5) {
          // h5是滚动加载显示全部，用push追加
          this.loginHistoryData.push(...data.list);
        } else {
          // web直接赋值替换当前页内容
          this.loginHistoryData = data.list;
        }
      });
  }

  //获取操作数据, 后端最长允许180天, 默认一天
  loadOperationHistory() {
    // const { start, end } = this.getStartEndDate(this.selectedTime);
    this.operationHistoryLoading = true;
    this.historyApi
      .getOpreationHistory(
        this.selectedTime[0],
        this.selectedTime[1],
        // start,
        // end,
        this.selectedStatus,
        this.operationHistoryPaginator.page,
        this.operationHistoryPaginator.pageSize
      )
      .pipe(
        map(v => v.data),
        finalize(() => (this.operationHistoryLoading = false))
      )
      .subscribe(data => {
        this.operationHistoryPaginator.total = data.total;
        if (this.isH5) {
          // h5是滚动加载显示全部，用push追加
          this.operationHistoryData.push(...data.list);
        } else {
          // web直接赋值替换当前页内容
          this.operationHistoryData = data.list;
        }
      });
  }

  //重新开始获取登录记录 clean 为true时候强制清空
  reLoadLoginHistory(clean: boolean = false) {
    this.loginHistoryPaginator.page = 1;
    if (this.isH5) this.loginHistoryPaginator.total = 0;
    if (clean || this.isH5) this.loginHistoryData = []; //h5才需要清数据，web会重新赋值
    this.loadLoginHistory();
  }

  //重新开始获取操作记录 clean 为true时候强制清空
  reLoadOperationHistory(clean: boolean = false) {
    this.operationHistoryPaginator.page = 1;
    if (this.isH5) this.operationHistoryPaginator.total = 0;
    if (clean || this.isH5) this.operationHistoryData = []; //h5才需要清数据，web会重新赋值
    this.loadOperationHistory();
  }

  // 重置操作记录选项
  onOperationReset() {
    this.selectedTime = [];
    this.selectedStatus = 0;
  }

  //打开h5选择窗口
  openh5Filter() {
    this.H5FilterPopup = this.popup.open(this.h5FilterPopupTemplate, {
      inAnimation: 'fadeInRight',
      outAnimation: 'fadeOutRight',
      speed: 'fast',
      autoFocus: false,
      isFull: true,
    });
  }

  //获取时间
  // getStartEndDate(days: number): any {
  //   return {
  //     start: moment().subtract(days, 'days').valueOf(),
  //     end: moment().valueOf()
  //   }
  // }
}
