import { Component, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { Subject, zip, tap, switchMap, takeUntil, lastValueFrom, finalize } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { StatApi } from 'src/app/shared/api/stat.api';
import { JSONToExcelDownload, timeFormat, toDateStamp } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
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
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';

@Component({
  selector: 'app-game-bet',
  templateUrl: './game-bet.component.html',
  styleUrls: ['./game-bet.component.scss'],
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
export class StatisticsGameBetComponent implements OnInit, OnDestroy {
  constructor(
    private appService: AppService,
    private api: StatApi,
    private selectApi: SelectApi,
    public subHeaderService: SubHeaderService,
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

    return this.api.getMemberWagerStats(parmas);
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
        category: 'MemberWager',
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
    const gameMaker = await this.lang.getOne('budget.record.gameMaker'); // 游戏厂商
    const gameCategory = await this.lang.getOne('member.detail.freeSpin.gameCategory'); // 游戏类别
    const gameName = await this.lang.getOne('original.profitAnalysis.gameName'); // 游戏名称
    const th_1 = await this.lang.getOne('system.gameBet.th_1'); // 下注金额
    const th_2 = await this.lang.getOne('system.gameBet.th_2'); // 有效流水
    const th_3 = await this.lang.getOne('system.gameBet.th_3'); // 游戏有效流水
    const th_4 = await this.lang.getOne('system.gameBet.th_4'); // 赢钱的下注金额
    const th_5 = await this.lang.getOne('system.gameBet.th_5'); // 赢钱的输赢
    const th_6 = await this.lang.getOne('system.gameBet.th_6'); // 赢钱的有效流水
    const th_7 = await this.lang.getOne('system.gameBet.th_7'); // 赢钱的游戏有效流水
    const th_8 = await this.lang.getOne('system.gameBet.th_8'); // 取消的下注金额
    const th_9 = await this.lang.getOne('system.gameBet.th_9'); // 下注次数
    const th_10 = await this.lang.getOne('system.gameBet.th_10'); // 赢的次数
    const th_11 = await this.lang.getOne('system.gameBet.th_11'); // 输的次数
    const th_12 = await this.lang.getOne('system.gameBet.th_12'); // 取消的次数
    const th_13 = await this.lang.getOne('system.gameBet.th_13'); // 抵用金
    const th_14 = await this.lang.getOne('system.gameBet.th_14'); // 输钱总额
    const th_15 = await this.lang.getOne('system.memberBonus.th_16'); // 统计时间

    JSONToExcelDownload(
      list.map((e) => ({
        ['UID']: e.uid || '-',
        [currency]: e.currency || '-',
        [gameMaker]: e.gameProvider || '-',
        [gameCategory]: e.gameCategory || '-',
        [gameName]: e.name || '-',
        [th_1]: e.betAmount,
        [th_1 + '(U)']: e.betUsdt,
        [th_2]: e.activeFlowAmount,
        [th_2 + '(U)']: e.activeFlowUsdt,
        [th_3]: e.gameActiveFlowAmount,
        [th_3 + '(U)']: e.gameActiveFlowUsdt,
        [th_4]: e.winBetAmount,
        [th_4 + '(U)']: e.winBetUsdt,
        [th_5]: e.winPayoutAmount,
        [th_5 + '(U)']: e.winPayoutUsdt,
        [th_6]: e.winActiveFlowAmount,
        [th_6 + '(U)']: e.winActiveFlowUsdt,
        [th_7]: e.winGameActiveFlowAmount,
        [th_7 + '(U)']: e.winGameActiveFlowUsdt,
        [th_8]: e.cancelBetAmount,
        [th_8 + '(U)']: e.cancelBetUsdt,
        [th_9]: e.wagerCount,
        [th_10]: e.winCount,
        [th_11]: e.lostCount,
        [th_12]: e.cancelCount,
        [th_13]: e.couponAmount,
        [th_13 + '(U)']: e.couponUsdt,
        [th_14]: e.lostPayoutAmount,
        [th_14 + '(U)']: e.lostPayoutUsdt,
        [th_15]: timeFormat(e.statDate, 'yyyy-MM-DD'),
      })),

      'game-bet-list ' + Date.now()
    );
  }
}
