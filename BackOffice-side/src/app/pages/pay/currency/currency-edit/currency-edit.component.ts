import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { RadioSelectComponent } from 'src/app/shared/components/radio-select/radio-select.component';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { AssetApi } from 'src/app/shared/api/asset.api';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { CountrySelectComponent } from 'src/app/pages/pay/currency/currency-edit/country-select/country-select.component';
import { cloneDeep } from 'lodash';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import { TenantCurrency } from 'src/app/shared/interfaces/currency';
import BigNumber from 'bignumber.js';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { InputFloatDirective, InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent, FormFullDirective } from 'src/app/shared/components/form-row/form-wrap.component';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf, NgFor } from '@angular/common';
import { ContinentCountryItem } from 'src/app/shared/interfaces/select.interface';

@Component({
  selector: 'app-currency-edit',
  templateUrl: './currency-edit.component.html',
  styleUrls: ['./currency-edit.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    AngularSvgIconModule,
    UploadComponent,
    FormWrapComponent,
    FormFullDirective,
    InputFloatDirective,
    NgbTooltip,
    NgFor,
    InputNumberDirective,
    FormatMoneyPipe,
    LangPipe,
  ],
})
export class CurrencyEditComponent implements OnInit {
  constructor(
    public router: Router,
    private fb: FormBuilder,
    private modalService: MatModal,
    private activatedRoute: ActivatedRoute,
    private appService: AppService,
    private selectApi: SelectApi,
    private api: AssetApi,
    public lang: LangService,
    public ls: LocalStorageService
  ) {
    const { merchantId, currency } = activatedRoute.snapshot.params;
    this.currency = currency;
    this.merchantId = merchantId;
  }

  currency;
  merchantId;
  countryList: ContinentCountryItem[] = [];
  currencyList: TenantCurrency[] = [];
  formGroup = this.fb.group({
    currency: ['', Validators.required],
    isDigital: [true],
    name: ['', Validators.required],
    icon: ['', Validators.required],
    systemRate: [0, validatorNumberRequired],
    buyRateSpread: [0], // 买入价
    sellRateSpread: [0], // 卖出价
    countryCode: [[] as string[]],
    isAutoCatch: [false], // 是否自动采集汇率
    maxWithdraw: [0],
    minWithdraw: [0],
    minDeposit: [0],
    maxDeposit: [0],
    // risk: [0, Validators.compose([Validators.required, Validators.min(1)])],
  });

  validator: FormValidator = (() => new FormValidator(this.formGroup))();
  data: TenantCurrency;

  /** getter */
  get isEdit(): boolean {
    return !!this.currency;
  }

  get isAdd(): boolean {
    return !this.currency;
  }

  /** 买入价 */
  get buyPrice() {
    return new BigNumber(this.data.realRate)
      .times(new BigNumber(+this.formGroup.value.buyRateSpread! || 0).div(100))
      .plus(this.data.realRate);
  }

  /** 卖出价 */
  get sellPrice() {
    return new BigNumber(this.data.realRate)
      .times(new BigNumber(+this.formGroup.value.sellRateSpread! || 0).div(100))
      .plus(this.data.realRate);
  }

  get country() {
    return (this.formGroup.get('countryCode')!.value! as [])
      ?.map((code) => this.countryList.map((c) => c.countries.find((j) => j.countryCode === code)).filter((e) => e))
      .flat();
  }

  /** 获取系统汇率单位 */
  get systemRateUnit() {
    return {
      from: 'USDT',
      to: this.getCurrencyName,
    };
  }

  /** 获取币种名称 */
  get getCurrencyName(): string {
    return this.formGroup.value.currency || 'Unknown';
  }

  ngOnInit(): void {
    this.appService.isContentLoadingSubject.next(true);

    forkJoin([this.api.getCurrencyList({ TenantId: this.merchantId }), this.selectApi.getCountry()]).subscribe(
      ([list, country]) => {
        this.appService.isContentLoadingSubject.next(false);

        const detail = list.find((e) => e.currency === this.currency);
        this.currencyList = list || [];
        this.processCountry(detail, country);

        if (this.isAdd) {
          this.formGroup.patchValue({
            currency: list?.[0]?.currency || '',
          });
        }

        if (this.isEdit && !detail) {
          this.router.navigate(['/pay/currency']);
          return this.appService.showToastSubject.next({
            msgLang: 'payment.currency.queryDetailsDataFailed',
            successed: false,
          });
        }

        if (detail === undefined) return;

        this.data = detail;
        this.loadForm(detail);
      }
    );
  }

  /** methods */
  loadForm(detail?: TenantCurrency): void {
    if (!detail) return;

    this.formGroup.patchValue({
      currency: String(detail.currency || ''),
      isDigital: detail.isDigital,
      name: detail.name || '',
      icon: detail.icon || '',
      buyRateSpread: detail.buyRateSpread,
      sellRateSpread: detail.sellRateSpread,
      maxWithdraw: detail.maxWithdraw,
      minWithdraw: detail.minWithdraw,
      minDeposit: detail.minDeposit,
      maxDeposit: detail.maxDeposit,
      systemRate: detail.systemRate || 0,
      countryCode: detail.countryCode || [],
    });
  }

  processCountry(data: undefined | TenantCurrency, country: ContinentCountryItem[]) {
    const disabledList = data?.countryCode || [];

    country.forEach((e) => {
      e.countries.forEach((j) => {
        j['disabled'] = disabledList.includes(j.countryCode);
      });

      e.countries['disabled'] = e.countries.every((j) => j['disabled']);
    });

    this.countryList = country;
  }

  submit(): void {
    // 手动触发表单验证
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    // this.api[this.isEdit ? 'updateCurrency' : 'createCurrency']({
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .updateCurrency({
        ...this.data,
        ...(this.formGroup.value as any),
        currencyType: this.formGroup.value.currency,
      })
      .subscribe(async (res) => {
        this.appService.isContentLoadingSubject.next(false);

        // 更新/新增
        const update = await this.lang.getOne('payment.currency.update');
        const adds = await this.lang.getOne('common.add');
        const prevText = this.isEdit ? update : adds;

        if (!isNaN(+res)) {
          this.router.navigate(['/pay/currency']);
          // 成功
          const success = await this.lang.getOne('payment.currency.success');
          return this.appService.showToastSubject.next({
            msg: prevText + success,
            successed: true,
          });
        }

        // 失败
        const fail = await this.lang.getOne('payment.currency.fail');
        this.appService.showToastSubject.next({
          msg: prevText + fail,
          successed: false,
        });
      });
  }

  async onOpenSelect(): Promise<void> {
    if (this.isEdit) return;

    const modal = this.modalService.open(RadioSelectComponent, {
      width: '500px',
    });
    //选择币种
    modal.componentInstance['title'] = (await this.lang.getOne('payment.currency.chooseCurrency')) || '';
    modal.componentInstance['list'] = this.currencyList;
    modal.componentInstance['select'] = [this.formGroup.value['currency']];

    const currency = (await modal.result) || '';
    if (currency === this.formGroup.value['currency']) return;
    this.formGroup.patchValue({ currency });
  }

  /**
   * 打开国家选择
   */
  openCountrySelect() {
    const modal = this.modalService.open(CountrySelectComponent, { width: '800px' });
    modal.componentInstance['countryList'] = cloneDeep(this.countryList);
    modal.componentInstance.select = this.formGroup.value.countryCode!;

    modal.componentInstance.selectChange.subscribe((res) => {
      this.formGroup.get('countryCode')!.setValue(res);
    });
  }

  /**
   * 删除已选的国家
   */
  delCountry(code: string) {
    const curCountry = this.formGroup.get('countryCode')!.value!;

    this.formGroup.get('countryCode')!.setValue(curCountry.filter((e) => e !== code));
  }
}
