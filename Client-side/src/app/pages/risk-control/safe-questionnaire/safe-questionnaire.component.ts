import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { RiskControlApi } from 'src/app/shared/apis/risk-control.api';
import {
  AssesmentItem,
  RiskAssessmentRequest,
  RiskAuditFormRes,
  RiskFormMap,
} from 'src/app/shared/interfaces/risk-control.interface';
import { LayoutService } from 'src/app/shared/service/layout.service';
import { LocaleService } from 'src/app/shared/service/locale.service';
import { RiskControlService } from '../risk-control.service';

@UntilDestroy()
@Component({
  selector: 'app-safe-questionnaire',
  templateUrl: './safe-questionnaire.component.html',
  styleUrls: ['./safe-questionnaire.component.scss'],
})
export class SafeQuestionnaireComponent implements OnInit {
  constructor(
    private layout: LayoutService,
    public appService: AppService,
    private riskService: RiskControlService,
    private riskApi: RiskControlApi,
    private route: ActivatedRoute,
    private router: Router,
    private localeService: LocaleService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
  }

  isH5!: boolean;
  completed: boolean = false;
  submitLoading: boolean = false;
  prevData!: RiskAuditFormRes;
  rejected: boolean = false;

  /** 问卷数据 */
  foundSourceProof: { [key: string]: AssesmentItem } = {
    annualIncome: {
      order: 1,
      label: this.localeService.getValue('yearly_income'),
      input: true,
      unit: 'USDT',
      type: 'number',
      max: 30,
      value: '',
      errorTxt: '',
    },
    employStatus: {
      order: 2,
      label: this.localeService.getValue('employment_status'),
      drop: true,
      value: '',
      optionLists: [
        {
          name: this.localeService.getValue('worker'),
          value: 'Employment',
        },
        {
          name: this.localeService.getValue('self_employed'),
          value: 'Freelance',
        },
        {
          name: this.localeService.getValue('student'),
          value: 'Student',
        },
        {
          name: this.localeService.getValue('retiree'),
          value: 'Retiree',
        },
        {
          name: this.localeService.getValue('unemployed'),
          value: 'UnEmployment',
        },
        {
          name: this.localeService.getValue('other'),
          value: 'Other',
        },
      ],
      selectType: 'employStatus',
    },
    companyName: {
      order: 3,
      label: this.localeService.getValue('company_name'),
      value: '',
      input: false,
      type: 'text',
      max: 30,
    },
    companyAddress: {
      order: 4,
      label: this.localeService.getValue('company_address'),
      value: '',
      input: false,
      type: 'text',
      max: 30,
    },
    netAsset: {
      order: 5,
      label: this.localeService.getValue('total_net_assets'),
      input: true,
      unit: 'USDT',
      type: 'number',
      max: 30,
      value: '',
      errorTxt: '',
    },
    assetSource: {
      order: 6,
      label: this.localeService.getValue('assets_source'),
      drop: true,
      value: '',
      optionLists: [
        {
          name: this.localeService.getValue('salary'),
          value: 'Salary',
        },
        {
          name: this.localeService.getValue('wealth_source_sale_house'),
          value: 'House',
        },
        {
          name: this.localeService.getValue('wealth_source_borrow_money'),
          value: 'BorrowMoney',
        },
        {
          name: this.localeService.getValue('aff_c_jy'),
          value: 'Business',
        },
        {
          name: this.localeService.getValue('wealth_source_gamble_upload_title'),
          value: 'Gamble',
        },
        {
          name: this.localeService.getValue('company_dividends'),
          value: 'Stock',
        },
      ],
      selectType: 'assetSource',
    },
  };

  /** 自定义下拉 */
  expand: boolean = false;

  /** 当前主题颜色 */
  theme!: string;

  /** 声明 */
  declearation: boolean = false;

  ngOnInit(): void {
    this.layout.isH5$.pipe(untilDestroyed(this)).subscribe(v => (this.isH5 = v));
    this.appService.themeSwitch$.pipe(untilDestroyed(this)).subscribe(v => {
      this.theme = v === 'sun' ? 'light' : 'dark';
    });

    //获取上次提交的数据
    this.route.queryParams.pipe(untilDestroyed(this), take(1)).subscribe(async params => {
      if (params.status && params.status == 'rejected') {
        this.rejected = true;
        const auditFromResp = await firstValueFrom(
          this.riskApi.getLastAuditForm({ type: RiskFormMap.RISKASSESSMENT, status: 'Rejected' })
        );
        if (auditFromResp.success) {
          this.prevData = auditFromResp.data;
          for (const i in this.prevData.form) {
            this.foundSourceProof[i].value = this.prevData.form[i].toString();
          }
          return;
        }
      } else {
        Object.assign(this.foundSourceProof, {});
      }
    });
  }

  /** 是否可以提交 */
  get canSubmit(): boolean {
    const canSubmit =
      !!this.foundSourceProof.annualIncome.value &&
      !!this.foundSourceProof.employStatus.value &&
      !!this.foundSourceProof.netAsset.value &&
      !!this.foundSourceProof.assetSource.value;

    if (this.needsCompanyValue(this.foundSourceProof.employStatus.value)) {
      return canSubmit && !!this.foundSourceProof.companyAddress.value && !!this.foundSourceProof.companyName.value;
    }

    return canSubmit;
  }

  /**
   * 下拉 后补充资料
   *
   * @param selectType 下拉数据类型
   * @param value 下拉value值
   */
  onSelectValueChange(selectType: string, value: string) {
    if (selectType === 'employStatus') {
      this.foundSourceProof['companyName'].input = this.needsCompanyValue(value);
      this.foundSourceProof['companyAddress'].input = this.needsCompanyValue(value);
    }
  }

  @ViewChild('iAmount') iAmountRef: any;
  handleNumberChange(element: any, type?: string, value?: any) {
    if (type === 'number') {
      element.value = value ?? element.value.replace(/[^\d]/g, '');
    }
  }

  /**
   * 当前所选雇佣状态是否需要公司信息
   *
   * @param status
   * @returns
   */
  needsCompanyValue(status: string) {
    return ['Employment', 'Freelance'].includes(status);
  }

  /** 提交审核 */
  onSubmitPending() {
    this.submitLoading = true;
    const params: RiskAssessmentRequest = {
      annualIncome: parseInt(this.foundSourceProof.annualIncome.value),
      employStatus: this.foundSourceProof.employStatus.value,
      netAsset: parseInt(this.foundSourceProof.netAsset.value),
      assetSource: this.foundSourceProof.assetSource.value,
      companyAddress: this.needsCompanyValue(this.foundSourceProof.employStatus.value)
        ? this.foundSourceProof.companyAddress.value
        : '',
      companyName: this.needsCompanyValue(this.foundSourceProof.employStatus.value)
        ? this.foundSourceProof.companyName.value
        : '',
      id: this.riskService.riskFormList.find(x => x.type == RiskFormMap.RISKASSESSMENT)?.id ?? 0,
    };
    this.riskApi.submitRiskAssessment(params).subscribe(resp => {
      if (resp.data) {
        this.submitLoading = false;
        this.completed = true;
        this.riskService.handleFormStorage(false, RiskFormMap.RISKASSESSMENT);
        this.riskService.checkUserRiskForm();
      }
    });
  }
}
