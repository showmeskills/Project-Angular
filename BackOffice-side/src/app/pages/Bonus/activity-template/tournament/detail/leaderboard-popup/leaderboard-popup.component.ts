import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { finalize } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { ExcelFormat, JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { CurrencyService } from 'src/app/shared/service/currency.service';

@Component({
  selector: 'app-tournament-leaderboard-popup',
  templateUrl: './leaderboard-popup.component.html',
  styleUrls: ['./leaderboard-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatModalModule,
    FormsModule,
    MatOptionModule,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    EmptyComponent,
    LoadingDirective,
    AngularSvgIconModule,
    IconSrcDirective,
    CurrencyValuePipe,
    CurrencyIconDirective,
    PaginatorComponent,
  ],
})
export class TournamentLeaderboardPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<TournamentLeaderboardPopupComponent, boolean>,
    private api: ActivityAPI,
    private appService: AppService,
    public lang: LangService,
    private currencyService: CurrencyService
  ) {}

  /** 商户ID */
  @Input() tenantId;

  /** 活动ID */
  @Input() activityId: string | number;

  /** 活动code */
  @Input() tmpCode;

  /** 是否加载中 */
  isLoading = false;

  /** 页大小 */
  pageSizes: number[] = [10, ...PageSizes];

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  sortData = {
    order: '', // 排序字段
    isAsc: true, // 是否为升序排序
  };

  /** 列表数据 */
  list = [];

  ngOnInit() {
    this.paginator.pageSize = 10;
    this.loadData(true);
  }

  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = res?.data?.pageTable?.records || [];
        this.paginator.total = res?.data?.pageTable?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      tenantId: this.tenantId,
      tmpCodes: [this.tmpCode],
      pageIndex: this.paginator.page,
      pageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getnewrankranking(parmas);
  }

  /**
   * 导出
   */
  async onExport() {
    let list = [];

    try {
      this.appService.isContentLoadingSubject.next(true);
      const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
      this.appService.isContentLoadingSubject.next(false);
      list = res?.data?.pageTable?.records || []; // success === false会自动抛出
    } finally {
      this.appService.isContentLoadingSubject.next(false);
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const rank = await this.lang.getOne('member.activity.sencli12.rank'); // 名次
    const country = await this.lang.getOne('common.country'); // 国家
    const uid = 'UID'; // UID
    const score = await this.lang.getOne('member.activity.sencli12.score'); // 得分
    const prize = await this.lang.getOne('member.activity.sencli12.prize'); // 奖金（USDT）
    const prizePlayerCurrency = await this.lang.getOne('member.activity.sencli12.prizePlayerCurrency'); // 奖金（默认货币）
    const currency = await this.lang.getOne('common.currency'); // 币种
    const betAmount = await this.lang.getOne('member.activity.sencli12.betAmount'); // 下注金额
    const membersWinOrLose = await this.lang.getOne('member.activity.sencli12.membersWinOrLose'); // 会员输赢
    const effectiveFlow = await this.lang.getOne('member.activity.sencli12.effectiveFlow'); // 有效流水
    const ggr = 'GGR'; // 商户输赢

    const exportList = list.map((e: any) => ({
      [rank]: e.rankNumber,
      [country]: e.position,
      [uid]: ExcelFormat.str(e.uid),
      [score]: e.rankScore,
      [prize]: e.amountUSDT,
      [prizePlayerCurrency]: e.amount,
      [betAmount]: e.uidBetMoney,
      [betAmount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.uidBetMoney),
      [membersWinOrLose]: e.uidWinOrLost,
      [membersWinOrLose + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.uidWinOrLost),
      [effectiveFlow]: e.uidActiveFlow,
      [effectiveFlow + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.uidActiveFlow),
      [ggr + '（USDT）']: e.tenantWinOrLost,
      [currency]: e.currency,
    }));

    JSONToExcelDownload(exportList, 'leaderboard ' + Date.now());
  }

  /** 列表操作 - 表头字段排序 */
  onLabelThSort(sortKey) {
    if (!this.list.length) return;

    if (this.sortData.isAsc === false && this.sortData.order === sortKey) {
      this.sortData.order = '';
      this.sortData.isAsc = true;
      this.loadData(true);
      return;
    }

    if (!this.sortData.order || this.sortData.order !== sortKey) {
      this.sortData.order = sortKey;
      this.sortData.isAsc = false;
    }

    this.sortData.isAsc = !this.sortData.isAsc;
    this.loadData(true);
  }
}
