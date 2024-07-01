import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { combineLatest, filter, of, switchMap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { KycService } from 'src/app/pages/kyc/kyc.service';
import { KycApi } from '../../apis/kyc-basic.api';
import { LocaleService } from '../../service/locale.service';
import { LocalStorageService } from '../../service/localstorage.service';
import { PopupService } from '../../service/popup.service';
import { StandardPopupComponent } from '../standard-popup/standard-popup.component';
import { EddPopupComponent } from './edd-popup.component';

@Injectable({
  providedIn: 'root',
})
export class EddPopupService {
  constructor(
    private popup: PopupService,
    private kycService: KycService,
    private localStorage: LocalStorageService,
    private localeService: LocaleService,
    private router: Router,
    private appService: AppService,
    private destroyRef: DestroyRef,
    private kycApi: KycApi
  ) {}

  /**
   * 当用户登录后 检查用户是否需要做EDD
   *
   * @param uid
   * @param login
   */
  onStart() {
    combineLatest([this.appService.userInfo$.pipe(filter(v => !!v)), this.kycApi.getUserKycStatus()])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(([userInfo, kycStatus]) => {
          const currentKyc = this.kycService.checkUserKycStatus(kycStatus);
          if (userInfo?.isEurope && currentKyc?.level !== 0 && this.kycService.getSwitchEuKyc) {
            return this.kycService.onAuthForEu('EDD');
          }
          return of(null);
        })
      )
      .subscribe(data => {
        if (data?.type === 'EDD' && !this.localStorage.eddPopup) {
          this.onJourneyStart();
          this.localStorage.eddPopup = 'true';
        }
      });
  }

  /**
   * 开启EDD 问卷调查
   *
   * @param isOpenQuestions 是否直接打开问卷
   */
  onJourneyStart(isOpenQuestions: boolean = false) {
    this.popup.open(EddPopupComponent, {
      inAnimation: 'fadeInUp',
      outAnimation: 'fadeOutDown',
      speed: 'faster',
      autoFocus: false,
      disableClose: true,
      data: {
        isOpenQuestions,
      },
    });
  }

  /** 成功弹窗 */
  success() {
    this.popup.open(StandardPopupComponent, {
      speed: 'faster',
      data: {
        type: 'success',
        icon: 'assets/svg/sand-clock-1.svg',
        content: this.localeService.getValue('pending_review'),
        description: this.localeService.getValue('edd_popup_tips'),
        buttons: [{ text: this.localeService.getValue('sure_btn'), primary: true }],
        closeIcon: true,
        callback: () => {
          this.router.navigateByUrl(`${this.appService.languageCode}/userCenter/overview`);
        },
        closecallback: () => {
          this.router.navigateByUrl(`${this.appService.languageCode}/userCenter/overview`);
        },
      },
    });
  }
}
