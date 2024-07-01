import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { KycApi } from '../../apis/kyc-basic.api';
import { LayoutService } from '../../service/layout.service';
import { LocaleService } from '../../service/locale.service';
import { PopupService } from '../../service/popup.service';
import { StandardPopupComponent } from '../standard-popup/standard-popup.component';
import { FaceVerifyComponent } from './face-verify.component';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class FaceVerifyService {
  constructor(
    private popup: PopupService,
    private layout: LayoutService,
    private kycApi: KycApi,
    private appService: AppService,
    private localeService: LocaleService,
    private router: Router
  ) {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
  }

  isH5!: boolean;

  /** 用户是否需要 活体验证 */
  getFaceVerify() {
    this.kycApi
      .getLiveCheckConnect({
        locale: this.appService.languageCode,
      })
      .subscribe(data => {
        // web 端打开 需要 提示用户调整到 H5上验证
        if (!this.isH5) {
          this.popup
            .open(FaceVerifyComponent, {
              inAnimation: this.isH5 ? 'fadeInUp' : undefined,
              outAnimation: this.isH5 ? 'fadeOutDown' : undefined,
              speed: 'faster',
              autoFocus: false,
              disableClose: true,
            })
            .afterClosed()
            .subscribe(() => this.router.navigateByUrl(`/${this.appService.languageCode}`));
          return;
        }

        // 4001  一天只能发4次情况; 验证失败 转回首页
        if (data?.code === '4001') {
          this.openStandardPopup(this.localeService.getValue('verfiy_error_one'), `/${this.appService.languageCode}`);
          return;
        }

        // 1001 用户账号KYC 没有过中级认证
        if (data?.code === '1001') {
          this.openStandardPopup(
            this.localeService.getValue('verify_face_error_three'),
            `/${this.appService.languageCode}/userCenter/kyc`
          );
          return;
        }

        // 如果接口返回 4002 说明三个月内已经验证过不需要再此验证; 继续操作
        if (data?.code === '4002') {
          return;
        }

        // 0000 是成功， 可以进行 脸部验证
        if (data?.code === '0000' && data?.data?.redirectUrl) {
          const {
            data: { redirectUrl },
          } = data;
          this.popup.open(FaceVerifyComponent, {
            inAnimation: this.isH5 ? 'fadeInUp' : undefined,
            outAnimation: this.isH5 ? 'fadeOutDown' : undefined,
            speed: 'faster',
            autoFocus: false,
            disableClose: true,
            data: {
              redirectUrl,
              country: data?.data?.country || null,
            },
          });
        } else {
          // 统一 错误处理
          this.openStandardPopup(this.localeService.getValue('verfiy_error_two'), `/${this.appService.languageCode}`);
        }
      });
  }

  /**
   * 封装 标准弹窗
   *
   * @param description 描述
   * @param router 跳转路由
   */
  openStandardPopup(description: string, router: string) {
    this.popup
      .open(StandardPopupComponent, {
        inAnimation: this.isH5 ? 'fadeInUp' : undefined,
        outAnimation: this.isH5 ? 'fadeOutDown' : undefined,
        data: {
          type: 'warn',
          content: this.localeService.getValue('hint'),
          buttons: [{ text: this.localeService.getValue('confirm_button'), primary: true }],
          description,
        },
      })
      .afterClosed()
      .subscribe(() => this.router.navigateByUrl(router));
  }
}
