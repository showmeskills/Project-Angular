import { Injectable, OnDestroy } from '@angular/core';
import { UserDocuments } from 'src/app/shared/interfaces/kyc.interface';
import { LocaleService } from 'src/app/shared/service/locale.service';

export type KYCResponseType = {
  primaryVerificationStatus: string;
  intermediateVerificationStatus: string;
  advancedVerificationStatus: string;
  primaryVerificationTime: string | null;
  intermediateVerificationTime: string | null;
  advancedVerificationTime: string | null;
};

export interface CardInfoConfig {
  id: number;
  header: string;
  status: 'I' | 'U' | 'P' | 'S' | 'R' | string;
  discrible: string;
  time: null;
  cardInfor: Array<{ value: string; icon: string; status?: null | string }>;
  acInforConfig: {
    fiatDepositLimit: string;
    fiatToVirtualLimit: string;
    fiatWithdrawLimit: string;
    virtualDepositLimit: string;
    virtualWithdrawLimit: string;
  };
  btnStyle?: {
    buttonText: string;
    btnClass: string;
  };
  buttonText?: string;
}

// kyc页面UI显示文案
const CARD_INFO_CONFIG: CardInfoConfig[] = [
  {
    // 基础认证
    id: 0,
    header: 'basic_ver',
    discrible: 'simple_fast',
    status: 'I',
    time: null,
    cardInfor: [
      { value: 'personal_info', icon: 'edit-simple', status: null },
      { value: 'review_time_one', icon: 'time' },
    ],
    acInforConfig: {
      fiatDepositLimit: '',
      fiatToVirtualLimit: '',
      fiatWithdrawLimit: '',
      virtualDepositLimit: '',
      virtualWithdrawLimit: '',
    },
  },
  {
    // 中级认证
    id: 1,
    header: 'inter_ceri',
    discrible: 'most_choose',
    status: 'U',
    time: null,
    cardInfor: [
      { value: 'basic_ver_req', icon: 'basic', status: null },
      { value: 'gov_id', icon: 'ic', status: null },
      { value: 'add_ver', icon: 'location', status: null },
      // { value: '银行卡', icon: 'bankcard' },
      // { value: '手机号', icon: 'phone' },
      // { value: '人脸识别认证', icon: 'face' },
      { value: 'review_t_ten', icon: 'time' },
    ],
    acInforConfig: {
      fiatDepositLimit: '',
      fiatToVirtualLimit: '',
      fiatWithdrawLimit: '',
      virtualDepositLimit: '',
      virtualWithdrawLimit: '',
    },
  },
  {
    //高级认证
    id: 2,
    header: 'ad_ceri',
    discrible: 'max_fiat_amount',
    status: 'U',
    time: null,
    cardInfor: [
      { value: 'inter_require', icon: 'basic', status: null },
      // { value: 'add_ver', icon: 'location' },
      { value: 'review_t_ten', icon: 'time' },
    ],
    acInforConfig: {
      fiatDepositLimit: '',
      fiatToVirtualLimit: '',
      fiatWithdrawLimit: '',
      virtualDepositLimit: '',
      virtualWithdrawLimit: '',
    },
  },
];

@Injectable({
  providedIn: 'root',
})
export class KycUtils implements OnDestroy {
  constructor(private localeService: LocaleService) {}
  getCardInfoConfig(): CardInfoConfig[] {
    const config1 = { ...CARD_INFO_CONFIG[0] },
      config2 = { ...CARD_INFO_CONFIG[1] },
      config3 = { ...CARD_INFO_CONFIG[2] };
    return [config1, config2, config3];
    // return newRef;
  }

  public NOTICE_CONTANTS = {
    primary: [
      { header: this.localeService.getValue('buy_cr_fiat'), text: ['$1000 ' + this.localeService.getValue('lifel00')] },
      { header: this.localeService.getValue('dep_with00'), text: ['$1000 ' + this.localeService.getValue('lifel00')] },
      { header: this.localeService.getValue('crypt_lim00'), text: ['50K USDT'] },
    ],
    intermediate: [
      {
        header: this.localeService.getValue('buy_cr_fiat'),
        text: ['$50K ' + this.localeService.getValue('day00'), '$500K ' + this.localeService.getValue('mon00')],
      },
      {
        header: this.localeService.getValue('dep_with00'),
        text: ['$10K ' + this.localeService.getValue('day00'), '$100K ' + this.localeService.getValue('mon00')],
      },
      { header: this.localeService.getValue('crypt_lim00'), text: ['5M USDT'] },
    ],
    advance: [
      {
        header: this.localeService.getValue('buy_cr_fiat'),
        text: ['$50K ' + this.localeService.getValue('day00'), '$500K ' + this.localeService.getValue('mon00')],
      },
      {
        header: this.localeService.getValue('dep_with00'),
        text: ['$10K' + this.localeService.getValue('day00'), '$100K ' + this.localeService.getValue('mon00')],
      },
      { header: this.localeService.getValue('crypt_lim00'), text: ['5M USDT'] },
    ],
  };

  // 模拟后台api返回的用户当前认证权限信息
  public kycQueryResponse: KYCResponseType = {
    primaryVerificationStatus: 'S',
    intermediateVerificationStatus: 'I',
    advancedVerificationStatus: 'I',
    primaryVerificationTime: null,
    intermediateVerificationTime: null,
    advancedVerificationTime: null,
  };

  //模拟后台api返回 用户身份证号信息
  public userIcNumberQueryResponse = {
    isExisted: true,
    icNumber: '50010720110101701',
  };

  /** 用户提交材料 */
  userDocuments: UserDocuments = {
    salaryImages: {
      label: 'salary_a',
      isSelected: false,
      order: 1,
      documents: {
        title: 'salary_a_tips',
        intro: ['salary_a_tips_a', 'salary_a_tips_b', 'salary_a_tips_c'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    selfEmployedIncomeImages: {
      label: 'self_employment',
      isSelected: false,
      order: 2,
      documents: {
        title: 'self_employment_doc',
        intro: ['self_employment_doc_a', 'self_employment_doc_b'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    savingsImages: {
      label: 'savings',
      isSelected: false,
      order: 3,
      documents: {
        title: 'savings_doc',
        intro: ['savings_doc_a'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    allowanceImages: {
      label: 'allowance',
      isSelected: false,
      order: 4,
      documents: {
        title: 'allowance_doc',
        intro: ['allowance_doc_a', 'allowance_doc_b'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    pensionImages: {
      label: 'pension',
      isSelected: false,
      order: 5,
      documents: {
        title: 'pension_doc',
        intro: ['pension_doc_a', 'pension_doc_b', 'pension_doc_c'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    dividendsProfitFromCompanyImages: {
      label: 'dividends',
      isSelected: false,
      order: 6,
      documents: {
        title: 'dividend_doc',
        intro: ['dividend_doc_a', 'dividend_doc_b', 'dividend_doc_c', 'dividend_doc_d'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    daytradingImages: {
      label: 'day_tradings',
      isSelected: false,
      order: 7,
      documents: {
        title: 'daytrading_doc',
        intro: ['daytrading_doc_a', 'daytrading_doc_c', 'daytrading_doc_d', 'daytrading_doc_b'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    gamblingImages: {
      label: 'gambling',
      isSelected: false,
      order: 8,
      documents: {
        title: 'gambling_doc',
        intro: ['daytrading_doc_a', 'daytrading_doc_c', 'daytrading_doc_d', 'daytrading_doc_b'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    passiveIncomeImages: {
      label: 'passive_income',
      isSelected: false,
      order: 9,
      documents: {
        title: 'passive_doc',
        intro: ['passive_doc_a', 'passive_doc_b', 'passive_doc_c'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    loansMortgagesImages: {
      label: 'loan_mortgages',
      isSelected: false,
      order: 10,
      documents: {
        title: 'Loans_doc',
        intro: ['Loans_doc_a', 'Loans_doc_b'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    saleOfFinancialAssetsImages: {
      label: 'sale_finance_assets',
      isSelected: false,
      order: 11,
      documents: {
        title: 'finanical_doc',
        intro: ['finanical_doc_a', 'finanical_doc_b'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    salesOfRealEstateOrOtherAssetsImages: {
      label: 'sale_real_estate',
      isSelected: false,
      order: 12,
      documents: {
        title: 'real_estate_doc',
        intro: ['real_estate_doc_a', 'real_estate_doc_b', 'real_estate_doc_c', 'real_estate_doc_d'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    inheritanceImages: {
      label: 'inheritance',
      isSelected: false,
      order: 13,
      documents: {
        title: 'inheritance_doc',
        intro: ['inheritance_doc_a', 'inheritance_doc_b'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    donationsImages: {
      label: 'wealth_source_contributed',
      isSelected: false,
      order: 14,
      documents: {
        title: 'donation_doc',
        intro: ['donation_doc_a', 'donation_doc_b', 'donation_doc_c'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
    cryptoMiningImages: {
      label: 'crypto_mining',
      isSelected: false,
      order: 15,
      documents: {
        title: 'crypto_mining_doc',
        intro: ['crypto_mining_doc_a', 'crypto_mining_doc_b', 'crypto_mining_doc_c'],
        uploads: [],
        loading: false,
        currentIndex: 0,
      },
    },
  };

  ngOnDestroy(): void {
    Object.values(this.userDocuments).forEach(item => {
      item.documents.uploads = [];
    });
  }
}
