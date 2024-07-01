import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadModule } from 'src/app/shared/components/upload/upload.module';
import { FormRowModule } from 'src/app/shared/components/form-row/form-row.module';
import { FormBuilder, ReactiveFormsModule, ValidatorFn } from '@angular/forms';

import { MAT_MODAL_DATA, MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { AppService } from 'src/app/app.service';
import { LangModule } from 'src/app/shared/components/lang/lang.module';

import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { ImgViewerComponent } from 'src/app/shared/components/img-viewer/img-viewer.component';
import { ChannelApi } from 'src/app/shared/api/channel.api';
import { validatorNumberRequired } from 'src/app/shared/models/validator';
import { InputFloatDirective } from 'src/app/shared/directive/input.directive';

@Component({
  selector: 'revoke-amount',
  standalone: true,
  imports: [
    CommonModule,
    UploadModule,
    FormRowModule,
    ReactiveFormsModule,
    MatModalModule,
    LangModule,
    ImgViewerComponent,
    InputFloatDirective,
  ],
  templateUrl: './revoke-amount.component.html',
  styleUrls: ['./revoke-amount.component.scss'],
})
export class RevokeAmountComponent implements OnInit {
  constructor(
    private appService: AppService,
    public modal: MatModalRef<RevokeAmountComponent>,
    private fb: FormBuilder,
    private channelApi: ChannelApi,
    @Inject(MAT_MODAL_DATA) public refData: any
  ) {}

  typeList: Array<{ code: string; label: string; lang: string; noRender?: boolean }> = [
    { code: '', label: '全部冲正', lang: 'payment.order.allRevoke' },
    { code: 'partial', label: '部分冲正', lang: 'payment.order.partialReverse' },
  ];

  get maxAmount() {
    return this.refData.maxAmount || 0;
  }

  private _list: string[] = [];
  get list() {
    return this._list;
  }

  set list(v) {
    this._list = v;
    this.formGroup.controls.img.updateValueAndValidity();
  }

  formGroup = this.fb.group({
    type: [''],
    amount: [''],
    img: ['', this.customUploadValidator()],
  });

  ngOnInit(): void {}

  submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    const receiveAmount = this.formGroup.value.type === 'partial' ? +this.formGroup.value.amount! || 0 : 0;

    this.appService.isContentLoadingSubject.next(true);
    this.channelApi
      .sendRedemption({
        id: this.refData.id,
        imagePath: this.list,
        receiveAmount,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);

        if (res?.success === true) return this.modal.close(true);
        this.appService.showToastSubject.next({ msgLang: 'payment.order.revokeFail', successed: false });
      });
  }

  onTypeChange() {
    const isPartial = this.formGroup.value.type === 'partial';
    this.formGroup.controls.amount.setValidators(isPartial ? [validatorNumberRequired, this.validatorMaxAmount()] : []);
    this.formGroup.controls.amount.updateValueAndValidity();
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

  private validatorMaxAmount(): ValidatorFn {
    return (control) => (+control.value > this.maxAmount ? { gtMax: true } : null);
  }
}
