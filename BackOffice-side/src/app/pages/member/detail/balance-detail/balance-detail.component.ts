import { Component, EventEmitter, OnInit, Output, TemplateRef } from '@angular/core';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MemberService } from 'src/app/pages/member/member.service';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { NgFor, NgIf } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import {
  MemberGameBalanceItemDetail,
  MemberOverview,
  MemberStatistics,
} from 'src/app/shared/interfaces/member.interface';
import BigNumber from 'bignumber.js';
import { cloneDeep } from 'lodash';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './balance-detail.component.html',
  styleUrls: ['./balance-detail.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    MatTabsModule,
    NgFor,
    CurrencyIconDirective,
    AngularSvgIconModule,
    PaginatorComponent,
    CurrencyValuePipe,
    LangPipe,
    NgbPopover,
    MatSelectModule,
    FormsModule,
  ],
})
export class BalanceDetailComponent implements OnInit {
  constructor(
    public modal: MatModalRef<any>,
    private modalService: MatModal,
    private appService: AppService,
    private api: MemberApi,
    private memberService: MemberService,
    private currencyService: CurrencyService,
    private confirmModalService: ConfirmModalService,
    private route: ActivatedRoute
  ) {
    const { tenantId } = this.route.snapshot.queryParams;

    this.tenantId = +tenantId;
  }

  /** 商户ID */
  tenantId;

  pageSizes: number[] = PageSizes; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;
  ledData: {
    ledLockedAmount;
    ledReceiveAmount;
    ledUnlockableAmount;
  };

  uid: string;
  type: string;
  title = '';
  currency: string;
  data: Partial<MemberStatistics & MemberOverview> = {};
  list: any[] = [];
  tabList = [
    { key: 0, name: '虚拟币', isDigital: true },
    { key: 1, name: '法币', isDigital: false },
  ];

  tabIndex = 0;

  @Output() recycle = new EventEmitter();

  /** 剩余手续费 - 清零手续费成功 */
  @Output() clearFeeSuccess = new EventEmitter();

  /** getters */
  /** 子钱包余额 */
  get isGameBalance() {
    return this.type === 'gameWallet';
  }

  /** 剩余手续费 */
  get isRemainingFee() {
    return this.type === 'handlingFee';
  }

  get curTab() {
    return this.tabList[this.tabIndex];
  }

  get mapSearch() {
    return this.list.filter((e) => this.currencyService.isDigital(e.code) === this.curTab.isDigital);
  }

  ngOnInit(): void {
    if (this.type === 'freezeAmount') {
      this.list = [];
      this.paginator.pageSize = 7;
      this.gerFreezeList(true);
    }
  }

  /** 一键回收子钱包余额 */
  onRecycle() {
    const category = this.list[this.tabIndex].walletName;
    this.appService.isContentLoadingSubject.next(true);
    this.api.recycleGameWallet({ uid: this.uid, category }).subscribe(async (res) => {
      this.appService.isContentLoadingSubject.next(false);

      const successed = res === true;

      this.appService.showToastSubject.next({
        msgLang: ['member.detail.balance.recycleBalance', successed ? 'common.success' : 'common.fail'],
        successed,
      });

      if (successed) {
        this.memberService.updateMember.next();
        this.modal.close(true);
      }
    });
  }

  /** 冻结金额详情 - 虚拟币/法币 选择 */
  selectIsDigital() {
    this.list = [];
    this.gerFreezeList(true);
  }

  /** 冻结金额详情 - 数据获取 */
  gerFreezeList(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const parmas = {
      Uid: this.uid,
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
      IsDigital: this.curTab.isDigital,
      Currency: this.currency,
    };
    this.api.getFreezeList(parmas).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      }
    });
  }

  /** 冻结金额详情 - 取消划转 */
  clearTransfer(orderNum: any) {
    this.loading(true);
    const parmas = {
      uid: this.uid,
      orderNum,
    };
    this.api.cancelTransfer(parmas).subscribe((res) => {
      this.loading(false);
      if (res === true) this.gerFreezeList();
      this.appService.showToastSubject.next({
        msgLang:
          res === true ? 'member.detail.balance.clearTransferSuccess' : 'member.detail.balance.clearTransferFail',
        successed: res === true ? true : false,
      });
    });
  }

  /**
   * 子钱包详情 - 货币选择
   */
  subWalletDetailCurrency = 'USDT';

  /**
   * 子钱包详情 - 列表 gameBalanceList
   */
  subWalletDetailList: MemberGameBalanceItemDetail[] = [];

  /**
   * 钱包详情
   * @param tpl
   */
  onWalletDetail(tpl: TemplateRef<any>) {
    this.modalService.open(tpl, { width: '500px' });
    this.onWalletDetailCurrency();
  }

  /**
   * 钱包详情 - 货币选择
   */
  onWalletDetailCurrency() {
    if (this.subWalletDetailCurrency === 'USDT') {
      this.subWalletDetailList = cloneDeep(this.data.gameBalanceInfo?.gameBalanceList || []);
    } else {
      this.subWalletDetailList = cloneDeep(this.data.gameBalanceInfo?.gameBalanceList || []).map((e) => {
        e.amount = BigNumber(e.amount)
          .multipliedBy(this.data.gameBalanceInfo?.rate || 1)
          .toNumber();
        return e;
      });
    }
  }

  /** 剩余手续费 - 清零手续费 */
  onClearingFee() {
    this.confirmModalService
      .open({
        msgLang: 'member.detail.balance.isClearingFeeTips',
      })
      .result.then(() => {
        this.loading(true);
        this.api.manuaclearhandlingfee(this.uid, this.tenantId).subscribe((res) => {
          this.loading(false);

          this.appService.toastOpera(res);
          if (res === true) {
            this.clearFeeSuccess.emit();
            this.modal.dismiss();
          }
        });
      })
      .catch(() => {});
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
