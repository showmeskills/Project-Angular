import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { TableHader } from 'src/app/shared/interfaces/affiliate.interface';
import { AgentDataView } from 'src/app/shared/interfaces/friend.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { WebRankPopUpComponent } from '../web-rank-pop-up/web-rank-pop-up.component';
import { AffiliateApi } from './../../../../shared/apis/affiliate.api';

@UntilDestroy()
@Component({
  selector: 'app-data-overview',
  templateUrl: './data-overview.component.html',
  styleUrls: ['./data-overview.component.scss'],
})
export class DataOverviewComponent implements OnInit {
  @Input() importByOhterComponent!: string; //被哪个组件引入

  dataOverivewNavList: any[] = [
    { code: 0, value: this.localeService.getValue(`all_time00`) },
    { code: 1, value: this.localeService.getValue(`yestday00`) },
    { code: 2, value: this.localeService.getValue(`t_week00`) },
    { code: 3, value: this.localeService.getValue(`t_month00`) },
  ];
  //数据总览时间导航
  isActiveTimesIndex: number = 0; //默认激活全部时间

  rewardList: any[] = [
    { title: this.localeService.getValue(`u_ear00`), tipToolInfo: 'u_ear01' },
    { title: this.localeService.getValue(`meb_sta00`), tipToolInfo: 'meb_sta01' },
    { title: this.localeService.getValue(`meb_num00`), tipToolInfo: 'meb_num01' },
    { title: this.localeService.getValue(`top_ref00`), tipToolInfo: 'top_ref01' },
  ];

  tableHead: TableHader[] = [
    { headTitle: this.localeService.getValue(`total_win00`) },
    { headTitle: this.localeService.getValue(`ven_fee00`) },
    { headTitle: this.localeService.getValue(`pay_fee00`) },
    { headTitle: this.localeService.getValue(`bonus`) },
    { headTitle: this.localeService.getValue(`plat_fee00`) },
    { headTitle: this.localeService.getValue(`acc_adjust00`) },
    { headTitle: this.localeService.getValue(`aff_re_fr`) },
    { headTitle: this.localeService.getValue(`aff_rev00`) },
  ];

  isH5!: boolean;
  isLoading!: boolean; //加载loading;
  dataView: any = {}; // 总览数据返回
  tableData: any = {}; //联盟table数据
  loading: boolean = false;
  rebateCurrency: any[] = [];
  incomeCurrency: any[] = [];
  totalDataloding: boolean = false;

  constructor(
    private layout: LayoutService,
    private affiliateApi: AffiliateApi,
    private friendApi: FriendApi,
    private localeService: LocaleService,
    private appService: AppService,
    private router: Router,
    private dialog: MatDialog,
    private generalService: GeneralService
  ) {}

  get langCode() {
    return this.appService.languageCode;
  }

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.onSelectTime(0);
    if (this.importByOhterComponent == 'affiliate') {
      this.getInitTableData();
    }
  }

  /**@getInitTableData 联盟表格数据 */
  getInitTableData() {
    this.loading = true;
    this.affiliateApi.getAgentDataView().subscribe((data: AgentDataView) => {
      this.loading = false;
      this.tableData = data;
      this.rebateCurrency = Object.keys(data.rebateCurrency);
      this.incomeCurrency = Object.keys(data.incomeCurrency);
    });
  }

  /**
   * @param beginTime
   * @param endTime
   * @getDataView  获取数据总览
   * @beginTime 开始时间
   * @endTime 结束时间
   */
  getDataView(beginTime: number, endTime: number) {
    this.totalDataloding = true;
    this.friendApi.getDataView({ beginTime, endTime }).subscribe(data => {
      this.totalDataloding = false;
      if (data) {
        this.dataView = data;
      }
    });
  }

  //数据总览 选择当前时间
  onSelectTime(idx: number) {
    this.isActiveTimesIndex = idx;
    switch (idx) {
      case 0:
        this.getDataView(0, 0);
        return;
      case 1:
        const yesterdayMon = this.generalService.getStartEndDateArray('yesterday')[0];
        const yesterdayNig = this.generalService.getStartEndDateArray('yesterday')[1];
        this.getDataView(yesterdayMon, yesterdayNig);
        return;
      case 2:
        const monday = this.generalService.getStartEndDateArray('currentWeek')[0];
        const sunday = this.generalService.getStartEndDateArray('currentWeek')[1];
        this.getDataView(monday, sunday);
        return;
      case 3:
        const thisMonthFirst = this.generalService.getStartEndDateArray('currentMonth')[0];
        const thisMonthLast = this.generalService.getStartEndDateArray('currentMonth')[1];
        this.getDataView(thisMonthFirst, thisMonthLast);
        return;
    }
  }

  /**@openWebRankPopup 打开顶级推荐人的弹窗或者H5页面*/
  openWebRankPopup() {
    if (this.isH5) {
      this.router.navigate([this.appService.languageCode, 'referral', 'recommendRank']);
    } else {
      this.dialog.open(WebRankPopUpComponent, {
        disableClose: true,
        panelClass: 'rank-dialog-container',
      });
    }
  }
}
