import { Component, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { Subject, zip, tap, switchMap, takeUntil, finalize, lastValueFrom } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { SelectApi } from 'src/app/shared/api/select.api';
import { StatApi } from 'src/app/shared/api/stat.api';
import { JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
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
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'app-user-balance',
  templateUrl: './user-balance.component.html',
  styleUrls: ['./user-balance.component.scss'],
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
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class StatisticsUserBalanceComponent implements OnInit, OnDestroy {
  constructor(
    private appService: AppService,
    private api: StatApi,
    private selectApi: SelectApi,
    private memberApi: MemberApi,
    public subHeaderService: SubHeaderService,
    public lang: LangService
  ) {}

  _destroy$: any = new Subject<void>(); // 订阅商户的流
  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false;

  currencyList: Array<any> = []; //币种名称列表
  walletList: Array<any> = [];

  data: any = {};
  dataEmpty: any = {
    uid: '',
    time: '',
    currency: '',
    walletType: '',
  };

  list: any = [];

  ngOnInit() {
    this.data = { ...this.dataEmpty };
    // 请求初始化数据
    zip(this.selectApi.getCurrencySelect(), this.memberApi.getAssetourSestatusList())
      .pipe(
        tap(([currencyList, walletList]) => {
          this.currencyList = currencyList || [];
          this.walletList = walletList || [];
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
      WalletType: this.data.walletType,
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getMemberBalanceStats(parmas);
  }

  onReset(): void {
    this.data = { ...this.dataEmpty };
    this.loadData(true);
  }

  reStatistics() {
    if (this.data.time[0] && this.data.time[1]) {
      this.loading(true);
      const params = {
        StartDate: moment(Number(toDateStamp(this.data.time[0], false))).format('YYYY-MM-DD'),
        EndDate: moment(Number(toDateStamp(this.data.time[1], true))).format('YYYY-MM-DD'),
        category: 'MemberBalance',
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
    const th_1 = await this.lang.getOne('system.userBalance.th_1'); // 钱包类型
    const th_2 = await this.lang.getOne('system.userBalance.th_2'); // 余额
    const th_3 = await this.lang.getOne('system.userBalance.th_3'); // 冻结金额
    const th_4 = await this.lang.getOne('system.userBalance.th_4'); // 当日转入金额
    const th_5 = await this.lang.getOne('system.userBalance.th_5'); // 当日转出金额
    const th_6 = await this.lang.getOne('system.memberBonus.th_16'); // 统计时间

    JSONToExcelDownload(
      list.map((e) => ({
        ['UID']: e.uid || '-',
        [currency]: e.currency || '-',
        [th_1]: e.walletType || '-',
        [th_2]: e.balance,
        [th_2 + '(U)']: e.balanceUsdt,
        [th_3]: e.freezeAmount,
        [th_3 + '(U)']: e.freezeAmountUsdt,
        [th_4]: e.intoAmount,
        [th_4 + '(U)']: e.intoAmountUsdt,
        [th_5]: e.outAmount,
        [th_5 + '(U)']: e.outAmountUsdt,
        [th_6]: timeFormat(e.statDate, 'yyyy-MM-DD'),
      })),

      'user-balance-list ' + Date.now()
    );
  }
}
