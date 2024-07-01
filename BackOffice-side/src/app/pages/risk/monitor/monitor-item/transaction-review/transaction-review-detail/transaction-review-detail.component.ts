import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { BankApi } from 'src/app/shared/api/bank.api';
import { MemberApi } from 'src/app/shared/api/member.api';
import { DrawerService, MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { zip } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { TotalDepositComponent } from 'src/app/pages/member/detail/total-deposit/total-deposit.component';
import { CreditComponent } from 'src/app/pages/member/detail/credit/credit.component';
import { BalanceDetailComponent } from 'src/app/pages/member/detail/balance-detail/balance-detail.component';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { IntegerPipe } from 'src/app/shared/pipes/number.pipe';
import { FormatMoneyPipe, FormatNumberDecimalPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormsModule } from '@angular/forms';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { ProgressTextDirective } from 'src/app/shared/components/progress/progress.directive';
import { ProgressComponent } from 'src/app/shared/components/progress/progress.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { NgbTooltip, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { DeviceIpItem } from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'app-transaction-review',
  templateUrl: './transaction-review-detail.component.html',
  styleUrls: ['./transaction-review-detail.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgFor,
    NgIf,
    AngularSvgIconModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgbTooltip,
    NgbPopover,
    EmptyComponent,
    CurrencyIconDirective,
    ProgressComponent,
    ProgressTextDirective,
    IconSrcDirective,
    WinDirective,
    WinColorDirective,
    PaginatorComponent,
    FormsModule,
    FormRowComponent,
    ModalFooterComponent,
    FormWrapComponent,
    NgTemplateOutlet,
    TimeFormatPipe,
    FormatMoneyPipe,
    FormatNumberDecimalPipe,
    IntegerPipe,
    CurrencyValuePipe,
    LangPipe,
    VipNamePipe,
  ],
})
export class TransactionReviewDetailComponent implements OnInit {
  constructor(
    public modal: MatModalRef<TransactionReviewDetailComponent>,
    private matModal: MatModal,
    public appService: AppService,
    private api: MemberApi,
    private monitorApi: MonitorApi,
    private bankApi: BankApi,
    private clipboard: Clipboard,
    private lang: LangService,
    private drawer: DrawerService,
    public subHeader: SubHeaderService,
    private confirmService: ConfirmModalService
  ) {}

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  @Input() memberId: number;
  @Input() uid: string;
  @Input() tenantId: any;
  @Input() status: any; // 状态：Pending/Finish/Rejected/Processing
  @Input() data: any; // 审核&详情 内容
  @Input() tab: any; // 1:实时监控 2:历史记录

  @Output() auditSuccess = new EventEmitter();

  userDetailsInfo: any = {}; // 会员信息
  statusListCopy: any[] = []; //群发站内信弹窗下拉列表
  bankList: any[] = []; // 会员所绑定的银行卡列表
  userWallet: any[] = []; // 用户钱包
  bindWallet: any[] = []; // 绑定钱包
  deviceIpList: DeviceIpItem[] = []; // IP/设备指纹
  authenticateList: any[] = []; // 认证详情

  balanceList = [
    { lang: 0, name: '总存款', valueKey: 'depositTotal', detailKey: 'totalDeposit' },
    { lang: 1, name: '总提款', valueKey: 'withdrawTotal', detailKey: 'totalWithdraw' },
    { lang: 2, name: '余额', valueKey: 'balance', detailKey: 'balances' },
    { lang: 3, name: '子钱包余额', valueKey: 'gameBalance', detailKey: 'gameWallet' },
    { lang: 4, name: '抵用金', valueKey: 'bonus', detailKey: 'creditDetail' },
    { lang: 5, name: '提款流水要求', valueKey: 'limitAmount', detailKey: 'limitAmounts' },
    { lang: 6, name: 'NGR', valueKey: 'nrgTotal', detailKey: 'xxx' },
  ];

  grid: any[] = [
    { id: 1, title: 'To/Dep', color: '#31a0f7', suffix: 'x' },
    { id: 2, title: 'To/Bonus', color: '#7E4AEB', suffix: '%' },
    { id: 3, title: 'Active', color: '#DF506E', suffix: 'D' },
    { id: 4, titleMap: 'member.detail.houseEdge', color: '#F76C31', suffix: '%' },
    { id: 5, title: 'Avg Bet', color: '#77BE43', suffix: '' },
    { id: 6, title: 'Avg Dep', color: '#A031F7', suffix: '' },
    // { id: 7, title: 'Roi', color: '#EB4AE5', suffix: 'x' },
  ];

  allWalletList: any[] = [];
  address = false;
  handheld = true;

  audit: any = 'Finish';
  auditList: any[] = [
    { name: '通过', lang: 'risk.passing', value: 'Finish' },
    { name: '不通过', lang: 'risk.noPass', value: 'Rejected' },
  ];

  remark: any = '';

  ngOnInit() {
    // IP/设备指纹
    this.paginator.pageSize = 10;
    this.getDeviceIpList();

    this.loadData();
  }

  loadData() {
    this.loading(true);

    zip([
      this.api.getMemberOverView({ memberId: this.memberId }),
      this.api.getMemberStatusSelect(),
      this.bankApi.getMemberBankList(this.uid),
      this.api.getVirtualAddress({ uid: this.uid, page: 1, pageSize: 999 }),
      this.api.getVirtualAddressUse({ uid: this.uid, page: 1, pageSize: 999 }),
      this.api.getStat({ uid: this.uid }),
      this.api.getMemberallWallet({ uid: this.uid }), // 会员所有钱包
      this.api.getAuthentications({ uid: this.uid }),
    ]).subscribe(([userDetailsInfo, statusList, bankList, virtual, useVirtual, stat, allWallet, authenticateList]) => {
      this.loading(false);
      this.userDetailsInfo = { ...(userDetailsInfo || {}), ...(stat || {}) };
      this.statusListCopy = statusList;

      this.bankList = bankList || [];
      this.bindWallet = Array.isArray(virtual?.list) ? virtual.list : [];
      this.userWallet = Array.isArray(useVirtual?.list) ? useVirtual.list : [];
      if (Array.isArray(allWallet)) {
        const res = new Map();
        this.allWalletList = allWallet.filter((item) => !res.has(item['currency']) && res.set(item['currency'], 1));
      }

      this.authenticateList = authenticateList || [];

      this.grid[0].value = stat?.toDep;
      // this.grid[1].value = stat?.toBon;
      this.grid[1].value = stat?.toRoi;
      this.grid[2].value = stat?.activeDay;
      this.grid[3].value = stat?.bankerAdvantage;
      this.grid[4].value = stat?.avgBet;
      this.grid[5].value = stat?.avgDep;
      // this.grid[6].value = stat?.toRoi;
    });
  }

  // 获取头像
  getAvatar() {
    if (this.userDetailsInfo.avatar && this.userDetailsInfo.avatar.slice(0, 6) === 'avatar') {
      return `./assets/images/avatar/${this.userDetailsInfo.avatar}.png`;
    }
    return this.userDetailsInfo.avatar || 'https://via.placeholder.com/160x160';
  }

  //复制
  async onCopy(text: string) {
    if (!text) return;
    const successed = this.clipboard.copy(text);
    const msg = successed ? await this.lang.getOne('common.copySuccess') : await this.lang.getOne('common.copyaFiled');
    this.appService.showToastSubject.next({ msg, successed });
  }

  /** 打开余额详情 */
  async openBalanceDetail(key: string, title: any) {
    const msg = await this.lang.getOne('member.detail.balanceType.' + title);
    const details = await this.lang.getOne('common.details');
    title = msg + details;

    switch (key) {
      case 'creditDetail':
        this.openCreditDetail();
        break;
      case 'totalDeposit':
        this.openTotalDepositModal(key);
        break;
      case 'totalWithdraw':
        this.openTotalDepositModal(key);
        break;
      default:
        this.openBalanceDetailModal(key, title);
        break;
    }
  }

  /** 总存/取款弹窗 */
  async openTotalDepositModal(type: any) {
    const modal = this.drawer.open(TotalDepositComponent, { width: '60%', maxWidth: '800px' });
    modal.componentInstance['type'] = type;
    modal.componentInstance['uid'] = this.uid;
  }

  /** 抵用金弹窗 */
  async openCreditDetail() {
    const modal = this.matModal.open(CreditComponent, { width: '600px' });
    modal.componentInstance['uid'] = this.uid;
  }

  /** 余额详情弹窗 */
  async openBalanceDetailModal(key: string, title: string) {
    const balance = this.userDetailsInfo?.[key];
    const currencyArr = balance ? Object.keys(balance) : [];
    if (!balance || !currencyArr.length) return this.appService.showToastSubject.next({ msgLang: `common.emptyText` });

    const modal = this.matModal.open(BalanceDetailComponent, { width: key === 'freezeAmount' ? '600px' : '500px' });
    modal.componentInstance['uid'] = this.uid;
    modal.componentInstance['type'] = key;
    modal.componentInstance['title'] = title;

    if (key === 'gameWallet') {
      modal.componentInstance['list'] = currencyArr.map((key) => ({
        walletName: key,
        code: Object.keys(balance[key]),
        value: balance[key],
      }));
    } else {
      modal.componentInstance['list'] = currencyArr.map((key) => ({
        code: key,
        value: balance[key],
      }));
    }
  }

  /** IP/设备指纹 */
  getDeviceIpList() {
    this.loading(true);
    const params = {
      tenantId: this.tenantId,
      uid: this.uid,
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
    this.api.getmemberfingerprint(params).subscribe((res) => {
      this.loading(false);

      this.deviceIpList = Array.isArray(res?.list) ? res?.list : [];
      this.paginator.total = res?.total || 0;
    });
  }

  confirm() {
    this.updateAbnormalMemberStatus();
  }

  updateAbnormalMemberStatus() {
    this.loading(true);
    const params = {
      orderId: this.data?.orderId,
      status: this.audit,
      remark: this.remark,
      authenticationValues: this.authenticateList.filter((v) => v.required).map((j) => j.value),
    };

    this.monitorApi.updateAddtransactionaudit(params).subscribe((res: any) => {
      this.loading(false);
      const successed = res === true;

      if (successed) {
        this.modal.close(true);
        this.auditSuccess.emit();
      }

      this.appService.showToastSubject.next({ msgLang: successed ? 'risk.suc' : 'risk.fail', successed });
    });
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
