import 'package:base_framework/src.widget/render_view/render_view.dart';
import 'package:base_framework/src.widget/scale_tap.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:base_framework/base_controller.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';

import '../../../../R.dart';
import '../../../../common/delegate/base_refresh_view_delegate.dart';
import '../../../../common/lang/locale_lang.dart';
import '../../../../common/theme/colors/go_gaming_colors.dart';
import '../../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../../common/widgets/gaming_image/gaming_image.dart';
import '../../../../common/widgets/gaming_popup.dart';
import '../../../../common/widgets/gg_button.dart';
import '../../../../config/gaps.dart';
import '../../../../router/app_pages.dart';
import '../coupon_home_view.dart';
import 'logic.dart';

class CouponListComponent extends StatelessWidget with BaseRefreshViewDelegate {
  CouponListComponent({Key? key}) : super(key: key);

  final logic = Get.put(CouponListLogic());
  final state = Get.find<CouponListLogic>().state;

  @override
  Widget build(BuildContext context) {
    return RefreshView(
      delegate: this,
      controller: logic,
      child: SingleChildScrollView(
        child: Column(
          children: [
            Gaps.vGap16,
            _buildTip(),
            Gaps.vGap16,
            _buildSort2(),
            Gaps.vGap16,
            const CouponHomeView(),
          ],
        ),
      ),
    );
  }

  Widget _buildSort2() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildSortButton(),
        Gaps.hGap16,
        Expanded(
          child: Obx(() {
            return GGButton(
              backgroundColor: GGColors.pinkBtnBg.color,
              height: 33.dp,
              enable: logic.state.data.value.list.isNotEmpty,
              onPressed: () {
                logic.onReceiveAllCoupon();
              },
              text: localized('accept_all_prizes'),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildSortButton() {
    return Expanded(
      child: ScaleTap(
        onPressed: navigateToSort,
        childBuilder: (p0) {
          return Container(
            padding: EdgeInsets.symmetric(vertical: 8.dp, horizontal: 10.dp),
            // height: 40.dp,
            decoration: BoxDecoration(
              color: Colors.transparent,
              border: Border.all(
                color: p0 > 0.5
                    ? GGColors.highlightButton.color.withOpacity(p0)
                    : GGColors.border.color,
                width: 1.dp,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                GamingPopupLinkWidget(
                  overlay: logic.overlay,
                  followerAnchor: Alignment.bottomLeft,
                  targetAnchor: Alignment.topRight,
                  popup: _buildSortTip(),
                  offset: Offset(-24.dp, -6.dp),
                  triangleInset: EdgeInsetsDirectional.only(start: 13.dp),
                  child: GamingImage.asset(
                    R.iconTipIcon,
                    width: 14.dp,
                    height: 14.dp,
                    color: p0 > 0.5
                        ? GGColors.highlightButton.color.withOpacity(p0)
                        : GGColors.textSecond.color,
                  ),
                ),
                Gaps.hGap10,
                Expanded(
                  child: Text(
                    localized('order_tips_txt'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: p0 > 0.5
                          ? GGColors.highlightButton.color.withOpacity(p0)
                          : GGColors.textSecond.color,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                  ),
                ),
                Gaps.hGap6,
                GamingImage.asset(
                  R.iconSortMenu,
                  width: 14.dp,
                  height: 14.dp,
                  color: p0 > 0.5
                      ? GGColors.highlightButton.color.withOpacity(p0)
                      : GGColors.textSecond.color,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSortTip() {
    return SizedBox(
      width: 200.dp,
      child: Text(
        localized('order_tips'),
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          color: GGColors.textBlackOpposite.color,
        ),
      ),
    );
  }

  Widget _buildTip() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 12.dp),
      width: double.infinity,
      decoration: BoxDecoration(
        color: GGColors.background.color,
        borderRadius: BorderRadius.all(
          Radius.circular(16.dp),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              GamingImage.asset(
                R.couponCouponTipIcon,
                height: 58.dp,
              ),
              Gaps.hGap10,
              Expanded(
                child: RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: localized("understand_more_tip"),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                        ),
                        // textAlign
                      ),
                      WidgetSpan(
                        child: Gaps.hGap4,
                      ),
                      TextSpan(
                        recognizer: TapGestureRecognizer()
                          ..onTap = () {
                            logic.onClickFAQ();
                          },
                        text: localized("learn_more"),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.highlightButton.color,
                        ),
                        // textAlign
                      ),
                    ],
                  ),
                  textAlign: TextAlign.left,
                  maxLines: 5,
                ),
              )
            ],
          ),
          Gaps.vGap10,
          _buildSort(),
        ],
      ),
    );
  }

  Widget _buildSort() {
    return Row(
      children: [
        Expanded(
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: _showExchange,
            child: Container(
              padding: EdgeInsets.symmetric(vertical: 6.dp, horizontal: 10.dp),
              decoration: BoxDecoration(
                color: Colors.transparent,
                border: Border.all(
                  color: GGColors.border.color,
                  width: 1.dp,
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: EdgeInsets.only(bottom: 4.dp),
                    child: Image.asset(
                      R.couponCouponCodeIcon,
                      height: 14.dp,
                    ),
                  ),
                  Gaps.hGap10,
                  Text(
                    localized("coupon_code"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
        Gaps.hGap10,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _showFilter,
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 6.dp),
            child: Image.asset(
              R.couponCouponSort,
              height: 16.dp,
            ),
          ),
        )
      ],
    );
  }

  @override
  RefreshViewController get renderController => logic.controller;

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return null;
  }

  @override
  Widget? getLoadingWidget(BuildContext context) {
    return null;
  }

  @override
  Widget getNoMoreWidget(BuildContext context) {
    return Gaps.empty;
  }
}

extension _Action on CouponListComponent {
  void _showFilter() {
    logic.onPressFilter();
  }

  void _showExchange() {
    logic.onExchange();
  }

  void navigateToSort() {
    Get.toNamed<void>(Routes.couponSort.route);
  }
}
