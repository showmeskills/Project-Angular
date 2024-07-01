import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { KycApi } from 'src/app/shared/api/kyc.api';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { zip } from 'rxjs';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { NzImageDirective } from 'src/app/shared/components/image/image.directive';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgIf, NgFor } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
import { AuditData } from 'src/app/shared/interfaces/member.interface';
import { EmptyComponent } from 'src/app/shared/components/empty/empty.component';
@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    MatTabsModule,
    NgFor,
    AngularSvgIconModule,
    NzImageDirective,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
    EmptyComponent,
  ],
})
export class MemberDetailAuthenticationComponent implements OnInit {
  constructor(
    public modal: MatModalRef<MemberDetailAuthenticationComponent>,
    private appService: AppService,
    private api: KycApi,
    public lang: LangService,
    private monitorApi: MonitorApi
  ) {}

  isLoading = false;

  currentTabValue: any = 0; // 当前选中
  tabs = [
    { name: '基础', lang: 'member.kyc.basis', value: 0 },
    { name: '中级', lang: 'member.kyc.middle', value: 1 },
    { name: '高级', lang: 'member.kyc.adv', value: 2 },
    { name: '风控问卷调查', lang: 'member.kyc.riskControl', value: 3 },
    { name: '财富来源证明', lang: 'risk.wealthTitle', value: 4 },
    { name: '全套审核', lang: 'risk.uploadSpecified', value: 5 },
  ];

  imageList: any[] = [
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

  data: any;
  riskList: any = [];
  wealthSourceList: any = [];
  fullAuditList: AuditData | null;
  riskFlag = false;
  wealthSourceFlag = false;

  // 发起按钮是否显示
  btnFlag = false;
  @Input() tenantId: any;
  @Input() uid: any;
  @Input() userDetailsInfo: any;

  ngOnInit() {
    this.getList();
    this.getRiskList();
  }

  changeTab(value: any) {
    this.currentTabValue = value;
    if (value < 3) {
      this.getList();
      this.btnFlag = false;
    }
    if (value === 3) {
      this.btnFlag = this.riskFlag;
    }
    if (value === 4) {
      this.btnFlag = this.wealthSourceFlag;
    }
    if (value === 5) {
      this.btnFlag = false;
    }
  }

  getList() {
    this.loading(true);
    this.api.postProcessEntitiesDetail(this.currentTabValue, this.uid, this.tenantId).subscribe((res) => {
      this.loading(false);
      if (res) this.data = res;
    });
  }

  /**获取风控与财富来源证明数据 */
  getRiskList() {
    this.loading(true);
    zip(
      this.monitorApi.getLastRisk({ uid: this.uid, type: 'RiskAssessment' }),
      this.monitorApi.getLastRisk({ uid: this.uid, type: 'WealthSource' }),
      this.monitorApi.getLastRisk({ uid: this.uid, type: 'FullAudit' }),
      this.monitorApi.queryProgressRisk({ uid: this.uid, type: 'RiskAssessment' }),
      this.monitorApi.queryProgressRisk({ uid: this.uid, type: 'WealthSource' })
    ).subscribe(([riskList, wealthSourceList, fullAuditList, riskFlag, wealthSourceFlag]) => {
      this.riskList = riskList;
      this.wealthSourceList = wealthSourceList;
      this.fullAuditList = fullAuditList;
      this.riskFlag = !riskFlag && !riskList;
      this.wealthSourceFlag = !wealthSourceFlag && !wealthSourceList && riskList;
      if (wealthSourceList) {
        this.imageList = this.imageList.filter(({ key }) => {
          return Array.isArray(this.wealthSourceList.form[key]) && this.wealthSourceList.form[key].length > 0;
        });
      }
      this.loading(false);
    });
  }

  getIdText(type: any): any {
    const text: any = new Map([
      ['ID_CARD', '身份证'],
      ['DRIVING LICENSE', '行驶证'],
      ['PASSPORT', '护照'],
      ['VISA', '签证'],
    ]);
    return text.get(type) || '-';
  }

  getImage(image: any) {
    if (!image) return [];
    return image.substr(0, 4) == 'http' || image.substr(0, 5) == 'https' ? image : 'data:image/png;base64,' + image;
  }

  /** 加载状态 */
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /**发起验证 */
  launch() {
    this.loading(true);
    if (this.currentTabValue === 3) {
      this.monitorApi.addRiskAssessmentForm({ uid: this.uid }).subscribe((res) => {
        this.loading(false);
        this.appService.showToastSubject.next({
          msgLang: res ? 'member.kyc.verificationSuc' : 'member.kyc.verificationFail', //发起验证提示语
          successed: res,
        });
        this.modal.close();
      });
    }
    if (this.currentTabValue === 4) {
      this.monitorApi.addWealthSourceForm({ uid: this.uid }).subscribe((res) => {
        this.loading(false);
        this.appService.showToastSubject.next({
          msgLang: res ? 'member.kyc.verificationSuc' : 'member.kyc.verificationFail', //发起验证提示语
          successed: res,
        });
        this.modal.close();
      });
    }
  }
}
