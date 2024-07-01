import { Component, OnInit } from '@angular/core';
import { MessageDialogComponent } from 'src/app/shared/components/dialogs/message-dialog/message-dialog.component';
import { AccountApi } from 'src/app/shared/api/account.api';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { Router } from '@angular/router';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { DynamicAsideMenuService } from 'src/app/_metronic/core';
import { encryptByEnAES } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { finalize, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResetPassComponent } from 'src/app/pages/personal/reset-pass/reset-pass.component';
import { LoginErrorEnum, LoginResult, ModifyPasswordModalResult } from 'src/app/shared/interfaces/login';
import { AppService } from 'src/app/app.service';
import { LangPipe, PreLangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ToastComponent } from 'src/app/shared/components/toast/toast.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { VersionComponent } from 'src/app/shared/components/version/version.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  host: { class: 'host' },
  standalone: true,
  imports: [
    VersionComponent,
    NgIf,
    NgClass,
    FormsModule,
    AngularSvgIconModule,
    ToastComponent,
    AsyncPipe,
    PreLangPipe,
    LangPipe,
  ],
})
export class LoginComponent implements OnInit {
  constructor(
    private modal: MatModal,
    private accountApi: AccountApi,
    protected localStorageService: LocalStorageService,
    private router: Router,
    private menu: DynamicAsideMenuService,
    private subHeader: SubHeaderService,
    public appService: AppService
  ) {}

  username = '';
  password = '';
  usernameValidate = false;
  passwordValidate = false;
  isLoading = false;
  isOnline = true; // 是否为线上版本
  readonly whiteNameError = [LoginErrorEnum.RestPassword]; // 错误name白名单，不弹出错误提示

  ngOnInit() {
    this.isOnline = environment.isOnline;
    this.modal.closeAll(); // 关闭所有弹窗，可能有强制跳转到登录页面的弹窗还未关闭
    this.subHeader.clearMerchant();
  }

  /**
   * 登录事件
   */
  onLogin() {
    this.login(this.username, this.password);
  }

  /**
   * 登录
   */
  login(username: string, password: string) {
    this.usernameValidate = username == '';
    this.passwordValidate = password == '';

    if (username == '' || password == '') {
      return;
    }

    this.usernameValidate = false;
    this.passwordValidate = false;
    this.isLoading = true;

    this.accountApi
      .getpasswordencryptkey() // 获取加密key
      .pipe(
        switchMap((encrypt) => {
          if (!(encrypt?.encyptKey || encrypt?.key)) throw encrypt; // 如果没有加密key，抛出错误

          // 进行登录
          return this.accountApi.login({
            tenantId: 1,
            userName: username,
            password: encryptByEnAES(password, encrypt.encyptKey),
            passwordKey: encrypt.key,
          });
        }),
        tap((res) => {
          if (!res?.['token']) {
            this.modal.open(MessageDialogComponent, {
              data: { hasSvg: false, hasTitle: false, content: 'token is empty' },
            });

            throw res; // 没有返回token，抛出异常
          }

          this.localStorageService.token = res.token;
        }),
        switchMap((res) => this.getUserInfo$(res, username, password)), // 获取用户信息
        catchError((res) => {
          if (this.whiteNameError.includes(res?.name)) throw res; // 如果是白名单错误，不弹出错误提示

          this.modal.open(MessageDialogComponent, {
            data: { hasSvg: false, hasTitle: false, content: res?.error?.detail || 'Service Error' },
          });

          throw res;
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe();
  }

  /**
   * 获取用户信息
   */
  getUserInfo$(loginRes: LoginResult, username: string, password: string) {
    // 记录被退出到登录页面的 账号名称；（功能关联登录重定向）
    const oldUserName = this.localStorageService.userInfo.userName;

    return this.accountApi.getUserInfo().pipe(
      switchMap((res) => {
        this.localStorageService.userInfo = res;

        if (!loginRes?.isDefaultPassword) return of(res);

        /**
         * 如果是默认密码，弹出重置密码弹窗
         */
        const modal = this.modal.open<ResetPassComponent, any, ModifyPasswordModalResult>(ResetPassComponent, {
          width: '500px',
          disableClose: true,
        });

        modal.componentInstance.setType(LoginErrorEnum.RestPassword, username, password);
        modal.result.then((res) => {
          const { success, newPassword } = res || {};
          success && newPassword && this.login(username, newPassword);
        });

        const err = new Error('【GoMoney】 please reset password!'); // 中断当前流程，抛出异常
        err.name = LoginErrorEnum.RestPassword; // 标志为需要重置密码的错误
        throw err;
      }),
      tap(() => {
        this.menu.loadMenu();

        // 如果 有重定向的路由path 并且 此次登录的账号与记录的账号一致，将跳转路由到 因token失效无法进入的页面；（进行登录重定向）
        if (this.localStorageService.redirectPath && this.username === oldUserName) {
          this.router.navigateByUrl(this.localStorageService.redirectPath);
        } else {
          this.router.navigate(['/']);
        }
      })
    );
  }

  /**
   * 控制密码的显示与隐藏
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
   * 清除输入框数据
   * @param field
   */
  clearInput(field: any) {
    this[field] = '';
  }
}
