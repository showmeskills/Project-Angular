import { Component, OnInit } from '@angular/core';
import { MessageDialogComponent } from 'src/app/shared/components/dialogs/message-dialog/message-dialog.component';
import { AccountApi } from 'src/app/shared/api/account.api';
import { LocalStorageService } from 'src/app/shared/service/localstorage.service';
import { Router } from '@angular/router';
import { MatModal } from 'src/app/shared/components/dialogs/modal';
import { DynamicAsideMenuService } from 'src/app/_metronic/core';
import { encryptByEnAES } from 'src/app/shared/models/tools.model';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { ProxyService } from 'src/app/pages/proxy/proxy.service';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { finalize, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppService } from 'src/app/app.service';
import { UserApi } from 'src/app/shared/api/user.api';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { LangPipe, PreLangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { InputRevealDirective, RevealComponent } from 'src/app/shared/directive/input.directive';
import { FormWrapComponent, FormFullDirective } from 'src/app/shared/components/form-row/form-wrap.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { VersionComponent } from 'src/app/shared/components/version/version.component';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  host: { class: 'host' },
  standalone: true,
  imports: [
    NgIf,
    VersionComponent,
    NgClass,
    FormsModule,
    AngularSvgIconModule,
    ModalTitleComponent,
    FormRowComponent,
    FormWrapComponent,
    FormFullDirective,
    InputRevealDirective,
    RevealComponent,
    ModalFooterComponent,
    LangPipe,
    PreLangPipe,
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
    private proxyService: ProxyService,
    private appService: AppService,
    private api: UserApi,
    public lang: LangService
  ) {}

  username = '';
  password = '';
  usernameValidate = false;
  passwordValidate = false;
  isLoading = false;
  isOnline = true; // 是否为线上版本
  resetPassword = '';
  againPassword = '';
  passwordKey = '';
  encyptKey = '';
  ngOnInit() {
    this.isOnline = environment.isOnline;
    this.modal.closeAll(); // 关闭所有弹窗，可能有强制跳转到登录页面的弹窗还未关闭
    this.subHeader.clearMerchant();
    this.proxyService.clear();
  }

  /**
   * 登录
   */
  onLogin(tpl) {
    this.usernameValidate = this.username == '';
    this.passwordValidate = this.password == '';

    if (this.username == '' || this.password == '') {
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
          this.passwordKey = encrypt.key;
          this.encyptKey = encrypt.encyptKey;
          // 进行登录
          return this.accountApi.login({
            tenantId: 1,
            userName: this.username,
            password: encryptByEnAES(this.password, encrypt.encyptKey),
            passwordKey: encrypt.key,
          });
        }),
        tap((res) => {
          // 重置密码后强制修改密码
          if (res?.verify.isUpdatePassword) {
            this.againPassword = '';
            this.resetPassword = '';
            this.modal.open(tpl, { width: '460px', data: { id: res?.verify.id, tenantId: res?.verify.tenantId } });
            throw 'Password needs to be updated';
          }
          if (!res?.['token']) {
            this.modal.open(MessageDialogComponent, {
              data: { hasSvg: false, hasTitle: false, content: 'token is empty' },
            });

            throw res; // 没有返回token，抛出异常
          }

          this.localStorageService.token = res.token;
        }),
        switchMap(() => this.getUserInfo$()), // 获取用户信息
        catchError((res) => {
          if (res === 'Password needs to be updated') {
            return of(null);
          }
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
  getUserInfo$() {
    return this.accountApi.getUserInfo().pipe(
      tap((res) => {
        // 记录被退出到登录页面的 账号名称；（功能关联登录重定向）
        const oldUserName = this.localStorageService.userInfo.userName;

        this.localStorageService.userInfo = res;
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

  /**
   * 提示语
   *
   */
  showtoast(content) {
    this.modal.open(MessageDialogComponent, {
      data: { hasSvg: false, hasTitle: false, content },
    });
  }

  /**重置密码 */
  async resetConfirm(c, id, tenantId) {
    if (this.resetPassword && this.againPassword && this.resetPassword === this.againPassword) {
      this.api
        .updateResetPassword({
          id,
          tenantId,
          password: encryptByEnAES(this.againPassword, this.encyptKey),
          passwordKey: this.passwordKey,
        })
        .pipe(
          catchError((res) => {
            this.showtoast(res.message);
            throw res;
          })
        )
        .subscribe(async (res) => {
          const msg = res.success ? 'common.updateCompleted' : 'common.updateFailed';
          const content = await this.lang.getOne(msg);
          this.showtoast(content);
          c();
        });
    } else {
      const content = await this.lang.getOne('auManage.sys.tips');
      this.showtoast(content);
    }
  }
}
