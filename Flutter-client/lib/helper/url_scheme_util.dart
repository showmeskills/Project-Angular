import 'package:base_framework/base_framework.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/web_url_service/web_url_service.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/game_config.dart';
import 'package:gogaming_app/pages/gaming_game/gaming_lucky_spin_dialog.dart';
import 'package:gogaming_app/pages/main/main_logic.dart';
import 'package:gogaming_app/router/app_pages.dart';
import 'package:gogaming_app/router/customer_middle_ware.dart';
import 'package:url_launcher/url_launcher.dart';

class UrlSchemeUtil {
  static final Map<String, String?> _routes = {
    '/game_play_ready': Routes.gamePlayReady.route,
    '/game_list': Routes.gameList.route,
    '/game_detail': Routes.gameDetail.route,
    '/customer_service': Routes.customerService.route,
    '/lottery': Routes.lotteryHome.route,
    '/activity': Routes.activityDetail.route,
    '/chess': Routes.gamePlayReady.route,
    '/casino': Routes.gameHome.route,
    '/sports': Routes.sportHome.route,
    '/provider_game_list': Routes.providerGameList.route,
    '/line_center': Routes.lineCenter.route,
    '/euro_theme': Routes.euroTheme.route,

    /// [tab] -1|null:首页 0:菜单 1:搜索 2:活动 3:客服 4:钱包
    '/app_bottom_nav': null,
    '/lucky_spin': null,
  };

  static bool navigateTo(
    String? url, {
    String? title,
    dynamic extra,
    bool ignoreToken = false,
    bool openBrowser = false,
    bool replace = false,
  }) {
    if (url?.isEmpty ?? true) {
      return false;
    }
    final Uri? uri = Uri.tryParse(url!);
    if (uri == null) {
      return false;
    }
    if (uri.isScheme('gogaming')) {
      String path = uri.path;

      final Map<String, dynamic> arguments = Map.from(uri.queryParameters);
      if (extra != null) {
        arguments.addAll({
          'extra': extra,
        });
      }
      if (path == '/app_bottom_nav') {
        _changeAppBottomNav(int.tryParse(uri.queryParameters['tab'] ?? '-1'));
        return true;
      }
      if (path == '/lucky_spin') {
        GamingLuckySpinDialog().showGamingLuckySpin();
        return true;
      }

      if ('/originalWebGame' == path) {
        final gameId = arguments['gameId'];
        if (gameId is String) {
          final gameUrl =
              Config.currentConfig.gameConfig.originalGameUrl(gameId);
          H5WebViewManager.sharedInstance.openOriginalWebGame(url: gameUrl);
          return true;
        }
      }
      if (path == '/chess') {
        arguments.addAll({
          'providerId': GameConfig.kyChessProviderId,
        });
      }

      if (path == '/provider_game_list' &&
          arguments.containsKey('secondaryPage') &&
          (arguments['secondaryPage'] is bool)) {
        if (arguments['secondaryPage'] == true) {
          path = '/game_play_ready';
        }
      }

      String? route;
      if (_routes.containsKey(path)) {
        route = _routes[path];
      }
      if (route != null) {
        return _navigateToRoute(
          page: route,
          arguments: arguments,
          replace: replace,
        );
      }
    } else {
      late String webUrl;
      // 不忽略并且不是打开浏览器时，需要token
      bool needToken = !ignoreToken && !openBrowser;
      if (uri.isScheme('http') || uri.isScheme('https')) {
        webUrl = WebUrlService.splicePar(url, needToken);
      } else {
        webUrl = WebUrlService.url2(url, needToken);
      }
      if (openBrowser) {
        openUrlWithBrowser(webUrl);
      } else {
        H5WebViewManager.sharedInstance.openWebView(
          url: webUrl,
          title: title,
        );
      }
      return true;
    }
    return false;
  }

  /// 常规APP内跳转
  static bool _navigateToRoute({
    required String page,
    Map<String, dynamic> arguments = const {},
    bool replace = false,
  }) {
    final isPushReplace = replace && Get.currentRoute != Routes.main.route;
    if (page == Routes.customerService.route) {
      CustomerServiceRouter().toNamed();
      return true;
    }
    if (isPushReplace) {
      Get.offNamed<dynamic>(page,
          preventDuplicates: false, arguments: arguments);
    } else {
      Get.toNamed<dynamic>(page, arguments: arguments);
    }
    return true;
  }

  /// APP底部导航切换
  static void _changeAppBottomNav(int? index) {
    Get.until((route) => Get.currentRoute == Routes.main.route);
    Get.find<MainLogic>().changeSelectIndex(index ?? -1);
  }

  static void openUrlWithBrowser(String url) {
    final uri = Uri.parse(url);
    launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}
