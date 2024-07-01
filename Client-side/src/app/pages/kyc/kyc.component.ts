import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, of } from 'rxjs';
import { filter, shareReplay, switchMap } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/apis/kyc-basic.api';
import { RiskControlApi } from 'src/app/shared/apis/risk-control.api';
import { AccountInforData } from 'src/app/shared/interfaces/account.interface';
import {
  CurrentPassedKycStatus,
  KycMemberLimit,
  KycSettingsLimit,
  KycStatus,
  ProcessDetailForEu,
} from 'src/app/shared/interfaces/kyc.interface';
import { RequestDocumentDataCallBack } from 'src/app/shared/interfaces/risk-control.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { CardInfoConfig } from './kyc-contants/kyc-utils';
import { KycService } from './kyc.service';

@Component({
  selector: 'app-kyc',
  templateUrl: './kyc.component.html',
  styleUrls: ['./kyc.component.scss'],
})
export class KycComponent implements OnInit {
  constructor(
    private appService: AppService,
    private kycService: KycService,
    private layoutService: LayoutService,
    private destroyRef: DestroyRef,
    private kycApi: KycApi,
    private riskApi: RiskControlApi,
  ) {}

  /** Component Name 请保持与Compoent一致 */
  static _componentName = 'KycComponent';

  userInfor!: AccountInforData | null;
  /**是否为亚洲 */
  isAsia: boolean = false;
  isH5!: boolean;
  /**kyc认证单讯息 */
  kycCardsConfig!: CardInfoConfig[];
  /**选择国籍下拉框 */
  isOpen: boolean = false;

  isShow: boolean = false;
  noticeContants?: KycMemberLimit;

  /** 用户kyc信息 */
  kycStatus: KycStatus[] = [];
  /** 当前用户kyc最高等级信息 */
  currentKycLevel?: CurrentPassedKycStatus;
  /**绑定手机号，国家下拉不可更改 */
  countryDisabled: boolean = false;
  loading: boolean = true;

  /** kyc 设置文案 */
  userKycSettings?: Array<KycSettingsLimit>;

  /** 中级详情 */
  midProcessDetailForEu?: ProcessDetailForEu;

  /** 补充材料 */
  requestDocumentsInfor?: RequestDocumentDataCallBack;

  /** 头部 loading */
  headerTipsLoading: boolean = false;

  ngOnInit() {
    this.layoutService.isH5$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((v: boolean) => (this.isH5 = v));
    this.kycService.refreshKycStatus$
      .pipe(
        switchMap(() => {
          return combineLatest([this.kycApi.getUserKycStatus(), this.kycService.getUserKycSettings()]);
        }),
        switchMap(([kycStatus, kycUserSettings]) => {
          if (kycStatus.length > 0) {
            this.kycStatus = kycStatus;
            this.kycService._kycStatus.set(kycStatus);
            const currentKyc = this.kycService.checkUserKycStatus(kycStatus);
            this.currentKycLevel = currentKyc;
          }
          this.userKycSettings = kycUserSettings;
          return this.appService.userInfo$.pipe(filter(v => !!v));
        }),
        switchMap(userInfo => {
          if (userInfo) {
            this.userInfor = userInfo;
            this.isAsia = !userInfo.isEurope;
            this.countryDisabled = userInfo.isBindMobile;
          }

          /** 当用户完成 初级后开始请求 初中高都需要请求 */
          if (![0].includes(this.currentKycLevel?.level || 0) && userInfo?.isEurope && this.kycService.getSwitchEuKyc) {
            return this.kycApi.getQueryUserVerificationForEu().pipe(shareReplay(1));
          }
          return of(null);
        }),
        switchMap(userVerificationForEu => {
          if (userVerificationForEu && this.userKycSettings) {
            /** 当用户完成 中级 或者提交过 中级验证 */
            if (this.kycStatus[1] && !this.isAsia) {
              combineLatest([
                this.kycApi.postProcessdDetailForEu({ kycType: 1 }), // 已经和Ethon 沟通 只需要 获取zho
                this.riskApi.getRequestDocument(),
              ]).subscribe(([midProcessDetailForEu, requestDocumentInfor]) => {
                this.midProcessDetailForEu = midProcessDetailForEu;
                this.requestDocumentsInfor = requestDocumentInfor;
              });
            }

            return this.kycService.euUIConfig(this.kycStatus, this.userKycSettings, userVerificationForEu);
          }

          if (this.userKycSettings) {
            return this.kycService.asiaUIConfig(this.kycStatus, this.userKycSettings);
          }

          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(data => {
        if (data) {
          this.kycCardsConfig = data;
          this.getMemberKycLimit();
        }
        this.loading = false;
      });
  }

  /** 获取头部 当前kyc内容 */
  getMemberKycLimit() {
    this.headerTipsLoading = true;
    this.kycApi.getMemberKycLimit().subscribe(kycMemberLimit => {
      if (kycMemberLimit && Object.keys(kycMemberLimit || {}).length > 0) {
        this.noticeContants = kycMemberLimit;
      }
      this.headerTipsLoading = false;
    });
  }

  openNotice() {
    this.isShow = !this.isShow;
  }

  ticketTrackMethd(card: any) {
    return card.id;
  }
}
