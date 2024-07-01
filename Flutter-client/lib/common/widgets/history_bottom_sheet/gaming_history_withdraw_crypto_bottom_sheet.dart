import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_crypto_history_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingHistoryWithdrawCryptoBottomSheet {
  static Future<void> show({
    required GamingCryptoHistoryModel data,
  }) {
    return GamingBottomSheet.show<DateTime>(
      title: localized('wd_details'),
      fixedHeight: false,
      builder: (context) {
        return _GamingHistoryWithdrawCryptoBottomSheetItem(
          data: data,
        );
      },
    );
  }
}

class _GamingHistoryWithdrawCryptoBottomSheetItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const _GamingHistoryWithdrawCryptoBottomSheetItem({
    required this.data,
  });

  final GamingCryptoHistoryModel data;

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
          _buildRow(localized('type'), localized('withdrawl')),
          Gaps.vGap18,
          _buildRow(localized('curr'), data.currency),
          Gaps.vGap18,
          _buildRow(localized('number'), data.amount),
          Gaps.vGap18,
          _buildCopyRowDetail(localized('address'), data.address),
          Gaps.vGap18,
          Visibility(
            visible: data.txid.isNotEmpty,
            child: _buildCopyRowDetail(localized('tx_ad'), data.txid),
          ),
          Gaps.vGap18,
          _buildRow(localized('status'), data.statusName),
        ],
      ),
    );
  }

  Widget _buildCopyRowDetail(String title, String value) {
    return Row(
      children: [
        Text(title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            )),
        const Spacer(),
        Container(
          constraints: BoxConstraints(maxWidth: 200.dp),
          child: RichText(
            text: TextSpan(children: [
              TextSpan(
                text: value,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
                // textAlign
              ),
              WidgetSpan(
                child: Gaps.hGap4,
              ),
              WidgetSpan(
                //对齐方式
                alignment: PlaceholderAlignment.middle,
                child: _buildCopy(value),
              ),
            ]),
            textAlign: TextAlign.end,
            maxLines: 3,
          ),
        )
      ],
    );
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
