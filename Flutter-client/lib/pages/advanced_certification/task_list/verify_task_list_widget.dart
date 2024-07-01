import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/risk_form/models/verify_list_model.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/helper/alive_verify_util.dart';
import 'package:gogaming_app/widget_header.dart';

import 'verify_task_list_logic.dart';

class VerifyTaskListWidget extends StatelessWidget {
  const VerifyTaskListWidget({super.key});

  static void show() {
    const popView = VerifyTaskListWidget();
    Get.bottomSheet<void>(
      FocusDetector(
        onVisibilityGained: () => popView.logic.loadData(),
        child: popView,
      ),
      barrierColor: GGColors.transparent.color,
      enableDrag: false,
      isDismissible: false,
      // isDismissible: true,
      exitBottomSheetDuration: Duration.zero,
      enterBottomSheetDuration: Duration.zero,
      isScrollControlled: true,
    );
  }

  VerifyTaskListLogic get logic => Get.find<VerifyTaskListLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(VerifyTaskListLogic(), permanent: true);

    return Container(
      constraints: BoxConstraints(
        minWidth: double.infinity,
        minHeight: 500.dp,
      ),
      margin:
          EdgeInsetsDirectional.only(bottom: 80.dp, start: 20.dp, end: 20.dp),
      padding: EdgeInsetsDirectional.only(start: 16.dp, end: 16.dp),
      color: GGColors.homeFootBackground.color,
      child: Obx(
        () {
          final list = logic.list;
          return Stack(
            children: [
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildHeader(),
                  ...list.map((element) {
                    return _buildVerifyRow(list, element);
                  }).toList(),
                  _buildFooter(),
                ],
              ),
              Positioned.fill(
                child: Visibility(
                  visible: logic.isLoading.value,
                  child: const GoGamingLoading(),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildVerifyRow(
      RxList<VerifyListModel> list, VerifyListModel element) {
    final index = list.indexOf(element);
    final isFirst = list.first == element;
    final isLast = list.last == element;
    Color topLineColor = GGColors.transparent.color;
    Color bottomLineColor = GGColors.transparent.color;
    final isPrePass =
        (index > 0 && list[index - 1].isAuthentication == true) || isFirst;
    if (!isFirst && index > 0) {
      topLineColor = list[index - 1].isAuthentication == true
          ? GGColors.successText.color
          : GGColors.userBarBackground.color;
    }
    if (!isLast && index != -1) {
      bottomLineColor = list[index].isAuthentication == true
          ? GGColors.successText.color
          : GGColors.userBarBackground.color;
    }
    return _buildRow(
      topLineColor: topLineColor,
      bottomLineColor: bottomLineColor,
      isPass: element.isAuthentication == true,
      title: element.authenticationType ?? '',
      typeValue: element.value ?? 0,
      isPrePass: isPrePass,
    );
  }

  Widget _buildRow({
    required Color topLineColor,
    required Color bottomLineColor,
    required bool isPass,
    required bool isPrePass,
    required String title,
    required int typeValue,
  }) {
    final tintColor =
        isPass ? GGColors.buttonTextWhite.color : GGColors.textMain.color;
    return SizedBox(
      height: 85.dp,
      child: Row(
        children: [
          _buildProgress(
            topLineColor: topLineColor,
            bottomLineColor: bottomLineColor,
            isPass: isPass,
          ),
          Expanded(
            child: Container(
              height: 65.dp,
              decoration: BoxDecoration(
                color: isPass
                    ? GGColors.successText.color
                    : GGColors.menuBackground.color,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                children: [
                  SizedBox(width: 10.dp),
                  SvgPicture.asset(
                    'assets/images/advanced_certification/verify_type_$typeValue.svg'
                        .replaceFirst('-', '0'), //兼容asset_gen 不支持-1
                    width: 20.dp,
                    height: 20.dp,
                    color: tintColor,
                    fit: BoxFit.cover,
                  ),
                  SizedBox(width: 4.dp),
                  Expanded(
                    child: Text(
                      title,
                      style: GGTextStyle(
                        fontSize: GGFontSize.smallTitle,
                        color: tintColor,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  SizedBox(width: 5.dp),
                  isPass
                      ? SvgPicture.asset(
                          R.preferencesCurRight,
                          width: 16.dp,
                          height: 16.dp,
                          color: GGColors.buttonTextWhite.color,
                        )
                      : GGButton.main(
                          onPressed: () => _onPressVerify(typeValue),
                          text: localized('bind_p_g'),
                          textStyle: GGTextStyle(fontSize: GGFontSize.content),
                          height: 34.dp,
                          enable: isPrePass,
                        ),
                  SizedBox(width: 16.dp),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgress({
    required Color topLineColor,
    required Color bottomLineColor,
    required bool isPass,
  }) {
    return SizedBox(
      width: 65.dp,
      child: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: Center(
                  child: Container(
                    color: topLineColor,
                    width: 4.dp,
                  ),
                ),
              ),
              Expanded(
                child: Center(
                  child: Container(
                    color: bottomLineColor,
                    width: 4.dp,
                  ),
                ),
              ),
            ],
          ),
          Positioned.fill(
            child: Center(
              child: Container(
                width: 20.dp,
                height: 20.dp,
                decoration: BoxDecoration(
                  color: isPass
                      ? GGColors.successText.color
                      : GGColors.menuBackground.color,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
          Positioned.fill(
            child: Center(
              child: Visibility(
                visible: isPass,
                child: SvgPicture.asset(
                  R.preferencesCurRight,
                  width: 10.dp,
                  height: 10.dp,
                  color: GGColors.buttonTextWhite.color,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Visibility(
      // visible: logic.isAllPass() == false && (logic.lastPassVerify() != null),
      visible: false,
      child: Padding(
        padding: EdgeInsetsDirectional.only(top: 10.dp, bottom: 20.dp),
        child: Row(
          children: [
            SizedBox(width: 65.dp),
            Expanded(
              child: Text(
                localized(
                  'verify_require_before',
                  params: [
                    logic.firstNotPassVerify()?.authenticationType ?? '',
                    logic.lastPassVerify()?.authenticationType ?? '',
                  ],
                ),
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textSecond.color,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        SizedBox(height: 64.dp),
        Text(
          localized('verify_task'),
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.smallTitle,
          ),
        ),
        const Spacer(),
        InkWell(
          onTap: () => Get.back<void>(),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: 6.dp,
              vertical: 6.dp,
            ),
            child: SvgPicture.asset(
              R.iconClose,
              width: 18.dp,
              height: 18.dp,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
      ],
    );
  }
}

extension _Action on VerifyTaskListWidget {
  void _onPressVerify(int typeValue) {
    final routeMap = {
      -1: Routes.bindMobile.route,
      1: Routes.kycMiddle.route,
      // 6: Routes.face.route,
      2: Routes.kycAdvance.route,
      9: Routes.fullCertificate.route,
    };
    final page = routeMap[typeValue];
    if (page != null) {
      Get.toNamed<void>(page);
    } else if (typeValue == 6) {
      //人脸识别
      AliveVerifyUtil.check();
    }
  }
}
