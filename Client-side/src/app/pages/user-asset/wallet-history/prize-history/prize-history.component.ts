import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ActivityApi } from 'src/app/shared/apis/activity.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { WheelHistoryItem } from 'src/app/shared/interfaces/activity.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-prize-history',
  templateUrl: './prize-history.component.html',
  styleUrls: ['./prize-history.component.scss'],
})
export class PrizeHistoryComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private generalService: GeneralService,
    private localeService: LocaleService,
    private activityApi: ActivityApi
  ) {}

  isH5!: boolean;

  /**时间菜单 */
  selectedTime: number[] = this.generalService.getStartEndDateArray('30days');
  selectedTimeValue: string = '30days';
  timeOptions = [
    { name: this.localeService.getValue('past_a_d'), value: '7days' },
    { name: this.localeService.getValue('past_b_d'), value: '30days', default: true },
    { name: this.localeService.getValue('past_c_d'), value: '90days' },
    { name: this.localeService.getValue('past_d_d'), value: 'customize' },
  ];

  /**分页 */
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  // 加载状态
  loading: boolean = true;

  /**记录数据 */
  dataList: WheelHistoryItem[] = [];

  ngOnInit() {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.loadData();
  }

  /**获取数据 */
  loadData() {
    this.loading = true;
    this.activityApi
      .getturntablspinhistory(this.selectedTime[0], this.selectedTime[1], this.paginator.page, this.paginator.pageSize)
      .subscribe(res => {
        this.loading = false;
        if (res?.data) {
          this.paginator.total = res.data.total;
          if (this.isH5) {
            this.dataList.push(...res.data.histories);
          } else {
            this.dataList = res.data.histories;
          }
        }
      });
  }

  onSearch() {
    this.paginator.page = 1;
    this.paginator.total = 0;
    this.dataList = [];
    this.loadData();
  }

  /**重置 */
  reset() {
    this.paginator.page = 1;
    this.paginator.total = 0;
    this.dataList = [];
    this.selectedTime = [];
  }
}
