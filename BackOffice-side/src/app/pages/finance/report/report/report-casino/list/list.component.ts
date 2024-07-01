import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import moment from 'moment';
import { takeUntil, finalize } from 'rxjs';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { AppService } from 'src/app/app.service';
import { WagerApi } from 'src/app/shared/api/wager.api';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { WinDirective, WinColorDirective } from 'src/app/shared/directive/common.directive';
import { GameCategory } from 'src/app/shared/interfaces/game';
import { DestroyService, ExcelFormat, JSONToExcelDownload } from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { BetStatusLabel, ReportDetailService } from 'src/app/pages/finance/report/report.service';
import { ReportCasinoListDetailComponent } from './detail/detail.component';

@Component({
  selector: 'report-casino-list',
  templateUrl: './list.component.html',
  styleUrls: ['../../report.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    EmptyComponent,
    AngularSvgIconModule,
    CurrencyIconDirective,
    WinDirective,
    WinColorDirective,
    BetStatusLabel,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class ReportCasinoListComponent implements OnInit {
  constructor(
    public router: Router,
    public appService: AppService,
    private lang: LangService,
    public reportDetail: ReportDetailService,
    private destroy$: DestroyService,
    private wagerApi: WagerApi,
    public currencyService: CurrencyService
  ) {}

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  /** 类型 */
  category: GameCategory = 'SlotGame';

  /** 列表数据 */
  list: any[] = [];

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    this.reportDetail
      .loadData$(this.category)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resetPage) => {
        this.appService.isContentLoadingSubject.next(false);

        if (resetPage) this.list = [];

        if (!this.reportDetail.data.tradeTime[1]) return;

        if (!this.reportDetail.timeChecking())
          return this.appService.showToastSubject.next({ msgLang: 'form.chooseDayTime', msgArgs: { n: 90 } });

        this.loadData(resetPage);
      });
  }

  loadData(resetPage = false) {
    this.appService.isContentLoadingSubject.next(true);
    this.loadData$(resetPage)
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe((res) => {
        this.list = Array.isArray(res?.list) ? res.list : [];
        this.paginator.total = res?.total || 0;
      });
  }

  loadData$(resetPage = false, sendData?: Partial<any>) {
    resetPage && (this.paginator.page = 1);

    const parmas = {
      ...this.reportDetail.getParams(),
      Page: this.paginator.page,
      PageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.wagerApi.getSlotGameList(parmas);
  }

  /** 查看详情 */
  async onView(item: any) {
    const res = await this.reportDetail.openDetail(
      this.wagerApi.getSlotGameDetail(item.orderNumber),
      ReportCasinoListDetailComponent
    );
    // 组件内部会自行流完成，不用取消考虑订阅
    res.reload.subscribe(() => {
      this.loadData();
    });
  }

  /** 导出数据操作 */
  async onExport(isAll) {
    const exportList = await this.reportDetail.generateExportExcel(
      isAll,
      this.list,
      this.loadData$(true, { IsExport: true })
    );
    return this.exportExcel(exportList);
  }

  /**
   * 导出excel
   * @param list
   */
  async exportExcel(list: any[]) {
    if (!list?.length) return;

    const support = await this.lang.getOne('game.provider.provider');
    const time = await this.lang.getOne('game.provider.trans_time');
    const orders = await this.lang.getOne('game.provider.orders');
    const info1 = await this.lang.getOne('game.info1');
    // let info2 = await this.lang.getOne('game.info2');
    const game_id = await this.lang.getOne('game.game_id');
    const trans_content = await this.lang.getOne('game.trans_content');
    const odds = await this.lang.getOne('game.odds');
    const win = await this.lang.getOne('game.win');
    const result = await this.lang.getOne('game.result');
    const trans_amount = await this.lang.getOne('game.trans_amount');
    const statu = await this.lang.getOne('game.provider.statu');
    const currency = await this.lang.getOne('common.currency');
    const third_id = await this.lang.getOne('game.detail.third_id');

    const excelList = await Promise.all(
      list.map(async (e) => ({
        [support]: e.gameProvider,
        [time]: moment(e.betTime).format('YYYY-MM-DD HH:mm:ss'),
        [orders]: e.orderNumber,
        [third_id]: e.wagerNumber,
        UID: ExcelFormat.str(e.uid),
        [info1]: e.gameCategory,
        // [info2]: e.tournamentName || '',
        [game_id]: e.gameName,
        [trans_content]: '-',
        [currency]: e.currency,
        [trans_amount]: e.betAmount,
        [trans_amount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.betAmount),
        [odds]: e.odds,
        [win]: e.payoutAmount,
        [win + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.payoutAmount),
        [result]: e.gameResult || '-',

        [statu]: await this.reportDetail.getStateText(e.status),
      }))
    );
    JSONToExcelDownload(excelList, 'report-casino-list ' + Date.now());
  }
}
