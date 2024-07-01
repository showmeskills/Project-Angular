import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/history/history_type.dart';
import 'package:gogaming_app/common/api/history/models/gaming_currency_history_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/widget_header.dart';

import '../currency_deposit_pre_submit_logic_m1.dart';
import '../currency_deposit_pre_submit_logic.dart';
part '_currency_deposit_history_item.dart';

class CurrencyDepositHistoryView extends StatelessWidget
    with BaseSingleRenderViewDelegate {
  const CurrencyDepositHistoryView({super.key});

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
                localized('deposit_fait'),
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
                    'isDigital': false,
                  });
                },
                child: Text(
                  localized('view_all'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    decoration: TextDecoration.underline,
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
                return _CurrencyDepositHistoryItem(data: e);
              }).toList(),
            );
          }),
        ),
      ],
    );
  }

  CurrencyDepositPreSubmitLogic get controller =>
      Get.find<CurrencyDepositPreSubmitLogic>();

  CurrencyDepositPreSubmitState get state => controller.state;

  @override
  SingleRenderViewController get renderController => controller.controller;
}
