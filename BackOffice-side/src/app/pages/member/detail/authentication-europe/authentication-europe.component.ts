import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { cloneDeep } from 'lodash';
import { Component, Input, OnInit } from '@angular/core';
import { MatModal, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { SelectApi } from 'src/app/shared/api/select.api';
import { tap, zip, finalize } from 'rxjs';
import { Country } from 'src/app/shared/interfaces/select.interface';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/api/kyc.api';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { MatTabsModule } from '@angular/material/tabs';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { NgForOf, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeInputDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-input.directive';
import { OwlDateTimeComponent } from 'src/app/components/datetime-picker';
import { OwlDateTimeTriggerDirective } from 'src/app/components/datetime-picker/lib/date-time/date-time-picker-trigger.directive';
import { MatSelectModule } from '@angular/material/select';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { NzImageDirective } from 'src/app/shared/components/image';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ModalFooterComponent } from 'src/app/shared/components/dialogs/modal/modal-footer.component';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { searchFilter } from 'src/app/shared/pipes/array.pipe';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { AuditData } from 'src/app/shared/interfaces/member.interface';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { AutTabsTypeEnum, KYCReviewTypeEnum } from 'src/app/shared/interfaces/kyc';
import { Tabs, KeyName } from 'src/app/shared/interfaces/base.interface';
import { ConfirmModalService } from 'src/app/shared/components/dialogs/confirm-modal/confirm-modal.service';

@Component({
  selector: 'app-authentication-europe',
  templateUrl: './authentication-europe.component.html',
  styleUrls: ['./authentication-europe.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    LangPipe,
    MatTabsModule,
    LoadingDirective,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    FormsModule,
    NgIf,
    NgForOf,
    OwlDateTimeInputDirective,
    OwlDateTimeComponent,
    OwlDateTimeTriggerDirective,
    MatSelectModule,
    TimeFormatPipe,
    NzImageDirective,
    AngularSvgIconModule,
    ModalFooterComponent,
    EmptyComponent,
    searchFilter,
    CurrencyValuePipe,
    FormatMoneyPipe,
    UploadComponent,
    NgTemplateOutlet,
  ],
})
export class MemberDetailAuthenticationEuropeComponent implements OnInit {
  constructor(
    public modal: MatModalRef<MemberDetailAuthenticationEuropeComponent>,
    public subHeaderService: SubHeaderService,
    public lang: LangService,
    private selectApi: SelectApi,
    private appService: AppService,
    private kycApi: KycApi,
    private memberApi: MemberApi,
    private monitorApi: MonitorApi,
    private confirmModalService: ConfirmModalService,
    private modalService: MatModal
  ) {}

  protected readonly AutTabsTypeEnum = AutTabsTypeEnum;
  protected readonly KYCReviewTypeEnum = KYCReviewTypeEnum;

  @Input() tenantId;
  @Input() uid;
  @Input() userDetailsInfo: any;

  /** 是否加载中 */
  isLoading = false;

  /** tabs - 当前选中的value值 */
  currentTabValue: AutTabsTypeEnum = AutTabsTypeEnum.BasisInfo;
  /** tabs - 列表 */
  tabs: Tabs[] = [
    { name: '基础信息', lang: 'member.kyc.basisInfo', value: AutTabsTypeEnum.BasisInfo },
    { name: '初级', lang: 'member.kyc.basis', value: AutTabsTypeEnum.Basis },
    { name: '中级', lang: 'member.kyc.middle', value: AutTabsTypeEnum.Intermediate },
    { name: '高级', lang: 'member.kyc.adv', value: AutTabsTypeEnum.Advanced },
    { name: '发送文件请求', lang: 'member.kyc.requestForDoc', value: AutTabsTypeEnum.RequestForDoc },
    { name: '上传指定文件', lang: 'risk.uploadSpecified', value: AutTabsTypeEnum.UploadSpecified },
    { name: '风险评估问卷', lang: 'member.kyc.edd', value: AutTabsTypeEnum.Edd },
    { name: '风控评估问卷', lang: 'member.kyc.riskControl', value: AutTabsTypeEnum.RiskControl },
    { name: '财富来源证明', lang: 'risk.wealthTitle', value: AutTabsTypeEnum.WealthTitle },
  ];

  /** 国家列表 */
  countryList: Country[] = [];
  searchGroup: any = {};

  /** 基本信息 - 是否编辑 */
  isInfoEditFlag = false;
  /** 基本信息 - 编辑信息 */
  editInfoData: any = {};
  /** 基本信息 - 显示信息 */
  infoData: any = {};

  /** 当前用户 - KYC等级: KycPrimary初级，KycIntermediat中级，KycAdvanced高级 */
  userKycLevel = '';

  /** 初级 - KYC数据 */
  kycPriInfo: any = {};
  /** 中级 - KYC数据 */
  kycIntInfo: any = {};
  /** 高级 - KYC数据 */
  kycAdvInfo: any = {};
  /** 中级(欧洲) - 提交记录数据（ID+POA） */
  europeIntHistoryData: any = {
    idVerification: [],
    proofOfAddress: [],
  };

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

  /** 
    高级(欧洲) - 降级参数
    @value 0=降低至初级 1=降低至中级
   */
  downAdvancedValue;

  /** 发送文件请求(欧洲) - 支付方式名称 */
  paymentName = '';
  /** 发送文件请求(欧洲) - 自定义文件名称 */
  customizeName = '';
  /** 发送文件请求(欧洲) - 用户可发送的文件类型 */
  // requestDocTypeList: string[] = [];

  /** 上传指定文件(亚/欧) - 数据 */
  fullAuditData: AuditData | null;

  /** 风险评估问卷（欧洲） */
  europeEdd: any;

  /** 风控问卷调查(亚洲) - 数据 */
  riskData: any;
  /** 风控问卷调查(亚洲) - 是否满足发起 */
  riskFlag = false;

  /** 财富来源证明(亚洲) - 数据 */
  wealthSourceData: any;
  /** 财富来源证明(亚洲) - 是否满足发起 */
  wealthSourceFlag = false;

  /** 风控问卷调查/财富来源证明(亚洲) - 是否显示发起按钮 */
  isWsRaBtnFlag = false;

  /** 财富来源证明(亚洲) - 所有类型 */
  wsImgTypeList: KeyName[] = [
    { name: 'risk.wagePro', key: 'salaryImages' }, //工资证明
    { name: 'risk.selfEmployment', key: 'soleTraderImages' }, //个体经营收入
    { name: 'risk.selfEmployment', key: 'depositsImages' }, //储蓄
    { name: 'risk.pension', key: 'pensionImages' }, //养老金
    { name: 'risk.company', key: 'stockImages' }, //公司股息或利润
    { name: 'risk.proTransaction', key: 'businessImages' }, //交易
    { name: 'risk.investment', key: 'investImages' }, //投资或投资收益
    { name: 'risk.gamble', key: 'gambleImages' }, //赌博
    { name: 'risk.sale', key: 'saleHouseImages' }, //出售不动产或其他资产
    { name: 'risk.rent', key: 'rentImages' }, //出租/租赁
    { name: 'risk.borrowMoney', key: 'borrowMoneyImages' }, //借币
    { name: 'risk.heritage', key: 'legacyImages' }, //遗产
    { name: 'risk.donate', key: 'contributedImages' }, //捐赠
    { name: 'risk.other', key: 'otherImages' }, //其他
  ];

  /** 该用户是否欧洲用户 */
  get isEurope() {
    if (typeof this.infoData?.isEurope === 'boolean') {
      return this.infoData?.isEurope;
    } else {
      // 亚洲：中国，香港，台湾，澳门，越南，泰国
      return !['CHN', 'HKG', 'TWN', 'MAC', 'VNM', 'THA', 'CN', 'HK', 'TW', 'MO', 'VN', 'TH'].includes(
        this.userDetailsInfo?.kycInfo?.countryCode
      );
    }
  }

  /** 是否有欧洲流程的商户 */
  get isEuropeMerchant(): boolean {
    if (typeof this.infoData?.isEuropeMerchant === 'boolean') {
      return this.infoData?.isEuropeMerchant;
    } else {
      // 商户1
      return ['1'].includes(this.tenantId);
    }
  }

  /** tbas - 根据是否【欧洲流程的商户&&欧洲用户】区分不同的tabs显示 */
  get tabLisCom() {
    if (this.isEurope && this.isEuropeMerchant) {
      return this.tabs.filter(
        (v: Tabs) =>
          ![AutTabsTypeEnum.RiskControl, AutTabsTypeEnum.WealthTitle, AutTabsTypeEnum.UploadSpecified].includes(
            +v.value
          )
      );
    } else {
      return this.tabs.filter((v: Tabs) => ![AutTabsTypeEnum.RequestForDoc, AutTabsTypeEnum.Edd].includes(+v.value));
    }
  }

  /** 是否初级KYC */
  get isKycPrimary() {
    return !['KycIntermediat', 'KycAdvanced'].includes(this.userKycLevel);
  }

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      // 用户信息 - 获取数据
      this.getmemberbasicinfo(),
      // 获取国家列表
      this.getCountryList(),
      // 查询当前用户KYC等级
      this.getcurrentkyclevel()
    ).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });

    // 获取 风控问卷调查/财富来源证明 数据
    if (!this.isEurope && !this.isEuropeMerchant) this.getRiskList();
  }

  /** tabs选择 */
  changeTab(curTabValue: number) {
    this.isLoading = false;
    this.isWsRaBtnFlag = false;
    this.isInfoEditFlag = false;
    this.currentTabValue = curTabValue;

    // 用户信息 - 获取数据
    if (curTabValue === AutTabsTypeEnum.BasisInfo) this.getmemberbasicinfo().subscribe();

    // 初级 - 获取数据
    if (curTabValue === AutTabsTypeEnum.Basis) this.postProcessEntitiesDetail();

    /** 欧洲用户 && 有欧洲流程的商户 */
    if (this.isEurope && this.isEuropeMerchant) {
      // 中级 - 获取数据
      if (curTabValue === AutTabsTypeEnum.Intermediate) {
        this.isLoading = true;
        zip(this.kyc_manage_eu_approve_detail(), this.queryrequestdocument()).subscribe(() => {
          this.isLoading = false;
        });
      }

      // 高级 - 获取数据
      if (curTabValue === AutTabsTypeEnum.Advanced) this.getEuropeAdvData();

      // 风险评估问卷
      if (curTabValue === AutTabsTypeEnum.Edd) this.getEuropeEddData();
    } else {
      /** 其他商户的所有用户 */
      // 中/高级 - 数据
      if ([AutTabsTypeEnum.Intermediate, AutTabsTypeEnum.Advanced].includes(curTabValue))
        this.postProcessEntitiesDetail();

      // 上传指定文件 - 数据
      if (curTabValue === AutTabsTypeEnum.UploadSpecified) this.getFullAuditData();

      // 风控问卷调查 - 是否显示发起按钮
      if (curTabValue === AutTabsTypeEnum.RiskControl) this.isWsRaBtnFlag = this.riskFlag;

      // 财富来源证明 - 是否显示发起按钮
      if (curTabValue === AutTabsTypeEnum.WealthTitle) this.isWsRaBtnFlag = this.wealthSourceFlag;
    }
  }

  /**除 欧洲 && 欧洲流程商户外，其他商户和其他地区的 - 获取初级/中/高级KYC */
  postProcessEntitiesDetail() {
    this.isLoading = true;
    this.kycApi.postProcessEntitiesDetail(this.currentTabValue, this.uid, this.tenantId).subscribe((res) => {
      this.isLoading = false;
      if (!res) return;
      switch (this.currentTabValue) {
        case AutTabsTypeEnum.Basis:
          this.kycPriInfo = res;
          break;
        case AutTabsTypeEnum.Intermediate:
          this.kycIntInfo = res;
          break;
        case AutTabsTypeEnum.Advanced:
          this.kycAdvInfo = res;
          break;
      }
    });
  }

  /** 欧洲用户 && 有欧洲流程的商户 - 获取中级KYC */
  kyc_manage_eu_approve_detail() {
    return this.kycApi.kyc_manage_eu_approve_detail(this.currentTabValue, this.uid, this.tenantId).pipe(
      tap((res) => {
        if (res) this.kycIntInfo = res;
      })
    );
  }

  /** 欧洲用户 && 有欧洲流程的商户 - 获取中级的提交验证记录（ID+POA） */
  queryrequestdocument() {
    return this.monitorApi.queryrequestdocument(this.uid).pipe(
      tap((res) => {
        if (!res) return;
        this.europeIntHistoryData.idVerification = res?.idVerification || [];
        this.europeIntHistoryData.proofOfAddress = res?.proofOfAddress || [];
      })
    );
  }

  /**
   * 查询当前用户KYC等级
   * @return KycPrimary:初级认证, KycIntermediat:中级验证, KycAdvanced:高级验证
   */
  getcurrentkyclevel() {
    return this.monitorApi.getcurrentkyclevel(this.uid).pipe(
      tap((res) => {
        this.userKycLevel = res || '';
      })
    );
  }

  /**
   * 发送文件请求 - 查询当前用户可发送的类型
   * @return ID:身份证明, POA:地址证明, WealthSourceDocument:财富来源证明, PaymentMethod:支付方式, Customize:自定义
   */
  // getrequestdocumenttype() {
  //   this.isLoading = true;
  //   this.monitorApi.getrequestdocumenttype(this.uid).subscribe((res) => {
  //     this.isLoading = false;
  //     this.requestDocTypeList = res || [];
  //   });
  // }

  /** 欧洲用户 && 有欧洲流程的商户 - 获取高级KYC */
  getEuropeAdvData() {
    const parmas = {
      uid: this.uid,
      type: 'KycAdvanced',
    };
    this.isLoading = true;
    this.monitorApi.queryauthenticate(parmas).subscribe((res) => {
      this.isLoading = false;
      if (res) {
        this.kycAdvInfo = res;

        if (!res?.form) return;
        const list = this.kycAdvImgList.filter(({ key }) => {
          return (
            Array.isArray(this.kycAdvInfo.form[key]) &&
            this.kycAdvInfo.form[key].length > 0 &&
            !this.kycAdvInfo.form[key].includes('string')
          );
        });
        this.selectkycAdvImgList = list || [];
      }
    });
  }

  /** 欧洲用户 && 有欧洲流程的商户 - 获取风险评估问卷（EDD） */
  getEuropeEddData() {
    const parmas = {
      uid: this.uid,
      type: 'EDD',
    };
    this.isLoading = true;
    this.monitorApi.queryauthenticate(parmas).subscribe((res) => {
      this.isLoading = false;
      this.europeEdd = res || {};
    });
  }

  /**  欧洲用户 && 有欧洲流程的商户 - 发送风险评估问卷（EDD）请求 */
  sendEuropeEdd() {
    // 类型为EDD但form数据为null，证明该用户已提交过，不可重复请求
    if (this.europeEdd?.type === 'EDD' && !this.europeEdd?.form) {
      this.appService.showToastSubject.next({
        msgLang: 'member.kyc.model.alreadyEDDTips',
      });
      return;
    }
    this.appService.isContentLoadingSubject.next(true);
    this.monitorApi.sendRequestedd(this.uid).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
    });
  }

  /**
   * 显示国家名称
   * @countryCodeType countryIso3:三码, countryCode:二码
   */
  getCountryName(countryCode: string, countryCodeType: string) {
    if (this.countryList.length > 0 && countryCode) {
      const country: any = this.countryList.find((v) => v[countryCodeType] === countryCode);
      return (this.lang.isLocal ? country?.countryName : country?.countryEnName) || countryCode;
    }
    return countryCode || '-';
  }

  /** 用户信息 - 打开编辑 */
  openEdit() {
    this.isInfoEditFlag = true;
    this.editInfoData = cloneDeep(this.infoData);
    const birthDay = this.infoData?.birthday ? new Date(this.infoData.birthday) : null;
    this.editInfoData.birthday = birthDay;
  }

  /** 用户信息 - 获取国家列表 */
  getCountryList() {
    return this.selectApi.getCountryFlat(false).pipe(
      tap((res) => {
        this.countryList = res || [];
      })
    );
  }

  /** 用户信息 - 获取数据 */
  getmemberbasicinfo() {
    this.isLoading = true;
    return this.memberApi.getmemberbasicinfo(this.uid).pipe(
      tap((res) => {
        this.infoData = res || {};
      }),
      finalize(() => (this.isLoading = false))
    );
  }

  /** 用户信息 - 国家下拉框：打开可搜索过滤的下拉 */
  openSearchSelect(isOpen: boolean, key: string, el: HTMLInputElement): void {
    if (isOpen) {
      el.value = '';
      el.focus();
    } else {
      this.searchGroup[key] = '';
    }
  }

  /** 用户信息 - 编辑确认 */
  editConfirm() {
    if (this.editInfoData.email) {
      const emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/.test(this.editInfoData.email);
      if (!emailReg) {
        this.appService.showToastSubject.next({
          msgLang: 'system.merchants.emailTips',
        });
        return;
      }
    }

    let parmas: any = {
      uid: this.uid,
      ...this.editInfoData,
    };
    parmas.birthday = +this.editInfoData.birthday;

    this.appService.isContentLoadingSubject.next(true);
    this.memberApi.updatememberbasicinfo(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      if (res?.success) {
        this.isInfoEditFlag = false;
        this.getmemberbasicinfo().subscribe();
      }

      if (res?.success && res?.isAudit) {
        this.appService.showToastSubject.next({
          msgLang: 'member.kyc.basisInfoSubmitSusTips', // 提交成功，已进入实时审核
          successed: true,
        });
      } else {
        this.appService.toastOpera(res.success);
      }
    });
  }

  /** 中级 - 欧洲用户 && 有欧洲流程的商户：【立刻升级】请求 */
  sendEuropeIntUpgrade() {
    this.appService.isContentLoadingSubject.next(true);
    this.monitorApi.requestintermediate(this.uid).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
    });
  }

  /** 中级 -  欧洲用户 && 有欧洲流程的商户：【降级】请求 */
  downEuropeIntermediate() {
    this.confirmModalService
      .open({ msgLang: 'member.kyc.model.downgradeIntermediateMsg' })
      .result.then((value) => {
        value && this.kycEuropeDowngrade(0);
      })
      .catch(() => {});
  }

  /** 高级 - 欧洲用户 && 有欧洲流程的商户：【验证】请求 */
  sendEuropeAdcInvitation() {
    this.appService.isContentLoadingSubject.next(true);
    this.monitorApi.requestadvanced(this.uid).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
    });
  }

  /** 高级 - 欧洲用户 && 有欧洲流程的商户：【降级】请求 */
  downEuropeAdvanced(temp) {
    this.downAdvancedValue = '';
    const modalRef = this.modalService.open(temp, { width: '540px' });
    modalRef.result
      .then((value) => {
        value && this.kycEuropeDowngrade(this.downAdvancedValue);
      })
      .catch(() => {});
  }

  /** 
    欧洲用户 && 有欧洲流程的商户 - KYC降级
    @kycType 0=降低至初级 1=降低至中级
  */
  kycEuropeDowngrade(kycType: number) {
    this.appService.isContentLoadingSubject.next(true);
    this.memberApi.kycEuropeDowngrade({ uid: this.uid, kycType }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
      if (res === true) this.modal.close(true);
    });
  }

  /**
   * 欧洲用户 && 有欧洲流程的商户 - 发送文件请求
   * @documentType 4：ID，5：POA，6：支付方式，7：补充财富来源证明，99：自定义
   */
  sendFileRequest(documentType: number) {
    const parmas = {
      uid: this.uid,
      documentTypes: [documentType],
      ...(documentType === 6 ? { paymentName: this.paymentName } : {}),
      ...(documentType === 99 ? { customizeName: this.customizeName } : {}),
    };

    this.appService.isContentLoadingSubject.next(true);
    this.monitorApi.requestdocument(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      // 返回为false，代表已发送过
      if (res === false) {
        this.appService.showToastSubject.next({
          msgLang: 'member.kyc.docRequestFaild', // 该文件请求已发送过！
        });
        return;
      }
      this.appService.toastOpera(res);
      if (res === true) {
        this.paymentName = '';
        this.customizeName = '';
      }
    });
  }

  /** 上传指定文件 - 获取数据 */
  getFullAuditData() {
    this.isLoading = true;
    this.monitorApi.getLastRisk({ uid: this.uid, type: 'FullAudit' }).subscribe((res) => {
      this.isLoading = false;
      if (res) this.fullAuditData = res;
    });
  }

  /** 风控问卷调查/财富来源证明 - 获取数据 */
  getRiskList() {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      this.monitorApi.getLastRisk({ uid: this.uid, type: 'RiskAssessment' }),
      this.monitorApi.getLastRisk({ uid: this.uid, type: 'WealthSource' }),
      this.monitorApi.queryProgressRisk({ uid: this.uid, type: 'RiskAssessment' }),
      this.monitorApi.queryProgressRisk({ uid: this.uid, type: 'WealthSource' })
    ).subscribe(([riskData, wealthSourceData, riskFlag, wealthSourceFlag]) => {
      this.appService.isContentLoadingSubject.next(false);

      this.riskData = riskData;
      this.wealthSourceData = wealthSourceData;
      this.riskFlag = !riskFlag && !riskData;
      this.wealthSourceFlag = !wealthSourceFlag && !wealthSourceData && riskData;
      if (wealthSourceData) {
        this.wsImgTypeList = this.wsImgTypeList.filter(({ key }) => {
          return Array.isArray(this.wealthSourceData.form[key]) && this.wealthSourceData.form[key].length > 0;
        });
      }
    });
  }

  /** 风控问卷调查/财富来源证明 - 发起验证 */
  WsRalaunch() {
    this.appService.isContentLoadingSubject.next(true);
    this.monitorApi[
      this.currentTabValue === AutTabsTypeEnum.RiskControl ? 'addRiskAssessmentForm' : 'addWealthSourceForm'
    ]({
      uid: this.uid,
    }).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);

      this.appService.showToastSubject.next({
        msgLang: res === true ? 'member.kyc.verificationSuc' : 'member.kyc.verificationFail', //发起验证提示语
        successed: res,
      });
      if (res === true) this.modal.close(true);
    });
  }

  getIdText(type: string): any {
    const text: any = new Map([
      ['ID_CARD', '身份证'],
      ['DRIVING_LICENSE', '行驶证'],
      ['PASSPORT', '护照'],
      ['VISA', '签证'],
    ]);
    return text.get(type) || '-';
  }

  getImage(image: any) {
    if (!image) return [];
    return image.substr(0, 4) == 'http' || image.substr(0, 5) == 'https' ? image : 'data:image/png;base64,' + image;
  }

  getImgStatus(type: string) {
    const status = new Map([
      ['S', { class: 'text-success', lang: 'budget.approved' }],
      ['P', { class: 'text-primary', lang: 'member.kyc.underReview' }],
      ['R', { class: 'text-danger', lang: 'member.kyc.declined' }],
    ]);
    return status.get(type) || { class: 'color-aaa', lang: 'common.unknown' };
  }
}
