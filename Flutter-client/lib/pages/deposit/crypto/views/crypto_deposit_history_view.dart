import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/history_type.dart';
import 'package:gogaming_app/common/api/history/models/gaming_crypto_history_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

import '../crypto_deposit_logic.dart';

part '_crypto_deposit_history_item.dart';
part '_result_view.dart';

class CryptoDepositHistoryView extends StatelessWidget
    with BaseSingleRenderViewDelegate {
  const CryptoDepositHistoryView({super.key});

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
      margin: EdgeInsets.only(top: 30.dp),
      child: super.getLoadingWidget(context),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Gaps.vGap30,
        Row(
          children: [
            Expanded(
              child: Text(
                localized('recent_coin'),
                style: GGTextStyle(
                  fontSize: GGFontSize.bigTitle20,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.medium,
                ),
              ),
            ),
            Gaps.hGap8,
            Obx(() {
              if (state.data.total == 0) {
                return Gaps.empty;
              }
              return ScaleTap(
                opacityMinValue: 0.8,
                scaleMinValue: 0.98,
                onPressed: () {
                  Get.toNamed<dynamic>(Routes.walletHistory.route, arguments: {
                    'historyTypeValue': HistoryType.deposit.value,
                    'isDigital': true,
                  });
                },
                child: Text(
                  localized('view_all'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.highlightButton.color,
                  ),
                ),
              );
            }),
          ],
        ),
        SingleRenderView(
          controller: controller,
          delegate: this,
          child: Obx(() {
            return Column(
              children: state.data.list.map((e) {
                return _CryptoDepositHistoryItem(data: e);
              }).toList(),
            );
          }),
        ),
      ],
    );
  }

  CryptoDepositLogic get controller => Get.find<CryptoDepositLogic>();

  CryptoDepositState get state => controller.state;

  @override
  SingleRenderViewController get renderController => controller.controller;
}
