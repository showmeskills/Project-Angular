import { NgIf, NgFor, NgSwitchCase, NgSwitch, NgSwitchDefault, NgTemplateOutlet } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { zip, tap } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { MemberApi } from 'src/app/shared/api/member.api';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { MatModalModule, MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NzImageDirective } from 'src/app/shared/components/image';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { FormatMoneyPipe } from 'src/app/shared/pipes/big-number.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { KYCRiskTypeEnum, KYCReviewTypeEnum } from 'src/app/shared/interfaces/kyc';
import { Tabs, KeyName } from 'src/app/shared/interfaces/base.interface';
import { UploadComponent } from 'src/app/shared/components/upload/upload.component';

@Component({
  selector: 'app-risk-doc-audit-popup',
  templateUrl: './risk-doc-audit-popup.component.html',
  styleUrls: ['./risk-doc-audit-popup.component.scss'],
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
    ModalTitleComponent,
    FormatMoneyPipe,
    UploadComponent,
    NgTemplateOutlet,
  ],
})
export class RiskDocAuditPopupComponent implements OnInit {
  constructor(
    public modal: MatModalRef<RiskDocAuditPopupComponent>,
    private appService: AppService,
    public lang: LangService,
    private api: MonitorApi,
    private memberApi: MemberApi
  ) {}

  protected readonly KYCRiskTypeEnum = KYCRiskTypeEnum;
  protected readonly KYCReviewTypeEnum = KYCReviewTypeEnum;

  @Input() tenantId: any;
  @Input() status: string; // 状态：审核audit，审核详情detail
  @Input() data: any; // 列表内容

  /** 用户基本信息 */
  infoData: any = {};

  auditValue: KYCReviewTypeEnum = KYCReviewTypeEnum.Finish;
  auditList: Tabs[] = [
    { name: '通过', lang: 'risk.passing', value: KYCReviewTypeEnum.Finish },
    { name: '不通过', lang: 'risk.noPass', value: KYCReviewTypeEnum.Rejected },
  ];

  remark = '';

  selectImagesList: KeyName[] = [];
  imageList: KeyName[] = [
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

  /**  获取标题 */
  get getTitle() {
    switch (this.data?.type) {
      case KYCRiskTypeEnum.ID:
        return 'risk.docRequest.id';
      case KYCRiskTypeEnum.POA:
        return 'risk.docRequest.poa';
      case KYCRiskTypeEnum.WealthSourceDocument:
        return 'risk.docRequest.sourceOfWealth';
      case KYCRiskTypeEnum.PaymentMethod:
        return 'risk.docRequest.payMentMethod';
      case KYCRiskTypeEnum.Customize:
        return 'risk.docRequest.customize';
      case KYCRiskTypeEnum.EDD:
        return 'member.kyc.edd';
      default:
        return 'common.unknown';
    }
  }

  ngOnInit() {
    this.appService.isContentLoadingSubject.next(true);
    zip(
      // 用户信息 - 获取数据
      this.getmemberbasicinfo()
    ).subscribe(() => {
      this.appService.isContentLoadingSubject.next(false);
    });

    this.getWealthSourceDocumentData();
  }

  /** 用户信息 - 获取数据 */
  getmemberbasicinfo() {
    return this.memberApi.getmemberbasicinfo(this.data?.uid).pipe(
      tap((res) => {
        this.infoData = res || {};
      })
    );
  }

  /** 财富来源 - 匹配数据 */
  getWealthSourceDocumentData() {
    if (this.data?.type !== KYCRiskTypeEnum.WealthSourceDocument) return;

    const list = this.imageList.filter(({ key }) => {
      return (
        Array.isArray(this.data.form[key]) && this.data.form[key].length > 0 && !this.data.form[key].includes('string')
      );
    });
    this.selectImagesList = list || [];
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

  confirm() {
    if (this.auditValue === KYCReviewTypeEnum.Rejected && !this.remark) {
      this.appService.showToastSubject.next({
        msgLang: 'risk.fillRemarks', // 备注为必填项
        successed: false,
      });
      return;
    }
    const params = {
      id: this.data.id,
      status: this.auditValue,
      ...(this.auditValue === KYCReviewTypeEnum.Rejected ? { remark: this.remark } : {}),
    };
    this.appService.isContentLoadingSubject.next(true);
    this.api.auditRiskForm(params).subscribe((res) => {
      this.appService.isContentLoadingSubject.next(false);
      this.appService.showToastSubject.next({
        msgLang: res ? 'risk.suc' : 'risk.fail', //发起验证提示语
        successed: res,
      });
      if (res === true) this.modal.close(true);
    });
  }
}
