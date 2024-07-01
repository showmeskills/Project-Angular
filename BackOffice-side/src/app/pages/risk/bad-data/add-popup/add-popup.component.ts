import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormWrapComponent } from 'src/app/shared/components/form-row/form-wrap.component';
import { LangTabComponent } from 'src/app/shared/components/lang-tab/lang-tab.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { AttrDisabledDirective } from 'src/app/shared/directive/d-disabled.directive';
import { CheckboxArrayControlDirective } from 'src/app/shared/directive/input.directive';
import { validatorArrayRequired } from 'src/app/shared/models/validator';

@Component({
  selector: 'bad-data-add-popup',
  templateUrl: './add-popup.component.html',
  styleUrls: ['./add-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ModalTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    LangTabComponent,
    FormRowComponent,
    FormWrapComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    ModalFooterComponent,
    LangPipe,
    AttrDisabledDirective,
    CheckboxArrayControlDirective,
  ],
})
export class BadDataAddPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<BadDataAddPopupComponent>,
    public activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    public appService: AppService,
    public subHeaderService: SubHeaderService,
    private api: MemberApi
  ) {}

  @Input() tenantId;

  /** 数据类型 */
  categoryList = [
    { name: 'IP', lang: 'allPop.ip', value: 'IP' },
    { name: '邮箱', lang: 'auManage.sys.email', value: 'Email' },
    { name: '设备指纹', lang: 'risk.deviceFingerprint', value: 'Fingerprint' },
  ];

  formGroup: FormGroup = this.fb.group({
    category: ['IP'], // 数据类型
    dataValue: ['', Validators.required], // 不良数据值
    comment: ['', Validators.required], // 评论信息
    brand: [[] as number[], validatorArrayRequired], // 选择的商户
  });

  ngOnInit() {}

  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return;

    const params = {
      tenantId: this.tenantId,
      type: this.formGroup.value.category,
      value: this.formGroup.value.dataValue,
      comment: this.formGroup.value.comment,
      brand: this.formGroup.value.brand,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.api.addbaddataconfig(params).subscribe((res) => {
      if (!res)
        return this.appService.showToastSubject.next(
          res?.message ? { msg: res?.message } : { msgLang: 'common.operationFailed' }
        );

      this.appService.showToastSubject.next({ msgLang: 'common.sucOperation', successed: true });

      this.modal.close(true);
    });
  }
}
