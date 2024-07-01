import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { FormsModule } from '@angular/forms';
import { NzImageDirective } from 'src/app/shared/components/image';
import { MemberApi } from 'src/app/shared/api/member.api';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { KYCAuditTypeEnum, KYCReviewTypeEnum, KYCTypeEnum } from 'src/app/shared/interfaces/kyc';
import { KeyName, Tabs } from 'src/app/shared/interfaces/base.interface';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { finalize, tap } from 'rxjs/operators';
import { zip } from 'rxjs';

@Component({
  selector: 'app-kyc-popup',
  templateUrl: './kyc-popup.component.html',
  styleUrls: ['./kyc-popup.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatModalModule,
    LangPipe,
    NgSwitch,
    TimeFormatPipe,
    FormRowComponent,
    FormsModule,
    NzImageDirective,
    NgSwitchCase,
    NgSwitchDefault,
    UploadComponent,
    NgTemplateOutlet,
  ],
})
export class MonitorKycPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<MonitorKycPopupComponent, boolean>,
    private monitorApi: MonitorApi,
    public lang: LangService,
    private appService: AppService,
    private memberApi: MemberApi,
    private subHeaderService: SubHeaderService
  ) {}

  protected readonly KYCAuditTypeEnum = KYCAuditTypeEnum;
  protected readonly KYCReviewTypeEnum = KYCReviewTypeEnum;

  @Input() isReview: boolean;
  @Input() data: any; // 列表内容

  @Output() auditSuccess = new EventEmitter();

  /** KYC信息 */
  kycInfo: any;
  /** 用户信息 */
  userDetailInfo: any;

  /** 审核 - 当前选中的审核值（默认通过） */
  auditValue = 2;
  /** 商户1&&欧洲中级ID审核 - 当前选中的审核值（默认通过） */
  europe_Idv_Id_AuditValue = 2;
  /** 商户1&&欧洲中级POA审核 - 当前选中的审核值（默认通过） */
  europe_Idv_Poa_AuditValue = 2;

  /** 亚洲中级审核 - 通过：输入姓名 */
  asia_Idv_AuditFullName = '';
  /** 海外中级审核 - 通过：输入姓和名 */
  europe_Idv_AuditFirstName = '';
  europe_Idv_AuditLastName = '';
  /** 商户1&&欧洲中级ID审核 - 通过：输入姓和名 */
  europe_Idv_Id_AuditFirstName = '';
  europe_Idv_Id_AuditLastName = '';

  /** 审核 - 不通过的原因 */
  remark = '';
  /** 商户1&&欧洲中级ID审核 - 不通过的原因 */
  europe_Idv_Id_AuditRemark = '';
  /** 商户1&&欧洲中级POA审核 - 不通过的原因 */
  europe_Idv_Poa_AuditRemark = '';

  /** 审核 - 列表 */
  auditList: Tabs[] = [
    { name: '通过', lang: 'risk.passing', value: 2 },
    { name: '不通过', lang: 'risk.noPass', value: 1 },
  ];

  /** 高级(欧洲) - 需要KYC审核数据 */
  selectkycAdvImgList: KeyName[] = [];
  /** 高级(欧洲) - 所有KYC审核数据 */
  kycAdvImgList: KeyName[] = [
    { name: 'risk.docRequest.sourceOfWealthType.allowance', key: 'allowanceImages' }, // 津贴
    { name: 'risk.docRequest.sourceOfWealthType.cryptoMining', key: 'cryptoMiningImages' }, // 加密挖矿
    { name: 'risk.docRequest.sourceOfWealthType.daytrading', key: 'daytradingImages' }, // 日内交易
    { name: 'risk.docRequest.sourceOfWealthType.dividendsProfitFromCompany', key: 'dividendsProfitFromCompanyImages' }, // 公司分红或收益
    { name: 'risk.docRequest.sourceOfWealthType.donations', key: 'donationsImages' }, // 捐款
    { name: 'risk.docRequest.sourceOfWealthType.gambling', key: 'gamblingImages' }, // 赌博
    { name: 'risk.docRequest.sourceOfWealthType.inheritance', key: 'inheritanceImages' }, // 遗产
    { name: 'risk.docRequest.sourceOfWealthType.loansMortgages', key: 'loansMortgagesImages' }, // 贷款抵押
    { name: 'risk.docRequest.sourceOfWealthType.passiveIncome', key: 'passiveIncomeImages' }, // 被动收入
    { name: 'risk.docRequest.sourceOfWealthType.pension', key: 'pensionImages' }, // 养老金
    { name: 'risk.docRequest.sourceOfWealthType.salary', key: 'salaryImages' }, // 工资
    { name: 'risk.docRequest.sourceOfWealthType.saleOfFinancialAssets', key: 'saleOfFinancialAssetsImages' }, // 金融资产出售
    {
      name: 'risk.docRequest.sourceOfWealthType.salesOfRealEstateOrOtherAssets',
      key: 'salesOfRealEstateOrOtherAssetsImages',
    }, // 不动产或其他资产出售
    { name: 'risk.docRequest.sourceOfWealthType.savings', key: 'savingsImages' }, // 存款
    { name: 'risk.docRequest.sourceOfWealthType.selfEmployedIncome', key: 'selfEmployedIncomeImages' }, // 自雇收入
  ];

  /** 中国中级失败，人工审核数据 */
  intermediateCnAuditData = {
    processState: 2,
    remark: '',
  };

  /** 是否欧洲/海外国家 */
  get isEurope(): boolean {
    if (typeof this.userDetailInfo?.isEurope === 'boolean') {
      return this.userDetailInfo?.isEurope;
    } else {
      // 亚洲：中国，香港，台湾，澳门，越南，泰国
      return !['CHN', 'HKG', 'TWN', 'MAC', 'VNM', 'THA'].includes(this.data?.countryCode);
    }
  }

  /** 是否有欧洲审核流程的商户 */
  get isEuropeMerchant(): boolean {
    if (typeof this.userDetailInfo?.isEuropeMerchant === 'boolean') {
      return this.userDetailInfo?.isEuropeMerchant;
    } else {
      // 商户1
      return ['1'].includes(this.subHeaderService.merchantCurrentId);
    }
  }

  ngOnInit() {
    // 用户信息 - 获取数据
    this.getmemberbasicinfo();

    // 欧洲用户 && 是否有欧洲审核流程的商户
    if (this.isEurope && this.isEuropeMerchant) {
      // 获取中级信息
      if (this.data?.type === KYCAuditTypeEnum.Intermediate) this.kyc_manage_eu_approve_detail();
      // 获取高级信息
      if (this.data?.type === KYCAuditTypeEnum.Senior) this.getEuropeAdvData();
    } else {
      // 其他商户和其他地区的 KYC统一接口获取信息
      this.postProcessDetail();
    }
  }

  /** 除 欧洲 && 有欧洲审核流程的商户外，其他商户和其他地区的 KYC统一接口获取信息 */
  postProcessDetail() {
    this.appService.isContentLoadingSubject.next(true);
    this.monitorApi.postProcessDetail(this.data?.id, this.subHeaderService.merchantCurrentId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res) this.kycInfo = res;
    });
  }

  /** 用户信息 - 获取数据 */
  getmemberbasicinfo() {
    this.appService.isContentLoadingSubject.next(true);
    this.memberApi.getmemberbasicinfo(this.data?.uid).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.userDetailInfo = res || {};
    });
  }

  /** 欧洲 && 有欧洲审核流程的商户 - 获取中级信息 */
  kyc_manage_eu_approve_detail() {
    this.appService.isContentLoadingSubject.next(true);
    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      processId: this.data?.id,
      uid: this.data?.uid,
      kycType: KYCTypeEnum.Intermediate,
    };
    this.monitorApi.kyc_manage_eu_approve_detail(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res) this.kycInfo = res;
    });
  }

  /** 欧洲 && 有欧洲审核流程的商户 - 获取高级KYC */
  getEuropeAdvData() {
    const parmas = {
      id: this.data?.id,
      uid: this.data?.uid,
      type: 'KycAdvanced',
    };
    this.appService.isContentLoadingSubject.next(true);
    this.monitorApi.queryauthenticate(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res) {
        this.kycInfo = res;
        const list = this.kycAdvImgList.filter(({ key }) => {
          return (
            Array.isArray(this.kycInfo?.form?.[key]) &&
            this.kycInfo.form[key].length > 0 &&
            !this.kycInfo.form[key].includes('string')
          );
        });
        this.selectkycAdvImgList = list || [];
      }
    });
  }

  /** 获取发行证件信息 */
  getIdText(type: string): any {
    const text: any = new Map([
      ['ID_CARD', '身份证'],
      ['DRIVING_LICENSE', '行驶证'],
      ['PASSPORT', '护照'],
      ['VISA', '签证'],
    ]);
    return text.get(type) || '-';
  }

  /** KYC审核 - 显示国家名称 */
  getCountryName(countryIso3?: string) {
    if (this.subHeaderService.countryList.length > 0 && countryIso3) {
      const country = this.subHeaderService.countryList.find((v) => v.countryIso3 === countryIso3);
      return country?.countryName || countryIso3;
    }

    return countryIso3 || '-';
  }

  /** 审核确认 */
  async confirm() {
    if (
      (this.auditValue === 1 && !this.remark) ||
      (this.europe_Idv_Id_AuditValue === 1 && !this.europe_Idv_Id_AuditRemark) ||
      (this.europe_Idv_Poa_AuditValue === 1 && !this.europe_Idv_Poa_AuditRemark)
    ) {
      this.appService.showToastSubject.next({
        msgLang: 'risk.fillRemarks', // 备注为必填项
      });
      return;
    }

    let params;
    // 欧洲 && 有欧洲审核流程的商户
    if (this.isEurope && this.isEuropeMerchant) {
      // 中级
      if (this.data?.type === KYCAuditTypeEnum.Intermediate) {
        // 如果ID和POA都是审核拒绝
        if (
          this.kycInfo?.userInfo?.idVerificationStatus === 'R' &&
          this.kycInfo?.userInfo?.poaVerificationStatus === 'R'
        ) {
          // Ethon需求：ID和POA，选择不通过的放在最后调用
          if (this.europe_Idv_Id_AuditValue === 2) {
            zip(this.idEuropeIntAudit(), this.poaEuropeIntAudit()).subscribe(([idFlag, poaFlag]) => {
              if (idFlag || poaFlag) {
                this.modal.close(true);
                this.auditSuccess.emit();
              }
            });
          } else {
            zip(this.poaEuropeIntAudit(), this.idEuropeIntAudit()).subscribe(([idFlag, poaFlag]) => {
              if (idFlag || poaFlag) {
                this.modal.close(true);
                this.auditSuccess.emit();
              }
            });
          }
        } else {
          // ID人工审核
          if (this.kycInfo?.userInfo?.idVerificationStatus === 'R') {
            this.idEuropeIntAudit().subscribe((res) => {
              if (res === true) {
                this.modal.close(true);
                this.auditSuccess.emit();
              }
            });
          }

          // POA人工审核
          if (this.kycInfo?.userInfo?.poaVerificationStatus === 'R') {
            this.poaEuropeIntAudit().subscribe((res) => {
              if (res === true) {
                this.modal.close(true);
                this.auditSuccess.emit();
              }
            });
          }
        }
      }

      // 高级
      if (this.data?.type === KYCAuditTypeEnum.Senior) {
        params = {
          id: this.data.id,
          status: this.auditValue === 2 ? KYCReviewTypeEnum.Finish : KYCReviewTypeEnum.Rejected,
          ...(this.auditValue === 1 ? { remark: this.remark } : {}),
        };
        this.kycAudit(params);
      }
    }
    // 其他商户和其他地区的 KYC统一审核
    else {
      params = {
        uid: this.data?.uid,
        id: this.data.id,
        processState: this.auditValue,
        ...(this.auditValue === 1 ? { auditInfo: this.remark } : {}),
        ...(this.auditValue === 2 && this.data?.type === KYCAuditTypeEnum.Intermediate
          ? this.isEurope
            ? { firstName: this.europe_Idv_AuditFirstName, lastName: this.europe_Idv_AuditLastName }
            : { fullName: this.asia_Idv_AuditFullName }
          : {}),
      };

      this.kycAudit(params);
    }
  }

  /** 欧洲中级ID - 审核请求 */
  idEuropeIntAudit() {
    const params = {
      riskFormType: 'ID',
      uid: this.data?.uid,
      id: this.kycInfo?.idProcessId,
      processState: this.europe_Idv_Id_AuditValue,
      ...(this.europe_Idv_Id_AuditValue === 1
        ? { auditInfo: this.europe_Idv_Id_AuditRemark }
        : {
            // firstName: this.europe_Idv_Id_AuditFirstName,
            // lastName: this.europe_Idv_Id_AuditLastName,
          }),
    };

    this.appService.isContentLoadingSubject.next(true);
    return this.monitorApi.kycProcessaudit(params).pipe(
      tap((res) => {
        this.appService.toastOpera(res);
      }),
      finalize(() => this.appService.isContentLoadingSubject.next(false))
    );
  }

  /** 欧洲中级POA - 审核请求 */
  poaEuropeIntAudit() {
    const params = {
      riskFormType: 'POA',
      uid: this.data?.uid,
      id: this.kycInfo?.poaProcessId,
      processState: this.europe_Idv_Poa_AuditValue,
      ...(this.europe_Idv_Poa_AuditValue === 1 ? { auditInfo: this.europe_Idv_Poa_AuditRemark } : {}),
    };
    this.appService.isContentLoadingSubject.next(true);
    return this.monitorApi.kycProcessaudit(params).pipe(
      tap((res) => {
        this.appService.toastOpera(res);
      }),
      finalize(() => this.appService.isContentLoadingSubject.next(false))
    );
  }

  /** 审核请求 */
  async kycAudit(params) {
    const successMsg = await this.lang.getOne('member.kyc.model.successOperation');
    const failMsg = await this.lang.getOne('risk.config.fail');

    this.appService.isContentLoadingSubject.next(true);
    this.monitorApi[
      this.isEurope && this.isEuropeMerchant && this.data?.type === KYCAuditTypeEnum.Senior
        ? 'auditRiskForm'
        : 'kycProcessaudit'
    ](params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.appService.showToastSubject.next({
        msg: res === true ? successMsg : res?.detail || failMsg,
        successed: res,
      });

      if (res === true) {
        this.modal.close(true);
        this.auditSuccess.emit();
      }
    });
  }

  /** 中级审核：中国认证失败，改人工审核 */
  intermediateCnAudit() {
    if (!this.intermediateCnAuditData.remark) {
      this.appService.showToastSubject.next({
        msgLang: 'risk.fillRemarks', // 备注为必填项
      });
      return;
    }

    const parmas = {
      tenantId: this.subHeaderService.merchantCurrentId,
      uid: this.data?.uid,
      processId: this.data?.id,
      ...this.intermediateCnAuditData,
    };

    this.appService.isContentLoadingSubject.next(true);
    this.monitorApi.updateintermediatekycstatus(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.appService.toastOpera(res);
      if (res === true) {
        this.modal.close(true);
        this.auditSuccess.emit();
      }
    });
  }
}
