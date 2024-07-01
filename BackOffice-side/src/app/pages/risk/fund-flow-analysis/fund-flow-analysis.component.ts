import { MemberApi } from 'src/app/shared/api/member.api';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AppService } from 'src/app/app.service';
import { OwlDateTimeModule } from 'src/app/components/datetime-picker';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { CurrencyIconDirective, IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import {
  DestroyService,
  ExcelFormat,
  JSONToExcelDownload,
  timeFormat,
  toDateStamp,
} from 'src/app/shared/models/tools.model';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { finalize, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { lastValueFrom } from 'rxjs';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { FundFlowAnalysisItem } from 'src/app/shared/interfaces/member.interface';

@Component({
  selector: 'fund-flow-analysis',
  templateUrl: './fund-flow-analysis.component.html',
  styleUrls: ['./fund-flow-analysis.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    OwlDateTimeModule,
    EmptyComponent,
    AngularSvgIconModule,
    LoadingDirective,
    LabelComponent,
    IconSrcDirective,
    CurrencyIconDirective,
    CurrencyValuePipe,
    SearchDirective,
    SearchInpDirective,
  ],
})
export class FundFlowAnalysisComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private destroy$: DestroyService,
    public appService: AppService,
    public currencyService: CurrencyService,
    public lang: LangService,
    private api: MemberApi
  ) {}

  /** 页大小 */
  pageSizes: number[] = PageSizes;

  /** 分页 */
  paginator: PaginatorState = new PaginatorState();

  categoryList: { code: string; description: string }[] = [];

  dataEmpty = {
    uid: '', // UID
    currencyCode: '', // 币种
    time: [] as Date[], // 时间
    category: '', // 类型
  };

  data = cloneDeep(this.dataEmpty);

  /** 列表数据 */
  list: FundFlowAnalysisItem[] = [];

  ngOnInit() {
    // 获取币种
    this.currencyService.updateCurrency();
    // 获取资金流向类型
    this.api.getassetflowtypelist().subscribe((res) => {
      this.categoryList = Array.isArray(res) ? res : [];
    });

    this.subHeaderService.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadData(true);
    });
  }

  loadData(resetPage = false) {
    if (!this.data.uid) return this.appService.showToastSubject.next({ msgLang: 'finance.withdrawals.enterUid' });

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
      tenantId: this.subHeaderService.merchantCurrentId,
      uid: this.data.uid,
      currency: this.data.currencyCode,
      createTimeStart: toDateStamp(this.data.time[0], false),
      createTimeEnd: toDateStamp(this.data.time[1], true),
      orderCategory: this.data.category,
      page: this.paginator.page,
      pageSize: this.paginator.pageSize,
      ...sendData,
    };

    return this.api.getassetflowlist(parmas);
  }

  /** 筛选 - 重置 */
  onReset() {
    this.data = cloneDeep(this.dataEmpty);
  }

  /**
   * 导出
   */
  async onExport(isAll: boolean) {
    let list: FundFlowAnalysisItem[] = [];

    if (isAll) {
      if (!this.data.uid)
        return this.appService.showToastSubject.next({ msgLang: 'risk.fundFlowAnalysis.exportAllTips' });

      try {
        this.appService.isContentLoadingSubject.next(true);
        const res = await lastValueFrom(this.loadData$(true, { pageSize: 9e5 }));
        this.appService.isContentLoadingSubject.next(false);
        list = Array.isArray(res?.list) ? res.list : []; // success === false会自动抛出
        this.list = list;
      } finally {
        this.appService.isContentLoadingSubject.next(false);
      }
    } else {
      list = this.list;
    }

    if (!list.length) return this.appService.showToastSubject.next({ msgLang: 'common.emptyText' });

    const uid = 'UID'; // UID
    const time = await this.lang.getOne('common.time'); // 时间
    const txnNumber = await this.lang.getOne('risk.fundFlowAnalysis.txnNumber'); // 订单号
    const type = await this.lang.getOne('common.type'); // 类型
    const walletForm = await this.lang.getOne('risk.fundFlowAnalysis.walletForm'); // 从钱包到
    const walletTo = await this.lang.getOne('risk.fundFlowAnalysis.walletTo'); // 到钱包
    const balanceBefore = await this.lang.getOne('risk.fundFlowAnalysis.balanceBefore'); // 变化前余额
    const balanceAfter = await this.lang.getOne('risk.fundFlowAnalysis.balanceAfter'); // 变化后余额
    const amount = await this.lang.getOne('common.amount'); // 金额
    const currency = await this.lang.getOne('common.currency'); // 币种

    const exportList = list.map((e: FundFlowAnalysisItem) => ({
      [uid]: ExcelFormat.str(e.uid),
      [time]: timeFormat(e.cteatedTime),
      [txnNumber]: e.orderNum,
      [type]: e.orderType,
      [walletForm]: e.fromWallet,
      [balanceBefore + '(From)']: e.fromBeforeBalance,
      [balanceBefore + '(From)（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.fromBeforeBalance),
      [balanceAfter + '(From)']: e.fromAfterBalance,
      [balanceAfter + '(From)（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.fromAfterBalance),
      [walletTo]: e.toWallet,
      [balanceAfter + '(To)']: e.toBeforeBalance,
      [balanceAfter + '(To)（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.toBeforeBalance),
      [balanceBefore + '(To)']: e.toAfterBalance,
      [balanceBefore + '(To)（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.toAfterBalance),
      [amount]: e.amount,
      [amount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.amount),
      [currency]: e.currency,
    }));

    JSONToExcelDownload(exportList, 'fund-flow-analysis ' + Date.now());
  }
}
