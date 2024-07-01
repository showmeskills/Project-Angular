import { Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { filter, mergeMap, of, take } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import { CacheService } from 'src/app/shared/service/cache.service';
import { KycService } from '../kyc.service';

@Component({
  selector: 'app-verify-dialog',
  templateUrl: './verify-dialog.component.html',
  styleUrls: ['./verify-dialog.component.scss'],
})
export class VerifyDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<VerifyDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { step?: number; supplymentaryDocs?: 'ID' | 'POA'; isFailedProcess?: boolean },
    private appService: AppService,
    private kycService: KycService,
    private destroyRef: DestroyRef,
    private kycApi: KycApi,
    private cacheService: CacheService
  ) {}

  fogClassName = ''; //当前国家class
  countryName = ''; //国家名称
  orderStep: number = 1; //当前kyc认证等级   1:基础中国 2:基础非中国 3:中级中国  4:中级非中国  5:高级认证

  /** 准备打开页面 */
  kycPopupLoading: boolean = false;

  /** 允许切换 国家 */
  isAllowSwitchCountry = false;

  /** 用户信息 */
  userInfo: AccountInforData | null = null;

  ngOnInit() {
    // 未绑定 手机号 或者 初级弹窗时候 需要订阅
    this.appService.currentCountry$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(country => {
      if (this.isAllowSwitchCountry) {
        this.checkKycPageNumber(country.areaCode);
      }
    });

    // IP或者手机号定位弹窗
    this.getKycPopupConfig();

    window.IGLOO = window.IGLOO || {
      loader: {
        version: 'general5',
        subkey: 'mM0sp8Erj2GlCHJLX6SgFKsKcD68gIN_z1-m9vV_lm0',
      },
    };
    this.appService.loadExternalScript('/assets/scripts/loader.js', 'iovationBlackbox');
  }

  /** 打开KYC 时 */
  getKycPopupConfig() {
    this.kycPopupLoading = true;

    this.appService.userInfo$
      .pipe(
        mergeMap(userInfo => {
          this.userInfo = userInfo;

          if (userInfo?.isBindMobile) {
            this.isAllowSwitchCountry = false;
            this.checkKycPageNumber(this.userInfo?.areaCode || '');
            if (!userInfo?.kycGrade) {
              return this.kycApi.getSavePrimaryKycForm().pipe(take(1));
            }

            return of(null);
          }

          if (!userInfo?.kycGrade) {
            return this.kycApi.getSavePrimaryKycForm().pipe(take(1));
          }

          return of(null);
        }),
        take(1), // 每次打开弹窗 只执行1次
        takeUntilDestroyed(this.destroyRef),
        mergeMap(formData => {
          if (formData) {
            this.kycService._primaryFormData.set(formData);
            this.isAllowSwitchCountry = true;
            if (!this.userInfo?.isBindMobile) {
              this.appService.currentCountry$.next(
                this.cacheService.countries.find(x => x.iso === formData.countryCode || x.code === formData.countryCode)
              );
            }
          } else {
            this.isAllowSwitchCountry = false;
            return this.appService.currentCountry$.pipe(filter(x => x));
          }

          return of(null);
        })
      )
      .subscribe(country => {
        if (country) {
          this.checkKycPageNumber(country.areaCode);
        }
        this.kycPopupLoading = false;
      });
  }

  // 当前账号需要进行的验证等级
  checkKycPageNumber(currentAreaCode: string) {
    switch (this.data.step) {
      case 1: //基础 （初始）
        this.checkIsPrimary(currentAreaCode);
        break;
      case 3: //中级（初始）
        this.checkIsMid(currentAreaCode);
        break;
      case 5: //高级（初始）
        this.checkIsAdvanced();
        break;
      default:
        break;
    }
  }

  // 是否为基础
  checkIsPrimary(currentAreaCode: string) {
    if (currentAreaCode != '+86') {
      // 非中国基础认证
      this.orderStep = 2;
    } else {
      this.orderStep = 1;
    }
  }

  //是否为中级 验证中国区
  checkIsMid(currentAreaCode: string) {
    if (currentAreaCode != '+86') {
      // 非中国基础认证
      this.orderStep = 4;
    } else {
      this.orderStep = 3;
    }
  }

  /** 高级验证 */
  checkIsAdvanced() {
    if (this.kycService.isAllowAdvancedEu) {
      this.orderStep = 6; // 新的高级kyc
    } else {
      this.orderStep = 5; // 老高级kyc
    }
  }
}
