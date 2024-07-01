import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/im/im_manager.dart';
import 'package:gogaming_app/common/service/upgrade_app_service.dart';
import 'package:gogaming_app/common/service/vip_service.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/helper/withdraw_router_util.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/generated/r.dart';
import '../../common/service/account_service.dart';
import '../../common/service/coupon_service.dart';
import '../../common/service/web_url_service/web_url_model.dart';
import '../../common/service/web_url_service/web_url_service.dart';
import '../base/base_view.dart';
import 'go_gaming_main_menu_logic.dart';

class GoGamingMainMenuPage extends BaseView<GoGamingMainMenuLogic> {
  const GoGamingMainMenuPage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const GoGamingMainMenuPage(),
    );
  }

  @override
  Widget body(BuildContext context) {
    return FocusDetector(
      onVisibilityGained: () => controller.loadData(),
      child: bodyWidget(context),
    );
  }

  Widget bodyWidget(BuildContext context) {
    Get.put(GoGamingMainMenuLogic());
    return ListView(
      shrinkWrap: true,
      children: [
        Gaps.vGap18,
        inset(Obx(() {
          return _buildTitle();
        })),
        Gaps.vGap26,

        /// 充值 提现等
        moneyManagement(context),
        Gaps.vGap16,
        buildListCell(R.mainMenuGeneral, localized('dashboard'), callback: (v) {
          Get.offNamed<void>(Routes.dashboard.route);
        }),
        _buildWalletWidget(context),
        _buildOrderWidget(context),
        _buildMenuList(),
        Gaps.vGap24,
      ],
    );
  }

  Widget moneyManagement(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 24.dp, right: 24.dp),
      child: Row(
        children: [
          Expanded(
            child: SizedBox(
              height: 40.dp,
              child: GGButton.minor(
                onPressed: _onPressCharge,
                text: localized('deposit'),
                // backgroundColor: GGColors.border.color,
                textStyle: GGTextStyle(fontSize: GGFontSize.content),
                height: 40.dp,
              ),
            ),
          ),
          Gaps.hGap10,
          Expanded(
            child: SizedBox(
              height: 40.dp,
              child: GGButton.minor(
                onPressed: _onPressTake,
                text: localized('withdraw'),
                // backgroundColor: GGColors.border.color,
                textStyle: GGTextStyle(fontSize: GGFontSize.content),
                height: 40.dp,
              ),
            ),
          ),
          Gaps.hGap10,
          Expanded(
            child: SizedBox(
              height: 40.dp,
              child: GGButton.minor(
                onPressed: _onPressTransfer,
                text: localized('trans'),
                // backgroundColor: GGColors.border.color,
                textStyle: GGTextStyle(fontSize: GGFontSize.content),
                height: 40.dp,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuList() {
    return Column(
      children: [
        buildListCell(R.mainMenuAccountSafe, localized('account_security'),
            callback: _onClickCell),
        divider(),
        buildListCell(R.mainMenuEarnedCommission, localized('earn_comm'),
            callback: _onClickCell),
        buildListCell(R.mainMenuUserGrowth, localized('member_grow'),
            callback: _onClickCell),
        buildListCell(R.mainMenuNewActivity, localized('lat_acti'),
            callback: _onClickCell),
        Obx(() {
          return buildListCell(R.mainMenuCardCenter, localized('bonus_center'),
              callback: _onClickCell,
              badgeNumber:
                  (CouponService.sharedInstance.messageCount.value ?? 0));
        }),
        divider(),
        // buildListCell(R.mainMenuGambling, localized('gam_moderate'),
        //     callback: _onClickCell),
        buildListCell(R.mainMenuSetting, localized('settings'),
            callback: _onClickCell),
        divider(),
        buildListCell(R.mainMenuHelp, localized('help_center'),
            callback: _onClickCell),
        divider(),
        buildListCell(R.mainMenuOnlineService, localized('online_cs'),
            callback: _onClickCell),
        divider(),
        buildListCell(
          R.mainMenuAboutUs,
          localized('abount_us'),
          callback: _onPressAbountUs,
          rightView: _buildVersionUpdate(),
        ),
        Obx(() {
          return buildListCell(R.mainMenuNotify, localized('noti'),
              badgeNumber: controller.allNoticeAmount.value,
              callback: _onClickCell);
        }),
        Obx(() {
          if (!controller.chatEnabled) {
            return Gaps.empty;
          }
          return buildListCell(
            R.iconMessage,
            localized('chat'),
            badgeNumber: IMManager().unReadNum.value,
            callback: _onPressChat,
          );
        }),
        buildListCell(R.mainMenuExit, localized('logout'),
            callback: _onPressLogout),
      ],
    );
  }

  Widget _buildVersionUpdate() {
    return Visibility(
      visible: UpgradeAppService.sharedInstance.checkIfNeedUpdate() !=
          UpdateType.updateTypeNotRequired,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            decoration: BoxDecoration(
              color: GGColors.tipsBg.color,
              shape: BoxShape.circle,
            ),
            width: 6,
            height: 6,
          ),
          Gaps.hGap12,
          Text(
            localized('new_version_discovered'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.hGap10,
          GamingImage.asset(R.iconArrowRight),
        ],
      ),
    );
  }

  Widget buildListCell(String iconPath, String title,
      {void Function(String iconPath)? callback,
      bool redIcon = false,
      Widget? rightView,
      int badgeNumber = 0}) {
    Widget listTile = ListTile(
      contentPadding: EdgeInsets.zero,
      dense: true,
      minVerticalPadding: 0,
      visualDensity: const VisualDensity(horizontal: -2, vertical: -2),
      title: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(height: 46.dp),
          if (iconPath.contains('svg'))
            SvgPicture.asset(
              iconPath,
              width: 16.dp,
              height: 16.dp,
              color: GGColors.textHint.color,
              fit: BoxFit.fill,
            ),
          SizedBox(width: 12.dp),
          Text(
            title,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
          const Spacer(),
          if (rightView != null) rightView,
          if (badgeNumber > 0)
            Container(
              width: 18.dp,
              height: 18.dp,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: GGColors.tipsBg.color,
                borderRadius: BorderRadius.all(Radius.circular(18.0.dp)),
              ),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  "${badgeNumber > 99 ? '99+' : badgeNumber}",
                  style: GGTextStyle(
                      color: GGColors.buttonTextWhite.color,
                      fontSize: GGFontSize.hint),
                ),
              ),
            ),
          SizedBox(
            width: 24.dp,
          ),
        ],
      ),
    );
    final listRow = inset(listTile);
    if (callback == null) {
      return listRow;
    } else {
      return InkWell(
        child: listRow,
        onTap: () {
          callback.call(iconPath);
        },
      );
    }
  }

  Widget inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 24.dp,
        end: end ?? 0.dp,
      ),
      child: child,
    );
  }

  String kycTypeStr() {
    if (controller.isAdvancePassed) {
      return localized('ad_ceri');
    } else if (controller.isIntermediatePassed) {
      return localized('inter_ceri');
    } else if (controller.isPrimaryPassed) {
      return localized('pri_ceri');
    } else {
      return localized('verification');
    }
  }

  bool isCertified() {
    return controller.isAdvancePassed ||
        controller.isIntermediatePassed ||
        controller.isPrimaryPassed;
  }

  Widget _buildTitle() {
    String name = AccountService.sharedInstance.gamingUser?.userName ?? '';
    String uid = AccountService.sharedInstance.gamingUser?.uid ?? '';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          name == '' ? uid : name,
          style: GGTextStyle(
              color: GGColors.textMain.color,
              fontSize: GGFontSize.bigTitle20,
              fontWeight: GGFontWeigh.bold),
        ),
        SizedBox(
          height: 9.dp,
        ),
        Row(
          children: [
            _buildVipLevel(),
            const Spacer(),
            GestureDetector(
              onTap: _onPressKycVerify,
              child: Container(
                height: 30.dp,
                padding: EdgeInsets.only(
                  left: 12.dp,
                  right: 14.dp,
                ),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isCertified()
                      ? GGColors.successBackground.night
                      : GGColors.border.color,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(15.dp),
                    bottomLeft: Radius.circular(15.dp),
                  ),
                ),
                child: Text(kycTypeStr(),
                    style: GGTextStyle(
                      color: isCertified()
                          ? GGColors.successText.color
                          : GGColors.textSecond.color,
                      fontSize: GGFontSize.content,
                      fontWeight: GGFontWeigh.regular,
                    )),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildWalletWidget(BuildContext context) {
    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ListTileTheme(
        data: const ListTileThemeData(
          contentPadding: EdgeInsets.zero,
          visualDensity: VisualDensity.compact,
          horizontalTitleGap: 0.0,
          minLeadingWidth: 0,
          minVerticalPadding: 0,
          dense: true,
        ),
        child: Obx(() {
          return ExpansionTile(
              onExpansionChanged: (value) {
                if (value == true) {
                  controller.arrowController.forward();
                } else {
                  controller.arrowController.reverse();
                }
              },
              leading: SizedBox(
                width: 300.dp,
                child:
                    buildListCell(R.mainMenuWallet, localized('wallet_text')),
              ),
              trailing: Container(
                padding: EdgeInsets.only(right: 24.dp),
                child: RotationTransition(
                  turns: controller.arrowTurns,
                  child: SvgPicture.asset(
                    R.iconAppbarLeftLeading,
                    width: 14.dp,
                    height: 14.dp,
                    color: GGColors.textSecond.color,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              initiallyExpanded: false,
              title: const Text("",
                  style: TextStyle(color: Colors.black54, fontSize: 14)),
              children:
                  controller.walletsTypes.asMap().keys.toList().map((index) {
                String title = localized(controller.walletsTypes[index]);
                return InkWell(
                  onTap: () {
                    _onPressWallet(controller.walletsTypes[index]);
                  },
                  child: Container(
                    padding: EdgeInsets.only(left: 52.dp, right: 10.dp),
                    height: 44.dp,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Text(
                          title,
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textMain.color,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList());
        }),
      ),
    );
  }

  Widget _buildVipLevel() {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: _onPressVip,
      child: Row(
        children: [
          SvgPicture.asset(
            R.mainMenuDiamonds,
            width: 14.dp,
            height: 12.dp,
            color: GGColors.brand.color,
            fit: BoxFit.contain,
          ),
          SizedBox(
            width: 7.dp,
          ),
          Obx(() {
            return Text(
              VipService.sharedInstance.vipLevelName,
              style: GGTextStyle(
                color: GGColors.brand.color,
                fontSize: GGFontSize.content,
                decoration: TextDecoration.underline,
                fontWeight: GGFontWeigh.medium,
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget divider() {
    return Container(
      height: 1.dp,
      color: GGColors.border.color,
    );
  }

  Widget _buildOrderWidget(BuildContext context) {
    return Theme(
      data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
      child: ListTileTheme(
        data: const ListTileThemeData(
          contentPadding: EdgeInsets.zero,
          visualDensity: VisualDensity.compact,
          horizontalTitleGap: 0.0,
          minLeadingWidth: 0,
          minVerticalPadding: 0,
          dense: true,
        ),
        child: ExpansionTile(
            onExpansionChanged: (value) {
              if (value == true) {
                controller.arrowController2.forward();
              } else {
                controller.arrowController2.reverse();
              }
            },
            leading: SizedBox(
              width: 300.dp,
              child: buildListCell(R.mainMenuOrder, localized('orders')),
            ),
            trailing: Container(
              padding: EdgeInsets.only(right: 24.dp),
              child: RotationTransition(
                turns: controller.arrowTurns2,
                child: SvgPicture.asset(
                  R.iconAppbarLeftLeading,
                  width: 14.dp,
                  height: 14.dp,
                  color: GGColors.textSecond.color,
                  fit: BoxFit.contain,
                ),
              ),
            ),
            initiallyExpanded: false,
            title: Text("",
                style: GGTextStyle(
                    color: Colors.black54, fontSize: GGFontSize.content)),
            children: controller.orderTypes.asMap().keys.toList().map((index) {
              String title = localized(controller.orderTypes[index]);
              return InkWell(
                onTap: () {
                  _onPressOrder(controller.orderTypes[index]);
                },
                child: Container(
                  padding: EdgeInsets.only(left: 52.dp, right: 10.dp),
                  height: 44.dp,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        title,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList()),
      ),
    );
  }
}

extension _Action on GoGamingMainMenuPage {
  /// 处理点击事件
  void _onClickCell(String iconPath) {
    if (iconPath == R.mainMenuAccountSafe) {
      Get.toNamed<dynamic>(Routes.accountSecurity.route);
    } else if (iconPath == R.mainMenuCardCenter) {
      Get.toNamed<dynamic>(Routes.couponHome.route);
    } else if (iconPath == R.mainMenuSetting) {
      Get.toNamed<dynamic>(Routes.preferencePage.route);
    } else if (iconPath == R.mainMenuNotify) {
      Get.toNamed<dynamic>(Routes.settingNotify.route);
    } else if (R.mainMenuUserGrowth == iconPath) {
      _onPressVip();
    } else if (R.mainMenuNewActivity == iconPath) {
      Get.until((route) => Get.currentRoute == Routes.main.route);
      Get.find<MainLogic>().changeSelectIndex(2);
    } else if (R.mainMenuOnlineService == iconPath) {
      Get.until((route) => Get.currentRoute == Routes.main.route);
      Get.find<MainLogic>().changeSelectIndex(3);
    } else if (R.mainMenuHelp == iconPath) {
      H5WebViewManager.sharedInstance.openWebView(
        url: WebUrlService.url(WebUrl.helpCenter.toTarget()),
        title: localized('help_center'),
      );
    } else if (R.mainMenuEarnedCommission == iconPath) {
      UrlSchemeUtil.navigateTo(
          WebUrlService.url(WebUrl.referralHome.toTarget()),
          title: localized('earn_comm'),
          ignoreToken: false);
    } else {
      Toast.showFunDev();
    }
  }

  void _onPressWallet(String title) {
    if ('dc_add_management' == title) {
      _onPressCryptoAddress();
    } else if (title == 'bc_manage') {
      Get.offNamed<void>(Routes.bankCard.route);
    } else if (title == 'wallet_over') {
      controller.onPressWalletHome();
    } else if (title == 'main') {
      controller.onPressMainWallet();
    } else if (controller.overviewWalletList
        .where((element) => element.category.toLowerCase() == title)
        .isNotEmpty) {
      controller.onPressTransferWallet(title);
    } else if (title == 'trans_history') {
      Get.toNamed<dynamic>(Routes.walletHistory.route);
    }
  }

  void _onPressOrder(String title) {
    controller.onPressOrder(title);
  }

  void _onPressAbountUs(String icon) {
    Get.offNamed<dynamic>(Routes.aboutUs.route);
  }

  void _onPressCryptoAddress() {
    Get.back<dynamic>();
    const routeName = Routes.cryptoAddressList;
    if (Routes.c(Get.currentRoute) != routeName) {
      Get.toNamed<dynamic>(routeName.route);
    }
  }

  void _onPressLogout(String icon) {
    AccountService.sharedInstance.logout();
    Get.until((route) => Get.currentRoute == Routes.main.route);
    Get.find<MainLogic>().changeSelectIndex(-1);
    // eventCenter.emit(loggedOut);
    // eventCenter.emit(jumpToHome);
    // MyAppState.jumpToLogin(Global.context, fromLogout: true);
  }

  void _onPressChat(String icon) {
    Get.toNamed<dynamic>(Routes.chat.route);
  }

  void _onPressKycVerify() {
    Get.back<dynamic>();
    if (!Routes.c(Get.currentRoute).isKycPage()) {
      Get.toNamed<dynamic>(Routes.kycHome.route);
    }
  }

  /// 划转
  void _onPressTransfer() {
    Get.offNamed<dynamic>(Routes.transfer.route);
  }

  /// 提现
  void _onPressTake() {
    WithdrawRouterUtil.goWithdrawHome(replace: true);
  }

  /// 充值
  void _onPressCharge() {
    DepositRouterUtil.goDepositHome(replace: true);
  }

  /// vip
  void _onPressVip() {
    Get.toNamed<dynamic>(Routes.vip.route);
  }
}
