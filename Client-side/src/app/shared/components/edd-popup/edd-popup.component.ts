import { Component, DestroyRef, Inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { KycApi } from '../../apis/kyc-basic.api';
import { EddParams } from '../../interfaces/kyc.interface';
import { LocaleService } from '../../service/locale.service';
import { ToastService } from '../../service/toast.service';
import { EddPopupService } from './edd-popup.service';

@Component({
  selector: 'app-edd-popup',
  templateUrl: './edd-popup.component.html',
  styleUrls: ['./edd-popup.component.scss'],
})
export class EddPopupComponent implements OnInit, OnDestroy {
  constructor(
    private dialog: MatDialogRef<EddPopupComponent>,
    private appService: AppService,
    private localeService: LocaleService,
    private eddService: EddPopupService,
    private kycApi: KycApi,
    private toast: ToastService,
    private destroyRef: DestroyRef,
    @Inject(MAT_DIALOG_DATA) public data: { isOpenQuestions: boolean }
  ) {}

  ngOnInit() {
    this.appService.currencies$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(v => v.filter(x => !x.isDigital && x.isVisible).map(v => ({ key: v.currency, value: v.currency })))
      )
      .subscribe(currencies => {
        this.fiatCurrencies = currencies;
      });
    if (this.data.isOpenQuestions) {
      this.step = 1;
    }
  }

  /** edd 表格 */
  eddDocs = {
    monthlySalary: '',
    currency: '',
    employmentStatus: {
      value: -1,
      options: [
        {
          key: 0,
          value: this.localeService.getValue('empl'),
          param: 'Employee',
        },
        {
          key: 1,
          value: this.localeService.getValue('self_e'),
          param: 'SelfEmployed',
        },
        {
          key: 2,
          value: this.localeService.getValue('student'),
          param: 'Student',
        },
        {
          key: 3,
          value: this.localeService.getValue('retiree'),
          param: 'Retiree',
        },
        {
          key: 4,
          value: this.localeService.getValue('unemployed'),
          param: 'UnEmployed',
        },
      ],
    },
    occupation: '',
    sourceOfFunds: {
      options: [
        {
          key: 0,
          value: this.localeService.getValue('salary_self_employment_income'),
          param: 'SalarySelfEmploymentIncome',
        },
        {
          key: 1,
          value: this.localeService.getValue('savings'),
          param: 'Savings',
        },
        {
          key: 2,
          value: this.localeService.getValue('pension'),
          param: 'Pension',
        },
        {
          key: 3,
          value: this.localeService.getValue('sale_of_real_estate'),
          param: 'SaleOfRealEstate',
        },
        {
          key: 4,
          value: this.localeService.getValue('inheritance'),
          param: 'Inheritance',
        },
        {
          key: 5,
          value: this.localeService.getValue('ownership_of_a_business'),
          param: 'OwnershipOfABusiness',
        },
        {
          key: 6,
          value: this.localeService.getValue('investment'),
          param: 'Investment',
        },
        {
          key: 7,
          value: this.localeService.getValue('others'),
          param: 'Others',
        },
      ],
      value: -1,
    },
  };

  /** 步骤 0 为初始弹窗， 1 为EDD 问卷弹窗 */
  step: number = 0;

  /** 当前法币 */
  fiatCurrencies: Array<{ key: string; value: string }> = [];

  /** 是否展示 职位 */
  showOccupation: boolean = false;

  /** loading */
  loading: boolean = false;

  /**
   * 是否可以提交表单
   *
   * @returns
   */
  get canSubmitForm(): boolean {
    const salary = this.eddDocs.monthlySalary.length > 0;
    const currency = this.eddDocs.currency.length > 0;
    const status =
      this.eddDocs.employmentStatus.options.find(item => item.key === this.eddDocs.employmentStatus.value)?.value || '';
    const occupation = this.eddDocs.occupation.length > 0;
    const source =
      this.eddDocs.sourceOfFunds.options.find(item => item.key === this.eddDocs.sourceOfFunds.value)?.value || '';
    if (this.showOccupation) return salary && currency && status.length > 0 && occupation && source.length > 0;
    return Number(salary) > 0 && currency && status.length > 0 && source.length > 0;
  }

  /**
   * 获取表单参数
   *
   * @returns EddParams
   */
  get params(): EddParams {
    if (this.showOccupation) {
      return {
        monthlySalary: Number(this.eddDocs.monthlySalary || 0),
        currency: this.eddDocs.currency,
        employmentStatus:
          this.eddDocs.employmentStatus.options.find(item => item.key === this.eddDocs.employmentStatus.value)?.param ||
          '',
        occupation: this.eddDocs.occupation,
        sourceOfFunds:
          this.eddDocs.sourceOfFunds.options.find(item => item.key === this.eddDocs.sourceOfFunds.value)?.param || '',
      };
    }

    return {
      monthlySalary: Number(this.eddDocs.monthlySalary || ''),
      currency: this.eddDocs.currency,
      employmentStatus:
        this.eddDocs.employmentStatus.options.find(item => item.key === this.eddDocs.employmentStatus.value)?.param ||
        '',
      sourceOfFunds:
        this.eddDocs.sourceOfFunds.options.find(item => item.key === this.eddDocs.sourceOfFunds.value)?.param || '',
    };
  }

  /**
   * 职业状态改变
   *
   * @param $event
   */
  onEmploymentChange($event: number) {
    this.eddDocs.employmentStatus.value = $event;
    switch ($event) {
      case 2:
      case 3:
      case 4:
        this.showOccupation = false;
        break;
      default:
        this.showOccupation = true;
        break;
    }
  }

  /**
   * 资金来源
   *
   * @param $event
   */
  onSoourceChange($event: number) {
    this.eddDocs.sourceOfFunds.value = $event;
  }

  /**
   * 货币筛选
   *
   * @param $event
   */
  onCurrencyChange($event: string) {
    this.eddDocs.currency = $event;
  }

  /** 提交表单 */
  onSubmit() {
    this.loading = true;
    this.kycApi.onSubmitEdd(this.params).subscribe(data => {
      if (data) {
        this.eddService.success();
      } else {
        this.toast.show({ message: this.localeService.getValue('sub_f'), type: 'fail' });
      }
      this.onClose();
      this.loading = false;
    });
  }

  /** 关闭弹窗 */
  onClose() {
    this.dialog.close();
  }

  /** 当前弹窗销毁时 返回初始弹窗 */
  ngOnDestroy() {
    this.step = 0;
  }

  /** 关闭按钮弹窗 */
  onNoClick() {
    this.onClose();
    this.step = 0;
  }

  /**
   * 每月 工资change事件
   *
   * @param event
   */
  onChangeSalary(event: string) {
    event = event.replace(/[^\d]/g, '');
    if (Number(event) <= 0) event = '';
    this.eddDocs.monthlySalary = event;
  }
}
