import { Component, HostListener, OnInit } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { ResetPassWordApi } from 'src/app/shared/apis/reset-password.api';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { ToastService } from 'src/app/shared/service/toast.service';
@UntilDestroy()
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  constructor(
    private passWordApi: ResetPassWordApi,
    private localStorageService: LocalStorageService,
    private encryptService: EncryptService,
    private toast: ToastService,
    private localeService: LocaleService,
    private appService: AppService,
    private layout: LayoutService,
    private accountApi: AccountApi,
  ) {}

  oldPassword: string = ''; //旧密码
  password: string = ''; //密码
  passwordConfirm: string = ''; //确认密码
  submitLoading: boolean = false; //是否在注册中
  setSuccessful: boolean = false; //显示修改成功页面
  isH5!: boolean;
  oldPwdValid = {
    error: false,
  };
  newPwdValid = {
    v1: false,
    v2: false,
    v3: false,
    strength: 0,
    valid: false,
  };
  rePwdValid = {
    valid: false,
  };

  /** 第三方 没有密码直接登录 */
  isSetFirstPassword: boolean = true;

  /** header title */
  headerTitle!: string;

  /** 页面准备 */
  isReady: boolean = false;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(e => (this.isH5 = e));
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(userInfo => {
      if (typeof userInfo?.hasPassword === 'boolean') {
        this.isReady = true;
        this.isSetFirstPassword = userInfo!.hasPassword;
        if (!userInfo!.hasPassword) {
          this.headerTitle = this.localeService.getValue('set_pwd');
        } else {
          this.headerTitle = this.localeService.getValue('change_pwd');
        }
      }
    });
  }

  /**
   * 密码规则验证
   */
  checkOldPassword() {
    this.oldPwdValid.error = this.oldPassword.length < 1;
  }
  /**
   * 密码规则验证
   */
  onPasswordInput() {
    //规则1：密码长度为8-20个字符
    this.newPwdValid.v1 = this.password.length >= 8 && this.password.length <= 20;
    //规则2：必须包含1位数字
    this.newPwdValid.v2 = /\d/.test(this.password);
    //规则3：必须包含1位大写字母
    this.newPwdValid.v3 = /[A-Z]/.test(this.password);
    if (this.password.length < 8) {
      this.newPwdValid.strength = 1;
      this.newPwdValid.valid = false;
    } else {
      let strength = 0;
      if (this.newPwdValid.v2) strength += 1;
      if (this.newPwdValid.v3) strength += 1;
      //小写字母
      if (/[a-z]/.test(this.password)) strength += 1;
      //特殊符号
      if (/[^\w\s]+/.test(this.password)) strength += 1;
      this.newPwdValid.strength = strength;
      if (this.newPwdValid.v1 && this.newPwdValid.v2 && this.newPwdValid.v3) {
        this.newPwdValid.valid = true;
      } else {
        this.newPwdValid.valid = false;
      }
    }
  }

  /**
   * 注册按钮是否可以点击
   */
  get canSubmit(): boolean {
    return this.newPwdValid.valid && this.rePwdValid.valid && !this.submitLoading && !this.oldPwdValid.error;
  }

  /**
   * 提交
   */
  @HostListener('document:keydown.enter')
  async submit() {
    if (!this.canSubmit) return;
    this.submitLoading = true;
    console.log(this.oldPassword, this.password);
    //加密密码
    const oldPassword = this.encryptService.encrypt(this.oldPassword);
    const password = this.encryptService.encrypt(this.password);

    const result = await this.passWordApi.modifyPassword(oldPassword, password);

    const { success, message }: any = result;
    if (success) {
      this.submitLoading = false;
      this.setSuccessful = true;
      this.toast.show({ message: this.localeService.getValue('pwd_change_success'), type: 'success' });
    } else {
      this.submitLoading = false;
      this.toast.show({ message: message, type: 'fail' });
    }
  }

  /**
   * 新密碼與舊密碼是否一致
   */
  checkPassword() {
    this.rePwdValid.valid = this.passwordConfirm === this.password;
  }
  //返回登录页面
  handleback() {
    this.localStorageService.token = this.localStorageService.loginToken = '';
    this.appService.refresh$.next(true);
  }

  /*--------以下为第三方新增--------*/
  get canSubmitFirstPasswod(): boolean {
    return this.newPwdValid.valid && !this.submitLoading;
  }

  /** 首次密码设置 */
  onSubmitFirstPassword() {
    this.submitLoading = true;
    this.passWordApi
      .onSetPassword({
        newPassword: this.encryptService.encrypt(this.password),
      })
      .subscribe(data => {
        this.submitLoading = false;
        if (data?.data) {
          this.submitLoading = true;
          // 在设置密码后 再更新 用户信息
          this.accountApi.getUserAccountInfor().subscribe(result => {
            this.submitLoading = false;
            this.password = '';
            if (result?.data) {
              this.appService.userInfo$.next(result.data);
              this.toast.show({ message: this.localeService.getValue('set_pwd_success'), type: 'success' });
            } else {
              this.toast.show({ message: data.message, type: 'fail' });
            }
          });
        } else {
          this.toast.show({ message: data.message, type: 'fail' });
        }
      });
  }
}
