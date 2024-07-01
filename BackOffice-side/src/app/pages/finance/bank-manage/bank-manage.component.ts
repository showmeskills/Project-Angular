import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { BankApi } from 'src/app/shared/api/bank.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { VirtualApi } from 'src/app/shared/api/virtual.api';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { Router } from '@angular/router';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf } from '@angular/common';
import { WithdrawalInfo } from 'src/app/shared/interfaces/finance.interface';
import { WithdrawalsApi } from 'src/app/shared/api/withdrawals.api';
import { PaymentCategoryEnum, TransactionListResponse } from 'src/app/shared/interfaces/transaction';

@Component({
  selector: 'app-bank-manage',
  templateUrl: './bank-manage.component.html',
  styleUrls: ['./bank-manage.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    FormRowComponent,
    FormsModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgIf,
    AngularSvgIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    MatTabsModule,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class BankManageComponent implements OnInit, OnDestroy {
  private _destroy = new Subject<void>();
  detailPopupRef!: NgbModalRef;

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  payBankPaginator: PaginatorState = new PaginatorState(); // 分页
  payVirtualPaginator: PaginatorState = new PaginatorState(); // 分页

  isLoading = false;
  isFullLoading = false;

  constructor(
    public router: Router,
    private appService: AppService,
    private modalService: NgbModal,
    private subHeaderService: SubHeaderService,

    private bankApi: BankApi,
    private virtualApi: VirtualApi,
    private assetApi: AssetApi,
    private withdrawalsApi: WithdrawalsApi
  ) {}

  typeList: any = [
    { name: '银行卡', value: 1, lang: 'payment.bankManage.bankCard' },
    { name: '虚拟货币', value: 2, lang: 'payment.bankManage.virtualCurrency' },
  ];

  curTypeValue: any = 1;

  key: any = '';
  time: Date[] = [];

  list: any[] = [];

  // 弹窗数据
  curBanckValue: any = 0;
  curVirtualValue: any = 0;

  payDetailData: WithdrawalInfo = {} as any;
  payBankList: TransactionListResponse[] = [];
  payVirtualList: TransactionListResponse[] = [];

  curTab: any = 0;

  ngOnInit(): void {
    this.subHeaderService.merchantId$.pipe(takeUntil(this._destroy)).subscribe(() => {
      if (!this.subHeaderService.merchantCurrentId) return;
      this.onSelectCard(this.curTypeValue);
    });
  }

  /** methods */
  onSelectCard(v?: any) {
    if (v) {
      this.curTypeValue = v;
      // 清空数据
      this.onReset();
      this.paginator.page = 1;
      // this.paginator.pageSize = 10;
      this.paginator.total = 0;
      this.list = [];
    }

    // 获取 银行卡和虚拟币 数据
    if (v === 1) {
      this.getBankList();
    } else if (v === 2) {
      this.getVirtualList();
    }
  }

  onReset(): void {
    this.key = '';
    this.time = [];
  }

  // 加载状态
  loading(v: boolean): void {
    this.isFullLoading = this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 银行卡
  getBankList(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);

    this.loading(true);
    const params = {
      TenantId: this.subHeaderService.merchantCurrentId,
      Key: this.key,
      ...(this.time[0] ? { CreatedTimeStart: +this.time[0] } : {}),
      ...(this.time[1] ? { CreatedTimeEnd: +this.time[1] } : {}),
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.bankApi.getBankQuery(params).subscribe((res) => {
      this.loading(false);
      this.list = res.list || [];
      this.paginator.total = res.total || 0;
    });
  }

  // 虚拟币
  getVirtualList(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);

    this.loading(true);
    const params = {
      TenantId: this.subHeaderService.merchantCurrentId,
      Key: this.key,
      ...(this.time[0] ? { CreatedTimeStart: +this.time[0] } : {}),
      ...(this.time[1] ? { CreatedTimeEnd: +this.time[1] } : {}),
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
    };
    this.virtualApi.getVirtualQuery(params).subscribe((res) => {
      this.loading(false);
      this.list = res.list || [];
      this.paginator.total = res.total || 0;
    });
  }

  onView(tpl: TemplateRef<any>, uid: any) {
    this.curBanckValue = 0;
    this.curVirtualValue = 0;
    if (this.curTypeValue === 1) {
      this.curTab = 0;
    } else {
      this.curTab = 1;
    }
    const params = {
      tenantId: this.subHeaderService.merchantCurrentId,
      uid,
    };
    this.loading(true);
    this.assetApi.getMemberBindAddress(params).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.payDetailData = res;
        this.getBankVirtualList(uid, 'bank');
        this.getBankVirtualList(uid, 'virtual');
        this.detailPopupRef = this.modalService.open(tpl, {
          centered: true,
          windowClass: 'bank-currency-modal',
        });
      }
    });
  }

  // 获取支付方式 - 交易记录数据
  getBankVirtualList(uid: any, type: any) {
    this.payBankPaginator.pageSize = 5;
    this.payVirtualPaginator.pageSize = 5;
    const params = {
      TenantId: this.subHeaderService.merchantCurrentId,
      UID: uid,
      PageIndex: type === 'bank' ? this.payBankPaginator.page : this.payVirtualPaginator.page,
      PageSize: type === 'bank' ? this.payBankPaginator.pageSize : this.payVirtualPaginator.pageSize,
      IsDigital: type === 'bank' ? false : true,
    };

    if (type === 'bank') {
      this.withdrawalsApi.getWithdrawRecord(params).subscribe((res) => {
        this.payBankList = res.list || [];
        this.payBankPaginator.total = res.total || 0;
      });
    } else if (type === 'virtual') {
      this.withdrawalsApi.getWithdrawRecord(params).subscribe((res) => {
        this.payVirtualList = res.list || [];
        this.payVirtualPaginator.total = res.total || 0;
      });
    }
  }

  ngOnDestroy() {
    this._destroy.next();
    this._destroy.complete();
  }

  protected readonly PaymentCategoryEnum = PaymentCategoryEnum;
}
