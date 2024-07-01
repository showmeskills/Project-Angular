import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { AppService } from 'src/app/app.service';
import { VipRecordsApi } from 'src/app/shared/api/vip-records.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { finalize, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { VipComparisonItem } from 'src/app/shared/interfaces/vip-records.interface';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ExcelFormat, JSONToExcelDownload, timeFormat, DestroyService } from 'src/app/shared/models/tools.model';
import { lastValueFrom } from 'rxjs';
import { MemberApi } from 'src/app/shared/api/member.api';
import { IntegerPipe } from 'src/app/shared/pipes/number.pipe';

@Component({
  selector: 'vip-comparison',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    EmptyComponent,
    FormRowComponent,
    LangPipe,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    OwlDateTimeComponent,
    OwlDateTimeInputDirective,
    PaginatorComponent,
    ReactiveFormsModule,
    FormsModule,
    OwlDateTimeTriggerDirective,
    CurrencyValuePipe,
    TimeFormatPipe,
    IntegerPipe,
  ],
  templateUrl: './vip-comparison.component.html',
  styleUrls: ['./vip-comparison.component.scss'],
  providers: [DestroyService],
})
export class VipComparisonComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: VipRecordsApi,
    private memberApi: MemberApi,
    private subHeader: SubHeaderService,
    private _destroy$: DestroyService,
    public lang: LangService
  ) {}

  ngOnInit() {
    // this.subHeader.timeCurrent$
    //   .pipe(takeUntil(this._destroy$)) // 销毁时取消订阅
    //   .subscribe(() => {
    //     if (this.subHeader.merchantCurrentId) {
    //       this.loadData(true);
    //     }
    //   });

    this.subHeader.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.loadData(true);
      this.memberApi
        .getAccountManagerList({ tenantId: this.subHeader.merchantCurrentId })
        .subscribe((list) => (this.accountManagerList = list));
    });
  }

  EMPTY_DATA = {
    uid: '',
    accountId: '',
    firstTimePeriod: [] as Date[], // 时间范围 默认今天
    secondTimePeriod: [] as Date[], // 时间范围 默认今天
  };

  data = cloneDeep(this.EMPTY_DATA);
  list: VipComparisonItem[] = [];
  accountManagerList: Array<{ id: string; name: string }> = [];

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  // /** 顶部全局时间 */
  // headerTime: string[] = [];
  /**
   * 表格标题
   */
  get tableTitle() {
    return Object.keys(this.list?.[0] || {});
  }

  getParams() {
    // this.headerTime = this.subHeader.curTime.length
    //   ? [moment(this.subHeader.curTime[0]).format('YYYY-MM-DD'), moment(this.subHeader.curTime[1]).format('YYYY-MM-DD')]
    //   : [];
    return {
      TenantId: this.subHeader.merchantCurrentId,
      uid: this.data.uid,
      accountId: this.data.accountId || '',
      FirstBeginTime: timeFormat(this.data.firstTimePeriod[0], 'YYYY-MM-DD') || undefined,
      FirstEndTime: timeFormat(this.data.firstTimePeriod[1], 'YYYY-MM-DD') || undefined,
      SecondBeginTime: timeFormat(this.data.secondTimePeriod[0], 'YYYY-MM-DD') || undefined,
      SecondEndTime: timeFormat(this.data.secondTimePeriod[1], 'YYYY-MM-DD') || undefined,
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    if (this.data.firstTimePeriod.length < 2 || this.data.secondTimePeriod.length < 2) {
      this.appService.showToastSubject.next({ msgLang: 'system.export.selectTime' });
      return;
    }

    if (this.data.uid != '' && this.data.accountId != '') {
      this.appService.showToastSubject.next({ msgLang: 'report.noSearch' });
      return;
    }
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getVipComparisonData(this.getParams())
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  /**
   * 重置
   */
  onReset() {
    this.data = cloneDeep(this.EMPTY_DATA);
    this.list = [];
    this.loadData(true);
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list: VipComparisonItem[] = [];
    if (isAll) {
      // const maxDay = 90;
      // const thrErr = () =>
      //   this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });

      // 比较时间是否超过90
      // if (!(this.headerTime[0] && this.headerTime[1])) return thrErr();

      // const start = toDateStamp(this.headerTime[0], false);
      // const end = toDateStamp(this.headerTime[1], true);
      // if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return thrErr();

      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.api.getVipComparisonData({ ...this.getParams(), pageSize: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = res?.list || []; // success === false会自动抛出
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
  async exportExcel(list: any[]) {
    if (!list?.length) return;

    const timePeriod = await this.lang.getOne('report.playerItem.timePeriod');
    const uid = 'UID'; // UID
    const accountManager = await this.lang.getOne('report.playerItem.accountManager');
    // const createTime = await this.lang.getOne('report.playerItem.createTime');
    // const isFirstVip = await this.lang.getOne('report.playerItem.isFirstVip');
    // const bindAccountTime = await this.lang.getOne('report.playerItem.bindAccountTime');
    const vipActiveDay = await this.lang.getOne('report.playerItem.vipActiveDay');
    // const lastLoginTime = await this.lang.getOne('report.playerItem.lastLoginTime');
    const totalDeposit = await this.lang.getOne('report.playerItem.totalDeposit');
    const depositCount = await this.lang.getOne('report.playerItem.depositCount');
    const totalWithdrawal = await this.lang.getOne('report.playerItem.totalWithdrawal');
    const withdrawCount = await this.lang.getOne('report.playerItem.withdrawCount');
    const activeDaysMonth = await this.lang.getOne('report.playerItem.activeDaysMonth');
    const activeThirtyDay = await this.lang.getOne('report.playerItem.activeThirtyDay');
    const accountActiveDay = await this.lang.getOne('report.playerItem.accountActiveDay');
    const casinoActiveFlow = await this.lang.getOne('report.playerItem.casinoActiveFlow');
    const sportsActiveFlow = await this.lang.getOne('report.playerItem.sportsActiveFlow');
    const totalActiveFlow = await this.lang.getOne('report.playerItem.totalActiveFlow');
    const toBon = await this.lang.getOne('report.playerItem.toBon');
    const toDep = await this.lang.getOne('report.playerItem.toDep');
    const totalAmount = await this.lang.getOne('report.playerItem.totalAmount');
    const bonusesCount = await this.lang.getOne('report.playerItem.bonusesCount');
    // const avgBetCasino = await this.lang.getOne('report.playerItem.avgBetCasino');
    // const avgBetSports = await this.lang.getOne('report.playerItem.avgBetSports');
    // const avgBet = await this.lang.getOne('report.playerItem.avgBet');
    // const yes = await this.lang.getOne('common.yes');
    // const no = await this.lang.getOne('common.no');

    const exportList = list.map((e) => ({
      [timePeriod]: e.timePeriod || '-',
      [uid]: ExcelFormat.str(e.uid),
      [accountManager]: e.accountManager || '-',
      // [createTime]: timeFormat(e.createTime),
      // [isFirstVip]: e.isFirstVip ? yes : no,
      // [bindAccountTime]: timeFormat(e.bindAccountTime),
      // [lastLoginTime]: timeFormat(e.lastLoginTime),
      [totalDeposit]: e.totalDeposit,
      [depositCount]: e.depositCount,
      [totalWithdrawal]: e.totalWithdrawal,
      [withdrawCount]: e.withdrawCount,
      NGR: e.ngr,
      [vipActiveDay]: e.vipActiveDay,
      [activeDaysMonth]: e.activeDaysMonth,
      [activeThirtyDay]: e.activeThirtyDay,
      [accountActiveDay]: e.accountActiveDay,
      [casinoActiveFlow]: e.casinoActiveFlow,
      [sportsActiveFlow]: e.sportsActiveFlow,
      [totalActiveFlow]: e.totalActiveFlow,
      [toBon]: e.toBon + '%',
      [toDep]: e.toDep + '%',
      [totalAmount]: e.totalAmount,
      [bonusesCount]: e.bonusesCount,
      // [avgBetCasino]: e.avgBetCasino,
      // [avgBetSports]: e.avgBetSports,
      // [avgBet]: e.avgBet,
    }));

    JSONToExcelDownload(exportList, 'vip-comparison' + Date.now());
  }
}
