import { Component, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { combineLatest } from 'rxjs';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { TableHader } from 'src/app/shared/interfaces/affiliate.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { FriendService } from './../../friend.service';
@UntilDestroy()
@Component({
  selector: 'app-recommended-return',
  templateUrl: './recommended-return.component.html',
  styleUrls: ['./recommended-return.component.scss'],
})
export class RecommendedReturnComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private friendService: FriendService,
    private toast: ToastService,
    private friendApi: FriendApi,
    private localeService: LocaleService
  ) {}

  infoTips: string = this.localeService.getValue('sent_f');

  isH5!: boolean;

  /** 推荐返还类型 */
  recommendedReturnList: any[] = [];

  /** 表格头部 */
  tableHead: TableHader[] = [
    {
      headTitle: this.localeService.getValue('invit_id00'),
    },
    {
      headTitle: this.localeService.getValue('aff_c_jyrq'),
    },
    {
      headTitle: this.localeService.getValue('tran_flow00'),
    },
    {
      headTitle: this.localeService.getValue('return_ratio'),
    },
    {
      headTitle: this.localeService.getValue('ref_amo00'),
    },
    {
      headTitle: this.localeService.getValue('acc_sta00'),
    },
  ];
  /** 佣金返还导航 */
  recommendedReturnNavItem: any[] = [];

  /** 默认激活总览 */
  isActiveRecomReturnIndex: number = 0;

  /** 设备列表分页信息 */
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  /** 加载状态 */
  loading: boolean = false;

  /** 申请 */
  apply: any = {};

  applyLen!: number;

  isShowRequest!: boolean;

  /** 申请的loading状态*/
  applyLoading: boolean = false;

  /** 首次刷新loading */
  mainLoading: boolean = false;

  ngOnInit(): void {
    this.mainLoading = true;
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));

    combineLatest([this.friendApi.getUserApply(), this.friendService.gameType$]).subscribe(([apply, list]) => {
      this.apply = apply;
      this.applyLen = Object.keys(apply).length;
      this.recommendedReturnNavItem = list || [];
      if (this.recommendedReturnNavItem.length > 0) this.loadData();
    });
  }

  /**
   * 加载数据
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
      gameType: this.recommendedReturnNavItem[this.isActiveRecomReturnIndex].value,
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.friendApi.getCommssionInvite(params).subscribe((data: any) => {
      this.loading = false;
      this.mainLoading = false;
      this.recommendedReturnList = data.list || [];
      this.paginator.total = data.total;
    });
  }

  /**
   * 是否同意 发送过来的 绑定好友申请
   *
   * @param isAgree boolean值
   */
  submitApply(isAgree: boolean) {
    this.applyLoading = true;
    const body = {
      UserId: this.apply.userId,
      ApplyId: this.apply.applyId,
      IsAgreed: isAgree,
    };
    this.friendService.setUserApply(body).then(data => {
      this.applyLoading = false;
      if (data) {
        if (isAgree) {
          this.toast.show({ message: `${this.localeService.getValue('bind_succ')}`, type: 'success' });
        } else {
          this.toast.show({ message: `${this.localeService.getValue('reject_succ')}`, type: 'success' });
        }
        this.applyLen = 0;
      } else {
        this.toast.show({
          message: `${this.localeService.getValue('bind')}${this.localeService.getValue('failed')}`,
          type: 'fail',
        });
      }
    });
  }

  /**
   * 选择推荐返还类型
   *
   * @param idx 下标
   */
  onSelectRecomReturnItem(idx: number) {
    this.isActiveRecomReturnIndex = idx;
    this.paginator = {
      page: 1,
      pageSize: 10,
      total: 0,
    };
    this.loadData();
  }

  //打开图标窗口
  openLineChartDialog(): void {
    this.friendService.commingSoon();
    // this.dialog.open(FriendLineChartComponent, {
    //   panelClass: 'custom-dialog-container',
    //   data: { title: "推荐返还" }
    // })
  }
}
