import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppService } from 'src/app/app.service';
import { BonusCouponApi } from 'src/app/shared/api/bonus-coupon.api';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { FormValidator } from 'src/app/shared/form-validator';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import {
  InputFloatDirective,
  InputNumberDirective,
  InputPercentageDirective,
} from 'src/app/shared/directive/input.directive';
import { UserAmountLimitData } from 'src/app/shared/interfaces/member.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import {
  CouponlimitsValueEnumType,
  CouponPeriodEnumType,
  CouponTypeEnum,
  CouponVoucherLimitEnumType,
  CouponNonStickyLimitEnumType,
} from 'src/app/shared/interfaces/coupon';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { Tabs } from 'src/app/shared/interfaces/base.interface';
import { ExcludedGamesComponent } from 'src/app/pages/Bonus/prize-manage/edit/excluded-games/excluded-games.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { CurrencyIconDirective } from 'src/app/shared/components/icon/icon.directive';
import { GameApi } from 'src/app/shared/api/game.api';
import { ArticleApi } from 'src/app/shared/api/article.api';
import { MultiLangType } from 'src/app/shared/interfaces/article';
import { HostPipe } from 'src/app/shared/pipes/common.pipe';
import { FreeSpinSearchGamesPopupComponent } from 'src/app/pages/Bonus/prize-manage/edit/search-games-popup/search-games-popup.component';
import { CouponService } from 'src/app/pages/Bonus/coupon.service';

@Component({
  selector: 'app-add-coupon',
  templateUrl: './add-coupon.component.html',
  styleUrls: ['./add-coupon.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    NgFor,
    NgIf,
    FormWrapComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    ModalFooterComponent,
    LangPipe,
    InputNumberDirective,
    InputPercentageDirective,
    InputFloatDirective,
    CurrencyValuePipe,
    SelectChildrenDirective,
    SelectGroupDirective,
    NgSwitch,
    NgSwitchCase,
    NgTemplateOutlet,
    AngularSvgIconModule,
    AsyncPipe,
    SearchDirective,
    SearchInpDirective,
    CurrencyIconDirective,
    AttrDisabledDirective,
    HostPipe,
  ],
})
export class AddCouponComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    public modal: MatModalRef<AddCouponComponent, boolean>,
    private api: BonusCouponApi,
    private appService: AppService,
    private assetApi: AssetApi,
    public lang: LangService,
    public currencyService: CurrencyService,
    private subHeaderService: SubHeaderService,
    private modalService: MatModal,
    private gameApi: GameApi,
    private articleApi: ArticleApi,
    public couponService: CouponService
  ) {}

  protected readonly CouponTypeEnum = CouponTypeEnum;
  protected readonly CouponPeriodEnumType = CouponPeriodEnumType;
  protected readonly CouponVoucherLimitEnumType = CouponVoucherLimitEnumType;
  protected readonly CouponlimitsValueEnumType = CouponlimitsValueEnumType;

  /** 
    模板类型
    @templateType check=查看模式
   */
  @Input() templateType;

  @Input() data;

  @Output() addEditSuccess = new EventEmitter();

  formGroup: FormGroup = this.fb.group({});
  validator!: FormValidator;

  isLoading = false;

  /** 优惠券名称 - 语系数据 */
  selectLang = ['zh-cn'];
  /** 条款及条件:语系数据 */
  termsSelectLang = ['zh-cn'];

  /** 优惠卷 - 当前类型值 */
  type = CouponTypeEnum.CashCoupons;
  /** 优惠卷 - 类型数据 */
  get typeList() {
    return this.couponService.typeList;
  }

  /** 券有效期 - 当前类型值 */
  period = CouponPeriodEnumType.Period;
  /** 券有效期：相对时间 - 天数 */
  periodMinRelatively = 1;
  /** 券有效期 - 类型数据 */
  periodList = [
    { name: 'member.coupon.model.relativeTime', value: CouponPeriodEnumType.Period },
    { name: 'member.coupon.model.Permanent', value: CouponPeriodEnumType.Permanent },
  ];

  /** 排除游戏 - id集合数据 */
  excludedGameIdsData = {
    gameIds: [],
    labelIds: [],
    providerIds: [],
  };

  /** 排除游戏 - 已生效的标签游戏id集合数据 */
  excludedGameLabelUsedIdsList: string[] = [];

  /** 币种 - 当前币种code */
  selectCurrencyCode = 'USDT';

  /** 金额 */
  amount = 1;
  /** 金额限制 - 数据 */
  amountLimitData: UserAmountLimitData;
  /** 金额限制是否校验 */
  isAmountInvalid = false;

  /** 类型：现金券 - 数据 */
  cashData = {
    multiple: 1, // 提款倍数
  };

  /** 类型：抵用券 - 数据 */
  voucherData = {
    minBetLimit: 1, // 投注最低限额（USDT）
  };

  /** 类型：SVIP体验券 - 数据 */
  svipExpData = {
    day: 1, // 从兑换天数
  };

  /** 类型：非粘性奖金 - 数据 */
  nonStickyData = {
    limitValue: CouponNonStickyLimitEnumType.SlotGame, // 可用范围选择值
    spin: 1, // 每次旋转的最大赌注
    multiple: 1, // 投注倍数
    day: 1, // 激活后持续时间
    times: 1, // 下注次数要求
    isRisk: false, // 是否风控
  };

  /** 类型：非粘性奖金 - 可用范围 */
  nonStickyLimitTypeList: Tabs[] = [
    {
      name: '娱乐场投注',
      lang: 'member.activity.prizeCommon.casinoBetting',
      value: CouponNonStickyLimitEnumType.SlotGame,
    },
    {
      name: '真人娱乐场投注',
      lang: 'member.activity.prizeCommon.liveCasinoBetting',
      value: CouponNonStickyLimitEnumType.LiveCasino,
    },
  ];

  /** 类型：Free Spin - 数据 */
  freeSpinData: any = {
    total: 1, // 总价值
    spins: 1, // 旋转次数
    supportCurrency: '', // 当前选择的支持币种
    bonusCap: '', // 奖金上限
    spinValueData: {
      coins: '', // 硬币值
      lines: '', // 旋转的乘数
      denomination: '', // 面额
      minBet: '', // 最小投注金额
      betLevel: '', // 投注级别
    },
    periodDay: 1, // 卷有效期
    isNonSticky: false, // 是否为非粘性
    gameData: null, // 选择的游戏数据
    gameFreeSpinConfig: null, // 游戏的freespin配置
  };

  /** 优惠券名称 - 名称多语系 */
  get langArrayForm(): FormArray {
    return this.formGroup.get('lang') as FormArray;
  }

  /** 条款及条件多语系 */
  get termsLangArrayForm(): FormArray {
    return this.formGroup.get('termsLang') as FormArray;
  }

  /** 是否为查看 */
  get isCheck() {
    return this.templateType === 'check';
  }

  /** 是否为编辑 */
  get isEdit(): boolean {
    return this.templateType === 'check' || this.data;
  }

  /** 标题 */
  get title() {
    if (this.isCheck) {
      return 'common.viewDetail';
    } else if (this.isEdit) {
      return 'member.coupon.model.editCoupon';
    } else {
      return 'member.coupon.addCoup';
    }
  }

  async ngOnInit() {
    this.loadForm();

    // 获取币种
    this.currencyService.updateCurrency();

    // 编辑
    if (this.isEdit) this.edit();
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      lang: this.fb.array([
        this.fb.group({
          name: ['', Validators.required], // 优惠卷名称
          languageCode: ['zh-cn'],
        }),
      ]),
      termsLang: this.fb.array([
        this.fb.group({
          content: [''], // 条款及条件内容
          languageCode: ['zh-cn'],
        }),
      ]),
    });

    this.validator = new FormValidator(this.formGroup);
  }

  /** 编辑 */
  edit() {
    // 多语系获取
    this.getExchangeDetail();

    // 优惠券类型
    this.type = this.data?.voucherType;

    const limits = this.data?.limits || [];

    /** 现金券，抵用券，SVIP体验券 - 相同配置 */
    if (
      [CouponTypeEnum.CashCoupons, CouponTypeEnum.Voucher, CouponTypeEnum.SVIPExperienceCoupon].includes(
        this.data?.voucherType
      )
    ) {
      // 券有效期的类型
      this.period = this.data?.voucherIndateType;
      // 券有效期 - 相对天数
      if (this.period === CouponPeriodEnumType.Period) this.periodMinRelatively = this.data?.voucherIndateValue;
    }

    /** 现金券，抵用券，非粘性奖金 - 相同配置 */
    if (
      [CouponTypeEnum.CashCoupons, CouponTypeEnum.Voucher, CouponTypeEnum.NonStickyBonus].includes(
        this.data?.voucherType
      )
    ) {
      // 币种
      this.selectCurrencyCode = this.data?.currency;
      // 金额
      this.amount = this.data?.amount;
    }

    /** 抵用券，非粘性奖金，FreeSpin（非粘性） - 相同配置 */
    if (
      [CouponTypeEnum.Voucher, CouponTypeEnum.NonStickyBonus].includes(this.data?.voucherType) ||
      (this.data?.voucherType === CouponTypeEnum.FreeSpin &&
        this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinIsNonSticky) === 'true')
    ) {
      // 获取 排除游戏数据
      this.getExcludeGames();
    }

    /** 非粘性奖金，Free Spin - 相同配置 */
    if ([CouponTypeEnum.NonStickyBonus, CouponTypeEnum.FreeSpin].includes(this.data?.voucherType)) {
      // 获取 条款及条件
      this.getTermsLang();
    }

    /** 现金券，FreeSpin（不是非粘性）- 相同配置 */
    if (
      this.data?.voucherType === CouponTypeEnum.CashCoupons ||
      (this.data?.voucherType === CouponTypeEnum.FreeSpin &&
        this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinIsNonSticky) === 'false')
    ) {
      // 提款倍数
      this.cashData.multiple = this.getLimitValue(limits, CouponlimitsValueEnumType.Multiple);
    }

    /** 抵用券 */
    if (this.data?.voucherType === CouponTypeEnum.Voucher) {
      // 最低投注金额
      this.voucherData.minBetLimit = this.getLimitValue(limits, CouponlimitsValueEnumType.VoucherMinBetLimit);
    }

    /** SVIP体验券 */
    if (this.data?.voucherType === CouponTypeEnum.SVIPExperienceCoupon) {
      // 从兑换天数
      this.svipExpData.day = this.getLimitValue(limits, CouponlimitsValueEnumType.SVIPRedemptionDays);
    }

    /** 非粘性奖金，FreeSpin（非粘性）- 相同配置 */
    if (
      this.data?.voucherType === CouponTypeEnum.NonStickyBonus ||
      (this.data?.voucherType === CouponTypeEnum.FreeSpin &&
        this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinIsNonSticky) === 'true')
    ) {
      // 可用范围
      this.nonStickyData.limitValue = this.getLimitValue(limits, CouponlimitsValueEnumType.GameCategory);
      // 每次旋转的最大赌注(USDT)
      this.nonStickyData.spin = this.getLimitValue(limits, CouponlimitsValueEnumType.NonStickyMaxSpinAmount);
      // 投注倍数
      this.nonStickyData.multiple = this.getLimitValue(limits, CouponlimitsValueEnumType.Multiple);
      // 激活后持续时间
      this.nonStickyData.day = this.getLimitValue(limits, CouponlimitsValueEnumType.NonStickyActivationdays);
      // 下注次数要求
      this.nonStickyData.times = this.getLimitValue(limits, CouponlimitsValueEnumType.NonStickyBetTimes);
      // 是否风控
      this.nonStickyData.isRisk = this.getLimitValue(limits, CouponlimitsValueEnumType.NonStickyIsRisk);
    }

    /** 奖品配置：FreeSpin */
    if (this.data?.voucherType === CouponTypeEnum.FreeSpin) {
      // 卷有效期
      this.freeSpinData.periodDay = this.data?.voucherIndateValue;
      // 旋转次数
      this.freeSpinData.spins = this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinTimes);
      // 币种
      this.freeSpinData.supportCurrency = this.data?.currency;
      // 显示总价值
      this.freeSpinData.total = this.data?.amount;
      // 上限奖金
      this.freeSpinData.bonusCap = this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinBonusCap);
      // 是否非粘性
      this.freeSpinData.isNonSticky =
        this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinIsNonSticky) === 'true';

      // 游戏 - PNG厂商 或 聚合厂商
      if (this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinIsPng) === 'true') {
        // 硬币值
        this.freeSpinData.spinValueData.coins = +this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinCoins);
        // 旋转的乘数
        this.freeSpinData.spinValueData.lines = +this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinLines);
        // 面额
        this.freeSpinData.spinValueData.denomination = +this.getLimitValue(
          limits,
          CouponlimitsValueEnumType.FreeSpinDenomination
        );
      } else {
        // 最小投注金额
        this.freeSpinData.spinValueData.minBet = +this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinMinBet);
        // 投注级别
        this.freeSpinData.spinValueData.betLevel = +this.getLimitValue(
          limits,
          CouponlimitsValueEnumType.FreeSpinBetLevel
        );
      }

      // 获取 游戏详情及游戏freespin配置
      this.getFreespinGameDetail(+this.getLimitValue(limits, CouponlimitsValueEnumType.FreeSpinGameId));
    }
  }

  /** 编辑 - 获取limits的value值 */
  getLimitValue(limits, type) {
    return limits.find((v) => v.type === type)?.value;
  }

  /** 优惠券类型 - 选择 */
  typeValueChange(value) {
    // lang-tab销毁后，会清空语系列表，所以当切换回来时，根据不同情况进行初始化操作
    if ([CouponTypeEnum.NonStickyBonus, CouponTypeEnum.FreeSpin].includes(value)) {
      this.termsSelectLang = ['zh-cn'];
      if (this.isEdit && [CouponTypeEnum.NonStickyBonus, CouponTypeEnum.FreeSpin].includes(this.data?.voucherType)) {
        this.getTermsLang();
      }
    }

    // 排除游戏 - 清空处理
    this.onExcludedGameReset();
  }

  /** 优惠券多语言 - 获取 */
  getExchangeDetail() {
    // 默认先取中文（bonus服务接口只存中文）
    this.formGroup.setControl(
      'lang',
      this.fb.array([
        this.fb.group({
          name: [this.data?.voucherName, Validators.required], // 优惠卷名称
          languageCode: ['zh-cn'],
        }),
      ])
    );
    // 接口获取多语系
    this.loading(true);
    this.assetApi
      .getExchangeDetail({ tenantId: this.subHeaderService.merchantCurrentId, exchangeId: this.data?.id })
      .subscribe((res) => {
        this.loading(false);
        if (!!res && res[0]?.info?.length > 0) {
          this.selectLang = res[0]?.info.map((e) => e.languageCode);
          this.formGroup.setControl(
            'lang',
            this.fb.array(
              res[0]?.info.map((e) =>
                this.fb.group({
                  name: [e.title, Validators.required],
                  languageCode: [e.languageCode],
                })
              )
            )
          );
        } else {
          // 多语言获取失败, 默认取中文（bonus服务接口只存中文）
          this.appService.showToastSubject.next({
            msgLang: 'member.coupon.model.multiAcquisitionFailed',
          });
        }
      });
  }

  /** 优惠券名称 - 更新语言表单 */
  updateLanguageForm() {
    const prevValue = this.langArrayForm.value as any[];
    const langArray = this.selectLang.map((languageCode) => {
      const value = {
        languageCode,
        name: '',
        ...prevValue.find((e) => e.languageCode === languageCode), // 把之前的值保留下来
      };

      return this.fb.group({
        name: [value.name, Validators.required],
        languageCode: [value.languageCode],
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

  /**
   * 选择币种
   * PS：查询该管理账号的金额限制
   */
  selectCurrency(e) {
    if (this.amountLimitData?.isNeedLimit === false) return;
    this.loading(true);
    this.assetApi.getlimitdata(e.value).subscribe((res) => {
      this.loading(false);
      if (res) this.amountLimitData = res;
    });
  }

  /**
   * 监听金额变化
   */
  amountValueChange(e) {
    this.isAmountInvalid = !+e;
    if (typeof this.amountLimitData?.isNeedLimit === 'boolean' && this.amountLimitData?.isNeedLimit) {
      this.isAmountInvalid = !+e || e > this.amountLimitData?.total;
    }
  }

  // 新增/编辑 确认
  async onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    if (this.submitInvalid()) return;

    // 公共参数
    const commonPrams = {
      ...(this.isEdit ? { id: this.data?.id } : {}),
      tenantId: this.subHeaderService.merchantCurrentId,
      voucherType: this.type, // 优惠卷类型
      voucherName: this.formGroup.value.lang[0]?.name, // 优惠卷名称
    };

    // 币种金额参数
    const currencyAmountParams = {
      amount: +this.amount, // 金额
      currency: this.selectCurrencyCode, // 币种
    };

    // 券有效期参数
    const voucherPeriodParams = {
      voucherIndateType: +this.period, // 券有效期类型
      voucherIndateValue: this.period === CouponPeriodEnumType.Period ? +this.periodMinRelatively : '', // 从发卷（天数）
    };

    let params;
    /** 优惠券 - 现金券数据 */
    if (this.type === CouponTypeEnum.CashCoupons) {
      params = {
        ...currencyAmountParams,
        ...voucherPeriodParams,
        limits: [{ type: CouponlimitsValueEnumType.Multiple, value: this.cashData.multiple }], // 提款倍数
      };
    }

    /** 优惠券 - 抵用券数据 */
    if (this.type === CouponTypeEnum.Voucher) {
      params = {
        ...currencyAmountParams,
        ...voucherPeriodParams,
        limits: [{ type: CouponlimitsValueEnumType.VoucherMinBetLimit, value: this.voucherData.minBetLimit }], // 投注最低限额（USDT）
      };
    }

    /** 优惠券 - SVIP体验券数据 */
    if (this.type === CouponTypeEnum.SVIPExperienceCoupon) {
      params = {
        ...voucherPeriodParams,
        limits: [
          { type: CouponlimitsValueEnumType.SVIPRedemptionDays, value: this.svipExpData.day }, // 从发卷天数
        ],
      };
    }

    /** 优惠券 - 非粘性奖金数据 */
    if (this.type === CouponTypeEnum.NonStickyBonus) {
      params = {
        ...currencyAmountParams,
        voucherIndateType: CouponPeriodEnumType.Permanent,
        voucherIndateValue: '',
        limits: [
          { type: CouponlimitsValueEnumType.GameCategory, value: this.nonStickyData.limitValue }, // 可用范围
          { type: CouponlimitsValueEnumType.NonStickyMaxSpinAmount, value: this.nonStickyData.spin }, // 每次旋转的最大赌注(USDT)
          { type: CouponlimitsValueEnumType.Multiple, value: this.nonStickyData.multiple }, // 投注倍数
          { type: CouponlimitsValueEnumType.NonStickyActivationdays, value: this.nonStickyData.day }, // 激活后持续时间
          { type: CouponlimitsValueEnumType.NonStickyBetTimes, value: this.nonStickyData.times }, // 下注次数要求
          { type: CouponlimitsValueEnumType.NonStickyIsRisk, value: this.nonStickyData.isRisk }, // 是否风控
        ],
      };
    }

    /** 优惠券 - FreeSpin */
    if (this.type === CouponTypeEnum.FreeSpin) {
      params = {
        amount: +this.freeSpinData.total, // 显示总价值
        currency: this.freeSpinData.supportCurrency, // 币种
        voucherIndateType: CouponPeriodEnumType.Period, // 相对时间
        voucherIndateValue: +this.freeSpinData.periodDay, // 从发卷天数
        limits: [
          { type: CouponlimitsValueEnumType.FreeSpinGameCategory, value: this.freeSpinData.gameData?.category }, // 适用游戏 - 厂商类别
          { type: CouponlimitsValueEnumType.ProviderId, value: this.freeSpinData.gameData?.providerId }, // 适用游戏 - 厂商ID
          { type: CouponlimitsValueEnumType.GameCode, value: this.freeSpinData.gameData?.gameId }, // 适用游戏 - code
          { type: CouponlimitsValueEnumType.FreeSpinGameId, value: this.freeSpinData.gameData?.id }, // 适用游戏 - id
          { type: CouponlimitsValueEnumType.FreeSpinTimes, value: this.freeSpinData.spins }, // 适用游戏 - 旋转次数
          { type: CouponlimitsValueEnumType.FreeSpinBonusCap, value: this.freeSpinData.bonusCap }, // 上限奖金

          { type: CouponlimitsValueEnumType.FreeSpinIsPng, value: this.freeSpinData.gameFreeSpinConfig?.isPng }, // 适用游戏 - 是否为Png厂商
          ...(this.freeSpinData.gameFreeSpinConfig?.isPng
            ? [
                { type: CouponlimitsValueEnumType.FreeSpinCoins, value: this.freeSpinData.spinValueData.coins }, // 适用游戏 - PNG厂商：硬币值
                { type: CouponlimitsValueEnumType.FreeSpinLines, value: this.freeSpinData.spinValueData?.lines }, // 适用游戏 - PNG厂商：旋转的乘数
                {
                  type: CouponlimitsValueEnumType.FreeSpinDenomination,
                  value: this.freeSpinData.spinValueData?.denomination,
                }, // 适用游戏 - PNG厂商：面额
              ]
            : [
                { type: CouponlimitsValueEnumType.FreeSpinMinBet, value: this.freeSpinData.spinValueData?.minBet }, // 适用游戏 - 最小投注金额
                { type: CouponlimitsValueEnumType.FreeSpinBetLevel, value: this.freeSpinData.spinValueData?.betLevel }, // 适用游戏 - 投注级别
              ]),

          { type: CouponlimitsValueEnumType.FreeSpinIsNonSticky, value: this.freeSpinData.isNonSticky }, // 是否非粘性
          ...(this.freeSpinData.isNonSticky
            ? [
                { type: CouponlimitsValueEnumType.GameCategory, value: this.nonStickyData.limitValue }, // 可用范围
                { type: CouponlimitsValueEnumType.NonStickyMaxSpinAmount, value: this.nonStickyData.spin }, // 每次旋转的最大赌注(USDT)
                { type: CouponlimitsValueEnumType.Multiple, value: this.nonStickyData.multiple }, // 投注倍数
                { type: CouponlimitsValueEnumType.NonStickyActivationdays, value: this.nonStickyData.day }, // 激活后持续时间
                { type: CouponlimitsValueEnumType.NonStickyBetTimes, value: this.nonStickyData.times }, // 下注次数要求
                { type: CouponlimitsValueEnumType.NonStickyIsRisk, value: this.nonStickyData.isRisk }, // 是否风控
              ]
            : [
                { type: CouponlimitsValueEnumType.Multiple, value: this.cashData.multiple }, // 提款倍数
              ]),
        ],
      };
    }

    // 优惠券新增成功 / 优惠券更新成功
    const success = await this.lang.getOne(
      this.isEdit ? 'member.coupon.model.coupCreatedSuccess' : 'member.coupon.model.coupUpSuc'
    );
    // 优惠券新增失败 / 优惠券更新失败
    const failed = await this.lang.getOne(
      this.isEdit ? 'member.coupon.model.coupCreationFailed' : 'member.coupon.model.coupUpFail'
    );

    this.loading(true);
    this.api[this.isEdit ? 'getCouponEdit' : 'getCouponAdd']({ ...commonPrams, ...params }).subscribe((res) => {
      this.loading(false);

      this.appService.showToastSubject.next({
        msg: res?.code === '0000' ? success : res?.message || failed,
        successed: res?.code === '0000',
      });

      if (res?.code === '0000') {
        const id = this.data?.id || res.data?.id;
        const tmpCode = this.data?.tmpCode || res.data?.tmpCode;

        // 优惠券多语言 - 新增或编辑
        this.addOrupDateExchange(id, tmpCode);

        // 抵用券 - 保存排除游戏
        if (this.type === CouponTypeEnum.Voucher) {
          // 保存排除游戏
          this.saveExcludeGames(tmpCode, false);
        }

        // 非粘性奖金
        if (this.type === CouponTypeEnum.NonStickyBonus) {
          // 保存排除游戏
          this.saveExcludeGames(tmpCode, true);
          // 保存条款及条件
          this.saveTermsLang(tmpCode);
        }

        // Free Spin
        if (this.type === CouponTypeEnum.FreeSpin) {
          // 保存排除游戏
          if (this.freeSpinData.isNonSticky) this.saveExcludeGames(tmpCode, true);
          // 保存条款及条件
          this.saveTermsLang(tmpCode);
        }

        this.addEditSuccess.emit();
        this.modal.close(true);
      }
    });
  }

  /** 优惠券多语言 - 新增或编辑 */
  addOrupDateExchange(id, exchangeCode) {
    this.loading(true);
    const params = {
      tenantId: this.subHeaderService.merchantCurrentId,
      banners: this.formGroup.value.lang.map((v) => ({ title: v.name, languageCode: v.languageCode })),
      id,
      exchangeCode,
    };
    this.assetApi.addOrupDateExchange(params).subscribe((res) => {
      this.appService.showToastSubject.next({
        msgLang: res === true ? 'member.activity.sencli3.i18nSaveSus' : 'member.activity.sencli3.i18nSaveFail',
        successed: res,
      });
    });
  }

  /** 排除游戏- 打开弹窗 */
  openExcludedGamePopup() {
    const modalRef = this.modalService.open(ExcludedGamesComponent, {
      width: '800px',
      disableClose: true,
      autoFocus: false,
    });
    modalRef.componentInstance['readOnly'] = this.isCheck;
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
    modalRef.componentInstance['gameIdsData'] = this.excludedGameIdsData;
    modalRef.componentInstance['gameLabelUsedIdsList'] = this.excludedGameLabelUsedIdsList;
    modalRef.componentInstance['gameCategory'] = this.nonStickyData.limitValue;
    modalRef.componentInstance['configuration'] = this.type;

    modalRef.componentInstance.confirmSuccess.subscribe((data) => {
      this.excludedGameIdsData.gameIds = data?.gameIds || [];
      this.excludedGameIdsData.labelIds = data?.labelIds || [];
      this.excludedGameIdsData.providerIds = data?.providerIds || [];

      // 在查看模式下提交，进入保存排除游戏操作
      if (this.isCheck) this.saveExcludeGames(this.data.tmpCode, false);
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  /** 排除游戏 - 获取 */
  getExcludeGames() {
    this.loading(true);
    this.gameApi
      .getexcludegames({ tenantId: this.subHeaderService.merchantCurrentId, associationId: this.data.tmpCode })
      .subscribe((res) => {
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
      tenantId: this.subHeaderService.merchantCurrentId,
      associationId: String(associationId || this.data.tmpCode),
      type: 'Activity',
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
      if (this.isCheck) {
        this.addEditSuccess.emit();
        this.modal.close(true);
      }
    });
  }

  /** 条款及条件多语言 - 保存 */
  saveTermsLang(associationId) {
    const parmas = {
      source: MultiLangType.OA,
      tenantId: this.subHeaderService.merchantCurrentId,
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

  /** 条款及条件多语言 - 获取  */
  getTermsLang() {
    const parmas = {
      source: MultiLangType.OA,
      tenantId: this.subHeaderService.merchantCurrentId,
      keys: ['content_' + this.data.tmpCode],
    };
    this.articleApi.getCustomListByKeys(parmas).subscribe((res) => {
      const lang = res.find((v) => v?.key === 'content_' + this.data.tmpCode)?.infos || [];
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

  /** Free spin - 选择适用游戏 */
  onOpenFreeSpinGames() {
    const modalRef = this.modalService.open(FreeSpinSearchGamesPopupComponent, { width: '900px', autoFocus: false });
    modalRef.componentInstance['tenantId'] = this.subHeaderService.merchantCurrentId;
    modalRef.result
      .then((game) => {
        this.getGameFreespinConfig(game);
      })
      .catch(() => {});
  }

  /** Free spin - 获取适用游戏的freespin配置 */
  getGameFreespinConfig(game) {
    this.appService.isContentLoadingSubject.next(true);
    this.gameApi
      .getgamefreespinconfig({ tenantId: this.subHeaderService.merchantCurrentId, gameId: game?.id })
      .subscribe((config) => {
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
        tenantId: this.subHeaderService.merchantCurrentId,
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
    this.freeSpinData.supportCurrency = '';
    this.freeSpinData.spinValueData = {
      coins: '', // 硬币值
      lines: '', // 旋转的乘数
      denomination: '', // 面额
      minBet: '', // 最小投注金额
      betLevel: '', // 投注级别
    };
  }

  /** 字段校验 */
  submitInvalid() {
    /** 现金券，抵用券，非粘性奖金 - 相同校验 */
    if ([CouponTypeEnum.CashCoupons, CouponTypeEnum.Voucher, CouponTypeEnum.NonStickyBonus].includes(this.type)) {
      // 金额
      if (this.isAmountInvalid) return true;
    }

    /** 现金券，抵用券，SVIP体验券 - 相同校验 */
    if ([CouponTypeEnum.CashCoupons, CouponTypeEnum.Voucher, CouponTypeEnum.SVIPExperienceCoupon].includes(this.type)) {
      // 卷有效期：相对时间 -> 发卷天数
      if (this.period === CouponPeriodEnumType.Period) if (!+this.periodMinRelatively) return true;
    }

    /** 现金券 */
    if (this.type === CouponTypeEnum.CashCoupons) {
      // 提款倍数
      if (!+this.cashData.multiple) return true;
    }

    /** 抵用金 */
    if (this.type === CouponTypeEnum.Voucher) {
      // 最低投注限额（USDT）
      if (!+this.voucherData.minBetLimit) return true;
    }

    /** SVIP体验券 */
    if (this.type === CouponTypeEnum.SVIPExperienceCoupon) {
      // 从兑换天数
      if (!+this.svipExpData.day) return true;
    }

    /** 非粘性奖金，FreeSpin（非粘性）- 相同校验   */
    if (
      this.type === CouponTypeEnum.NonStickyBonus ||
      (this.type === CouponTypeEnum.FreeSpin && this.freeSpinData.isNonSticky)
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

    /** Free Spin */
    if (this.type === CouponTypeEnum.FreeSpin) {
      // 发卷天数
      if (!+this.freeSpinData.periodDay) return true;

      // 不是非粘性 - 提款倍数
      if (!this.freeSpinData.isNonSticky && !this.cashData.multiple && this.cashData.multiple !== 0) return true;

      // 适用游戏
      if (!this.freeSpinData.gameData || !this.freeSpinData.gameFreeSpinConfig) {
        this.appService.showToastSubject.next({ msgLang: 'member.activity.prizeCommon.pleaseSelectGame' });
        return true;
      }

      // 适用游戏 - 币种/显示总价值/旋转次数
      if (!this.freeSpinData.supportCurrency || !+this.freeSpinData.total || !+this.freeSpinData.spins) return true;

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
}
