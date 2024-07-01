import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_selector.dart';

enum WealthSourceType {
  /// 薪资
  salary('Salary', 0),

  /// 自营职业
  selfEmployedIncome('SelfEmployedIncome', 1),

  /// 存款
  savings('Savings', 2),

  /// 津贴
  allowance('Allowance', 3),

  /// 养老金
  pension('Pension', 4),

  /// 公司分红或收益
  dividendsProfitFromCompany('DividendsProfitFromCompany', 5),

  /// 日内交易
  daytrading('Daytrading', 6),

  /// 博彩
  gambling('Gambling', 7),

  /// 被动收入
  passiveIncome('PassiveIncome', 8),

  /// 贷款/按揭
  loansMortgages('LoansMortgages', 9),

  /// 金融资产出售
  saleOfFinancialAssets('SaleOfFinancialAssets', 10),

  /// 不动产或其他资产出售
  salesOfRealEstateOrOtherAssets('SalesOfRealEstateOrOtherAssets', 11),

  /// 遗产
  inheritance('Inheritance', 12),

  /// 捐赠
  donations('Donations', 13),

  /// 加密货币挖矿
  cryptoMining('CryptoMining', 14);

  const WealthSourceType(this.value, this.sort);
  final String value;
  final int sort;

  static WealthSourceType? fromeValue(String value) {
    return WealthSourceType.values
        .firstWhereOrNull((element) => element.value == value);
  }

  String get requestKey {
    switch (this) {
      case WealthSourceType.salary:
        return 'salaryImages';
      case WealthSourceType.selfEmployedIncome:
        return 'selfEmployedIncomeImages';
      case WealthSourceType.savings:
        return 'savingsImages';
      case WealthSourceType.allowance:
        return 'allowanceImages';
      case WealthSourceType.pension:
        return 'pensionImages';
      case WealthSourceType.dividendsProfitFromCompany:
        return 'dividendsProfitFromCompanyImages';
      case WealthSourceType.daytrading:
        return 'daytradingImages';
      case WealthSourceType.gambling:
        return 'gamblingImages';
      case WealthSourceType.passiveIncome:
        return 'passiveIncomeImages';
      case WealthSourceType.loansMortgages:
        return 'loansMortgagesImages';
      case WealthSourceType.saleOfFinancialAssets:
        return 'saleOfFinancialAssetsImages';
      case WealthSourceType.salesOfRealEstateOrOtherAssets:
        return 'salesOfRealEstateOrOtherAssetsImages';
      case WealthSourceType.inheritance:
        return 'inheritanceImages';
      case WealthSourceType.donations:
        return 'donationsImages';
      case WealthSourceType.cryptoMining:
        return 'cryptoMiningImages';
    }
  }

  String get text {
    switch (this) {
      case WealthSourceType.salary:
        return localized('wealth_source_salary2');
      case WealthSourceType.selfEmployedIncome:
        return localized('wealth_source_self_employed_income');
      case WealthSourceType.savings:
        return localized('wealth_source_savings');
      case WealthSourceType.allowance:
        return localized('wealth_source_allowance');
      case WealthSourceType.pension:
        return localized('wealth_source_pension2');
      case WealthSourceType.dividendsProfitFromCompany:
        return localized('wealth_source_dividends_profit_from_company');
      case WealthSourceType.daytrading:
        return localized('wealth_source_daytrading');
      case WealthSourceType.gambling:
        return localized('wealth_source_gambling');
      case WealthSourceType.passiveIncome:
        return localized('wealth_source_passive_income');
      case WealthSourceType.loansMortgages:
        return localized('wealth_source_loans_mortgages');
      case WealthSourceType.saleOfFinancialAssets:
        return localized('wealth_source_sale_of_financial_assets');
      case WealthSourceType.salesOfRealEstateOrOtherAssets:
        return localized('wealth_source_sales_of_real_estate_or_other_assets');
      case WealthSourceType.inheritance:
        return localized('wealth_source_inheritance');
      case WealthSourceType.donations:
        return localized('wealth_source_donations');
      case WealthSourceType.cryptoMining:
        return localized('wealth_source_crypto_mining');
    }
  }

  String get uploadTitle {
    switch (this) {
      case WealthSourceType.salary:
        return localized('wealth_source_salary2_upload_title');
      case WealthSourceType.selfEmployedIncome:
        return localized('wealth_source_self_employed_income_upload_title');
      case WealthSourceType.savings:
        return localized('wealth_source_savings_upload_title');
      case WealthSourceType.allowance:
        return localized('wealth_source_allowance_upload_title');
      case WealthSourceType.pension:
        return localized('wealth_source_pension2_upload_title');
      case WealthSourceType.dividendsProfitFromCompany:
        return localized(
            'wealth_source_dividends_profit_from_company_upload_title');
      case WealthSourceType.daytrading:
        return localized('wealth_source_daytrading_upload_title');
      case WealthSourceType.gambling:
        return localized('wealth_source_gambling_upload_title');
      case WealthSourceType.passiveIncome:
        return localized('wealth_source_passive_income_upload_title');
      case WealthSourceType.loansMortgages:
        return localized('wealth_source_loans_mortgages_upload_title');
      case WealthSourceType.saleOfFinancialAssets:
        return localized('wealth_source_sale_of_financial_assets_upload_title');
      case WealthSourceType.salesOfRealEstateOrOtherAssets:
        return localized(
            'wealth_source_sales_of_real_estate_or_other_assets_upload_title');
      case WealthSourceType.inheritance:
        return localized('wealth_source_inheritance_upload_title');
      case WealthSourceType.donations:
        return localized('wealth_source_donations_upload_title');
      case WealthSourceType.cryptoMining:
        return localized('wealth_source_crypto_mining_upload_title');
    }
  }

  String get uploadTips {
    switch (this) {
      case WealthSourceType.salary:
        return localized('wealth_source_salary2_upload_tips');
      case WealthSourceType.selfEmployedIncome:
        return localized('wealth_source_self_employed_income_upload_tips');
      case WealthSourceType.savings:
        return localized('wealth_source_savings_upload_tips');
      case WealthSourceType.allowance:
        return localized('wealth_source_allowance_upload_tips');
      case WealthSourceType.pension:
        return localized('wealth_source_pension2_upload_tips');
      case WealthSourceType.dividendsProfitFromCompany:
        return localized(
            'wealth_source_dividends_profit_from_company_upload_tips');
      case WealthSourceType.daytrading:
        return localized('wealth_source_daytrading_upload_tips');
      case WealthSourceType.gambling:
        return localized('wealth_source_gambling_upload_tips');
      case WealthSourceType.passiveIncome:
        return localized('wealth_source_passive_income_upload_tips');
      case WealthSourceType.loansMortgages:
        return localized('wealth_source_loans_mortgages_upload_tips');
      case WealthSourceType.saleOfFinancialAssets:
        return localized('wealth_source_sale_of_financial_assets_upload_tips');
      case WealthSourceType.salesOfRealEstateOrOtherAssets:
        return localized(
            'wealth_source_sales_of_real_estate_or_other_assets_upload_tips');
      case WealthSourceType.inheritance:
        return localized('wealth_source_inheritance_upload_tips');
      case WealthSourceType.donations:
        return localized('wealth_source_donations_upload_tips');
      case WealthSourceType.cryptoMining:
        return localized('wealth_source_crypto_mining_upload_tips');
    }
  }
}

class GamingWealthSourceSelectorController {
  final Completer<List<WealthSourceType>?> completer = Completer();

  GamingWealthSourceSelectorController({
    List<WealthSourceType> selected = const [],
  }) {
    _selected.value = selected;
  }
  late final _selected = <WealthSourceType>[].obs;
  List<WealthSourceType> get selected => List.from(_selected);

  void toggle(bool selected, WealthSourceType data) {
    if (selected) {
      _selected.value = this.selected..remove(data);
    } else {
      _selected.value = this.selected
        ..add(data)
        ..sort((a, b) => a.sort.compareTo(b.sort));
    }
  }

  void complete([bool back = false]) {
    if (!completer.isCompleted) {
      completer.complete(back ? null : selected);
    }
  }
}

class GamingWealthSourceSelector {
  static Future<List<WealthSourceType>?> show({
    List<WealthSourceType> selected = const [],
  }) {
    final controller = GamingWealthSourceSelectorController(selected: selected);
    GamingSelector.simple<WealthSourceType>(
      title: localized('select_source_wealth'),
      safeAreaBottom: false,
      footerBuilder: _GamingWealthSourceSelectorButtonGroup(
        controller: controller,
      ),
      itemBuilder: (context, e, index) {
        return _GamingWealthSourceSelectorItem(
          data: e,
          controller: controller,
        );
      },
      original: WealthSourceType.values,
      fixedHeight: true,
    ).then((value) {
      controller.complete(true);
    });
    return controller.completer.future;
  }
}

class _GamingWealthSourceSelectorButtonGroup
    extends GamingSelectorFooterContentView {
  final GamingWealthSourceSelectorController controller;
  const _GamingWealthSourceSelectorButtonGroup({
    required this.controller,
  });
  @override
  WidgetBuilder? get builder {
    return (context) {
      return SafeArea(
        top: false,
        bottom: true,
        minimum: EdgeInsets.symmetric(vertical: 16.dp),
        child: Row(
          children: [
            Expanded(
              child: GGButton.minor(
                onPressed: () {
                  Get.back<void>();
                },
                text: localized('cancels'),
              ),
            ),
            Gaps.hGap16,
            Expanded(
              child: Obx(() {
                return GGButton.main(
                  onPressed: () {
                    controller.complete();
                    Get.back<void>();
                  },
                  enable: controller.selected.isNotEmpty,
                  text: localized('confirm_button'),
                );
              }),
            ),
          ],
        ),
      );
    };
  }
}

class _GamingWealthSourceSelectorItem extends StatelessWidget {
  const _GamingWealthSourceSelectorItem({
    required this.data,
    required this.controller,
  });

  final WealthSourceType data;
  final GamingWealthSourceSelectorController controller;

  bool get selected => controller.selected.contains(data);

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onPressed: () => controller.toggle(selected, data),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Container(
          height: 48.dp,
          alignment: Alignment.centerLeft,
          child: Row(
            children: [
              Obx(() {
                return GamingCheckBox(
                  value: selected,
                  onChanged: (value) {
                    controller.toggle(selected, data);
                  },
                  unSelectedColor: GGColors.textSecond.color,
                );
              }),
              Gaps.hGap14,
              Expanded(
                child: Obx(() {
                  return Text(
                    data.text,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: selected
                          ? GGColors.highlightButton.color
                          : GGColors.textMain.color,
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
