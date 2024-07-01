import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { EditComponent } from './edit/edit.component';
import { DepositApi } from 'src/app/shared/api/deposit.api';
import { ExcelFormat, JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import { forkJoin, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { WithdrawalsApi } from 'src/app/shared/api/withdrawals.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import moment from 'moment';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { TransactionListResponse, TransactionParams } from 'src/app/shared/interfaces/transaction';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { FinanceService, TransStatusLabel } from 'src/app/pages/finance/finance.service';
import { Currency } from 'src/app/shared/interfaces/currency';
import { TransactionOrderStatusCustom } from 'src/app/shared/interfaces/deposit.interface';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { CurrencyService } from 'src/app/shared/service/currency.service';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    InputTrimDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    LabelComponent,
    TransStatusLabel,
    EmptyComponent,
    AsyncPipe,
  ],
})
export class DepositComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    public appService: AppService,
    private modalService: MatModal,
    private api: DepositApi,
    private withdrawalsApi: WithdrawalsApi,
    private selectApi: SelectApi,
    public subHeaderService: SubHeaderService,
    private lang: LangService,
    public financeService: FinanceService,
    private currencyService: CurrencyService
  ) {}

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  pageSizes: number[] = [...PageSizes, 2e3, 3e3, 5e3]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  statusList: TransactionOrderStatusCustom[] = []; //订单状态列表
  currencyList: Currency[] = []; //币种名称列表
  currencyTypeList = [
    // 币种类型列表
    { name: 'finance.deposit.legalCurrency', value: false },
    { name: 'finance.deposit.cryptoCurrency', value: true },
  ];

  dataEmpty = {
    orderNum: '', // 交易单号
    uid: '', // 会员Id
    status: '', // 订单状态
    isDigital: '' as string | boolean, // 货币类型
    currency: '', // 货币类型
    createdTime: [], // 创建时间
    finishedTime: [], // 完成时间
    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  data = cloneDeep(this.dataEmpty); // 查询参数

  list: TransactionListResponse[] = []; // 表格列表数据

  get isDigitalCurrencyList() {
    if (this.currencyList.length > 0) {
      if (this.data.isDigital === true) {
        return this.currencyList.filter((v) => v.isDigital);
      } else if (this.data.isDigital === false) {
        return this.currencyList.filter((v) => !v.isDigital);
      }
      return this.currencyList;
    }
    return [];
  }

  ngOnInit() {
    forkJoin([this.api.getOrderStatus(), this.selectApi.getCurrencySelect()]).subscribe(
      ([statusList, currencyList]) => {
        this.statusList = statusList;
        this.currencyList = currencyList;

        this.subHeaderService.merchantRegion$.pipe(takeUntil(this._destroyed)).subscribe(() => {
          this.onReset();
        });
      }
    );
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  // 排序
  onSort(sortKey: string): void {
    if (!this.list.length) return;

    if (!this.data.isAsc && this.data.order === sortKey) {
      this.data.order = '';
      this.data.isAsc = true;
      this.loadData(true);
      return;
    }

    if (!this.data.order || this.data.order !== sortKey) {
      this.data.order = sortKey;
      this.data.isAsc = false;
    }

    this.data.isAsc = !this.data.isAsc;
    this.loadData(true);
  }

  /**
   * 获取存款记录
   */
  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.loading(true);
    this.loadData$().subscribe((res) => {
      this.loading(false);
      this.list = res?.list || [];
      this.paginator.total = res?.total || 0;
    });
  }

  loadData$(sendData?: Partial<TransactionParams>) {
    const params = {
      Category: 'Deposit',
      Region: this.subHeaderService.regionCurrent || undefined,
      TenantId: this.subHeaderService.merchantCurrentId,
      OrderNum: this.data.orderNum,
      UID: this.data.uid,
      Status: this.data.status,
      IsDigital: this.data.isDigital,
      Currency: this.data.currency,
      CreatedTimeStart: toDateStamp(this.data.createdTime[0], false),
      CreatedTimeEnd: toDateStamp(this.data.createdTime[1], true),
      FinishedTimeStart: toDateStamp(this.data.finishedTime[0], false),
      FinishedTimeEnd: toDateStamp(this.data.finishedTime[1], true),
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
      ...(this.data.order
        ? {
            Order: this.data.order,
            IsAsc: this.data.isAsc,
          }
        : {}),
      ...sendData,
    };

    return this.withdrawalsApi.getWithdrawRecord(params);
  }

  /**
   * 获取存款交易记录明细
   * @param id
   */
  getDepositrecordDetail(id) {
    this.loading(true);
    this.api.getDepositrecorddetail(id).subscribe((res) => {
      this.loading(false);
      const modalRef = this.modalService.open(EditComponent, { width: '800px' });
      modalRef.componentInstance.item = res;
      modalRef.result.then(() => {}).catch(() => {});
    });
  }

  // 重置
  onReset(): void {
    this.paginator.page = 1;
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list: TransactionListResponse[] = [];
    if (isAll) {
      const maxDay = 31;
      const thrErr = () =>
        this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });

      // 比较时间是否超过 maxDay 天
      if (!(this.data.createdTime?.[0] && this.data.createdTime?.[1])) return thrErr();

      const start = toDateStamp(this.data.createdTime[0], false);
      const end = toDateStamp(this.data.createdTime[1], true);
      if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return thrErr();

      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$({ PageSize: 9e6 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.list) ? res.list : []; // success === false会自动抛出
      } finally {
        this.appService.isContentLoadingSubject.next(false);
      }
    } else {
      list = this.list;
    }

    this.exportExcel(cloneDeep(list));
  }

  /**
   * 导出Excel
   * @param list
   */
  async exportExcel(list: TransactionListResponse[]) {
    if (!list?.length) return;

    const orderNum = await this.lang.getOne('finance.deposit.orderNum'); // 交易单号
    const uid = 'UID'; // UID
    const vipLevel = await this.lang.getOne('member.giveOut.vipLevel'); // VIP等级
    const currency = await this.lang.getOne('common.currency'); // 币种
    const paymentMethod = await this.lang.getOne('finance.deposit.paymentMethod'); // 支付方式
    const transAmount = await this.lang.getOne('finance.deposit.transactionAmount'); // 交易金额
    const receivedAmount = await this.lang.getOne('finance.deposit.paidAmount'); // 到账金额
    const createTime = await this.lang.getOne('finance.deposit.applyTime'); // 申请时间
    const completeTime = await this.lang.getOne('finance.deposit.completeTime'); // 完成时间
    const status = await this.lang.getOne('finance.deposit.status'); // 状态
    const ftd = await this.lang.getOne('finance.deposit.ftd'); //是否首存
    const yes = await this.lang.getOne('common.yes');
    const no = await this.lang.getOne('common.no');

    const exportList = list.map((e) => ({
      [orderNum]: e.orderNum,
      [ftd]: e.isFirstDeposit ? yes : no,
      [uid]: ExcelFormat.str(e.uid || ''),
      [vipLevel]: e.vipLevel,
      [currency]: e.currency,
      [paymentMethod]: e.paymentMethod,
      [transAmount]: e.amount.toString(),
      [transAmount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.amount),
      [receivedAmount]: e.receiveAmount.toString(),
      [receivedAmount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.receiveAmount),
      [createTime]: e.createdTime ? moment(e.createdTime).format('YYYY-MM-DD HH:mm:ss') : '',
      [completeTime]: e.finishedTime ? moment(e.finishedTime).format('YYYY-MM-DD HH:mm:ss') : '',
      [status]: this.financeService.getStateTextSync(e.status),
    }));

    JSONToExcelDownload(exportList, 'deposit-list ' + Date.now());
  }

  // 加载状态
  loading(v: boolean): void {
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 打开会员详情标签页
   * @param item
   */
  openUID(item: any) {
    // PS：注意这里window.open 不能放在异步里，否则会被浏览器拦截（因为处于安全考虑浏览器只限制于点击后的同步操作，类似video必须点击才能自动播放声音视频）
    window.open(
      this.router.serializeUrl(
        this.router.createUrlTree(['/member/list/detail/overview'], {
          queryParams: { id: item.uid.slice(2), uid: item.uid, tenantId: item.tenantId },
        })
      )
    );
  }
}
