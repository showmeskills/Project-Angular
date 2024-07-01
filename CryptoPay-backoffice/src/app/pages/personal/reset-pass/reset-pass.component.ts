import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { FormValidator } from 'src/app/shared/form-validator';
import { UserApi } from 'src/app/shared/api/user.api';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/api/account.api';
import { encryptByEnAES } from 'src/app/shared/models/tools.model';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LoginErrorEnum, ModifyPasswordModalResult } from 'src/app/shared/interfaces/login';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { InputRevealDirective, RevealComponent } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent, FormFullDirective } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NgIf } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.scss'],
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    FormRowComponent,
    FormWrapComponent,
    FormFullDirective,
    InputRevealDirective,
    RevealComponent,
    ModalFooterComponent,
    LangPipe,
  ],
})
export class ResetPassComponent implements OnInit {
  constructor(
    public modal: MatModalRef<ResetPassComponent, ModifyPasswordModalResult>,
    private fb: FormBuilder,
    private appService: AppService,
    private api: UserApi,
    private accountApi: AccountApi,
    public lang: LangService
  ) {}

  formGroup = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: this.fb.group(
      {
        password: ['', Validators.required],
        againPassword: ['', Validators.required],
      },
      { validators: [this.validatorPassword] }
    ),
  });

  status: LoginErrorEnum = LoginErrorEnum.Normal;
  validator = new FormValidator(this.formGroup);

  /**
   * 是否为强制修改密码
   */
  get isForce() {
    return this.status === LoginErrorEnum.RestPassword;
  }

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
      const oriPassword = encryptByEnAES(this.formGroup.value.oldPassword!, encrypt.encyptKey as any);
      const newPassword = encryptByEnAES(this.formGroup.value.newPassword?.password!, encrypt.encyptKey as any);

      this.api
        .updatePassword({
          oriPassword,
          newPassword,
          PasswordKey: encrypt.key,
        })
        .subscribe((res) => {
          this.appService.isContentLoadingSubject.next(false);

          this.appService.toastOpera(res === true);
          res === true && this.modal.close({ success: true, newPassword: this.formGroup.value.newPassword?.password });
        });
    });
  }

  /**
   * 设置状态
   */
  setType(status: LoginErrorEnum, username: string, currentPassword: string) {
    if (status === LoginErrorEnum.RestPassword) {
      this.setForce(currentPassword);
    }
  }

  /**
   * 设置强制重置密码状态
   */
  setForce(currentPassword: string) {
    this.formGroup.get('oldPassword')?.setValue(currentPassword);
    this.status = LoginErrorEnum.RestPassword;
  }
}
