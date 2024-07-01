import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { catchError, finalize, map, retry, takeUntil, tap } from 'rxjs/operators';
import { delay, filter, forkJoin, lastValueFrom, Subject, Subscription, switchMap, take, timer } from 'rxjs';
import { ExcelFormat, JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { DepositApi } from 'src/app/shared/api/deposit.api';
import { WithdrawalsApi } from 'src/app/shared/api/withdrawals.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { EditComponent } from 'src/app/pages/finance/withdrawals/edit/edit.component';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import moment from 'moment';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FinanceService, TransStatusLabel } from 'src/app/pages/finance/finance.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { OrderStatusEnum, TransactionListResponse, TransactionParams } from 'src/app/shared/interfaces/transaction';
import { cloneDeep } from 'lodash';
import { TransactionOrderStatusCustom } from 'src/app/shared/interfaces/deposit.interface';
import { SelectApi } from 'src/app/shared/api/select.api';
import { Currency } from 'src/app/shared/interfaces/currency';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { DisableControlDirective } from 'src/app/shared/directive/control.directive';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { CurrencyService } from 'src/app/shared/service/currency.service';

@Component({
  selector: 'app-withdrawals',
  templateUrl: './withdrawals.component.html',
  styleUrls: ['./withdrawals.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    InputTrimDirective,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    NgSwitch,
    NgSwitchCase,
    NgIf,
    PaginatorComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    TransStatusLabel,
    EmptyComponent,
    LabelComponent,
    VipNamePipe,
    DisableControlDirective,
    AttrDisabledDirective,
  ],
})
export class WithdrawalsComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    private appService: AppService,
    private modalService: MatModal,
    private depositApi: DepositApi,
    private selectApi: SelectApi,
    private withdrawalsApi: WithdrawalsApi,
    public subHeaderService: SubHeaderService,
    private langService: LangService,
    private financeService: FinanceService,
    private currencyService: CurrencyService
  ) {}

  _destroyed: any = new Subject<void>(); // 订阅商户的流

  pageSizes: number[] = [...PageSizes, 2e3, 3e3, 5e3]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页

  statusList: TransactionOrderStatusCustom[] = []; // 订单状态列表
  currencyList: Currency[] = []; // 币种列表
  currencyTypeList = [
    // 币种类型列表
    { name: 'finance.deposit.legalCurrency', value: false },
    { name: 'finance.deposit.cryptoCurrency', value: true },
  ];

  dataEmpty = {
    orderNum: '', // 交易单号
    uid: '', // 会员Id
    status: [''], // 订单状态
    isDigital: '' as string | boolean, // 货币类型
    currency: '', // 货币类型
    createdTime: [], // 创建时间
    finishedTime: [], // 完成时间
    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  data = cloneDeep(this.dataEmpty); // 查询参数
  list: TransactionListResponse[] = []; // 表格列表数据
  tabList = [
    { name: '审核中及待定', lang: 'finance.withdrawals.reviewAndPending', value: 1 },
    { name: '全部', lang: 'common.all', value: 2 },
    { name: '自动', lang: 'finance.withdrawals.auto', value: 3 },
  ];

  curTab = 1; // 当前tab
  isAutoReview: boolean | undefined = false; // true=自动, false=审核中及待定（剔除自动）

  /**
   * 轮询相关
   */
  retryCount = 3; // 失败重试次数
  countDown = 5; // 倒计时更新
  currentTime = 0; // 更新反馈
  stopRefresh$ = new Subject<void>();
  refreshSubscription: Subscription;

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

  ngOnInit(): void {
    forkJoin([this.depositApi.getOrderStatus(), this.selectApi.getCurrencySelect()]).subscribe(
      ([statusList, currencyList]) => {
        this.statusList = statusList;
        this.dataEmpty.status = ['', ...this.statusList.map((e) => e.categoryCode)];
        this.data.status = [...this.dataEmpty.status];
        this.currencyList = currencyList;

        this.subHeaderService.merchantRegion$.pipe(takeUntil(this._destroyed)).subscribe(() => {
          this.updateTab();
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.stopRefresh();
    this.refreshSubscription?.unsubscribe();
  }

  /**
   * 排序
   * @param sortKey
   */
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

  loadData(resetPage = false, data?: Partial<TransactionParams>) {
    resetPage && (this.paginator.page = 1);

    this.stopRefresh();
    this.refreshSubscription?.unsubscribe();
    this.stopRefresh$ = new Subject<void>();

    if (data) {
      this.data = cloneDeep({ ...this.data, ...data });
    }

    if (this.curTab === 1) {
      this.stopRefresh$.subscribe(() => {
        this.currentTime = 0;
      });
      this.refreshSubscription = this.executeRefresh$().subscribe();
    } else {
      this.reloadData(resetPage);
    }
  }

  /**
   * 获取存款记录
   */
  reloadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);

    this.loading(true);
    this.loadData$().subscribe();
  }

  fetchData$(sendData?: Partial<TransactionParams>) {
    const params = {
      Category: 'Withdraw',
      Region: this.subHeaderService.regionCurrent || undefined,
      TenantId: this.subHeaderService.merchantCurrentId,
      OrderNum: this.data.orderNum,
      UID: this.data.uid,
      IsAutoReview: this.isAutoReview,
      StatusList:
        this.data.status.length >= this.dataEmpty.status.length ? undefined : this.data.status.filter((e) => e),
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

  loadData$(sendData?: Partial<TransactionParams>) {
    return this.fetchData$(sendData).pipe(
      tap((res) => {
        this.loading(false);
        this.list = res.list || [];
        this.paginator.total = res.total || 0;
      })
    );
  }

  /**
   * 获取存款交易记录明细
   * @param id
   */
  getWithdrawDetail(tpl, id) {
    this.modalService.open(tpl, { width: '500px', data: id });
  }

  onDetail(id) {
    this.loading(true);
    this.withdrawalsApi
      .getWithdrawDetail(id, true)
      .pipe(finalize(() => this.loading(false)))
      .subscribe(async (res) => {
        this.stopRefresh();
        this.refreshSubscription?.unsubscribe();
        this.stopRefresh$ = new Subject<void>();

        const service = this.modalService.open(EditComponent, {
          width: '1000px',
        });
        service.componentInstance.item = res;

        let result;
        try {
          result = await service.result;
        } finally {
          if (this.curTab === 1) {
            this.stopRefresh$.subscribe(() => {
              this.currentTime = 0;
            });
            this.refreshSubscription = this.executeRefresh$().subscribe();
          } else if (result === true) {
            this.loadData();
          }
        }
      });
  }

  updateTab() {
    this.onTabChange(this.tabList.find((e) => e.value === this.curTab) ?? this.tabList[0]);
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
        const res = await lastValueFrom(this.fetchData$({ PageSize: 9e6 }));
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

    const ruleName = await this.langService.getOne('finance.withdrawals.ruleName'); // 规则名称
    const orderNum = await this.langService.getOne('finance.deposit.orderNum'); // 交易单号
    const uid = 'UID'; // UID
    const vipLevel = await this.langService.getOne('member.giveOut.vipLevel'); // VIP等级
    const currency = await this.langService.getOne('common.currency'); // 币种
    const paymentMethod = await this.langService.getOne('finance.withdrawals.withdrawalMethod'); // 支付方式
    const transAmount = await this.langService.getOne('finance.deposit.transactionAmount'); // 交易金额
    const receivedAmount = await this.langService.getOne('finance.deposit.paidAmount'); // 到账金额
    const createTime = await this.langService.getOne('finance.deposit.applyTime'); // 申请时间
    const completeTime = await this.langService.getOne('finance.deposit.completeTime'); // 完成时间
    const status = await this.langService.getOne('finance.deposit.status'); // 状态
    const st1review = await this.langService.getOne('finance.withdrawals.st1review'); // 1审中
    const nd2review = await this.langService.getOne('finance.withdrawals.nd2review'); // 2审中
    const reviewer = await this.langService.getOne('finance.deposit.aduitor');
    const claimTime = await this.langService.getOne('finance.withdrawals.claimTime'); // 申请时间：第一次查看时间
    const holdWDTime = await this.langService.getOne('finance.withdrawals.holdWDTime'); // 保留提款时间：如果状态选择了on hold，就记录这个hold住的时间
    const claimBy = await this.langService.getOne('finance.withdrawals.claimBy'); // 申请人：第一次点击这张单的人
    const oneApprovedTime = await this.langService.getOne('finance.withdrawals.oneApproveTime'); // 一级审核批准时间
    const oneApprovedBy = await this.langService.getOne('finance.withdrawals.oneApprovedBy'); // 一级审核批准人
    const twoApprovedTime = await this.langService.getOne('finance.withdrawals.twoApproveTime'); // 二级审核批准时间
    const twoApprovedBy = await this.langService.getOne('finance.withdrawals.twoApprovedBy'); // 二级审核批准人

    const exportList = list.map((e) => ({
      [ruleName]: e.policyName,
      [orderNum]: e.orderNum,
      [uid]: ExcelFormat.str(e.uid || ''),
      [vipLevel]: e.vipLevel,
      [currency]: e.currency,
      [paymentMethod]: e.paymentMethod,
      [transAmount]: '-' + e.amount.toString(),
      [transAmount + '（USDT）']: -this.currencyService.getUsdtRateAmount(e?.currency, e?.amount),
      [receivedAmount]: e.receiveAmount.toString(),
      [receivedAmount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.receiveAmount),
      [createTime]: e.createdTime ? moment(e.createdTime).format('YYYY-MM-DD HH:mm:ss') : '-',
      [completeTime]: e.finishedTime ? moment(e.finishedTime).format('YYYY-MM-DD HH:mm:ss') : '-',
      [reviewer]: e.reviewer || '-',
      [claimTime]: timeFormat(e.claimTime),
      [holdWDTime]: timeFormat(e.onHoldTime),
      [claimBy]: e.claimBy || '-',
      [oneApprovedTime]: timeFormat(e.approveTime),
      [oneApprovedBy]: e.approveBy || '-',
      [twoApprovedTime]: timeFormat(e.approve2Time),
      [twoApprovedBy]: e.approve2By || '-',
      [status]:
        (e.status as any) === OrderStatusEnum[OrderStatusEnum.Review]
          ? e.isApprove2
            ? nd2review
            : st1review
          : this.financeService.getStateTextSync(e.status),
    }));

    JSONToExcelDownload(exportList, 'withdrawals-list ' + Date.now());
  }

  // 加载状态
  loading(v: boolean): void {
    this.appService.isContentLoadingSubject.next(v);
  }

  /** 通过审核 */
  onPass(id, isPass: boolean, close: any) {
    this.withdrawalsApi.withdrawReview(id, isPass).subscribe((res) => {
      res = res === true;

      this.appService.showToastSubject.next({ msg: `操作${res ? '成功' : '失败'}`, successed: res });
      if (!res) return;

      this.loadData();
      close();
    });
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

  /**
   * tab切换
   * @param item
   */
  onTabChange(item: (typeof this.tabList)[0]) {
    this.curTab = item.value;
    const data = cloneDeep(this.dataEmpty);
    data.status = item.value === 1 ? ['Review', 'OnHold'] : data.status;

    switch (item.value) {
      case 1:
        this.isAutoReview = false;
        break;
      case 3:
        this.isAutoReview = true;
        break;
      default:
        this.isAutoReview = undefined;
        break;
    }

    this.loadData(true, data);
  }

  /**
   * 选择币种类型
   */
  onAllStatus() {
    if (this.data.status.filter((e) => e).length >= this.dataEmpty.status.filter((e) => e).length) {
      this.data.status = [];
    } else {
      this.data.status = [...this.dataEmpty.status];
    }
  }

  /**
   * 检测是否全选，勾上全选
   */
  onCheckStatus() {
    if (this.data.status.filter((e) => e).length >= this.dataEmpty.status.filter((e) => e).length) {
      this.data.status = [...this.dataEmpty.status];
    } else {
      this.data.status = this.data.status.filter((e) => e);
    }
  }

  /**
   * 更新原始请求
   * @param isLoop
   */
  loadUpdateOrigin$(isLoop = false) {
    return this.loadData$().pipe(
      catchError((error) => {
        if (!isLoop) throw error; // 如果不是轮训请求，这里中断不执行，后续retry不会进行重试
        return this.loadUpdateOrigin$().pipe(delay(1000)); // 延迟1s 继续轮训心跳包接口
      }),
      retry({ count: isLoop ? this.retryCount : 0, delay: 1e3 }) // 重试
    );
  }

  /**
   * 执行轮训更新
   * @param isLoop
   */
  executeRefresh$(isLoop = false) {
    return this.loadUpdateOrigin$(isLoop).pipe(
      tap(() => {
        this.currentTime = 0;
      }),
      switchMap(() =>
        // 根据设定每几秒请求一次更新
        timer(0, 1000).pipe(
          map((i) => this.countDown - i),
          take(this.countDown + 1),
          takeUntil(this.stopRefresh$),
          tap((i) => (this.currentTime = i)) // 或许可以改用mapTo或scan
        )
      ),
      filter((i) => i === 0),
      switchMap(() => this.executeRefresh$(true)),
      takeUntil(this.stopRefresh$) // 取消轮训
    );
  }

  stopRefresh() {
    this.stopRefresh$.next();
    this.stopRefresh$.complete();
  }
}
