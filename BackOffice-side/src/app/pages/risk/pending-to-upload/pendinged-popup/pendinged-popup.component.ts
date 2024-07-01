import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { IconSrcDirective } from 'src/app/shared/components/icon/icon.directive';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';
import { LoadingDirective } from 'src/app/shared/directive/loading.directive';
import { SearchDirective, SearchInpDirective } from 'src/app/shared/directive/search.directive';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { SubHeaderService } from 'src/app/_metronic/partials/layout/subheader/subheader1/sub-header.service';
import {
  PendingedCategoryObjEnum,
  PendingedCategoryEnum,
  RiskFormTypeObjEnum,
} from 'src/app/shared/interfaces/monitor';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { RiskApi } from 'src/app/shared/api/risk.api';
import { CurrencyService } from 'src/app/shared/service/currency.service';
import { zip } from 'rxjs';
import { KYCTypeEnum } from 'src/app/shared/interfaces/kyc';
import { KycApi } from 'src/app/shared/api/kyc.api';

@Component({
  selector: 'app-pendinged-popup',
  templateUrl: './pendinged-popup.component.html',
  styleUrls: ['./pendinged-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormRowComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatModalModule,
    FormsModule,
    MatOptionModule,
    TimeFormatPipe,
    FormatMoneyPipe,
    LangPipe,
    EmptyComponent,
    LoadingDirective,
    UploadComponent,
    SearchDirective,
    SearchInpDirective,
    AngularSvgIconModule,
    IconSrcDirective,
  ],
})
export class PendingedPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<PendingedPopupComponent, boolean>,
    public lang: LangService,
    public subHeaderService: SubHeaderService,
    private appService: AppService,
    private memberApi: MemberApi,
    private riskApi: RiskApi,
    private kycApi: KycApi,
    public currencyService: CurrencyService
  ) {}

  protected readonly PendingedCategoryObjEnum = PendingedCategoryObjEnum;
  protected readonly RiskFormTypeObjEnum = RiskFormTypeObjEnum;

  /** 列表内容 */
  @Input() data;
  /** 补充类型 */
  @Input() pendingedType: PendingedCategoryEnum;

  @Output() confirmSuccess = new EventEmitter();

  /** 用户基本信息 */
  userDetailInfo;

  /** 发行文件类型数据 */
  idTypeList: { name: string; value: string }[] = [
    { name: '身份证', value: 'ID_CARD' },
    { name: '行驶证', value: 'DRIVING_LICENSE' },
    { name: '护照', value: 'PASSPORT' },
  ];

  /** EDD - 雇佣状态类型数据 */
  employmentStatusList: { name: string; value: string }[] = [
    { name: '在职人士', value: 'Employee' },
    { name: '自雇人士', value: 'SelfEmployed' },
    { name: '学生', value: 'Student' },
    { name: '退休人士', value: 'Retiree' },
    { name: '待业', value: 'UnEmployed' },
  ];

  /** EDD - 资金来源类型数据 */
  sourceOfFundsList: { name: string; value: string }[] = [
    { name: '工资/自雇收入', value: 'SalarySelfEmploymentIncome' },
    { name: '储蓄', value: 'Savings' },
    { name: '退休金', value: 'Pension' },
    { name: '房地产', value: 'SaleOfRealEstate' },
    { name: '遗产', value: 'Inheritance' },
    { name: '企业', value: 'OwnershipOfABusiness' },
    { name: '投资', value: 'Investment' },
    { name: '其他', value: 'Others' },
  ];

  /** 欧洲高级/发送文件请求 - 财富来源key值集合 */
  moneySources: string[] = [];
  /** 欧洲高级/发送文件请求 - 财富来源图片数据 */
  moneySourcesImageList: { name: string; imgValue: string; key: string; imgUrl?: string }[] = [];
  /** 欧洲高级/发送文件请求 - 财富来源类型数据 */
  moneySourcesList: { name: string; imgValue: string; key: string; imgUrl?: string }[] = [
    { name: '薪资', imgValue: 'salaryImages', key: 'Salary' },
    { name: '自营职业', imgValue: 'selfEmployedIncomeImages', key: 'SelfEmployedIncome' },
    { name: '存款', imgValue: 'savingsImages', key: 'Savings' },
    { name: '津贴', imgValue: 'allowanceImages', key: 'Allowance' },
    { name: '退休金', imgValue: 'pensionImages', key: 'Pension' },
    { name: '公司分红或收益', imgValue: 'dividendsProfitFromCompanyImages', key: 'DividendsProfitFromCompany' },
    { name: '日内交易', imgValue: 'daytradingImages', key: 'Daytrading' },
    { name: '博彩', imgValue: 'gamblingImages', key: 'Gambling' },
    { name: '被动收入', imgValue: 'passiveIncomeImages', key: 'PassiveIncome' },
    { name: '贷款/按揭', imgValue: 'loansMortgagesImages', key: 'LoansMortgages' },
    { name: '金融资产出售', imgValue: 'saleOfFinancialAssetsImages', key: 'SaleOfFinancialAssets' },
    {
      name: '不动产或其他资产出售',
      imgValue: 'salesOfRealEstateOrOtherAssetsImages',
      key: 'SalesOfRealEstateOrOtherAssets',
    },
    { name: '遗产', imgValue: 'inheritanceImages', key: 'Inheritance' },
    { name: '捐赠', imgValue: 'donationsImages', key: 'Donations' },
    { name: '加密货币挖矿', imgValue: 'cryptoMiningImages', key: 'CryptoMining' },
  ];

  /** ID */
  idData = {
    firstName: '',
    lastName: '',
    countryCode: '', // 国家
    idType: 'ID_CARD', // 发行文件类型
    idFrontsideImage: '', // 发行文件照片 - 正面
    idBacksideImage: '', // 发行文件照片 - 反面
  };

  /** POA */
  poaData = {
    city: '', // 居住城市
    address: '', // 居住地址
    zipCode: '', // 邮政编码
    networkImgeUrl: '', // 居住证照片
  };

  /** 支付方式 */
  paymentMethodData = {
    paymentName: '', // 支付方式名称
    screenshotProof: '', // 截图证明
  };

  /** 自定义 */
  customizeData = {
    customizeName: '', // 自定义名称
    screenshotProof: '', // 截图证明
  };

  /** EDD */
  eddData = {
    monthlySalary: '', // 月薪
    currency: 'USDT', // 币种
    employmentStatusDesc: '', // 雇佣状态
    occupation: '', // 职业
    sourceOfFundsDesc: '', // 资金来源
  };

  /** 是否欧洲用户 */
  get isEurope() {
    if (typeof this.userDetailInfo?.isEurope === 'boolean') {
      return this.userDetailInfo?.isEurope;
    } else {
      // 亚洲：中国，香港，台湾，澳门，越南，泰国
      return !['CHN', 'HKG', 'TWN', 'MAC', 'VNM', 'THA'].includes(this.data?.countryCode);
    }
  }

  /** 标题 */
  get getTitle() {
    const titleFirst = new Map([
      [PendingedCategoryObjEnum.Kyc, 'risk.kycAudit'], // KYC审核
      [PendingedCategoryObjEnum.Risk, 'risk.riskReview'], // 风控审核
    ]);
    const titleLast = new Map([
      [RiskFormTypeObjEnum.KycIntermediate, 'member.kyc.middle'], // KYC中级
      [RiskFormTypeObjEnum.KycAdvanced, 'member.kyc.adv'], // KYC高级
      [RiskFormTypeObjEnum.ID, 'risk.docRequest.id'], // ID
      [RiskFormTypeObjEnum.POA, 'risk.docRequest.poa'], // POA
      [RiskFormTypeObjEnum.PaymentMethod, 'risk.docRequest.payMentMethod'], // 支付方式
      [RiskFormTypeObjEnum.Customize, 'risk.docRequest.customize'], // 自定义
      [RiskFormTypeObjEnum.WealthSourceDocument, 'risk.docRequest.sourceOfWealth'], // 财富来源证明
      [RiskFormTypeObjEnum.EDD, 'member.kyc.edd'], // EDD
    ]);

    return { first: titleFirst.get(this.pendingedType), last: titleLast.get(this.data?.type) };
  }

  ngOnInit() {
    // 风控审核：发送文件请求 - 获取币种
    if (this.data?.type === RiskFormTypeObjEnum.EDD) this.currencyService.updateCurrency();
    // KYC审核：欧洲中级 - 获取详情
    if (this.data?.type === RiskFormTypeObjEnum.KycIntermediate) this.kycBaseDetail();
    // 用户信息 - 获取数据
    this.getmemberbasicinfo();
  }

  /** 用户信息 - 获取数据 */
  getmemberbasicinfo() {
    this.appService.isContentLoadingSubject.next(true);
    this.memberApi.getmemberbasicinfo(this.data?.uid).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.userDetailInfo = res || {};
    });
  }

  /** KYC审核：欧洲中级KYC - 获取详情 */
  kycBaseDetail() {
    this.appService.isContentLoadingSubject.next(true);
    this.kycApi.postProcessEntitiesDetail(KYCTypeEnum.Base, this.data?.uid, this.data?.tenantId).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.idData.firstName = res?.pojo?.firstName;
      this.idData.lastName = res?.pojo?.lastName;
      this.idData.countryCode = res?.entityCountryCode || res?.pojo?.countryCode;
      this.poaData.address = res?.pojo?.address;
      this.poaData.city = res?.city || res?.pojo?.city;
      this.poaData.zipCode = res?.zipCode || res?.pojo?.zipCode;
    });
  }

  /** 财富来源 - 下拉选择变化 */
  moneySourcesChange() {
    this.moneySourcesImageList = this.moneySourcesList.filter((v) => [...this.moneySources].includes(v.key));
  }

  /** 确认补充 */
  confirm() {
    // KYC审核
    if (this.pendingedType === PendingedCategoryObjEnum.Kyc) {
      switch (this.data?.type) {
        // 欧洲中级KYC - ID/POA
        case RiskFormTypeObjEnum.KycIntermediate:
          this.intermediateIdPoaCardForeu();
          break;
        // 欧洲高级KYC - 财富来源
        case RiskFormTypeObjEnum.KycAdvanced:
          this.uploadsow();
          break;
      }
    }

    // 风控审核
    if (this.pendingedType === PendingedCategoryObjEnum.Risk) {
      switch (this.data?.type) {
        // 发送文件请求 - ID
        case RiskFormTypeObjEnum.ID:
          this.uploadidverification();
          break;
        // 发送文件请求 - POA
        case RiskFormTypeObjEnum.POA:
          this.uploadproofofaddress();
          break;
        // 发送文件请求 - 支付方式
        case RiskFormTypeObjEnum.PaymentMethod:
          this.uploadpaymentmethod();
          break;
        // 发送文件请求 - 自定义
        case RiskFormTypeObjEnum.Customize:
          this.uploadcustomize();
          break;
        // 发送文件请求 - EDD（风险评估问卷）
        case RiskFormTypeObjEnum.EDD:
          this.submitedd();
          break;
        // 发送文件请求 - 财富来源证明
        case RiskFormTypeObjEnum.WealthSourceDocument:
          this.uploadsow();
          break;
      }
    }
  }

  /** 风控审核：发送文件请求 - ID */
  uploadidverification() {
    this.appService.isContentLoadingSubject.next(true);
    const parmas = {
      id: this.data.id,
      country: this.idData.countryCode,
      idType: this.idData.idType,
      frontImage: this.idData.idFrontsideImage,
      originalFrontImageName: this.idData?.idFrontsideImage.split('/').pop(),
      ...(this.idData.idType === 'ID_CARD'
        ? {
            backImage: this.idData.idBacksideImage,
            originalBackImageName: this.idData?.idBacksideImage.split('/').pop(),
          }
        : {}),
    };
    this.riskApi.uploadidverification(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
      this.close(res);
    });
  }

  /** 风控审核：发送文件请求 - POA */
  uploadproofofaddress() {
    this.appService.isContentLoadingSubject.next(true);
    const parmas = {
      id: this.data.id,
      address: this.poaData.address,
      city: this.poaData.city,
      postalCode: this.poaData.zipCode,
      screenshotProof: this.poaData?.networkImgeUrl,
      originalFileName: this.poaData?.networkImgeUrl.split('/').pop(),
    };
    this.riskApi.uploadproofofaddress(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
      this.close(res);
    });
  }

  /** 风控审核：发送文件请求 - 支付方式 */
  uploadpaymentmethod() {
    this.appService.isContentLoadingSubject.next(true);
    const parmas = {
      id: this.data.id,
      paymentName: this.paymentMethodData.paymentName,
      screenshotProof: this.paymentMethodData.screenshotProof,
      originalFileName: this.paymentMethodData?.screenshotProof.split('/').pop(),
    };
    this.riskApi.uploadpaymentmethod(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
      this.close(res);
    });
  }

  /** 风控审核：发送文件请求 - 自定义 */
  uploadcustomize() {
    this.appService.isContentLoadingSubject.next(true);
    const parmas = {
      id: this.data.id,
      customizeName: this.customizeData.customizeName,
      customizeValue: this.customizeData.screenshotProof,
      originalFileName: this.customizeData?.screenshotProof.split('/').pop(),
    };
    this.riskApi.uploadcustomize(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
      this.close(res);
    });
  }

  /** 风控审核：发送文件请求 - EDD（风险评估问卷） */
  submitedd() {
    this.appService.isContentLoadingSubject.next(true);
    const parmas = {
      id: this.data.id,
      monthlySalary: +this.eddData.monthlySalary,
      currency: this.eddData.currency,
      employmentStatus: this.eddData.employmentStatusDesc,
      occupation: this.eddData.occupation,
      sourceOfFunds: this.eddData.sourceOfFundsDesc,
    };
    this.riskApi.submitedd(parmas).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
      this.close(res);
    });
  }

  /** KYC审核：欧洲中级KYC - ID/POA */
  intermediateIdPoaCardForeu() {
    const commonParmas = {
      id: this.data.id,
      uid: this.data.uid,
      clientKey: String(this.data.tenantId),
      country: this.idData.countryCode,
      address: this.poaData.address,
    };

    const idParmas = {
      ...commonParmas,
      firstName: this.idData.firstName,
      lastName: this.idData.lastName,
      idType: this.idData.idType,
      frontsideImage: this.idData.idFrontsideImage,
      originalFileName: this.idData?.idFrontsideImage.split('/').pop(),
      ...(this.idData.idType === 'ID_CARD'
        ? {
            backsideImage: this.idData.idBacksideImage,
            originalFileName2: this.idData?.idBacksideImage.split('/').pop(),
          }
        : {}),
    };
    const poaParmas = {
      ...commonParmas,
      city: this.poaData.city,
      postalCode: this.poaData.zipCode,
      networkImgeUrl: this.poaData.networkImgeUrl,
      originalFileName: this.poaData?.networkImgeUrl.split('/').pop(),
    };

    this.appService.isContentLoadingSubject.next(true);
    zip(this.riskApi.intermediateidcardforeu(idParmas), this.riskApi.intermediatepoaforeu(poaParmas)).subscribe(
      ([isIdSuccess, isPoaSuccess]) => {
        this.appService.isContentLoadingSubject.next(false);
        this.appService.toastOpera(isIdSuccess && isPoaSuccess);
        this.close(isIdSuccess || isPoaSuccess);
      }
    );
  }

  /** KYC审核：欧洲高级/风控审核：发送文件请求 - 财富来源 */
  uploadsow() {
    if (!this.moneySourcesImageList.length) return;

    let parmas = {
      id: this.data.id,
      uid: this.data.uid,
      clientKey: String(this.data.tenantId),
      moneySources: this.moneySources,
    };
    this.moneySourcesImageList.forEach((v) => {
      parmas[v.imgValue] = [v.imgUrl];
    });

    this.appService.isContentLoadingSubject.next(true);
    this.riskApi[this.data?.type === RiskFormTypeObjEnum.KycAdvanced ? 'kycadvancedforeu' : 'uploadsow'](
      parmas
    ).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.toastOpera(res);
      this.close(res);
    });
  }

  /** 关闭弹窗 */
  close(isSuccess: boolean) {
    if (!isSuccess) return;
    this.modal.close(true);
    this.confirmSuccess.emit();
  }
}
