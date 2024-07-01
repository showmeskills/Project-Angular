import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ToastService } from 'src/app/shared/service/toast.service';
import { General2faverifyComponent } from '../components/general2faverify/general2faverify.component';
import { StandardPopupComponent } from '../components/standard-popup/standard-popup.component';
import { AccountInforData } from '../interfaces/account.interface';
import { VerifyAction } from '../interfaces/auth.interface';
import { LocaleService } from './locale.service';
import { PopupService } from './popup.service';
export interface verifyStatus {
  status: boolean;
  key: string;
  message?: string;
}
@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class General2faverifyService {
  private userInfo!: AccountInforData;

  constructor(
    private appService: AppService,
    private popupService: PopupService,
    private router: Router,
    private toast: ToastService,
    private dialog: MatDialog,
    private localeService: LocaleService
  ) {
    // 订阅当前登录账号信息
    this.appService.userInfo$.pipe(untilDestroyed(this)).subscribe(v => {
      if (!v) return;
      this.userInfo = v;
    });
  }

  launch(verifyFor: VerifyAction): Observable<verifyStatus> {
    console.log('开始验证: ' + verifyFor);
    if (!this.userInfo.isBindGoogleValid && !this.userInfo.isBindMobile) {
      //手机和谷歌验证均未绑定，弹出提示，返回失败
      this.popupService.open(StandardPopupComponent, {
        speed: 'faster',
        data: {
          type: 'warn',
          content: this.localeService.getValue('to_ke_u_safe00'),
          description: this.localeService.getValue('to_ke_u_safe_tips00'),
          buttons: [
            { text: this.localeService.getValue('cancels'), primary: false },
            { text: this.localeService.getValue('binding'), primary: true },
          ],
          callback: () => {
            this.dialog.closeAll();
            this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/security`);
          },
        },
        disableClose: true,
      });
      console.log(verifyFor + this.localeService.getValue('to_ke_u_safe_tips01'));
      return of({ status: false, key: '' });
    } else {
      return this.popupService
        .open(General2faverifyComponent, { speed: 'faster', data: verifyFor, disableClose: true })
        .afterClosed()
        .pipe(
          tap(res => {
            if (!res) {
              console.log(verifyFor + ' 验证被放弃');
            } else if (res.status) {
              // 注释原因：成功无需提示
              // this.toast.show({message:'身份验证成功!',type:'success',title:''});
              console.log(verifyFor + ' 验证成功: ' + res.key);
            } else {
              this.toast.show({ message: `${this.localeService.getValue('auth_f')}!`, type: 'fail', title: '' });
              console.log(verifyFor + ' 验证失败，原因: ' + res.message);
            }
          }),
          map(res => (res ? res : { status: false, key: '' }))
        );
    }
  }
}
