import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import moment from 'moment';
import { AffiliateApi } from 'src/app/shared/apis/affiliate.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { TableHader } from 'src/app/shared/interfaces/affiliate.interface';
import { GeneralService } from 'src/app/shared/service/general.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
@UntilDestroy()
@Component({
  selector: 'app-affiliate-member-management',
  templateUrl: './affiliate-member-management.component.html',
  styleUrls: ['./affiliate-member-management.component.scss'],
})
export class AffiliateMemberManagementComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    private dialog: MatDialog,
    private toast: ToastService,
    private affiliateApi: AffiliateApi,
    private localeService: LocaleService,
    private generalService: GeneralService,
  ) {}

  isH5!: boolean;

  /** 表头文字 */
  tableHead: TableHader[] = [
    { headTitle: this.localeService.getValue('degrade_uid') },
    { headTitle: `VIP${this.localeService.getValue('level')}` },
    { headTitle: this.localeService.getValue('deposit_in') },
    { headTitle: this.localeService.getValue('withdrawal_out') },
    { headTitle: this.localeService.getValue('total_win00') },
    { headTitle: this.localeService.getValue('bonus') },
    { headTitle: this.localeService.getValue('commission') },
    { headTitle: this.localeService.getValue('l_logon'), icon: 'icon-arrow-down' },
    { headTitle: this.localeService.getValue('reg_time') },
    { headTitle: this.localeService.getValue('action') },
  ];

  data: any = {
    userId: '',
    logStartDate: moment(this.generalService.getStartEndDateArray('30days')[0]),
    logEndDate: moment(this.generalService.getStartEndDateArray('30days')[1]),
    regStartDate: 0,
    regEndDate: 0,
  };

  userList: any[] = [];

  /** 设备列表分页信息 */
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };
  loading: boolean = false;

  /** 限定最多三个月 */
  get logMaxDate() {
    if (this.data.logStartDate) {
      return moment(this.data.logStartDate).add(89, 'days');
    }
    return undefined;
  }

  /** 限定最多三个月 */
  get regMaxDate() {
    if (this.data.regStartDate) {
      return moment(this.data.regStartDate).add(89, 'days');
    }
    return undefined;
  }

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.loadData();
  }

  /**
   * 初始加载数据
   *
   * @param paginator 页脚参数
   */
  loadData(paginator?: any) {
    if (paginator) {
      this.paginator.page = paginator.page;
      this.paginator.pageSize = paginator.pageSize;
    }
    this.loading = true;

    const params = {
      uid: this.data.userId,
      beginTime: moment(this.data.logStartDate).startOf('day').valueOf(),
      endTime: moment(this.data.logEndDate).add(1, 'd').startOf('day').valueOf(),
      registerBeginTime:
        this.data.regStartDate === 0 ? 0 : this.generalService.getCustomDate(this.data.regStartDate, 'start'),
      registerEndTime: this.data.regEndDate === 0 ? 0 : this.generalService.getCustomDate(this.data.regEndDate, 'end'),
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };

    this.affiliateApi.getStatisticUsersList(params).subscribe((data: any) => {
      this.loading = false;
      this.userList = data.list;
      this.paginator.total = data.total;
    });
  }

  /** 当时间参数是undefined 设置为0*/
  onClearDate() {
    for (const date in this.data) {
      if (this.data[date] === undefined) {
        this.data[date] = 0;
      }
    }
  }

  /**
   * 移除用户
   *
   * @param userId 用户uid
   * @param status 用户状态
   * @returns
   */
  removeUser(userId: string, status: number) {
    if (status === 2 || status === undefined) return;
    this.dialog.open(StandardPopupComponent, {
      disableClose: true,
      data: {
        type: 'warn',
        title: this.localeService.getValue('hint'),
        description: this.localeService.getValue('del_user_tip00'),
        buttons: [
          { text: this.localeService.getValue('cancels') },
          { text: this.localeService.getValue('sure'), primary: true },
        ],
        callback: () => {
          this.loading = true;
          const body = {
            userId,
          };
          this.affiliateApi.removeUser(body).subscribe(data => {
            this.loading = false;
            if (data) {
              this.toast.show({ message: this.localeService.getValue('sub_app'), type: 'success' });
              this.loadData();
            } else {
              this.toast.show({
                message: `${this.localeService.getValue('user_id_text')}: ${userId}${this.localeService.getValue(
                  'remove_f',
                )}`,
                type: 'fail',
              });
            }
          });
        },
      },
    });
  }

  onReset(): void {
    this.data = {
      userId: '',
      logStartDate: moment(this.generalService.getStartEndDateArray('30days')[0]),
      logEndDate: moment(this.generalService.getStartEndDateArray('30days')[1]),
      regStartDate: 0,
      regEndDate: 0,
    };

    this.loadData();
  }
}
