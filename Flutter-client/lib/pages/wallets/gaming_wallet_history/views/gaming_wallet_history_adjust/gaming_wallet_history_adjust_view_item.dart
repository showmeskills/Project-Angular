// ignore_for_file: unused_element

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_history_adjust.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/history_bottom_sheet/gaming_history_adjust_bottom_sheet.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../../common/widgets/gaming_image/gaming_image.dart';

class GamingWalletHistoryAdjustViewItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const GamingWalletHistoryAdjustViewItem({super.key, required this.data});

  final GamingHistoryAdjust data;

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
        _buildRow(
            localized('account'),
            data.walletType == 'Main'
                ? localized('main')
                : FeeService().wdLimit),
        Gaps.vGap16,
        _buildAmount(),
        Gaps.vGap16,
        _buildRow(localized('order_number'), data.orderNum),
        Gaps.vGap16,
        _buildRow(localized('remark'), data.remark),
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
        Text(localized('trans_acc'),
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
        Text(localized('re_quan'),
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
    String str = localized('add');
    if (data.amount < 0) {
      curColor = GGColors.error.color;
      str = localized('deductions');
    }
    return Container(
      height: 24.dp,
      padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 4.dp),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.dp),
        color: curColor,
      ),
      child: Text(str,
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

extension _Action on GamingWalletHistoryAdjustViewItem {
  void _onClickDetail() {
    GamingHistoryAdjustBottomSheet.show(data: data);
  }
}
