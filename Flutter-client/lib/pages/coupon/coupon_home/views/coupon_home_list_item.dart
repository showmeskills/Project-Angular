import 'package:auto_size_text/auto_size_text.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/coupon/coupon_credit_detail/coupon_credit_detail_view.dart';
import 'package:gogaming_app/pages/coupon/coupon_rebate_detail/coupon_rebate_detail_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import '../../../../common/widgets/gaming_popup.dart';
import '../../../../helper/time_helper.dart';

// ignore: must_be_immutable
class GamingCouponHomeListItem extends StatelessWidget {
  final GamingCouponModel data;
  final void Function()? onReveice; // 点击领取卡券
  final void Function()? onReject; // 点击审核拒绝


  late GamingCouponLayoutValue value;

  GamingCouponHomeListItem({
    super.key,
    required this.data,
    required List<GamingCouponStatusModel> couponStatusList,
    this.onReveice,
    this.onReject,
  }) {
    value = data.mapToLayoutValue(couponStatusList);
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: (Get.width - 32.dp) * 0.58,
      child: Stack(
        children: [
          Positioned.fill(
            child: GamingImage.asset(
              _cellBgString(),
              fit: BoxFit.fill,
            ),
          ),
          Positioned(
            top: 15.dp,
            left: 20.dp,
            right: 20.dp,
            child: Column(
              children: [
                Row(
                  children: [
                    _buildAmount(),
                    Gaps.hGap10,
                    _buildContent(context),
                  ],
                ),
                Gaps.vGap8,
                Row(
                  children: [
                    Text(
                      _timeTipString(),
                      style: GGTextStyle(
                        color: GGColors.couponYellow.color,
                        fontSize: GGFontSize.hint,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        _timeString(),
                        textAlign: TextAlign.end,
                        style: GGTextStyle(
                          color: GGColors.couponYellow.color,
                          fontSize: GGFontSize.hint,
                          fontWeight: GGFontWeigh.bold,
                        ),
                      ),
                    ),
                  ],
                ),
                Gaps.vGap8,
                Row(
                  children: [
                    Expanded(
                      child: GamingPopupLinkWidget(
                        followerAnchor: Alignment.bottomCenter,
                        targetAnchor: Alignment.topCenter,
                        popup: _buildTip(),
                        offset: Offset(-20.dp, -10.dp),
                        triangleInset: EdgeInsetsDirectional.only(start: 8.dp),
                        child: Text(
                          value.introduce,
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                          style: GGTextStyle(
                            color: GGColors.couponYellow.color,
                            fontSize: GGFontSize.hint,
                          ),
                        ),
                      ),
                    ),
                    ScaleTap(
                      onPressed: () {
                        _onCreditClicked(data);
                      },
                      child: Padding(
                        padding: EdgeInsets.only(left: 20.dp),
                        child: Visibility(
                          visible: value.showDetail,
                          child: SvgPicture.asset(
                            R.couponIconDoubleArrow,
                            color: GGColors.couponYellow.color,
                            height: 12.dp,
                          ),
                        ),
                      ),
                    )
                  ],
                ),
                Gaps.vGap6,
                _buildStatusButtonWidget(context),
              ],
            ),
          ),
          Positioned(
            left: 8.dp,
            top: 8.dp,
            child: Visibility(
              visible: value.currencyExplainText.isNotEmpty,
              child: GamingPopupLinkWidget(
                followerAnchor: Alignment.bottomLeft,
                targetAnchor: Alignment.topCenter,
                triangleSize: Size.zero,
                popup: Padding(
                  padding: EdgeInsets.all(4.dp),
                  child: Text(
                    value.currencyExplainText,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textBlackOpposite.color,
                    ),
                  ),
                ),
                offset: Offset(15.dp, 15.dp),
                triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
                child: SvgPicture.asset(
                  R.couponExplain,
                  width: 14.dp,
                  height: 14.dp,
                  color: GGColors.buttonTextWhite.color,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _timeString() {
    if (GamingCouponStatus.using ==
            gamingCouponStatusFromCardStatus(data.cardStatus ?? '') ||
        GamingCouponStatus.used ==
            gamingCouponStatusFromCardStatus(data.cardStatus ?? '') ||
        GamingCouponStatus.received ==
            gamingCouponStatusFromCardStatus(data.cardStatus ?? '')) {
      return DateFormat("yyyy-MM-dd HH:mm:ss")
          .formatTimestamp(data.receiveTime ?? 0);
    } else {
      if ((data.expiredTime ?? 0) > 0) {
        return DateFormat("yyyy-MM-dd HH:mm:ss")
            .formatTimestamp(data.expiredTime ?? 0);
      } else {
        return localized("no_expiration");
      }
    }
  }

  String _timeTipString() {
    if (GamingCouponStatus.using ==
            gamingCouponStatusFromCardStatus(data.cardStatus ?? '') ||
        GamingCouponStatus.used ==
            gamingCouponStatusFromCardStatus(data.cardStatus ?? '') ||
        GamingCouponStatus.received ==
            gamingCouponStatusFromCardStatus(data.cardStatus ?? '')) {
      return localized('pick_up_time');
    } else {
      return localized('expiration_date');
    }
  }

  String _cellBgString() {
    if (data.isCoupon) {
      return R.bonusCouponBg;
    } else if (data.isSvip) {
      return R.bonusSvipBg;
    } else {
      return R.bonusCashBg;
    }
  }

  Widget _buildAmount() {
    return SizedBox(
      width: (Get.width - 32.dp) * 0.33,
      height: (Get.width - 32.dp) * 0.56 * 0.42,
      child: Stack(
        children: [
          Positioned.fill(
            child: GamingImage.asset(
              R.bonusMoneyBg,
              fit: BoxFit.cover,
            ),
          ),
          Positioned.fill(
            child: Column(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                AutoSizeText(
                  value.currencyAmount,
                  textAlign: TextAlign.center,
                  minFontSize: 1,
                  maxLines: 1,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontWeight: GGFontWeigh.bold,
                    color: GGColors.couponYellow.color,
                  ),
                ),
                // Gaps.vGap4,
                Text(
                  data.isSvip ? "SVIP" : value.currencyName,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          value.title,
          overflow: TextOverflow.ellipsis,
          style: GGTextStyle(
            color: GGColors.buttonTextWhite.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.bold,
          ),
        ),
        Gaps.vGap10,
        _buildTagsWidget(context),
      ],
    );
  }

  Widget _buildTip() {
    return Flex(
      direction: Axis.horizontal,
      children: [
        Flexible(
          child: Container(
            constraints: BoxConstraints(maxWidth: 260.dp),
            child: Text(
              value.introduce,
              overflow: TextOverflow.ellipsis,
              maxLines: 3,
              style: GGTextStyle(
                color: GGColors.textBlackOpposite.color,
                fontSize: GGFontSize.hint,
              ),
            ),
          ),
        ),
      ],
    );
  }

  /// 构建标签
  Widget _buildTagsWidget(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Wrap(
        spacing: 6.dp,
        runSpacing: 6.dp,
        children: value.tags.map((e) {
          return UnconstrainedBox(
            child: Container(
              padding: EdgeInsets.only(left: 8.dp, right: 8.dp),
              height: 24.dp,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: GGColors.buttonTextWhite.color.withAlpha(60),
                borderRadius: BorderRadius.circular(90.dp),
              ),
              child: Text(
                e,
                style: GGTextStyle(
                  color: GGColors.buttonTextWhite.color,
                  fontSize: GGFontSize.hint,
                ),
                maxLines: 1,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  /// 构建状态按钮
  Widget _buildStatusButtonWidget(BuildContext context) {
    String buttonText = value.buttonText;
    Color buttonTextColor = GGColors.buttonTextWhite.color;
    Color buttonTextBGColor = GGColors.border.color.withAlpha(60);
    switch (value.buttonType) {
      case GamingCouponButtonLayoutType.action:
        {
          buttonTextColor = GGColors.buttonTextWhite.color;
          buttonTextBGColor = GGColors.highlightButton.color;
          break;
        }
      case GamingCouponButtonLayoutType.border:
        {
          buttonTextColor = GGColors.buttonTextWhite.color;
          buttonTextBGColor = Colors.black.withAlpha(60);
          break;
        }
      case GamingCouponButtonLayoutType.general:
        break;
    }
    GamingCouponStatus status =
        gamingCouponStatusFromCardStatus(data.cardStatus ?? '');
    if (status == GamingCouponStatus.review) {
      buttonTextBGColor = GGColors.highlightButton.color.withOpacity(0.5);
    }

    return GestureDetector(
      child: Container(
        height: 40.dp,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: buttonTextBGColor,
          borderRadius: BorderRadius.circular(90.dp),
        ),
        child: Text(
          buttonText,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: buttonTextColor,
            fontWeight: GGFontWeigh.bold,
          ),
        ),
      ),
      onTap: () {
        if (value.buttonType == GamingCouponButtonLayoutType.action) {
          onReveice?.call();
        } else if (status == GamingCouponStatus.reject) {
          onReject?.call();
        }
        
      },
    );
  }
}

extension _Action on GamingCouponHomeListItem {
  void _onCreditClicked(GamingCouponModel model) {
    if (model.isCash && model.isAccumulate == true) {
      /// 现金券 进入返水详情
      _showRebateDetail(model);
      return;
    }

    if (model.isCoupon &&
        GamingCouponStatus.using ==
            gamingCouponStatusFromCardStatus(model.cardStatus ?? '')) {
      /// 抵扣券 进入抵用金使用详情
      _showUseDetail(model);
      return;
    }
  }

  void _showRebateDetail(GamingCouponModel model) {
    GamingBottomSheet.show<void>(
      title: localized('rebate_detail'),
      fixedHeight: false,
      builder: (context) {
        return MediaQuery.removePadding(
          removeTop: true,
          context: context,
          child: SafeArea(
            bottom: false,
            child: SizedBox(
              width: double.infinity,
              height: Get.height * 0.8,
              child: CouponRebateDetailPage(
                id: model.id ?? 0,
              ),
            ),
          ),
        );
      },
    );
  }

  void _showUseDetail(GamingCouponModel model) {
    GamingBottomSheet.show<void>(
      title: localized('credit_usage_detail'),
      fixedHeight: false,
      builder: (context) {
        return MediaQuery.removePadding(
          removeTop: true,
          context: context,
          child: SafeArea(
            bottom: false,
            child: SizedBox(
              width: double.infinity,
              height: Get.height * 0.8,
              child: CouponCreditDetailPage(
                id: model.id ?? 0,
              ),
            ),
          ),
        );
      },
    );
  }
}
