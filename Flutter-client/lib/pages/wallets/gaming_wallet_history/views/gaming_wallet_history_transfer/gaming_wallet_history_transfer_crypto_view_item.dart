import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_transfer_history_model.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/history_bottom_sheet/gaming_history_transfer_bottom_sheet.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../../common/widgets/gaming_image/gaming_image.dart';

class GamingWalletHistoryTransferCryptoViewItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const GamingWalletHistoryTransferCryptoViewItem(
      {super.key, required this.data});

  final GamingTransferHistoryItemModel data;

  @override
  Widget build(BuildContext context) {
    return _buildBody();
  }

  Widget _buildBody() {
    return Column(
      children: [
        Gaps.vGap24,
        Row(
          children: [
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
            const Spacer(),
            _buildStatus(),
          ],
        ),
        Gaps.vGap16,
        _buildTransfer(),
        Gaps.vGap10,
        _buildRow(localized('order_number'), data.transactionId),
        Gaps.vGap10,
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

  Widget _buildStatus() {
    Color curColor = GGColors.success.color;
    if (data.status == GamingTransferHistoryItemModelStatus.fail.value) {
      curColor = GGColors.error.color;
    }
    return Container(
      height: 24.dp,
      padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 4.dp),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.dp),
        color: curColor,
      ),
      child: Text(
        data.status == GamingTransferHistoryItemModelStatus.success.value
            ? localized('successful')
            : localized('failed'),
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          color: GGColors.buttonTextWhite.color,
        ),
      ),
    );
  }

  /// 分割线
  Widget divider() {
    return Container(
      height: 1.dp,
      color: GGColors.border.color,
    );
  }

  /// 划转
  Widget _buildTransfer() {
    return Row(
      children: [
        Text('${localized('trans')}:',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            )),
        const Spacer(),
        _buildFromTo(),
      ],
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
        // _buildCopy(data.txid),
      ],
    );
  }
}

extension _Action on GamingWalletHistoryTransferCryptoViewItem {
  void _onClickDetail() {
    GamingHistoryTransferBottomSheet.show(data: data);
  }
}
