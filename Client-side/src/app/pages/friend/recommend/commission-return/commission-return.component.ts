import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { TableHader } from 'src/app/shared/interfaces/affiliate.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { FriendService } from '../../friend.service';

@UntilDestroy()
@Component({
  selector: 'app-commission-return',
  templateUrl: './commission-return.component.html',
  styleUrls: ['./commission-return.component.scss'],
})
export class CommissionReturnComponent implements OnInit {
  isH5!: boolean;

  commissionReturnNavItem: any[] = []; //佣金返还导航
  isActiveComReturnIndex: number = 0; //默认激活总览
  tableHead: TableHader[] = [
    {
      headTitle: this.localeService.getValue(`dates`),
    },
    {
      headTitle: this.localeService.getValue(`friends_id`),
    },
    {
      headTitle: this.localeService.getValue(`tran_flow00`),
    },
    {
      headTitle: this.localeService.getValue(`return_ratio`),
    },
    {
      headTitle: this.localeService.getValue(`ref_amo00`),
    },
  ];

  // 设备列表分页信息
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };
  commissionReturnList: any[] = [];
  loading: boolean = false;

  /**@mainLoading 首次刷新loading */
  mainLoading: boolean = false;

  constructor(
    private layout: LayoutService,
    private friendService: FriendService,
    private friendApi: FriendApi,
    private localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.mainLoading = true;
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.friendService.gameType$.pipe(untilDestroyed(this)).subscribe(list => {
      this.commissionReturnNavItem = list || [];
      if (this.commissionReturnNavItem.length > 0) this.loadData();
    });
  }

  /**
   * 初始化数据
   *
   * @param paginator 页码
   */
  loadData(paginator?: any) {
    if (paginator) {
      this.paginator.page = paginator.page;
      this.paginator.pageSize = paginator.pageSize;
    }
    this.loading = true;
    const params = {
      gameType: this.commissionReturnNavItem[this.isActiveComReturnIndex].value,
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.friendApi.getCommissionReturn(params).subscribe((data: any) => {
      this.loading = false;
      this.mainLoading = false;
      this.commissionReturnList = data.list || [];
      this.paginator.total = data.total;
    });
  }

  /**
   * 选择佣金返还类型
   *
   * @param idx 下标
   */

  onSelectComReturnItem(idx: number) {
    this.isActiveComReturnIndex = idx;
    this.paginator = {
      page: 1,
      pageSize: 10,
      total: 0,
    };
    this.loadData();
  }
  //打开佣金返还线图
  openLineChartDialog(): void {
    this.friendService.commingSoon();
    // this.dialog.open(FriendLineChartComponent, {
    //   disableClose: true,
    //   panelClass: 'custom-dialog-container',
    //   data: { title: "佣金返还" }
    // })
  }
}
