import { Component, OnInit } from '@angular/core';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import {
  AbstractControl,
  FormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { validatorIP } from 'src/app/shared/models/validator';
import { AppService } from 'src/app/app.service';
import { IPApi } from 'src/app/shared/api/ip.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { InputTrimDirective } from 'src/app/shared/directive/input.directive';
import { MatOptionModule } from '@angular/material/core';
import { NgFor } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';

@Component({
  selector: 'AddWhiteIp',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    NgFor,
    MatOptionModule,
    InputTrimDirective,
    LangPipe,
  ],
})
export class AddWhiteIPComponent implements OnInit {
  constructor(
    public subHeaderService: SubHeaderService,
    private fb: FormBuilder,
    public router: Router,
    private appService: AppService,
    private api: IPApi
  ) {
    subHeaderService.loadMerchant(true);
  }

  formGroup = this.fb.group({
    merchantId: [0, Validators.compose([Validators.required, Validators.pattern(/[^0]/)])],
    ip: this.fb.group(
      {
        merchantWhiteList: ['', validatorIP(',', true, true)],
        adminWhiteList: ['', validatorIP(',', true, true)],
      },
      { validators: this.validatorIPTypeInp() }
    ),
    description: ['', Validators.required],
  });

  ngOnInit(): void {}

  /**
   * 验证IP类型二选一输入
   */
  validatorIPTypeInp(): ValidatorFn {
    return (group: AbstractControl<typeof this.formGroup.value.ip>): ValidationErrors | null => {
      if (!group.value?.merchantWhiteList && !group.value?.adminWhiteList) return { twoOr: true }; // 二选一

      return null;
    };
  }

  /**
   * 返回
   */
  onBack() {
    this.router.navigate(['/system/mw-ip']);
  }

  /**
   * 提交
   */
  onSubmit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) return this.appService.showToastSubject.next({ msgLang: 'form.formInvalid' });

    this.appService.isContentLoadingSubject.next(true);
    this.api
      .addWhite({
        merchantId: this.formGroup.value.merchantId!,
        merchantWhiteList: (this.formGroup.value?.ip?.merchantWhiteList || '')
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e),
        adminWhiteList: (this.formGroup.value?.ip?.adminWhiteList || '')
          .split(',')
          .map((e) => e.trim())
          .filter((e) => e),
        description: this.formGroup.value.description!,
      })
      .subscribe((res) => {
        this.appService.isContentLoadingSubject.next(false);
        this.appService.toastOpera(res === true);
        res === true && this.onBack();
      });
  }
}
