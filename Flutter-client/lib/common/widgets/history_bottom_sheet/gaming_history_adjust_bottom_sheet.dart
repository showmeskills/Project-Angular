import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/history/models/gaming_history_adjust.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingHistoryAdjustBottomSheet {
  static Future<void> show({
    required GamingHistoryAdjust data,
  }) {
    return GamingBottomSheet.show<DateTime>(
      title: localized('tran_detail'),
      fixedHeight: false,
      builder: (context) {
        return _GamingHistoryAdjustBottomSheetItem(
          data: data,
        );
      },
    );
  }
}

class _GamingHistoryAdjustBottomSheetItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const _GamingHistoryAdjustBottomSheetItem({
    required this.data,
  });

  final GamingHistoryAdjust data;

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
          _buildRow(localized('order_number'), data.orderNum),
          Gaps.vGap18,
          _buildRow(
              localized('account'),
              data.walletType == 'Main'
                  ? localized('main')
                  : FeeService().wdLimit),
          Gaps.vGap18,
          _buildRow(localized('curr'), data.currency),
          Gaps.vGap18,
          _buildRow(localized('amount'),
              data.amount > 0 ? '+${data.amount}' : data.amount),
          Gaps.vGap18,
          _buildRow(localized('status'),
              data.amount > 0 ? localized('add') : localized('deductions')),
          Gaps.vGap18,
          _buildRow(localized('remark'), ''),
          Gaps.vGap8,
          _buildRemark(),
        ],
      ),
    );
  }

  Widget _buildRemark() {
    return Container(
      height: 80.dp,
      width: double.infinity,
      padding: EdgeInsets.only(left: 10.dp, right: 10.dp, top: 8.dp),
      decoration: BoxDecoration(
        color: GGColors.border.color.withOpacity(0.58),
        borderRadius: BorderRadius.all(Radius.circular(10.0.dp)),
      ),
      child: _buildMainText(data.remark),
    );
  }

  Widget _buildMainText(String str) {
    return Text(str,
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textMain.color,
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
