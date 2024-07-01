import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_quota_model.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/config/gaps.dart';

class FeeWidgetBuilder {
  final bool isPlanB;
  final GamingCurrencyQuotaModel currencyQuotaModel;
  final String amountText;

  FeeWidgetBuilder({
    required this.isPlanB,
    required this.currencyQuotaModel,
    required this.amountText,
  });

  int getPlanBFee() {
    if (currencyQuotaModel.isPlanBFreeWithdrawalFee) return 0;
    // 输入提款金额时：手续费XX CNY;
    final amountValue = double.tryParse(amountText) ?? 0.0;

    var fee = (amountValue *
            (currencyQuotaModel.withdrawalFeeProportion ?? 0.0) /
            100)
        .ceil();
    final fiatUSDTRate =
        CurrencyService.sharedInstance.getUSDTRate(currencyQuotaModel.currency);
    final feeLimit = currencyQuotaModel.perFeeLimit ?? 0;
    final currencyFeeLimit = (feeLimit * (1 / fiatUSDTRate)).ceil();
    // 超过单笔上限手续费时：仅显示上限金额
    if (currencyFeeLimit < fee) {
      fee = currencyFeeLimit;
    }
    return fee;
  }

  /// model: 币种对于的提款信息 amountText: 提款金额对应输入框文本
  Widget buildFeeText() {
    return isPlanB
        ? _buildFeeTextPlanB(currencyQuotaModel, amountText)
        : _buildFeeTextPlanA(currencyQuotaModel);
  }

  Widget _buildFeeTextPlanA(GamingCurrencyQuotaModel currencyQuotaModel) {
    /// 手续费为 0 则不展示手续费一栏
    if ((currencyQuotaModel.paymentHandlingFee ?? 0.0) == 0) {
      return Gaps.empty;
    }
    String content = '${localized("network__fee")} '
        '${(currencyQuotaModel.paymentHandlingFee ?? 0.0)}';
    if ((currencyQuotaModel.paymentHandlingFee ?? 0.0) > 0) {
      content += ' ${localized("keep_invest")}'
          ' ${(currencyQuotaModel.paymentHandlingFee ?? 0.0) * 100.0}'
          ' ${localized("ava_reduce_fee")}';
    }
    return Text(
      content,
      style: GGTextStyle(
        color: GGColors.textSecond.color,
        fontSize: GGFontSize.hint,
      ),
    );
  }

  Widget _buildFeeTextPlanB(
      GamingCurrencyQuotaModel currencyQuotaModel, String amountText) {
    /// 是否免手续费
    bool isFreeWithdrawalFee = currencyQuotaModel.isPlanBFreeWithdrawalFee;

    // 手续费为 0 则不展示手续费一栏
    if (isFreeWithdrawalFee) {
      return Gaps.empty;
    }

    String content = '';
    if (amountText.isEmpty) {
      // 未输入提款金额时：手续费X% ，请输入提款金额
      content =
          '${localized("network__fee")} ${(currencyQuotaModel.withdrawalFeeProportion ?? 0.0)}%';
    } else {
      // 输入提款金额时：手续费XX CNY
      content =
          '${localized("network__fee")} ${getPlanBFee()} ${currencyQuotaModel.currency}';
    }

    return Text(
      content,
      style: GGTextStyle(
        color: GGColors.textSecond.color,
        fontSize: GGFontSize.hint,
      ),
    );
  }
}
