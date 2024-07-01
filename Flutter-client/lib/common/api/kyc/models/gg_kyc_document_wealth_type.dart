import 'package:gogaming_app/widget_header.dart';

enum GGKycDocumentWealthType {
  /// 薪资
  salaryImages('salaryImages'),

  /// 自营职业
  selfEmployedIncomeImages('selfEmployedIncomeImages'),

  /// 存款
  savingsImages('savingsImages'),

  /// 津贴
  allowanceImages('allowanceImages'),

  /// 养老金
  pensionImages('pensionImages'),

  /// 公司分红或收益
  dividendsProfitFromCompanyImages('dividendsProfitFromCompanyImages'),

  /// 日内交易
  daytradingImages('daytradingImages'),

  /// 博彩
  gamblingImages('gamblingImages'),

  /// 被动收入
  passiveIncomeImages('passiveIncomeImages'),

  /// 贷款/按揭
  loansMortgagesImages('loansMortgagesImages'),

  /// 金融资产出售
  saleOfFinancialAssetsImages('saleOfFinancialAssetsImages'),

  /// 不动产或其他资产出售
  salesOfRealEstateOrOtherAssetsImages('salesOfRealEstateOrOtherAssetsImages'),

  /// 遗产
  inheritanceImages('inheritanceImages'),

  /// 捐赠
  donationsImages('donationsImages'),

  /// 加密货币挖矿
  cryptoMiningImages('cryptoMiningImages');

  const GGKycDocumentWealthType(this.value);
  final String value;

  String get text {
    switch (this) {
      case GGKycDocumentWealthType.salaryImages:
        return localized('wealth_source_salary2');
      case GGKycDocumentWealthType.selfEmployedIncomeImages:
        return localized('wealth_source_self_employed_income');
      case GGKycDocumentWealthType.savingsImages:
        return localized('wealth_source_savings');
      case GGKycDocumentWealthType.allowanceImages:
        return localized('wealth_source_allowance');
      case GGKycDocumentWealthType.pensionImages:
        return localized('wealth_source_pension2');
      case GGKycDocumentWealthType.dividendsProfitFromCompanyImages:
        return localized('wealth_source_dividends_profit_from_company');
      case GGKycDocumentWealthType.daytradingImages:
        return localized('wealth_source_daytrading');
      case GGKycDocumentWealthType.gamblingImages:
        return localized('wealth_source_gambling');
      case GGKycDocumentWealthType.passiveIncomeImages:
        return localized('wealth_source_passive_income');
      case GGKycDocumentWealthType.loansMortgagesImages:
        return localized('wealth_source_loans_mortgages');
      case GGKycDocumentWealthType.saleOfFinancialAssetsImages:
        return localized('wealth_source_sale_of_financial_assets');
      case GGKycDocumentWealthType.salesOfRealEstateOrOtherAssetsImages:
        return localized('wealth_source_sales_of_real_estate_or_other_assets');
      case GGKycDocumentWealthType.inheritanceImages:
        return localized('wealth_source_inheritance');
      case GGKycDocumentWealthType.donationsImages:
        return localized('wealth_source_donations');
      case GGKycDocumentWealthType.cryptoMiningImages:
        return localized('wealth_source_crypto_mining');
    }
  }
}
