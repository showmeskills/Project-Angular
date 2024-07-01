import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/url_scheme_util.dart';
import 'package:gogaming_app/widget_header.dart';

import 'gaming_image/fuzzy_url_parser.dart';

class GamingGameImage extends StatelessWidget {
  const GamingGameImage({
    super.key,
    required this.data,
    this.width,
    this.height,
    this.radius,
    this.onPress,
  });

  final GamingGameModel data;
  final double? width;
  final double? height;
  final double? radius;
  final VoidCallback? onPress;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      scaleMinValue: 0.98,
      opacityMinValue: 0.8,
      onPressed: onPress ?? _onPress,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: GGColors.background.color,
          // boxShadow: [
          //   BoxShadow(
          //     offset: Offset(0, 3.dp),
          //     blurRadius: 6.dp,
          //     color: GGColors.shadow.color,
          //   ),
          // ],
          borderRadius: BorderRadius.circular(radius ?? 0),
        ),
        child: Stack(
          children: [
            Positioned.fill(
              child: GamingImage.fuzzyNetwork(
                url: FuzzyUrlParser(url: data.webLogo ?? '').toString(),
                progressUrl:
                    FuzzyUrlParser.blur(url: data.webLogo ?? '').toString(),
                fit: BoxFit.cover,
                width: width,
                height: height,
                radius: radius ?? 0,
                errorBuilder: (context, error, stack) {
                  return Image.asset(
                    R.gameGameCoverCh,
                    fit: BoxFit.cover,
                    width: width,
                    height: height,
                  );
                },
              ),
            ),
            // TODO(lucky): Stack方式实现此ui会导致多余白边
            if (!data.isOnline)
              Positioned.fill(
                child: Material(
                  borderRadius: BorderRadius.circular(radius ?? 0),
                  color: Colors.black.withOpacity(0.8),
                  child: Center(
                    child: Text(
                      localized('game_main'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  /// 默认点击跳转游戏详情页
  void _onPress() {
    if (!data.isOnline) return;

    final isOriginalGame =
        data.providerCatId == Config.currentConfig.gameConfig.originalProvider;
    if (isOriginalGame) {
      final gameUrl =
          Config.currentConfig.gameConfig.originalGameUrl(data.gameId ?? '');
      H5WebViewManager.sharedInstance.openOriginalWebGame(url: gameUrl);
      return;
    }

    //暂时判断gameLabels，等后端isFullScreen逻辑完成后去掉
    const labelId = '1403283308530245';
    // 当appRedirectUrl不为空时，跳转到appRedirectUrl
    if (data.appRedirectUrl?.isEmpty ?? true) {
      if (data.isFullScreen == true ||
          data.gameLabels?.firstWhereOrNull((e) => e.code == labelId) != null) {
        Get.toNamed<dynamic>(Routes.gamePlayReady.route, arguments: {
          'providerId': data.providerCatId,
          'gameId': data.gameId,
        });
      } else {
        Get.toNamed<dynamic>(Routes.gameDetail.route, arguments: {
          'providerId': data.providerCatId,
          'gameId': data.gameId,
        });
      }
    } else {
      UrlSchemeUtil.navigateTo(data.appRedirectUrl!);
    }
  }
}
