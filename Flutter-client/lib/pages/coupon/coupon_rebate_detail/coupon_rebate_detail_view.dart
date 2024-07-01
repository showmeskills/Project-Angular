import 'package:base_framework/base_controller.dart';
import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/config/gaps.dart';

import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import '../../../common/delegate/base_refresh_view_delegate.dart';
import '../../../common/service/currency/currency_service.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/widgets/gaming_image/gaming_image.dart';
import '../../../helper/time_helper.dart';
import '../coupon_home/coupon_list/logic.dart';
import 'coupon_rebate_detail_logic.dart';

class CouponRebateDetailPage extends StatelessWidget
    with BaseRefreshViewDelegate {
  CouponRebateDetailPage({super.key, required this.id});

  final logic = Get.put(CouponRebateDetailLogic());
  final state = Get.find<CouponRebateDetailLogic>().state;
  final homeLogic = Get.find<CouponListLogic>();

  late final int id;

  @override
  Widget build(BuildContext context) {
    logic.bonusId = id;
    return Column(
      children: [
        Expanded(
          child: Obx(() {
            return RefreshView(
              controller: logic,
              delegate: this,
              child: ListView.separated(
                itemCount: state.data.value.list.length,
                itemBuilder: (context, index) {
                  return _buildItem(state.data.value.list[index]);
                },
                separatorBuilder: (BuildContext context, int index) =>
                    Gaps.vGap20,
              ),
            );
          }),
        ),
        Gaps.vGap10,
        Row(
          children: [
            const Spacer(),
            Text(
              localized('total'),
              style: GGTextStyle(
                fontSize: GGFontSize.smallTitle,
                color: GGColors.textSecond.color,
              ),
            ),
            Gaps.hGap16,
            Obx(() {
              return Text(
                '≈${state.totalAmount.value}',
                style: GGTextStyle(
                  fontSize: GGFontSize.smallTitle,
                  color: GGColors.textMain.color,
                ),
              );
            }),
            Gaps.hGap6,
            SizedBox(
              width: 20.dp,
              height: 20.dp,
              child: GamingImage.network(
                url: CurrencyService()['USDT']?.iconUrl ?? '',
              ),
            ),
            Gaps.hGap16,
          ],
        ),
        Gaps.vGap10,
        SizedBox(height: Util.bottomMargin)
      ],
    );
  }

  Widget _buildItem(GamingCoupoRebateDetailModel model) {
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
                  (model.cardStatus == 'Invalid' ||
                          model.cardStatus == 'Unclaimed')
                      ? localized("expiration_date")
                      : localized("pick_up_time"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                const Spacer(),
                Text(
                  DateFormat("yyyy-MM-dd HH:mm:ss")
                      .format(model.createdTime ?? DateTime.now()),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
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
                  localized("receive_amount"),
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
                  localized("document_no"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                const Spacer(),
                Text(
                  model.orderNum ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
                Gaps.hGap10,
              ],
            ),
            Gaps.vGap18,
            _buildStatusRow(model),
            Gaps.vGap10,
          ],
        ),
      ),
    );
  }

  Widget _buildStatusRow(GamingCoupoRebateDetailModel model) {
    GamingCouponStatusModel? statusModel =
        homeLogic.state.couponSelectType.firstWhere((element) {
      return element.statusCode == model.cardStatus;
    });
    GamingCouponStatus status =
        gamingCouponStatusFromCardStatus(model.cardStatus ?? '');
    Color statusTextColor = GGColors.textMain.color;
    if (GamingCouponStatus.review == status) {
      statusTextColor = GGColors.process.color;
    } else if (GamingCouponStatus.reject == status) {
      statusTextColor = GGColors.error.color;
    }
    return Row(
      children: [
        Gaps.hGap10,
        Text(
          localized("stat"),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        const Spacer(),
        Text(
          statusModel.categoryDescription ?? (model.cardStatus ?? ''),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: statusTextColor,
          ),
        ),
        Gaps.hGap10,
      ],
    );
  }

  @override
  RefreshViewController get renderController => logic.controller;
}
