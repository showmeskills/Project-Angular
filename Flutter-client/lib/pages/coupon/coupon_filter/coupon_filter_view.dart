import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';

import '../../../R.dart';
import '../../../common/api/base/base_api.dart';
import '../../../common/api/bonus/models/gaming_coupon_model/gaming_coupon_model.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/widgets/appbar/appbar.dart';
import '../../../common/widgets/gaming_bottom_sheet.dart';
import '../../../common/widgets/gaming_close_button.dart';
import '../../../config/gaps.dart';
import 'coupon_filter_logic.dart';

class CouponFilterResult {
  /// 当前选中筛选卡券类型
  String? grantType;
  String? typeCode;

  /// 当前选中筛选卡券状态
  String? status;

  /// 当前选中筛选卡券排序
  bool ascSort = false;

  CouponFilterResult(
      {this.grantType, this.typeCode, this.status, this.ascSort = false});
}

class CouponFilterPage extends BaseView<CouponFilterLogic> {
  const CouponFilterPage({super.key});

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
        title: localized('filter'),
        leadingIcon: GamingBackButton(
          padding: EdgeInsets.symmetric(
            horizontal: 16.dp,
            vertical: 16.dp,
          ),
          onPressed: () {
            // controller.clearData();
            Get.back<void>();
          },
        ));
  }

  @override
  Widget body(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap16,
          Text(
            localized("card_type"),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
          Gaps.vGap4,
          Obx(() {
            String content = "";
            if (controller.state.selectType.value == null) {
              content = localized("all");
            } else {
              content = '${controller.state.selectType.value?.title ?? ''} '
                  '(${controller.state.selectType.value?.total ?? 0})';
            }
            return _buildSelectArea(content, onTap: _onPressType);
          }),
          Gaps.vGap24,
          Text(
            localized("card_status"),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
          Gaps.vGap4,
          Obx(() {
            String content = "";
            if (controller.state.selectStatus.value == null) {
              content = localized("all");
            } else {
              content =
                  controller.state.selectStatus.value?.categoryDescription ??
                      '';
            }
            return _buildSelectArea(content, onTap: _onPressStatus);
          }),
          Gaps.vGap24,
          Text(
            localized("sort"),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
          Gaps.vGap4,
          Obx(() {
            return _buildSelectArea(
                controller.state.ascSort.value
                    ? localized("receive_card_early")
                    : localized("receive_card_latest"),
                onTap: _onPressSort);
          }),
          const Spacer(),
          _buildButtons(),
          SizedBox(
            height: Util.bottomMargin,
          ),
        ],
      ),
    );
  }

  Widget _buildButtons() {
    return SizedBox(
      height: 48.dp,
      child: Row(
        children: [
          Expanded(
            child: GGButton.minor(
              onPressed: _onReset,
              text: localized("reset"),
              backgroundColor: GGColors.border.color,
            ),
          ),
          Gaps.hGap12,
          Expanded(
            child: GGButton(onPressed: _onFilter, text: localized("filter")),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectArea(String content,
      {Color? textColor, GestureTapCallback? onTap}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        height: 48.dp,
        width: double.infinity,
        decoration: BoxDecoration(
          border: Border.all(
            color: GGColors.border.color,
            width: 1.dp,
          ),
          borderRadius: BorderRadius.circular(4.dp),
        ),
        child: Row(
          children: [
            Gaps.hGap16,
            Text(
              content,
              style: GGTextStyle(
                color: textColor ?? GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
            const Spacer(),
            SvgPicture.asset(R.iconDown, width: 10, height: 8),
            Gaps.hGap14,
          ],
        ),
      ),
    );
  }
}

extension _Action on CouponFilterPage {
  void _onReset() {
    controller.reset();
    final result = CouponFilterResult();
    result.grantType = controller.state.selectType.value?.grantType;
    result.status = controller.state.selectStatus.value?.statusCode;
    result.ascSort = controller.state.ascSort.value;
    result.typeCode = controller.state.selectType.value?.typeCode;
    Get.back<CouponFilterResult?>(
      result: result,
    );
  }

  void _onFilter() {
    final result = CouponFilterResult();
    result.grantType = controller.state.selectType.value?.grantType;
    result.status = controller.state.selectStatus.value?.statusCode;
    result.ascSort = controller.state.ascSort.value;
    result.typeCode = controller.state.selectType.value?.typeCode;
    Get.back<CouponFilterResult?>(result: result);
  }

  void _onPressSort() {
    List<String> titles = <String>[];
    titles.add(localized("receive_card_early"));
    titles.add(localized("receive_card_latest"));
    GamingBottomSheet.show<GamingCouponTypeModel?>(
      title: localized('sort'),
      builder: (context) {
        return SafeArea(
          top: false,
          bottom: true,
          child: Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: EdgeInsetsDirectional.only(top: 8.dp, bottom: 8.dp),
                  itemCount: titles.length,
                  itemBuilder: (context, index) {
                    bool isSelect = (controller.state.ascSort.value
                            ? localized("receive_card_early")
                            : localized("receive_card_latest")) ==
                        titles[index];
                    return InkWell(
                      onTap: () {
                        Get.back<void>();
                        controller.onChangeSort(titles[index]);
                      },
                      child: Container(
                        alignment: Alignment.centerLeft,
                        padding: EdgeInsets.symmetric(horizontal: 16.dp),
                        height: 51.dp,
                        child: Text(
                          titles[index],
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: isSelect
                                ? GGColors.highlightButton.color
                                : GGColors.textMain.color,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _onPressStatus() {
    List<String> titles = <String>[];
    titles.add(localized("all"));
    titles.addAll(controller.state.couponSelectStatus
        .map((element) => element.categoryDescription ?? '')
        .toList());
    GamingBottomSheet.show<GamingCouponTypeModel?>(
      title: localized('card_status'),
      builder: (context) {
        return SafeArea(
          top: false,
          bottom: true,
          child: Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: EdgeInsetsDirectional.only(top: 8.dp, bottom: 8.dp),
                  itemCount: titles.length,
                  itemBuilder: (context, index) {
                    bool isSelect = (titles[index] ==
                        (controller.state.selectStatus.value
                                ?.categoryDescription ??
                            localized("all")));
                    return InkWell(
                      onTap: () {
                        Get.back<void>();
                        controller.onChangeStatus(titles[index]);
                      },
                      child: Container(
                        alignment: Alignment.centerLeft,
                        padding: EdgeInsets.symmetric(horizontal: 16.dp),
                        height: 51.dp,
                        child: Text(
                          titles[index],
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: isSelect
                                ? GGColors.highlightButton.color
                                : GGColors.textMain.color,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _onPressType() {
    List<String> titles = <String>[];
    titles.add(localized("all"));
    titles.addAll(controller.state.couponSelectType
        .map((element) => '${element.title} (${element.total ?? 0})')
        .toList());
    GamingBottomSheet.show<GamingCouponTypeModel?>(
      title: localized('card_type'),
      builder: (context) {
        return SafeArea(
          top: false,
          bottom: true,
          child: Column(
            children: [
              Expanded(
                child: ListView.builder(
                  padding: EdgeInsetsDirectional.only(top: 8.dp, bottom: 8.dp),
                  itemCount: titles.length,
                  itemBuilder: (context, index) {
                    bool isSelect = (titles[index].contains(
                        (controller.state.selectType.value?.title ??
                            localized("all"))));
                    return InkWell(
                      onTap: () {
                        Get.back<void>();
                        controller.onChangeType(titles[index]);
                      },
                      child: Container(
                        alignment: Alignment.centerLeft,
                        padding: EdgeInsets.symmetric(horizontal: 16.dp),
                        height: 51.dp,
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Text(
                            titles[index],
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: isSelect
                                  ? GGColors.highlightButton.color
                                  : GGColors.textMain.color,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
