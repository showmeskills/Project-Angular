import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_quota_model.dart';

import 'fee_widget_builder.dart';

/// 处理手续费逻辑
class FeeService {
  factory FeeService() => _getInstance();

  static FeeService get sharedInstance => _getInstance();

  static FeeService? _instance;

  static FeeService _getInstance() {
    _instance ??= FeeService._internal();
    return _instance!;
  }

  FeeService._internal();

  final isPlanB = true;

  String get wdLimit => localized(isPlanB ? 'wd_require' : 'wd_limit');
  String get confirmClearWithdrawlimit => localized(
      isPlanB ? 'confirm_clear_withdrawreq' : 'confirm_clear_withdrawlimit');
  String get withdrawlimitSuccess =>
      localized(isPlanB ? 'withdrawreq_success' : 'withdrawlimit_success');
  String get withdrawlimitFail =>
      localized(isPlanB ? 'withdrawreq_fail' : 'withdrawlimit_fail');
  String get confirmClearWithdrawlimitTips => localized(isPlanB
      ? 'confirm_clear_withdrawreq_tips'
      : 'confirm_clear_withdrawlimit_tips');

  /// model: 币种对于的提款信息 amountText: 提款金额对应输入框文本
  Widget buildFeeText(GamingCurrencyQuotaModel model, String amountText) {
    return FeeWidgetBuilder(
      currencyQuotaModel: model,
      amountText: amountText,
      isPlanB: isPlanB,
    ).buildFeeText();
  }

  num getFee(GamingCurrencyQuotaModel? model, String amountText) {
    if (model == null) return 0.0;
    if (isPlanB) {
      return FeeWidgetBuilder(
        currencyQuotaModel: model,
        amountText: amountText,
        isPlanB: isPlanB,
      ).getPlanBFee();
    } else {
      return model.paymentHandlingFee ?? 0.0;
    }
  }

  /// 获取最小提款限额 旧方案+手续费 新方案不加手续费
  num minAmountFee(GamingCurrencyQuotaModel? model, num minAmount) {
    if (isPlanB) {
      return minAmount;
    } else {
      return minAmount + (model?.totalHandlingFee ?? 0);
    }
  }
}
