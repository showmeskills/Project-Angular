import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { FormValidator } from 'src/app/shared/form-validator';
import { UserApi } from 'src/app/shared/api/user.api';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/api/account.api';
import { encryptByEnAES } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { NgIf } from '@angular/common';
import { InputRevealDirective, RevealComponent } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent, FormFullDirective } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    FormRowComponent,
    FormWrapComponent,
    FormFullDirective,
    InputRevealDirective,
    RevealComponent,
    NgIf,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class ResetPassComponent implements OnInit {
  constructor(
    public modal: MatModalRef<ResetPassComponent, boolean>,
    private fb: FormBuilder,
    private appService: AppService,
    private api: UserApi,
    private accountApi: AccountApi,
    public lang: LangService
  ) {}

  formGroup: FormGroup = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: this.fb.group(
      {
        password: ['', Validators.required],
        againPassword: ['', Validators.required],
      },
      { validators: [this.validatorPassword] }
    ),
  });

  validator = new FormValidator(this.formGroup);

  ngOnInit(): void {}

  /** methods */
  /** 验证器：两次密码一致 */
  validatorPassword(name: AbstractControl) {
    if (name.value.password && name.value.againPassword && name.value.password !== name.value.againPassword) {
      return { password: true };
    }
    return null;
  }

  /** 验证密码 */
  get checkPassword() {
    const newPass = this.formGroup.get('newPassword');
    return newPass?.hasError('password') && (newPass.dirty || newPass.touched);
  }

  /** 提交 */
  onSubmit() {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) return;

    this.appService.isContentLoadingSubject.next(true);
    this.accountApi.getpasswordencryptkey().subscribe((encrypt) => {
      const oriPassword = encryptByEnAES(this.formGroup.get('oldPassword')!.value, encrypt.encyptKey as any);
      const newPassword = encryptByEnAES(this.formGroup.get('newPassword.password')!.value, encrypt.encyptKey as any);

      this.api
        .updatePassword({
          oriPassword,
          newPassword,
          PasswordKey: encrypt.key,
        })
        .subscribe((res) => {
          this.appService.isContentLoadingSubject.next(false);

          if (res === true) {
            this.modal.close(true);
            this.appService.showToastSubject.next({
              msgLang: 'common.updateCompleted',
              successed: true,
            });
          } else {
            this.appService.showToastSubject.next({
              msgLang: 'common.updateFailed',
              successed: false,
            });
          }
        });
    });
  }
}
