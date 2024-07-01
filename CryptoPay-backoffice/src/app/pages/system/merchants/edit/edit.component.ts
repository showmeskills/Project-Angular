import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { finalize, of, switchMap, zip } from 'rxjs';
import { MerchantsApi } from 'src/app/shared/api/merchants.api';
import {
  CurrencyType,
  MerchantDetail,
  MerchantGoMoneyRate,
  MerchantRateCurrency,
  MerchantRateCurrencyCustom,
  MerchantRateCurrencyItem,
  MerchantRateCurrencyItemDataCustom,
  MerchantRateCurrencyType,
  UpdateMerchantsParams,
} from 'src/app/shared/interfaces/merchants-interface';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { tap } from 'rxjs/operators';
import { SelectApi } from 'src/app/shared/api/select.api';
import { cloneDeep } from 'lodash';
import BigNumber from 'bignumber.js';
import { PaymentType, PaymentTypeEnum } from 'src/app/shared/interfaces/transaction';
import { PaymentMethod } from 'src/app/shared/interfaces/channel';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputFloatDirective, InputPercentageDirective } from 'src/app/shared/directive/input.directive';
import { FormFullDirective, FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { MatTabsModule } from '@angular/material/tabs';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { JsonPipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    FormRowComponent,
    NgFor,
    MatTabsModule,
    FormWrapComponent,
    InputPercentageDirective,
    FormFullDirective,
    InputFloatDirective,
    NgTemplateOutlet,
    LangPipe,
    JsonPipe,
  ],
})
export class EditComponent implements OnInit {
  constructor(
    private router: Router,
    private merchantsApi: MerchantsApi,
    public appService: AppService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private selectApi: SelectApi,
    public lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params; // 快照里的params参数
    this.id = +id || 0;
  }

  formGroup = this.fb.group({
    merchantsName: ['', Validators.compose([Validators.required])],
    email: ['', Validators.compose([Validators.email, Validators.required])],
    merchantsKey: [''],
    callBackUrl: [''],
    whiteList: [''],
    negativeLading: [true],
    rateCategory: ['FixedScale'],
    isFiatMoneyEnable: [true],
    isVirtualMoneyEnable: [true],
    isVirtualToFiatMoneyEnable: [true],
    isDepositRuleEnable: [false], // 存款PSP规则
    isWithdrawRuleEnable: [false], // 提款PSP规则
  });

  /** 费率币种 */
  supportPayList: MerchantRateCurrencyCustom[] = []; // 支持的支付方式
  paymentList: PaymentMethod[] = []; // 支付方式列表
  goMoneyConfigCurTab = 0; // 费率币种Tab索引
  curPaymentTabDeposit = 0; // 费率下的支付方式索引
  curPaymentTabWithdraw = 0; // 费率下的支付方式索引
  curPaymentTabCurrency: CurrencyType = MerchantRateCurrencyType[MerchantRateCurrencyType.FiatMoney] as CurrencyType; // 费率下的币种类型
  currencyTypeList: Array<{ key: CurrencyType; value: number }> = Object.keys(MerchantRateCurrencyType)
    .filter((e) => isNaN(e as any))
    .filter((e) => e !== 'Unknown') // 过滤掉0 第一条
    .map<{ key: CurrencyType; value: number }>((key) => ({
      key: key as CurrencyType,
      value: MerchantRateCurrencyType[key] as number,
    })); // 费率币种类型

  merchants!: any;

  pspAssign = [
    { name: '关闭', value: false, lang: 'common.close' },
    { name: '开启', value: true, lang: 'common.enabled' },
  ];

  /**
   * 服务配置费
   */
  serviceConfigFee = [
    { name: '固定', value: 'FixedScale', lang: 'system.merchants.fixed' },
    { name: '浮动', value: 'FloatScale', lang: 'system.merchants.float' },
  ];

  /**
   * 负值提单
   */
  negativeLading = [
    { name: '允许', value: true, lang: 'common.allow' },
    { name: '不允许', value: false, lang: 'common.allowNot' },
  ];

  selectColorValidate = false; //配色设定验证

  detail: MerchantDetail;
  private id = 0;

  /** 是否新增 */
  get isAdd(): any {
    return !this.id;
  }

  /** 是否编辑 */
  get isEdit(): any {
    return !!this.id;
  }

  /** 获取当前币种下的存款方式 */
  get currencyValue(): MerchantRateCurrencyItem {
    return this.currencyType[this.goMoneyConfigCurTab] || ({} as any);
  }

  /**
   * 当前币种所支持的支付方式
   */
  get curSupport(): MerchantRateCurrencyItemDataCustom | undefined {
    return this.supportPayList
      .find((e) => e.chargeCategory === this.curPaymentTabCurrency)
      ?.data?.find((e) => e.currency === this.currencyValue.currency);
  }

  /**
   * 当前币种的列表
   */
  get currencyType() {
    return (
      this.supportPayList.find((e) => e.chargeCategory === this.curPaymentTabCurrency)?.currencies ||
      ([] as MerchantRateCurrencyItem[])
    );
  }

  ngOnInit(): void {
    this.loading(true);
    zip([this.getmerchantServiceConfig$()])
      .pipe(finalize(() => this.loading(false)))
      .subscribe(() => {
        this.curPaymentTabDeposit = 0;
        this.curPaymentTabWithdraw = 0;
        this.goMoneyConfigCurTab = 0;
      });
  }

  /**
   * 查询当前商户（回传数据）
   */
  querymerchant$() {
    return this.merchantsApi.querymerchant(this.id).pipe(
      tap((res) => {
        if (!res) return;

        this.detail = res;
        this.formGroup.patchValue({
          merchantsName: res.merchantName,
          email: res.email,
          merchantsKey: res.apiKey,
          callBackUrl: res.callbackUrl,
          whiteList: res.whitelist?.join(',') || '',
          negativeLading: !!+res.isNegative,
          rateCategory: res.rateCategory || 'FixedScale',
          isFiatMoneyEnable: !!+res.isFiatMoneyEnable,
          isVirtualMoneyEnable: !!+res.isVirtualMoneyEnable,
          isVirtualToFiatMoneyEnable: !!+res.isVirtualToFiatMoneyEnable,
          isDepositRuleEnable: !!res.isDepositRuleEnable,
          isWithdrawRuleEnable: !!res.isWithdrawRuleEnable,
        });
      })
    );
  }

  /**
   * 提交表单
   */
  submit(): void {
    this.formGroup.markAllAsTouched(); // 手动执行验证

    if (this.formGroup.invalid || this.selectColorValidate) return;
    const param: UpdateMerchantsParams = {
      id: this.id,
      merchantName: this.formGroup.value.merchantsName as string,
      email: this.formGroup.value.email as string,
      apiKey: this.formGroup.value.merchantsKey as string,
      callbackUrl: this.formGroup.value.callBackUrl || '',
      whitelist:
        this.formGroup.value.whiteList
          ?.split(',')
          .map((e) => e.trim())
          .filter((e) => e) || null,
      isNegative: !!this.formGroup.value.negativeLading,
      rateCategory: (this.formGroup.value.rateCategory as 'FixedScale' | 'FloatingScale') || 'FixedScale',
      isFiatMoneyEnable: this.formGroup.value.isFiatMoneyEnable ?? false,
      isVirtualMoneyEnable: this.formGroup.value.isVirtualMoneyEnable ?? false,
      isVirtualToFiatMoneyEnable: this.formGroup.value.isVirtualToFiatMoneyEnable ?? false,
      isDepositRuleEnable: this.formGroup.value.isDepositRuleEnable ?? false,
      isWithdrawRuleEnable: this.formGroup.value.isWithdrawRuleEnable ?? false,
      rates: this.getFeeConfigParam(),
    };

    this.loading(true);
    this.merchantsApi[this.isEdit ? 'updateMerchant' : 'creatMerchant']({ ...param })
      .pipe(finalize(() => this.loading(false)))
      .subscribe((res: any) => {
        const successMsg = this.isEdit ? 'system.merchants.updateSuc' : 'common.addSuccess';
        const failMsg = 'common.operationFailed';
        const successed = res === true || !!+res;

        this.appService.showToastSubject.next({
          msgLang: successed ? successMsg : failMsg,
          successed,
        });

        successed && this.back();
      });
  }

  back(): void {
    this.router.navigate(['/system/merchants']);
  }

  loading(v: boolean) {
    this.appService.isContentLoadingSubject.next(v);
  }

  /**
   * 获取服务权限配置信息
   */
  getmerchantServiceConfig$() {
    return (this.isEdit ? this.querymerchant$() : of(null)).pipe(switchMap(() => this.getPaymentAndCurrency$()));
  }

  /**
   * 获取支付方式和币种
   */
  getPaymentAndCurrency$() {
    return zip([this.selectApi.goMoneyGetPaymentMethods(), this.merchantsApi.merchant_getratescurrencies()]).pipe(
      tap(([payment, currencyAndPayment]) => {
        this.paymentList = payment;
        this.setFeeConfig(currencyAndPayment);
      })
    );
  }

  /**
   * 设置费率配置
   * @param rateList
   */
  setFeeConfig(rateList: MerchantRateCurrency[]): void {
    if (!rateList || !Array.isArray(rateList)) return;

    // 这里一定要深拷贝，否则做处理可能会影响原数据，再重置的时候，需要重新从原始数据赋值
    this.supportPayList = rateList.map((j) => ({
      ...j,
      data: cloneDeep(j.currencies).map((e) => {
        const temp = { ...e } as any;
        delete temp?.payments;

        return {
          ...temp,
          currency: temp.currency,
          deposit:
            e.payments
              ?.filter((j) => j.paymentCategory === 'Deposit')
              ?.map((method) => ({
                ...method,
                name: this.getPaymentName(method.paymentMethodId),
                ...this.generateFeeConfig(e.currency, method.paymentCategory, method.paymentMethodId, j.chargeCategory),
              })) || [],
          withdrawal:
            e.payments
              ?.filter((j) => j.paymentCategory === 'Withdraw')
              ?.map((method) => ({
                ...method,
                name: this.getPaymentName(method.paymentMethodId),
                ...this.generateFeeConfig(e.currency, method.paymentCategory, method.paymentMethodId, j.chargeCategory),
              })) || [],
        };
      }),
    }));
  }

  /** 生成费率配置 */
  generateFeeConfig(currency: string, paymentType: PaymentType, paymentCode: string, category: CurrencyType) {
    let { /*smallRate, */ largeRate, feeMin, feeMax } =
      this.detail?.rates?.find(
        (e) =>
          e.currency === currency &&
          e.paymentCategory === paymentType &&
          e.paymentMethodId === paymentCode &&
          e.chargeCategory === category
      ) || // 找到对应支付方式下的大小额费率
      {};

    // smallRate = smallRate ? new BigNumber(smallRate).multipliedBy(100).toNumber() : 0;
    largeRate = largeRate ? new BigNumber(largeRate).multipliedBy(100).toNumber() : 0;

    return {
      // smallRate: smallRate || 0,
      largeRate: largeRate || 0,
      feeControl: this.fb.group(
        {
          feeMin: [feeMin || 0],
          feeMax: [feeMax || 0],
        },
        {
          validators: [this.withdrawalFeeValidator()],
        }
      ),
    };
  }

  /** 出款费率验证 */
  withdrawalFeeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const { value } = control;

      if ((+value.feeMin || 0) > (+value.feeMax || 0)) {
        return { gtFeeMax: true };
      }

      return null;
    };
  }

  /** 提交的费率配置参数 */
  getFeeConfigParam(): MerchantGoMoneyRate[] {
    // rate提交范围0 ~ 1
    return this.supportPayList
      .map((c) => {
        return c.data
          .map((e) => {
            return [
              ...e.deposit.map(
                (j): MerchantGoMoneyRate => ({
                  currency: e.currency,
                  paymentCategory: PaymentTypeEnum.Deposit,
                  paymentMethodId: j.paymentMethodId,
                  chargeCategory: c.chargeCategory as keyof typeof MerchantRateCurrencyType,
                  // smallRate: j.smallRate ? new BigNumber(j.smallRate).div(100).toNumber() : 0,
                  largeRate: j.largeRate ? new BigNumber(j.largeRate).div(100).toNumber() : 0,
                  feeMin: +j.feeControl.get('feeMin')?.value || 0,
                  feeMax: +j.feeControl.get('feeMax')?.value || 0,
                })
              ),
              ...e.withdrawal.map((j): MerchantGoMoneyRate => {
                if (j.feeControl.invalid && j.feeControl.errors?.['gtFeeMax']) {
                  const errorArg = { currency: e.currency, payment: j.name };
                  this.appService.showToastSubject.next({
                    msgLang: 'system.merchants.feeWithdrawErrorTip',
                    msgArgs: errorArg,
                  });
                  throw new Error(
                    `[提款费率配置错误]${errorArg.currency} - ${errorArg.payment} : Please enter the correct withdrawal fee`
                  );
                }

                return {
                  currency: e.currency,
                  paymentCategory: PaymentTypeEnum.Withdraw,
                  paymentMethodId: j.paymentMethodId,
                  chargeCategory: c.chargeCategory as keyof typeof MerchantRateCurrencyType,
                  // smallRate: j.smallRate ? new BigNumber(j.smallRate).div(100).toNumber() : 0,
                  largeRate: j.largeRate ? new BigNumber(j.largeRate).div(100).toNumber() : 0,
                  feeMin: +j.feeControl.get('feeMin')?.value || 0,
                  feeMax: +j.feeControl.get('feeMax')?.value || 0,
                };
              }),
            ];
          })
          .flat(1) as MerchantGoMoneyRate[];
      })
      .flat(1) as MerchantGoMoneyRate[];
  }

  /** 获取支付方式的名称 */
  getPaymentName(paymentCode: string): string {
    return this.paymentList.find((e) => e.code === paymentCode)?.name || '-';
  }

  /** goMoney配置币种切换 */
  onMoneyTab(i: number) {
    this.goMoneyConfigCurTab = i;
    this.curPaymentTabDeposit = 0;
    this.curPaymentTabWithdraw = 0;
  }

  onFeeCurrencyType(key: CurrencyType, navBar) {
    this.curPaymentTabCurrency = key;
    this.goMoneyConfigCurTab = 0;
    this.curPaymentTabDeposit = 0;
    this.curPaymentTabWithdraw = 0;
    setTimeout(() => {
      navBar.scrollDistance = 0;
    });
  }
}
