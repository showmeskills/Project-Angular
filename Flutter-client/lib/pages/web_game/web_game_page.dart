import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/service/game_webview_manager.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/webview_flutter/webview_flutter_page.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../common/service/game_service.dart';
import '../../common/widgets/gaming_image/gaming_image.dart';
import '../../common/widgets/gaming_selector/gaming_selector.dart';
import 'game_play_ready/game_play_ready_logic.dart';
import 'game_play_ready/game_play_ready_page.dart';
import 'web_game_logic.dart';

class ThirdWebGamePage extends StatelessWidget {
  const ThirdWebGamePage({
    Key? key,
    required this.gameLink,
    required this.arguments,
    required this.providerId,
    required this.webview,
    required this.matchInfo,
    required this.gameId,
  }) : super(key: key);
  final String gameLink;
  final String providerId;
  final String? gameId;
  final Map<String, dynamic> arguments;
  final GameWebViewManagerImpl webview;
  final Map<String, dynamic> matchInfo;

  static GetPage<dynamic> getWebGame(String route) {
    return GetPage(
      name: route,
      page: () =>
          ThirdWebGamePage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  static GetPage<dynamic> getGamePlayReady(String route) {
    return GetPage(
      name: route,
      page: () =>
          ThirdWebGamePage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory ThirdWebGamePage.argument(Map<String, dynamic> arguments) {
    final webview = arguments['webview'] as GameWebViewManagerImpl? ??
        ThirdGameWebViewManger.sharedInstance;
    final gameLink = arguments['gameLink'] as String?;
    final providerId = arguments['providerId'] as String?;
    final gameId = arguments['gameId'] as String?;
    final matchInfo = arguments['matchInfo'] as Map<String, dynamic>? ?? {};
    return ThirdWebGamePage(
      gameLink: gameLink ?? '',
      arguments: arguments,
      webview: webview,
      providerId: providerId ?? '',
      gameId: gameId,
      matchInfo: matchInfo,
    );
  }

  WebGameLogic get controller => Get.find<WebGameLogic>(tag: tag);

  String get tag => arguments.toString();

  @override
  Widget build(BuildContext context) {
    Get.put(
        WebGameLogic(
          webview: webview,
          url: gameLink,
          providerId: providerId,
        ),
        tag: tag);
    return FocusDetector(
      onVisibilityLost: controller.viewDisappear,
      child: Obx(() {
        final isFullScreen = controller.isFullScreen.value;
        final screenSize = MediaQuery.of(context).size;
        final appBarHeight = isFullScreen ? 0 : 58.dp;
        final providerModel = GameService()
            .provider
            .firstWhereOrNull((element) => element.providerCatId == providerId);
        final showChangeCurrency = (providerModel?.isSport ?? false) &&
            (providerModel?.isTry ?? false);
        return Stack(
          key: controller.stackKey,
          children: [
            WebViewFlutterPage(
              hide: controller.hideWebView.value,
              webController: webview.webViewController,
              userAgent: controller.ua,
              pageFinishedCallBack: controller.webPageFinished,
              stackWidgets: [
                GamePlayReadyPage.argument(
                  arguments,
                  webview,
                  controller.gameLink,
                  controller.hideWebView,
                  matchInfo: matchInfo,
                ),
              ],
              appBar: isFullScreen
                  ? const PreferredSize(
                      preferredSize: Size(0, 0),
                      child: SizedBox(),
                    )
                  : GGAppBar.userAppbar(),
            ),
            MoveAbleWidget(
              key: ValueKey(screenSize),
              stackKey: controller.stackKey,
              offsetX: showChangeCurrency
                  ? (screenSize.width - 16.dp - 128.dp)
                  : (screenSize.width - 16.dp - 98.dp),
              offsetY: screenSize.height - appBarHeight - 16.dp - 45.dp,
              child: Visibility(
                visible: !controller.hideWebView.value,
                child: _buildButtons(showChangeCurrency),
              ),
            ),
          ],
        );
      }),
    );
  }

  Widget _buildButtons(bool showChangeCurrency) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        borderRadius: BorderRadius.circular(20),
      ),
      padding: EdgeInsetsDirectional.only(
        start: 14.dp,
        end: 14.dp,
        top: 4.dp,
        bottom: 4.dp,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildChangeCurrencyButton(showChangeCurrency),
          Obx(() {
            final fullScreen = controller.isFullScreen.value;
            return InkWell(
              onTap: controller.onPressFullScreen,
              child: SvgPicture.asset(
                fullScreen ? R.gameShrinkGame : R.gameFullGame,
                width: 32.dp,
                height: 32.dp,
              ),
            );
          }),
          SizedBox(width: 10.dp),
          InkWell(
            onTap: controller.onPressExit,
            child:
                SvgPicture.asset(R.gameExitGame, width: 32.dp, height: 32.dp),
          ),
        ],
      ),
    );
  }

  Widget _buildChangeCurrencyButton(bool showChangeCurrency) {
    if (showChangeCurrency) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          InkWell(
            onTap: _onPressGameCurrency,
            child: SvgPicture.asset(
              R.gameChangeCurrency,
              width: 32.dp,
              height: 32.dp,
              color: GGColors.textSecond.night,
            ),
          ),
          SizedBox(width: 10.dp),
        ],
      );
    }
    return Container();
  }

  void _onPressGameCurrency() {
    final logic =
        Get.findOrNull<GamePlayReadyLogic>(tag: '$providerId-$gameId');
    final list = logic?.state.supportGameCurrencies ?? [];
    GamingSelector.simple<String>(
      title: localized('show_curr'),
      original: list,
      itemBuilder: (context, e, index) {
        final currencyRatio = logic?.state.providerModel?.currencyRatio
            ?.firstWhereOrNull((element) => element.currency == e);
        return InkWell(
          onTap: () => _onPressCurrency(e),
          child: Row(
            children: [
              SizedBox(height: 40.dp),
              Gaps.hGap16,
              GamingImage.network(
                url: GameService().displayIconUrl(e),
                width: 24.dp,
                height: 24.dp,
              ),
              Gaps.hGap6,
              Text(
                GameService().displayCurrency(e),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
              Gaps.hGap6,
              if (logic?.state.gameCurrency.value?.currency == e)
                Text(
                  '{${localized('default_text')}}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textSecond.color,
                  ),
                ),
              const Spacer(),
              if ((currencyRatio?.ratio ?? 0) > 1)
                Text(
                  localized('game_currency_tip',
                      params: ['${currencyRatio?.ratio}'.stripTrailingZeros()]),
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textSecond.color,
                  ),
                ),
              Gaps.hGap16,
            ],
          ),
        );
      },
    );
  }

  void _onPressCurrency(String currency) {
    Get.back<dynamic>();
    Get.findOrNull<GamePlayReadyLogic>(tag: '$providerId-$gameId')
        ?.setGameCurrency(currency);
  }
}
