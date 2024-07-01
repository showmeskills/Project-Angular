import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadModule } from 'src/app/shared/components/upload/upload.module';
import { FormRowModule } from 'src/app/shared/components/form-row/form-row.module';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';

import { MAT_MODAL_DATA, MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { LangModule } from 'src/app/shared/components/lang/lang.module';
import { OrderCancelReason } from 'src/app/shared/interfaces/financial';

import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { ImgViewerComponent } from 'src/app/shared/components/img-viewer/img-viewer.component';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';

@Component({
  selector: 'cancel-withdraw',
  standalone: true,
  imports: [
    CommonModule,
    UploadModule,
    FormRowModule,
    ReactiveFormsModule,
    MatModalModule,
    LangModule,
    ImgViewerComponent,
    InputTrimDirective,
  ],
  templateUrl: './cancel-withdraw.component.html',
  styleUrls: ['./cancel-withdraw.component.scss'],
})
export class CancelWithdrawComponent implements OnInit {
  constructor(
    private appService: AppService,
    public modal: MatModalRef<CancelWithdrawComponent>,
    private fb: FormBuilder,
    private channelApi: ChannelApi,
    @Inject(MAT_MODAL_DATA) public id: any
  ) {}

  reasonList: Array<{ code: OrderCancelReason; label: string; lang: string; noRender?: boolean }> = [
    { code: 'Customer', label: '客户取消申请', lang: 'payment.order.customerCancel' },
    { code: 'Fail', label: '出款失败', lang: 'payment.order.paymentFail' },
    { code: 'Other', label: '其他原因', lang: 'payment.order.otherTip', noRender: true },
  ];

  private _list: string[] = [];
  get list() {
    return this._list;
  }

  set list(v) {
    this._list = v;
    this.formGroup.controls.img.updateValueAndValidity();
  }

  formGroup = this.fb.group({
    reason: ['Customer', Validators.required],
    remark: [''],
    img: ['', this.customUploadValidator()],
  });

  ngOnInit(): void {}

  submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    const remark =
      this.formGroup.value.reason === 'Other'
        ? this.formGroup.value.remark
        : this.reasonList.find((e) => e.code === this.formGroup.value.reason)?.label;

    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .sendCancelWithdraw({
        id: this.id,
        imagePath: this.list,
        cancelCategory: this.formGroup.value.reason as OrderCancelReason,
        remark: remark || '',
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res === true) return this.modal.close(true);
        this.appService.showToastSubject.next({ msgLang: 'payment.order.cancelFail', successed: false });
      });
  }

  onReasonChange() {
    const isOther = this.formGroup.value.reason === 'Other';
    this.formGroup.controls.remark.setValidators(isOther ? [Validators.required] : []);
    this.formGroup.controls.remark.updateValueAndValidity();
  }

  onOtherFocus(inp: HTMLInputElement) {
    this.formGroup.controls.reason.setValue('Other');
    this.onReasonChange();
    inp.select();
  }

  /** 上传图片 */
  onUpload({ uploadURL }, upload: UploadComponent, viewer: ImgViewerComponent) {
    if (!uploadURL || !uploadURL?.filePath) return;

    this.list = [...this.list, uploadURL?.filePath];
    viewer.updateIndex(this.list.length - 1);

    this.appService.showToastSubject.next({ msgLang: 'payment.transactionList.uploadSuc', successed: true });

    upload.clear();
  }

  /** 自定义上传验证 */
  customUploadValidator(): ValidatorFn {
    return () => (!(this.list && this.list?.length) ? { required: true } : null);
  }
}
