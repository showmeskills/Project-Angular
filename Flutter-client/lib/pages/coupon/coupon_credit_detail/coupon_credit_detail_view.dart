import 'package:base_framework/base_controller.dart';
import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/config/gaps.dart';

import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import '../../../common/delegate/base_refresh_view_delegate.dart';
import '../../../common/service/currency/currency_service.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/widgets/gaming_image/gaming_image.dart';
import 'coupon_credit_detail_logic.dart';

class CouponCreditDetailPage extends StatelessWidget
    with BaseRefreshViewDelegate {
  CouponCreditDetailPage({super.key, required this.id});

  final logic = Get.put(CouponCreditDetailLogic());
  final state = Get.find<CouponCreditDetailLogic>().state;

  late final int id;

  @override
  Color get footerColor => Colors.transparent;

  @override
  Widget build(BuildContext context) {
    logic.bonusId = id;
    return Obx(() {
      return RefreshView(
        controller: logic,
        delegate: this,
        child: ListView.separated(
          itemCount: state.data.value.list.length,
          itemBuilder: (context, index) {
            return _buildItem(state.data.value.list[index]);
          },
          separatorBuilder: (BuildContext context, int index) => Gaps.vGap20,
        ),
      );
    });
  }

  Widget _buildItem(GamingCouponCreditDetailModel model) {
    final currencyModel =
        CurrencyService()[model.currency?.toUpperCase() ?? ''];
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 24.dp),
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: GGColors.border.color,
            width: 1.dp,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Gaps.vGap10,
            Row(
              children: [
                Gaps.hGap10,
                Text(
                  localized("transaction_num"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                const Spacer(),
                Expanded(
                  child: Text(
                    model.wagerNum ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  ),
                ),
                Gaps.hGap10,
              ],
            ),
            Gaps.vGap18,
            Row(
              children: [
                Gaps.hGap10,
                Text(
                  localized("amount_transaction"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                const Spacer(),
                Text(
                  (model.amount ?? 0.0).stripTrailingZeros(),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
                Gaps.hGap8,
                SizedBox(
                  width: 20.dp,
                  height: 20.dp,
                  child: GamingImage.network(
                    url: currencyModel?.iconUrl ?? '',
                  ),
                ),
                Gaps.hGap10,
              ],
            ),
            Gaps.vGap18,
            Row(
              children: [
                Gaps.hGap10,
                Text(
                  localized("credit_consum"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                const Spacer(),
                Text(
                  (model.consumeAmount ?? 0.0).stripTrailingZeros(),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
                Gaps.hGap8,
                SizedBox(
                  width: 20.dp,
                  height: 20.dp,
                  child: GamingImage.network(
                    url: currencyModel?.iconUrl ?? '',
                  ),
                ),
                Gaps.hGap10,
              ],
            ),
            Gaps.vGap18,
            Row(
              children: [
                Gaps.hGap10,
                Text(
                  localized("win_or_lose_status"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                const Spacer(),
                Text(
                  (model.isWin ?? false) ? localized("win") : localized("lose"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
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

  @override
  RefreshViewController get renderController => logic.controller;
}
