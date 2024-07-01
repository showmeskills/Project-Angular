import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LuckyPreviewComponent } from 'src/app/pages/Bonus/activity-template/lucky-roulette/lucky-roulette-edit/lucky-preview/lucky-preview.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivityAPI } from 'src/app/shared/api/activity.api';
import { AppService } from 'src/app/app.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { filter, finalize, from, lastValueFrom, Observable, of, switchMap, throttleTime, zip } from 'rxjs';
import {
  Prize,
  PrizeAmountType,
  PrizeInfo,
  PrizeType,
  PrizeTypeItem,
  TurntableCondition,
  TurntableGame,
  TurntablePrize,
  TurntablePrizes,
  TurntableTemplate2LevelTypeEnum,
  TurntableTemplateTypeEnum,
  TurntableTypeEnum,
} from 'src/app/shared/interfaces/activity';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import { cloneDeep, isEqual } from 'lodash';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';
import { ActivityStepService } from 'src/app/pages/Bonus/activity-template/step/step.service';
import { DestroyService, getPathname } from 'src/app/shared/models/tools.model';
import { catchError, distinctUntilChanged, map, takeUntil, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { luckyRouletteInstance } from 'src/app/pages/Bonus/bonus-routing';
import { PrizeSelectComponent } from 'src/app/pages/Bonus/activity-template/components/prize-select/prize-select.component';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { Currency } from 'src/app/shared/interfaces/currency';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DrawRecordComponent } from 'src/app/pages/Bonus/activity-template/lucky-roulette/draw-record/draw-record.component';
import { ArticleApi } from 'src/app/shared/api/article.api';
import { MultiLang, MultiLangInfo, MultiLangType } from 'src/app/shared/interfaces/article';
import { ContinentCountryItem, Country } from 'src/app/shared/interfaces/select.interface';
import { AddPopupComponent } from 'src/app/pages/Bonus/activity-template/add-popup/add-popup.component';
import { PrizeConfigPipe } from '../../../bonus.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { BigNumberPipe, FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { IconCountryComponent } from 'src/app/shared/components/icon/icon.directive';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { DefaultDirective } from 'src/app/shared/components/upload/default.directive';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { MatOptionModule } from '@angular/material/core';
import { AffixTheadDirective } from 'src/app/shared/directive/affix-thead.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker.component';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import {
  InputFloatDirective,
  InputNumberDirective,
  InputTrimDirective,
} from 'src/app/shared/directive/input.directive';
import { FormFullDirective, FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { SelectChildrenDirective, SelectGroupDirective } from 'src/app/shared/directive/select.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AsyncPipe, NgFor, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet } from '@angular/common';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { PrizeService } from 'src/app/pages/Bonus/prize.service';

@Component({
  selector: 'base-edit',
  templateUrl: './lucky-roulette-edit.component.html',
  styleUrls: ['./lucky-roulette-edit.component.scss'],
  providers: [DestroyService],
  standalone: true,
  imports: [
    NgFor,
    FormRowComponent,
    SelectChildrenDirective,
    NgIf,
    SelectGroupDirective,
    FormsModule,
    ReactiveFormsModule,
    NgSwitch,
    NgSwitchCase,
    FormWrapComponent,
    InputFloatDirective,
    FormFullDirective,
    NgTemplateOutlet,
    OwlDateTimeInputDirective,
    OwlDateTimeTriggerDirective,
    OwlDateTimeComponent,
    InputNumberDirective,
    AffixTheadDirective,
    MatAutocompleteModule,
    MatOptionModule,
    UploadComponent,
    DefaultDirective,
    AngularSvgIconModule,
    LangTabComponent,
    InputTrimDirective,
    IconCountryComponent,
    ModalTitleComponent,
    ModalFooterComponent,
    AsyncPipe,
    TimeFormatPipe,
    BigNumberPipe,
    FormatMoneyPipe,
    LangPipe,
    PrizeConfigPipe,
    AttrDisabledDirective,
  ],
})
export class LuckyRouletteEditComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private modalService: MatModal,
    public lang: LangService,
    private activatedRoute: ActivatedRoute,
    private api: ActivityAPI,
    private selectApi: SelectApi,
    public appService: AppService,
    public router: Router,
    private confirmModalService: ConfirmModalService,
    private settingService: ActivityStepService,
    private destroy$: DestroyService,
    private currencyService: CurrencyService,
    private articleApi: ArticleApi,
    public prizeService: PrizeService
  ) {
    const { id, code } = activatedRoute.snapshot.params; // 快照里的params参数
    const { tenantId } = activatedRoute.snapshot.queryParams; // 快照里的params参数
    const { sTime, eTime } = activatedRoute.snapshot.queryParams; // 快照里的params参数

    this.id = +id || 0;
    this.code = code || '';
    this.tenantId = tenantId;
    this.timeRange = [+sTime || 0, +eTime || 0];

    this.settingService.backList.pipe(takeUntil(this.destroy$)).subscribe(async () => {
      await this.compareFormValue();
      this.router.navigate([luckyRouletteInstance.link]);
    });
  }

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.selectApi.getCountry(),
      this.selectApi.getCategorySelect(this.tenantId, ['Online', 'Maintenance']), // Fitch: 2023-04-06 只显示上架和维护的厂商
      this.api.prize_getprizetypes(this.tenantId),
      from(this.currencyService.updateCurrency()),
      this.id
        ? this.api.turntable_getactivity(this.id, {
            merchantId: this.tenantId,
            lang: this.lang.currentLang,
          })
        : of(null),
      this.articleApi.getCustomListByKeys({
        tenantId: this.tenantId,
        source: MultiLangType.NA,
        keys: [String(this.id)],
      }),
      this.api.getTurntableType(this.tenantId).pipe(
        // 不受其他接口影响初始化大转盘格子数量
        tap((turntableType) => {
          // 商户配置 的模板2
          this.formGroup.controls.enableOverlayT2.setValue(
            // detail?.data.templateType === TurntableTemplateTypeEnum.Template2, // 正常switch滑块开关判断逻辑
            turntableType === TurntableTypeEnum.Grid16
          );

          this.prizeMaxChange(true); // 初始化格子数量
        })
      )
    ).subscribe(([country, providerList, typeList, currency, detail, levelTips]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.countryList = country;
      this.currencyList = currency;
      this.prizeTypeList = typeList?.data?.filter((e) => e.prizeTypeValue) || [];
      this.providerList = providerList;
      this.processLevelTips(levelTips);
      this.processDetail(detail?.data);
      this.onConditionChange();
      this.saveRecordFormGroup();
    });
  }

  id = 0; // 当前第三步的活动id
  code = '';
  editId = 0; // 活动步骤的id：ToLan  新增为0：Roger
  tenantId = '';
  timeRange: any[] = [];

  /** 获取条件 */
  condition = [
    // { name: '存款', value: TurntableCondition.deposit, lang: 'luckRoulette.getCondition.deposit' },
    // { name: '交易', value: TurntableCondition.validTransaction, lang: 'luckRoulette.getCondition.trans' },
    { name: '间隔时间', value: TurntableCondition.time, lang: 'luckRoulette.getCondition.waitTime' },
  ];

  /** 奖品的金额类型 */
  prizeAmountType = [
    { label: '固定金额', value: PrizeAmountType.Fixed, lang: 'common.amount' },
    { label: '按比例', value: PrizeAmountType.Rate, lang: 'common.proportion' },
  ];

  /** 转盘类型 */
  luckType = [
    { label: '普通', value: TurntableTemplate2LevelTypeEnum.General, lang: 'luckRoulette.optType.general' },
    { label: '白银', value: TurntableTemplate2LevelTypeEnum.Silver, lang: 'luckRoulette.optType.silver' },
    { label: '黄金', value: TurntableTemplate2LevelTypeEnum.Gold, lang: 'luckRoulette.optType.gold' },
    { label: '铂金', value: TurntableTemplate2LevelTypeEnum.Platinum, lang: 'luckRoulette.optType.platinum' },
    { label: '白钻', value: TurntableTemplate2LevelTypeEnum.Diamond, lang: 'luckRoulette.optType.diamond' },
    { label: '黄钻', value: TurntableTemplate2LevelTypeEnum.YellowDiamond, lang: 'luckRoulette.optType.yellowDiamond' },
    { label: '黑钻', value: TurntableTemplate2LevelTypeEnum.BlackDiamond, lang: 'luckRoulette.optType.blackDiamond' },
  ];

  TurntableCondition = TurntableCondition;

  /**
   * 模板2转盘选项数量
   */
  readonly template2PrizeMax = 16;

  /**
   * 转盘选项数量
   */
  readonly prizeMaxDefault = 12;

  /**
   * 奖品最大数量
   */
  prizeMax = 12;

  /** 奖品列表 */
  prizeList: Partial<TurntablePrize>[] = [...Array(this.prizeMax)];

  /**
   * 厂商列表
   */
  providerList: any[] = [];

  /**
   * 币种列表
   */
  currencyList: Currency[] = [];

  selectLang = ['zh-cn']; // PM:默认值CN
  curLang = 'zh-cn';

  /**
   * 已选奖品列表
   */
  prizeTypeList: PrizeTypeItem[] = [];

  /** 表单保存的初始值 - 用于检测是否被改动 */
  formGroupInitRecord: any = {};
  detailData: any = {};

  get isAdd() {
    return !this.editId;
  }

  get isEdit() {
    return !!this.editId;
  }

  get luckRoulette() {
    return this.formGroup.controls.luckRoulette;
  }

  /**
   * 当前概率
   */
  get currentProbability(): BigNumber {
    return this.formGroup.value.luckRoulette!.reduce((acc, cur) => acc.plus(cur.weight || 0), new BigNumber(0));
  }

  /**
   * 当前概率校验触碰
   */
  get currentProbabilityTouched(): boolean {
    return this.formGroup.controls.luckRoulette!.controls.every((e) => e.dirty || e.touched);
  }

  formGroup = this.fb.group({
    condition: [TurntableCondition.time], // 获取条件
    everyTimeDeposit: [0], // 每次存款金额
    drawTimes: [null as null | number, Validators.compose([Validators.required, Validators.min(1)])], // 抽奖次数
    transactionTime: [[] as Array<Date | null>], // 交易时间
    transactionTimeType: ['all' /* customRange */], // 交易时间类型
    depositType: ['transactionEvery' /* transactionEveryAmount */], // 是否每次交易
    everyTimeTransaction: [0], // 每次交易
    transactionMin: [0], // 单笔最低
    everyTimeTransactionAmount: [0], // 每次有效交易金额
    interval: [0], // 每次间隔时间(小时)
    currency: ['USDT'], // 币别
    luckRoulette: this.generateRoulette(), // 转盘

    // 转盘附加模板 - 模板2
    enableOverlayT2: [false], // 是否启用附加模板2
    t2Tips: this.fb.array([this.generateLanguage()]), // 模板2提示
    t2Level: [this.luckType[0]?.value ?? TurntableTemplate2LevelTypeEnum.General], // 转盘附加等级
  });

  countryList: ContinentCountryItem[] = [];
  countrySelectList: Country[] = [];

  prizeCodeInput$: Array<Observable<PrizeInfo[] | null>>;

  onSubmit(): void {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });
    if (this.luckRouletteInvalid())
      return this.appService.showToastSubject.next({
        msgLang: 'luckRoulette.winInsufficient',
        msgArgs: { total: '100%' },
      });

    this.appService.isContentLoadingSubject.next(true);
    this.api[this.isAdd ? 'turntable_create3' : 'turntable_update3']({
      id: this.editId,
      merchantId: this.tenantId,
      activityCode: this.code,
      startTime: this.timeRange[0] || 0,
      endTime: this.timeRange[1] || 0,
      conditionType: this.formGroup.value.condition!,
      drawTimes: +this.formGroup.value.drawTimes! || 0,
      perDeposit: +this.formGroup.value.everyTimeDeposit! || 0,
      transStartTime:
        this.formGroup.value.transactionTimeType === 'all'
          ? 0
          : this.formGroup.value.transactionTime?.[0]?.getTime() || 0,
      transEndTime:
        this.formGroup.value.transactionTimeType === 'all'
          ? 0
          : this.formGroup.value.transactionTime?.[1]?.getTime() || 0,
      perTransCount:
        this.formGroup.value.depositType === 'transactionEvery' ? +this.formGroup.value.everyTimeTransaction! || 0 : 0,
      transMin:
        this.formGroup.value.depositType === 'transactionEvery' ? +this.formGroup.value.transactionMin! || 0 : 0,
      transAmount:
        this.formGroup.value.depositType === 'transactionEveryAmount'
          ? +this.formGroup.value.everyTimeTransactionAmount! || 0
          : 0,
      interval: +this.formGroup.value.interval! || 0,
      currency: this.formGroup.value.currency!,
      // tipsSetting: {
      //   enabled: !!this.formGroup.value.enabledUnWin,
      //   icon: this.formGroup.value.unWinIcon || '',
      //   tips: this.formGroup.value.unWin as TurntableActivityTipItem[],
      // },
      scope: this.providerList.map((e) => ({
        categoryId: e.code,
        providerIds: e.providers?.filter((k) => k.checked).map((j) => j.providerId) || [],
      })),
      prizesSetting: this.prizeList,
      turntableSetting:
        this.formGroup.value.luckRoulette?.map<TurntableGame>((e) => ({
          id: e.id || 0, // 唯一识别码
          snNo: e.snNo!, // 转盘格子的序号（1~12）
          prizeId: e.prizeId!, // 奖品ID
          weight: new BigNumber(e.weight || 0).div(100).toNumber() || 0, // 每个奖品对应的中奖概率(乘以100后的数值)
          icon: e.icon || '',
        })) || [],

      // 模板2 附加内容
      templateType: this.getTemplateType(),
      level: this.formGroup.value.t2Level!,

      // 国家区域
      countryCode: this.countrySelectList.map((e) => e.countryCode).filter((e) => e),
    })
      .pipe(switchMap((res) => this.submitLevelTips(res)))
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res.success !== true) return this.appService.showToastSubject.next({ msgLang: 'common.operationFailed' });

        this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });
        this.router.navigate([luckyRouletteInstance.link]);
      });
  }

  /**
   * 提交等级提示语
   */
  submitLevelTips(res?) {
    return this.formGroup.value.enableOverlayT2
      ? this.articleApi
          .addOrUpdateCustom({
            tenantId: this.tenantId,
            source: MultiLangType.NA,
            list: [
              {
                key: String(this.id),
                infos:
                  this.formGroup.value.t2Tips?.map((e) => ({
                    lanageCode: e.lanageCode,
                    content: JSON.stringify({
                      levelTips: e.levelTips,
                    }),
                  })) || [],
              },
            ],
          })
          .pipe(
            tap((e) => !e && this.appService.toastOpera(e)),
            filter((e) => e),
            map(() => res)
          )
      : of(res);
  }

  /**
   * 获取模板类型
   */
  getTemplateType() {
    if (this.formGroup.value.enableOverlayT2) return TurntableTemplateTypeEnum.Template2; // 附加模板2
    return TurntableTemplateTypeEnum.Default;
  }

  /**
   * 处理等级提示语
   */
  processLevelTips(levelTips?: MultiLang[]) {
    levelTips = levelTips || [];

    if (!levelTips.length) return;
    const langInfo: MultiLangInfo<any>[] = levelTips[0].infos || [];
    const lang = langInfo.map((e) => e.lanageCode);

    this.selectLang = [...new Set(['zh-cn', ...lang])];
    this.formGroup.setControl('t2Tips', this.fb.array(langInfo.map((e) => this.generateLanguage(e.content))));
  }

  /**
   * 处理详情回显
   * @param data
   */
  processDetail(data?: any) {
    if (!data) return;
    this.detailData = data;
    this.editId = data.id;

    // 国家区域回显
    this.countrySelectList =
      data.countryCode
        ?.map((code) => ({
          ...this.countryList
            .find((e) => e.countries.some((j) => j.countryCode === code))
            ?.countries.find((e) => e.countryCode === code),
        }))
        .filter((e) => e) || [];

    // this.timeRange = [data.startTime, data.endTime];
    this.formGroup.patchValue({
      condition: data.conditionType,
      everyTimeDeposit: data.perDeposit || 0,
      transactionTimeType: data.transStartTime ? 'customRange' : 'all',
      transactionTime: [
        data.transStartTime ? new Date(data.transStartTime) : null,
        data.transEndTime ? new Date(data.transEndTime) : null,
      ],
      depositType: data.transAmount ? 'transactionEveryAmount' : 'transactionEvery',
      everyTimeTransaction: data.perTransCount || 0,
      transactionMin: data.transMin || 0,
      everyTimeTransactionAmount: data.transAmount || 0,
      interval: data.interval || 0,
      currency: data.currency || 'USDT',
      drawTimes: data.drawTimes || 0,
      t2Level: data.level,
    });

    // 交易记录厂商回显
    this.providerList.forEach((e) => {
      const item = data.scope.find((v) => e.code === v.categoryId);
      e.providers.forEach((j) => {
        j.checked = item?.providerIds?.includes(j.providerId) || false;
      });
    });

    // 转盘设置
    this.prizeMaxChange(true); // 更新转盘格子数量
    data.turntableSetting?.forEach((e) => {
      e.weight = new BigNumber(e.weight).multipliedBy(100).toNumber();
    });
    this.formGroup.setControl('luckRoulette', this.generateRoulette(data.turntableSetting, data.prizesSetting));
    this.prizeList = data.prizesSetting;
  }

  /**
   * 生成转盘表单
   * @param roulette
   * @param prizesSetting
   */
  generateRoulette(roulette?: TurntableGame[], prizesSetting?: TurntablePrizes[]) {
    const group = this.fb.array(
      Array.from({ length: this.prizeMax }, (_, i) => {
        const snNo = i + 1;
        const item: TurntableGame = roulette?.find((e) => e.snNo === snNo)!;
        const prize = prizesSetting?.find((e) => e.prizeId === item?.prizeId);

        return this.fb.group({
          id: [item?.id || 0], // 新增为0
          snNo: [item?.snNo || snNo],
          prizeId: [item?.prizeId || null, Validators.required],
          prizeCode: [item?.prizeCode || prize?.prizeCode || ''],
          weight: [item?.weight ?? ''],
          icon: [item?.icon || '', Validators.required],
        });
      }),
      { validators: this.probabilityValidator() }
    );

    // 奖品代码 - 自动完成输入流绑定
    this.prizeCodeInput$ = group.controls.map((e) =>
      e.controls.prizeCode.valueChanges.pipe(
        throttleTime(150) as any,
        filter((e: string) => e?.length === 8), // 券码输出文字的长度
        distinctUntilChanged(),
        switchMap((prizeCode: string) => this.api.prize_getprizesbycode(prizeCode).pipe(catchError(() => of(null)))),
        map((res) => (res?.data ? [res.data] : null))
      )
    );

    return group;
  }

  /**
   * 概率校验 总和为100
   */
  probabilityValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const total = control.value.reduce((acc, cur) => acc.plus(cur.weight || 0), new BigNumber(0));
      return total.toNumber() === 100
        ? null
        : { probability: true, ...(total.toNumber() > 100 ? { probabilityGT: true } : null) };
    };
  }

  /**
   * 概率校验
   */
  luckRouletteInvalid() {
    return this.currentProbability.toString() !== '100';
  }

  /**
   * 选择奖品
   */
  async onSelectPrize(item, i) {
    const modal = this.modalService.open<PrizeSelectComponent, any, Prize>(PrizeSelectComponent, {
      width: '1100px',
      disableClose: true,
      panelClass: 'cdk-overlay-pane-select-prize',
    });

    item &&
      modal.componentInstance.updateValue({
        type: item.value?.prizeType,
      });

    const prize: Partial<Prize> | undefined = await modal.result;

    if (prize) {
      let icon = this.getPathnameCurrencyIcon(prize.currency!);

      const prizeId = prize.id || 0;
      delete prize.id;

      // 实物奖品和装备奖品需要请求奖品详情获取图片
      if ([PrizeType.RealItem, PrizeType.Equipment].includes(prize.prizeType as PrizeType)) {
        icon = '';

        if (prize.prizeCode) {
          this.appService.isContentLoadingSubject.next(true);
          const prizeDetail = await lastValueFrom(
            this.api.prize_getprizesbycode(prize.prizeCode).pipe(
              catchError(() => of(null)),
              finalize(() => this.appService.isContentLoadingSubject.next(false))
            )
          );

          icon = prizeDetail?.data?.picture || '';
        }
      }

      if (i !== undefined) {
        const cur = this.prizeList[i];
        this.prizeList.splice(i, 1, { ...cur, ...prize, prizeId });
        this.formGroup.controls.luckRoulette.controls[i].patchValue(
          {
            prizeCode: prize.prizeCode,
          },
          {
            onlySelf: true,
            emitEvent: false, // 不要触发奖品代码的输入流而造成请求两次
          }
        );
        this.formGroup.controls.luckRoulette.controls[i].patchValue({
          prizeId,
          icon,
        }); // 这里要触发验证所以与上面分开patchValue
      } else {
        this.prizeList.push({ ...prize, prizeId });
      }
    }
  }

  /**
   * 获取币种图标相对地址
   * @param currency
   */
  getPathnameCurrencyIcon(currency: string | undefined | null): string {
    if (!currency) return '';
    const url = this.currencyList.find((e) => e.code === currency)?.icon;
    return getPathname(url);
  }

  /**
   * 查看示例
   */
  checkExample() {
    const ref = this.modalService.open(LuckyPreviewComponent, {
      width: '936px',
    });
    ref.componentInstance.id = this.id;
    ref.componentInstance.tenantId = this.tenantId;
    ref.componentInstance.list =
      this.formGroup.value.luckRoulette?.map((e, i) => {
        // 是否是数值类型
        const isNumValue = [PrizeType.Cash, PrizeType.Credit, PrizeType.AfterCash].includes(
          this.prizeList[i]?.prizeType || -1
        );

        let value = '';

        if (isNumValue) {
          value =
            this.prizeList[i]?.amountType === 2
              ? (this.prizeList[i]?.rate || this.prizeList[i]?.amount || 0) + '%'
              : (this.prizeList[i]?.amount || 0).toFixed(2);
        }

        return {
          icon: e.icon || '',
          currency: this.prizeList[i]?.currency || '',
          value,
        };
      }) || [];
  }

  async jump(lastPath: string) {
    await this.compareFormValue();
    return this.router.navigate(
      [`${luckyRouletteInstance.stepPath}/${lastPath}${this.isReadonly ? '-view' : ''}`, this.id, this.code],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          sTime: this.timeRange[0] || 0,
          eTime: this.timeRange[1] || 0,
        },
      }
    );
  }

  onBack() {
    this.jump('qualifications');
  }

  /**
   * 是否只读查看
   */
  @Input() isView = false;

  /** 是否只读查看 */
  get isReadonly() {
    return this.isView;
  }

  /**
   * 交易时间类型改变
   */
  transactionTimeTypeChange() {
    const isRange =
      this.formGroup.value.condition === TurntableCondition.validTransaction &&
      this.formGroup.value.transactionTimeType === 'customRange';

    const rangeControl = this.formGroup.controls.transactionTime;
    rangeControl.setValidators(isRange ? Validators.required : null);
    rangeControl.updateValueAndValidity();
  }

  /**
   * 存款
   */
  depositChange() {
    const isDeposit = this.formGroup.value.condition === TurntableCondition.deposit;

    const depositControl = this.formGroup.controls.everyTimeDeposit;
    depositControl.setValidators(isDeposit ? validatorNumberRequired : null);
    depositControl.updateValueAndValidity();
  }

  /**
   * 存款状态
   */
  transactionDepositChange() {
    const isTransaction = this.formGroup.value.condition === TurntableCondition.validTransaction;
    const isEveryTime = this.formGroup.value.depositType === 'transactionEvery';
    const isEveryTimeAmount = this.formGroup.value.depositType === 'transactionEveryAmount';

    const transactionControl = this.formGroup.controls.everyTimeTransaction; // 每次存款
    const transactionMinControl = this.formGroup.controls.transactionMin; // 存款最小金额
    const transactionAmountControl = this.formGroup.controls.everyTimeTransactionAmount; // 每次有效存款金额
    transactionControl.setValidators(isTransaction && isEveryTime ? validatorNumberRequired : null);
    transactionMinControl.setValidators(isTransaction && isEveryTime ? validatorNumberRequired : null);
    transactionAmountControl.setValidators(isTransaction && isEveryTimeAmount ? validatorNumberRequired : null);

    transactionControl.updateValueAndValidity();
    transactionMinControl.updateValueAndValidity();
    transactionAmountControl.updateValueAndValidity();
  }

  /**
   * 间隔时间
   */
  intervalChange() {
    const isInterval = this.formGroup.value.condition === TurntableCondition.time;
    const intervalControl = this.formGroup.controls.interval;

    intervalControl.setValidators(isInterval ? validatorNumberRequired : null);
    intervalControl.updateValueAndValidity();
  }

  /**
   * 获取抽奖次数条件改变
   */
  onConditionChange() {
    this.depositChange();
    this.transactionDepositChange();
    this.transactionTimeTypeChange();
    this.intervalChange();
  }

  /**
   * 保存作为初始值
   */
  saveRecordFormGroup() {
    this.formGroupInitRecord = cloneDeep({
      ...this.formGroup.value,
      providerList: this.providerList,
      startTime: this.detailData.startTime,
      endTime: this.detailData.endTime,
    });
  }

  /**
   * 对比表单弹出提示
   */
  async compareFormValue() {
    if (this.isReadonly) return undefined;

    const currentValue = cloneDeep({
      ...this.formGroup.value,
      providerList: this.providerList,
      startTime: 0,
      endTime: 0,
    });
    const recordValue = cloneDeep({ ...this.formGroupInitRecord, startTime: 0, endTime: 0 });

    const equalValue = isEqual(currentValue, recordValue);
    const timeEqualValue =
      isEqual(this.formGroupInitRecord.startTime, this.timeRange[0]) &&
      isEqual(this.formGroupInitRecord.endTime, this.timeRange[1]);

    if (equalValue && timeEqualValue) return Promise.resolve(true);

    return this.confirmModalService.open({
      msgLang: 'luckRoulette.unsaved',
      msgArgs: { name: this.isEdit && equalValue && !timeEqualValue ? await this.lang.getOne('common.time') : '' },
    }).result;
  }

  /**
   * 自动完成选择奖券
   * @param event
   * @param formGroup
   * @param i
   */
  onPrizeCode({ option: { value } }: MatAutocompleteSelectedEvent, formGroup: FormGroup, i: number) {
    const prize: PrizeInfo = value;
    let icon = [PrizeType.RealItem, PrizeType.Equipment].includes(prize.prizeType) // 实物、奖品
      ? prize.picture
      : this.getPathnameCurrencyIcon(prize.currency);

    this.prizeList[i] = cloneDeep({
      ...prize,
      prizeId: prize.id,
      prizeName: prize.prizeName.find((e) => e.lang === 'zh-cn')?.prizeShortName,
    }) as any;

    formGroup.patchValue({
      prizeCode: prize.prizeCode,
      prizeId: prize.id,
      icon,
    });
  }

  /**
   * 中奖记录
   */
  onRecord() {
    const ref = this.modalService.open(DrawRecordComponent, { width: '1100px' });

    ref.componentInstance.id = this.editId;
    ref.componentInstance.merchantId = this.tenantId;
    ref.componentInstance.isModal = true;
  }

  /**
   * 根据设置更新转盘格子数量
   * @description 后期可扩展
   */
  prizeMaxChange(updateControl = false) {
    this.onTemplate2(updateControl);
  }

  /**
   * 是否开启模板2
   * @description 定制：只能用于特定商户，其他商户不可用
   */
  onTemplate2(updateControl = true) {
    const enabled = this.formGroup.value.enableOverlayT2;

    this.setOptionCount(enabled ? this.template2PrizeMax : this.prizeMaxDefault, updateControl);
  }

  /**
   * 设置转盘选项数量
   */
  setOptionCount(v = 12, updateControl = true) {
    this.prizeMax = v;
    this.prizeList = [...(this.prizeList || []), ...Array(this.prizeMax)].slice(0, this.prizeMax);
    updateControl &&
      this.formGroup.setControl(
        'luckRoulette',
        this.generateRoulette(cloneDeep(this.formGroup.value.luckRoulette) as any, this.detailData.prizesSetting)
      );
  }

  /**
   * 更新语言表单
   * @param selectLang
   * @param control
   */
  updateLanguageForm(selectLang: string[], control) {
    const prevValue = cloneDeep(control.value.t2Tips);
    const langArray = selectLang.map((lanageCode) =>
      this.generateLanguage({
        lanageCode,
        levelTips: '',
        ...prevValue.find((e) => e.lanageCode === lanageCode), // 把之前的值保留下来
      })
    );

    control.setControl('t2Tips', this.fb.array(langArray, Validators.compose([])));
  }

  /**
   * 生成语言表单
   */
  generateLanguage(data?: any | undefined) {
    return this.fb.group({
      levelTips: [data?.levelTips || ''],
      lanageCode: [data?.lanageCode || 'zh-cn'],
    });
  }

  /**
   * 打开选择国家弹窗
   */
  openAddPopupCountry() {
    const type = 'area';
    const modalRef = this.modalService.open(AddPopupComponent, { width: '776px' });
    modalRef.componentInstance['type'] = type;
    modalRef.componentInstance['list'] = this.countryList;
    modalRef.componentInstance['selectedList'] = this.countrySelectList;
    modalRef.componentInstance.confirm.subscribe((selList) => {
      this.countrySelectList = selList;
    });
  }
}

@Component({
  selector: 'edit-view',
  standalone: true,
  imports: [LuckyRouletteEditComponent],
  template: '<base-edit [isView]="true"></base-edit>',
})
export class EditViewComponent {}
