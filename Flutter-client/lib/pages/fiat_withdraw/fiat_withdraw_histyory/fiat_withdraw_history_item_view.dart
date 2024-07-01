import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/wallets/gaming_wallet_history/views/gaming_wallet_history_withdraw/bottom_sheet/gaming_withdraw_currency_pop_detail_view.dart';

import '../../../../common/api/history/models/gaming_currency_history_model.dart';
import '../../../../common/lang/locale_lang.dart';
import '../../../../common/theme/colors/go_gaming_colors.dart';
import '../../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../../config/gaps.dart';
import '../../../R.dart';
import '../../../common/widgets/gaming_popup.dart';

class FiatWithdrawHistoryItemView extends StatelessWidget {
  const FiatWithdrawHistoryItemView({super.key, required this.data});

  final GamingCurrencyHistoryModel data;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: _showSuccessful,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap20,
          Row(
            children: [
              Text(
                localized('order_number'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
              Gaps.hGap4,
              Expanded(
                child: Text(
                  '${data.orderNum}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                    fontFamily: GGFontFamily.dingPro,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ),
              Gaps.hGap4,
              Text(
                '${data.amount.stripTrailingZeros()} ${data.currency}',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                  fontFamily: GGFontFamily.dingPro,
                ),
              ),
            ],
          ),
          Gaps.vGap10,
          Row(
            children: [
              Expanded(
                child: Text(
                  DateFormat('yyyy-MM-dd HH:mm').formatTimestamp(data.date),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
              Text(
                data.statusName,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                  fontFamily: GGFontFamily.dingPro,
                ),
              ),
              ..._tip(),
            ],
          ),
        ],
      ),
    );
  }

  List<Widget> _tip() {
    if (data.status == 'Canceled') {
      return [
        Gaps.vGap2,
        GamingPopupLinkWidget(
          followerAnchor: Alignment.centerRight,
          targetAnchor: Alignment.topCenter,
          popup: _buildTip(),
          offset: Offset(0, 7.dp),
          triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
          child: Container(
            padding: EdgeInsets.only(left: 12.dp),
            child: SvgPicture.asset(
              R.iconTipIcon,
              width: 14.dp,
              height: 14.dp,
            ),
          ),
        ),
      ];
    }
    return <Widget>[];
  }

  String _failContent() {
    if (data.failReason == 1) {
      return localized('user_cancel');
    } else if (data.failReason == 2) {
      return localized('withdraw_fail');
    }
    return localized("other_reason");
  }

  Widget _buildTip() {
    return Text(
      _failContent(),
      style: GGTextStyle(
        color: GGColors.textBlackOpposite.color,
        fontSize: GGFontSize.content,
      ),
    );
  }
}

extension _Action on FiatWithdrawHistoryItemView {
  void _showSuccessful() {
    GamingBottomSheet.show<DateTime>(
      title: localized('wd_details'),
      fixedHeight: false,
      builder: (context) {
        return GamingWithdrawCurrencyPopDetailView(
          data: data,
        );
      },
    );
  }
}
