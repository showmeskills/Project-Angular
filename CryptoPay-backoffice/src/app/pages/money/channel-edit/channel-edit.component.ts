import { Component, OnInit } from '@angular/core';
import { SelectApi } from 'src/app/shared/api/select.api';
import { finalize, forkJoin } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormValidator } from 'src/app/shared/form-validator';
import { ActivatedRoute, Router } from '@angular/router';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { AppService } from 'src/app/app.service';
import moment from 'moment';
import { weekList } from 'src/app/shared/models/tools.model';
import { cloneDeep } from 'lodash';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { PaymentMethod } from 'src/app/shared/interfaces/channel';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimePickerComponent } from 'src/app/shared/components/time-picker/time-picker.component';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputFloatDirective, InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { NgFor, NgIf } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

function validatorMaintenanceRangeTime(control: AbstractControl) {
  const maintenanceControl = control.get('maintenance');
  const startControl = control.get('timeStart');
  const endControl = control.get('timeEnd');

  if (!maintenanceControl?.value || !startControl?.value || !endControl?.value) return null;

  if (!(moment(endControl.value, 'HH:mm').valueOf() > moment(startControl.value, 'HH:mm').valueOf())) {
    return { rangeLgStart: true };
  }

  return null;
}

@Component({
  selector: 'channel-edit',
  templateUrl: './channel-edit.component.html',
  styleUrls: ['./channel-edit.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    MatTabsModule,
    NgFor,
    NgIf,
    FormsModule,
    InputFloatDirective,
    InputNumberDirective,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    CdkOverlayOrigin,
    TimePickerComponent,
    ReactiveFormsModule,
    LangPipe,
  ],
})
export class ChannelEditComponent implements OnInit {
  currencies: any[] = []; // 币种列表
  payment: PaymentMethod[] = []; // 币种标签
  curTab = 0; // 当前tab索引
  id = ''; // 编辑id

  formGroup: FormGroup<any> = this.fb.group({});
  validator!: FormValidator;
  detail: any = {};
  init = false;
  riskList: any[] = [];
  wallList = [
    'payment.channelConfig.recommend',
    'payment.channelConfig.bankCard',
    'payment.channelConfig.electronicWallet',
    'payment.channelConfig.qrCode',
    'payment.channelConfig.giftCertificate',
  ];

  creditList: any[] = [];
  public readonly weekList = weekList;

  get subChannel() {
    return this.detail.merchantChannelCounter?.map((e) => e.name + ' x' + e.value).join(', ');
  }

  get currency() {
    return this.detail.payments?.length ? this.detail.payments.map((e) => e.currency) : [];
  }

  get currencyValue() {
    return this.currency[this.curTab];
  }

  get currencyData() {
    return this.detail.payments?.length ? this.detail.payments.find((e) => e.currency === this.currencyValue) : {};
  }

  get currencyDeposit() {
    return this.currencyData.details?.filter((e) => e.paymentCategory === 'Deposit') || [];
  }

  get currencyWithdraw() {
    return this.currencyData.details?.filter((e) => e.paymentCategory === 'Withdraw') || [];
  }

  // 服务地区、时区配置、场景的数据要从出入款配置中获取，提交的时候全部都要进行更改提交
  get secondData() {
    // 匹配出入款里面任意一条
    const data = this.currencyData || {};
    return {
      platforms: data.platforms || [],
      serviceArea: data.serviceArea || [],
      timeZone: data.timeZone || '',
    };
  }

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private selectApi: SelectApi,
    private api: ChannelApi,
    private appService: AppService,
    private activatedRoute: ActivatedRoute,
    public lang: LangService
  ) {
    const { id } = activatedRoute.snapshot.params;
    this.id = id || '';
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group(
      {
        callbackIP: [''], // 回调IP 对应whitelist字段
        description: [''],
      },
      {
        validators: Validators.compose([validatorMaintenanceRangeTime]),
      }
    );

    this.appService.isContentLoadingSubject.next(true);
    forkJoin([
      this.selectApi.goMoneyGetCurrencies(),
      this.api.getChannelDetail(this.id),
      this.selectApi.goMoneyGetPaymentMethods(),
      this.api.getRisk(),
      this.api.getCredit(),
    ])
      .pipe(finalize(() => this.appService.isContentLoadingSubject.next(false)))
      .subscribe(([currencies, detail, payment, risk, credit]) => {
        this.currencies = currencies;
        this.detail = detail;
        this.curTab = 0;
        this.payment = payment;
        this.riskList = risk;
        this.creditList = credit;

        this.loadForm(detail);
        this.init = true;
      });
  }

  loadForm(detail?): void {
    if (!detail) return;

    this.formGroup.patchValue({
      description: detail.description,
      callbackIP: detail.whitelist?.join(',') || '',
    });

    this.validator = new FormValidator(this.formGroup);
  }

  back(): void {
    this.router.navigate(['/money/channelConfig']).then();
  }

  onSubmit(): void {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    const payment = this.detail.payments.map((e) => ({
      ...e,
      details: e.details.map((j) => {
        const data = cloneDeep(j);

        data.feeRate = (j.feeRate * 1e6) / 1e8;
        data.validPeriodTime = ['', null].includes(j.validPeriodTime) ? null : +j.validPeriodTime;

        return data;
      }),
    }));

    const sendData = {
      ...this.detail,
      editPaymentInfos: payment,
      description: this.formGroup.value.description,
      whitelist: (this.formGroup.value.callbackIP || '')
        .split(',')
        .map((e) => (e ? e.trim() : e))
        .filter((e) => e),
    };

    delete sendData.payments;

    this.appService.isContentLoadingSubject.next(true);
    this.api.updateChannel(sendData).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      if (typeof res === 'boolean') {
        this.appService.showToastSubject.next({
          msgLang: 'payment.channelConfig.updateCompleted',
          successed: true,
        });
        return this.back();
      }

      this.appService.showToastSubject.next({ msgLang: 'payment.channelConfig.updateFailed' });
    });
  }

  getCurrencyLabel(code: string): string {
    return this.payment.find((e) => e.code === code)?.name || '';
  }

  /** 数组toggle选择 */
  toggleArr(arr: any[], value: any | any[]): void {
    if (!Array.isArray(arr)) return;

    const fn = (value: any) => {
      const index = arr.indexOf(value);

      if (index >= 0) {
        arr.splice(index, 1);
      } else {
        arr.push(value);
      }
    };

    Array.isArray(value) ? value.forEach((v) => fn(v)) : fn(value);
  }

  /** 平台选择 */
  setPlat(now, value) {
    if (!now) return;

    this.toggleArr(now, value);

    /** 不区分币种 */
    this.detail.payments.forEach((e) => {
      e.platforms.splice(0, -1 >>> 0, ...now);
    });

    /** 区分当前币种下 */
    // this.currencyDeposit.forEach(e => (e.platforms.splice(0, -1 >>> 0, ...now))); // 替换赋值当前币种所有项
    // this.currencyWithdraw.forEach(e => (e.platforms.splice(0, -1 >>> 0, ...now))); // 替换赋值当前币种所有项
  }
}
