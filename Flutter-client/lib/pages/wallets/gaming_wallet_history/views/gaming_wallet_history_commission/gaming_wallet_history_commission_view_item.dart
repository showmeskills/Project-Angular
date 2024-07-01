import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_commission_model.dart';
import 'package:gogaming_app/common/api/history/models/gaming_commission_type.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/gaming_wallet_history_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../../common/widgets/gaming_image/gaming_image.dart';

// ignore: must_be_immutable
class GamingWalletHistoryCommissionViewItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  GamingWalletHistoryCommissionViewItem({super.key, required this.data});

  final GamingCommissionModel data;
  GamingWalletHistoryLogic get baseController =>
      Get.find<GamingWalletHistoryLogic>();
  GamingOverlay limitOverlay = GamingOverlay();
  @override
  Widget build(BuildContext context) {
    return _buildBody();
  }

  String getTypeName(String str) {
    for (int i = 0; i < baseController.state.allCommissionType.length; i++) {
      CommissionType type = baseController.state.allCommissionType[i];
      if (type.code == str) {
        return type.description;
      }
    }
    return '';
  }

  Widget _buildBody() {
    return Column(
      children: [
        Gaps.vGap24,
        Row(
          children: [
            Text(getTypeName(data.returnType),
                style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                    fontWeight: GGFontWeigh.bold)),
            const Spacer(),
          ],
        ),
        Gaps.vGap10,
        _buildRow(localized('dates'), data.timeToMM),
        Gaps.vGap10,
        _buildNum(),
        Gaps.vGap24,
        divider(),
      ],
    );
  }

  Widget _buildNum() {
    return Row(
      children: [
        _buildSecondText(localized('number')),
        const Spacer(),
        _buildMainText(NumberPrecision(data.amount).balanceText(true)),
        Gaps.hGap8,
        GamingImage.network(
          url: data.iconUrl,
          width: 16.dp,
          height: 16.dp,
        ),
        Gaps.hGap8,
        GamingPopupLinkWidget(
          overlay: limitOverlay,
          followerAnchor: Alignment.bottomRight,
          targetAnchor: Alignment.topLeft,
          popup: _buildTip(),
          offset: Offset(10.dp, 0.dp),
          triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
          child: SvgPicture.asset(
            R.iconTipIcon,
            width: 15.dp,
            height: 15.dp,
            color: GGColors.textSecond.color,
          ),
        ),
      ],
    );
  }

  Widget _buildTipRow(String title, dynamic content) {
    return Column(
      children: [
        Gaps.vGap10,
        Row(
          children: [
            Text(title,
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textBlackOpposite.color,
                )),
            Gaps.hGap18,
            const Spacer(),
            Text('$content',
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textBlackOpposite.color,
                )),
          ],
        ),
      ],
    );
  }

  Widget _buildTipTitle() {
    return Row(
      children: [
        Text(localized('amount_details'),
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textBlackOpposite.color,
            )),
        const Spacer(),
      ],
    );
  }

  Widget _buildTip() {
    List<Widget> list = [];
    list.add(_buildTipTitle());

    data.multipleCurrency.forEach((key, value) {
      list.add(_buildTipRow(key, NumberPrecision(value).balanceText(true)));
    });

    return Column(
      children: list,
    );
  }

  /// 分割线
  Widget divider() {
    return Container(
      height: 1.dp,
      color: GGColors.border.color,
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
