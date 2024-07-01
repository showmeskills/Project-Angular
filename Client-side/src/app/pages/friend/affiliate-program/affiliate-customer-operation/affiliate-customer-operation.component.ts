import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { filter, map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ResultDialogComponent } from 'src/app/pages/user-asset/wallet-transfer/result-dialog/result-dialog.component';
import { FriendApi } from 'src/app/shared/apis/friend.api';
import { PaginatorState } from 'src/app/shared/components/paginator/paginator.module';
import { PhoneNumberSelecterComponent } from 'src/app/shared/components/phone-number-selecter/phone-number-selecter.component';
import { StandardPopupComponent } from 'src/app/shared/components/standard-popup/standard-popup.component';
import { TableHader } from 'src/app/shared/interfaces/affiliate.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { PhoneNumberService } from 'src/app/shared/service/phone-number-validation';
import { ToastService } from 'src/app/shared/service/toast.service';
import { FriendService } from '../../friend.service';

enum UserCheckApplyConst {
  OK = 'OK',
  NO_SELF = 'NoSelf',
  USER_MOBILE_INVALID = 'UserMobileInvalid',
  ALREADY_BIND = 'AlreadyBind',
  ALREADY_APPLY = 'AlreadyApply',
  OUT_7_DAY = 'Out7day',
}

@UntilDestroy()
@Component({
  selector: 'app-affiliate-customer-operation',
  templateUrl: './affiliate-customer-operation.component.html',
  styleUrls: ['./affiliate-customer-operation.component.scss'],
})
export class AffiliateCustomerOperationComponent implements OnInit {
  isH5!: boolean;

  @Input() isComponent: boolean = false;

  isActiveNavIndex: number = 0; //激活当前导航

  navList: any[] = [{ name: this.localeService.getValue(`tra_apl00`) }, { name: this.localeService.getValue(`tra00`) }]; // 导航

  /**@tableHeaderA */
  tableHeaderA: TableHader[] = [
    { headTitle: this.localeService.getValue('appli_time00') },
    { headTitle: this.localeService.getValue('user') },
    { headTitle: this.localeService.getValue('reg_time') },
    { headTitle: this.localeService.getValue('stat') },
  ];

  /** 手机号 */
  phone: string = '';

  phoneError: boolean = false;

  /** 当前选中的手机区号 */
  areaCode = '';
  /** 国家区号样式 */

  fogClassName = '';

  userId: string = ''; //用户 id 号

  userApplyList: any[] = []; //表格数据

  // 设备列表分页信息
  paginator: PaginatorState = {
    page: 1,
    pageSize: 10,
    total: 0,
  };

  loading: boolean = false;

  recommendLinkList: any[] = [];

  selectedInviteCode: string = '';

  /**@userCheckLoading 查询用户loading */
  userCheckLoading: boolean = false;

  /**@transInput 划转的input */
  transInput: any = [
    {
      label: this.localeService.getValue('my_acc00'),
      text: this.localeService.getValue('from'),
      data: 'myAccount',
      myAccount: this.localeService.getValue('ma_acc_wal00'),
      icon: 'icon-wallet2',
      rightContent: false,
      readonly: true,
      type: 'text',
    },
    {
      label: this.localeService.getValue('tra_user00'),
      text: this.localeService.getValue('f_to'),
      data: 'targetAccount',
      targetAccount: 'abcd account',
      icon: 'icon-wallet-coin',
      rightContent: true,
      rightIcon: 'icon-arrow-down',
      readonly: true,
      type: 'text',
    },
    {
      label: this.localeService.getValue('curr'),
      text: 'USDT',
      data: 'currency',
      currency: '5556664',
      icon: '.icon-usdt',
      rightContent: true,
      rightIcon: 'icon-arrow-down',
      readonly: true,
      type: 'text',
    },
    {
      label: this.localeService.getValue('number'),
      data: 'amount',
      amount: 100,
      rightContent: true,
      rightCurrency: 'USDT',
      rightText: `${this.localeService.getValue('max')}`,
      errorTxt: `${this.localeService.getValue('max_amou00')} 100 USDT`,
      readonly: false,
      type: 'number',
    },
  ];

  constructor(
    private layout: LayoutService,
    private dialog: MatDialog,
    private appService: AppService,
    private toast: ToastService,
    public phoneNumberService: PhoneNumberService,
    private friendApi: FriendApi,
    private friendService: FriendService,
    private localeService: LocaleService
  ) {}

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.friendService.getRcommendList$
      .pipe(
        untilDestroyed(this),
        map(x => {
          if (x?.list) {
            return x.list.map((item: any) => {
              if (item.isDefault) {
                this.selectedInviteCode = item.inviteCode;
              }
              if (item.remark === null) {
                return {
                  text: `${item.commissionRate * 1000}‰ /${item.friendCommission * 1000}‰`,
                  inviteCode: item.inviteCode,
                };
              } else {
                return {
                  text: `${item.remark.slice(0, 4)}...  ${item.commissionRate * 1000}‰ /${
                    item.friendCommission * 1000
                  }‰`,
                  inviteCode: item.inviteCode,
                };
              }
            });
          }
        })
      )
      .subscribe(recommendList => (this.recommendLinkList = recommendList));
    this.appService.currentCountry$
      .pipe(
        untilDestroyed(this),
        filter(x => x)
      )
      .subscribe(x => {
        //获取当前手机区号
        this.areaCode = x.areaCode;
        const fogClassNameReplace = x.code
          .replace(/\&/g, '_and_')
          .replace(/ /g, '_')
          .replace(/\,/g, '')
          .replace(/\./g, '');
        this.fogClassName = `country-${fogClassNameReplace}`;
      });
    this.phone = '';
    this.loadData();
  }

  /**
   * 初始化转入申请列表
   *
   * @param paginator 页脚
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
    if (this.isActiveNavIndex == 0) {
      this.friendApi.getUserApplyList(params).subscribe(data => {
        this.loading = false;
        this.userApplyList = data.list;
        this.paginator.total = data.total;
      });
    } else {
      //获取转账userlist 接口还没有做;
    }
  }

  /** 检查转入申请 */
  createUserApplyCheck() {
    this.userCheckLoading = true;
    const params = {
      userId: this.userId,
      mobile: this.phone,
    };
    this.friendApi.createUserApplyCheck(params).subscribe((data: any) => {
      this.userCheckLoading = false;
      switch (data.status) {
        case UserCheckApplyConst.OK:
          this.openInfoDialog(
            this.localeService.getValue('verif_succee00'),
            this.localeService.getValue('bind_user00'),
            true
          );
          break;
        case UserCheckApplyConst.USER_MOBILE_INVALID:
          this.openInfoDialog(
            this.localeService.getValue('veri_fail'),
            this.localeService.getValue('user_and_mobile_not00') +
              `${data.count < 0 ? 0 : data.count}` +
              this.localeService.getValue('user_and_mobile_not01'),
            false
          );
          break;
        case UserCheckApplyConst.ALREADY_BIND:
          this.openInfoDialog(
            this.localeService.getValue('verif_succee00'),
            this.localeService.getValue('user_not_bind00'),
            false
          );
          break;
        case UserCheckApplyConst.ALREADY_APPLY:
          this.toast.show({
            message: this.localeService.getValue('user_has00'),
            type: 'fail',
            title: this.localeService.getValue('hint'),
          });
          break;
        case UserCheckApplyConst.OUT_7_DAY:
          this.openInfoDialog(
            this.localeService.getValue('veri_fail'),
            this.localeService.getValue('user_not_bind01'),
            false
          );
          break;
        case UserCheckApplyConst.NO_SELF:
          this.toast.show({
            message: this.localeService.getValue('not_invite_self'),
            type: 'fail',
            title: this.localeService.getValue('hint'),
          });
          break;
        default:
          this.toast.show({ message: this.localeService.getValue('fail'), type: 'fail' });
      }
    });
  }

  /**@canSubmit 是否可以提交查询 */
  canSubmit() {
    return (
      !!this.userId &&
      String(this.userId).length > 2 &&
      !!this.phone &&
      String(this.phone).length > 2 &&
      !this.phoneError
    );
  }

  //创建转入申请
  createUserApply() {
    this.loading = true;
    const body = {
      userId: this.userId,
      mobile: this.phone,
      inviteCode: this.selectedInviteCode,
    };
    this.friendApi.createUserApply(body).then((data: any) => {
      this.loading = false;
      if (data?.data) {
        this.toast.show({
          message:
            this.localeService.getValue('sent_mobile_tip00') +
            `${this.phone}` +
            this.localeService.getValue('sent_mobile_tip01'),
          type: 'success',
        });
        this.loadData();
      } else {
        this.toast.show({ message: this.localeService.getValue('member_invalid'), type: 'fail' });
      }
    });
  }

  //切换导航
  selectNavItem(i: number): void {
    this.isActiveNavIndex = 0;
    //this.isActiveNavIndex = i;
    if (i == 0) {
      //this.loadData();
    } else {
      //获取转账userlist 接口还没有做;
      this.friendService.commingSoon();
    }
  }

  // 打开提示弹窗
  openInfoDialog(content: string, description: string, useCallback: boolean): void {
    this.dialog.open(StandardPopupComponent, {
      disableClose: true,
      data: {
        type: 'warn',
        content,
        description,
        buttons: [
          { text: this.localeService.getValue('cancels') },
          { text: this.localeService.getValue('sure'), primary: true },
        ],
        callback: () => {
          if (useCallback) this.createUserApply();
        },
      },
    });
  }

  //转账结果弹窗
  openResultDialog(): void {
    this.dialog.open(ResultDialogComponent, {
      panelClass: 'custom-dialog-container',
      disableClose: false,
      data: {},
    });
  }

  /**@onTransChange 划转change事件 */
  onTransChange() {}

  onReset() {
    this.userId = '';
    this.phone = '';
    this.phoneError = false;
  }

  /**
   * 手机区号选择弹出框
   */
  handleSelectPhone(): MatDialogRef<PhoneNumberSelecterComponent> {
    this.phone = '';
    return this.dialog.open(PhoneNumberSelecterComponent, {
      panelClass: ['phone-number-dialog-container', 'mobile-dialog'],
    });
  }
}
