import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AppService } from 'src/app/app.service';
import { KycService } from 'src/app/pages/kyc/kyc.service';
import { KycDialogService } from 'src/app/shared/service/kyc-dialog.service';

@UntilDestroy()
@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [style({ opacity: 0 }), animate('0.2s ease-in-out', style({ opacity: 1 }))]),
      transition(':leave', [animate('0.2s ease-in-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class BannerComponent implements OnInit {
  constructor(
    // public riskService: RiskControlService,
    public kycService: KycService,
    public kycDialogService: KycDialogService,
    private router: Router,
    private appService: AppService
  ) {}

  /**后台发起kyc等级 */
  kycLevel: string = '';

  /** 是否展示Banner */
  showBanner: boolean = false;

  ngOnInit() {
    this.kycService.showKycValidationBanner$.pipe(untilDestroyed(this)).subscribe(data => {
      this.showBanner = data;
    });
  }

  close() {
    // this.riskService.showRiskBanner$.next(false);
    this.kycService.bannerUpdate(false);
  }

  showTask() {
    // this.riskService.showAuthTask$.next(true);
  }

  //进入kyc验证首页 用户自选验证类型
  openkycPage() {
    this.router.navigateByUrl(`/${this.appService.languageCode}/userCenter/kyc`);
    // this.kycDialogService.openMidVerifyDialog();
  }
}
