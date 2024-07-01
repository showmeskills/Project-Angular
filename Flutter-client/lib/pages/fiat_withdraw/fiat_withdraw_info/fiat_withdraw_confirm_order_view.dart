import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../R.dart';
import '../../../common/widgets/gg_button.dart';

class FiatWithdrawConfirmOrderView extends StatelessWidget {
  const FiatWithdrawConfirmOrderView(
      {super.key,
      this.amount,
      this.currency,
      this.bankName,
      this.bankCardNum,
      this.onSurePressd});

  final String? amount;
  final String? currency;
  final String? bankName;
  final String? bankCardNum;
  final VoidCallback? onSurePressd;

  static Future<T?> show<T>({
    String? amount,
    String? currency,
    String? bankName,
    String? bankCardNum,
    VoidCallback? onSurePressd,
  }) {
    return Get.bottomSheet<T>(
      FiatWithdrawConfirmOrderView(
        amount: amount,
        currency: currency,
        bankName: bankName,
        bankCardNum: bankCardNum,
        onSurePressd: onSurePressd,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: GGColors.alertBackground.color,
      borderRadius: BorderRadius.vertical(
        top: Radius.circular(16.dp),
      ),
      child: Column(
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
                      fontSize: GGFontSize.content,
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
          Gaps.vGap20,
          Text(
            localized("will_receive"),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.vGap8,
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                amount ?? '',
                style: GGTextStyle(
                  fontSize: GGFontSize.superBigTitle28,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.medium,
                ),
              ),
              Gaps.hGap8,
              Text(
                currency ?? '',
                style: GGTextStyle(
                  fontSize: GGFontSize.bigTitle,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
          Gaps.vGap16,
          _buildBankInfo(),
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
        ],
      ),
    );
  }

  Widget _buildBankInfo() {
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
                  '${localized("bn")}:',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                const Spacer(),
                Text(
                  bankName ?? '',
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
                  '${localized("bc_num")}:',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                const Spacer(),
                Text(
                  bankCardNum ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
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
                    localized("fullname_notice"),
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
                    localized("bank_card_tip00"),
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
