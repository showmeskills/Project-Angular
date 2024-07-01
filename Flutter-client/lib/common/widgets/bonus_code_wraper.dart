import 'package:flutter/material.dart';
import 'package:gogaming_app/common/theme/theme_manager.dart';
import 'package:gogaming_app/controller_header.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gg_button.dart';

class BonusCodeWrapperLogic extends BaseController {
  final bonusIndex = 0.obs;
}

class BonusCodeWrapper extends StatelessWidget {
  const BonusCodeWrapper({
    super.key,
    required this.hasCode,
    required this.bonusSelectView,
    required this.codeView,
    required this.changeIndex,
    required this.enable,
  });

  /// 是否有券码数据
  final bool hasCode;

  /// 选择红利视图
  final Widget bonusSelectView;

  /// 输入券码视图
  final Widget codeView;

  /// 改变选中的index 0是选择红利 1是输入卡券
  final void Function(int index) changeIndex;
  final bool enable;
  BonusCodeWrapperLogic get logic => Get.find<BonusCodeWrapperLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(BonusCodeWrapperLogic());

    return IgnorePointer(
      ignoring: !enable,
      child: Column(
        children: [
          Visibility(
            visible: hasCode,
            child: Padding(
              padding: EdgeInsets.only(top: 24.dp),
              child: Row(
                children: [
                  Expanded(
                    child: buildAmountButton(
                      localized('select_bonus_act'),
                      0,
                    ),
                  ),
                  SizedBox(width: 10.dp),
                  Expanded(
                    child: buildAmountButton(
                      localized('i_have_voucher'),
                      1,
                    ),
                  ),
                ],
              ),
            ),
          ),
          Obx(() {
            if (0 == logic.bonusIndex.value || !hasCode) {
              return bonusSelectView;
            } else {
              return codeView;
            }
          }),
        ],
      ),
    );
  }

  Widget buildAmountButton(String text, int index) {
    return Obx(() {
      final isSelected = logic.bonusIndex.value == index;
      return GGButton(
        backgroundColor: isSelected
            ? (ThemeManager().isDarkMode
                ? GGColors.border.color
                : GGColors.brand.color)
            : GGColors.transparent.color,
        border: Border.all(
          color:
              !isSelected ? GGColors.border.color : GGColors.transparent.color,
        ),
        height: 47.dp,
        radius: 6.dp,
        textStyle: GGTextStyle(
          color: isSelected
              ? GGColors.buttonTextWhite.color
              : GGColors.textMain.color,
          fontSize: GGFontSize.content,
        ),
        onPressed: () => setBonusTitle(index),
        text: text,
      );
    });
  }

  void setBonusTitle(int index) {
    if (logic.bonusIndex.value == index) return;

    logic.bonusIndex.value = index;
    changeIndex(index);
  }
}
