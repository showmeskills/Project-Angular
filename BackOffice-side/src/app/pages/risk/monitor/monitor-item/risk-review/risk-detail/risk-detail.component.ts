import { Component, OnInit, Input } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { MatModalRef } from 'src/app/shared/components/dialogs/modal';
import { LangService } from 'src/app/shared/components/lang/lang.service';
import { MonitorApi } from 'src/app/shared/api/monitor.api';
import { LangPipe } from 'src/app/shared/components/lang/lang.pipe';
import { CurrencyValuePipe } from 'src/app/shared/pipes/currency-value.pipe';
import { TimeFormatPipe } from 'src/app/shared/pipes/time.pipe';
import { FormsModule } from '@angular/forms';
import { FormRowComponent } from 'src/app/shared/components/form-row/form-row.component';
import { NzImageDirective } from 'src/app/shared/components/image/image.directive';
import { NgIf, NgFor } from '@angular/common';
import { ModalTitleComponent } from 'src/app/shared/components/dialogs/modal/modal-title.component';
@Component({
  selector: 'app-risk-detail',
  templateUrl: './risk-detail.component.html',
  styleUrls: ['./risk-detail.component.scss'],
  standalone: true,
  imports: [
    ModalTitleComponent,
    NgIf,
    NgFor,
    NzImageDirective,
    FormRowComponent,
    FormsModule,
    TimeFormatPipe,
    CurrencyValuePipe,
    LangPipe,
  ],
})
export class RiskDetailComponent implements OnInit {
  constructor(
    public modal: MatModalRef<RiskDetailComponent>,
    private appService: AppService,
    public lang: LangService,
    private api: MonitorApi
  ) {}

  @Input() data: any;
  auditList: any[] = [
    { name: '通过', lang: 'risk.passing', value: 'Finish' },
    { name: '不通过', lang: 'risk.noPass', value: 'Rejected' },
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

  detail: any = [];
  audit: any = 'Finish';
  remark: any = '';
  processState = 1;
  isLoading = false; // 是否处于加载
  ngOnInit() {
    this.loading(true);
    this.api.getLastRisk({ type: 'RiskAssessment', uid: this.data.uid }).subscribe((res) => {
      this.detail = res ? res.form : [];
      this.loading(false);
    });
    const list = this.imageList.filter(({ key }) => {
      return Array.isArray(this.data.form[key]) && this.data.form[key].length > 0;
    });

    this.imageList = list;
  }

  // 加载状态
  loading(v: boolean): void {
    this.isLoading = v;
    this.appService.isContentLoadingSubject.next(v);
  }

  /**审核财富来源证明 */
  review() {
    if (this.audit === 'Rejected' && !this.remark) {
      this.appService.showToastSubject.next({
        msgLang: 'risk.fillRemarks', // 备注为必填项
        successed: false,
      });
      return;
    }
    if (this.data?.status === 'Pending') {
      this.loading(true);
      this.api.auditRiskForm({ id: this.data.id, status: this.audit, remark: this.remark }).subscribe((res) => {
        this.appService.showToastSubject.next({
          msgLang: res ? 'risk.suc' : 'risk.fail', //发起验证提示语
          successed: res,
        });
        this.loading(false);
        this.modal.close(true);
      });
    } else {
      this.modal.close();
    }
  }
}
