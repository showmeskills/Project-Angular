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
import { PlayersPromoteItem } from 'src/app/shared/interfaces/vip-records.interface';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import moment from 'moment';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import {
  ExcelFormat,
  JSONToExcelDownload,
  timeFormat,
  toDateStamp,
  DestroyService,
} from 'src/app/shared/models/tools.model';
import { lastValueFrom } from 'rxjs';
import { MemberApi } from 'src/app/shared/api/member.api';
import { IntegerPipe } from 'src/app/shared/pipes/number.pipe';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'players-promote',
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
    NgbPopover,
  ],
  templateUrl: './players-promote.component.html',
  styleUrls: ['./players-promote.component.scss'],
  providers: [DestroyService],
})
export class PlayersPromoteComponent implements OnInit {
  constructor(
    public appService: AppService,
    private api: VipRecordsApi,
    private memberApi: MemberApi,
    private subHeader: SubHeaderService,
    private _destroy$: DestroyService,
    public lang: LangService
  ) {}

  ngOnInit() {
    this.subHeader.timeCurrent$
      .pipe(takeUntil(this._destroy$)) // 销毁时取消订阅
      .subscribe(() => {
        if (this.subHeader.merchantCurrentId) {
          this.loadData(true);
        }
      });

    this.subHeader.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      this.loadData(true);
      this.memberApi
        .getAccountManagerList({ tenantId: this.subHeader.merchantCurrentId })
        .subscribe((list) => (this.accountManagerList = list));
    });
  }

  /** 定义排序 属性 */
  sortRow: { sortField: null | string; isAsc: null | boolean } = {
    sortField: null,
    isAsc: null,
  };

  EMPTY_DATA = {
    uid: '',
    accountId: '',
  };

  data = cloneDeep(this.EMPTY_DATA);
  list: PlayersPromoteItem[] = [];
  accountManagerList: Array<{ id: string; name: string }> = [];

  pageSizes: number[] = PageSizes; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  /** 顶部全局时间 */
  headerTime: string[] = [];
  /**
   * 表格标题
   */
  get tableTitle() {
    return Object.keys(this.list?.[0] || {});
  }

  getParams() {
    this.headerTime = this.subHeader.curTime.length
      ? [moment(this.subHeader.curTime[0]).format('YYYY-MM-DD'), moment(this.subHeader.curTime[1]).format('YYYY-MM-DD')]
      : [];
    return {
      TenantId: this.subHeader.merchantCurrentId,
      uid: this.data.uid,
      accountId: this.data.accountId || '',
      BeginTime: this.headerTime[0],
      EndTime: this.headerTime[1],
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
    };
  }

  loadData(resetPage = false) {
    resetPage && (this.paginator.page = 1);
    this.onResetSort();
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .getPlayersPromoteData(this.getParams())
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
    let list: PlayersPromoteItem[] = [];
    if (isAll) {
      const maxDay = 90;
      const thrErr = () =>
        this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: maxDay } });

      // 比较时间是否超过90
      if (!(this.headerTime[0] && this.headerTime[1])) return thrErr();

      const start = toDateStamp(this.headerTime[0], false);
      const end = toDateStamp(this.headerTime[1], true);
      if (Math.abs(moment(start).diff(end, 'days')) > maxDay) return thrErr();

      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.api.getPlayersPromoteData({ ...this.getParams(), pageSize: 9e5 }));
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

    const uid = 'UID'; // UID
    const accountManager = await this.lang.getOne('report.playerItem.accountManager');
    const createTime = await this.lang.getOne('report.playerItem.createTime');
    const lastLoginTime = await this.lang.getOne('report.playerItem.lastLoginTime');
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
    const avgBetCasino = await this.lang.getOne('report.playerItem.avgBetCasino');
    const avgBetSports = await this.lang.getOne('report.playerItem.avgBetSports');
    const avgBet = await this.lang.getOne('report.playerItem.avgBet');
    const recommendPeople = await this.lang.getOne('member.table.maReferrerId'); // MA推荐人ID

    const exportList = list.map((e) => ({
      [uid]: ExcelFormat.str(e.uid),
      [accountManager]: e.accountManager || '-',
      [recommendPeople]: e.superiorUId,
      [createTime]: timeFormat(e.createTime),
      [lastLoginTime]: timeFormat(e.lastLoginTime),
      [totalDeposit]: e.totalDeposit,
      [depositCount]: e.depositCount,
      [totalWithdrawal]: e.totalWithdrawal,
      [withdrawCount]: e.withdrawCount,
      NGR: e.ngr,
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
      [avgBetCasino]: e.avgBetCasino,
      [avgBetSports]: e.avgBetSports,
      [avgBet]: e.avgBet,
    }));

    JSONToExcelDownload(exportList, 'players-promote' + Date.now());
  }

  /**
   * 排序函数
   * @param sortColumn
   */
  onSort(sortColumn: string) {
    if (sortColumn !== this.sortRow.sortField) {
      this.onResetSort();
    }
    this.sortRow = {
      sortField: sortColumn,
      isAsc: this.sortRow.isAsc === null ? false : this.sortRow.isAsc ? false : true,
    };
    const multiplier = this.sortRow.isAsc === null ? 0 : this.sortRow.isAsc ? -1 : 1;
    this.list = this.list.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return -1 * multiplier;
      if (a[sortColumn] > b[sortColumn]) return 1 * multiplier;
      return 0;
    });
  }

  /** 重置排序 数据 */
  onResetSort() {
    this.sortRow = {
      sortField: null,
      isAsc: null,
    };
  }
}
