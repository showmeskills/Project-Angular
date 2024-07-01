import { Component, Input, OnInit } from '@angular/core';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { NgForOf, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TransStatusLabel } from 'src/app/pages/finance/finance.service';
import { OrderStatusEnum } from 'src/app/shared/interfaces/transaction';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AppService } from 'src/app/app.service';
import { WithdrawalsApi } from 'src/app/shared/api/withdrawals.api';
import { LabelComponent } from 'src/app/shared/components/label/label.component';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    TimeFormatPipe,
    FormatMoneyPipe,
    CurrencyValuePipe,
    LangPipe,
    TransStatusLabel,
    ReactiveFormsModule,
    FormRowComponent,
    NgForOf,
    LabelComponent,
  ],
})
export class EditComponent implements OnInit {
  constructor(
    public modal: MatModalRef<EditComponent>,
    private fb: FormBuilder,
    private appService: AppService,
    private api: WithdrawalsApi
  ) {}

  @Input() public item!: any;

  /**
   * 订单状态
   * @protected
   */
  protected readonly OrderStatusEnum = OrderStatusEnum;

  /**
   * 审核状态
   *
   * 备注：
   * 1.通过：不是必填项
   * 2.待定：必填项
   * 3.拒绝：必填项
   */
  operatorList = [
    { name: '通过', lang: 'finance.withdrawals.approve', value: true, remarksRequired: false },
    { name: '待定', lang: 'finance.withdrawals.onHold', value: null, remarksRequired: true },
    { name: '拒绝', lang: 'finance.withdrawals.reject', value: false, remarksRequired: true },
  ];

  operatorForm = this.fb.group({
    operator: [true as boolean | null],
    remark: [''],
  });

  ngOnInit() {
    if (this.item.status === OrderStatusEnum[OrderStatusEnum.OnHold]) {
      this.operatorForm.setValue({
        operator: null,
        remark: this.item.approveRemark2 || this.item.approveRemark1,
      });
      this.operatorForm.controls.remark.setValidators(Validators.required);
      this.operatorForm.updateValueAndValidity();
    }
  }

  onConfirm(): void {
    this.operatorForm.markAllAsTouched();
    if (this.operatorForm.invalid) return this.appService.showToastSubject.next({ msgLang: 'risk.fillRemarks' });

    this.api[this.item.isApprove2 ? 'withdrawReview2' : 'withdrawReview'](
      this.item.id,
      this.operatorForm.getRawValue().operator,
      this.operatorForm.value.remark
    ).subscribe((res) => {
      res = res === true;

      this.appService.toastOpera(res);
      if (!res) return;

      this.modal.close(true);
    });
  }

  /**
   * 审核选项改变
   * @param remarksRequired
   */
  onReviewChange(remarksRequired: boolean) {
    this.operatorForm.controls.remark.setValidators(remarksRequired ? Validators.required : null);
    this.operatorForm.controls.remark.updateValueAndValidity();
  }
}
