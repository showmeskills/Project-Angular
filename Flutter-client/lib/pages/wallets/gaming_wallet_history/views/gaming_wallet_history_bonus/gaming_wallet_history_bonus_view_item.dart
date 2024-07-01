import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_bonus_model.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/history_bottom_sheet/gaming_history_bonus_bottom_sheet.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../../common/widgets/gaming_image/gaming_image.dart';

class GamingWalletHistoryBonusCryptoViewItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const GamingWalletHistoryBonusCryptoViewItem({super.key, required this.data});

  final GamingBonusModel data;

  @override
  Widget build(BuildContext context) {
    return _buildBody();
  }

  Widget _buildBody() {
    return Column(
      children: [
        Gaps.vGap24,
        _buildTitle(),
        Gaps.vGap16,
        _buildRow(localized('act_name'), data.bonusName),
        Gaps.vGap16,
        _buildAmount(),
        Gaps.vGap16,
        _buildRow(
            localized('disb_method'), '${data.grantName}(${data.statusName})'),
        Gaps.vGap16,
        _buildRow(localized('order_number'), data.bonusOrderId),
        Gaps.vGap16,
        Row(
          children: [
            _buildSecondText(data.timeToMM),
            const Spacer(),
            GestureDetector(
              onTap: _onClickDetail,
              child: Image.asset(
                ThemeManager.shareInstacne.imagePath(R.iconGoDetail),
                height: 24.dp,
              ),
            )
          ],
        ),
        Gaps.vGap24,
        divider(),
      ],
    );
  }

  Widget _buildTitle() {
    return Row(
      children: [
        Text(localized('bonus'),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              color: GGColors.textMain.color,
            )),
        const Spacer(),
        _buildStatus(),
      ],
    );
  }

  Widget _buildAmount() {
    return Row(
      children: [
        Text(localized('amount'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            )),
        const Spacer(),
        Text(NumberPrecision(data.amount).balanceText(data.isDigital),
            style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontWeight: GGFontWeigh.bold)),
        Gaps.hGap2,
        Text(GGUtil.parseStr(data.currency),
            style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontWeight: GGFontWeigh.bold)),
        Gaps.hGap8,
        GamingImage.network(
          url: data.iconUrl,
          width: 16.dp,
          height: 16.dp,
        ),
      ],
    );
  }

  Widget _buildStatus() {
    Color curColor = GGColors.success.color;
    if (data.cardStatus == GamingBonusModelStatus.invalid.value) {
      curColor = GGColors.error.color;
    }
    return Container(
      height: 24.dp,
      padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 4.dp),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.dp),
        color: curColor,
      ),
      child: Text(data.statusName,
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.buttonTextWhite.color,
          )),
    );
  }

  /// 分割线
  Widget divider() {
    return Container(
      height: 1.dp,
      color: GGColors.border.color,
    );
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

extension _Action on GamingWalletHistoryBonusCryptoViewItem {
  void _onClickDetail() {
    GamingHistoryBonusBottomSheet.show(data: data);
  }
}
