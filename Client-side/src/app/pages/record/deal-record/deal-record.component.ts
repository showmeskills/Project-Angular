import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable } from 'rxjs';
import {
  CasinoDealRecordDetail,
  ChessDealRecordDetail,
  LotteryDealRecordDetail,
  SportDealRecordDetail,
  StatusSelect,
  WagerDayTotalData,
  WagerDaysTotalData,
} from 'src/app/shared/interfaces/gameorder.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PopupService } from 'src/app/shared/service/popup.service';
import { DealRecordService } from './deal-record.service';

@UntilDestroy()
@Component({
  selector: 'app-deal-record',
  templateUrl: './deal-record.component.html',
  styleUrls: ['./deal-record.component.scss'],
})
export class DealRecordComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private dealRecordService: DealRecordService,
    private popup: PopupService,
    private layout: LayoutService,
    private generalService: GeneralService,
    private localeService: LocaleService
  ) {}

  /**切换标签 */
  tabs = [
    { name: 'sports', page: 'sport' },
    { name: 'lottery', page: 'lottery' },
    { name: 'casino', page: 'casino' },
    { name: 'chess', page: 'poker' },
  ];
  /**是否h5 */
  isH5!: boolean;
  /**路由ident */
  ident!: 'sport' | 'casino' | 'poker' | 'lottery';

  /**状态下拉 */
  statusSelectValue = '';
  statusSelect: StatusSelect[] = [];

  /**时间范围下拉，默认今天 */
  selectedTime: number[] = [];
  selectedTimeType: string = 'today';
  timeOptions = [
    { name: this.localeService.getValue('today'), value: 'today', default: true },
    { name: this.localeService.getValue('seven_days'), value: '7days' },
    { name: this.localeService.getValue('thirty_days'), value: '30days' },
    { name: this.localeService.getValue('custom_time'), value: 'customize' },
  ];

  /**汇总数据 */
  totalDataList: WagerDaysTotalData | null = null;
  /**汇总加载中 */
  totalListLoading: boolean = true;
  /**状态选择加载中 */
  statusLoading: boolean = true;
  /**详情加载中 */
  detailLoading!: boolean;

  /**详情数据 */
  dealDetailData!: SportDealRecordDetail[] | CasinoDealRecordDetail | ChessDealRecordDetail | LotteryDealRecordDetail;

  /**详情弹窗 */
  @ViewChild('detailData') detailDataRef!: TemplateRef<any>;
  detailDataPopup!: MatDialogRef<any>;

  ngOnInit() {
    //根据路由变化初始化
    this.route.paramMap.pipe(untilDestroyed(this)).subscribe(params => {
      this.reset();
      this.resetData();
      this.ident = params.get('ident') as any;
      this.readyForSearch();
      this.loadTotalDataList();
    });

    //订阅是否h5
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
  }

  /**准备筛选数据 */
  readyForSearch() {
    //获取状态下拉并增加'全部'选项
    this.dealRecordService.getStatusSelect(this.ident).subscribe(e => {
      this.statusLoading = false;
      this.statusSelect = [this.dealRecordService.STATUS_ALL, ...e];
    });
  }

  /**重置筛选项 */
  reset() {
    this.statusSelectValue = '';
    this.selectedTime = [];
  }

  /**重置数据 */
  resetData() {
    this.totalListLoading = true;
    this.statusLoading = true;
    this.totalDataList = null;
  }

  /**展开某一天 */
  toggleExpand(day: WagerDayTotalData) {
    if (day.data.length < 1) {
      this.loadDailyData(day);
      return;
    }
    day.expanded = !day.expanded;
  }

  /**加载某一天的数据 */
  loadDailyData(day: WagerDayTotalData) {
    day.loading = true;
    const isNext = day.data.length > 0;
    this.dealRecordService
      .getWagerList(
        this.ident,
        this.statusSelectValue,
        this.generalService.getCustomDate(day.day, 'start', 'd', true),
        this.generalService.getCustomDate(day.day, 'end', 'd', true),
        isNext ? ++day.paginator.page : day.paginator.page,
        day.paginator.pageSize
      )
      .subscribe(data => {
        day.loading = false;
        if (data) {
          if (!isNext) day.expanded = true;
          day.paginator.total = data.total;
          day.data.push(...(data.list as any));
        }
      });
  }

  /**加载汇总数据 */
  loadTotalDataList() {
    this.totalListLoading = true;
    // 默认时间今天
    const selectedDate =
      this.selectedTime.length > 0 ? this.selectedTime : this.generalService.getStartEndDateArray('today', 'd', true);
    this.dealRecordService
      .getWagerDaytotal(this.ident, this.statusSelectValue, selectedDate[0], selectedDate[1])
      .subscribe(data => {
        this.totalListLoading = false;
        if (data) {
          // 增加渲染需要的属性
          data.list.forEach(x => {
            x.expanded = false;
            x.loading = false;
            x.paginator = {
              page: 1,
              pageSize: 10,
              total: x.count,
            };
            x.data = [];
          });
          this.totalDataList = data;
          // 如果有数据默认展开第一条
          if (data.list.length > 0) this.toggleExpand(data.list[0]);
        }
      });
  }

  /**加载某条记录的详情，加载完弹出 */
  loadDetail(item: any) {
    this.detailLoading = true;
    const api: Observable<
      SportDealRecordDetail[] | CasinoDealRecordDetail | ChessDealRecordDetail | LotteryDealRecordDetail
    > = {
      sport: this.dealRecordService.getsportdetail(item.wagerNumber),
      casino: this.dealRecordService.getcasinodetail(item.wagerNumber),
      poker: this.dealRecordService.getchessdetail(item.wagerNumber),
      lottery: this.dealRecordService.getlotterydetail(item.wagerNumber),
    }[this.ident];
    api.subscribe(data => {
      this.detailLoading = false;
      if (data) {
        this.dealDetailData = data;
        this.showDetail();
      }
    });
  }

  /**显示详情弹窗 */
  showDetail() {
    this.detailDataPopup = this.popup.open(this.detailDataRef, {
      inAnimation: this.isH5 ? 'fadeInUp' : undefined,
      outAnimation: this.isH5 ? 'fadeOutDown' : undefined,
      position: this.isH5 ? { bottom: '0px' } : undefined,
      speed: 'faster',
      autoFocus: false,
    });
  }

  /**选择了某个状态（用于h5时候自动筛选） */
  onStatusSelect() {
    if (!this.isH5) return;
    this.loadTotalDataList();
  }

  /**选择了某个时间（用于h5时候自动筛选） */
  onTimeSelect() {
    if (!this.isH5 || this.totalListLoading) return;
    this.loadTotalDataList();
  }
}
