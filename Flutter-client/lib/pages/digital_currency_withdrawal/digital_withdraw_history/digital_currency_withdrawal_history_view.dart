import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/history_type.dart';
import 'package:gogaming_app/common/api/history/models/gaming_crypto_history_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/tools/gaming_text.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/history_bottom_sheet/gaming_history_withdraw_crypto_bottom_sheet.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/pages/digital_currency_withdrawal/digital_currency_withdrawal_logic.dart';
import 'package:gogaming_app/widget_header.dart';

part 'withdrawal_history_item.dart';

class DigitalCurrencyWithdrawalHistoryView extends StatelessWidget
    with BaseSingleRenderViewDelegate {
  const DigitalCurrencyWithdrawalHistoryView({super.key});

  @override
  Widget getEmptyWidget(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 88.dp, bottom: 40.dp),
      child: super.getEmptyWidget(context),
    );
  }

  @override
  Widget getLoadingWidget(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 24.dp),
      child: super.getLoadingWidget(context),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Gaps.vGap24,
        Row(
          children: [
            Expanded(
              child: Text(
                localized('recent_wd'),
                style: GGTextStyle(
                  fontSize: GGFontSize.bigTitle20,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.medium,
                ),
              ),
            ),
            Gaps.hGap8,
            Obx(() {
              if (state.data.total <= 4) {
                return Gaps.empty;
              }
              return GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: () {
                  Get.toNamed<dynamic>(Routes.walletHistory.route, arguments: {
                    'historyTypeValue': HistoryType.withdraw.value,
                    'isDigital': false,
                  });
                },
                child: Text(
                  localized('view_all'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.highlightButton.color,
                    decoration: TextDecoration.underline,
                  ),
                ),
              );
            }),
          ],
        ),
        Gaps.vGap16,
        SingleRenderView(
          controller: controller,
          delegate: this,
          child: Obx(() {
            return Column(
              children: state.data.list.map((e) {
                return WithdrawalHistoryItem(data: e);
              }).toList(),
            );
          }),
        ),
      ],
    );
  }

  DigitalCurrencyWithdrawalLogic get controller =>
      Get.find<DigitalCurrencyWithdrawalLogic>();

  DigitalCurrencyWithdrawalState get state => controller.state;

  @override
  SingleRenderViewController get renderController => controller.controller;
}
