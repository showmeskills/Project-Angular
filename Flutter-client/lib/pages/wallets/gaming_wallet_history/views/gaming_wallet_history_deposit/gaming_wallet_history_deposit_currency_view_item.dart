import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_currency_history_model.dart';
import 'package:gogaming_app/common/components/number_precision/number_precision.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/history_bottom_sheet/gaming_history_deposit_currency_bottom_sheet.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingWalletHistoryDepositCurrencyViewItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const GamingWalletHistoryDepositCurrencyViewItem(
      {super.key, required this.data});

  final GamingCurrencyHistoryModel data;

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
        _buildRow(localized('pay_method'), data.paymentMethod),
        Gaps.vGap10,
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
        Gaps.vGap10,
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

    if (data.status == GamingCurrencyHistoryModelStatus.fail.value ||
        data.status == GamingCurrencyHistoryModelStatus.timeout.value ||
        data.status == GamingCurrencyHistoryModelStatus.notPassed.value) {
      curColor = GGColors.error.color;
    } else if (data.status == GamingCurrencyHistoryModelStatus.cancel.value) {
      curColor = GGColors.similarSecond.color;
    } else if (data.status == GamingCurrencyHistoryModelStatus.process.value ||
        data.status == GamingCurrencyHistoryModelStatus.waiting.value ||
        data.status == GamingCurrencyHistoryModelStatus.review.value ||
        data.status == GamingCurrencyHistoryModelStatus.created.value ||
        data.status == GamingCurrencyHistoryModelStatus.cancel.value ||
        data.status == GamingCurrencyHistoryModelStatus.canceled.value ||
        data.status == GamingCurrencyHistoryModelStatus.userCanceled.value ||
        data.status == GamingCurrencyHistoryModelStatus.sysCanceled.value) {
      curColor = GGColors.process.color;
    }

    return Container(
      height: 24.dp,
      padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 4.dp),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(4.dp),
        color: curColor,
      ),
      child: Text(
        data.statusName,
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

extension _Action on GamingWalletHistoryDepositCurrencyViewItem {
  void _onClickDetail() {
    GamingHistoryDepositCurrencyBottomSheet.show(data: data);
  }
}
