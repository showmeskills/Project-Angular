import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AffiliateApi } from 'src/app/shared/apis/affiliate.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { IDepositList } from 'src/app/shared/interfaces/affiliate.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';

@UntilDestroy()
@Component({
  selector: 'app-affiliate-data-comparsion',
  templateUrl: './affiliate-data-comparsion.component.html',
  styleUrls: ['./affiliate-data-comparsion.component.scss'],
})
export class AffiliateDataComparsionComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private affiliateApi: AffiliateApi,
    private localeService: LocaleService
  ) {}

  isH5!: boolean;

  /** 首存概览数据 */
  firstDepositList: IDepositList = {
    header: [
      {
        headTitle: this.localeService.getValue('degrade_uid'),
      },
      {
        headTitle: this.localeService.getValue('invite_code'),
      },
      {
        headTitle: this.localeService.getValue('reg_time'),
      },
      {
        headTitle: this.localeService.getValue('first_despot_date'),
        icon: 'icon-arrow-down',
      },
      {
        headTitle: this.localeService.getValue('first_deposit_amount'),
      },
      {
        headTitle: this.localeService.getValue('agent_amount'),
      },
      {
        headTitle: this.localeService.getValue('total_win00'),
      },
    ],
    list: [],
  };

  /** 加载状态 */
  loading: boolean = false;

  /** 设备列表分页信息*/
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.getFirstDepositList();
  }

  /**
   *  初始化数据
   *
   * @param paginator 是否更新分页
   * @returns void
   */
  getFirstDepositList(paginator?: any) {
    if (paginator) {
      this.paginator.page = paginator.page;
      this.paginator.pageSize = paginator.pageSize;
    }
    this.loading = true;
    const params = {
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.affiliateApi.getFirstDepositList(params).subscribe(data => {
      this.loading = false;
      this.firstDepositList.list = data.list;
      this.paginator.total = data.total;
    });
  }
}
