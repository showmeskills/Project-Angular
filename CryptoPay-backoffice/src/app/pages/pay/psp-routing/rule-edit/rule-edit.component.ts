import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DismissCloseDirective,
  ModalFooterComponent,
} from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { PaginatorComponent } from 'src/app/_metronic/shared/crud-table/components/paginator/paginator.component';
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
import { VipNamePipe } from 'src/app/shared/pipes/common.pipe';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { Currency } from 'src/app/shared/interfaces/currency';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { takeUntil } from 'rxjs/operators';
import { AsyncSubject, finalize, lastValueFrom, zip } from 'rxjs';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { DestroyService } from 'src/app/shared/models/tools.model';
import {
  InputFloatDirective,
  InputNumberDirective,
  InputTrimDirective,
} from 'src/app/shared/directive/input.directive';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { VipApi } from 'src/app/shared/api/vip.api';
import { cloneDeep } from 'lodash';
import { ExcludeNullable } from 'src/app/shared/interfaces/base.interface';
import { PSPRuleService } from 'src/app/pages/pay/psp-routing/rule.service';
import { ChannelSelectItem, PaymentMethod } from 'src/app/shared/interfaces/channel';
import { RuleWrapComponent } from 'src/app/pages/pay/psp-routing/rule-edit/rule-wrap/rule-wrap.component';
import { OptionStickyDirective } from 'src/app/shared/directive/common.directive';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { PaymentTypeEnum } from 'src/app/shared/interfaces/transaction';
import { PSPRuleItem, TimeUnitEnum } from 'src/app/shared/interfaces/psp';
import { PSPApi } from 'src/app/shared/api/psp.api';
import { KYCLevelEnum } from 'src/app/shared/interfaces/kyc';

/**
 * 提款配置 - 条件枚举
 */
export enum PSPConditionEnum {
  currency = 'currencyType', // 交易币种
  kycLevel = 'kycLevel', // KYC状态
  firstDeposit = 'firstDeposit', // 是否首存
  firstPayment = 'firstPaymentMethod', // 首次使用支付方式
  vipLevelMorethen = 'vipLevelGreaterEqual', // vip等级大于
  vipLevelLessthen = 'vipLevelLessthenEqual', // vip等级小于
  totalTime = 'totalTime', // 时间
  timeUnit = 'timeUnit', // 时间单位

  totalDepositAmountCountGt = 'totalDepositCountGreaterEqual', // 存款 - 总交易成功笔数大于等于
  totalDepositAmountCountLe = 'totalDepositCountLessthenEqual', // 存款 - 总交易成功笔数小于等于
  totalDepositAmountGt = 'totalDepositAmountGreaterEqual', // 存款 - 总交易金额大于等于
  totalDepositAmountLe = 'totalDepositAmountLessthenEqual', // 存款 - 总交易金额小于等于
  totalDepositAmountGtCurrency = 'totalDepositAmountGreaterCurrency', // 存款 - 总交易金额大于等于 - 币种单位
  totalDepositAmountLeCurrency = 'totalDepositAmountLessthenCurrency', // 存款 - 总交易金额小于等于 - 币种单位

  totalWithdrawalAmountCountGt = 'totalWithdrawalCountGreaterEqual', // 提款 - 总交易成功笔数大于等于
  totalWithdrawalAmountCountLe = 'totalWithdrawalCountLessthenEqual', // 提款 - 总交易成功笔数小于等于
  totalWithdrawalAmountGt = 'totalWithdrawalAmountGreaterEqual', // 提款 - 总交易金额大于等于
  totalWithdrawalAmountLe = 'totalWithdrawalAmountLessthenEqual', // 提款 - 总交易金额小于等于
  totalWithdrawalAmountGtCurrency = 'totalWithdrawalAmountGreaterCurrency', // 提款 - 总交易金额大于等于 - 币种单位
  totalWithdrawalAmountLeCurrency = 'totalWithdrawalAmountLessthenCurrency', // 提款 - 总交易金额小于等于 - 币种单位

  // 交易数量(笔数)
  minDepositCount = 'depositCountLessthenEqual', // 最小存款笔数
  minWithdrawalCount = 'withdrawalCountLessthenEqual', // 最小提款笔数
  maxDepositCount = 'depositCountGreaterEqual', // 最大存款笔数
  maxWithdrawalCount = 'withdrawalCountGreaterEqual', // 最大提款笔数

  // 交易金额
  maxDeposit = 'depositAmountGreaterEqual', // 存款大于等于
  minDeposit = 'depositAmountLessthenEqual', // 存款小于等于
  maxWithdrawal = 'withdrawalAmountGreaterEqual', // 提款大于等于
  minWithdrawal = 'withdrawalAmountLessthenEqual', // 提款小于等于
  maxDepositCurrency = 'depositAmountGreaterCurrency', // 存款大于等于 - 币种单位
  minDepositCurrency = 'depositAmountLessthenCurrency', // 存款小于等于 - 币种单位
  maxWithdrawalCurrency = 'withdrawalAmountGreaterCurrency', // 提款大于等于 - 币种单位
  minWithdrawalCurrency = 'withdrawalAmountLessthenCurrency', // 提款小于等于 - 币种单位

  // 自定义的
  vipLevel = 'vipLevel', // VIP级别
  txCount = 'txCount', // 交易数量
  txAmount = 'txAmount', // 交易金额
  total = 'total', // 总计
}

/**
 * 条件类型
 */
export interface conditionItem {
  name: string;
  lang: string;
  field: PSPConditionEnum;
  children?: conditionItem[];
  suffix?: string; // 后缀
}

export const yesOrNo = [
  { name: '是', lang: 'finance.yes', value: true },
  { name: '否', lang: 'finance.no', value: false },
];

export const kycLevelList = [
  { name: '初级认证', lang: 'finance.rule.kyc1Suc', value: 'KycPrimary' },
  { name: '中级验证', lang: 'finance.rule.kyc2Suc', value: 'KycIntermediat' },
  { name: '高级验证', lang: 'finance.rule.kyc3Suc', value: 'KycAdvanced' },
];

export const timeUnitList = [
  { name: '分钟', lang: 'finance.rule.minutes', value: TimeUnitEnum.Minute },
  { name: '小时', lang: 'finance.rule.hours', value: TimeUnitEnum.Hour },
  { name: '天', lang: 'finance.rule.day', value: TimeUnitEnum.Day },
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
    RuleWrapComponent,
    OptionStickyDirective,
    InputTrimDirective,
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
    public ruleService: PSPRuleService,
    private destroy$: DestroyService,
    private channelApi: ChannelApi,
    private api: PSPApi
  ) {
    this.conditionList.forEach(async (e) => {
      e.lang = (await this.lang.getOne(e.lang)) || '-';
      e.children?.forEach(async (j) => {
        j.lang = (await this.lang.getOne(j.lang)) || '-';
      });

      this.init$.next(true);
      this.init$.complete();
    });
  }

  init$ = new AsyncSubject<boolean>();

  /********************************************************************
   * 组件参数 通过modal传入
   ********************************************************************/
  groupId = this.ruleService.curGroupId;
  num = 0;

  /********************************************************************
   * 成员属性
   ********************************************************************/
  protected readonly PSPConditionEnum = PSPConditionEnum;

  dataLoading = false;
  showEditCondition = false;
  conditionList: conditionItem[] = this.ruleService.getConditionList();

  conditionSelect: typeof this.conditionList = [];
  conditionSelectField = this.conditionSelect.map((e) => e.field);
  currencyList: Currency[] = [];
  paymentMethodList: PaymentMethod[] = [];
  channelList: ChannelSelectItem[] = [];
  subChannelList: any[] = [];
  formSubChannelList: any[][] = [];

  yesOrNo = yesOrNo;
  kycLevelList = kycLevelList;
  timeUnitList = timeUnitList;

  /**
   * 表单 formControl 字段Parker开发时会变化，这里用枚举去定义接口字段
   */
  form = this.fb.group({
    id: [0],
    ruleNameLocal: ['', Validators.required],
    remark: [''],
    isEnabled: [true],
    paymentCategory: ['' as string | PaymentTypeEnum, Validators.required],
    paymentMethodId: ['', Validators.required],
    condition: this.fb.group({
      [PSPConditionEnum.currency]: [{ value: [] as string[], disabled: true }], // 交易币种
      [PSPConditionEnum.kycLevel]: [{ value: [] as KYCLevelEnum[], disabled: true }], // KYC等级
      [PSPConditionEnum.firstDeposit]: [{ value: true, disabled: true }], // 是否存款
      [PSPConditionEnum.firstPayment]: [{ value: true, disabled: true }], // 首次使用支付方式
      // [PSPConditionEnum.locationMatch]: [{ value: '', disabled: true }], // 地址符合
      // [PSPConditionEnum.amountMorethen]: [{ value: '' as string | number, disabled: true }], // 交易金额大于 - 单笔
      // [PSPConditionEnum.amountLessthen]: [{ value: '' as string | number, disabled: true }], // 交易金额小于 - 单笔
      // [PSPConditionEnum.paymentMethod]: [{ value: '', disabled: true }], // 支付方式

      // VIP等级
      [PSPConditionEnum.vipLevel]: this.fb.group({
        [PSPConditionEnum.vipLevelMorethen]: [{ value: '' as string | number, disabled: true }], // vip等级大于
        [PSPConditionEnum.vipLevelLessthen]: [{ value: '' as string | number, disabled: true }], // vip等级小于
      }),

      // TX交易数量
      [PSPConditionEnum.txCount]: this.fb.group({
        [PSPConditionEnum.minDepositCount]: [{ value: '' as number | string, disabled: true }], // 最小存款笔数
        [PSPConditionEnum.maxDepositCount]: [{ value: '' as number | string, disabled: true }], // 最大存款笔数
        [PSPConditionEnum.minWithdrawalCount]: [{ value: '' as number | string, disabled: true }], // 最小提款笔数
        [PSPConditionEnum.maxWithdrawalCount]: [{ value: '' as number | string, disabled: true }], // 最大提款笔数
      }),

      // 交易金额（USDT币种）
      [PSPConditionEnum.txAmount]: this.fb.group({
        [PSPConditionEnum.maxDeposit]: [{ value: '' as number | string, disabled: true }], // 存款大于
        [PSPConditionEnum.minDeposit]: [{ value: '' as number | string, disabled: true }], // 存款小于
        [PSPConditionEnum.maxWithdrawal]: [{ value: '' as number | string, disabled: true }], // 提款大于
        [PSPConditionEnum.minWithdrawal]: [{ value: '' as number | string, disabled: true }], // 提款小于
      }),

      // 总计
      total: this.fb.group({
        [PSPConditionEnum.totalDepositAmountCountGt]: [{ value: '' as string | number, disabled: true }], // 总交易成功笔数大于
        [PSPConditionEnum.totalDepositAmountCountLe]: [{ value: '' as string | number, disabled: true }], // 总交易成功笔数小于
        [PSPConditionEnum.totalDepositAmountGt]: [{ value: '' as string | number, disabled: true }], // 总交易金额大于(范围时间内)
        [PSPConditionEnum.totalDepositAmountLe]: [{ value: '' as string | number, disabled: true }], // 总交易金额小于(范围时间内)
        [PSPConditionEnum.totalWithdrawalAmountCountGt]: [{ value: '' as string | number, disabled: true }], // 总交易成功笔数大于
        [PSPConditionEnum.totalWithdrawalAmountCountLe]: [{ value: '' as string | number, disabled: true }], // 总交易成功笔数小于
        [PSPConditionEnum.totalWithdrawalAmountGt]: [{ value: '' as string | number, disabled: true }], // 总交易金额大于(范围时间内)
        [PSPConditionEnum.totalWithdrawalAmountLe]: [{ value: '' as string | number, disabled: true }], // 总交易金额小于(范围时间内)
        [PSPConditionEnum.totalTime]: [{ value: '' as string | number, disabled: true }], // 总提款金额小于(范围时间内)
        [PSPConditionEnum.timeUnit]: [{ value: this.timeUnitList[0].value, disabled: true }], // 总提款金额小于(范围时间内)
      }),
    }),
    actions: this.fb.array([
      this.fb.group({
        isFirst: [true],
        channelId: ['', Validators.required],
        channelAccountId: ['', Validators.required],
      }),
    ]),
  });

  /**
   * 交易金额 - 币种单位
   */
  formTxAmountCurrency = {
    [PSPConditionEnum.maxDeposit]: { key: PSPConditionEnum.maxDepositCurrency, control: this.fb.control('USDT') },
    [PSPConditionEnum.minDeposit]: { key: PSPConditionEnum.minDepositCurrency, control: this.fb.control('USDT') },
    [PSPConditionEnum.maxWithdrawal]: { key: PSPConditionEnum.maxWithdrawalCurrency, control: this.fb.control('USDT') },
    [PSPConditionEnum.minWithdrawal]: { key: PSPConditionEnum.minWithdrawalCurrency, control: this.fb.control('USDT') },
  };

  /**
   * 交易总金额 - 币种单位
   */
  formTotalTxAmountCurrency = {
    [PSPConditionEnum.totalDepositAmountGt]: {
      key: PSPConditionEnum.totalDepositAmountGtCurrency,
      control: this.fb.control('USDT'),
    },
    [PSPConditionEnum.totalDepositAmountLe]: {
      key: PSPConditionEnum.totalDepositAmountLeCurrency,
      control: this.fb.control('USDT'),
    },
    [PSPConditionEnum.totalWithdrawalAmountGt]: {
      key: PSPConditionEnum.totalWithdrawalAmountGtCurrency,
      control: this.fb.control('USDT'),
    },
    [PSPConditionEnum.totalWithdrawalAmountLe]: {
      key: PSPConditionEnum.totalWithdrawalAmountLeCurrency,
      control: this.fb.control('USDT'),
    },
  };

  get totalControl() {
    return this.form.controls.condition.controls.total;
  }

  get isEdit() {
    return this.form.getRawValue().id !== 0;
  }

  ngOnInit() {
    this.subHeader.merchantId$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dataLoading = true;
      zip([
        this.selectApi.getCurrencySelect(),
        this.selectApi.goMoneyGetPaymentMethods(),
        this.channelApi.getAllChannels(),
      ])
        .pipe(finalize(() => (this.dataLoading = false)))
        .subscribe(([currencyList, paymentMethodList, channelList]) => {
          this.currencyList = currencyList;
          this.paymentMethodList = paymentMethodList;
          this.channelList = channelList;
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
          case PSPConditionEnum.total:
            this.form.controls.condition.controls[e.field]?.[opera]();

            if (isSelChildren) {
              // 先全禁止，通过子集来开放
              this.form.controls.condition.controls[e.field]?.disable();
              let selTotal = value.find((b) => b.field === PSPConditionEnum.total);

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

  async onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });

    let conditions = (cloneDeep(this.form.value.condition)! as ExcludeNullable<typeof this.form.value.condition>) || {};

    // if (!conditions) {
    //   return this.appService.showToastSubject.next({ msgLang: 'finance.rule.conditionCannotEmpty' });
    // }

    // 组装参数，过滤空字符串
    conditions = Object.keys(conditions!).reduce((total, key) => {
      if (typeof conditions![key] === 'object' && !Array.isArray(conditions![key])) {
        const obj = Object.keys(conditions![key]).reduce((t, ik) => {
          if (!['', undefined, null].includes(conditions![key][ik])) {
            let ex = {};
            const curTxAmountCurrency = this.formTxAmountCurrency[ik];
            if (curTxAmountCurrency) {
              ex = { ...ex, [curTxAmountCurrency.key]: curTxAmountCurrency.control.value };
            }

            const curTotalAmountCurrency = this.formTotalTxAmountCurrency[ik];
            if (curTotalAmountCurrency) {
              ex = { ...ex, [curTotalAmountCurrency.key]: curTotalAmountCurrency.control.value };
            }

            t = { ...t, [ik]: conditions![key][ik], ...ex };
          }

          return t;
        }, {});

        total = { ...total, ...obj };
      } else {
        const obj = ['', undefined, null].includes(conditions![key]) ? {} : { [key]: conditions![key] };

        total = { ...total, ...obj };
      }

      return total;
    }, {});

    const sendData = {
      ...(cloneDeep(this.form.value) as ExcludeNullable<typeof this.form.value>),
      merchantId: +this.subHeader.merchantCurrentId,
      groupId: this.groupId,
      sort: this.num,
      conditions,
      actions: this.form.value.actions as any,
    } as any;

    delete sendData.condition;

    this.appService.isContentLoadingSubject.next(true);
    const res = await lastValueFrom(
      (this.isEdit ? this.ruleService.editRule$(sendData) : this.ruleService.addRule$(sendData)).pipe(
        finalize(() => this.appService.isContentLoadingSubject.next(false))
      )
    );
    res === true && this.modal.close(true);
    this.modal.close(true);
  }

  /**
   * 删除条件
   */
  onConditionDelRule(i: number, condition: (typeof this.conditionList)[0], key?: Array<keyof typeof PSPConditionEnum>) {
    if (key) {
      const parentGroup = this.form.controls.condition.controls[condition.field];

      key!.forEach((k) => {
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
   * 初始数据
   */
  async setData(data: PSPRuleItem) {
    if (!data) return;

    await lastValueFrom(this.init$);
    const condition = data.conditions || ({} as Required<typeof data.conditions>);

    this.form.patchValue({
      id: data.id || 0,
      ruleNameLocal: data.ruleNameLocal || '',
      remark: data.remark || '',
      isEnabled: data.isEnabled,
      paymentCategory: data.paymentCategory,
      paymentMethodId: data.paymentMethodId,
      condition: {
        ...condition,

        // VIP等级
        [PSPConditionEnum.vipLevel]: {
          [PSPConditionEnum.vipLevelMorethen]: condition[PSPConditionEnum.vipLevelMorethen], // vip等级大于
          [PSPConditionEnum.vipLevelLessthen]: condition[PSPConditionEnum.vipLevelLessthen], // vip等级小于
        },

        // TX交易数量
        [PSPConditionEnum.txCount]: {
          [PSPConditionEnum.minDepositCount]: condition[PSPConditionEnum.minDepositCount], // 最小存款笔数
          [PSPConditionEnum.maxDepositCount]: condition[PSPConditionEnum.maxDepositCount], // 最大存款笔数
          [PSPConditionEnum.minWithdrawalCount]: condition[PSPConditionEnum.minWithdrawalCount], // 最小提款笔数
          [PSPConditionEnum.maxWithdrawalCount]: condition[PSPConditionEnum.maxWithdrawalCount], // 最大提款笔数
        },

        // 交易金额（USDT币种）
        [PSPConditionEnum.txAmount]: {
          [PSPConditionEnum.maxDeposit]: condition[PSPConditionEnum.maxDeposit], // 存款大于
          [PSPConditionEnum.minDeposit]: condition[PSPConditionEnum.minDeposit], // 存款小于
          [PSPConditionEnum.maxWithdrawal]: condition[PSPConditionEnum.maxWithdrawal], // 提款大于
          [PSPConditionEnum.minWithdrawal]: condition[PSPConditionEnum.minWithdrawal], // 提款小于
        },

        // 总计
        total: {
          [PSPConditionEnum.totalDepositAmountCountGt]: condition[PSPConditionEnum.totalDepositAmountCountGt], // 总交易成功笔数大于
          [PSPConditionEnum.totalDepositAmountCountLe]: condition[PSPConditionEnum.totalDepositAmountCountLe], // 总交易成功笔数小于
          [PSPConditionEnum.totalDepositAmountGt]: condition[PSPConditionEnum.totalDepositAmountGt], // 总交易金额大于(范围时间内)
          [PSPConditionEnum.totalDepositAmountLe]: condition[PSPConditionEnum.totalDepositAmountLe], // 总交易金额小于(范围时间内)
          [PSPConditionEnum.totalWithdrawalAmountCountGt]: condition[PSPConditionEnum.totalWithdrawalAmountCountGt], // 总交易成功笔数大于
          [PSPConditionEnum.totalWithdrawalAmountCountLe]: condition[PSPConditionEnum.totalWithdrawalAmountCountLe], // 总交易成功笔数小于
          [PSPConditionEnum.totalWithdrawalAmountGt]: condition[PSPConditionEnum.totalWithdrawalAmountGt], // 总交易金额大于(范围时间内)
          [PSPConditionEnum.totalWithdrawalAmountLe]: condition[PSPConditionEnum.totalWithdrawalAmountLe], // 总交易金额小于(范围时间内)
          [PSPConditionEnum.totalTime]: condition[PSPConditionEnum.totalTime], // 范围时间
          [PSPConditionEnum.timeUnit]: condition[PSPConditionEnum.timeUnit] || TimeUnitEnum.Minute, // 范围时间单位
        },
      },
    });

    Object.keys(this.formTxAmountCurrency).forEach((k) => {
      this.formTxAmountCurrency[k].control.setValue(condition[this.formTxAmountCurrency[k].key] || 'USDT');
    });

    Object.keys(this.formTotalTxAmountCurrency).forEach((k) => {
      this.formTotalTxAmountCurrency[k].control.setValue(condition[this.formTotalTxAmountCurrency[k].key] || 'USDT');
    });

    data?.actions?.length &&
      this.form.setControl(
        'actions',
        this.fb.array(
          data.actions.map((e) =>
            this.fb.group({
              isFirst: [e.isFirst],
              channelId: [e.channelId, Validators.required],
              channelAccountId: [e.channelAccountId, Validators.required],
            })
          )
        )
      );

    // 子渠道匹配
    this.getSubChannelListAll();
    this.onConditionChange(
      cloneDeep(
        this.conditionList.filter((e) => {
          // 如果有子集查看子集是否有数据来确定是否显示
          if (e.children) {
            return e.children.some((j) => {
              // 时间单位看是否有时间值
              if ([PSPConditionEnum.timeUnit].includes(j.field)) {
                return ![null, undefined].includes(condition[PSPConditionEnum.totalTime] as any);
              }

              return ![null, undefined].includes(condition[j.field]);
            });
          }

          // 没有子集判断当前条件是否有数据来确定是否选中
          return ![null, undefined].includes(condition[e.field]);
        })
      ),
      true // 根据子集选中，而不是直接选中所有
    );
  }

  /**
   * 删除组下策略
   * @param control
   * @param parentCondition
   * @param i
   * @param fieldArr
   */
  deleteConditionList<T extends AbstractControl<any, any>>(
    control: T,
    parentCondition: (typeof this.conditionList)[0],
    i: number,
    fieldArr?: Array<keyof typeof PSPConditionEnum>
  ) {
    const parent = control.parent as FormGroup;
    const hasAllDisabled = Object.keys(parent!.value).length <= (fieldArr?.length || 1); // 只有一个的时候表示当前最后一个禁用，全部禁用value会出现全部的值

    if (fieldArr?.length) {
      fieldArr.forEach((key) => parent.get(key)!.disable());
    } else {
      control.disable();
    }

    if (hasAllDisabled) {
      parent.disable();
      this.onConditionDelRule(i, parentCondition);
    }
  }

  /**
   * 添加策略
   */
  actionAdd() {
    this.form.controls.actions.controls.push(
      this.fb.group({
        isFirst: [false],
        channelId: ['', Validators.required],
        channelAccountId: ['', Validators.required],
      })
    );

    this.form.controls.actions.updateValueAndValidity();

    // 要替换controls，不然不会触发变更检测
    this.form.setControl(
      'actions',
      this.fb.array(
        this.form.value.actions!.map((e) =>
          this.fb.group({
            isFirst: [e.isFirst || false],
            channelId: [e.channelId || '', Validators.required],
            channelAccountId: [e.channelAccountId || '', Validators.required],
          })
        )
      )
    );

    this.form.controls.actions.updateValueAndValidity();
  }

  /**
   * 主渠道变动
   */
  mainChannelChange(channelFormGroup: (typeof this.form.controls.actions.controls)[0], i: number) {
    // 清空子渠道，重新选择
    channelFormGroup.controls.channelAccountId.setValue('');

    // 遍历可用子渠道 根据主渠道
    this.formSubChannelList[i] = this.getSubChannelList(channelFormGroup.controls.channelId.value!);
  }

  /**
   * 删除渠道
   * @param i
   */
  deleteChannel(i: number) {
    this.form.controls.actions.removeAt(i);
    this.formSubChannelList.splice(i, 1);
    this.form.controls.actions.updateValueAndValidity();
  }

  /**
   * 匹配主渠道下可用的子渠道列表
   */
  getSubChannelList(channelId: string) {
    return this.subChannelList.filter((e) => e.channelId === channelId);
  }

  /**
   * 计算所有子渠道 根据主渠道
   */
  getSubChannelListAll() {
    this.form.controls.actions.controls.forEach((e, i) => {
      this.formSubChannelList[i] = this.getSubChannelList(e.controls.channelId.value!);
    });
  }

  /**
   * 子渠道点击
   */
  subChannelClick(channel: (typeof this.form.controls.actions.controls)[0]) {
    if (channel.controls.channelId.value) return;

    // 没有主渠道，弹出提示先选择主渠道
    this.appService.showToastSubject.next({ msgLang: 'finance.rule.selectMainChannel' });
  }

  /**
   * 获取当前子渠道内容
   */
  getSubChannelContent(i: number) {
    return (
      this.formSubChannelList[i]
        ?.find((e) => this.form.controls.actions.controls[i].controls.channelAccountId.value === e.channelAccountId)
        ?.details.filter((e) => e.paymentMethodId === this.form.controls.paymentMethodId.value) || []
    ).reduce((t, c) => {
      let curTotal = t.find((e) => e.currency === c.currency);
      if (!curTotal) {
        curTotal = { currency: c.currency, limit: [] };
        t = [...t, curTotal];
      }
      curTotal.limit.push(c);

      return t;
    }, []);
  }

  protected readonly PaymentTypeEnum = PaymentTypeEnum;
}
