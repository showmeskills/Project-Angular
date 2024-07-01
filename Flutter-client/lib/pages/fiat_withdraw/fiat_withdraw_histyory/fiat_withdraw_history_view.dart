import 'package:flutter/material.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/history/history_type.dart';
import 'fiat_withdraw_history_item_view.dart';
import 'fiat_withdraw_history_logic.dart';
import 'fiat_withdraw_history_state.dart';

class FiatWithdrawHistyoryView extends StatelessWidget
    with BaseSingleRenderViewDelegate {
  const FiatWithdrawHistyoryView({super.key});

  FiatWithdrawHistoryLogic get logic => Get.find<FiatWithdrawHistoryLogic>();
  FiatWithdrawHistoryState get state =>
      Get.find<FiatWithdrawHistoryLogic>().state;

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
    Get.put(FiatWithdrawHistoryLogic());
    return Column(
      children: [
        Gaps.vGap30,
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
              if (state.data.value.total == 0) {
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
                  ),
                ),
              );
            }),
          ],
        ),
        SingleRenderView(
          controller: logic,
          delegate: this,
          child: Obx(() {
            return Column(
              children: state.data.value.list.map((e) {
                return FiatWithdrawHistoryItemView(data: e);
              }).toList(),
            );
          }),
        ),
        Gaps.vGap20,
      ],
    );
  }

  @override
  SingleRenderViewController get renderController => logic.controller;
}
