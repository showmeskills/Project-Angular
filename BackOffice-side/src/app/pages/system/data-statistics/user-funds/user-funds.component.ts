import { Component, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { Subject, zip, tap, switchMap, takeUntil, finalize, lastValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { StatApi } from 'src/app/shared/api/stat.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { StatisticsUserFundsEditComponent } from './edit/edit.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-user-funds',
  templateUrl: './user-funds.component.html',
  styleUrls: ['./user-funds.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    NgFor,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    NgIf,
    AngularSvgIconModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class StatisticsUserFundsComponent implements OnInit, OnDestroy {
  constructor(
    private appService: AppService,
    private api: StatApi,
    private selectApi: SelectApi,
    public subHeaderService: SubHeaderService,
    private modal: MatModal,
    public lang: LangService
  ) {}

  _destroy$: any = new Subject<void>(); // 订阅商户的流
  pageSizes: number[] = [12, ...PageSizes]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  currencyList: Array<any> = []; //币种名称列表

  data: any = {};
  dataEmpty: any = {
    uid: '',
    time: '',
    currency: '',
  };

  list: any = [];

  ngOnInit() {
    this.paginator.pageSize = 12;
    this.data = { ...this.dataEmpty };
    // 请求初始化数据
    zip(this.selectApi.getCurrencySelect())
      .pipe(
        tap(([currencyList]) => {
          this.currencyList = currencyList || [];
        }),
        // 订阅商户
        switchMap(() => this.subHeaderService.merchantId$)
      )
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.loadData(true));
  }

  loadData(resetPage = false) {
    if (this.isLoading) return;

    this.loading(true);
    this.loadData$(resetPage)
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res) => {
        this.list = Array.isArray(res?.list) ? res?.list : [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      TenantId: +this.subHeaderService.merchantCurrentId,
      Uid: this.data.uid,
      Currency: this.data.currency,
      ...(this.data.time[0]
        ? {
            StartDate: moment(Number(toDateStamp(this.data.time[0], false))).format('YYYY-MM-DD'),
          }
        : {}),
      ...(this.data.time[1]
        ? {
            EndDate: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD'),
          }
        : {}),
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getMemberFundsStats(parmas);
  }

  onReset(): void {
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  goEdit(data?: any) {
    const parmas = {
      TenantId: +this.subHeaderService.merchantCurrentId,
      ...data,
    };
    const modal = this.modal.open(StatisticsUserFundsEditComponent, { width: '1200px' });
    modal.componentInstance['parmas'] = parmas;
    modal.result.then(() => {}).catch(() => {});
  }

  reStatistics() {
    if (this.data.time[0] && this.data.time[1]) {
      this.loading(true);
      const params = {
        StartDate: moment(Number(toDateStamp(this.data.time[0], false))).format('YYYY-MM-DD'),
        EndDate: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD'),
        category: 'MemberFund',
      };
      this.api.restat(params).subscribe((res) => {
        this.loading(false);
        this.appService.showToastSubject.next({
          msgLang: res === true ? 'system.statistics.recalculationSuccessful' : 'system.statistics.recalculationFailed',
          successed: res === true ? true : false,
        });
        if (res === true) this.loadData(true);
      });
    } else {
      this.appService.showToastSubject.next({
        msgLang: 'system.statistics.recalculationTips',
        successed: false,
      });
    }
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * 导出
   */
  async onExport() {
    let list: any[] = [];
    const maxDay = 90;
    const thrErr = () =>
      this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });

    // 比较时间是否超过90
    if (!(this.data.time?.[0] && this.data.time?.[1])) return thrErr();

    const start = toDateStamp(this.data.time[0], false);
    const end = toDateStamp(this.data.time[1], true);
    if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return thrErr();

    try {
      this.loading(true);
      const res = await lastValueFrom(this.loadData$(true, { PageSize: 9e5 }));
      this.loading(false);
      list = Array.isArray(res?.list) ? res?.list : []; // success === false会自动抛出
    } finally {
      this.loading(false);
    }

    this.exportExcel(cloneDeep(list));
  }

  /**
   * 导出Excel
   * @param list
   */
  async exportExcel(list: any[]) {
    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const currency = await this.lang.getOne('common.currency'); // 币种
    const th_1 = await this.lang.getOne('system.userFunds.th_1'); // 存款金额
    const th_2 = await this.lang.getOne('system.userFunds.th_2'); // 存款订单数量
    const th_3 = await this.lang.getOne('system.userFunds.th_3'); // 存款成功订单数量
    const th_4 = await this.lang.getOne('system.userFunds.th_4'); // 提款金额
    const th_5 = await this.lang.getOne('system.userFunds.th_5'); // 提款订单数量
    const th_6 = await this.lang.getOne('system.userFunds.th_6'); // 提款成功订单数量
    const th_7 = await this.lang.getOne('system.userFunds.th_7'); // 提款手续费
    const th_8 = await this.lang.getOne('system.userFunds.th_8'); // 调账金额
    const th_9 = await this.lang.getOne('system.userFunds.th_9'); // 调账金额(存款)
    const th_10 = await this.lang.getOne('system.userFunds.th_10'); // 调账金额(提款)
    const th_11 = await this.lang.getOne('system.userFunds.th_11'); // 调账金额(红利)
    const th_12 = await this.lang.getOne('system.userFunds.th_12'); // 调账金额(输赢)
    const th_13 = await this.lang.getOne('system.userFunds.th_13'); // PSP存款手续费
    const th_14 = await this.lang.getOne('system.userFunds.th_14'); // PSP提款手续费
    const th_15 = await this.lang.getOne('system.memberBonus.th_16'); // 统计时间

    JSONToExcelDownload(
      list.map((e) => ({
        ['UID']: e.uid || '-',
        [currency]: e.currency || '-',
        [th_1]: e.depositAmount,
        [th_1 + '(U)']: e.depositAmountUsdt,
        [th_2]: e.depositOrderCount,
        [th_3]: e.depositOrderSuccessCount,
        [th_4]: e.withdrawAmount,
        [th_4 + '(U)']: e.withdrawAmountUsdt,
        [th_5]: e.withdrawOrderCount,
        [th_6]: e.withdrawOrderSuccessCount,
        [th_7]: e.withdrawFee,
        [th_7 + '(U)']: e.withdrawFeeUsdt,
        [th_8]: e.adjustAmount,
        [th_8 + '(U)']: e.adjustAmountUsdt,
        [th_9]: e.depositAdjustAmount,
        [th_9 + '(U)']: e.depositAdjustAmountUsdt,
        [th_10]: e.withdrawAdjustAmount,
        [th_10 + '(U)']: e.withdrawAdjustAmountUsdt,
        [th_11]: e.bonusAdjustAmount,
        [th_11 + '(U)']: e.bonusAdjustAmountUsdt,
        [th_12]: e.payoutAdjustAmount,
        [th_12 + '(U)']: e.payoutAdjustAmountUsdt,
        [th_13]: e.pspDepositFee,
        [th_13 + '(U)']: e.pspDepositFeeUsdt,
        [th_14]: e.pspWithdrawFee,
        [th_14 + '(U)']: e.pspWithdrawFeeUsdt,
        [th_15]: timeFormat(e.statDate, 'yyyy-MM-DD'),
      })),

      'user-funds-list ' + Date.now()
    );
  }
}
