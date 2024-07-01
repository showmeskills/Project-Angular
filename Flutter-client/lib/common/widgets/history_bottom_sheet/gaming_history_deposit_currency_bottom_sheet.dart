import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_currency_history_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingHistoryDepositCurrencyBottomSheet {
  static Future<void> show({
    required GamingCurrencyHistoryModel data,
  }) {
    return GamingBottomSheet.show<DateTime>(
      title: localized('dep_det'),
      fixedHeight: false,
      builder: (context) {
        return _GamingHistoryDepositBottomSheetItem(
          data: data,
        );
      },
    );
  }
}

class _GamingHistoryDepositBottomSheetItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const _GamingHistoryDepositBottomSheetItem({
    required this.data,
  });

  final GamingCurrencyHistoryModel data;

  @override
  Widget build(BuildContext context) {
    return _buildDetail();
  }

  Widget _buildDetail() {
    return Container(
      padding: EdgeInsets.only(
          bottom: 20.dp + Util.iphoneXBottom, left: 16.dp, right: 16.dp),
      child: Column(
        children: [
          _buildRow(localized('dates'), data.timeToSS),
          Gaps.vGap18,
          GestureDetectorHitTestWithoutSizeLimit(
            extraHitTestArea: EdgeInsets.all(10.dp),
            onTap: () => copyToClipboard(data.orderNum ?? ''),
            child: _buildRow(
              localized('order_number'),
              data.orderNum,
              icon: SvgPicture.asset(
                R.iconCopy,
                width: 14.dp,
                height: 14.dp,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
          Gaps.vGap18,
          _buildRow(localized('type'), localized('deposit')),
          Gaps.vGap18,
          _buildRow(localized('curr'), data.currency),
          Gaps.vGap18,
          _buildRow(localized('number'), data.amount),
          Gaps.vGap18,
          _buildRow(localized('pay_method'), data.paymentMethod),
          Gaps.vGap18,
          _buildRow(localized('status'), data.statusName),
          Gaps.vGap18,
          _buildRow(localized('voucher'), localized(data.voucherText)),
        ],
      ),
    );
  }

  Widget _buildRow(String title, dynamic content, {Widget? icon}) {
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
        if (icon != null)
          Container(
            margin: EdgeInsets.only(left: 4.dp),
            child: icon,
          ),
      ],
    );
  }
}
