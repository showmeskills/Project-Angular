import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/common/api/base/go_gaming_response.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_range_setting_model.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/service/game_webview_manager.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/go_gaming_toast.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../main/main_logic.dart';
import 'game_play_ready_logic.dart';
import 'game_play_ready_state.dart';

class GamePlayReadyPage extends GetView<GamePlayReadyLogic> {
  const GamePlayReadyPage({
    Key? key,
    required this.providerId,
    this.identify,
    this.gameId,
    required this.webview,
    required this.gameLink,
    required this.hideWebView,
    this.isTry = false,
    this.matchInfo = const {},
  }) : super(key: key);

  /// 厂商id
  final String providerId;

  /// 游戏类别名
  final String? identify;

  /// 游戏id
  final String? gameId;
  final GameWebViewManagerImpl webview;
  final RxString gameLink;
  final RxBool hideWebView;
  final bool isTry;
  final Map<String, dynamic> matchInfo;

  factory GamePlayReadyPage.argument(
    Map<String, dynamic> arguments,
    GameWebViewManagerImpl webview,
    RxString gameLink,
    RxBool hideWebView, {
    Map<String, dynamic> matchInfo = const {},
  }) {
    final providerId = arguments['providerId'] as String;
    final identify = arguments['identify'] as String?;
    final gameId = arguments['gameId'] as String?;
    final isTry = arguments['isTry'] as bool? ?? false;
    return GamePlayReadyPage(
      providerId: providerId,
      identify: identify,
      gameId: gameId,
      webview: webview,
      gameLink: gameLink,
      hideWebView: hideWebView,
      isTry: isTry,
      matchInfo: matchInfo,
    );
  }

  GamePlayReadyState get state => controller.state;

  @override
  String? get tag => '$providerId-$gameId';

  @override
  Widget build(BuildContext context) {
    return FocusDetector(
      onVisibilityGained: () {
        controller.checkNeedTransfer().listen((event) {}, onError: (Object e) {
          if (e is GoGamingResponse) {
            Toast.showFailed(e.message);
          } else {
            Toast.showTryLater();
          }
        });
      },
      child: body(context),
    );
  }

  Widget body(BuildContext context) {
    Get.put(
      GamePlayReadyLogic(
        providerId: providerId,
        identify: identify,
        gameId: gameId,
        webview: webview,
        gameLink: gameLink,
        hideWebView: hideWebView,
        matchInfo: matchInfo,
      ),
      tag: tag,
    );

    return Obx(() {
      return Visibility(
        visible: controller.gameLink.isEmpty,
        child: Container(
          width: double.infinity,
          height: double.infinity,
          color: GGColors.alertMask.color,
          child: Obx(() {
            return Stack(
              children: [
                Visibility(
                  visible: controller.pageState == PageState.usual,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildGameErrorHint(),
                      _buildGameCurrency(),
                      _buildRowRange(),
                      _buildBalanceHint(),
                      Gaps.vGap16,
                      _buildAction(),
                    ],
                  ),
                ),
                Obx(() => controller.pageState == PageState.loading
                    ? const GoGamingLoading()
                    : Container()),
              ],
            );
          }),
        ),
      );
    });
  }

  /// 显示获取游戏链接的错误提示
  Widget _buildGameErrorHint() {
    return Visibility(
      visible: state.playGameError.value.isNotEmpty ||
          state.playGameSupportError.value.isNotEmpty,
      child: Padding(
        padding: EdgeInsets.only(bottom: 16.dp),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Gaps.vGap26,
            Expanded(
              child: Text(
                state.playGameError.value.isNotEmpty
                    ? state.playGameError.value
                    : state.playGameSupportError.value,
                textAlign: TextAlign.center,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.error.color,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _playGameIcon() {
    if (!AccountService().isLogin) {
      return R.iconPersonal;
    }
    final needTransfer = state.needTransfer;
    return needTransfer ? R.iconTransfer : R.iconPlay;
  }

  String _playGameTitle() {
    if (!AccountService().isLogin) {
      return localized("login_button");
    }

    final needTransfer = state.needTransfer;
    if (state.gameOffLine.value == false) {
      return localized(needTransfer ? 'trans' : 'go_game');
    }
    return localized('return_to_home');
  }

  VoidCallback _playGameCallBack() {
    if (!AccountService().isLogin) {
      return () {
        Get.toNamed<dynamic>(Routes.login.route);
      };
    }

    final needTransfer = state.needTransfer;
    if (state.gameOffLine.value == false) {
      return needTransfer ? onPressTransfer : onPressRealMode;
    }
    return () {
      Get.until((route) => Get.currentRoute == Routes.main.route);
      Get.find<MainLogic>().changeSelectIndex(-1);
    };
  }

  Widget _buildAction() {
    bool realLinkLoading = state.realLinkLoading.value;
    if ((state.providerModel?.isSport ?? false) &&
        (state.providerModel?.isTry ?? false)) {
      realLinkLoading =
          state.realLinkLoading.value || state.tryLinkLoading.value;
    }
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: Get.width * 0.3,
          child: GGButton.main(
            onPressed: _playGameCallBack(),
            text: _playGameTitle(),
            isLoading: realLinkLoading,
            image: SvgPicture.asset(
              _playGameIcon(),
              width: 14.dp,
              height: 14.dp,
              color: GGColors.buttonTextWhite.color,
            ),
            space: 10,
          ),
        ),
        _buildTryModeButton(),
      ],
    );
  }

  Widget _buildTryModeButton() {
    if ((state.providerModel?.isTry ?? false) &&
        (state.providerModel?.isSport == false)) {
      final tryLinkLoading = state.tryLinkLoading.value;
      return Row(
        children: [
          Gaps.hGap20,
          SizedBox(
            width: Get.width * 0.4,
            child: GGButton.main(
              onPressed: () {
                controller.playGame(tryMode: true);
              },
              text: localized("trial_play"),
              image: SvgPicture.asset(
                R.iconPlay,
                width: 20.dp,
                height: 20.dp,
                color: GGColors.buttonTextWhite.color,
              ),
              space: 10,
              isLoading: tryLinkLoading,
              backgroundColor: GGColors.similarSecond.color,
            ),
          ),
        ],
      );
    }
    return Gaps.empty;
  }

  Widget _buildCurrencyTip() {
    final currencyRatio = state.currencyRatio;
    return SizedBox(
      width: 188.dp,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildExpandWidget(Text(
            localized('game_currency_tip_d', params: [
              '${currencyRatio?.ratio}'.stripTrailingZeros(),
              GameService().displayCurrency(state.gameCurrency.value?.currency),
            ]),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textBlackOpposite.color,
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildBalanceHint() {
    final currencyRatio = state.currencyRatio;

    return Visibility(
      visible: state.showBalanceHint,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Gaps.vGap26,
          Text(
            localized('game_currency_tip',
                params: ['${currencyRatio?.ratio}'.stripTrailingZeros()]),
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.hGap6,
          GamingPopupLinkWidget(
            followerAnchor: Alignment.bottomCenter,
            targetAnchor: Alignment.topCenter,
            popup: _buildCurrencyTip(),
            // offset: Offset(0, 20.dp),
            triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
            child: SvgPicture.asset(
              R.iconTipIcon,
              width: 14.dp,
              height: 14.dp,
            ),
          ),
        ],
      ),
    );
  }

  // 投注范围
  Widget _buildRowRange() {
    final displayCurrency = state.gameCurrency.value;
    return Visibility(
      visible: state.showRangeSetting(),
      child: InkWell(
        onTap: _onPressRangeSetting,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Gaps.vGap28,
            Text(
              localized('bet_range'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
            Gaps.hGap8,
            GamingImage.network(
              url: GameService().displayIconUrl(displayCurrency?.currency),
              width: 18.dp,
              height: 18.dp,
            ),
            Gaps.hGap4,
            Text(
              state.curRange.value.value,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.buttonTextWhite.color,
              ),
            ),
            Container(
              width: 30.dp,
              height: 18.dp,
              alignment: AlignmentDirectional.center,
              child: SvgPicture.asset(
                R.appbarAppbarArrowDown,
                width: 6.dp,
                height: 6.dp,
                color: GGColors.textSecond.color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGameCurrency() {
    if (!AccountService().isLogin) {
      return Container();
    }
    final displayCurrency = state.gameCurrency.value;
    return InkWell(
      onTap: _onPressGameCurrency,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Gaps.vGap28,
          Text(
            localized('show_curr'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
          Gaps.hGap8,
          GamingImage.network(
            url: GameService().displayIconUrl(displayCurrency?.currency),
            width: 18.dp,
            height: 18.dp,
          ),
          Gaps.hGap4,
          Text(
            GameService().displayCurrency(displayCurrency?.currency),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.buttonTextWhite.color,
            ),
          ),
          Container(
            width: 30.dp,
            height: 18.dp,
            alignment: AlignmentDirectional.center,
            child: SvgPicture.asset(
              R.appbarAppbarArrowDown,
              width: 6.dp,
              height: 6.dp,
              color: GGColors.textSecond.color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpandWidget(Widget text) {
    return Row(children: [Expanded(child: text)]);
  }
}

extension _Action on GamePlayReadyPage {
  void onPressRealMode() {
    controller.playGame();
  }

  void onPressTransfer() {
    controller.goTransfer();
  }

  void _onPressCurrency(String currency) {
    Get.back<dynamic>();
    controller.setGameCurrency(currency);
  }

  void _onPressGameCurrency() {
    final list = state.supportGameCurrencies ?? [];
    GamingSelector.simple<String>(
      title: localized('show_curr'),
      original: list,
      itemBuilder: (context, e, index) {
        final currencyRatio = state.providerModel?.currencyRatio
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
              if (state.gameCurrency.value?.currency == e)
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

  void _onPressRangeSetting() {
    GamingSelector.simple<RangeSettingList>(
      title: localized('sel_range'),
      original: state.allRange,
      itemBuilder: (context, e, index) {
        return InkWell(
          onTap: () => _onPressRange(e),
          child: Row(
            children: [
              SizedBox(height: 40.dp),
              Gaps.hGap16,
              GamingImage.network(
                url: GameService()
                    .displayIconUrl(state.gameCurrency.value?.currency),
                width: 24.dp,
                height: 24.dp,
              ),
              Gaps.hGap6,
              Text(
                e.value,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _onPressRange(RangeSettingList range) {
    Get.back<dynamic>();
    controller.setRange(range);
  }
}
