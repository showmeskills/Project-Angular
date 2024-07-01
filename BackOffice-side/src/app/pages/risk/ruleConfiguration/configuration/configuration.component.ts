import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormsModule } from '@angular/forms';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgFor, NgIf } from '@angular/common';
import {
  InputNumberDirective,
  InputFloatDirective,
  InputPercentageDirective,
} from 'src/app/shared/directive/input.directive';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';

@Component({
  selector: 'rule-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    FormRowComponent,
    FormWrapComponent,
    FormsModule,
    NgIf,
    LangPipe,
    InputNumberDirective,
    InputFloatDirective,
    InputPercentageDirective,
  ],
})
export class ConfigurationComponent implements OnInit {
  constructor(
    public lang: LangService,
    private api: RiskApi,
    private appService: AppService,
    private localStorageService: LocalStorageService
  ) {}

  isLoading = false; // 是否处于加载

  isAdd = true; // 默认 +
  creditList: any = [
    { field: 'realScoreLimit', isAdd: true, lang: 'risk.config.creditScore' },
    { field: 'realScoreLimit2', isAdd: true, lang: 'risk.config.creditScore' },
    { field: 'realScoreLimit3', isAdd: true, lang: 'risk.config.realIntegral', field2: 'realScoreChanged' },
    { field: 'realScoreLimit4', isAdd: true, lang: 'risk.config.userPoints' },
  ];

  data = {
    //信用积分1
    credits: 0,
    //信用积分2
    creditLimit: 0,
    // 描述改成 积分首次低于x(-300)分
    realScoreLimit: 0,
    // 积分首次低于x(-1500)分
    realScoreLimit2: 0,
    // 用户积分小于(x)且变化超过N分
    realScoreLimit3: 0,
    // 用户积分小于(N)且变化超过X分
    realScoreChanged: 0,
    // 用户积分小于x分且提款
    realScoreLimit4: 0,
    //指纹登陆次数
    fingerprintLimit: 0,
    // 用户累计操作兑现、取消行为:
    operationsTimesHours: 0, // x 小时内
    redemptionCancellationRate: 0, // 单据比例大于 x %
    //盈利金额
    profitAmount: 0,
    // 24小时内：
    dangerousBallCancelledInHours: 0, // 危险球被取消累计交易金额大于 x 小时内
    dangerousBallCancelledRate: 0, // 总交易金额 x % 的用户

    // 每日定时检查用户的注单分布状况:
    dailyBetSlipMinWager: 0, // 小额注单输赢正常 < x USD
    dailyBetSlipMaxWagerProfit: 0, // 大额注单 > x USD

    // 单一赛事内:
    singleMatchContinuousWinBetSlips: 0, // 连续 x 张注单内
    singleMatchContinuousWinRate: 0, // 赢利注单超过 x %
    singleMatchTransWithinMinutes: 0, // x 分钟内注单累计交易金额
    singleMatchAccumulatedTransAmtRate: 0, // 正常赛事交易金额 x %

    // 单一场馆:
    venuesWinTims: 0, // 最近 x 注
    venuesWinRate: 0, // 盈利率 x %
    venuesNGR: 0, // NGR USDT

    // 单一供应商：
    venuesWinGreaterThanRiskQuotaInDays: 0, // x 日内用户在单一供应商盈利超过实时风控额度
    // venuesWinGreaterThanRiskQuotaInDays: 0, // N日内用户在单一供应商盈利超过实时风控额度 x 倍

    // 单一平台：
    singlePlatformWinDays: 0, // x 日在单一平台累计盈利超过实时风控额度N倍
    singlePlatformWinRate: 0, // N日在单一平台累计盈利超过实时风控额度 x 倍

    // 可定时判断及提款时判断：
    winMoreThanDepositRate: 0, // 盈利金额超过累计存款金额 x 倍

    // 低消操作（划转/提款）:
    lowOperationsTimes: 0, // 用户进行转账, 存款申请等*低消操作24小时内大于 x 次

    // 返还率：
    gameWinInRefundRates: 0, // %

    // 累计交易量：
    totalTrxMoreThan: 0, // > x USDT
    totalTrxMoreThanRefundRate: 0, // 预期返还率超过 x % 的赛事

    // 每日全平台：
    everyDayWinTop: 0, // 累计盈利前
    everyDayTrxTop: 0, // 累计交易额前

    // 30日全平台：
    everyMonthWinTop: 0, // 累计盈利前
    everyMonthTrxTop: 0, // 累计交易额前

    // 高额盈利
    memberExceedPayout: 0, // 超过 X USDT 及以上赢利的账户

    // 大额提款
    largeWithdrawalHours: 0, // _ 小时内提交的 N 笔 N USDT 及以上提款
    largeWithdrawalNum: 0, // N 小时内提交的 _ 笔 N USDT 及以上提款
    largeWithdrawalAmount: 0, // N 小时内提交的 N 笔 _ USDT 及以上提款

    // 休眠账户高余额
    dormantHighDay: 0, // 在最后登录为 _ 天前且余额为 N USDT及以上的账户
    dormantHighBalance: 0, // 在最后登录为 N 天前且余额为 _ USDT及以上的账户

    // 僵尸账户
    zombieLoginDay: 0, // 过去 _ 天内没有任何活动，突然又登录

    // 红利滥用者
    bonusAbuser: '',
  };

  /**
   * 是否商户1
   * TODO: Dino表示暂且后台登录账号只要含商户1或-1权限，就给展示【红利滥用】
   *  */
  get isOneMerchant() {
    return [...this.localStorageService.userInfo.userResources.map((v) => v.id)].some((id) => [1, -1].includes(id));
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading(true);
    this.api.getRiskAuditConfig().subscribe((res) => {
      this.loading(false);
      if (res) this.data = res;
    });
  }

  addCut(type: any, item) {
    if (type === 'add') {
      item.isAdd = true;
      ++item.limit;
      return;
    }
    item.isAdd = false;
    --item.limit;
  }

  submit() {
    if (this.submitInvalid()) return;

    this.loading(true);
    this.api.updateRiskAuditConfig(this.data).subscribe((res) => {
      this.appService.showToastSubject.next({
        msgLang: res === true ? 'risk.config.suc' : 'risk.config.fail',
        successed: res,
      });

      if (res === true) this.loadData();
    });
  }

  /** 字段校验 */
  submitInvalid() {
    // 大额提款: {largeWithdrawalHours} 小时内提交的 {largeWithdrawalNum} 笔 {largeWithdrawalAmount} USDT 及以上提款
    if (!+this.data.largeWithdrawalHours || !+this.data.largeWithdrawalNum || !+this.data.largeWithdrawalAmount)
      return true;

    // 休眠账户高余额: 在最后登录为 {dormantHighDay} 天前且余额为 {dormantHighBalance} USDT及以上的账户
    if (!+this.data.dormantHighDay || !+this.data.dormantHighBalance) return true;

    // 僵尸账户: 过去 {zombieLoginDay}  天内没有任何活动，突然又登录
    if (!+this.data.zombieLoginDay) return true;

    return false;
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }
}
