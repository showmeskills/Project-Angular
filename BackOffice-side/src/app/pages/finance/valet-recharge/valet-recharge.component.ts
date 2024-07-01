import { Component, OnDestroy, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { SelectCurrencyComponent } from 'src/app/pages/finance/valet-recharge/select-currency/select-currency.component';
import { SelectApi } from 'src/app/shared/api/select.api';
import { Currency } from 'src/app/shared/interfaces/currency';
import { lastValueFrom, Subject } from 'rxjs';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { TransactionApi } from 'src/app/shared/api/transaction.api';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentChannel } from 'src/app/shared/interfaces/transaction';
import { ActivatedRoute } from '@angular/router';
import { LocationService } from 'src/app/shared/service/location.service';
import { takeUntil } from 'rxjs/operators';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { InputTrimDirective, InputNumberDirective } from 'src/app/shared/directive/input.directive';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';

@Component({
  selector: 'valet-recharge',
  templateUrl: './valet-recharge.component.html',
  styleUrls: ['./valet-recharge.component.scss'],
  standalone: true,
  imports: [
    FormRowComponent,
    FormsModule,
    InputTrimDirective,
    ReactiveFormsModule,
    NgIf,
    IconSrcDirective,
    AngularSvgIconModule,
    NgFor,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    InputNumberDirective,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    AttrDisabledDirective,
    SearchDirective,
    AsyncPipe,
    SearchInpDirective,
  ],
})
export class ValetRechargeComponent implements OnInit, OnDestroy {
  constructor(
    private appService: AppService,
    private modal: MatModal,
    private selectApi: SelectApi,
    private api: TransactionApi,
    private subHeader: SubHeaderService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private location: LocationService,
    public lang: LangService
  ) {
    const { uid, actualName } = activatedRoute.snapshot.queryParams;
    if (!uid) return;

    this.uid = uid;
    this.formGroup.get('user')?.setValue(uid);
    if (actualName) this.formGroup.get('accountName')?.setValue(actualName);
  }

  uid = '';
  currency: Currency[] = [];
  readonly EMPTY_FORM = {
    user: '',
    currency: '',
    channel: '',
    amount: '',
    accountName: '',
  };

  formGroup = this.fb.group({
    user: [this.EMPTY_FORM.user, Validators.required],
    currency: [this.EMPTY_FORM.currency, Validators.required],
    channel: [this.EMPTY_FORM.channel, Validators.required],
    amount: [this.EMPTY_FORM.amount, Validators.required],
    accountName: [this.EMPTY_FORM.accountName, Validators.required],
  });

  curTab: string = '';
  payChannel: PaymentChannel[] = [];
  _destroy$ = new Subject<void>();

  /** lifeCycle */
  ngOnInit(): void {
    this.subHeader.merchantId$.pipe(takeUntil(this._destroy$)).subscribe(() => this.getPaymentChannelList());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /** methods */
  /** 打开选择币种 */
  async onOpen() {
    if (!this.currency.length) {
      this.appService.isContentLoadingSubject.next(true);
      this.currency = await lastValueFrom(this.selectApi.getCurrencySelect(false));
      this.appService.isContentLoadingSubject.next(false);
    }

    if (!this.currency?.length)
      return this.appService.showToastSubject.next({ msgLang: 'budget.record.noCoinListData' });
    const modal = this.modal.open(SelectCurrencyComponent, { width: '500px' });

    modal.componentInstance.update([...this.currency], this.formGroup.get('currency')?.value?.['code'] || undefined);
    const res = await modal.result;

    if (!res || !res.length) return this.appService.showToastSubject.next({ msgLang: 'budget.pleaseSelectCurrency' });
    this.formGroup.get('currency')?.setValue(this.currency.find((e) => e.code === res[0]) as any);

    this.getPaymentChannelList();
  }

  /** 支付方式 */
  getPaymentChannelList() {
    if (!this.formGroup.get('currency')?.value?.['code']) return;

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .c2cpaymentchannellist({
        tenantId: this.subHeader.merchantCurrentId,
        currency: this.formGroup.value.currency?.['code'],
        category: 'Deposit',
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!res?.length) {
          this.payChannel = [];
          return this.appService.showToastSubject.next({ msgLang: 'budget.record.noPaymentMethod' });
        }

        this.payChannel = res;
        this.curTab = res?.[0]?.paymentMethodeCode || '';
        // this.formGroup.get('methodCode')?.setValue('');
        this.formGroup.get('channel')?.setValue('');
        this.formGroup.markAsUntouched();
      });
  }

  /** 提交前校验弹窗 */
  onSubmitBefore(tpl: any) {
    this.formGroup.markAllAsTouched();

    if (
      this.formGroup.get('user')?.valid &&
      this.formGroup.get('amount')?.valid &&
      this.formGroup.get('accountName')?.valid
    ) {
      // 只剩下支付方式没有校验通过以下进行弹窗友好提醒
      if (!this.payChannel.length && this.formGroup.value.currency) {
        return this.appService.showToastSubject.next({
          msgLang: 'budget.record.currentNoPaymentMethod',
        });
        // } else if (this.formGroup.get('methodCode')?.invalid) {
        //   return this.appService.showToastSubject.next({ msgLang: 'budget.record.rechargeMethod' });
      } else if (this.formGroup.get('channel')?.invalid) {
        return this.appService.showToastSubject.next({ msgLang: 'budget.record.selectRechargeChannel' });
      }
    }

    if (this.formGroup.invalid) return;

    // 打开二次确认弹窗
    this.modal.open(tpl, { width: '500px' });
  }

  /** 提交 前已经被校验过了这里不用再校验了 */
  onSubmit(resultTpl: any, c?: any): void {
    c(); // 先关闭二次确认弹窗

    this.appService.isContentLoadingSubject.next({
      loading: true,
      msgLang: 'budget.awaitingFeedback',
    });
    this.api
      .deposithelper({
        tenantId: this.subHeader.merchantCurrentId,
        uidName: this.formGroup.value.user as string,
        currency: this.formGroup.value.currency?.['code'],
        paymentMethod: this.curTab as string,
        paymentChannel: this.formGroup.value.channel as string,
        amount: this.formGroup.value.amount as string,
        accountName: this.formGroup.value.accountName as string,
      })
      .subscribe(async (res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (!res.orderNumber) return this.appService.showToastSubject.next({ msgLang: 'budget.record.rechargeFailed' });

        // 打开回调结果弹窗
        const modal = this.modal.open(resultTpl, {
          width: '500px',
          data: { ...res, createTime: Date.now() },
          disableClose: true,
        });

        modal.result.finally(() => {
          const formValue: any = { ...this.EMPTY_FORM };

          if (this.uid) {
            delete formValue['user'];
            delete formValue['accountName'];
          }

          this.payChannel = [];
          this.formGroup.markAsUntouched();
          this.formGroup.reset(formValue);
        });
      });
  }

  /** 支付方式radio改变 */
  onMethodChange() {
    this.formGroup.get('channel')?.setValue(''); // 渠道置空
  }

  /** tab切换 */
  onTab(nav: PaymentChannel) {
    this.curTab = nav.paymentMethodeCode;

    // this.formGroup.get('methodCode')?.setValue(''); // 支付方式置空
    this.formGroup.get('channel')?.setValue(''); // 渠道置空
  }

  /** 返回 */
  onBack() {
    this.location.back();
  }
}
