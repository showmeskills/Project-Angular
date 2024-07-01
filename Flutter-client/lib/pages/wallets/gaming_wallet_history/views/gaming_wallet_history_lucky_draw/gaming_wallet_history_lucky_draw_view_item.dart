import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/lucky_spin/models/game_lucky_spin_draw_model.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';
import 'package:gogaming_app/widget_header.dart';

// ignore: must_be_immutable
class GamingWalletHistoryLuckyDrawItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  GamingWalletHistoryLuckyDrawItem({super.key, required this.data});

  final GameLuckySpinDrawModelItem data;
  GamingWalletHistoryLogic get baseController =>
      Get.find<GamingWalletHistoryLogic>();
  GamingOverlay limitOverlay = GamingOverlay();
  @override
  Widget build(BuildContext context) {
    return _buildBody();
  }

  Widget _buildBody() {
    return Column(
      children: [
        Gaps.vGap24,
        _buildTitle(),
        Gaps.vGap10,
        _buildRow(localized('dates'), data.timeToMM),
        Gaps.vGap10,
        _buildOrder(),
        Gaps.vGap10,
        _buildPrizes(),
        Gaps.vGap24,
        divider(),
      ],
    );
  }

  Widget _buildOrder() {
    return Row(
      children: [
        _buildSecondText(localized('order')),
        const Spacer(),
        _buildMainText(GGUtil.parseStr(data.orderId)),
        Gaps.hGap8,
      ],
    );
  }

  Widget _buildPrizes() {
    return Row(
      children: [
        _buildSecondText(localized('prizes')),
        const Spacer(),
        _buildMainText(data.prizeFullName.isNotEmpty
            ? data.prizeFullName
            : data.prizeShortName),
        Gaps.hGap8,
      ],
    );
  }

  /// 分割线
  Widget divider() {
    return Container(
      height: 1.dp,
      color: GGColors.border.color,
    );
  }

  Widget _buildTitle() {
    return Row(
      children: [
        Text(data.activityName,
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              color: GGColors.textMain.color,
            )),
        const Spacer(),
      ],
    );
  }

  Widget _buildMainText(String str) {
    return Text(str,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textMain.color,
        ));
  }

  Widget _buildSecondText(String str) {
    return Text(str,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textSecond.color,
        ));
  }

  Widget _buildRow(String title, dynamic content) {
    return Row(
      children: [
        Text(title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            )),
        const Spacer(),
        Text('$content',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            )),
      ],
    );
  }
}
