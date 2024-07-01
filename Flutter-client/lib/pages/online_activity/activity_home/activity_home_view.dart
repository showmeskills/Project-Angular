import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/gaming_image/fuzzy_url_parser.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/api/bonus/models/gaming_activity_model/gaming_activity_model.dart';
import '../../../common/widgets/go_gaming_empty.dart';
import '../../home/views/home_footer.dart';
import 'activity_home_logic.dart';
import 'activity_home_state.dart';

class ActivityHomePage extends BaseView<ActivityHomeLogic> {
  const ActivityHomePage({super.key});

  ActivityHomeState get state => controller.state;

  @override
  bool? showTopTips() {
    return false;
  }

  @override
  bool resizeToAvoidBottomInset() => false;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return PreferredSize(
        preferredSize: Size.fromHeight(80.dp),
        child: Material(
          color: GGColors.background.color,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Gaps.hGap16,
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    localized("lat_acti"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.superBigTitle,
                      color: GGColors.textMain.color,
                      fontWeight: GGFontWeigh.bold,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              SizedBox(
                height: 80.dp,
              ),
              Image.asset(
                R.iconGiftCard,
                width: 45.dp,
                height: 45.dp,
              ),
              Gaps.hGap16,
            ],
          ),
        ));
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(ActivityHomeLogic());
    return SingleChildScrollView(
      child: Column(
        children: [
          Obx(() {
            if (state.labelNames.isEmpty) {
              return Gaps.empty;
            } else {
              return Container(
                color: GGColors.background.color,
                height: 40.dp,
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children:
                        state.labelNames.map((e) => _buildTabItem(e)).toList(),
                  ),
                ),
              );
            }
          }),
          _buildContent(),
          Gaps.vGap20,
          const HomeFooter(),
        ],
      ),
    );
  }

  Widget _buildTabItem(String labelName) {
    return ScaleTap(
      scaleMinValue: 0.98,
      opacityMinValue: 0.8,
      onPressed: () {
        controller.pressSelectLabelName(labelName);
      },
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.dp),
        child: Obx(() {
          return Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Text(
                labelName,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
              Gaps.vGap2,
              Container(
                height: 4.dp,
                width: 28.dp,
                color: state.selectLabelName.value == labelName
                    ? GGColors.highlightButton.color
                    : Colors.transparent,
              )
            ],
          );
        }),
      ),
    );
  }

  Widget _buildContent() {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        borderRadius: const BorderRadiusDirectional.only(
          topStart: Radius.circular(36),
          topEnd: Radius.circular(36),
        ),
      ),
      child: Obx(() {
        if (state.data.isEmpty && !state.isLoading.value) {
          return SizedBox(
            height: 300.dp,
            child: const Center(
              child: GoGamingEmpty(),
            ),
          );
        } else {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ...state.data.map((element) => _buildCell(element)).toList(),
              Gaps.vGap24,
            ],
          );
        }
      }),
    );
  }

  Widget _buildCell(GamingActivityModel model) {
    return ScaleTap(
      scaleMinValue: 0.98,
      opacityMinValue: 0.8,
      onPressed: () {
        controller.pressActivity(model);
      },
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Gaps.vGap24,
            Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: DateTime.now().millisecondsSinceEpoch >
                            (model.endTime ?? 0)
                        ? GGColors.error.color
                        : GGColors.success.color,
                    borderRadius: BorderRadius.all(Radius.circular(4.dp)),
                  ),
                  padding: EdgeInsets.symmetric(horizontal: 7.dp),
                  constraints:
                      BoxConstraints(minHeight: 19.dp, minWidth: 56.dp),
                  alignment: Alignment.center,
                  child: Text(
                    DateTime.now().millisecondsSinceEpoch > (model.endTime ?? 0)
                        ? localized("over_jop")
                        : localized("in_pro"),
                    style: GGTextStyle(
                      fontSize: GGFontSize.label,
                      color: GGColors.buttonTextWhite.color,
                    ),
                  ),
                ),
                Gaps.hGap8,
                if (model.isEnroll ?? false)
                  Container(
                    decoration: BoxDecoration(
                      color: GGColors.highlightButton.color,
                      borderRadius: BorderRadius.all(Radius.circular(4.dp)),
                    ),
                    padding: EdgeInsets.symmetric(horizontal: 7.dp),
                    child: Text(
                      localized("applied"),
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: GGColors.textMain.color,
                      ),
                    ),
                  ),
              ],
            ),
            Gaps.vGap8,
            ConstrainedBox(
              constraints: BoxConstraints(minHeight: 181.dp),
              child: GamingImage.fuzzyNetwork(
                url: FuzzyUrlParser(url: model.activityImgUrl ?? '').toString(),
                progressUrl: FuzzyUrlParser.blur(
                        url: model.activityImgUrl ?? '', width: 300)
                    .toString(),
                width: double.infinity,
                radius: 16.dp,
              ),
            ),
            Gaps.vGap8,
            Text(
              model.title ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.smallTitle,
                color: GGColors.textMain.color,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
            Gaps.vGap8,
            Row(
              children: [
                SvgPicture.asset(
                  R.iconCalendar2,
                  width: 16.dp,
                  height: 16.dp,
                  color: GGColors.textSecond.color,
                ),
                Gaps.hGap4,
                Text(
                  localized("acti_end"),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
                Text(
                  DateFormat('yyyy-MM-dd HH:mm')
                      .formatTimestamp(model.endTime ?? 0),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
