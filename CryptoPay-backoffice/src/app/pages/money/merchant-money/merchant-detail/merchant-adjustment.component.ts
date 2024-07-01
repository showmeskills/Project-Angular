import { Component, OnInit, Optional } from '@angular/core';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectApi } from 'src/app/shared/api/select.api';
import { zip } from 'rxjs';
import { FlowType } from 'src/app/shared/interfaces/channel';
import { AppService } from 'src/app/app.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import { CodeName } from 'src/app/shared/interfaces/base.interface';
import { MoneyApi } from 'src/app/shared/api/money.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  template: `
    <div class="modal-header">
      <div class="modal-title">{{ 'payment.merchantFunding.adjustment' | lang }}</div>
      <div class="c-btn-close" (click)="modal.dismiss()">
        <svg-icon [src]="'./assets/images/svg/admin-close.svg'" class="svg-icon"></svg-icon>
      </div>
    </div>

    <div class="w-100 px-12 py-8" [formGroup]="formGroup">
      <form-row
        [label]="'payment.merchantFunding.adjustmentType' | lang"
        label-width="110"
        name="type"
        [invalidFeedback]="{ required: 'payment.merchantFunding.adjustmentTypeTips' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <mat-form-field [style.width.px]="170">
            <mat-select
              [class.is-invalid]="invalid"
              class="form-control rounded-0"
              [formControl]="control"
              [placeholder]="'payment.merchantFunding.adjustmentTypeTips' | lang"
            >
              <mat-option [value]="item.code" *ngFor="let item of adjustmentList">{{ item.name }}</mat-option>
            </mat-select>
          </mat-form-field>
        </ng-template>
      </form-row>

      <form-row
        [label]="'common.currency' | lang"
        label-width="110"
        name="currency"
        [invalidFeedback]="{ required: 'common.currencyTips' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <mat-form-field [style.width.px]="170">
            <mat-select
              [class.is-invalid]="invalid"
              class="form-control rounded-0"
              [formControl]="control"
              [placeholder]="'common.currencyTips' | lang"
            >
              <mat-option [value]="item.code" *ngFor="let item of currencyList">{{ item.code }}</mat-option>
            </mat-select>
          </mat-form-field>
        </ng-template>
      </form-row>

      <!-- 金额输入 -->
      <form-row
        [label]="'common.amount' | lang"
        label-width="110"
        name="amount"
        [invalidFeedback]="{ numberRequired: 'common.amountTips' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <input
            class="form-control rounded-0"
            type="text"
            input-float
            [decimal]="8"
            [negative]="true"
            [class.is-invalid]="invalid"
            [style.width.px]="170"
            [formControl]="control"
          />
        </ng-template>
      </form-row>

      <!-- 备注 -->
      <form-row
        [label]="'common.remarks' | lang"
        label-width="110"
        name="description"
        [invalidFeedback]="{ required: 'common.remarksTips' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <textarea
            class="form-control rounded-0 resize-none"
            type="text"
            maxlength="50"
            [class.is-invalid]="invalid"
            [style.width.px]="330"
            [formControl]="control"
          ></textarea>
        </ng-template>
      </form-row>
    </div>

    <div class="modal-footer btn-wrap">
      <button type="button" class="c-btn btn btn-default" (click)="modal.dismiss()">
        {{ 'common.cancel' | lang }}
      </button>
      <button
        type="button"
        class="c-btn btn btn-primary"
        (click)="onSubmit()"
        [disabled]="appService.isContentLoadingSubject | async"
      >
        {{ 'common.confirm' | lang }}
      </button>
    </div>
  `,
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    InputFloatDirective,
    AsyncPipe,
    LangPipe,
  ],
})
export class MerchantAdjustmentComponent implements OnInit {
  constructor(
    @Optional() public modal: MatModalRef<any>,
    public subHeader: SubHeaderService,
    private fb: FormBuilder,
    private selectApi: SelectApi,
    private api: MoneyApi,
    public appService: AppService
  ) {}

  data = { merchantId: '', currency: '' };

  /** 表单数据FormControl */
  formGroup: any = this.fb.group({
    currency: ['', Validators.required],
    type: ['', Validators.required],
    amount: ['', validatorNumberRequired],
    description: ['', Validators.required],
  });

  /** 调整类型 */
  adjustmentList: FlowType[] = [];

  currencyList: CodeName[] = [];

  /** getters */
  /** lifeCycle */
  ngOnInit(): void {
    this.subHeader.goMoneyLoadMerchant(true);

    this.appService.isContentLoadingSubject.next(true);
    zip(this.selectApi.goMoneyGetCurrencies(), this.api.option_getmerchantadjustment()).subscribe(
      ([currency, adjustmentList]) => {
        this.appService.isContentLoadingSubject.next(false);

        this.currencyList = currency;
        this.adjustmentList = adjustmentList;
        adjustmentList?.length && this.formGroup.controls.type.setValue(adjustmentList[0].code);
      }
    );
  }

  /** methods */
  onSubmit() {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) return;
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .merchantaccount_fundingadjustment({
        merchantId: this.data.merchantId,
        merchantAdjustReason: this.formGroup.value.type,
        currency: this.formGroup.value.currency,
        amount: this.formGroup.value.amount,
        remark: this.formGroup.value.description,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res !== true)
          return this.appService.showToastSubject.next({ msgLang: 'payment.merchantFunding.adjustmentFail' });

        this.appService.showToastSubject.next({
          msgLang: 'payment.merchantFunding.adjustmentSuccess',
          successed: true,
        });
        this.modal.close(true);
      });
  }

  /** 设置值 */
  setData(data: typeof this.data) {
    this.data = data;
    this.formGroup.get('currency').setValue(data.currency);
  }
}
