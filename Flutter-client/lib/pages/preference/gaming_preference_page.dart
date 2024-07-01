// ignore_for_file: dead_code

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/header/gg_user_app_bar_controller.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/preference/gaming_preference_logic.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingPreferencePage extends BaseView<GamingPreferenceLogic> {
  const GamingPreferencePage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const GamingPreferencePage(),
    );
  }

  GGUserAppBarController get userAppController =>
      Get.find<GGUserAppBarController>();

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) =>
      GGAppBar.userBottomAppbar(
        title: localized("settings"),
        trailingWidgets: [
          Image.asset(
            R.preferencesPreference,
            height: 36.dp,
            fit: BoxFit.fitHeight,
          ),
          Gaps.hGap18,
        ],
      );

  @override
  Widget body(BuildContext context) {
    Get.put(GamingPreferenceLogic());
    return SingleChildScrollView(
      child: Column(
        children: [
          Container(
            decoration: BoxDecoration(
                color: GGColors.darkPopBackground.color,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(16.dp),
                )),
            padding: EdgeInsets.only(
              left: 16.dp,
              right: 16.dp,
              top: 24.dp,
            ),
            width: double.infinity,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildMyProfile(context),
                _profileSetting(context),
                _profileNotice(context),
                Gaps.vGap20,
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// 标题
  Widget _buildTitleWidget(String title) {
    return Container(
      width: double.infinity,
      alignment: Alignment.centerLeft,
      child: Text(title,
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle20,
            color: GGColors.textMain.color,
            fontFamily: GGFontFamily.dingPro,
          )),
    );
  }

  Widget _buildExplainWidget(BuildContext context, bool isChoose, String str) {
    return SizedBox(
      child: Row(
        children: [
          SvgPicture.asset(
            isChoose ? R.preferencesSelected : R.preferencesNoSelected,
            width: 18.dp,
            height: 18.dp,
            color: isChoose ? GGColors.success.color : GGColors.iconHint.color,
          ),
          Gaps.hGap8,
          SizedBox(
            child: Text(
              str,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontFamily: GGFontFamily.dingPro,
              ),
              maxLines: 2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoticeExplainWidget(
      BuildContext context, bool isChoose, String str) {
    return SizedBox(
      child: Row(
        children: [
          SvgPicture.asset(
            isChoose ? R.preferencesSelected : R.preferencesNoSelected,
            width: 18.dp,
            height: 18.dp,
            color: isChoose ? GGColors.success.color : GGColors.iconHint.color,
          ),
          Gaps.hGap8,
          SizedBox(
            width: MediaQuery.of(context).size.width - 90.dp,
            child: Text(
              str,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontFamily: GGFontFamily.dingPro,
              ),
              maxLines: 2,
            ),
          ),
        ],
      ),
    );
  }

  /// 管理
  Widget _buildManagerWidget(VoidCallback onPressed) {
    return SizedBox(
      child: GGButton.minor(
        onPressed: onPressed,
        text: localized('manage_button'),
        backgroundColor: GGColors.border.color,
        textStyle: GGTextStyle(fontSize: GGFontSize.content),
        height: 42.dp,
        // width: 80.dp,
      ),
    );
  }

  Widget _buildItem(
      BuildContext context, String icon, String title, String content) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Image.asset(
          icon,
          width: 22.dp,
          height: 22.dp,
        ),
        Gaps.hGap10,
        SizedBox(
          width: MediaQuery.of(context).size.width - 64.dp,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(localized(title),
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    color: GGColors.textMain.color,
                    fontFamily: GGFontFamily.dingPro,
                  )),
              Gaps.vGap4,
              Text(
                localized(content),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                  fontFamily: GGFontFamily.dingPro,
                ),
                maxLines: 2,
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// 我的个人资料
  Widget _buildMyProfile(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTitleWidget(localized('profile')),
        Gaps.vGap16,
        _buildAvatarWidget(context),
        _buildDefaultLanguage(context),
        _buildDefaultCurrency(context),
        _buildInvisibilityMode(context),
      ],
    );
  }

  Widget _buildAvatarWidget(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildItem(
            context, R.preferencesProfileIcon, 'avatar', 'select_pro_local'),
        Gaps.vGap16,
        Container(
          padding: EdgeInsets.only(left: 30.dp),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildAvatar(),
              const Spacer(),
              _buildManagerWidget(_onClickModifyAvatar),
            ],
          ),
        ),
        Gaps.vGap16,
        Gaps.line,
      ],
    );
  }

  /// 头像
  Widget _buildAvatar() {
    return Obx(() {
      final avatar = !userAppController.isLogin.value
          ? Container(
              width: 30.dp,
              height: 30.dp,
              alignment: AlignmentDirectional.center,
              child: Image.asset(
                R.appbarUnloginAvatar,
                width: 18.dp,
                height: 18.dp,
                color: GGColors.textMain.color,
              ),
            )
          : buildCustomAvatar(30.dp, 30.dp);
      return avatar;
    });
  }

  Widget buildCustomAvatar(double width, double height) {
    return AccountService.sharedInstance.buildCustomAvatar(width, height);
  }

  /// 默认语言
  Widget _buildDefaultLanguage(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap16,
        _buildItem(
            context, R.preferencesProfileLanguage, 'de_lang', 'lang_tip'),
        Gaps.vGap16,
        Container(
          padding: EdgeInsets.only(left: 30.dp),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildExplainWidget(
                  context, true, controller.currentLanguage.value),
              _buildManagerWidget(_pressChangeLanguage),
            ],
          ),
        ),
        Gaps.vGap16,
        Gaps.line,
      ],
    );
  }

  /// 默认币种
  Widget _buildDefaultCurrency(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap16,
        _buildItem(context, R.preferencesProfileCurrency, 'default_currency',
            'default_currency_text'),
        Gaps.vGap16,
        Container(
          padding: EdgeInsets.only(left: 30.dp),
          child: Obx(() {
            return Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Row(
                  children: [
                    GamingImage.network(
                      url: controller.selectedIconUrl,
                      width: 18.dp,
                      height: 18.dp,
                    ),
                    Gaps.hGap8,
                    Text(controller.selectedCurrencyStr,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                          fontFamily: GGFontFamily.dingPro,
                        )),
                  ],
                ),
                const Spacer(),
                _buildManagerWidget(controller.selectCurrency),
              ],
            );
          }),
        ),
        Gaps.vGap16,
        Gaps.line,
      ],
    );
  }

  /// 隐身模式
  Widget _buildInvisibilityMode(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap16,
        _buildItem(context, R.preferencesProfileInvisibilityMode,
            'invisible_mode', 'invisible_desc'),
        Gaps.vGap16,
        Container(
          padding: EdgeInsets.only(left: 30.dp),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Obx(() {
                return _buildExplainWidget(context, true,
                    localized(controller.invisibilityModeStr.value));
              }),
              const Spacer(),
              _buildManagerWidget(_onClickInvisibilityMode),
            ],
          ),
        ),
        Gaps.vGap16,
        Gaps.line,
      ],
    );
  }

  /// 偏好设置
  Widget _profileSetting(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap24,
        _buildTitleWidget(localized('settings')),
        Gaps.vGap16,
        _buildSettingWidget(context),
      ],
    );
  }

  /// 抵用金设置
  Widget _buildSettingWidget(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildItem(context, R.preferencesProfileCredit, 'setting_coupon',
            'coupon_for_tip'),
        Gaps.vGap16,
        Container(
          padding: EdgeInsets.only(left: 30.dp),
          child: Obx(() {
            return Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildExplainWidget(
                    context,
                    controller.isEnableCredit.value,
                    controller.isEnableCredit.value
                        ? localized('coupon_content')
                        : localized('no_coupon_content')),
                const Spacer(),
                Obx(() {
                  return controller.isChangeCreditLoading.value
                      ? ThreeBounceLoading(
                          dotColor: GGColors.highlightButton.color,
                          dotSize: 15.dp,
                        )
                      : CupertinoSwitch(
                          value: controller.isEnableCredit.value, //当前状态
                          activeColor: GGColors.highlightButton.color,
                          trackColor: GGColors.border.color,
                          onChanged: (value) {
                            controller.modifyCredit();
                          },
                        );
                }),
              ],
            );
          }),
        ),
        Gaps.vGap16,
        Gaps.line,
      ],
    );
  }

  /// 通知设置
  Widget _profileNotice(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap24,
        _buildTitleWidget(localized('noti_set')),
        Gaps.vGap16,
        _buildNoticeLanguage(context),
        _buildNotice(context),
      ],
    );
  }

  /// 通知语言
  Widget _buildNoticeLanguage(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildItem(
            context, R.preferencesProfileLanguage, 'noti_lang', 'noti_tip'),
        Gaps.vGap16,
        Container(
          padding: EdgeInsets.only(left: 30.dp),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Obx(() {
                return _buildExplainWidget(
                    context, true, controller.currentNoticeLanguage.value);
              }),
              _buildManagerWidget(_pressChangeNoticeLanguage),
            ],
          ),
        ),
        Gaps.vGap16,
        Gaps.line,
      ],
    );
  }

  /// 站内信
  Widget _buildNotice(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap16,
        _buildItem(
            context, R.preferencesProfileNotice, 'insite_noti', 'noti_set_tip'),
        Gaps.vGap16,
        Container(
          padding: EdgeInsets.only(left: 30.dp),
          child: Obx(() {
            return _buildNoticeExplainWidget(
                context,
                controller.curNoticeStr.value.isNotEmpty,
                controller.curNoticeStr.value.isNotEmpty
                    ? controller.curNoticeStr.value
                    : localized('not_set'));
          }),
        ),
        Gaps.vGap16,
        Row(
          children: [
            const Spacer(),
            _buildManagerWidget(_onClickNotification),
          ],
        ),
        Gaps.vGap16,
        Gaps.line,
      ],
    );
  }
}

extension _Action on GamingPreferencePage {
  void _onClickModifyAvatar() {
    Get.toNamed<dynamic>(Routes.modifyAvatar.route);
  }

  void _onClickNotification() {
    Get.toNamed<dynamic>(Routes.preferenceNotificationTip.route);
  }

  void _onClickInvisibilityMode() {
    Get.toNamed<dynamic>(Routes.preferenceInvisibilityMode.route);
  }

  /// 切换语言
  void _pressChangeLanguage() {
    controller.pressSetLanguage(onSucessCallBack: () {
      _showSheet(
        localized("language_select"),
        controller.optionalLanguages,
        controller.currentLanguage.value,
        (content) {
          controller.changeLanguage(content);
        },
      );
    });
  }

  void _showSheet(
    String title,
    List<String> contentList,
    String currentSelect,
    void Function(String content) selectContent,
  ) {
    GamingSelector.simple<String>(
      title: title,
      useCloseButton: false,
      centerTitle: true,
      fixedHeight: false,
      original: contentList,
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () {
            if (e == currentSelect) {
              return;
            }
            selectContent.call(e);
          },
          child: SizedBox(
            height: 50.dp,
            child: Center(
              child: Text(
                e,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: e.toLowerCase() == currentSelect.toLowerCase()
                      ? GGColors.highlightButton.color
                      : GGColors.textMain.color,
                  fontWeight: GGFontWeigh.regular,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  /// 切换通知语言
  void _pressChangeNoticeLanguage() {
    _showSheet(
      localized("language_select"),
      controller.optionalLanguages,
      controller.currentNoticeLanguage.value,
      (content) {
        controller.changeNoticeLanguage(content);
        Navigator.of(Get.overlayContext!).pop();
      },
    );
  }
}
