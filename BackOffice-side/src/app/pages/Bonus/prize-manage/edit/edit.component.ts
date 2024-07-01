import { GameApi } from 'src/app/shared/api/game.api';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { FormValidator } from 'src/app/shared/form-validator';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import {
  PrizeAmountType,
  PrizeCreditLimitEnumType,
  PrizeDistributionEnumType,
  PrizePeriodEnumType,
  PrizeStickyLimitEnumType,
  PrizeType,
} from 'src/app/shared/interfaces/activity';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { MatOptionModule } from '@angular/material/core';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { NgFor, NgIf, AsyncPipe, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import {
  InputFloatDirective,
  InputNumberDirective,
  InputPercentageDirective,
} from 'src/app/shared/directive/input.directive';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { ExcludedGamesComponent } from './excluded-games/excluded-games.component';
import { MultiLangType } from 'src/app/shared/interfaces/article';
import { ArticleApi } from 'src/app/shared/api/article.api';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { FreeSpinSearchGamesPopupComponent } from './search-games-popup/search-games-popup.component';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    NgFor,
    NgIf,
    SelectChildrenDirective,
    SelectGroupDirective,
    MatFormFieldModule,
    MatSelectModule,
    CurrencyIconDirective,
    MatOptionModule,
    FormWrapComponent,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    AngularSvgIconModule,
    UploadComponent,
    AsyncPipe,
    LangPipe,
    AttrDisabledDirective,
    InputPercentageDirective,
    NgSwitch,
    NgSwitchCase,
    NgTemplateOutlet,
    InputNumberDirective,
    PrizeConfigPipe,
    InputFloatDirective,
    SearchDirective,
    SearchInpDirective,
    HostPipe,
  ],
})
export class PrizeEditComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public appService: AppService,
    private activatedRoute: ActivatedRoute,
    public lang: LangService,
    private modalService: MatModal,
    public router: Router,
    public prizeService: PrizeService,
    private api: ActivityAPI,
    private gameApi: GameApi,
    private articleApi: ArticleApi,
    public currencyService: CurrencyService
  ) {
    const { tenantId, id, type } = this.activatedRoute.snapshot.queryParams;

    this.tenantId = tenantId;
    this.id = id;
    this.type = type;
  }

  protected readonly PrizeType = PrizeType;
  protected readonly PrizeAmountType = PrizeAmountType;
  protected readonly PrizeCreditLimitEnumType = PrizeCreditLimitEnumType;
  protected readonly PrizeDistributionEnumType = PrizeDistributionEnumType;
  protected readonly PrizePeriodEnumType = PrizePeriodEnumType;

  /** 商户ID */
  tenantId;

  /**
   * 奖品状态
   * @type offlineEdit=下架及二次审核的编辑, check=查看
   */
  type;

  /** 奖品模板id */
  id;

  /** 奖品模板数据 */
  data;

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;

  /** 奖品名称 - 多语系数据 */
  selectLang = ['zh-cn'];
  /** 条款及条件 - 多语系数据 */
  termsSelectLang = ['zh-cn'];

  /** 是否加载中 */
  isLoading = false;

  /** 奖品配置 - 当前配置 */
  configuration = PrizeType.Cash;
  /** 奖品配置 - 类型数据 */
  get configurationList() {
    const showValueList = [
      PrizeType.Cash, // 现金券
      PrizeType.Credit, // 抵用金
      PrizeType.AfterCash, // 后发现金券
      PrizeType.RealItem, // 实物
      PrizeType.Equipment, // 装备
      PrizeType.NonStickyBonus, // 非粘性奖金
      PrizeType.FreeSpin, // FreeSpin
      PrizeType.StickyBonus, // 粘性奖金
    ];

    return showValueList.map((e) => this.prizeService.typeList.find((j) => j.value === e));
  }

  /** 金额类型 - 当前类型 */
  amountType = PrizeAmountType.Fixed;
  /** 金额类型：固定金额 - 金额 */
  amount = 1;
  /** 金额类型：按比例 - 比例（%） */
  rate = 1;
  /** 金额类型：按比例 - 上限金额 */
  rateLimit = 1;
  /** 金额类型 - 类型数据 */
  amountTypeList: Tabs[] = [
    { name: '固定金额', lang: 'member.activity.prizeCommon.fixedAmount', value: PrizeAmountType.Fixed },
    { name: '按比例', lang: 'member.activity.prizeCommon.proportionally', value: PrizeAmountType.Rate },
  ];

  /** 发放方式 - 当前类型 */
  distribution = PrizeDistributionEnumType.Need;
  /** 发放方式 - 类型数据 */
  distributionTypeList: Tabs[] = [
    { name: '需要领取', lang: 'member.activity.prizeCommon.needToCollect', value: PrizeDistributionEnumType.Need },
    { name: '直接发放', lang: 'member.activity.prizeCommon.directIssue', value: PrizeDistributionEnumType.Direct },
  ];

  /** 券有效期 - 当前类型 */
  period = PrizePeriodEnumType.Period;
  /** 券有效期：相对时间 - 天数 */
  periodDay = 1;
  /** 券有效期 - 类型数据 */
  periodList: Tabs[] = [
    { name: '相对时间', lang: 'member.coupon.model.relativeTime', value: PrizePeriodEnumType.Period },
    { name: '永久有效', lang: 'member.coupon.model.Permanent', value: PrizePeriodEnumType.Permanent },
  ];

  /** 提款倍数 */
  withdrawFlowMultiple = 1;

  /** 币种 - 当前币种code */
  selectCurrencyCode = '';

  /** 是否风控 */
  isRisk = false;

  /** 排除游戏 - id集合数据 */
  excludedGameIdsData = {
    gameIds: [],
    labelIds: [],
    providerIds: [],
  };

  /** 排除游戏 - 已生效的标签游戏id集合数据 */
  excludedGameLabelUsedIdsList: string[] = [];

  /** 奖品：抵用金 - 数据 */
  creditData = {
    maximumDeduction: 10, // 最高抵扣（%））
    singleDeduction: 50, // 单笔抵扣（USDT）
    minBetLimit: 1, // 最低投注限额（USDT）
    // scope: PrizeCreditLimitEnumType.Common, // 可用范围 - 当前类型
  };

  /** 奖品：实物 - 数据 */
  realItemData = {
    picture: '',
  };

  /** 奖品：装备 - 数据 */
  equipmentData = {
    picture: '',
  };

  /** 奖品：非粘性奖金 - 数据 */
  nonStickyData = {
    limitValue: PrizeStickyLimitEnumType.SlotGame, // 可用范围选择值
    spin: 1, // 每次旋转的最大赌注
    multiple: 1, // 投注倍数
    day: 1, // 激活后持续时间
    times: 1, // 下注次数要求
  };

  /** 奖品：粘性奖金 - 数据 */
  stickyData = {
    limitValue: PrizeStickyLimitEnumType.SlotGame, // 可用范围选择值
    maxBetAmount: 1, // 每次投注的最大赌注
    betMultiple: 1, // 投注倍数
    minFreeAmount: 1, // 最低免流水金额
  };

  /** 奖品：非粘性/粘性 奖金 - 可用范围 */
  stickyLimitTypeList = [
    {
      name: '娱乐场投注',
      lang: 'member.activity.prizeCommon.casinoBetting',
      value: PrizeStickyLimitEnumType.SlotGame,
    },
    {
      name: '真人娱乐场投注',
      lang: 'member.activity.prizeCommon.liveCasinoBetting',
      value: PrizeStickyLimitEnumType.LiveCasino,
    },
    {
      name: '体育投注',
      lang: 'member.activity.prizeCommon.sportsBookBetting',
      isSticky: true,
      value: PrizeStickyLimitEnumType.SportsBook,
    },
  ];

  /** svip体验券 - 数据 (未启用) */
  // svipExpData = {
  //   day: 0,
  // }

  /** Free Spin - 数据 */
  freeSpinData: any = {
    total: 1, // 总价值
    spins: 1, // 旋转次数
    gameData: null, // 选择的游戏数据
    gameFreeSpinConfig: null, // 游戏的freespin配置
    spinValueData: {
      coins: '', // 硬币值
      lines: '', // 旋转的乘数
      denomination: '', // 面额
      minBet: '', // 最小投注金额
      betLevel: '', // 投注级别
    },
    bonusCap: '', // 奖金上限
    periodDay: 1, // 卷有效期
    isNonSticky: false, // 是否为非粘性
  };

  /** 是否为编辑 */
  get isEdit(): boolean {
    return this.type === 'offlineEdit' || this.type === 'check' || this.id;
  }

  /**
   * 是否为下架后/二次审核的编辑
   * PS：编辑会有部分限制
   */
  get isOfflineEdit(): boolean {
    return this.type === 'offlineEdit';
  }

  /** 是否为查看 */
  get isCheck(): boolean {
    return this.type === 'check';
  }

  /** 奖品名称多语系 */
  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  /** 条款及条件多语系 */
  get termsLangArrayForm(): FormArray {
    return this.formGroup.get('termsLang') as FormArray;
  }

  /** 币种列表 */
  get currencyListCom() {
    if (this.configuration === PrizeType.FreeSpin) {
      return this.freeSpinData.gameFreeSpinConfig?.currencyList || [];
    }
    return this.currencyService.list;
  }

  ngOnInit() {
    this.loadForm();

    // 获取币种
    this.currencyService.updateCurrency();

    // 回溯
    if (this.isEdit) this.edit();
  }

  /** 编辑 */
  edit() {
    this.loading(true);
    this.api.prize_getprizeinfo({ merchantId: this.tenantId, prizeId: this.id }).subscribe((res) => {
      this.loading(false);
      if (!res?.success) return;
      this.data = res?.data;

      // 奖品 - 配置
      this.configuration = this.data?.prizeType;

      // 奖品 - 名称多语言
      this.selectLang = this.data?.prizeName.map((e) => e.lang);
      this.formGroup.setControl(
        'lang',
        this.fb.array(
          this.data?.prizeName.map((e) =>
            this.fb.group({
              id: [e.id],
              name: [e.prizeFullName, Validators.required],
              simpleName: [e.prizeShortName, Validators.required],
              languageCode: [e.lang],
            })
          )
        )
      );

      /** 奖品配置：现金券，抵用金，后发现金券，非粘性奖金，粘性奖金 - 相同配置 */
      if (
        [
          PrizeType.Cash,
          PrizeType.Credit,
          PrizeType.AfterCash,
          PrizeType.NonStickyBonus,
          PrizeType.StickyBonus,
        ].includes(this.data?.prizeType)
      ) {
        // 币种
        if (this.data?.currency !== 'LED') this.selectCurrencyCode = this.data?.currency; // LED只针对后发现金券，已进行特殊处理 无需进行赋值操作
        // 是否风控
        this.isRisk = this.data?.isRisk;
        // 金额类型
        this.amountType = this.data?.amountType;
        // 金额类型：按比例
        if (this.data?.amountType === PrizeAmountType.Rate) {
          this.rate = this.data?.rate; // 比例
          this.rateLimit = this.data?.rateLimit; // 上限金额
        }
        // 金额类型：固定金额
        if (this.data?.amountType === PrizeAmountType.Fixed) this.amount = this.data?.amount;
      }

      /** 奖品配置：现金券，抵用金 - 相同配置 */
      if ([PrizeType.Cash, PrizeType.Credit].includes(this.data?.prizeType)) {
        // 发放方式
        this.distribution = this.data?.sendType;
        // 发放方式：需要领取 -> 卷有效期
        this.period = this.data?.expireType;
        // 卷有效期：相对时间 -> 发卷天数
        if (this.data?.expireType === PrizePeriodEnumType.Period) this.periodDay = this.data?.expirationDays;
      }

      /** 奖品配置：现金券 */
      if (this.data?.prizeType === PrizeType.Cash) {
        // 提款倍数
        this.withdrawFlowMultiple = this.data?.withdrawFlowMultiple;
      }

      /** 奖品配置：抵用金 */
      if (this.data?.prizeType === PrizeType.Credit) {
        // 最低投注限额（USDT）
        this.creditData.minBetLimit = this.data?.minBetLimit;
        // 最高抵扣（%）
        this.creditData.maximumDeduction = this.data?.maxSingleOrderRate;
        // 单笔抵扣（USDT）
        this.creditData.singleDeduction = this.data?.maxSingleOrder;
        // 获取 排除游戏数据
        this.getExcludeGames();
      }

      /** 奖品配置：实物 */
      if (this.data?.prizeType === PrizeType.RealItem) {
        // 图片
        this.realItemData.picture = this.data?.picture;
      }

      /** 奖品配置：装备 */
      if (this.data?.prizeType === PrizeType.Equipment) {
        // 图片
        this.equipmentData.picture = this.data?.picture;
      }

      /** 奖品配置：非粘性奖金 */
      if (this.data?.prizeType === PrizeType.NonStickyBonus) {
        // 可用范围
        this.nonStickyData.limitValue = this.data?.categories[0];
        // 每次旋转的最大赌注
        this.nonStickyData.spin = this.data?.maxSingleOrder;
        // 投注倍数
        this.nonStickyData.multiple = this.data?.betMultiple;
        // 激活后持续时间
        this.nonStickyData.day = this.data?.expirationDays;
        // 下注次数要求
        this.nonStickyData.times = this.data?.targetBetNum;
        // 获取 排除游戏数据
        this.getExcludeGames();
        // 获取 条款及条件
        this.getTermsLang();
      }

      /** 奖品配置：粘性奖金 */
      if (this.data?.prizeType === PrizeType.StickyBonus) {
        // 可用范围
        this.stickyData.limitValue = this.data?.categories[0];
        // 每次投注的最大赌注
        this.stickyData.maxBetAmount = this.data?.maxSingleOrder;
        // 投注倍数
        this.stickyData.betMultiple = this.data?.betMultiple;
        // 最低免流水金额
        this.stickyData.minFreeAmount = this.data?.minTurnoverFree;
        // 获取 排除游戏数据
        this.getExcludeGames();
        // 获取 条款及条件
        this.getTermsLang();
      }

      /** 奖品配置：FreeSpin */
      if (this.data?.prizeType === PrizeType.FreeSpin) {
        // 币种
        this.selectCurrencyCode = this.data?.currency;
        // 显示总价值
        this.freeSpinData.total = this.data?.spinTotalValue;
        // 卷有效期
        this.freeSpinData.periodDay = this.data?.expirationDays;
        // 旋转次数
        this.freeSpinData.spins = this.data?.freeSpinTimes;
        // 是否非粘性
        this.freeSpinData.isNonSticky = this.data?.isNoneSticky;
        // 上限奖金
        this.freeSpinData.bonusCap = this.data?.maxSingleOrder;

        // 游戏 - PNG厂商 或 聚合厂商
        if (this.data?.isPng) {
          // 硬币值
          this.freeSpinData.spinValueData.coins = this.data?.coins;
          // 旋转的乘数
          this.freeSpinData.spinValueData.lines = this.data?.lines;
          // 面额
          this.freeSpinData.spinValueData.denomination = this.data?.denomination;
        } else {
          // 最小投注金额
          this.freeSpinData.spinValueData.minBet = this.data?.minbet;
          // 投注级别
          this.freeSpinData.spinValueData.betLevel = this.data?.betlevel;
        }

        // 非粘性 - 是 或 不是
        if (this.data?.isNoneSticky) {
          // 可用范围
          this.nonStickyData.limitValue = this.data?.freeSpinNoneSticky?.category;
          // 每次旋转的最大赌注
          this.nonStickyData.spin = this.data?.freeSpinNoneSticky?.maxBetPerSpin;
          // 投注倍数
          this.nonStickyData.multiple = this.data?.freeSpinNoneSticky?.betMultiple;
          // 激活后持续时间
          this.nonStickyData.day = this.data?.freeSpinNoneSticky?.durationDaysAfterActivation;
          // 下注次数要求
          this.nonStickyData.times = this.data?.freeSpinNoneSticky?.targetBetNum;
          // 是否风控
          this.isRisk = this.data?.isRisk;
          // 获取 排除游戏数据
          this.getExcludeGames();
        } else {
          // 提款倍数
          this.withdrawFlowMultiple = this.data?.withdrawFlowMultiple;
        }

        // 获取 游戏详情及游戏freespin配置
        this.getFreespinGameDetail(this.data?.gameProvider[0]?.goGameIds[0]);
        // 获取 条款及条件
        this.getTermsLang();
      }

      /** 奖品配置：SVIP体验券 */
      // if (this.data?.prizeType === PrizeType.SvipEXP) {
      //   this.svipExpData.day = this.data?.expirationDays
      // };
    });
  }

  loadForm() {
    this.formGroup = this.fb.group({
      lang: this.fb.array([
        this.fb.group({
          id: [0], // 默认0为创建
          name: ['', Validators.required],
          simpleName: ['', Validators.required],
          languageCode: ['zh-cn'],
        }),
      ]),
      termsLang: this.fb.array([
        this.fb.group({
          content: [''],
          languageCode: ['zh-cn'],
        }),
      ]),
    });

    this.validator = new FormValidator(this.formGroup);
  }

  /** 奖品配置 - 选择 */
  configurationValueChange(value) {
    // 条款及条件 - 当lang-tab销毁后，会清空语系列表，根据不同情况进行初始化操作
    if ([PrizeType.NonStickyBonus, PrizeType.StickyBonus, PrizeType.FreeSpin].includes(value)) {
      this.termsSelectLang = ['zh-cn'];
      if (
        this.isEdit &&
        [PrizeType.NonStickyBonus, PrizeType.StickyBonus, PrizeType.FreeSpin].includes(this.data?.prizeType)
      ) {
        this.getTermsLang();
      }
    }

    // 排除游戏 - 清空处理
    this.onExcludedGameReset();

    // 币种 - 重置
    this.selectCurrencyCode = '';
  }

  /** 奖品名称 - 更新语言表单 */
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        name: '',
        simpleName: '',
        id: 0,
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        name: [value.name, Validators.required],
        simpleName: [value.simpleName, Validators.required],
        languageCode: [value.languageCode],
        id: [value.id],
      });
    });
    this.formGroup.setControl('lang', this.fb.array(langArray, Validators.compose([])));
  }

  /** 条款及条件 - 更新语言表单 */
  updateTermsLanguageForm() {
    const prevValue = this.termsLangArrayForm.value as any[];
    const langArray = this.termsSelectLang.map((languageCode) => {
      const value = {
        languageCode,
        content: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        content: [value.content],
        languageCode: [value.languageCode],
      });
    });
    this.formGroup.setControl('termsLang', this.fb.array(langArray, Validators.compose([])));
  }

  /** Free spin - 选择适用游戏 */
  onOpenFreeSpinGames() {
    const modalRef = this.modalService.open(FreeSpinSearchGamesPopupComponent, { width: '900px', autoFocus: false });
    modalRef.componentInstance['tenantId'] = this.tenantId;
    modalRef.result
      .then((game) => {
        this.getGameFreespinConfig(game);
      })
      .catch(() => {});
  }

  /** Free spin - 获取适用游戏的freespin配置 */
  getGameFreespinConfig(game) {
    this.appService.isContentLoadingSubject.next(true);
    this.gameApi.getgamefreespinconfig({ tenantId: this.tenantId, gameId: game?.id }).subscribe((config) => {
      this.appService.isContentLoadingSubject.next(false);

      if (!config) return this.appService.showToastSubject.next({ msg: '获取游戏配置失败，请重新选择游戏！' });

      this.freeSpinData.gameData = { ...game };
      this.freeSpinData.gameFreeSpinConfig = {
        ...config,
        currencyList: config?.supportCurrency.map((v) => ({ code: v })) || [],
      };
    });
  }

  /** Free spin - 编辑：获取适用游戏的详情及配置 */
  getFreespinGameDetail(id) {
    this.appService.isContentLoadingSubject.next(true);
    this.gameApi
      .getGameList({
        tenantId: this.tenantId,
        id,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        const game = res?.list[0];
        if (game) this.getGameFreespinConfig(game);
      });
  }

  /** Free spin - 选择最低投注金额 */
  onSelectMinBetChange() {
    this.freeSpinData.spinValueData.betLevel =
      (this.freeSpinData?.gameFreeSpinConfig?.minBets || []).find(
        (v) => v.minBet === this.freeSpinData.spinValueData.minBet
      )?.betLevel || '';
  }

  /** Free spin - 删除适用游戏 */
  onDeleteFreespinGame() {
    this.freeSpinData.gameData = null; // 选择的游戏数据
    this.freeSpinData.gameFreeSpinConfig = null; // 游戏的freespin配置
    this.selectCurrencyCode = '';
    this.freeSpinData.spinValueData = {
      coins: '', // 硬币值
      lines: '', // 旋转的乘数
      denomination: '', // 面额
      minBet: '', // 最小投注金额
      betLevel: '', // 投注级别
    };
  }

  /** 提交 */
  async onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    if (this.submitInvalid()) return;

    // 公共参数
    const commonPrams = {
      id: this.id,
      merchantId: this.tenantId,
      prizeType: this.configuration,
      prizeName: this.formGroup.value.lang.map((v) => ({
        id: v.id,
        prizeFullName: v.name,
        prizeShortName: v.simpleName,
        lang: v.languageCode,
      })),
    };

    // 金额及类型参数
    const amountTypeParams = {
      amountType: this.amountType,
      ...(this.amountType === PrizeAmountType.Fixed ? { amount: +this.amount } : {}),
      ...(this.amountType === PrizeAmountType.Rate ? { rate: +this.rate, rateLimit: +this.rateLimit } : {}),
    };

    // 发放方式参数
    const distributionParams = {
      sendType: this.distribution,
      ...(this.distribution === PrizeDistributionEnumType.Need
        ? {
            expireType: this.period,
          }
        : {}),
      ...(this.distribution === PrizeDistributionEnumType.Need && this.period === PrizePeriodEnumType.Period
        ? { expirationDays: this.periodDay }
        : {}),
    };

    let params;
    /** 奖品配置 - 现金券数据 */
    if (this.configuration === PrizeType.Cash) {
      params = {
        ...amountTypeParams,
        ...distributionParams,
        currency: this.selectCurrencyCode,
        isRisk: this.isRisk,
        withdrawFlowMultiple: this.withdrawFlowMultiple, // 提款倍数
      };
    }

    /** 奖品配置 - 抵用金数据 */
    if (this.configuration === PrizeType.Credit) {
      params = {
        ...amountTypeParams,
        ...distributionParams,
        currency: this.selectCurrencyCode,
        isRisk: this.isRisk,
        avalibleScope: PrizeCreditLimitEnumType.Common, // 可用范围 - 默认全场通用
        categories: [],
        providers: [],
        maxSingleOrderRate: +this.creditData.maximumDeduction,
        maxSingleOrder: +this.creditData.singleDeduction,
        minBetLimit: +this.creditData.minBetLimit,
      };
    }

    /** 奖品配置 - 后发现金券数据 */
    if (this.configuration === PrizeType.AfterCash) {
      params = {
        currency: 'LED',
        isRisk: this.isRisk,
        ...amountTypeParams,
      };
    }

    /** 奖品配置 - 实物数据 */
    if (this.configuration === PrizeType.RealItem) {
      params = { picture: this.realItemData.picture };
    }

    /** 奖品配置 - 装备数据 */
    if (this.configuration === PrizeType.Equipment) {
      params = { picture: this.equipmentData.picture };
    }

    /** 奖品配置 - 非粘性奖金数据 */
    if (this.configuration === PrizeType.NonStickyBonus) {
      params = {
        ...amountTypeParams,
        currency: this.selectCurrencyCode,
        categories: [this.nonStickyData.limitValue],
        maxSingleOrder: +this.nonStickyData.spin,
        betMultiple: +this.nonStickyData.multiple,
        expirationDays: +this.nonStickyData.day,
        targetBetNum: +this.nonStickyData.times,
        isRisk: this.isRisk,
      };
    }

    /** 奖品配置 - 粘性奖金数据 */
    if (this.configuration === PrizeType.StickyBonus) {
      params = {
        ...amountTypeParams,
        currency: this.selectCurrencyCode,
        categories: [this.stickyData.limitValue],
        maxSingleOrder: +this.stickyData.maxBetAmount,
        betMultiple: +this.stickyData.betMultiple,
        minTurnoverFree: +this.stickyData.minFreeAmount,
        // isRisk: this.isRisk,
      };
    }

    /** 奖品配置 - Free spin数据 */
    if (this.configuration === PrizeType.FreeSpin) {
      params = {
        currency: this.selectCurrencyCode,
        spinTotalValue: +this.freeSpinData.total,
        sendType: PrizeDistributionEnumType.Need,
        expireType: PrizePeriodEnumType.Period,
        expirationDays: +this.periodDay,
        freeSpinTimes: +this.freeSpinData.spins,
        maxSingleOrder: +this.freeSpinData.bonusCap,
        gameProvider: [
          {
            providerId: this.freeSpinData.gameData?.providerId,
            category: this.freeSpinData.gameData?.category,
            gameIds: [this.freeSpinData.gameData?.gameId],
            goGameIds: [this.freeSpinData.gameData?.id],
          },
        ],
        isPng: this.freeSpinData.gameFreeSpinConfig?.isPng,
        ...(this.freeSpinData.gameFreeSpinConfig?.isPng
          ? {
              coins: +this.freeSpinData.spinValueData.coins,
              lines: +this.freeSpinData.spinValueData.lines,
              denomination: +this.freeSpinData.spinValueData.denomination,
            }
          : {
              minbet: +this.freeSpinData.spinValueData.minBet,
              betlevel: +this.freeSpinData.spinValueData.betLevel,
            }),
        isNoneSticky: this.freeSpinData.isNonSticky,
        ...(this.freeSpinData.isNonSticky
          ? {
              freeSpinNoneSticky: {
                category: this.nonStickyData.limitValue,
                maxBetPerSpin: +this.nonStickyData.spin,
                betMultiple: +this.nonStickyData.multiple,
                durationDaysAfterActivation: +this.nonStickyData.day,
                targetBetNum: +this.nonStickyData.times,
              },
              isRisk: this.isRisk,
            }
          : {
              withdrawFlowMultiple: +this.withdrawFlowMultiple,
            }),
      };
    }

    // 模板创建成功 / 模板更新成功
    const success = await this.lang.getOne(
      this.isEdit ? 'member.activity.sencliCommon.updateSuccess' : 'member.activity.sencliCommon.createSuccess'
    );
    // 模板创建失败 / 模板更新失败
    const fail = await this.lang.getOne(
      this.isEdit ? 'member.activity.sencliCommon.updateFail' : 'member.activity.sencliCommon.createFail'
    );

    this.loading(true);
    this.api[this.isEdit ? 'update_prize_setting' : 'prize_setting']({
      prizeSetting: { ...params, ...commonPrams },
    }).subscribe((res) => {
      this.loading(false);
      this.appService.showToastSubject.next({
        msg: res?.success ? success : fail,
        successed: res?.success,
      });

      if (res?.success) {
        this.back();

        // 抵用金 - 保存排除游戏
        if (this.configuration === PrizeType.Credit) this.saveExcludeGames(res?.data || this.id, false);

        // 非粘性奖金 / 粘性奖金
        if ([PrizeType.NonStickyBonus, PrizeType.StickyBonus].includes(this.configuration)) {
          // 保存排除游戏
          this.saveExcludeGames(res?.data || this.id, true);
          // 保存条款及条件
          this.saveTermsLang(res?.data || this.id);
        }

        // Free Spin
        if (this.configuration === PrizeType.FreeSpin) {
          // 保存排除游戏
          if (this.freeSpinData.isNonSticky) this.saveExcludeGames(res?.data || this.id, true);
          // 保存条款及条件
          this.saveTermsLang(res?.data || this.id);
        }
      }
    });
  }

  /** 排除游戏 - 打开弹窗 */
  openExcludedGamePopup() {
    const modalRef = this.modalService.open(ExcludedGamesComponent, {
      width: '800px',
      disableClose: true,
      autoFocus: false,
    });

    modalRef.componentInstance['readOnly'] = this.isCheck;
    modalRef.componentInstance['gameIdsData'] = this.excludedGameIdsData;
    modalRef.componentInstance['gameLabelUsedIdsList'] = this.excludedGameLabelUsedIdsList;
    modalRef.componentInstance['gameCategory'] =
      this.configuration === PrizeType.NonStickyBonus ? this.nonStickyData.limitValue : this.stickyData.limitValue;
    modalRef.componentInstance['configuration'] = this.configuration;

    modalRef.componentInstance.confirmSuccess.subscribe((data) => {
      this.excludedGameIdsData.gameIds = data?.gameIds || [];
      this.excludedGameIdsData.labelIds = data?.labelIds || [];
      this.excludedGameIdsData.providerIds = data?.providerIds || [];

      // 在查看模式下提交，进行保存排除游戏操作
      if (this.isCheck) this.saveExcludeGames(this.id, false);
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 排除游戏 - 获取回溯数据 */
  getExcludeGames() {
    this.loading(true);
    this.gameApi.getexcludegames({ tenantId: this.tenantId, associationId: this.id }).subscribe((res) => {
      this.loading(false);

      this.excludedGameIdsData.gameIds = res?.gameIds || [];
      this.excludedGameIdsData.labelIds = res?.labelIds || [];
      this.excludedGameIdsData.providerIds = res?.providerIds || [];

      // 已生效的标签游戏数据
      this.excludedGameLabelUsedIdsList = res?.gameCodes || [];
    });
  }

  /** 排除游戏 - 重置数据 */
  onExcludedGameReset() {
    this.excludedGameIdsData = {
      gameIds: [],
      labelIds: [],
      providerIds: [],
    };
  }

  /**
   * 排除游戏 - 保存
   * @isRealTime true=实时，false=非实时
   */
  saveExcludeGames(associationId, isRealTime: boolean) {
    const parmas = {
      tenantId: this.tenantId,
      associationId: String(associationId || this.id),
      type: 'Prize',
      isRealTime,
      ...this.excludedGameIdsData,
    };

    this.loading(true);
    this.gameApi.saveexcludegames(parmas).subscribe((res) => {
      this.loading(false);

      this.appService.showToastSubject.next({
        msgLang:
          res === true
            ? 'member.activity.prizeCommon.savedExcludedGameSuc'
            : 'member.activity.prizeCommon.savedExcludedGameFail',
        successed: res,
      });

      // 在查看模式下保存，则返回列表页
      if (this.isCheck) this.back();
    });
  }

  /** 条款及条件多语言 - 保存 */
  saveTermsLang(associationId) {
    const parmas = {
      source: MultiLangType.NA,
      tenantId: this.tenantId,
      list: [
        {
          key: 'content_' + associationId,
          infos: this.formGroup.value.termsLang.map((v) => ({
            content: v.content,
            lanageCode: v.languageCode,
          })),
        },
      ],
    };
    this.loading(true);
    this.articleApi.addOrUpdateCustom(parmas).subscribe((res) => {
      this.loading(false);
      this.appService.showToastSubject.next({
        msgLang:
          res === true ? 'member.activity.prizeCommon.saveTermsSus' : 'member.activity.prizeCommon.saveTermsFail',
        successed: res,
      });
    });
  }

  /** 条款及条件多语言 - 获取回溯数据 */
  getTermsLang() {
    const parmas = {
      source: MultiLangType.NA,
      tenantId: this.tenantId,
      keys: ['content_' + this.id],
    };
    this.articleApi.getCustomListByKeys(parmas).subscribe((res) => {
      const lang = res.find((v) => v?.key === 'content_' + this.id)?.infos || [];
      if (!lang.length) return;

      this.termsSelectLang = lang.map((e) => e.lanageCode);
      this.formGroup.setControl(
        'termsLang',
        this.fb.array(
          lang?.map((e) =>
            this.fb.group({
              content: [e.content],
              languageCode: [e.lanageCode],
            })
          )
        )
      );
    });
  }

  /** 字段校验 */
  submitInvalid() {
    /** 奖品配置：现金券，抵用金，后发现金券，非粘性奖金 - 相同校验 */
    if (
      [PrizeType.Cash, PrizeType.Credit, PrizeType.AfterCash, PrizeType.NonStickyBonus, PrizeType.StickyBonus].includes(
        this.configuration
      )
    ) {
      // 币种
      if (!this.selectCurrencyCode) return true;
    }

    /** 奖品配置：现金券，抵用金，后发现金券，非粘性奖金 - 相同校验 */
    if (
      [PrizeType.Cash, PrizeType.Credit, PrizeType.AfterCash, PrizeType.NonStickyBonus, PrizeType.StickyBonus].includes(
        this.configuration
      )
    ) {
      // 金额类型：按比例
      if (this.amountType === PrizeAmountType.Rate) if (!+this.rate || !+this.rateLimit) return true;
      // 金额类型：固定金额
      if (this.amountType === PrizeAmountType.Fixed) if (!+this.amount) return true;
    }

    /** 奖品配置：现金券，抵用金 - 相同校验 */
    if ([PrizeType.Cash, PrizeType.Credit].includes(this.configuration)) {
      // 卷有效期：相对时间 -> 发卷天数
      if (this.period === PrizePeriodEnumType.Period) if (!+this.periodDay) return true;
    }

    /** 奖品配置：现金券 */
    if (this.configuration === PrizeType.Cash) {
      // 提款倍数
      if (!+this.withdrawFlowMultiple) return true;
    }

    /** 奖品配置：抵用金 */
    if (this.configuration === PrizeType.Credit) {
      // 最低投注限额（USDT）/ 最高抵扣（%）/ 单笔抵扣（USDT）
      if (!+this.creditData.minBetLimit || !+this.creditData.maximumDeduction || !+this.creditData.singleDeduction)
        return true;
    }

    /** 奖品配置 - 实物数据 */
    if (this.configuration === PrizeType.RealItem) {
      if (!this.realItemData.picture) {
        this.appService.showToastSubject.next({ msgLang: 'form.choosePicture' });
        return true;
      }
    }

    /** 奖品配置 - 装备数据 */
    if (this.configuration === PrizeType.Equipment) {
      if (!this.equipmentData.picture) {
        this.appService.showToastSubject.next({ msgLang: 'form.choosePicture' });
        return true;
      }
    }

    /** 奖品配置：非粘性奖金 / Free Spin(非粘性) */
    if (
      this.configuration === PrizeType.NonStickyBonus ||
      (this.configuration === PrizeType.FreeSpin && this.freeSpinData.isNonSticky)
    ) {
      // 每次旋转的最大赌注（USDT）/ 投注倍数 / 激活后持续时间 / 下注次数要求
      if (
        !+this.nonStickyData.spin ||
        !+this.nonStickyData.multiple ||
        !+this.nonStickyData.day ||
        !+this.nonStickyData.times
      )
        return true;
    }

    /** 奖品配置：粘性奖金 */
    if (this.configuration === PrizeType.StickyBonus) {
      // 每次投注的最大赌注（USDT）/ 投注倍数 / 最低免流水金额
      if (!+this.stickyData.maxBetAmount || !+this.stickyData.betMultiple || !+this.stickyData.minFreeAmount)
        return true;
    }

    /** 奖品配置：Free Spin */
    if (this.configuration === PrizeType.FreeSpin) {
      // 券有效期
      if (!+this.freeSpinData.periodDay) return true;

      // 不是非粘性 - 提款倍数
      if (!this.freeSpinData.isNonSticky && !this.withdrawFlowMultiple && this.withdrawFlowMultiple !== 0) return true;

      // 适用游戏
      if (!this.freeSpinData.gameData || !this.freeSpinData.gameFreeSpinConfig) {
        this.appService.showToastSubject.next({ msgLang: 'member.activity.prizeCommon.pleaseSelectGame' });
        return true;
      }

      // 适用游戏 - 选择币种/显示总价值/旋转次数
      if (!this.selectCurrencyCode || !+this.freeSpinData.total || !+this.freeSpinData.spins) return true;

      // 适用游戏 - PNG厂商 (硬币值/旋转的乘数/面额)
      if (
        this.freeSpinData.gameFreeSpinConfig.isPng &&
        (!+this.freeSpinData.spinValueData.coins ||
          !+this.freeSpinData.spinValueData.lines ||
          !+this.freeSpinData.spinValueData.denomination)
      )
        return true;

      // 适用游戏 - 聚合厂商 (最小投注金额/投注级别)
      if (
        !this.freeSpinData.gameFreeSpinConfig.isPng &&
        (!+this.freeSpinData.spinValueData.minBet || !+this.freeSpinData.spinValueData.betLevel)
      )
        return true;
    }

    return false;
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  back() {
    this.router.navigate(['/bonus/prize-manage']);
  }
}
