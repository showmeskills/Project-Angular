import { Component, HostListener, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ResetPassWordApi } from 'src/app/shared/apis/reset-password.api';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { PasswordService } from '../password.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  constructor(
    private resetPassWordApi: ResetPassWordApi,
    private passwordService: PasswordService,
    private appService: AppService,
    private toast: ToastService,
    private encryptService: EncryptService,
    private localeService: LocaleService
  ) {}

  password: string = ''; //密码
  passwordConfirm: string = ''; //确认密码

  submitLoading: boolean = false; //是否在注册中

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

  get canSubmit() {
    return this.newPwdValid.valid && this.rePwdValid.valid && !this.submitLoading;
  }

  ngOnInit(): void {}

  checkNewPwd() {
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

  checkRePwd() {
    this.rePwdValid.valid = this.passwordConfirm === this.password;
  }

  /**提交 */
  @HostListener('document:keydown.enter')
  submit() {
    if (!this.canSubmit) return;
    this.submitLoading = true;
    const unicode = this.passwordService.uniCode;
    const data = this.encryptService.encrypt(this.password);
    this.resetPassWordApi.postResetPwd(data, unicode).subscribe((res: any) => {
      this.submitLoading = false;
      if (res?.data) {
        //密码修改成功，跳转到登录
        this.toast.show({ message: this.localeService.getValue('pwd_change_success'), type: 'success' });
        this.appService.jumpToLogin(true);
        return;
      }
      //2013 禁用用户
      if (res?.code === '2013') {
        this.appService.showForbidTip('login');
        return;
      }
      //匹配不到，返回错误
      this.toast.show({
        message: res?.message,
        type: 'fail',
      });
    });
  }
}
