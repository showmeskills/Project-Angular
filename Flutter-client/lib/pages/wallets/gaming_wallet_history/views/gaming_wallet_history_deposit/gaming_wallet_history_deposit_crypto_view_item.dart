import 'package:extended_text/extended_text.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_crypto_history_model.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/history_bottom_sheet/gaming_history_deposit_crypto_bottom_sheet.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../../common/widgets/gaming_image/gaming_image.dart';

class GamingWalletHistoryDepositCryptoViewItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const GamingWalletHistoryDepositCryptoViewItem(
      {super.key, required this.data});

  final GamingCryptoHistoryModel data;

  @override
  Widget build(BuildContext context) {
    return _buildBody();
  }

  Widget _buildBody() {
    return Column(
      children: [
        Gaps.vGap24,
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Text(
                    NumberPrecision(GGUtil.parseStr(data.amount))
                        .balanceText(data.isDigital),
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
                )
              ],
            ),
            _buildStatus(),
            Row(
              children: [
                Text(localized('trans_network'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    )),
                Gaps.hGap10,
                Text(data.network,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    )),
              ],
            ),
          ],
        ),
        Gaps.vGap16,
        _buildCopyRow(localized('address'), data.address),
        Gaps.vGap10,
        Visibility(
            visible: data.txid.isNotEmpty,
            child: _buildCopyRow(localized('tx_ad'), data.txid)),
        Visibility(visible: data.txid.isNotEmpty, child: Gaps.vGap10),
        Row(
          children: [
            Text(data.timeToMM,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                )),
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

    if (data.status == GamingCryptoHistoryModelStatus.fail.value ||
        data.status == GamingCryptoHistoryModelStatus.timeout.value ||
        data.status == GamingCryptoHistoryModelStatus.notPassed.value) {
      curColor = GGColors.error.color;
    } else if (data.status == GamingCryptoHistoryModelStatus.cancel.value) {
      curColor = GGColors.similarSecond.color;
    } else if (data.status == GamingCryptoHistoryModelStatus.process.value ||
        data.status == GamingCryptoHistoryModelStatus.waiting.value ||
        data.status == GamingCryptoHistoryModelStatus.review.value ||
        data.status == GamingCryptoHistoryModelStatus.created.value ||
        data.status == GamingCryptoHistoryModelStatus.cancel.value ||
        data.status == GamingCryptoHistoryModelStatus.canceled.value) {
      curColor = GGColors.process.color;
    }

    return Container(
      height: 17.dp,
      padding: EdgeInsets.symmetric(horizontal: 8.dp),
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

  Widget _buildCopy(String str) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => copyToClipboard(str),
      child: SvgPicture.asset(
        R.iconCopy,
        width: 10.dp,
        height: 12.dp,
        color: GGColors.textSecond.color,
      ),
    );
  }

  Widget _buildAddress(String address) {
    final subTitleStyle = GGTextStyle(
      fontSize: GGFontSize.content,
      color: GGColors.textMain.color,
    );
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: 120.dp),
      child: ExtendedText(
        address,
        maxLines: 1,
        style: subTitleStyle,
        overflowWidget: TextOverflowWidget(
          position: TextOverflowPosition.middle,
          child: Text('...', style: subTitleStyle),
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

  Widget _buildCopyRow(String title, String value) {
    return Row(
      children: [
        Text(title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            )),
        const Spacer(),
        _buildAddress(value),
        Gaps.hGap12,
        _buildCopy(value),
      ],
    );
  }
}

extension _Action on GamingWalletHistoryDepositCryptoViewItem {
  void _onClickDetail() {
    GamingHistoryDepositCryptoBottomSheet.show(data: data);
  }
}
