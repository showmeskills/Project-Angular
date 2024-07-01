import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/gaming_tag_service/gaming_tag_service.dart';
import 'package:gogaming_app/common/service/im/im_manager.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/header/coin_dropdown/coin_dropdown_logic.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../service/coupon_service.dart';
import 'coin_dropdown/coin_dropdown_view.dart';
import 'gg_user_app_bar_controller.dart';
import 'views/gg_bar_balance_view.dart';
import 'gg_bar_navigation/gg_bar_navigation.dart';

class GGUserAppBar extends StatelessWidget {
  const GGUserAppBar({
    Key? key,
    this.boxShadow,
    this.appVersionNumber,
  }) : super(key: key);

  final List<BoxShadow>? boxShadow;
  final String? appVersionNumber;

  GGUserAppBarController get controller => Get.find<GGUserAppBarController>();

  @override
  Widget build(BuildContext context) {
    Get.put(GGUserAppBarController(context));
    // controller.context = context;
    final backgroundColor = GGColors.userBarBackground.color;
    return FocusDetector(
      onVisibilityGained: () => controller.context = context,
      child: Container(
        decoration: BoxDecoration(
          color: backgroundColor,
          boxShadow: boxShadow ??
              [
                BoxShadow(
                  color: GGColors.shadow.color,
                  blurRadius: 3.0,
                  offset: const Offset(0.0, 1),
                ),
                BoxShadow(
                  color: backgroundColor,
                  blurRadius: 3.0,
                  offset: const Offset(0.0, -3),
                ),
              ],
        ),
        child: SafeArea(
          child: Stack(
            children: [
              AppBar(
                elevation: 0,
                // systemOverlayStyle: ThemeManager.shareInstacne.isDarkMode
                //     ? SystemUiOverlayStyle.light
                //     : SystemUiOverlayStyle.dark,
                centerTitle: true,
                toolbarHeight: 60.dp,
                // this is all you need
                titleSpacing: 0,
                title: GGBarBalanceView(
                  onPressRecharge: onPressRecharge,
                  onPressBalance: onPressBalance,
                  controller: controller,
                ),
                leading: _buildLeading(),
                backgroundColor: backgroundColor,
                actions: [
                  Container(
                    margin: EdgeInsets.only(right: 11.dp),
                    child: Row(
                      children: _buildActions(context),
                    ),
                  )
                ],
                // leadingWidth:
                //     (MediaQuery.of(context).size.width - 181.dp) / 2 - 12.dp,
                bottom: GamingTagService.sharedInstance.hasNavigation
                    ? const GGBarNavigationView()
                    : null,
              ),
              Positioned.fill(
                child: _buildVersionNumber(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildCustomAvatar(double width, double height) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Container(
          decoration: BoxDecoration(
              border: Border.all(
                color: const Color(0xFFB7BDC6),
                width: 1.dp,
              ),
              borderRadius: BorderRadius.circular(
                  (width > height ? height : width) / 2.0)),
          child: AccountService.sharedInstance.buildCustomAvatar(width, height),
        ),
        _buildUpdateRedDot(),
        Obx(() {
          return Visibility(
            visible: (CouponService.sharedInstance.messageCount.value ?? 0) > 0,
            child: Positioned(
              top: -5,
              right: -5,
              child: _buildBadgeNum(
                  CouponService.sharedInstance.messageCount.value),
            ),
          );
        })
      ],
    );
  }

  Widget _buildBadgeNum(int? messageCount) {
    if ((messageCount ?? 0) <= 0) {
      return Gaps.empty;
    }
    return Container(
      decoration: BoxDecoration(
        color: GGColors.tipsBg.color,
        borderRadius: BorderRadius.circular(16.dp),
      ),
      width: 16.dp,
      height: 16.dp,
      alignment: Alignment.center,
      child: FittedBox(
        fit: BoxFit.scaleDown,
        child: Text(
          (messageCount ?? 0) > 99 ? '99+' : (messageCount ?? 0).toString(),
          style: GGTextStyle(
            color: GGColors.buttonTextWhite.color,
            fontSize: GGFontSize.smallHint,
          ),
        ),
      ),
    );
  }

  Widget _buildUpdateRedDot() {
    return Positioned(
      top: -2,
      right: -2,
      child: Visibility(
        visible: controller.showUpdateRedDot(),
        child: Container(
          decoration: BoxDecoration(
            color: GGColors.tipsBg.color,
            shape: BoxShape.circle,
          ),
          width: 6,
          height: 6,
        ),
      ),
    );
  }

  List<Widget> _buildActions(BuildContext context) {
    return [
      _buildChatButton(),
      Obx(() {
        final avatar = !controller.isLogin.value
            ? Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 28.dp,
                    height: 28.dp,
                    alignment: AlignmentDirectional.center,
                    child: Image.asset(
                      R.appbarUnloginAvatar,
                      width: 18.dp,
                      height: 18.dp,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                  _buildUpdateRedDot(),
                ],
              )
            : buildCustomAvatar(28.dp, 28.dp);
        return GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _onPressAvatar,
          child: Padding(
            padding: EdgeInsetsDirectional.only(
              start: 10.dp,
              top: 5.dp,
              bottom: 5.dp,
            ),
            child: avatar,
          ), //扩大点击区域
        );
      }),
    ];
  }

  Widget _buildChatButton() {
    return Obx(() {
      if (!controller.isLogin.value || !controller.chatEnabled) {
        return Gaps.empty;
      } else {
        return GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _onPressChat,
          child: Container(
            padding: EdgeInsetsDirectional.only(
              start: 10.dp,
              top: 5.dp,
              bottom: 5.dp,
            ),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                GamingImage.asset(
                  R.appbarChat,
                  width: 28.dp,
                  height: 28.dp,
                  color: GGColors.textMain.color,
                ),
                Obx(
                  () => Positioned(
                    top: -5,
                    right: -5,
                    child: _buildBadgeNum(
                      IMManager().unReadNum.value,
                    ),
                  ),
                )
              ],
            ),
          ),
        );
      }
    });
  }

  Widget _buildLeading() {
    return InkWell(
      onTap: onPressLeading,
      child: Container(
        margin: EdgeInsets.only(left: 12.dp),
        alignment: AlignmentDirectional.centerStart,
        child: Obx(() {
          return GamingImage.network(
            url: controller.appLogo,
            width: 40.dp,
            height: 40.dp,
            fit: BoxFit.contain,
            errorBuilder: (p0, p1, p2) {
              return SvgPicture.asset(
                R.appbarTempLogo,
                width: 40.dp,
                fit: BoxFit.contain,
              );
            },
          );
        }),
      ),
    );
  }

  Widget _buildVersionNumber() {
    return IgnorePointer(
      child: Material(
        color: Colors.transparent,
        child: Container(
          alignment: AlignmentDirectional.topStart,
          padding: EdgeInsetsDirectional.only(top: 8.dp, start: 50.dp),
          child: StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (appVersionNumber?.isNotEmpty == true)
                    Text(
                      'F：$appVersionNumber',
                      style: const TextStyle(
                        fontSize: 12.0, // text size
                        color: Colors.green, // text color
                      ),
                    ),
                  Obx(() {
                    return Text(
                      (controller.backendVersion.value?.isNotEmpty ?? false)
                          ? "B: ${controller.backendVersion.value}"
                          : "",
                      style: const TextStyle(
                        fontSize: 12.0, // text size
                        color: Colors.green, // text color
                      ),
                    );
                  }),
                ],
              );
            },
          ),
        ),
      ),
    );
  }
}

extension _Action on GGUserAppBar {
  void _onPressAvatar() {
    Get.back<dynamic>();
    if (controller.isLogin.value) {
      Get.toNamed<dynamic>(Routes.mainMenu.route);
    } else {
      Get.toNamed<dynamic>(Routes.preLogin.route);
    }
  }

  void _onPressChat() {
    Get.toNamed<dynamic>(Routes.chat.route);
  }

  void onPressRecharge() {
    DepositRouterUtil.goDepositHome();
  }

  void onPressBalance() {
    SmartDialog.showAttach<dynamic>(
      targetContext: controller.context,
      usePenetrate: false,
      alignment: AlignmentDirectional.bottomCenter,
      clickMaskDismiss: true,
      maskColor: Colors.transparent,
      builder: (_) => const CoinDropdownView(),
      onDismiss: () {
        Get.findOrNull<CoinDropdownLogic>()?.dismissView();
      },
    );
  }

  void onPressLeading() {
    Get.until((route) => Get.currentRoute == Routes.main.route);
    Get.find<MainLogic>().changeSelectIndex(-1);
  }
}
