import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';

import '../../../../common/api/currency/models/gaming_currency_withdraw_model.dart';
import '../../../../common/lang/locale_lang.dart';
import '../../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../../common/widgets/appbar/appbar.dart';
import '../../../../common/widgets/gaming_close_button.dart';
import '../../../../common/widgets/gg_button.dart';
import '../../../../config/gaps.dart';
import 'fiat_withdraw_to_virtual_result_logic.dart';

class FiatWithdrawToVirtualResultPage
    extends BaseView<FiatWithdrawToVirtualResultLogic> {
  const FiatWithdrawToVirtualResultPage({
    super.key,
    required this.withdrawModel,
    required this.receiptAmount,
  });

  final GamingCurrencyWithdrawToVirtualModel withdrawModel;
  final String receiptAmount;

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      leadingIcon: GamingCloseButton(
        onPressed: submit,
      ),
      title: localized('wd_fiat'),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(FiatWithdrawToVirtualResultLogic());
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildStepArea(),
          Gaps.vGap24,
          _buildOderInfo(),
          Gaps.vGap24,
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.dp),
            child: SizedBox(
              width: double.infinity,
              height: 48.dp,
              child: GGButton(
                onPressed: () => submit(),
                text: localized('sure'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfo(String title, String content) {
    return Row(
      children: [
        Gaps.hGap12,
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        const Spacer(),
        Expanded(
          child: Text(
            content,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        ),
        Gaps.hGap12,
      ],
    );
  }

  Widget _buildOderInfo() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Container(
        decoration: BoxDecoration(
          color: GGColors.popBackground.color,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Gaps.vGap16,
            _buildInfo(
                "${localized("order_number")}:", withdrawModel.orderId ?? ''),
            Gaps.vGap20,
            _buildInfo(
              "${localized("withdraw_amount")}:",
              "${withdrawModel.amount}${withdrawModel.currency}",
            ),
            Gaps.vGap20,
            _buildInfo(
                "${localized("total_receive")}:",
                "${localized("t_t_acc00")} "
                    "$receiptAmount${withdrawModel.withdrawCurrency}"
                    "(${localized("fee")} "
                    "${withdrawModel.coinFee} ${withdrawModel.withdrawCurrency})"),
            Gaps.vGap20,
            _buildInfo(
                "${localized("trans_network")}:", withdrawModel.address ?? ''),
            Gaps.vGap16,
          ],
        ),
      ),
    );
  }

  Widget _buildStepArea() {
    return Stack(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Gaps.vGap24,
            _buildStep(
              '1',
              localized("oder_info"),
              numColor: GGColors.highlightButton.color,
            ),
            Gaps.vGap4,
            _buildStepInfo(
              lineColor: GGColors.highlightButton.color,
            ),
            Gaps.vGap4,
            _buildStep('2', localized("fund_review")),
            Gaps.vGap4,
            _buildStepInfo(content: localized("check_account")),
            Gaps.vGap4,
            _buildStep('3', localized("fund_approval")),
            Gaps.vGap4,
            _buildStepInfo(content: localized("wait_block_trans")),
            Gaps.vGap4,
            _buildStep('4', localized("block_complete")),
            Gaps.vGap4,
            _buildStepInfo(
              content: localized("fund_arr"),
              lineColor: Colors.transparent,
            ),
          ],
        ),
        Positioned(
          bottom: 0.dp,
          right: 16.dp,
          child: Image.asset(
            R.currencyWithdrawGuide,
            width: 112.dp,
            height: 112.dp,
          ),
        )
      ],
    );
  }

  Widget _buildStepInfo({String? content, Color? lineColor}) {
    return IntrinsicHeight(
      child: Row(
        children: [
          Gaps.hGap10,
          Container(
            color: lineColor ?? GGColors.border.color,
            width: 4.dp,
          ),
          Gaps.hGap20,
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Visibility(
                visible: content?.isNotEmpty ?? false,
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: Get.width - 70.dp),
                  child: Text(
                    content ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.hint,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
              ),
              Gaps.vGap16,
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStep(String num, String title, {Color? numColor}) {
    return Row(
      children: [
        Container(
          width: 24.dp,
          height: 24.dp,
          decoration: BoxDecoration(
            color: numColor ?? GGColors.border.color,
            borderRadius: BorderRadius.circular(12.dp),
          ),
          child: Center(
            child: Text(
              num,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
          ),
        ),
        Gaps.hGap12,
        Expanded(
          child: Text(
            title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
              fontWeight: GGFontWeigh.bold,
            ),
          ),
        )
      ],
    );
  }
}

extension _Action on FiatWithdrawToVirtualResultPage {
  void submit() {
    controller.close();
  }
}
