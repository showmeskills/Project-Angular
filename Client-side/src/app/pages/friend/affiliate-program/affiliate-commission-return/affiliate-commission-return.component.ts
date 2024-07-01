import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AffiliateApi } from 'src/app/shared/apis/affiliate.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { TableHader } from 'src/app/shared/interfaces/affiliate.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { FriendService } from '../../friend.service';

@UntilDestroy()
@Component({
  selector: 'app-affiliate-commission-return',
  templateUrl: './affiliate-commission-return.component.html',
  styleUrls: ['./affiliate-commission-return.component.scss'],
})
export class AffiliateCommissionReturnComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private affiliateApi: AffiliateApi,
    public localeService: LocaleService,
    private friendService: FriendService
  ) {}

  isH5!: boolean;

  /** 交易总览表头 */
  transOverviewTableHeader: TableHader[] = [
    { headTitle: this.localeService.getValue('dates') },
    { headTitle: this.localeService.getValue('aff_c_jyrs') },
    { headTitle: this.localeService.getValue('aff_re_lr') },
    { headTitle: this.localeService.getValue('aff_re_hl') },
    { headTitle: this.localeService.getValue('fees') },
    { headTitle: this.localeService.getValue('aff_re_fees') },
    { headTitle: this.localeService.getValue('aff_re_fr') },
    { headTitle: this.localeService.getValue('aff_rev00') },
  ];

  /** 产品利润表头 */
  dailProfitTableHeader: TableHader[] = [
    { headTitle: this.localeService.getValue('dates') },
    { headTitle: this.localeService.getValue('aff_c_tycp') },
    { headTitle: this.localeService.getValue('aff_c_ylccp') },
    { headTitle: this.localeService.getValue('aff_c_cpcp') },
    { headTitle: this.localeService.getValue('aff_c_qpcp') },
  ];

  /** 费用明细表头*/
  costInfoTableHeader: TableHader[] = [
    { headTitle: this.localeService.getValue('dates') },
    { headTitle: this.localeService.getValue('plat_fee00') },
    { headTitle: this.localeService.getValue('ven_fee00') },
    { headTitle: this.localeService.getValue('aff_re_fee') },
  ];

  /** 佣金返还表头*/
  commmissionTableHeader: TableHader[] = [
    { headTitle: this.localeService.getValue('dates') },
    { headTitle: this.localeService.getValue('friends_id') },
    { headTitle: this.localeService.getValue('effective_flow') },
    { headTitle: this.localeService.getValue('return_ratio') },
    { headTitle: this.localeService.getValue('ref_amo00') },
    { headTitle: this.localeService.getValue('acc_sta00') },
  ];

  /** 联盟分成表头 */
  dividendHeader: TableHader[] = [
    { headTitle: this.localeService.getValue('dates') },
    { headTitle: this.localeService.getValue('aff_c_jyrs') },
    { headTitle: this.localeService.getValue('comm_type') },
    { headTitle: this.localeService.getValue('aff_rev00') },
    { headTitle: this.localeService.getValue('ratio') },
    { headTitle: this.localeService.getValue('acc_sta00') },
  ];

  /** 联盟返还导航  */
  affiliateCommissionNav: any[] = [
    { name: this.localeService.getValue('trade_overview') },
    { name: this.localeService.getValue('prod_details') },
    { name: this.localeService.getValue('overhead_details') },
    { name: this.localeService.getValue('aff_re_t') },
    { name: this.localeService.getValue('affiliate_share') },
  ];

  /** 导航激活下标 */
  isAffiliateNavActive: number = 0;

  /** 设备列表分页信息*/
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  /** 加载动画 */
  loading: boolean = false;

  /** 交易总览 */
  transactionOverview: any[] = [];

  /** 产品利润 */
  dailyProfit: any[] = [];

  /** 费用明细 */
  costInfo: any[] = [];

  /** 佣金返还*/
  commissionInfo: any[] = [];

  /** 联盟分成 */
  affiliateDividend: any[] = [];

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.loadData();
  }

  /**
   *  初始化数据
   *
   * @param paginator 是否更新分页
   * @returns void
   */
  loadData(paginator?: any) {
    if (paginator) {
      this.paginator.page = paginator.page;
      this.paginator.pageSize = paginator.pageSize;
    }
    this.loading = true;
    const params = {
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };

    switch (this.isAffiliateNavActive) {
      case 0:
        this.affiliateApi.getAgentCommissionOverview(params).subscribe(data => {
          this.loading = false;
          this.transactionOverview = data.list;
          this.paginator.total = data.total;
        });
        return;
      case 1:
        this.affiliateApi.getDailyProfit(params).subscribe(data => {
          this.loading = false;
          this.dailyProfit = data.list;
          this.paginator.total = data.total;
        });
        return;
      case 2:
        this.affiliateApi.getAgentCommissionConstInfo(params).subscribe(data => {
          this.loading = false;
          this.costInfo = data.list;
          this.paginator.total = data.total;
        });
        return;
      case 3:
        this.affiliateApi.getAgentCommissionReturn(params).subscribe(data => {
          this.loading = false;
          this.commissionInfo = data.list;
          this.paginator.total = data.total;
        });
        return;
      case 4:
        this.affiliateApi.getAgentDivideInto(params).subscribe(data => {
          this.loading = false;
          this.affiliateDividend = data.list;
          this.paginator.total = data.total;
        });
        return;
    }
  }

  //选择佣金返还类型
  onSelectComReturnItem(idx: number) {
    this.isAffiliateNavActive = idx;
    this.onReset();
    this.loadData();
  }

  onReset() {
    this.paginator = {
      page: 1,
      pageSize: 10,
      total: 0,
    };
  }

  //打开佣金返还线图
  openLineChartDialog(): void {
    this.friendService.commingSoon();
    // this.dialog.open(FriendLineChartComponent, {
    //   panelClass: 'custom-dialog-container',
    //   disableClose: true,
    //   data: { title: this.localeService.getValue('aff_re_t') }
    // })
  }
}
