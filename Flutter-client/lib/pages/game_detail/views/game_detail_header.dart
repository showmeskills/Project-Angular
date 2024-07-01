import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/currency_ratio.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game/game_model.dart';
import 'package:gogaming_app/common/api/game/models/gaming_game_range_setting_model.dart';
import 'package:gogaming_app/common/service/game_service.dart';
import 'package:gogaming_app/common/widgets/gaming_game_image.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/service/biometric_service.dart';

class GameDetailHeader extends StatelessWidget {
  const GameDetailHeader({
    Key? key,
    required this.data,
    required this.displayCurrency,
    required this.onPressDisplay,
    required this.onPressRealMode,
    required this.onPressTryMode,
    required this.isCollection,
    required this.onPressCollection,
    this.onPressTournament,
    required this.isLogin,
    required this.needTransfer,
    required this.onPressTransfer,
    required this.currencyRatio,
    required this.tryLinkLoading,
    required this.realLinkLoading,
    required this.showRangeSetting,
    required this.gameInfoLoading,
    required this.onPressGoBackHome,
    this.curRange,
    this.onPressRangeSetting,
    this.showNoSupport,
  }) : super(key: key);

  final GamingGameModel data;
  final GamingCurrencyModel displayCurrency;
  final GestureTapCallback onPressDisplay;
  final GestureTapCallback? onPressRangeSetting;
  final GestureTapCallback onPressRealMode;
  final GestureTapCallback onPressTryMode;
  final GestureTapCallback onPressCollection;
  final GestureTapCallback? onPressTournament;
  final GestureTapCallback onPressTransfer;
  final GestureTapCallback onPressGoBackHome;
  final bool isLogin;
  final bool showRangeSetting;

  /// 是否已经收藏
  final bool isCollection;
  final bool needTransfer;
  final bool gameInfoLoading;
  final bool tryLinkLoading;
  final bool realLinkLoading;
  final GamingGameCurrencyRatio? currencyRatio;
  final RangeSettingList? curRange;
  final bool? showNoSupport;

  /// "金额将以1:xx进行展示"提示是否显示
  bool get showBalanceHint {
    return currencyRatio?.ratio != null && currencyRatio!.ratio! > 1;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsetsDirectional.all(16.dp),
      width: double.infinity,
      decoration: BoxDecoration(
        color: GGColors.darkPopBackground.color,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Stack(
        children: [
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildRow1(),
              Gaps.vGap16,
              _buildGameErrorHint(),
              _buildRow2(),
              _buildRow3(),
              if (isLogin) ...[
                _buildRowRange(),
                _buildRow4(),
              ],
              Gaps.vGap16,
              _buildActions(),
            ],
          ),
          if (gameInfoLoading) _buildLoading(),
        ],
      ),
    );
  }

  /// 显示获取游戏链接的错误提示
  Widget _buildGameErrorHint() {
    if (data.isOnline) {
      return _buildErrorHint(
        visible: showNoSupport ?? false,
        errorString: localized('provider_n_sup_region'),
      );
    }
    return _buildErrorHint(
      visible: true,
      errorString: localized('game_main_desc_re'),
    );
  }

  Widget _buildErrorHint({required bool visible, String? errorString}) {
    return Visibility(
      visible: visible,
      child: Padding(
        padding: EdgeInsets.only(bottom: 16.dp),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Gaps.vGap10,
            Text(
              errorString ?? '',
              textAlign: TextAlign.center,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.error.color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoading() {
    return Positioned.fill(
      child: Container(
        color: GGColors.darkPopBackground.color,
        child: const GoGamingLoading(),
      ),
    );
  }

  String _playGameTitle() {
    if (data.isOnline) {
      return localized(
          isLogin ? (needTransfer ? 'trans' : 'real_money') : 'login_button');
    }
    return localized("return_to_home");
  }

  GestureTapCallback _playGameTapCallback() {
    if (data.isOnline) {
      return isLogin
          ? (needTransfer ? onPressTransfer : onPressRealMode)
          : _onPressLogin;
    }
    return onPressGoBackHome;
  }

  Widget _buildActions() {
    return Row(
      children: [
        Expanded(
          child: GGButton.main(
            onPressed: _playGameTapCallback(),
            text: _playGameTitle(),
            isLoading: realLinkLoading,
            enable: !realLinkLoading && !tryLinkLoading,
            image: isLogin
                ? SvgPicture.asset(
                    needTransfer ? R.iconTransfer : R.iconPlay,
                    width: 14.dp,
                    height: 14.dp,
                  )
                : Image.asset(
                    R.appbarUnloginAvatar,
                    width: 14.dp,
                    height: 14.dp,
                    color: Colors.white,
                  ),
            space: 10,
          ),
        ),
        if (data.isTry == true && data.isOnline) ...[
          Gaps.hGap10,
          Expanded(
            child: GGButton.main(
              onPressed: onPressTryMode,
              text: localized('trial_play'),
              textColor: GGColors.textSecond.color,
              isLoading: tryLinkLoading,
              enable: !realLinkLoading && !tryLinkLoading,
              backgroundColor: GGColors.border.color,
              image: SvgPicture.asset(
                R.iconPlay,
                width: 14.dp,
                height: 14.dp,
                color: GGColors.textSecond.color,
              ),
              space: 10,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildCurrencyTip() {
    return SizedBox(
      width: 188.dp,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildExpandWidget(Text(
            localized('game_currency_tip_d', params: [
              '${currencyRatio?.ratio}'.stripTrailingZeros(),
              GameService().displayCurrency(displayCurrency.currency),
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

  Widget _buildRow4() {
    return Visibility(
      visible: showBalanceHint,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Gaps.vGap26,
          Text(
            localized('game_currency_tip', params: ['${currencyRatio?.ratio}'.stripTrailingZeros()]),
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

  /// 投注范围
  Widget _buildRowRange() {
    return Visibility(
      visible: showRangeSetting,
      child: InkWell(
        onTap: onPressRangeSetting,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
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
              url: GameService().displayIconUrl(displayCurrency.currency),
              width: 18.dp,
              height: 18.dp,
            ),
            Gaps.hGap4,
            Text(
              curRange!.value,
              // GameService().displayCurrency(displayCurrency.currency),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
                fontWeight: GGFontWeigh.bold,
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

  Widget _buildRow3() {
    return InkWell(
      onTap: onPressDisplay,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
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
          Container(
            height: 18.dp,
            alignment: Alignment.center,
            child: GamingImage.network(
              url: GameService().displayIconUrl(displayCurrency.currency),
              width: 14.dp,
              height: 14.dp,
            ),
          ),
          Gaps.hGap4,
          Text(
            GameService().displayCurrency(displayCurrency.currency),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
              fontWeight: GGFontWeigh.bold,
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

  Widget _buildRow2() {
    return _buildExpandWidget(Text(
      localized('sel_display'),
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textMain.color,
        fontWeight: GGFontWeigh.bold,
      ),
    ));
  }

  Widget _buildRow1() {
    var imageHeight = 240.dp;
    return SizedBox(
      height: imageHeight,
      child: Row(
        children: [
          GamingGameImage(
            data: data,
            onPress: () {},
            width: 180.dp,
            radius: 4.dp,
            height: imageHeight,
          ),
          Gaps.hGap16,
          Expanded(
            child: Stack(
              children: [
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildExpandWidget(Text(
                      '${data.gameName}',
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: GGTextStyle(
                        fontSize: GGFontSize.bigTitle,
                        color: GGColors.textMain.color,
                      ),
                    )),
                    Gaps.vGap4,
                    _buildExpandWidget(Text(
                      '${data.providerName}',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                      ),
                    )),
                  ],
                ),
                PositionedDirectional(
                  start: 0,
                  bottom: 0,
                  child: _buildCollectionRow(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCollectionRow() {
    return Row(
      children: [
        Visibility(
          visible: isLogin,
          child: Container(
            margin: EdgeInsets.only(right: 8.dp),
            child: InkWell(
              onTap: onPressCollection,
              child: Container(
                width: 34.dp,
                height: 24.dp,
                decoration: BoxDecoration(
                  color: GGColors.background.color,
                  borderRadius: BorderRadius.circular(5),
                ),
                alignment: AlignmentDirectional.center,
                child: SvgPicture.asset(
                  isCollection ? R.iconStarFill : R.iconStar,
                  width: 14.dp,
                  height: 14.dp,
                  color: GGColors.textSecond.color,
                ),
              ),
            ),
          ),
        ),
        if (onPressTournament != null)
          InkWell(
            onTap: onPressTournament,
            child: Container(
              width: 34.dp,
              height: 24.dp,
              decoration: BoxDecoration(
                color: GGColors.background.color,
                borderRadius: BorderRadius.circular(5),
              ),
              alignment: AlignmentDirectional.center,
              child: GamingImage.asset(
                R.tournamentAppbarRightIcon,
                width: 14.dp,
                height: 14.dp,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildExpandWidget(Widget text) {
    return Row(children: [Expanded(child: text)]);
  }
}

extension _Action on GameDetailHeader {
  void _onPressLogin() {
    if (BiometricService.sharedInstance.canBiometricLogin()) {
      Get.toNamed<dynamic>(Routes.biometricLogin.route);
    } else {
      Get.toNamed<dynamic>(Routes.login.route);
    }
  }
}
