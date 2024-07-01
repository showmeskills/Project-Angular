import { Component, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { AccountApi } from 'src/app/shared/apis/account.api';
import { EncryptService } from 'src/app/shared/service/encrypt.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { ToastService } from 'src/app/shared/service/toast.service';

@Component({
  selector: 'app-reset-name',
  templateUrl: './reset-name.component.html',
  styleUrls: ['./reset-name.component.scss'],
})
export class ResetNameComponent {
  constructor(
    private router: Router,
    private accountApi: AccountApi,
    private appService: AppService,
    private toast: ToastService,
    private encryptService: EncryptService,
    private localeService: LocaleService
  ) {}

  @ViewChild('stepper') stepper?: MatStepper; // stepper 控制器
  @ViewChild('iUName', { static: false }) private userNameElement!: any; //用户名输入框
  // @ViewChild("iPwd", { static: false }) private oldPasswordElement!: ElementRef;       //旧密码输入框
  password: string = ''; //旧密码
  userName: string = ''; //用户名
  isLoading: boolean = false;
  showErrorText: string = '';
  /// api 需要
  uniCode: string = '';

  /**
   * Input Focus事件
   *
   * @param element
   */
  onFocus(element: any) {
    element.isFocus = true;
  }

  /**
   * Input Blur事件
   *
   * @param element
   */
  onBlur(element: any) {
    //延迟200MS，防止clear无法点击
    element.timer = setTimeout(() => {
      element.isFocus = false;
    }, 200);
  }

  /**
   * 控制密码的显示与隐藏
   *
   * @param element 密码输入框
   */
  showPwd(element: any) {
    element.isShowPwd = !element.isShowPwd;
    element.type = element.isShowPwd ? 'text' : 'password';
    if (element.isFocus) {
      element.focus();
      if (element.timer) {
        clearTimeout(element.timer);
      }
    }
  }

  /**
   * 清除输入框的内容
   *
   * @param element
   */
  clearInput(element: any) {
    element.value = '';
    element.focus();
    element.dispatchEvent(new InputEvent('input'));
    if (element.timer) {
      clearTimeout(element.timer);
    }
  }
  /**
   * 用户规则验证
   *
   * @param element 用户名输入框
   */
  onUserNameInput(element: any) {
    this.showErrorText = '';
    //规则1：用户名长度为6-18个字符
    element.isValid1 = this.userName.length >= 6 && this.userName.length <= 18;
    //规则2：用户名需要以字母开头
    element.isValid2 = /^[a-zA-Z]/.test(this.userName);
    //规则3：只能包含字母、数字、下划线
    element.isValid3 = /^\w+$/.test(this.userName);

    //是否全部验证通过
    element.isValid = element.isValid1 && element.isValid2 && element.isValid3;
  }

  /**
   * step 1 page 按钮是否可以点击
   */
  canSubmit1(): boolean {
    if (this.password.length > 2) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * step 2 page 按钮是否可以点击
   */
  canSubmit2(): boolean {
    if (!this.userNameElement) return false;
    return this.userNameElement.isValid;
  }

  //stepper 下一步 btn
  async goForward(stepper: MatStepper) {
    this.isLoading = true;
    switch (stepper.selectedIndex) {
      case 0:
        // 密码加密
        const data = this.encryptService.encrypt(this.password);
        // 后端验证 密码
        const result: any = await this.accountApi.postVerifyUsername(data);
        if (result.success) {
          this.uniCode = result.data;
          stepper.next();
        } else {
          this.showErrorText = this.localeService.getValue('pwd_error');
          this.toast.show({ message: this.localeService.getValue('pwd_error'), type: 'fail' });
        }
        break;
      case 1:
        // 修改用户名
        const callbackData: any = await this.accountApi.postResetUserName(this.uniCode, this.userName);
        if (callbackData.success) {
          const userInfo = this.appService.userInfo$.value ?? ({} as any);
          userInfo.userName = this.userName;
          this.appService.userInfo$.next(userInfo);
          stepper.next();
          this.toast.show({ message: this.localeService.getValue('username_change_success_title'), type: 'success' });
        } else {
          this.showErrorText = callbackData.message;
          this.toast.show({ message: callbackData.message, type: 'fail' });
        }

        break;
    }
    this.isLoading = false;
  }

  /**
   * ENTER 键提交
   *
   * @param stepper
   */
  checkToSubmit1(stepper: MatStepper) {
    if (!this.canSubmit1()) return;
    this.goForward(stepper);
  }
  checkToSubmit2(stepper: MatStepper) {
    if (!this.canSubmit2()) return;
    this.goForward(stepper);
  }

  /**
   * 返回 用户安全管理页面
   */
  handleback() {
    this.router.navigate([this.appService.languageCode, 'userCenter', 'security']);
  }
}
