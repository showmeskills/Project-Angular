import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../R.dart';
import '../../../common/widgets/gg_button.dart';

class FiatToEBConfirmOrderView extends StatelessWidget {
  const FiatToEBConfirmOrderView(
      {super.key,
      this.amount,
      this.currency,
      this.payMethod,
      this.fee,
      this.address,
      this.onSurePressd});

  final String? amount;
  final String? currency;
  final String? payMethod;
  final String? fee;
  final String? address;
  final VoidCallback? onSurePressd;

  static Future<T?> show<T>({
    String? amount,
    String? currency,
    String? payMethod,
    String? fee,
    String? address,
    VoidCallback? onSurePressd,
  }) {
    return Get.bottomSheet<T>(
        FiatToEBConfirmOrderView(
          amount: amount,
          currency: currency,
          payMethod: payMethod,
          address: address,
          fee: fee,
          onSurePressd: onSurePressd,
        ),
        isScrollControlled: true);
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: GGColors.alertBackground.color,
      borderRadius: BorderRadius.vertical(
        top: Radius.circular(16.dp),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Gaps.vGap24,
          Row(
            children: [
              Gaps.hGap42,
              Expanded(
                child: Container(
                  alignment: Alignment.center,
                  child: Text(
                    localized("confi_ord00"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.bigTitle,
                      color: GGColors.textMain.color,
                      fontWeight: GGFontWeigh.medium,
                    ),
                  ),
                ),
              ),
              InkWell(
                onTap: () {
                  Get.back<void>();
                },
                child: SvgPicture.asset(
                  R.iconClose,
                  width: 18.dp,
                  height: 18.dp,
                  color: GGColors.textSecond.color,
                ),
              ),
              Gaps.hGap24,
            ],
          ),
          Gaps.vGap16,
          _buildWithdrawInfo(),
          Gaps.vGap6,
          _buildTip(),
          Gaps.vGap20,
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.dp),
            child: SizedBox(
              width: double.infinity,
              height: 48.dp,
              child: GGButton(
                onPressed: () {
                  Get.back<dynamic>();
                  onSurePressd?.call();
                },
                text: localized('sure'),
              ),
            ),
          ),
          Gaps.vGap24,
        ],
      ),
    );
  }

  Widget _buildWithdrawInfo() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Container(
        decoration: BoxDecoration(
          color: GGColors.background.color,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Gaps.vGap20,
            Row(
              children: [
                Gaps.hGap14,
                Text(
                  localized("withdraw_method"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                const Spacer(),
                Text(
                  '$payMethod',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
                Gaps.hGap14,
              ],
            ),
            Gaps.vGap24,
            Row(
              children: [
                Gaps.hGap14,
                Text(
                  localized("withdraw_address"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                Expanded(
                  child: Text(
                    '$address',
                    textAlign: TextAlign.right,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  ),
                ),
                Gaps.hGap14,
              ],
            ),
            Gaps.vGap24,
            Row(
              children: [
                Gaps.hGap14,
                Text(
                  localized("total_receive"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                Expanded(
                  child: Text(
                    '${localized("t_t_acc00")} $amount $currency (${localized("fee")}$fee$currency)',
                    textAlign: TextAlign.right,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  ),
                ),
                Gaps.hGap14,
              ],
            ),
            Gaps.vGap20,
          ],
        ),
      ),
    );
  }

  Widget _buildTip() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Container(
        decoration: BoxDecoration(
          color: GGColors.background.color,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          children: [
            Gaps.vGap10,
            Row(
              children: [
                Gaps.hGap10,
                Container(
                  width: 5.dp,
                  height: 5.dp,
                  decoration: BoxDecoration(
                    color: GGColors.textSecond.color,
                    borderRadius: BorderRadius.circular(5.dp),
                  ),
                ),
                Gaps.hGap12,
                Expanded(
                  child: Text(
                    localized("make_netwk_addrs00"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
                Gaps.hGap10,
              ],
            ),
            Gaps.vGap10,
            Row(
              children: [
                Gaps.hGap10,
                Container(
                  width: 5.dp,
                  height: 5.dp,
                  decoration: BoxDecoration(
                    color: GGColors.textSecond.color,
                    borderRadius: BorderRadius.circular(5.dp),
                  ),
                ),
                Gaps.hGap12,
                Expanded(
                  child: Text(
                    localized("make_netwk_addrs01"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
                Gaps.hGap10,
              ],
            ),
            Gaps.vGap10,
          ],
        ),
      ),
    );
  }
}
