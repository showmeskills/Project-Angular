import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../R.dart';
import '../../../common/api/game/models/gaming_game_provider_model.dart';
import '../../../common/service/game_service.dart';
import '../../../common/service/game_webview_manager.dart';
import '../../../common/widgets/gaming_selector/gaming_selector.dart';
import '../../../common/widgets/gg_button.dart';
import '../../../common/widgets/webview_flutter/webview_flutter_page.dart';
import 'list_game_logic.dart';

class ListGameWidget extends StatelessWidget {
  ListGameWidget({Key? key, required this.provider}) : super(key: key);
  final GamingGameProviderModel provider;

  ListGameLogic get logic => Get.find<ListGameLogic>();
  final webview = ThirdGameWebViewManger.sharedInstance;

  @override
  Widget build(BuildContext context) {
    Get.put(ListGameLogic(
      webview: webview,
      currentProvider: provider,
    ));
    return Stack(
      key: logic.stackKey,
      children: [
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              color: GGColors.border.color,
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
        Positioned.fill(
          left: 4.dp,
          right: 4.dp,
          top: 4.dp,
          bottom: 4.dp,
          child: _buildContent(),
        ),
      ],
    );
  }

  Widget _buildContent() {
    final Set<Factory<OneSequenceGestureRecognizer>> gestureRecognizers = {
      Factory(() => EagerGestureRecognizer())
    };
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Gaps.hGap2,
            Text(
              provider.providerName ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.smallTitle,
                color: GGColors.textMain.color,
              ),
            ),
            const Spacer(),
            Text(
              localized('show_curr'),
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textSecond.color,
              ),
            ),
            Gaps.hGap4,
            _buildSelectCurrency(),
            Gaps.hGap2,
          ],
        ),
        Gaps.vGap2,
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: WebViewFlutterPage(
              webController: webview.webViewController,
              userAgent: logic.ua,
              gestureRecognizers: gestureRecognizers,
              appBar: const PreferredSize(
                preferredSize: Size(0, 0),
                child: SizedBox(),
              ),
              stackWidgets: [
                _buildStatusWidget(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSelectCurrency() {
    return ScaleTap(
      onPressed: () {
        _onPressGameCurrency();
      },
      child: Obx(() {
        return Row(
          children: [
            Text(
              GameService().displayCurrency(logic.selectedCurrency.value),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
            ),
            Gaps.hGap4,
            GamingImage.network(
              url: GameService().displayIconUrl(logic.selectedCurrency.value),
              width: 14.dp,
              height: 14.dp,
            ),
            Gaps.hGap4,
            GamingImage.asset(
              R.iconArrowDown,
              width: 14.dp,
              height: 14.dp,
              color: GGColors.textSecond.color,
            )
          ],
        );
      }),
    );
  }

  Widget _buildStatusWidget() {
    return Obx(() {
      return Visibility(
        visible: logic.gameLink.isEmpty,
        child: Container(
          width: double.infinity,
          height: double.infinity,
          color: GGColors.gameListHeaderBackground.color,
          child: Obx(() {
            return Stack(
              children: [
                Positioned.fill(
                  child: Visibility(
                    visible: logic.pageState == PageState.usual,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        _buildGameErrorHint(),
                        Gaps.vGap16,
                        _buildAction(),
                      ],
                    ),
                  ),
                ),
                Obx(() => logic.pageState == PageState.loading
                    ? const GoGamingLoading()
                    : Container()),
              ],
            );
          }),
        ),
      );
    });
  }

  Widget _buildGameErrorHint() {
    return Visibility(
      visible: logic.playGameError.value.isNotEmpty,
      child: Padding(
        padding: EdgeInsets.only(bottom: 16.dp),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Gaps.vGap26,
            Expanded(
              child: Text(
                logic.playGameError.value,
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

  Widget _buildAction() {
    return Visibility(
      visible: (logic.playGameError.value.isEmpty &&
          !AccountService.sharedInstance.isLogin),
      child: SizedBox(
        width: Get.width * 0.3,
        child: GGButton.main(
          onPressed: () {
            Get.toNamed<dynamic>(Routes.login.route);
          },
          text: localized("login_button"),
          image: SvgPicture.asset(
            R.iconPersonal,
            width: 14.dp,
            height: 14.dp,
            color: GGColors.buttonTextWhite.color,
          ),
          space: 10,
        ),
      ),
    );
  }

  void _onPressCurrency(String currency) {
    Get.back<dynamic>();
    logic.changeSelectedCurrency(currency);
  }

  void _onPressGameCurrency() {
    final list = provider.currencies;
    GamingSelector.simple<String>(
      title: localized('sel_display'),
      original: list,
      itemBuilder: (context, e, index) {
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
            ],
          ),
        );
      },
    );
  }
}
