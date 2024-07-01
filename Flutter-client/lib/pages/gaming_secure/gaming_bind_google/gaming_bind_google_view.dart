// ignore_for_file: unused_element

import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/svg.dart';
import 'package:gogaming_app/common/api/auth/models/verify_action.dart';
import 'package:gogaming_app/common/api/base/base_api.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/lang/locale_lang.dart';
import 'package:gogaming_app/common/theme/colors/go_gaming_colors.dart';
import 'package:gogaming_app/common/theme/text_styles/gg_text_styles.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/common/widgets/go_gaming_loading.dart';
import 'package:gogaming_app/common/widgets/mobile_verification_code/mobile_verification_code_widget.dart';
import 'package:gogaming_app/config/gaps.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import 'gaming_bind_google_logic.dart';

class GamingBindGooglePage extends BaseView<GamingBindGoogleLogic> {
  const GamingBindGooglePage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const GamingBindGooglePage(),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(GamingBindGoogleLogic());
    return _contentWidget(context);
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(title: localized('bind_google'));
  }

  Widget _contentWidget(BuildContext context) {
    return Container(
      width: double.infinity,
      color: GGColors.background.color,
      child: Obx(() {
        return SingleChildScrollView(
          child: Container(
            height:
                MediaQuery.of(context).size.height - 115.dp - Util.bottomMargin,
            padding: EdgeInsets.only(left: 16.dp, top: 24.dp, right: 16.dp),
            child: Column(
              children: [
                _buildSteps(),
                Gaps.vGap38,
                _buildContent(context),
                const Spacer(),
                _buildBottomStep(context),
                Gaps.vGap24,
              ],
            ),
          ),
        );
      }), //GGColors.popBackground.color, // Colors.red, //
    );
  }

  void _onClickNext() async {
    if (controller.user.isBindGoogleValid ?? false) {
      Toast.showMessage(
          context: Get.overlayContext!,
          state: GgToastState.fail,
          message: localized('auth_bound'));
      return;
    }
    if (controller.curIndex.value < 4) {
      controller.curIndex.value++;
      return;
    }

    if (controller.curIndex.value == 4) {
      /// 验证密码
      controller.bindGoogle();
    }
  }

  Widget _buildContent(BuildContext context) {
    if (controller.curIndex.value == 1) {
      return _buildContentStep1();
    } else if (controller.curIndex.value == 2) {
      return _buildContentStep2();
    } else if (controller.curIndex.value == 3) {
      return _buildContentStep3();
    } else if (controller.curIndex.value == 4) {
      return _buildContentStep4();
    } else {
      return _buildSuccess(context);
    }
  }

  Widget _buildSuccess(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildTip(localized('auth_bound')),
        Gaps.vGap36,
        Image.asset(
          R.iconBindSuccess,
          width: 92.dp,
          height: 84.dp,
          fit: BoxFit.contain,
        ),
        Gaps.vGap36,
        _buildTextSecond(localized('bound_account_success')),
      ],
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

  Widget _firstCodeWidget() {
    if (controller.isBindMobile.value) {
      return _buildOpt();
    } else {
      return _buildPasswordTF();
    }
  }

  /// 手机验证码
  Widget _buildOpt() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('p_code'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            )),
        Gaps.vGap4,
        MobileVerificationCodeWidget(
          controller.mobileOpt,
          VerifyAction.bindGoogleVerify,
          isVoice: controller.isVoice,
          fullMobile: controller.fullMobileNo,
          onStatusChanged: controller.onVerificationStatusChanged,
        ),
      ],
    );
  }

  Widget _buildContentStep1() {
    return Column(
      children: [
        _buildTip(localized('down_auth')),
        Gaps.vGap36,
        _buildDownLoadWidget(),
        Gaps.vGap56,
        _buildHowToUseGoogleVerify(),
      ],
    );
  }

  Widget _buildContentStep2() {
    return Column(
      children: [
        _buildTip(localized('scan_auth')),
        Gaps.vGap24,
        _qrImage(),
        Gaps.vGap24,
        _buildSecretKey(),
        Gaps.vGap24,
        Text(
          localized('manually_enter'),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.regular,
          ),
          maxLines: 2,
        ),
      ],
    );
  }

  Widget _buildContentStep3() {
    return Column(
      children: [
        _buildTip(localized('bp_safe')),
        Gaps.vGap36,
        Image.asset(
          R.accountBackupInstructionsIcon,
          width: 72.dp,
          height: 72.dp,
          fit: BoxFit.contain,
        ),
        Gaps.vGap28,
        _buildSecretKey(),
        Gaps.vGap28,
        Text(
          localized('key_info'),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.content,
            fontWeight: GGFontWeigh.regular,
          ),
          maxLines: 2,
        ),
      ],
    );
  }

  Widget _buildContentStep4() {
    return Column(
      children: [
        _buildTip(localized('veri_acc')),
        Gaps.vGap24,
        _firstCodeWidget(),
        Gaps.vGap16,
        _buildGoogleVerifyTF(),
      ],
    );
  }

  /// 二维码
  Widget _qrImage() {
    if (controller.googleInfo != null &&
        controller.googleInfo!.qrCodeImageUrl.isEmpty) {
      return Container(
        width: 121.dp,
        height: 121.dp,
        alignment: Alignment.center,
        child: GoGamingLoading(
          size: 30.dp,
        ),
      );
    }

    return Container(
      padding: EdgeInsets.all(12.dp),
      decoration: BoxDecoration(
        color: GGColors.border.color,
        borderRadius: BorderRadius.circular(5.dp),
      ),
      child: QrImage(
        data: controller.getGoogleInfoQRStr(),
        size: 105.dp,
        backgroundColor: GGColors.buttonTextWhite.color,
        padding: EdgeInsets.all(0.dp),
      ),
    );
  }

  /// 秘钥以及复制
  Widget _buildSecretKey() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          constraints: BoxConstraints(maxWidth: 300.dp),
          child: Text(
              controller.googleInfo?.manualEntryKey ??
                  localized('get_google_key_ing'),
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.smallTitle,
                fontWeight: GGFontWeigh.bold,
              ),
              maxLines: 2,
              textAlign: TextAlign.center),
        ),
        Gaps.hGap8,
        GestureDetector(
          onTap: () {
            onCopy();
          },
          child: SvgPicture.asset(
            R.accountCopyIcon,
            width: 18.dp,
            height: 18.dp,
            color: GGColors.textSecond.color,
            fit: BoxFit.contain,
          ),
        ),
      ],
    );
  }

  void onCopy() {
    Clipboard.setData(ClipboardData(
      text: controller.googleInfo?.manualEntryKey ??
          localized('get_google_key_ing'),
    ));
    Toast.showMessage(
      context: Get.overlayContext!,
      state: GgToastState.success,
      message: localized('copy_succe'),
    );
  }

  Future<void> goAppStore() async {
    String url =
        "https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2";
    if (Platform.isIOS) {
      url =
          "https://apps.apple.com/sg/app/google-authenticator/id388497605?l=zh";
    }
    Uri uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      throw "Could not launch $url";
    }
  }

  /// 下载指示
  Widget _buildDownLoadWidget() {
    if (Platform.isIOS) {
      return GestureDetector(
        onTap: () {
          /// 跳转下载
          goAppStore();
        },
        child: Container(
          color: Colors.transparent,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SvgPicture.asset(
                R.accountAppleLogo,
                width: 30.dp,
                height: 30.dp,
                color: GGColors.textMain.color,
                fit: BoxFit.contain,
              ),
              Gaps.vGap20,
              Text('App Store',
                  style: GGTextStyle(
                    color: GGColors.textMain.color,
                    fontSize: GGFontSize.smallTitle,
                    fontWeight: GGFontWeigh.medium,
                  )),
            ],
          ),
        ),
      );
    } else {
      return GestureDetector(
        onTap: () {
          /// 跳转的web下载安卓
          goAppStore();
        },
        child: Container(
          color: Colors.transparent,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SvgPicture.asset(
                R.accountAndroidApkLogo,
                width: 30.dp,
                height: 30.dp,
                color: GGColors.textMain.color,
                fit: BoxFit.contain,
              ),
              Gaps.vGap20,
              Text('Google Authenticator',
                  style: GGTextStyle(
                    color: GGColors.textMain.color,
                    fontSize: GGFontSize.smallTitle,
                    fontWeight: GGFontWeigh.medium,
                  )),
            ],
          ),
        ),
      );
    }
  }

  Widget _buildHowToUseGoogleVerify() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SvgPicture.asset(
          R.accountInstructionsForUse,
          width: 18.dp,
          height: 18.dp,
          color: GGColors.textSecond.color,
          fit: BoxFit.contain,
        ),
        Gaps.hGap16,
        GestureDetector(
          onTap: () {
            controller.onClickUseAuth();
          },
          child: Text(
            localized('use_auth'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildNextStep() {
    return GGButton.main(
      onPressed: () {
        /// 点击下一步
        if (!_enableNext()) return;
        _onClickNext();
      },
      text: localized('next'),
      enable: _enableNext(),
    );
  }

  /// 上一步
  Widget _buildPreStep() {
    return GGButton.minor(
      onPressed: () {
        /// 点击上一步
        controller.curIndex.value--;
      },
      text: localized('previous'),
    );
  }

  Widget _buildBottomStep(BuildContext context) {
    if (controller.curIndex.value == 1) {
      return SizedBox(
          width: MediaQuery.of(context).size.width, child: _buildNextStep());
    } else if (controller.curIndex.value < 5) {
      return Row(
        children: [
          SizedBox(
              width: (MediaQuery.of(context).size.width - 40.dp) / 2,
              child: _buildPreStep()),
          Gaps.hGap8,
          SizedBox(
              width: (MediaQuery.of(context).size.width - 40.dp) / 2,
              child: _buildNextStep()),
        ],
      );
    } else {
      return _buildBackBtn(context);
    }
  }

  /// 返回
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

  /// 能否点击下一步
  bool _enableNext() {
    if (controller.curIndex.value < 4) {
      return true;
    } else {
      if (controller.isBindMobile.value) {
        return controller.googleVerifyController.text.isNotEmpty &&
            controller.mobileOpt.text.isNotEmpty;
      } else {
        return controller.googleVerifyController.text.isNotEmpty &&
            controller.passwordController.text.isNotEmpty;
      }
    }
  }

  /// 密码输入框
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
        SizedBox(
          height: 4.dp,
        ),
        GamingPasswordTextField(
          controller: controller.passwordController,
        ),
        SizedBox(
          height: 3.dp,
        ),
        Text(localized('enter_pwd'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.hint,
              fontWeight: GGFontWeigh.regular,
            )),
      ],
    );
  }

  /// 谷歌验证码
  Widget _buildGoogleVerifyTF() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(localized('google_code'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.medium,
            )),
        SizedBox(
          height: 4.dp,
        ),
        GamingPasswordTextField(
          controller: controller.googleVerifyController,
        ),
        SizedBox(
          height: 3.dp,
        ),
        Text(localized('enter_google_code'),
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.hint,
              fontWeight: GGFontWeigh.regular,
            )),
      ],
    );
  }

  /// 提示
  Widget _buildTip(String str) {
    return Container(
      alignment: Alignment.center,
      child: Text(str,
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.smallTitle,
            fontWeight: GGFontWeigh.regular,
          )),
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
        _buildStep(3),
        Gaps.vGap4,
        verticalLine(3),
        Gaps.vGap4,
        _buildStep(4),
        Gaps.vGap4,
        verticalLine(4),
        Gaps.vGap4,
        _buildStep(5),
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
        Text(getStepStr(index),
            style: GGTextStyle(
              color: controller.curIndex.value >= index
                  ? GGColors.textMain.color
                  : GGColors.textSecond.color,
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.regular,
            )),
      ],
    );
  }

  String getStepStr(int index) {
    switch (index) {
      case 1:
        return localized('download_app');
      case 2:
        return localized('scan_qr');
      case 3:
        return localized('bp_key');
      case 4:
        return localized('bind_google');
      default:
        return localized('successful');
    }
  }

  Widget _buildTitle(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 16.dp,
        ),
        GestureDetector(
          onTap: () {
            Navigator.of(context).pop();
          },
          child: SvgPicture.asset(
            R.iconAppbarLeftLeading,
            width: 18.dp,
            height: 18.dp,
            color: GGColors.textMain.color,
            fit: BoxFit.contain,
          ),
        ),
        SizedBox(
          width: 2.dp,
        ),
        Text(localized('bound_phone'),
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.bigTitle20,
              fontWeight: GGFontWeigh.regular,
            )),
      ],
    );
  }
}
