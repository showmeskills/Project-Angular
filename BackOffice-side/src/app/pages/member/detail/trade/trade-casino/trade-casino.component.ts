import { Component, OnInit } from '@angular/core';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { AppService } from 'src/app/app.service';
import moment from 'moment';
import { WagerApi } from 'src/app/shared/api/wager.api';
import { ExcelFormat, JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SelectApi } from 'src/app/shared/api/select.api';
import { SupplierApi } from 'src/app/shared/api/supplier';
import { MemberService } from 'src/app/pages/member/member.service';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { ReportDetailService } from 'src/app/pages/finance/report/report.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { cloneDeep } from 'lodash';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { BetStatusLabel } from '../../../../finance/report/report.service';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import {
  SelectChildrenDirective,
  SelectDirective,
  SelectGroupDirective,
} from 'src/app/shared/directive/select.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TradeGraphComponent } from '../trade-graph/trade-graph.component';
import { ReportAmountComponent } from '../../../../finance/report/report/report-amount/report-amount.component';
import { ReportCasinoListDetailComponent } from 'src/app/pages/finance/report/report/report-casino/list/detail/detail.component';

@Component({
  templateUrl: './trade-casino.component.html',
  styleUrls: ['../trade.component.scss'],
  providers: [ReportDetailService],
  standalone: true,
  imports: [
    ReportAmountComponent,
    TradeGraphComponent,
    AngularSvgIconModule,
    NgFor,
    WinDirective,
    WinColorDirective,
    NgIf,
    EmptyComponent,
    FormRowComponent,
    FormsModule,
    InputTrimDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    SelectChildrenDirective,
    SelectGroupDirective,
    SelectDirective,
    CurrencyIconDirective,
    BetStatusLabel,
    PaginatorComponent,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    AsyncPipe,
  ],
})
export class TradeCasinoComponent implements OnInit {
  category: any = 'SlotGame'; // 类型
  tenantId: any = ''; // 商户ID
  uid: any = ''; // 会员UID
  constructor(
    public router: Router,
    public appService: AppService,
    private api: WagerApi,
    private selectApi: SelectApi,
    private supplierApi: SupplierApi,
    private activatedRoute: ActivatedRoute,
    public memberService: MemberService,
    public currencyService: CurrencyService,
    public reportDetail: ReportDetailService,
    private lang: LangService
  ) {}

  // 厂商列表
  providerList: any[] = [];
  // 状态列表
  statusList = [
    { value: 'Unsettlement', name: '未结算', lang: 'game.unset' },
    { value: 'Settlement', name: '已结算', lang: 'game.alset' },
    { value: 'ReSettle', name: '重新结算', lang: 'game.reset' },
    { value: 'Error', name: '错误', lang: 'game.error' },
    { value: 'Cancel', name: '已取消', lang: 'game.canceled' },
    { value: 'Confirm', name: '确认中', lang: 'game.confirming' },
    { value: 'NoAccept', name: '待接收', lang: 'game.wait_receive' },
  ];

  // 累计输赢集合
  payoutModule: any = {};

  // 交易概括
  transactionSummary: any = {};

  // 各游戏厂商模块
  gameModule: any[] = [];

  // 交易列表
  pageSizes: number[] = PageSizes; // 调整每页个数的数组
  paginator: PaginatorState = new PaginatorState(); // 分页
  list: any[] = []; // 列表数据
  data: any = {};
  dataEmpty: any = {
    order: '', // 单号
    provider: '', // 游戏厂商
    tradeTime: [
      new Date(toDateStamp(moment().subtract(1, 'days').toDate())!),
      new Date(toDateStamp(new Date(), true)!),
    ], // 交易时间
    settlementTime: '', // 结算时间
    status: '', //状态
  };

  ngOnInit(): void {
    // 获取 uid&商户ID
    this.activatedRoute.queryParams.pipe().subscribe((v: any) => {
      this.tenantId = v.tenantId;
      this.uid = v.uid;
      // 获取厂商列表
      forkJoin([this.selectApi.getProviderSelect(this.tenantId, this.category)]).subscribe(([provider]) => {
        this.providerList = provider;
      });
      this.initData();
    });
  }

  initData() {
    this.reset();
    this.getMembergamesTatt();
  }

  reset(): void {
    this.data = cloneDeep(this.dataEmpty);
    this.loadData(true);
  }

  // 会员详情 总入口 (累计输赢展示,输赢趋势图,交易概括模块,各游戏厂商模块)
  getMembergamesTatt() {
    this.loading(true);
    const parmas = {
      Uid: this.uid,
      GameCategory: this.category,
    };
    this.supplierApi.getMembergamesTatt(parmas).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.payoutModule = res.payoutModule || {};
        this.transactionSummary = res.transactionSummary || {};
        this.gameModule = res.gameModule || [];
      }
    });
  }

  loadData(resetPage = false): void {
    resetPage && (this.paginator.page = 1);
    this.loading(true);
    this.api
      .getSlotGameList({
        WagerStatus: this.data.status,
        TenantId: this.tenantId,
        UID: this.uid,
        ...(this.data.provider ? { GameProvider: this.data.provider } : {}),
        ...(this.data.order ? { WagerNumber: this.data.order } : {}),
        CreateTimeStart: toDateStamp(this.data.tradeTime[0], false) || 0,
        CreateTimeEnd: toDateStamp(this.data.tradeTime[1], true) || 0,
        SettleTimeStart: toDateStamp(this.data.settlementTime[0], false) || 0,
        SettleTimeEnd: toDateStamp(this.data.settlementTime[1], true) || 0,
        Page: this.paginator.page,
        PageSize: this.paginator.pageSize,
      })
      .subscribe((res) => {
        this.loading(false);
        this.list = res?.list || [];
        this.paginator.total = res?.total || 0;
      });
  }

  async onExport() {
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
    const nonsticky = await this.lang.getOne('member.detail.nonsticky.nonsticky');
    const yes = await this.lang.getOne('common.yes');
    const no = await this.lang.getOne('common.no');
    const third_id = await this.lang.getOne('game.detail.third_id');

    const curCheckedArr = await Promise.all(
      this.list
        .filter((e) => e.checked)
        .map(async (e) => ({
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
          [result]: '-',
          [statu]: await this.reportDetail.getStateText(e.status),
          [nonsticky]: e.isNonStickyBet ? yes : no,
        }))
    );

    if (!curCheckedArr.length) {
      return this.appService.showToastSubject.next({
        msgLang: 'common.checkEmptyExportTip',
        successed: false,
      });
    }

    this.list.forEach((e) => (e.checked = false));
    JSONToExcelDownload(curCheckedArr, 'report-casino-list ' + Date.now());
  }

  // loading处理
  loading(v: boolean): void {
    this.appService.isContentLoadingSubject.next(v);
  }

  async onView(item: any) {
    const res = await this.reportDetail.openDetail(
      this.api.getSlotGameDetail(item.orderNumber),
      ReportCasinoListDetailComponent
    );

    // 组件内部会自行流完成，不用取消考虑订阅
    res.reload.subscribe(() => {
      this.loadData();
    });
  }
}
