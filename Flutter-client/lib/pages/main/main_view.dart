import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/service/proxy_service/proxy_service.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/home/home_view.dart';
import 'package:gogaming_app/pages/main/views/no_link_bottom_bar.dart';
import 'package:gogaming_app/pages/main_menu/main_menu_view.dart';
import 'package:gogaming_app/pages/wallets/wallet_home/wallet_home_page.dart';

import 'package:gogaming_app/widget_header.dart';

import '../../router/app_navigators.dart';
import '../game_search/game_search_page.dart';
import '../online_activity/activity_home/activity_home_view.dart';
import 'main_logic.dart';

class MainPage extends BaseView<MainLogic> {
  const MainPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const MainPage(),
    );
  }

  @override
  Widget body(BuildContext context) {
    final logic = Get.put(MainLogic());
    return Builder(builder: (BuildContext context) {
      logic.context = context;
      return Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: TabBarView(
                  controller: logic.tabController,
                  physics: const NeverScrollableScrollPhysics(),
                  children: [
                    KeepAliveWrapper(
                      child: Navigator(
                        key: Get.nestedKey(AppNavigatorKeys.mainHome.key),
                        onGenerateRoute: (settings) => MaterialPageRoute(
                          builder: (_) => const HomePage(),
                        ),
                      ),
                    ),
                    KeepAliveWrapper(
                      child: Navigator(
                        key: Get.nestedKey(AppNavigatorKeys.mainSearch.key),
                        onGenerateRoute: (settings) => MaterialPageRoute(
                          builder: (_) => const GameSearchPage(),
                        ),
                      ),
                    ),
                    KeepAliveWrapper(
                      child: Navigator(
                        key: Get.nestedKey(AppNavigatorKeys.mainActivity.key),
                        onGenerateRoute: (settings) => MaterialPageRoute(
                          builder: (_) => const ActivityHomePage(),
                        ),
                      ),
                    ),
                    const Center(
                      child: Text('data3'),
                    ),
                    KeepAliveWrapper(
                      child: Navigator(
                        key: Get.nestedKey(AppNavigatorKeys.mainWallet.key),
                        onGenerateRoute: (settings) => MaterialPageRoute(
                          builder: (_) => const WalletHomePage(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(
                height: 44.dp + (Util.isIphoneX ? 34.0 : 10.0),
              ),
            ],
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            height: 44.dp + (Util.isIphoneX ? 34.0 : 10.0),
            child: Obx(() {
              return NoLinkBottomBar(
                backgroundColor: GGColors.homeFootBackground.color,
                currentIndex: logic.currentSelectIndex.value,
                topSpacing: 8.dp,
                items: [
                  _createItem(R.mainTabbarTabbarMenu, "menu"),
                  _createItem(R.mainTabbarTabbarSearch, "search"),
                  _createItem(R.mainTabbarTabbarActivity, "activity"),
                  _createItem(R.mainTabbarTabbarCustomer, "h5_cs"),
                  _createItem(R.mainTabbarTabbarWallet, "wallet_text")
                ],
                width: double.infinity,
                height: 42.dp + (Util.isIphoneX ? 34.0 : 10.0),
                unselectedLabelStyle: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.smallHint,
                  fontWeight: GGFontWeigh.regular,
                ),
                onTap: (index) {
                  logic.changeSelectIndex(index);
                },
                onDoubleTap: (index) {
                  if (1 == index) {
                    ProxyService().showProxyAlert();
                  }
                },
              );
            }),
          )
        ],
      );
    });
  }

  NoLinkBottomBarItem _createItem(String icon, String jsonPath) {
    return NoLinkBottomBarItem(
      icon: SvgPicture.asset(
        icon,
        color: GGColors.textSecond.color,
        width: 22.dp,
        height: 22.dp,
      ),
      label: localized(jsonPath),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userAppbar();
  }

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  bool resizeToAvoidBottomInset() => false;

  @override
  Widget? drawer() => SizedBox(
        width: MediaQuery.of(Get.context!).size.width - 37.dp,
        child: const Drawer(
          child: MainMenuPage(),
        ),
      );
}
