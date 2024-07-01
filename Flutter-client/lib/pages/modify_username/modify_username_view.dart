import 'package:flutter/material.dart';
// import 'package:get/get.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/widgets/appbar/appbar.dart';
import '../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../common/widgets/gg_button.dart';
import '../../generated/r.dart';
import 'modify_username_logic.dart';

class ModifyUserNamePage extends BaseView<ModifyUserNameLogic> {
  const ModifyUserNamePage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const ModifyUserNamePage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(title: localized('change_username'));
  }

  @override
  Widget body(BuildContext context) {
    return _contentWidget(context);
  }

  Widget _contentWidget(BuildContext context) {
    Get.put(ModifyUserNameLogic());
    return Container(
      width: double.infinity,
      color: GGColors.background.color,
      child: SingleChildScrollView(
        child: Obx(() {
          return Container(
            padding: EdgeInsets.only(left: 16.dp, top: 24.dp, right: 16.dp),
            height:
                MediaQuery.of(context).size.height - 115.dp - Util.bottomMargin,
            child: Column(
              children: [
                /// 步骤
                _buildSteps(),
                Gaps.vGap30,
                _buildContent(context),
                Gaps.vGap30,
                const Spacer(),

                /// 下一步
                _buildBottomStep(context),
                Gaps.vGap24,
                // Gaps.vGap30,
              ],
            ),
          );
        }),
      ), //GGColors.popBackground.color, // Colors.red, //
    );
  }

  /// 第几步
  Widget _buildSteps() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildStep(1),
        Gaps.vGap4,
        verticalLine(1),
        Gaps.vGap4,
        _buildStep(2),
        Gaps.vGap4,
        verticalLine(2),
        Gaps.vGap4,
        _buildStep(3)
      ],
    );
  }

  Widget verticalLine(int index) {
    return Container(
      width: 24.dp,
      alignment: Alignment.center,
      child: Container(
        width: 4.dp,
        height: 15.dp,
        color: controller.curIndex.value > index
            ? GGColors.brand.color
            : GGColors.border.color,
      ),
    );
  }

  Widget _buildStep(int index) {
    return Row(
      children: [
        Container(
          width: 24.dp,
          height: 24.dp,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: controller.curIndex.value >= index
                ? GGColors.brand.color
                : GGColors.border.color,
            borderRadius: BorderRadius.all(Radius.circular(12.0.dp)),
          ),
          child: Text('$index',
              style: GGTextStyle(
                color: controller.curIndex.value >= index
                    ? GGColors.buttonTextWhite.color
                    : GGColors.textSecond.color,
                fontSize: GGFontSize.smallTitle,
                fontWeight: GGFontWeigh.regular,
              )),
        ),
        SizedBox(
          width: 16.dp,
        ),
        Text(
            index == 1
                ? localized('identification')
                : (index == 2
                    ? localized('change_username')
                    : localized('change_success_msg')),
            style: GGTextStyle(
              color: controller.curIndex.value >= index
                  ? GGColors.textMain.color
                  : GGColors.textSecond.color,
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.medium,
            )),
      ],
    );
  }

  Widget _buildContent(BuildContext context) {
    if (controller.curIndex.value == 1) {
      return _buildContent1();
    } else if (controller.curIndex.value == 2) {
      return _buildContent2();
    } else {
      return _buildSuccess(context);
    }
  }

  Widget _buildContent1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTip(localized('username_change_warning')),
        Gaps.vGap24,
        _buildPasswordTF(),
      ],
    );
  }

  Widget _buildContent2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildUserNameTF(),
      ],
    );
  }

  Widget _buildUserNameTF() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('username_text'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        Gaps.vGap4,
        GamingVerifyLinkWidget(
          controller: controller.userNameUser,
          targetAnchor: Alignment.bottomCenter,
          followerAnchor: Alignment.topCenter,
          popColor: GGColors.border.color,
          child: GamingTextField(
            controller: controller.userNameUser,
          ),
        ),
      ],
    );
  }

  /// 输入框
  Widget _buildPasswordTF() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('password'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        Gaps.vGap4,
        GamingPasswordTextField(
          controller: controller.password,
        ),
        Gaps.vGap4,
        Text(localized('enter_pwd'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.hint,
              fontWeight: GGFontWeigh.regular,
            )),
      ],
    );
  }

  Widget _buildSuccess(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          localized('username_change_success_title'),
          style: GGTextStyle(
            fontSize: GGFontSize.smallTitle,
            color: GGColors.textMain.color,
            fontWeight: GGFontWeigh.bold,
          ),
        ),
        Gaps.vGap36,
        Image.asset(
          R.iconBindSuccess,
          width: 92.dp,
          height: 84.dp,
          fit: BoxFit.contain,
        ),
        Gaps.vGap36,
        _buildTextSecond(localized('username_change_success_msg')),
        // Gaps.vGap36,
        // const Spacer(),
        // _buildBackBtn(context),
      ],
    );
  }

  /// 提示
  Widget _buildTip(String str, {GGFontWeigh weight = GGFontWeigh.regular}) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        vertical: 15.dp,
        horizontal: 12.dp,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFFfae9e4),
        borderRadius: BorderRadius.circular(2.dp),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GamingImage.asset(
            R.iconWarning2,
            width: 18.dp,
            color: GGColors.brand.color,
          ),
          Gaps.hGap10,
          Expanded(
            child: Text(
              str,
              style: GGTextStyle(
                color: GGColors.brand.color,
                fontSize: GGFontSize.content,
                fontWeight: weight,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTextSecond(String str) {
    return Text(str,
        style: GGTextStyle(
          color: GGColors.textSecond.color,
          fontSize: GGFontSize.content,
          fontWeight: GGFontWeigh.regular,
        ));
  }

  Widget _buildBottomStep(BuildContext context) {
    if (controller.curIndex.value == 1) {
      return SizedBox(
          width: MediaQuery.of(context).size.width,
          child: _buildNextStep(context));
    } else if (controller.curIndex.value < 3) {
      return Row(
        children: [
          SizedBox(
              width: (MediaQuery.of(context).size.width - 40.dp) / 2,
              child: _buildPreStep()),
          Gaps.hGap8,
          SizedBox(
              width: (MediaQuery.of(context).size.width - 40.dp) / 2,
              child: _buildNextStep(context)),
        ],
      );
    } else {
      return _buildBackBtn(context);
    }
  }

  /// 上一步
  Widget _buildPreStep() {
    return GestureDetector(
      onTap: controller.previousStepPressed,
      child: Container(
        padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
        height: 48.dp,
        width: double.infinity,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: GGColors.border.color,
          borderRadius: BorderRadius.all(Radius.circular(4.dp)),
        ),
        child: Text(localized('previous'),
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.regular,
            )),
      ),
    );
  }

  Widget _buildNextStep(BuildContext context) {
    return Obx(() {
      return GGButton.main(
        onPressed: _onClickNext,
        textStyle: GGTextStyle(
            fontSize: GGFontSize.content, fontWeight: GGFontWeigh.regular),
        enable: controller.enable.value,
        isLoading: controller.isLoading.value,
        text: localized('next'),
      );
    });
  }

  Widget _buildBackBtn(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).pop();
      },
      child: Container(
        padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
        height: 48.dp,
        width: double.infinity,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: GGColors.highlightButton.color,
          borderRadius: BorderRadius.all(Radius.circular(4.dp)),
        ),
        child: Text(localized('return'),
            style: GGTextStyle(
              color: GGColors.buttonTextWhite.color,
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.regular,
            )),
      ),
    );
  }

  void _onClickNext() async {
    if (controller.curIndex.value == 1) {
      controller.verifyPassword();
    } else if (controller.curIndex.value == 2) {
      controller.modifyUserName();
    }
  }
}
