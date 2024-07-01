import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Subscription, fromEvent } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ThirdAuthService } from './third-auth.service';

type OtherLogins = { name: 'Google' | 'Line' | 'MetaMask' | 'Telegram'; pic: string; src: string; origin: string };
@UntilDestroy()
@Component({
  selector: 'app-third-auth',
  templateUrl: './third-auth.component.html',
  styleUrls: ['./third-auth.component.scss'],
})
export class ThirdAuthComponent implements OnInit {
  constructor(public thirdAuthService: ThirdAuthService, private appService: AppService) {}

  /**其他登录方式 */
  otherLogins: OtherLogins[] = [];

  /**单例使用 */
  @Input() singleUse: string = '';
  @Output() clickAuth: EventEmitter<OtherLogins> = new EventEmitter();

  ngOnInit(): void {
    this.thirdAuthService.reset();
    const openedSocialLogin = this.appService.tenantConfig.openedSocialLogin;
    // 刷新弹窗
    this.thirdAuthService.isPopuped = false;
    if (openedSocialLogin && openedSocialLogin.length > 0) {
      this.otherLogins = this.appService.tenantConfig.openedSocialLogin.map((item: OtherLogins['name']) => {
        let src = '';
        let origin = '';
        if (item === 'Telegram') {
          const telegramLink = this.thirdAuthService.thirdAuthLink.telegramLink;
          origin = telegramLink.split('origin=')[1].split('&')[0];
          const open = encodeURIComponent(telegramLink);
          const config = encodeURIComponent(this.thirdAuthService.getPopupConfig());
          src = `${origin}?open=${open}&config=${config}`;
        }
        return {
          name: item,
          pic: `/assets/images/auth-login/${item.toLowerCase()}.svg`,
          src: src,
          origin: origin,
        } as OtherLogins;
      });
    }
  }

  /**
   * 第三方验证
   *
   * @param authName 'Google' | 'Telegram' | 'Line' | 'MetaMask'
   */
  loginVer(authName: 'Google' | 'Telegram' | 'Line' | 'MetaMask') {
    if (authName === 'Google') {
      this.thirdAuthService.googleAuth();
      return;
    }

    if (authName === 'MetaMask') {
      this.thirdAuthService.metaAuth();
      return;
    }

    if (authName === 'Line') {
      this.thirdAuthService.lineAuth();
      return;
    }

    if (authName === 'Telegram') {
      this.thirdAuthService.telegramAuth();
      return;
    }
  }

  /**点击事件集合 */
  clickBus: { [key: string]: Subscription } = {};

  /**监听子iframe发回的 click 事件 */
  buildClick(item: OtherLogins) {
    this.clickBus[item.name]?.unsubscribe();
    this.clickBus[item.name] = fromEvent<MessageEvent>(window, 'message')
      .pipe(untilDestroyed(this))
      .subscribe(e => {
        if (item.origin.includes(e.origin) && e.data === 'click') {
          if (this.clickAuth.observers.length > 0) {
            this.clickAuth.emit(item);
          } else {
            this.loginVer(item.name);
          }
        }
      });
  }
}
