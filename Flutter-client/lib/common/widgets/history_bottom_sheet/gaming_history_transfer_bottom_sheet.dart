// ignore_for_file: unused_element

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_transfer_history_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingHistoryTransferBottomSheet {
  static Future<void> show({
    required GamingTransferHistoryItemModel data,
  }) {
    return GamingBottomSheet.show<DateTime>(
      title: localized('trans_details'),
      fixedHeight: false,
      builder: (context) {
        return _GamingHistoryTransferBottomSheetItem(
          data: data,
        );
      },
    );
  }
}

class _GamingHistoryTransferBottomSheetItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const _GamingHistoryTransferBottomSheetItem({
    required this.data,
  });

  final GamingTransferHistoryItemModel data;

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
          _buildRow(localized('order_number'), data.transactionId),
          Gaps.vGap18,
          Row(
            children: [
              _buildSecondText(localized('trans')),
              const Spacer(),
              _buildFromTo(),
            ],
          ),
          Gaps.vGap18,
          _buildRow(localized('curr'), data.currency),
          Gaps.vGap18,
          _buildRow(localized('trans_quantity'), data.amount),
          Gaps.vGap18,
          _buildRow(
              localized('status'),
              data.status == GamingTransferHistoryItemModelStatus.fail.value
                  ? localized('no_succ_tran00')
                  : localized('succ_tran00')),
        ],
      ),
    );
  }

  Widget _buildFromTo() {
    return Row(
      children: [
        _buildSecondText(localized('from')),
        Gaps.hGap4,
        _buildMainText(data.fromWallet),
        Gaps.hGap4,
        _buildSecondText(localized('to')),
        Gaps.hGap4,
        _buildMainText(data.toWallet),
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

  Widget _buildCopy(String str) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => copyToClipboard(str),
      child: SvgPicture.asset(
        R.iconCopy,
        width: 10.dp,
        height: 12.dp,
        color: GGColors.textMain.color,
      ),
    );
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
