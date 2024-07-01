import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DismissCloseDirective,
  ModalFooterComponent,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
import { PrizeConfigPipe } from 'src/app/pages/Bonus/bonus.service';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { LabelComponent } from 'src/app/shared/components/label/label.component';
import { MatMenuModule } from '@angular/material/menu';
import { SelectGroupComponent } from 'src/app/shared/components/select-group/select-group.component';
import { AppService } from 'src/app/app.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { FormFullDirective, FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { SelectApi } from 'src/app/shared/api/select.api';
import { Country } from 'src/app/shared/interfaces/select.interface';
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { Currency } from 'src/app/shared/interfaces/currency';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { takeUntil } from 'rxjs/operators';
import { finalize, lastValueFrom, zip } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import { InputFloatDirective, InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
// import { validatorArrayRequired } from 'src/app/shared/models/validator';
import { PaymentMethodItem } from 'src/app/shared/interfaces/payment-method-management';
import { VipApi } from 'src/app/shared/api/vip.api';
import { RuleService } from 'src/app/pages/finance/withdrawals/withdrawals-config/rule.service';
import { cloneDeep } from 'lodash';
import { ExcludeNullable } from 'src/app/shared/interfaces/base.interface';
import {
  WithdrawalStrategyItem,
  WithdrawalStrategyKycEnum,
  WithdrawalStrategyKycObjEnum,
} from 'src/app/shared/interfaces/withdrawals';
import { RiskLevelItem } from 'src/app/shared/interfaces/risk';

/**
 * 提款配置 - 条件枚举
 */
export enum WithdrawalConditionEnum {
  testAccount = 'isTest', // 是否测试账号
  firstWithdrawal = 'firstWithdrawal', // 是否首提
  firstWithdrawalAttempt = 'firstWithdrawalAttempt', // 首次提款尝试（失败/过期/未分配到PSP）
  ipAddress = 'ipAddress', // IP地址
  ipCountry = 'ipCountry', // IP国家
  registryCountry = 'registryCountry', // 用户注册国家
  locationMatch = 'locationMatch', // 地址符合
  ngrComparison = 'ngrComparison', // NGR比较
  ngrValue = 'ngrValue', // NGR值
  ngrIsNegative = 'ngrIsNegative', // NGR负数
  kycLevel = 'kycLevels', // KYC状态多选
  riskLevel = 'riskControls', // 风控级别
  amountMorethen = 'amountMorethen', // 交易金额大于 - 单笔
  amountLessthen = 'amountLessthen', // 交易金额小于 - 单笔
  currency = 'currencyType', // 交易币种
  totalWithdrawalGt = 'totalAmountMorethen', // 总提款金额大于
  totalWithdrawalLe = 'totalAmountLessthen', // 总提款金额小于
  paymentMethod = 'paymentMethod', // 支付方式
  vipLevelMorethen = 'vipLevelMorethen', // vip等级大于
  vipLevelLessthen = 'vipLevelLessthen', // vip等级小于
  totalWithdrawalCount = 'totalWithdrawalCount', // 总成功提款笔数
  totalTime = 'totalTime', // 时间
  timeUnit = 'timeUnit', // 时间单位

  // 自定义的
  vipLevel = 'vipLevel', // VIP级别
  total = 'total', // 总计
  ngr = 'ngr', // NGR
}

/**
 * 提款配置 - 动作枚举
 */
export enum WithdrawalActionEnum {
  approval = 'operation', // 审核操作
  approvedMethod = 'auditOperationMethod', // 审核操作方式
  time = 'delay', // 延迟时间 延迟时间设定 如果是 0 表示立即执行
  timeUnit = 'timeUnit', // 时间单位
}

/**
 * 提款配置 - NGR比较枚举
 */
export enum NgrComparisonEnum {
  GreateThen = 0, // 大于
  LessThen = 1, // 小于
  EqualTo = 2, // 等于
}

export const yesOrNo = [
  { name: '是', lang: 'finance.yes', value: true },
  { name: '否', lang: 'finance.no', value: false },
];

export const operationList = [
  { name: '通过', lang: 'finance.rule.approve', value: 'Approved' },
  { name: '拒绝', lang: 'finance.rule.deny', value: 'NoApproved' },
];

export const operationMethodList = [
  { name: '自动', lang: 'finance.rule.auto', value: 'Auto' },
  { name: '一审', lang: 'finance.rule.approve1', value: 'First' },
  { name: '二审', lang: 'finance.rule.approve2', value: 'Secend' },
];

export const kycLevelList = [
  { name: '初级认证', lang: 'finance.rule.kyc1Suc', value: WithdrawalStrategyKycObjEnum.KycPrimary },
  { name: '中级验证', lang: 'finance.rule.kyc2Suc', value: WithdrawalStrategyKycObjEnum.KycIntermediat },
  { name: '高级验证', lang: 'finance.rule.kyc3Suc', value: WithdrawalStrategyKycObjEnum.KycAdvanced },
];

export const timeUnitList = [
  { name: '分钟', lang: 'finance.rule.minutes', value: 'Minute' },
  { name: '小时', lang: 'finance.rule.hours', value: 'Hour' },
  { name: '天', lang: 'finance.rule.day', value: 'Day' },
];

export const ngrComparisonList = [
  { name: '大于', lang: 'finance.rule.ngrGt', value: NgrComparisonEnum.GreateThen },
  { name: '小于', lang: 'finance.rule.ngrEt', value: NgrComparisonEnum.LessThen },
  { name: '等于', lang: 'finance.rule.ngrEq', value: NgrComparisonEnum.EqualTo },
];

@Component({
  selector: 'rule-edit',
  standalone: true,
  imports: [
    CommonModule,
    DismissCloseDirective,
    EmptyComponent,
    FormRowComponent,
    FormatMoneyPipe,
    FormsModule,
    LangPipe,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    ModalFooterComponent,
    ModalTitleComponent,
    PaginatorComponent,
    PrizeConfigPipe,
    ReactiveFormsModule,
    TimeFormatPipe,
    AngularSvgIconModule,
    LabelComponent,
    MatMenuModule,
    SelectGroupComponent,
    FormWrapComponent,
    FormFullDirective,
    VipNamePipe,
    SearchInpDirective,
    SearchDirective,
    InputNumberDirective,
    LoadingDirective,
    InputFloatDirective,
  ],
  templateUrl: './rule-edit.component.html',
  styleUrls: ['./rule-edit.component.scss'],
  providers: [DestroyService],
})
export class RuleEditComponent implements OnInit {
  constructor(
    private subHeader: SubHeaderService,
    public modal: MatModalRef<RuleEditComponent>,
    private fb: FormBuilder,
    private appService: AppService,
    private lang: LangService,
    private selectApi: SelectApi,
    private assetApi: AssetApi,
    private vipApi: VipApi,
    public ruleService: RuleService,
    private destroy$: DestroyService
  ) {
    this.conditionList.forEach(async (e) => {
      e.lang = (await this.lang.getOne('finance.rule.' + e.lang)) || '-';
    });
    this.actionList.forEach(async (e) => {
      e.lang = (await this.lang.getOne(e.lang)) || '-';
    });
  }

  /********************************************************************
   * 组件参数 通过modal传入
   ********************************************************************/
  groupId = this.ruleService.curGroupId;
  num = 0;
  riskLevelList: RiskLevelItem[] = [];
  editIndex = -1;

  /********************************************************************
   * 成员属性
   ********************************************************************/
  protected readonly WithdrawalConditionEnum = WithdrawalConditionEnum;
  protected readonly ngrComparisonList = ngrComparisonList;

  dataLoading = false;
  showEditCondition = false;
  showEditAction = false;
  conditionList = [
    { name: '测试账号', lang: 'isTest', field: WithdrawalConditionEnum.testAccount },
    { name: '是否首提', lang: 'firstWithdrawal', field: WithdrawalConditionEnum.firstWithdrawal },
    { name: '首次提款尝试', lang: 'firstWithdrawalAttempt', field: WithdrawalConditionEnum.firstWithdrawalAttempt },
    { name: 'IP地址', lang: 'ipAddress', field: WithdrawalConditionEnum.ipAddress },
    { name: 'IP国家', lang: 'ipCountry', field: WithdrawalConditionEnum.ipCountry },
    // { name: 'IP注册国家', lang: 'ipRegistryCountry', field: WithdrawalConditionEnum.registryCountry },
    {
      name: 'NGR',
      lang: 'ngr',
      field: WithdrawalConditionEnum.ngr,
      oneGroup: true, // 是否只有一组
      children: [
        { name: 'NGR比较', lang: '', field: WithdrawalConditionEnum.ngrComparison },
        { name: 'NGR值', lang: '', field: WithdrawalConditionEnum.ngrValue },
      ],
    },
    { name: 'NGR负数', lang: 'ngrIsNegative', field: WithdrawalConditionEnum.ngrIsNegative },
    { name: '风控等级', lang: 'riskControls', field: WithdrawalConditionEnum.riskLevel },
    { name: 'KYC状态', lang: 'kycLevel', field: WithdrawalConditionEnum.kycLevel },
    { name: '交易金额大于（单笔）', lang: 'amountMorethen', field: WithdrawalConditionEnum.amountMorethen },
    { name: '交易金额大于（单笔）', lang: 'amountLessthen', field: WithdrawalConditionEnum.amountLessthen },
    { name: '交易币种', lang: 'currencyType', field: WithdrawalConditionEnum.currency },
    { name: '支付方式', lang: 'paymentMethod', field: WithdrawalConditionEnum.paymentMethod },
    {
      name: 'VIP级别',
      lang: 'vipLevel',
      field: WithdrawalConditionEnum.vipLevel,
      children: [
        { name: 'vip等级小于', lang: 'vipLevelLessthen', field: WithdrawalConditionEnum.vipLevelLessthen },
        { name: 'vip等级大于', lang: 'vipLevelMorethen', field: WithdrawalConditionEnum.vipLevelMorethen },
      ],
    },
    {
      name: '总计',
      lang: 'total',
      field: WithdrawalConditionEnum.total,
      children: [
        { name: '总成功提款笔数', lang: 'totalWithdrawalCount', field: WithdrawalConditionEnum.totalWithdrawalCount },
        { name: '总提款金额小于', lang: 'totalAmountLessthen', field: WithdrawalConditionEnum.totalWithdrawalLe },
        { name: '总提款金额大于', lang: 'totalAmountMorethen', field: WithdrawalConditionEnum.totalWithdrawalGt },
        { name: '时间', lang: 'totalTime', field: WithdrawalConditionEnum.totalTime },
        { name: '时间单位', lang: 'timeUnit', field: WithdrawalConditionEnum.timeUnit },
      ],
    },
  ];

  actionList = [
    { name: '审核操作', lang: 'finance.rule.approval', field: WithdrawalActionEnum.approval },
    { name: '审核方式', lang: 'finance.rule.approvalMethod', field: WithdrawalActionEnum.approvedMethod },
    { name: '审核时间', lang: 'finance.rule.time', field: WithdrawalActionEnum.time },
  ];

  conditionSelect: typeof this.conditionList = [];
  conditionSelectField = this.conditionSelect.map((e) => e.field);
  actionSelect: typeof this.actionList = [];
  actionSelectField = this.actionSelect.map((e) => e.field);
  countryList: Country[] = [];
  currencyList: Currency[] = [];
  paymentMethodList: PaymentMethodItem[] = [];

  yesOrNo = yesOrNo;
  operationList = operationList;
  operationMethodList = operationMethodList;
  kycLevelList = kycLevelList;
  timeUnitList = timeUnitList;

  /**
   * 表单 formControl 字段Parker开发时会变化，这里用枚举去定义接口字段
   */
  form = this.fb.group({
    policyName: ['', Validators.required],
    remark: [''],
    enabled: [true],
    condition: this.fb.group({
      [WithdrawalConditionEnum.testAccount]: [{ value: true, disabled: true }], // 测试账号
      [WithdrawalConditionEnum.firstWithdrawal]: [{ value: true, disabled: true }], // 是否首提
      [WithdrawalConditionEnum.firstWithdrawalAttempt]: [{ value: true, disabled: true }], // 首次提款尝试（失败/过期/未分配到PSP）
      [WithdrawalConditionEnum.ngrIsNegative]: [{ value: true, disabled: true }], // NGR负数
      [WithdrawalConditionEnum.ipAddress]: [{ value: '', disabled: true } /*, validatorIP('', true, true)*/], // IP地址 TODO IP校验有bug包括GoMoney
      [WithdrawalConditionEnum.ipCountry]: [{ value: [] as string[], disabled: true } /*, validatorArrayRequired*/], // 国家IP
      [WithdrawalConditionEnum.registryCountry]: [{ value: [], disabled: true } /*, validatorArrayRequired*/], // 用户注册国家IP
      // [WithdrawalConditionEnum.locationMatch]: [{ value: '', disabled: true }], // 地址符合
      [WithdrawalConditionEnum.kycLevel]: [
        { value: [] as WithdrawalStrategyKycEnum[], disabled: true },
        Validators.required,
      ], // KYC等级
      [WithdrawalConditionEnum.riskLevel]: [{ value: [] as string[], disabled: true }], // 风控等级
      [WithdrawalConditionEnum.amountMorethen]: [{ value: '' as string | number, disabled: true }], // 交易金额大于 - 单笔
      [WithdrawalConditionEnum.amountLessthen]: [{ value: '' as string | number, disabled: true }], // 交易金额小于 - 单笔
      [WithdrawalConditionEnum.currency]: [{ value: '', disabled: true }], // 交易币种
      [WithdrawalConditionEnum.paymentMethod]: [{ value: '', disabled: true }], // 支付方式

      // NGR
      [WithdrawalConditionEnum.ngr]: this.fb.group({
        [WithdrawalConditionEnum.ngrComparison]: [
          { value: '' as string | number, disabled: true },
          Validators.required,
        ], // NGR比较
        [WithdrawalConditionEnum.ngrValue]: [{ value: '' as string | number, disabled: true }], // NGR值
      }),

      // VIP等级
      [WithdrawalConditionEnum.vipLevel]: this.fb.group({
        [WithdrawalConditionEnum.vipLevelMorethen]: [{ value: '' as string | number, disabled: true }], // vip等级大于
        [WithdrawalConditionEnum.vipLevelLessthen]: [{ value: '' as string | number, disabled: true }], // vip等级小于
      }),

      // 总计
      total: this.fb.group({
        [WithdrawalConditionEnum.totalWithdrawalCount]: [{ value: '' as string | number, disabled: true }], // 总成功提款笔数
        [WithdrawalConditionEnum.totalWithdrawalGt]: [{ value: '' as string | number, disabled: true }], // 总提款金额大于(范围时间内)
        [WithdrawalConditionEnum.totalWithdrawalLe]: [{ value: '' as string | number, disabled: true }], // 总提款金额小于(范围时间内)
        [WithdrawalConditionEnum.totalTime]: [{ value: '' as string | number, disabled: true }], // 总提款金额小于(范围时间内)
        [WithdrawalConditionEnum.timeUnit]: [{ value: this.timeUnitList[0].value, disabled: true }], // 总提款金额小于(范围时间内)
      }),
    }),
    action: this.fb.group({
      [WithdrawalActionEnum.approval]: [{ value: this.operationList[0].value, disabled: true }], // 审核操作
      [WithdrawalActionEnum.approvedMethod]: [{ value: this.operationMethodList[0].value, disabled: true }], // 审核操作方式
      [WithdrawalActionEnum.time]: [{ value: '', disabled: true }], // 延迟时间 延迟时间设定 如果是 0 表示立即执行
      [WithdrawalActionEnum.timeUnit]: [{ value: this.timeUnitList[0].value, disabled: true }], // 时间单位
    }),
  });

  protected readonly ActionEnum = WithdrawalActionEnum;

  get totalControl() {
    return this.form.controls.condition.controls.total;
  }

  get isActionAuto() {
    return (
      this.form.controls.action.controls[WithdrawalActionEnum.approval].value === 'Approved' &&
      this.form.controls.action.controls[WithdrawalActionEnum.approvedMethod].value === 'Auto'
    );
  }

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dataLoading = true;
      zip([
        this.selectApi.getCountryFlat(),
        this.selectApi.getCurrencySelect(),
        this.assetApi.getPayMethodsList({ tenantId: this.subHeader.merchantCurrentId }),
      ])
        .pipe(finalize(() => (this.dataLoading = false)))
        .subscribe(([countryList, currencyList, paymentMethodList]) => {
          this.countryList = countryList;
          this.currencyList = currencyList;
          this.paymentMethodList = Array.isArray(paymentMethodList?.list) ? paymentMethodList.list : [];
        });
    });
  }

  /**
   * 条件改变
   * @param value
   * @param isSelChildren {boolean} 是否选中所有子集
   */
  onConditionChange(value: typeof this.conditionList, isSelChildren?: boolean) {
    if (!value.length) {
      this.form.controls.condition.disable();
      this.form.controls.condition.updateValueAndValidity();
    } else {
      this.conditionList.forEach((e) => {
        const opera = value.some((j) => j.field === e.field) ? 'enable' : 'disable';
        switch (e.field) {
          case WithdrawalConditionEnum.total:
            this.form.controls.condition.controls[e.field]?.[opera]();

            if (isSelChildren) {
              // 先全禁止，通过子集来开放
              this.form.controls.condition.controls[e.field]?.disable();
              let selTotal = value.find((b) => b.field === WithdrawalConditionEnum.total);

              selTotal?.children?.forEach((j) => {
                this.form.controls.condition.controls[e.field].controls[j.field].enable();
                this.form.controls.condition.controls[e.field].controls[j.field].updateValueAndValidity();
              });
            }

            this.form.controls.condition.controls[e.field]?.updateValueAndValidity();
            break;
          default:
            this.form.controls.condition.controls[e.field]?.[opera]();
            this.form.controls.condition.controls[e.field]?.updateValueAndValidity();
            break;
        }
      });
    }

    // 先设置control，最后再赋值进行渲染
    this.conditionSelect = value;
    this.conditionSelectField = this.conditionSelect.map((e) => e.field);
  }

  onActionChange(value: typeof this.actionList) {
    if (!value.length) {
      this.form.controls.action.disable();
      this.form.controls.action.updateValueAndValidity();
    } else {
      this.actionList.forEach((e) => {
        const opera = value.some((j) => j.field === e.field) ? 'enable' : 'disable';
        switch (e.field) {
          case WithdrawalActionEnum.time:
            this.form.controls.action.controls[WithdrawalActionEnum.time]?.[opera]();
            this.form.controls.action.controls[WithdrawalActionEnum.time]?.updateValueAndValidity();
            this.form.controls.action.controls[WithdrawalActionEnum.timeUnit]?.[opera]();
            this.form.controls.action.controls[WithdrawalActionEnum.timeUnit]?.updateValueAndValidity();
            break;
          default:
            this.form.controls.action.controls[e.field]?.[opera]();
            this.form.controls.action.controls[e.field]?.updateValueAndValidity();
            break;
        }
      });
    }

    // 先设置control，最后再赋值进行渲染
    this.actionSelect = value;
    this.actionSelectField = this.actionSelect.map((e) => e.field);
    this.checkUpdateAction();
  }

  async onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });

    const conditions = cloneDeep(this.form.value.condition);
    const actions = cloneDeep(this.form.value.action);

    if (!conditions) {
      return this.appService.showToastSubject.next({ msgLang: 'finance.rule.conditionCannotEmpty' });
    }

    if (!actions) {
      return this.appService.showToastSubject.next({ msgLang: 'finance.rule.actionCannotEmpty' });
    }

    if (!actions[WithdrawalActionEnum.approval]) {
      const label = await this.lang.getOne('finance.rule.approval');
      return this.appService.showToastSubject.next({ msgLang: 'form.chooseTips', msgArgs: { label } });
    }

    // 通过 -> 审核方式需要必填
    if (actions[WithdrawalActionEnum.approval] === 'Approved' && !actions[WithdrawalActionEnum.approvedMethod]) {
      const label = await this.lang.getOne('finance.rule.approvalMethod');
      return this.appService.showToastSubject.next({ msgLang: 'form.chooseTips', msgArgs: { label } });
    }

    // 通过 -> 审核方式需要必填
    // if (actions[WithdrawalActionEnum.approvedMethod] === 'Auto') {
    //   const label = await this.lang.getOne('finance.rule.approvalMethod');
    //   return this.appService.showToastSubject.next({ msgLang: 'form.chooseTips', msgArgs: { label } });
    // }

    // 如果是自动审核，延迟时间必填
    if (this.isActionAuto && !actions[WithdrawalActionEnum.time]) {
      let label = await this.lang.getOne('finance.withdrawConf.actions');
      label += await this.lang.getOne('finance.rule.time');
      return this.appService.showToastSubject.next({ msgLang: 'form.chooseTips', msgArgs: { label } });
    }

    const sendData = {
      ...(cloneDeep(this.form.value) as ExcludeNullable<typeof this.form.value>),
      tenantId: +this.subHeader.merchantCurrentId,
      groupId: this.groupId,
      enabled: this.form.value.enabled!,
      withdrawalConditions: {
        ...conditions,
        ...conditions!.total,
        total: undefined,
        ...conditions!.vipLevel,
        vipLevel: undefined,
        ...conditions.ngr,
        ngr: undefined,
      } as any,
      withdrawalActions: cloneDeep(this.form.value.action) as any,
    };

    delete sendData.condition;
    delete sendData.action;

    const isEdit = this.editIndex > -1;
    this.appService.isContentLoadingSubject.next(true);
    const res = await lastValueFrom(
      (isEdit ? this.ruleService.editRule$(sendData, this.editIndex) : this.ruleService.addRule$(sendData)).pipe(
        finalize(() => this.appService.isContentLoadingSubject.next(false))
      )
    );
    res === true && this.modal.close(true);
  }

  /**
   * 删除条件
   */
  onConditionDelRule(
    i: number,
    condition: (typeof this.conditionList)[0],
    key?: Array<keyof typeof WithdrawalConditionEnum>
  ) {
    if (key) {
      const parentGroup = this.form.controls.condition.controls[condition.field];

      key?.forEach((k) => {
        parentGroup.controls[k].disable();
        parentGroup.controls[k].updateValueAndValidity();
      });

      // 还有其他子集被选中，不删除
      if (parentGroup.status !== 'DISABLED') return;
    }

    this.form.controls.condition.controls[condition.field].disable();
    this.form.controls.condition.controls[condition.field].updateValueAndValidity();
    this.conditionSelect.splice(i, 1);
    this.conditionSelectField = this.conditionSelect.map((e) => e.field);
  }

  /**
   * 删除动作
   */
  onActionDelAction(action: (typeof this.actionList)[0], i: number) {
    this.form.controls.action.controls[action.field].disable();
    this.form.controls.action.controls[action.field].updateValueAndValidity();
    this.actionSelect.splice(i, 1);
    this.actionSelectField = this.actionSelect.map((e) => e.field);
  }

  /**
   * 初始数据
   */
  setData(data: WithdrawalStrategyItem, i?: number) {
    this.editIndex = i === undefined ? -1 : i;

    const condition = data.withdrawalConditions as Required<typeof data.withdrawalConditions>;
    const action = data.withdrawalActions as Required<typeof data.withdrawalActions>;

    this.form.patchValue({
      policyName: data.policyName || '',
      remark: data.remark || '',
      enabled: data.enabled,
      condition: {
        ...condition,

        // VIP等级
        [WithdrawalConditionEnum.vipLevel]: {
          [WithdrawalConditionEnum.vipLevelMorethen]: condition[WithdrawalConditionEnum.vipLevelMorethen], // vip等级大于
          [WithdrawalConditionEnum.vipLevelLessthen]: condition[WithdrawalConditionEnum.vipLevelLessthen], // vip等级小于
        },

        // NGR
        [WithdrawalConditionEnum.ngr]: {
          [WithdrawalConditionEnum.ngrComparison]:
            NgrComparisonEnum[condition[WithdrawalConditionEnum.ngrComparison]] ?? null, // NGR比较
          [WithdrawalConditionEnum.ngrValue]: condition[WithdrawalConditionEnum.ngrValue], // NGR值
        },

        // 总计
        total: {
          [WithdrawalConditionEnum.totalWithdrawalCount]: condition[WithdrawalConditionEnum.totalWithdrawalCount], // 总成功提款笔数
          [WithdrawalConditionEnum.totalWithdrawalGt]: condition[WithdrawalConditionEnum.totalWithdrawalGt], // 总提款金额大于(范围时间内)
          [WithdrawalConditionEnum.totalWithdrawalLe]: condition[WithdrawalConditionEnum.totalWithdrawalLe], // 总提款金额小于(范围时间内)
          [WithdrawalConditionEnum.totalTime]: condition[WithdrawalConditionEnum.totalTime], // 总提款金额小于(范围时间内)
          [WithdrawalConditionEnum.timeUnit]: condition[WithdrawalConditionEnum.timeUnit] || 'Minute', // 总提款金额小于(范围时间内)
        },
      },
      action: {
        [WithdrawalActionEnum.approval]: data.withdrawalActions[WithdrawalActionEnum.approval], // 审核操作
        [WithdrawalActionEnum.approvedMethod]: data.withdrawalActions[WithdrawalActionEnum.approvedMethod], // 审核操作方式
        [WithdrawalActionEnum.time]: String(data.withdrawalActions[WithdrawalActionEnum.time] || '0'), // 延迟时间 延迟时间设定 如果是 0 表示立即执行
        [WithdrawalActionEnum.timeUnit]: data.withdrawalActions[WithdrawalActionEnum.timeUnit] || 'Minute', // 时间单位
      },
    });

    this.onConditionChange(
      cloneDeep(
        this.conditionList
          .filter((e) => {
            // 如果有分组判断子集是否有选中
            if (e.children?.length) {
              return e.children.some((f) => ![null, undefined].includes(condition[f.field] as any));
            }
            return ![null, undefined].includes(condition[e.field]);
          })
          .map((e) => {
            const cur = cloneDeep(e);

            // 挂子集开放、禁用
            if (e.field === WithdrawalConditionEnum.total) {
              cur.children = cur.children?.filter((e) => ![null, undefined].includes(condition[e.field] as any));
            }

            return cur;
          })
      ),
      true // 根据子集选中，而不是直接选中所有
    );
    this.onActionChange(
      this.actionList
        .filter((e) => ![null, undefined].includes(action[e.field] as any))
        .filter((e) =>
          [WithdrawalActionEnum.time, WithdrawalActionEnum.timeUnit].includes(e.field)
            ? this.form.controls.action.controls[WithdrawalActionEnum.approvedMethod].value === 'Auto'
            : true
        )
    );
  }

  /**
   * 检测操作
   */
  checkUpdateAction() {
    if (
      this.form.controls.action.value[WithdrawalActionEnum.approval] === 'Approved' &&
      this.form.controls.action.value[WithdrawalActionEnum.approvedMethod] === 'Auto' &&
      this.form.controls.action.controls[WithdrawalActionEnum.time].status !== 'DISABLED'
    ) {
      this.form.controls.action.controls[WithdrawalActionEnum.time].enable();
      this.form.controls.action.controls[WithdrawalActionEnum.timeUnit].enable();
    } else {
      this.form.controls.action.controls[WithdrawalActionEnum.time].disable();
      this.form.controls.action.controls[WithdrawalActionEnum.timeUnit].disable();
    }

    // 拒绝：操作类型也要禁用
    if (
      this.form.controls.action.controls[WithdrawalActionEnum.approvedMethod].status === 'DISABLED' ||
      this.form.controls.action.value[WithdrawalActionEnum.approval] === 'NoApproved'
    ) {
      this.form.controls.action.controls[WithdrawalActionEnum.approvedMethod].disable();
    } else {
      this.form.controls.action.controls[WithdrawalActionEnum.approvedMethod].enable();
    }

    this.form.controls.action.controls[WithdrawalActionEnum.approvedMethod].updateValueAndValidity();
    this.form.controls.action.controls[WithdrawalActionEnum.time].updateValueAndValidity();
    this.form.controls.action.controls[WithdrawalActionEnum.timeUnit].updateValueAndValidity();
  }

  /**
   * 操作类型改变
   */
  onActionOperaChange() {
    // 操作方式禁用
    // this.form.controls.action.controls[WithdrawalActionEnum.approvedMethod].disable();
    // this.form.controls.action.controls[WithdrawalActionEnum.approvedMethod].disable();
    this.onActionMethodChange();
  }

  /**
   * 操作方式改变
   */
  onActionMethodChange() {
    this.form.controls.action.controls[WithdrawalActionEnum.time].setValue('0');

    this.onActionChange(
      [
        ...this.actionSelect.filter(
          (e) =>
            ![WithdrawalActionEnum.time, WithdrawalActionEnum.timeUnit, WithdrawalActionEnum.approvedMethod].includes(
              e.field
            )
        ),
      ].concat(
        this.form.controls.action.controls[WithdrawalActionEnum.approval].value === 'Approved'
          ? this.actionList.find((e) => e.field === WithdrawalActionEnum.approvedMethod) || []
          : [],
        this.isActionAuto ? this.actionList.find((e) => e.field === WithdrawalActionEnum.time) || [] : []
      )
    );
  }

  protected readonly WithdrawalActionEnum = WithdrawalActionEnum;
}
