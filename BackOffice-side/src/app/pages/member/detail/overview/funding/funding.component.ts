import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageSizes, PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { JSONToExcelDownload, toDateStamp } from 'src/app/shared/models/tools.model';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { Subject, zip } from 'rxjs';
import moment from 'moment';
import { SelectApi } from 'src/app/shared/api/select.api';
import { BreadcrumbsService } from 'src/app/_metronic/partials/layout/subheader/subheader1/breadcrumbs.service';
import { takeUntil } from 'rxjs/operators';
import { Currency } from 'src/app/shared/interfaces/currency';
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { BalanceDetailComponent } from '../../balance-detail/balance-detail.component';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import {
  SelectChildrenDirective,
  SelectDirective,
  SelectGroupDirective,
} from 'src/app/shared/directive/select.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { WinColorDirective, WinDirective } from 'src/app/shared/directive/common.directive';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { CurrencyService } from 'src/app/shared/service/currency.service';

// import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'funding',
  templateUrl: './funding.component.html',
  styleUrls: ['./funding.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormRowComponent,
    OwlDateTimeInputDirective,
    FormsModule,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    WinColorDirective,
    CurrencyIconDirective,
    AngularSvgIconModule,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    SelectDirective,
    NgTemplateOutlet,
    WinDirective,
    PaginatorComponent,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class FundingComponent implements OnInit, OnDestroy {
  /** 是否显示全部内容 */
  @Input() all = true;
  constructor(
    public router: Router,
    private appService: AppService,
    private route: ActivatedRoute,
    private api: MemberApi,
    private selectApi: SelectApi,
    private breadcrumbsService: BreadcrumbsService,
    public lang: LangService,
    private modal: MatModal,
    private currencyService: CurrencyService
  ) {}

  private _destroyed$ = new Subject<void>();

  pageSizes: number[] = [...PageSizes, 2e3, 3e3, 5e3]; // 页大小
  paginator: PaginatorState = new PaginatorState(); // 分页
  isLoading = false; // 是否处于加载

  uid!: string;
  id!: string; // 暂存 做回跳到会员详情用
  tenantId!: string; // 暂存 做回跳到会员详情用

  typeList: any[] = [];

  currencyList: Currency[] = []; // 币种列表

  categoryList: any[] = []; // 账户列表

  bonusList: any[] = []; // 账户：抵扣金 -> 抵用金列表

  gameBalance: any = {}; // 账户：游戏钱包 -> 余额
  list: any[] = []; // 表格列表数据

  accountBalance: any; // 主账户余额详情
  nsLiveBalance; // 真人娱乐场总览
  nslotBalance; // 娱乐场总览
  dataEmpty: any = {
    range: [moment().subtract(1, 'weeks').add(1, 'days').toDate(), new Date()],
    type: '',
    category: 'Main', // 默认 主钱包
    currency: '',
    bonusId: 0, // 账户：抵扣金 -> 抵用金ID
  };

  langList: any = {};
  data: any = cloneDeep(this.dataEmpty);

  /** lifeCycle */
  async ngOnInit() {
    // this.langList = await this.getLangLsit();
    await this.getLangLsit();
    if (this.all) {
      this.breadcrumbsService.setBefore([
        { name: '会员列表', link: '/member/list', lang: 'nav.memberList' },
        {
          name: '会员详情',
          lang: 'nav.memberDetail',
          click: () =>
            this.router.navigate(['/member/list/detail/overview'], {
              queryParams: { id: this.id, uid: this.uid, tenantId: this.tenantId },
            }),
        },
      ]);
    }

    // 账户
    zip(this.api.getAssetourSestatusList(), this.api.getOrderCategorySelect()).subscribe(([categoryList, typeList]) => {
      this.categoryList = categoryList || [];
      this.typeList = typeList || [];
    });

    // PS: 会员详情-资金历程展示要求展示10条，为this.all获取成功，路由订阅放置ngOnInt；
    if (!this.all) this.paginator.pageSize = 10;
    this.route.queryParams.pipe(takeUntil(this._destroyed$)).subscribe((v: any) => {
      this.uid = v.uid;
      this.id = v.id;
      this.tenantId = v.tenantId;
      // 账户：抵扣金 -> 抵用金列表
      if (this.uid) {
        const params = {
          Uid: this.uid,
          PageIndex: 1,
          PageSize: 999,
        };
        this.api.getCouponSelect(params).subscribe((res) => {
          this.bonusList = res?.list || [];
        });
      }
      // 账户 -> 币种
      if (this.id) this.getCurrency();
      if (this.uid != undefined) this.onReset();
    });
  }

  /** methods */
  // 账户选择
  selectionCategory() {
    this.data.currency = '';
    this.data.type = '';
    this.getCurrency();
    this.loadData(true);
    if (this.data.category === 'Main') this.getAssetCourseWallet();
  }

  // 币种选择
  selectionCurrency() {
    this.loadData(true);
    if (this.data.category === 'Main') this.getAssetCourseWallet();
  }

  // 获取币种
  getCurrency() {
    const params = {
      mid: this.id,
      category: this.data.category || 'Main',
    };
    this.loading(true);
    this.api.getGameWalletList(params).subscribe((res) => {
      this.loading(false);
      this.currencyList = res || [];
    });
  }

  // 获取主账户余额详情
  getAssetCourseWallet() {
    const parmas = {
      uid: this.uid,
      currency: this.data.currency,
    };
    this.loading(true);
    this.api.getAssetCourseWallet(parmas).subscribe((res) => {
      this.loading(false);
      if (res) {
        this.accountBalance = res[0];
        this.nsLiveBalance = res[1];
        this.nslotBalance = res[2];
      }
    });
  }

  // 查看主账户 冻结金额/子钱包余额 详情
  async openBalanceDetailModal(key: any, titleLang: any) {
    const msg = await this.lang.getOne('member.detail.balanceType.' + titleLang);
    const details = await this.lang.getOne('common.details');
    const title = msg + details;

    const balance = this.accountBalance?.subWallet;
    const currencyArr = balance ? Object.keys(balance) : [];

    if ((key === 'freezeAmount' && !this.accountBalance?.freezeAmount) || (key === 'gameWallet' && !currencyArr.length))
      return this.appService.showToastSubject.next({ msgLang: `common.emptyText` });

    const modal = this.modal.open(BalanceDetailComponent, { width: key === 'freezeAmount' ? '600px' : '500px' });
    modal.componentInstance['uid'] = this.route.snapshot.queryParams['uid'];
    modal.componentInstance['type'] = key;
    modal.componentInstance['title'] = title;
    modal.componentInstance['currency'] = this.data.currency;

    if (key === 'gameWallet') {
      modal.componentInstance['list'] = currencyArr.map((key) => ({
        walletName: key,
        code: Object.keys(balance[key]),
        value: balance[key],
      }));
    }

    modal.result.then(() => {}).catch(() => {});
  }

  loadData(resetPage = false): void {
    if (this.isLoading) return;

    resetPage && (this.paginator.page = 1);
    this.loading(true);
    const params = {
      Uid: this.uid,
      Category: this.data.category,
      OrderType: this.data.type,
      Currency: this.data.currency,
      PageIndex: this.paginator.page,
      PageSize: this.paginator.pageSize,
      ...(this.data.range[0]
        ? {
            StartTime: toDateStamp(this.data.range[0], false),
          }
        : {}),
      ...(this.data.range[0]
        ? {
            EndTime: toDateStamp(this.data.range[1], true),
          }
        : {}),
      ...(this.data.category === 'Bonus'
        ? {
            BonusId: this.data.bonusId,
          }
        : {}),
    };
    this.api.getAsssetCourseList(params).subscribe((data) => {
      this.loading(false);
      this.gameBalance = data || {};
      this.list = data?.list || [];
      this.paginator.total = data?.total || 0;
    });
  }

  onReset(): void {
    this.data = { ...this.dataEmpty };
    this.loadData(true);
    if (this.data.category === 'Main') this.getAssetCourseWallet();
  }

  getAccountCotent(item: any) {
    const {
      category,
      orderType,
      orderTypeDesc,
      fromCategoryDesc,
      toCategoryDesc,
      returnTypeDesc,
      bonusName,
      gameCategoryDesc,
      amount,
    } = item;

    if (category === 'Main') {
      switch (orderType) {
        // 存款
        case 'Deposit':
          return orderTypeDesc;
        // 提款
        case 'Withdraw':
          return amount > 0 ? `${orderTypeDesc} ${this.langList.fail}` : orderTypeDesc;
        // 划转
        case 'TransferMain':
          return `${orderTypeDesc}: ${fromCategoryDesc} -> ${toCategoryDesc}`;
        // 调账
        case 'Adjust':
          return orderTypeDesc;
        // 佣金
        case 'Commission':
          return `${orderTypeDesc}: ${returnTypeDesc}`;
        // 游戏 + 交易
        case 'GamingMain':
          return gameCategoryDesc ? `${gameCategoryDesc}${this.langList.transaction}` : '-';
        // 游戏 + 派彩
        case 'ReturnMain':
          return gameCategoryDesc ? `${gameCategoryDesc}${this.langList.payout}` : '-';
        // 发放 领取
        case 'Grant':
        case 'Receive':
          return bonusName ? `${orderTypeDesc}: ${bonusName}` : '-';
        // 兑换券
        case 'Exchange':
          return bonusName ? `${orderTypeDesc}: ${bonusName}` : '-';
        // 负值清零
        case 'NegativeClear':
        case 'WithdrawalLimitClear': // 提款流水要求手动清零
        case 'WithdrawalLimitAutoClear': // 提款流水要求自动清零
        case 'CancalTransfer': // 手动取消划转
        case 'LedUnlock': // 解锁LED
        case 'LedReceive': // 领取LED
        case 'LedExchange': // LED兑换
          return orderTypeDesc ? orderTypeDesc : '-';
        case 'GamingCancel': // xx取消
          return gameCategoryDesc ? `${gameCategoryDesc}${orderTypeDesc}` : '-';
        default:
          return orderTypeDesc;
      }
    }
    // 抵用金账户
    else if (category === 'Bonus') {
      switch (orderType) {
        // 游戏 + 交易
        case 'Consume':
          return gameCategoryDesc ? `${gameCategoryDesc}${this.langList.transaction}` : '-';
        // 游戏 + 派彩
        case 'BonusReturn':
          return gameCategoryDesc ? `${gameCategoryDesc}${this.langList.payout}` : '-';
        case 'CreditClear': // 抵用金清零
        case 'CreditExpired': // 抵用金过期
          return orderTypeDesc;
        // 红利领取
        case 'Receive':
          return orderTypeDesc;
        // xx取消
        case 'BonusCancel':
          return gameCategoryDesc ? `${gameCategoryDesc}${orderTypeDesc}` : '-';
        // 券码兑换
        case 'Exchange':
          return orderTypeDesc;
        default:
          return orderTypeDesc;
      }
    }
    // 提款流水要求（针对调帐）
    else if (category === 'WithdrawLimit') {
      return this.langList.withdrawalLimit;
    }
    // 游戏钱包
    else {
      switch (orderType) {
        // 游戏交易
        case 'GamingSub':
          return orderTypeDesc;
        // 游戏派彩
        case 'ReturnSub':
          return orderTypeDesc;
        // 划转
        case 'TransferSub':
          return amount > 0 ? this.langList.transferIn : this.langList.transferTo;
        // 主账户 -> 游戏钱包 打包回传
        case 'GamePack':
          return category ? `${category}${orderTypeDesc}` : '-';
        default:
          return orderTypeDesc;
      }
    }
  }

  async getLangLsit() {
    // 交易
    const transaction = await this.lang.getOne('game.overview.transaction');
    // 派彩
    const payout = await this.lang.getOne('game.overview.payout');
    // 失败
    const fail = await this.lang.getOne('common.fail');
    // 调账：提款流水要求
    const withdrawalLimit = await this.lang.getOne('game.overview.withdrawalLimit');
    // 主账户转入
    const transferIn = await this.lang.getOne('game.overview.transferIn');
    // 转入主账户
    const transferTo = await this.lang.getOne('game.overview.transferTo');
    this.langList = { transaction, payout, fail, withdrawalLimit, transferIn, transferTo };
  }

  async onExport() {
    // 交易时间
    const transactionHour = await this.lang.getOne('game.overview.transactionHour');
    // 订单号
    const orders = await this.lang.getOne('game.provider.orders');
    // 帐变详情
    const accountChangeDetails = await this.lang.getOne('game.overview.accountChangeDetails');
    // 交易金额
    const transactionAmount = await this.lang.getOne('game.overview.transactionAmount');
    // 账户余额
    const accountBalance = await this.lang.getOne('game.overview.accountBalance');
    // 理论余额
    const theoBalance = await this.lang.getOne('payment.companyAccountManagement.theoBalance');
    // 提款流水要求
    const withdrawalLimit = await this.lang.getOne('payment.channelConfig.withdrawalLimit');
    // 抵用金名称
    const creditName = await this.lang.getOne('game.overview.creditName');
    // 交易内容
    const content = await this.lang.getOne('game.trans_content');
    // 抵用金余额
    const creditBalance = await this.lang.getOne('game.overview.creditBalance');
    // 交易类型
    const transactionType = await this.lang.getOne('game.overview.transactionType');
    // 钱包余额
    const wBalance = await this.lang.getOne('game.overview.wBalance');
    // 币种
    const currency = await this.lang.getOne('game.overview.currency');
    // 有效交易
    const validTransaction = await this.lang.getOne('game.overview.validTransaction');
    // 手续费
    const handlingFee = await this.lang.getOne('payment.method.handlingFee');

    const process = (e) => ({
      [transactionHour]: moment(e.transactionTime).format('YYYY-MM-DD HH:mm:ss'),
      [orders]: e.orderNum,
      [currency]: e.currency,
      ...(this.data.category === 'Main'
        ? {
            [accountChangeDetails]: this.getAccountCotent(e),
            [transactionAmount]: e.amount,
            [transactionAmount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.amount),
            [accountBalance]: e.afterBalance,
            [accountBalance + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.afterBalance),
            [theoBalance]: e.actualBalance,
            [theoBalance + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.actualBalance),
            [withdrawalLimit]: e.withdrawLimit,
            [withdrawalLimit + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.withdrawLimit),
          }
        : this.data.category === 'Bonus'
          ? {
              [creditName]: e.bonusName,
              [content]: this.getAccountCotent(e),
              [transactionAmount]: e.amount,
              [transactionAmount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.amount),
              [creditBalance]: e.afterBalance,
              [creditBalance + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.afterBalance),
            }
          : {
              [transactionType]: this.getAccountCotent(e),
              [transactionAmount]: e.amount,
              [transactionAmount + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.amount),
              [wBalance]: e.afterBalance,
              [wBalance + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.afterBalance),
            }),
      [validTransaction]: e.activeFlow,
      [validTransaction + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.activeFlow),
      [handlingFee]: e.handlingFeeChange,
      [handlingFee + '（USDT）']: this.currencyService.getUsdtRateAmount(e?.currency, e?.handlingFeeChange),
    });

    let curCheckedArr = this.list.filter((e) => e.checked).map(process);

    if (!curCheckedArr.length) {
      curCheckedArr = this.list.map(process);
    } else {
      this.list.forEach((e) => (e.checked = false));
    }

    JSONToExcelDownload(curCheckedArr, 'funding-list' + Date.now());
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
