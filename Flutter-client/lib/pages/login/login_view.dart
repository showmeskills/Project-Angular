import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/oauth_service/oauth_service.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';

import '../../common/widgets/appbar/appbar.dart';
import '../../widget_header.dart';
import 'login_logic.dart';
import 'login_state.dart';
import 'views/login_account_view.dart';
import 'views/login_mobile_view.dart';
// ignore: unused_import
import 'views/login_email_view.dart';

class LoginPage extends BaseView<LoginLogic> {
  const LoginPage({Key? key}) : super(key: key);

  LoginState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const LoginPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(backgroundColor: GGColors.loginBackground.color);
  }

  @override
  Color? backgroundColor() {
    return GGColors.loginBackground.color;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(LoginLogic());
    controller.context = context;
    return Obx(() {
      return Transform.translate(
        offset: Offset(0, -state.offsetY.value),
        child: Column(
          mainAxisSize: MainAxisSize.max,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 60.dp),
            inset(_buildTitle1()),
            SizedBox(height: 16.dp),
            inset(_buildTitle2()),
            SizedBox(height: 32.dp),
            inset(_buildTabBar(), start: 24.dp),
            Expanded(child: _buildTabBarView()),
          ],
        ),
      );
    });
  }

  List<Widget> _buildFooter() {
    return [
      _buildLoginButton(),
      SizedBox(height: 24.dp),
      _buildAutoLoginRow(),
      _buildRegister(),
      OAuthView(
        onPressed: (p0) {
          onSocialLogin(p0);
        },
      ),
      Gaps.vGap20,
    ];
  }

  Widget _buildRegister() {
    return ScaleTap(
      scaleMinValue: 1.0,
      opacityMinValue: 0.8,
      onPressed: _onRegister,
      child: Padding(
        padding: EdgeInsetsDirectional.only(top: 24.dp, end: 20.dp),
        child: Text(
          localized('register_now_button'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.link.color,
          ),
        ),
      ),
    );
  }

  Widget _buildAutoLoginRow() {
    return Row(
      children: [
        InkWell(
          highlightColor: Colors.transparent, // 长按时的扩散效果设置为透明
          onTap: _onAutoLogin,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Obx(() {
                return IgnorePointer(
                  child: GamingCheckBox(
                    value: controller.isAutoLogin,
                    size: 18.dp,
                    onChanged: (v) {},
                    activeColor: GGColors.brand.color,
                  ),
                );
              }),
              SizedBox(width: 5.dp),
              Text(
                localized('remember_password'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
        ),
        const Spacer(),
        InkWell(
          onTap: _onForgotPassword,
          child: Text(
            '${localized('forgot_password')}?',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.brand.color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLoginButton() {
    return Row(
      children: [
        Expanded(
          child: Obx(() {
            return GGButton.main(
              onPressed: _onLogin,
              text: localized('login_button'),
              enable: state.isEnableLogin.value,
              isLoading: controller.isLoginLoading.value,
            );
          }),
        ),
      ],
    );
  }

  Widget _buildTabBarView() {
    return TabBarView(
      controller: controller.tabController,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        KeepAliveWrapper(
          child: LoginAccountView(
            account: state.account,
            accountPassword: state.accountPassword,
            buildFooter: _buildFooter(),
            isRequesting: controller.isLoginLoading,
          ),
        ),
        KeepAliveWrapper(
          child: LoginMobileView(
            mobile: state.mobile,
            mobilePassword: state.mobilePassword,
            selectCountry: state.country,
            onCountryChanged: controller.onCountryChanged,
            buildFooter: _buildFooter(),
            isRequesting: controller.isLoginLoading,
          ),
        ),
        KeepAliveWrapper(
          child: LoginEmailView(
            email: state.email,
            emailPassword: state.emailPassword,
            buildFooter: _buildFooter(),
            isRequesting: controller.isLoginLoading,
          ),
        ),
      ],
    );
  }

  Widget _buildTabBar() {
    return Obx(() {
      final index = controller.index.value;
      final titles = [
        localized('username_text'),
        localized('phone_tab'),
        localized("email")
      ];
      return TabBar(
        controller: controller.tabController,
        isScrollable: true,
        overlayColor: MaterialStateProperty.all<Color>(Colors.transparent),
        indicator: const BoxDecoration(),
        indicatorWeight: 0,
        labelPadding: EdgeInsets.zero,
        tabs: titles
            .map(
              (e) => Tab(
                height: 36.dp,
                child: Container(
                  height: 36.dp,
                  margin: EdgeInsets.only(right: 24.dp),
                  constraints: BoxConstraints(minWidth: 62.dp),
                  padding: EdgeInsets.symmetric(horizontal: 8.dp),
                  decoration: BoxDecoration(
                    color: titles.indexOf(e) == index
                        ? GGColors.tabBarHighlightButton.color
                        : null, // 底色
                    borderRadius: BorderRadius.circular((4.dp)),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    e,
                    style: TextStyle(
                      color: titles.indexOf(e) == index
                          ? GGColors.textMain.color
                          : GGColors.textSecond.color,
                      fontSize: GGFontSize.content.fontSize,
                    ),
                  ),
                ),
              ),
            )
            .toList(),
      );
    });
  }

  Widget _buildTitle2() {
    return Row(
      children: [
        Expanded(
          child: Text(
            localized('register_username_or_phone'),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.regular,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTitle1() {
    return Row(
      children: [
        Text(
          localized('login_account'),
          style: GGTextStyle(
            fontSize: GGFontSize.superBigTitle,
            fontWeight: GGFontWeigh.bold,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }

  Widget inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 24.dp,
        end: end ?? 24.dp,
      ),
      child: child,
    );
  }

  @override
  bool resizeToAvoidBottomInset() {
    return false;
  }
}

extension _Action on LoginPage {
  /// 社交媒体登录
  void onSocialLogin(OAuth auth) {
    controller.onSocialLogin(auth);
  }

  void _onAutoLogin() {
    controller.changeAutoLogin();
  }

  void _onForgotPassword() {
    controller.onForgotPassWord();
  }

  void _onRegister() {
    Get.toNamed<dynamic>(Routes.register.route);
  }

  void _onLogin() {
    controller.login();
  }
}
