import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { Subject, catchError, mergeMap, takeUntil } from 'rxjs';
import { ExcelFormat, JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import moment from 'moment';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { BillStatus, BillStatusEnum, CategoryEnum, QueryData } from 'src/app/shared/interfaces/finance.interface';
import { DetailService } from '../../member/detail/detail.service';
import { CurrencyService } from 'src/app/shared/service/currency.service';

@Component({
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    InputTrimDirective,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    AngularSvgIconModule,
    OwlDateTimeComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgFor,
    WinDirective,
    WinColorDirective,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    LabelComponent,
    NgSwitch,
    NgSwitchCase,
  ],
})
export class BillComponent implements OnInit {
  _destroyed: any = new Subject<void>(); // 订阅商户的流
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  constructor(
    public router: Router,
    private api: AssetApi,
    private appService: AppService,
    public subHeaderService: SubHeaderService,
    private lang: LangService,
    private detailService: DetailService,
    private currencyService: CurrencyService
  ) {}

  /** 审核状态-类型 */
  get getBillStatusEnum() {
    return BillStatusEnum;
  }

  isLoading = false;

  data: QueryData = {
    uid: '',
    order: '',
    // walletType: '',
    // currency: '',
    time: '',
    status: '',
  };

  EMPTY_DATA: QueryData = {
    uid: '',
    order: '',
    // walletType: '',
    // currency: '',
    time: '',
    status: '',
  };

  list: any[] = [];

  /** 调账状态 */
  billStatus: Array<BillStatus> = [];

  /** lifeCycle */
  ngOnInit(): void {
    this.onInitData();
  }

  /** 初始化数据 */
  onInitData() {
    this.loading(true);
    this.api
      .getBillStatus()
      .pipe(
        mergeMap((status) => {
          if (status?.length) {
            this.billStatus = status;
          }
          this.loading(false);
          return this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed));
        }),
        catchError(() => {
          this.loading(false);
          return this.subHeaderService.merchantId$.pipe(takeUntil(this._destroyed));
        })
      )
      .subscribe(() => {
        this.onReset();
      });
  }

  /** methods */

  onReset(): void {
    this.data = { ...this.EMPTY_DATA };
    this.loadData(true);
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  // 获取数据
  loadData(resetPage = false) {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.api
      .getBillQuery({
        TenantId: +this.subHeaderService.merchantCurrentId,
        Uid: this.data.uid,
        OrderId: this.data.order,
        // WalletType: this.data.walletType,
        // Currency: this.data.currency,
        StartTime: toDateStamp(this.data.time[0], false),
        EndTime: toDateStamp(this.data.time[1], true),
        Page: this.paginator.page,
        PageSize: this.paginator.pageSize,
        Status: this.data.status,
        Category: CategoryEnum.AdjustWallet,
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  /* 导出*/
  async onExport() {
    // 交易单号
    const orderNum = await this.lang.getOne('finance.deposit.orderNum');
    // 审核人
    const aduitor = await this.lang.getOne('finance.bill.auditor');
    // 币种
    const currency = await this.lang.getOne('common.currency');
    // 余额
    const balance = await this.lang.getOne('finance.bill.amount');
    // 调账金额
    const adjustmentAmout = await this.lang.getOne('finance.bill.adjustmentAmout');
    // 提款流水要求
    const withdrawalLimit = await this.lang.getOne('finance.bill.withdrawalLimit');
    // 交易时间
    const transactionHour = await this.lang.getOne('game.overview.transactionHour');
    // 状态
    const status = await this.lang.getOne('finance.deposit.status');
    // // 扣减
    // const deduct = await this.lang.getOne('finance.bill.deduct');
    // // 增加
    // const increase = await this.lang.getOne('finance.bill.increase');
    // 类型
    const type = await this.lang.getOne('finance.bill.type');
    // 备注
    const remark = await this.lang.getOne('finance.bill.remark');
    // 调账申请人
    const applicantName = await this.lang.getOne('finance.bill.applicantName');

    const curCheckedArr = await Promise.all(
      this.list
        .filter((e) => e.checked)
        .map(async (e) => ({
          [orderNum]: e.orderId,
          UID: ExcelFormat.str(e.uid),
          [aduitor]: e.modifiedUserName,
          [currency]: e.detail.currency,
          [balance]: e.detail.balance,
          [balance + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.detail?.currency, e?.detail?.balance),
          [adjustmentAmout]: e.detail.amount,
          [adjustmentAmout + '（USDT）']: this.currencyService.getUsdtRateAmount(
            e?.detail?.currency,
            e?.detail?.amount
          ),
          [withdrawalLimit]: e.detail.withdrawLimit,
          [withdrawalLimit + '（USDT）']: this.currencyService.getUsdtRateAmount(
            e?.detail?.currency,
            e?.detail?.withdrawLimit
          ),
          [transactionHour]: moment(e.createdTime).format('YYYY-MM-DD HH:mm:ss'),
          [type]: await this.lang.getOne(
            this.detailService.adjustmentTypeList.find((type) => type.code === e.detail.adjustType || '')?.lang || ''
          ),
          [remark]: e.detail.remark || '',
          [status]: await this.lang.getOne(this.statusText(e.status)),
          [applicantName]: e.createdUserName || '-',
        }))
    );

    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.tickExport',
        successed: false,
      });
    }

    this.list.forEach((e) => (e.checked = false));
    JSONToExcelDownload(curCheckedArr, 'bill-list ' + Date.now());
  }

  onClear(event: Event, field: string): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.data[field] === '') return;

    this.data[field] = '';
    this.loadData(true);
  }

  statusText(status) {
    switch (status) {
      case this.getBillStatusEnum.PENDING:
        return 'finance.bill.pending';
      case this.getBillStatusEnum.PROCESSING:
        return 'finance.bill.progress';
      case this.getBillStatusEnum.FINISH:
        return 'finance.bill.completed';
      case this.getBillStatusEnum.REJECTED:
        return 'finance.bill.rejected';
      case this.getBillStatusEnum.CANCEL:
        return 'finance.bill.cancelled';
      default:
        return '';
    }
  }
}
