import { Component, OnInit, Optional } from '@angular/core';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectApi } from 'src/app/shared/api/select.api';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { zip } from 'rxjs';
import {
  Adjustment,
  MerchantChannelAdjustment,
  MerchantChannelAdjustmentCurrency,
  PaymentMethod,
} from 'src/app/shared/interfaces/channel';
import { AppService } from 'src/app/app.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

// 资金调账
@Component({
  template: `
    <div class="modal-header">
      <div class="modal-title">{{ 'payment.subChannel.fundingAdjustment' | lang }}</div>
      <div class="c-btn-close" (click)="modal.dismiss()">
        <svg-icon [src]="'./assets/images/svg/admin-close.svg'" class="svg-icon"></svg-icon>
      </div>
    </div>

    <div class="w-100 px-12 py-8" [formGroup]="formGroup">
      <!--      <form-row label="商户" [label-width]="lang.isLocal ? '110' : '180'" name="merchant" [invalidFeedback]="{ required: '请选择商户' }">-->
      <!--        <ng-template let-invalid="invalid" let-control="formControl">-->
      <!--          <mat-form-field [style.width.px]="170" appearance="standard">-->
      <!--            <mat-select-->
      <!--              [class.is-invalid]="invalid"-->
      <!--              class="form-control rounded-0"-->
      <!--              [formControl]="control"-->
      <!--              placeholder="请选择商户"-->
      <!--              (selectionChange)="onMerchant($event.value)"-->
      <!--              [disabled]="isFixed"-->
      <!--            >-->
      <!--              <mat-option [value]="item.id" *ngFor="let item of subHeader.goMoneyMerchantList">{{-->
      <!--                item.name-->
      <!--              }}</mat-option>-->
      <!--            </mat-select>-->
      <!--          </mat-form-field>-->
      <!--        </ng-template>-->
      <!--      </form-row>-->

      <form-row
        [label]="'payment.subChannel.subchannel' | lang"
        [label-width]="lang.isLocal ? '110' : '180'"
        name="subChannel"
        [invalidFeedback]="{ required: 'payment.subChannel.selectSubChannel' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <mat-form-field [style.width.px]="170">
            <mat-select
              [class.is-invalid]="invalid"
              [formControl]="control"
              class="form-control rounded-0"
              [placeholder]="'payment.subChannel.selectSubChannel' | lang"
              (selectionChange)="reset(['currency', 'methods'])"
              [disabled]="isFixed"
              *search="let list of list; key: 'channelAccountAlias'"
            >
              <input type="text" searchInput />
              <mat-option [value]="item.channelAccountId" *ngFor="let item of list | async">
                {{ item.channelAccountAlias }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </ng-template>
      </form-row>

      <form-row
        *ngIf="formGroup.value.subChannel"
        [label]="'payment.currency.currency' | lang"
        [label-width]="lang.isLocal ? '110' : '180'"
        name="currency"
        [invalidFeedback]="{ required: 'payment.currency.pleaseSelectCurrency' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <mat-form-field [style.width.px]="170">
            <mat-select
              [class.is-invalid]="invalid"
              class="form-control rounded-0"
              [formControl]="control"
              [placeholder]="'payment.currency.pleaseSelectCurrency' | lang"
              (selectionChange)="reset(['methods'])"
            >
              <mat-option [value]="item.currency" *ngFor="let item of currencyList">{{ item.currency }}</mat-option>
            </mat-select>
          </mat-form-field>
        </ng-template>
      </form-row>

      <form-row
        *ngIf="formGroup.value.currency"
        [label]="'payment.paymentMethod.paymentMethod' | lang"
        [label-width]="lang.isLocal ? '110' : '180'"
        name="methods"
        [invalidFeedback]="{ required: 'payment.subChannel.selectPaymentMethod' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <mat-form-field [style.width.px]="170">
            <mat-select
              [class.is-invalid]="invalid"
              class="form-control rounded-0"
              [formControl]="control"
              [placeholder]="'payment.subChannel.selectPaymentMethod' | lang"
              (selectionChange)="reset([])"
            >
              <mat-option [value]="item.code" *ngFor="let item of curPaymentList">{{ item.name }}</mat-option>
            </mat-select>
          </mat-form-field>
        </ng-template>
      </form-row>

      <form-row
        [label]="'payment.subChannel.reasonAdjustment' | lang"
        [label-width]="lang.isLocal ? '110' : '180'"
        name="type"
        [invalidFeedback]="{ required: 'payment.subChannel.selectReasonAdjustment' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <mat-form-field [style.width.px]="170">
            <mat-select
              [class.is-invalid]="invalid"
              class="form-control rounded-0"
              [formControl]="control"
              [placeholder]="'payment.subChannel.selectReasonAdjustment' | lang"
            >
              <mat-option [value]="item.code" *ngFor="let item of adjustmentList">{{ item.name }}</mat-option>
            </mat-select>
          </mat-form-field>
        </ng-template>
      </form-row>

      <!-- 金额输入 -->
      <form-row
        [label]="'payment.subChannel.amount' | lang"
        [label-width]="lang.isLocal ? '110' : '180'"
        name="amount"
        [invalidFeedback]="{ numberRequired: 'payment.subChannel.enterAmount' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <input
            class="form-control rounded-0"
            type="text"
            input-float
            [decimal]="curCurrency ? (curCurrency.isDigital ? 8 : 2) : 8"
            [negative]="supportTypeNumber ? supportTypeNumber.negative : true"
            [negativeOnly]="supportTypeNumber ? supportTypeNumber.negativeOnly : true"
            [class.is-invalid]="invalid"
            [style.width.px]="170"
            [formControl]="control"
          />
        </ng-template>
      </form-row>

      <!-- 备注 -->
      <form-row
        [label]="'payment.channelConfig.remarks' | lang"
        [label-width]="lang.isLocal ? '110' : '180'"
        name="description"
        [invalidFeedback]="{ required: 'payment.subChannel.enterRemark' | lang }"
      >
        <ng-template let-invalid="invalid" let-control="formControl">
          <input
            class="form-control rounded-0"
            type="text"
            maxlength="50"
            [class.is-invalid]="invalid"
            [style.width.px]="170"
            [formControl]="control"
          />
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
    SearchDirective,
    MatSelectModule,
    SearchInpDirective,
    NgFor,
    MatOptionModule,
    NgIf,
    InputFloatDirective,
    AsyncPipe,
    LangPipe,
  ],
})
export class ChannelSubFundsComponent implements OnInit {
  constructor(
    @Optional() public modal: MatModalRef<any>,
    public subHeader: SubHeaderService,
    private fb: FormBuilder,
    private selectApi: SelectApi,
    private api: ChannelApi,
    public appService: AppService,
    public lang: LangService
  ) {}

  /** 表单数据FormControl */
  formGroup: any = this.fb.group({
    // merchant: ['', Validators.required],
    subChannel: ['', Validators.required],
    currency: ['', Validators.required],
    methods: ['', Validators.required],
    type: ['', Validators.required],
    amount: ['', validatorNumberRequired],
    description: ['', Validators.required],
  });

  /** 是否为固定 */
  isFixed = false;

  /** 调整类型 */
  adjustmentList: Adjustment[] = [];

  /** 列表数据 */
  list: MerchantChannelAdjustment[] = [];

  /** 支付方式原始列表 */
  paymentList: PaymentMethod[] = [];

  /** getters */
  /** 匹配的币种列表 */
  get currencyList(): MerchantChannelAdjustmentCurrency[] {
    return this.list.find((e) => e.channelAccountId === this.formGroup.controls.subChannel.value)?.details || [];
  }

  /** 当前币种 */
  get curCurrency(): MerchantChannelAdjustmentCurrency | undefined {
    return this.currencyList.find((e) => e.currency === this.formGroup.controls.currency.value);
  }

  /** 匹配的支付方式 */
  get curPaymentList(): PaymentMethod[] {
    return (
      (this.curCurrency && this.paymentList.filter((e) => this.curCurrency!.paymentMethods?.includes(e.code))) || []
    );
  }

  /** 是否支持数 */
  /**html中未使用name不翻译 */
  get supportTypeNumber() {
    return [
      // negative是否支持负数     negativeOnly只支持负数
      {
        code: 'FeeAdjustment',
        name: '手续费调账',
        negative: true,
        negativeOnly: false,
      },
      {
        code: 'ChannelFreeze',
        name: '渠道冻结',
        negative: true,
        negativeOnly: true,
      },
      {
        code: 'ChannelUnfreeze',
        name: '渠道解冻',
        negative: false,
        negativeOnly: false,
      },
      // {
      //   code: 'ManualWithdrawal',
      //   name: '下发',
      //   negative: true,
      //   negativeOnly: true,
      // },
      {
        code: 'BalanceAdjustment',
        name: '余额调整',
        negative: true,
        negativeOnly: false,
      },
    ].find((e) => e.code === this.formGroup.value.type);
  }

  /** lifeCycle */
  ngOnInit(): void {
    this.subHeader.goMoneyLoadMerchant(true);

    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.selectApi.goMoneyGetAdjustmentList(false, { isHidden: true }),
      this.selectApi.goMoneyGetPaymentMethods(),
      this.api.getMerchantSupportInfo(this.formGroup.value.subChannel)
    ).subscribe(([adjustmentList, paymentList, channel]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.adjustmentList = adjustmentList;
      adjustmentList?.length && this.formGroup.controls.type.setValue(adjustmentList[0].code);

      this.paymentList = paymentList;
      this.list = channel;
    });
  }

  /** methods */
  onSubmit() {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) return;
    this.appService.isContentLoadingSubject.next(true);
    this.api
      .merchantAdjustment({
        channelAccountId: this.formGroup.value.subChannel,
        currency: this.formGroup.value.currency,
        paymentMethodId: this.formGroup.value.methods,
        amount: this.formGroup.value.amount,
        paymentCategoryReason: this.formGroup.value.type,
        description: this.formGroup.value.description,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res !== true)
          return this.appService.showToastSubject.next({ msgLang: 'payment.subChannel.djustmentFailed' });

        this.appService.showToastSubject.next({
          msgLang: 'payment.subChannel.adjusteSuccessfully',
          successed: true,
        });
        this.modal.close(true);
      });
  }

  /** 重置空值 */
  reset(key: string[]) {
    this.formGroup.patchValue(key.filter((e) => e).reduce((t, e) => ({ ...t, [e]: '' }), {}));
  }
}
