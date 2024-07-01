import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/service/oauth_service/oauth_service.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/environment.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/widgets/appbar/appbar.dart';
import '../../generated/r.dart';
import '../base/base_view.dart';
import 'account_security_logic.dart';
import 'dart:math' as math;

class AccountSecurityPage extends BaseView<AccountSecurityLogic> {
  const AccountSecurityPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const AccountSecurityPage(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final view = super.build(context);
    return FocusDetector(
      child: view,
      onVisibilityGained: () => controller.onVisibilityGained(),
    );
  }

  @override
  Widget body(BuildContext context) {
    final logic = Get.put(AccountSecurityLogic());
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(16.dp, 2.dp, 16.dp, 14.dp),
            child: Column(
              children: [
                Obx(() => _securityLevelItem(
                    context,
                    localized("dual_authentication"),
                    logic.isGoogleBind.value && logic.isMobileBind.value,
                    width: MediaQuery.of(context).size.width - 60.dp)),
                Gaps.vGap8,
                Obx(() => _securityLevelItem(
                    context, localized("identification"), logic.isPassed,
                    width: MediaQuery.of(context).size.width - 60.dp)),
                Gaps.vGap8,
                Obx(() => _securityLevelItem(
                    context,
                    localized("cash_withdrawal_whitelist"),
                    logic.openWhiteList.value,
                    width: MediaQuery.of(context).size.width - 60.dp)),
              ],
            ),
          ),
          Container(
              decoration: BoxDecoration(
                  color: GGColors.alertBackground.color,
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(16.dp),
                  )),
              child: SizedBox(
                width: double.infinity,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _insetTitle(localized("dual_authentication")),
                    Obx(() {
                      final buttons = logic.isMobileBind.value
                          ? [
                              _button(localized("change_button"), context,
                                  onTap: () => logic.changeMobile()),
                            ]
                          : [
                              _button(localized("bind"), context,
                                  backgroundColor:
                                      GGColors.highlightButton.color,
                                  textStyle: GGTextStyle(
                                      fontSize: GGFontSize.smallTitle,
                                      color: GGColors.buttonTextWhite.color),
                                  onTap: () => logic.bindMobile())
                            ];
                      return _cell(
                        context,
                        R.accountPhoneVerification,
                        localized("phone_verification"),
                        localized("protect_security"),
                        [
                          _securityLevelItem(
                              context,
                              logic.mobileNumber.value.isNotEmpty
                                  ? logic.mobileNumber.value
                                  : localized("not_set"),
                              logic.isMobileBind.value,
                              textStyle: GGTextStyle(
                                color: GGColors.textMain.color,
                                fontSize: GGFontSize.content,
                                fontWeight: GGFontWeigh.bold,
                              )),
                          const Spacer(),
                          ...buttons,
                        ],
                      );
                    }),
                    Obx(() => _cell(
                          context,
                          R.accountGoogleVerification,
                          localized("google_authenticator"),
                          localized("google_authenticator_desc"),
                          [
                            _securityLevelItem(
                                context,
                                logic.isGoogleBind.value
                                    ? localized("start_using")
                                    : localized("not_set"),
                                logic.isGoogleBind.value,
                                textStyle: GGTextStyle(
                                  color: GGColors.textMain.color,
                                  fontSize: GGFontSize.content,
                                  fontWeight: GGFontWeigh.bold,
                                )),
                            const Spacer(),
                            _button(
                                logic.isGoogleBind.value
                                    ? localized("unbinding_button")
                                    : localized("bind"),
                                context,
                                backgroundColor: logic.isGoogleBind.value
                                    ? null
                                    : GGColors.highlightButton.color,
                                textStyle: logic.isGoogleBind.value
                                    ? null
                                    : GGTextStyle(
                                        fontSize: GGFontSize.smallTitle,
                                        color: GGColors.buttonTextWhite.color),
                                onTap: () => logic.isGoogleBind.value
                                    ? controller.unBindGoogle()
                                    : controller.bindGoogle()),
                          ],
                        )),
                    Obx(() => _cell(
                          context,
                          R.iconNoEmailCode,
                          localized("email_verify"),
                          localized("protect_security"),
                          [
                            _securityLevelItem(
                                context,
                                logic.isEmailBind.value
                                    ? controller.getEncryptEmail()
                                    : localized("unbind"),
                                logic.isEmailBind.value,
                                textStyle: GGTextStyle(
                                  color: GGColors.textMain.color,
                                  fontSize: GGFontSize.content,
                                  fontWeight: GGFontWeigh.bold,
                                )),
                            const Spacer(),
                            _button(
                                logic.isEmailBind.value
                                    ? localized("unbinding_button")
                                    : localized("bind"),
                                context,
                                backgroundColor: logic.isEmailBind.value
                                    ? null
                                    : GGColors.highlightButton.color,
                                textStyle: logic.isEmailBind.value
                                    ? null
                                    : GGTextStyle(
                                        fontSize: GGFontSize.smallTitle,
                                        color: GGColors.buttonTextWhite.color),
                                onTap: () => logic.isEmailBind.value
                                    ? controller.unBindEmail()
                                    : controller.bindEmail()),
                          ],
                        )),
                    _buildSocial(context),
                    _insetTitle(localized("adv_settings")),
                    Obx(() {
                      return _cell(
                        context,
                        R.accountModifyUserName,
                        localized("change_username"),
                        localized("username_change_desc"),
                        [
                          _securityLevelItem(
                            context,
                            logic.userName.value,
                            logic.userName.value.isNotEmpty,
                            textStyle: GGTextStyle(
                              color: GGColors.textMain.color,
                              fontSize: GGFontSize.content,
                              fontWeight: GGFontWeigh.bold,
                            ),
                          ),
                          const Spacer(),
                          _button(
                            localized("change_button"),
                            context,
                            onTap: logic.changeUserName,
                          ),
                        ],
                      );
                    }),
                    Obx(() {
                      return _cell(
                        context,
                        R.accountModifyPassword,
                        localized("login_password"),
                        localized("manage_password"),
                        [
                          const Spacer(),
                          _button(
                              controller.hasPassword.value
                                  ? localized("change_button")
                                  : localized("setting"),
                              context,
                              onTap: () => controller.hasPassword.value
                                  ? logic.changePassword()
                                  : logic.setPassword()),
                        ],
                      );
                    }),
                    Obx(() => _cell(
                          context,
                          R.accountIdentityVerification,
                          localized("id_ver"),
                          localized("protect_security"),
                          [
                            _securityLevelItem(
                                context, _kycTypeStr(), _kycTypeStr() != '',
                                textStyle: GGTextStyle(
                                  color: GGColors.textMain.color,
                                  fontSize: GGFontSize.content,
                                  fontWeight: GGFontWeigh.bold,
                                )),
                            const Spacer(),
                            _button(localized("verification"), context,
                                onTap: () => logic.verification()),
                          ],
                        )),
                    Obx(() => _cell(
                            context,
                            R.accountWithdrawalWhitelist,
                            localized("cash_withdrawal_whitelist"),
                            localized("whitelisting_info"), [
                          _securityLevelItem(
                              context,
                              logic.openWhiteList.value
                                  ? localized("opened")
                                  : localized("closed"),
                              logic.openWhiteList.value,
                              textStyle: GGTextStyle(
                                color: GGColors.textMain.color,
                                fontSize: GGFontSize.content,
                                fontWeight: GGFontWeigh.bold,
                              )),
                          const Spacer(),
                          _button(
                              logic.openWhiteList.value
                                  ? localized("off_button")
                                  : localized("enable_button"),
                              context,
                              onTap: () => logic.changeWhiteListStatus()),
                        ],
                            topChildren: [
                              Gaps.hGap16,
                              ScaleTap(
                                onPressed: () => logic.adressManager(),
                                opacityMinValue: 0.8,
                                scaleMinValue: 0.98,
                                child: Text(
                                  localized("address_management"),
                                  style: GGTextStyle(
                                    color: GGColors.brand.color,
                                    fontSize: GGFontSize.content,
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              )
                            ])),
                    if (Config.sharedInstance.environment.allowBiometrics)
                      Obx(
                        () {
                          return _cell(
                            context,
                            R.accountBiometric,
                            localized("biometric"),
                            'Touch ID / Face ID',
                            [
                              _securityLevelItem(
                                  context,
                                  logic.openBiometric.value
                                      ? localized("biometric_on")
                                      : localized("biometric_off"),
                                  logic.openBiometric.value,
                                  textStyle: GGTextStyle(
                                    color: GGColors.textMain.color,
                                    fontSize: GGFontSize.content,
                                    fontWeight: GGFontWeigh.bold,
                                  )),
                              const Spacer(),
                              _button(
                                localized("management"),
                                context,
                                onTap: _onBiometricManagementPressed,
                              ),
                            ],
                          );
                        },
                      ),
                    _insetTitle(localized("account_activity")),
                    _cell(
                      context,
                      R.accountDeviceManager,
                      localized("device_management"),
                      localized("allowed_device"),
                      [
                        const Spacer(),
                        _button(
                          localized("management"),
                          context,
                          onTap: _onDeviceManagementPressed,
                        ),
                      ],
                    ),
                    _cell(
                      context,
                      R.accountAccountActivity,
                      localized("account_activity"),
                      '${localized("last_login")}: ${controller.lastLoginTime == null ? '-' : DateFormat('yyyy-MM-dd HH:mm:ss').formatTimestamp(controller.lastLoginTime! * 1000)}',
                      [
                        const Spacer(),
                        _button(
                          localized("more_text"),
                          context,
                          onTap: _onAccountActivityPressed,
                        ),
                      ],
                    ),
                    SafeArea(
                      bottom: true,
                      minimum: EdgeInsets.only(bottom: 24.dp),
                      child: Gaps.empty,
                    ),
                  ],
                ),
              ))
        ],
      ),
    );
  }

  Widget _buildSocial(BuildContext context) {
    return Obx(
      () {
        final didBindSocial =
            controller.socialList.value.socialInfoList?.isNotEmpty == true;
        return Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _insetTitle(localized("third_login")),
            if (didBindSocial)
              ...controller.socialList.value.socialInfoList!
                  .map((e) => _cell(
                        context,
                        SocialType.c(e.socialUserType ?? '').iconUrl,
                        e.socialUserType ?? '',
                        '',
                        [
                          _securityLevelItem(context,
                              e.socialUserName ?? localized('unbind'), e.isBind,
                              textStyle: GGTextStyle(
                                color: GGColors.textMain.color,
                                fontSize: GGFontSize.content,
                                fontWeight: GGFontWeigh.bold,
                              )),
                          const Spacer(),
                          _button(
                            e.isBind
                                ? localized("unbinding_button")
                                : localized('bind'),
                            context,
                            backgroundColor: e.isBind
                                ? null
                                : GGColors.highlightButton.color,
                            textStyle: e.isBind
                                ? null
                                : GGTextStyle(
                                    fontSize: GGFontSize.smallTitle,
                                    color: GGColors.buttonTextWhite.color),
                            onTap: () => e.isBind
                                ? controller.unBindSocial(e)
                                : controller.bindSocial(e),
                          ),
                        ],
                      ))
                  .toList(),
          ],
        );
      },
    );
  }

  String _kycTypeStr() {
    if (controller.isAdvancePassed) {
      return localized('ad_ceri');
    } else if (controller.isIntermediatePassed) {
      return localized('inter_ceri');
    } else if (controller.isPrimaryPassed) {
      return localized('pri_ceri');
    } else {
      return '';
    }
  }

  Widget _insetTitle(String title) {
    return Padding(
      padding: EdgeInsets.only(left: 16.dp, top: 24.dp),
      child: Text(
        title,
        style: GGTextStyle(
          color: GGColors.textMain.color,
          fontSize: GGFontSize.bigTitle20,
          fontWeight: GGFontWeigh.bold,
        ),
      ),
    );
  }

  Widget _button(String title, BuildContext context,
      {GestureTapCallback? onTap,
      Color? backgroundColor,
      GGTextStyle? textStyle}) {
    return SizedBox(
      width: controller.locale.languageCode.contains('zh') ? 80.dp : 120.dp,
      height: 42.dp,
      child: GGButton.minor(
        onPressed: () {
          onTap?.call();
        },
        text: title,
        textStyle: textStyle,
        backgroundColor: backgroundColor ?? GGColors.border.color,
      ),
    );
  }

  Widget _inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 16.dp,
        end: end ?? 16.dp,
      ),
      child: child,
    );
  }

  Widget _cell(BuildContext context, String icon, String title, String content,
      List<Widget> children,
      {List<Widget>? topChildren}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 16.dp),
        _inset(Row(
          children: [
            icon.contains('.svg')
                ? SvgPicture.asset(
                    icon,
                    width: 22.dp,
                    height: 22.dp,
                  )
                : Image.asset(
                    icon,
                    width: 22.dp,
                    height: 22.dp,
                  ),
            SizedBox(width: 8.dp),
            Container(
              constraints: BoxConstraints(
                  maxWidth: topChildren == null
                      ? (MediaQuery.of(context).size.width - 50.dp)
                      : (MediaQuery.of(context).size.width - 50.dp) / 2),
              child: Text(
                title,
                style: GGTextStyle(
                  color: GGColors.textMain.color,
                  fontSize: GGFontSize.smallTitle,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
            ),
            ...?topChildren
          ],
        )),
        if (content.isNotEmpty) ...[
          SizedBox(height: 10.dp),
          _inset(
            Text(
              content,
              style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content,
                fontWeight: GGFontWeigh.regular,
              ),
            ),
            start: 46.dp,
          ),
        ],
        SizedBox(height: 16.dp),
        _inset(
          Row(
            children: children,
          ),
          start: 46.dp,
        ),
        SizedBox(height: 16.dp),
        _inset(Container(
          color: GGColors.border.color,
          height: 1.dp,
        ))
      ],
    );
  }

  Widget _securityLevelItem(BuildContext context, String title, bool meet,
      {double width = 0, TextStyle? textStyle}) {
    return Row(
      children: [
        Image.asset(
          meet ? R.commonCheckRound : R.commonUncheckRound,
          width: 18.dp,
          height: 18.dp,
        ),
        SizedBox(width: 8.dp),
        Container(
          constraints: BoxConstraints(
              maxWidth: math.max(
                  (MediaQuery.of(context).size.width - 50.dp) / 2, width)),
          child: Text(
            title,
            maxLines: 2,
            // overflow: TextOverflow.ellipsis,
            style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular,
            ).merge(textStyle),
          ),
        )
      ],
    );
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) =>
      GGAppBar.userBottomAppbar(title: localized("account_security"));
}

extension _Action on AccountSecurityPage {
  void _onDeviceManagementPressed() {
    Get.toNamed<void>(Routes.deviceManagement.route);
  }

  void _onAccountActivityPressed() {
    Get.toNamed<void>(Routes.accountActivity.route);
  }

  void _onBiometricManagementPressed() {
    Get.toNamed<void>(Routes.biometricManagement.route);
  }
}
