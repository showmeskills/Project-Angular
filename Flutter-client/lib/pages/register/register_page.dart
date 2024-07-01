import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/oauth_service/oauth_service.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/register/register_binding.dart';
import 'package:gogaming_app/pages/register/views/register_email_view.dart';
import 'package:gogaming_app/pages/register/views/register_phone_view.dart';
import 'package:gogaming_app/pages/register/views/register_user_view.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/widgets/appbar/appbar.dart';
import 'register_logic.dart';

class RegisterPage extends BaseView<RegisterLogic> {
  const RegisterPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const RegisterPage(),
      binding: RegisterBing(),
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
    controller.context = context;
    return Obx(() {
      return Transform.translate(
        offset: Offset(0, -controller.offsetY.value),
        child: Container(
          padding: EdgeInsets.only(left: 20.dp, right: 20.dp),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(height: 60.dp),
              Text(
                getLocalString('create_user'),
                style: GGTextStyle(
                    color: GGColors.textMain.color,
                    fontSize: GGFontSize.superBigTitle,
                    fontFamily: GGFontFamily.c(),
                    fontWeight: GGFontWeigh.bold),
              ),
              Container(
                margin: EdgeInsets.only(top: 12.dp, bottom: 32.dp),
                child: Text(
                  getLocalString('register_username_or_phone'),
                  style: GGTextStyle(
                    color: GGColors.textSecond.color,
                    fontSize: GGFontSize.smallTitle,
                    fontFamily: GGFontFamily.c(),
                  ),
                ),
              ),
              _buildTabBar(),
              Expanded(child: _buildTabBarView()),
            ],
          ),
        ),
      );
    });
  }

  List<Widget> _buildFooter() {
    return [
      _buildRefer(),
      _buildReferInput(),
      _buildCheckService(),
      _buildRegisterButton(),
      _buildLoginButton(),
      OAuthView(
        onPressed: (p0) {
          controller.onSocialLogin(p0);
        },
      ),
      Gaps.vGap20,
    ];
  }

  Widget _buildLoginButton() {
    return Container(
      margin: EdgeInsets.only(top: 24.dp),
      child: Row(
        children: [
          Text(
            controller.getLocalString('registered_or_not'),
            style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontWeight: GGFontWeigh.regular),
          ),
          GestureDetector(
            onTap: () => controller.toLogin(),
            child: Text(
              controller.getLocalString('login_button'),
              style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.link.color,
                  fontWeight: GGFontWeigh.regular),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRegisterButton() {
    return Container(
      margin: EdgeInsets.only(top: 24.dp),
      width: double.infinity,
      child: Obx(() {
        return GGButton.main(
          onPressed: () {
            controller.postRegister();
          },
          enable: controller.registerButtonEnable.value,
          isLoading: controller.isLoadingUser.value,
          text: controller.getLocalString('register_button'),
        );
      }),
    );
  }

  Widget _buildCheckService() {
    return Row(
      children: [
        Expanded(
          child: RichText(
              text: TextSpan(
            children: [
              WidgetSpan(
                child: InkWell(
                  highlightColor: Colors.transparent, // 长按时的扩散效果设置为透明
                  onTap: _revertCheckService,
                  child: Container(
                    margin: EdgeInsets.only(top: 19.dp),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Obx(() {
                          return IgnorePointer(
                            child: GamingCheckBox(
                              value: controller.checkboxSelected.value,
                              size: 18.dp,
                              activeColor: GGColors.brand.color,
                              onChanged: (v) {},
                            ),
                          );
                        }),
                        Container(
                          margin: EdgeInsets.only(left: 8.dp),
                          child: Text(
                            controller.getLocalString('agree'),
                            style: GGTextStyle(
                                fontSize: GGFontSize.content,
                                color: GGColors.textMain.color,
                                fontWeight: GGFontWeigh.regular),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              WidgetSpan(
                child: InkWell(
                  onTap: _onPressServiceLink,
                  child: Container(
                    margin: EdgeInsets.only(left: 4.dp),
                    child: Text(
                      controller.getLocalString('terms'),
                      style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.link.color,
                          fontWeight: GGFontWeigh.regular),
                    ),
                  ),
                ),
              ),
            ],
          )),
        ),
      ],
    );
  }

  Widget _buildReferInput() {
    return Obx(() {
      return Visibility(
        visible: controller.showReferrerUser.value,
        child: GamingTextField(
          controller: controller.referrer,
          fillColor: Config.isM1
              ? GGColors.alertBackground
              : GGColors.moduleBackground,
        ),
      );
    });
  }

  Widget _buildRefer() {
    return Obx(() {
      if (controller.referrerCode.isNotEmpty) {
        return Container();
      }
      return Container(
        margin: EdgeInsets.only(top: 24.dp, bottom: 5.dp),
        child: GestureDetector(
          onTap: () {
            controller.showReferrerUser.value =
                !controller.showReferrerUser.value;
          },
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                '${controller.getLocalString('referrer_id')}(${controller.getLocalString('optional')})',
                style: TextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content.fontSize,
                  fontFamily: GGFontFamily.c().fontFamily,
                ),
              ),
              Container(
                margin: EdgeInsets.only(left: 5.dp),
                child: controller.showReferrerUser.value
                    ? SvgPicture.asset(
                        R.iconUp,
                      )
                    : SvgPicture.asset(
                        R.iconDown,
                      ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildTabBarView() {
    return TabBarView(
      controller: controller.tabController,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        KeepAliveWrapper(
          child: RegisterUserView(
            controller: controller,
            buildFooter: _buildFooter(),
          ),
        ),
        KeepAliveWrapper(
          child: RegisterPhoneView(
            controller: controller,
            buildFooter: _buildFooter(),
          ),
        ),
        KeepAliveWrapper(
          child: RegisterEmailView(
            controller: controller,
            buildFooter: _buildFooter(),
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
        localized("email"),
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
                  padding: EdgeInsets.symmetric(horizontal: 8.dp),
                  margin: EdgeInsets.only(right: 24.dp),
                  constraints: BoxConstraints(minWidth: 62.dp),
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

  @override
  bool resizeToAvoidBottomInset() {
    return false;
  }
}

extension _Action on RegisterPage {
  void _onPressServiceLink() {
    H5WebViewManager.sharedInstance.openWebView(
      url: controller.termsUrl.value,
      title: controller.getLocalString('terms'),
    );
  }

  void _revertCheckService() {
    controller.checkboxSelected.value = !controller.checkboxSelected.value;
  }
}
