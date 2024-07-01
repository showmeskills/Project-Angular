import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/lucky_spin/models/game_lucky_spin_information_model.dart';
import 'package:gogaming_app/common/service/game_flame_audio_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/header/gg_user_app_bar_controller.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/config/user_setting.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../../../common/service/biometric_service.dart';
import '../gaming_lucky_spin_history/gaming_lucky_spin_history_view.dart';
import 'animations/animation_screen_move_view.dart';
import 'gaming_lucky_spin_explain_view.dart';
import 'gaming_lucky_spin_logic.dart';
import 'views/gaming_turntable_view.dart';
import 'views/lucky_spin_swiper.dart';

part 'gaming_lucky_spin_info_detail_view.dart';

class GamingLuckySpinView extends GetView<GamingLuckySpinLogic> {
  final BuildContext context;

  const GamingLuckySpinView({
    super.key,
    required this.context,
  });
  GGUserAppBarController get barLogic => Get.find<GGUserAppBarController>();

  @override
  Widget build(BuildContext context) {
    Get.lazyPut(() => GamingLuckySpinLogic());
    return Obx(() {
      return VisibilityDetector(
        key: const Key('GamingLuckySpinView'),
        onVisibilityChanged: (visibilityInfo) {
          if (visibilityInfo.visibleFraction == 0) {
            barLogic.leaveGame();
            GameFlameAudioService.sharedInstance.pauseOnly();
          } else {
            barLogic.enterGameDetail('-1');
            GameFlameAudioService.sharedInstance.resumeOnly();
          }
        },
        child: AnimatedContainer(
            duration: const Duration(milliseconds: 400),
            width: 349.dp,
            height: controller.state.height.value,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20.dp),
              border: Border.all(
                color: const Color(0xFF00A3FF),
                width: 1.dp,
              ),
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF0F1E29),
                  Color(0xFF1D5F8C),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            child: controller.state.isLoading.value
                ? const GoGamingLoading()
                : _buildContentDetail(context)),
      );
    });
  }

  Widget _buildContentDetail(BuildContext context) {
    if (controller.state.informationModel == null) return Container();
    final showResult = controller.state.curMode.value == 3;
    final isDisappearing = controller.state.curMode.value >= 2;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Positioned(bottom: 0, left: 0, right: 0, child: _buildMaskBg()),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 10.dp, vertical: 10.dp),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              //头部转盘
              Positioned(
                top: 30.dp,
                child: AnimatedScale(
                  duration: const Duration(milliseconds: 300),
                  scale: showResult ? 0.0 : 1.0,
                  child: AnimationScreenMoveView(
                    from: Alignment.topCenter,
                    child: GetBuilder(
                      init: controller,
                      builder: (_) {
                        return GamingTurntableView(
                          informationMode: controller.state.informationModel!,
                          rotationAnimation: controller.rotationAnimation,
                        );
                      },
                    ),
                  ),
                ),
              ),
              //中间luck横幅和抽奖按钮
              Positioned(
                bottom: 41.dp,
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 300),
                  opacity: isDisappearing ? 0 : 1.0,
                  child: AnimationScreenMoveView(
                    from: isDisappearing ? null : Alignment.bottomCenter,
                    to: isDisappearing ? Alignment.bottomCenter : null,
                    duration:
                        Duration(milliseconds: isDisappearing ? 300 : 800),
                    child: const GamingLuckySpinInfoDetailView(),
                  ),
                ),
              ),
              Column(
                children: [
                  _buildTitle(context),
                  const Spacer(),
                  Visibility(
                    visible: !isDisappearing,
                    child: _buildPrizeList(),
                  ),
                ],
              ),
            ],
          ),
        ),
        Positioned(
          right: 0,
          bottom: 130.dp,
          child: AnimatedOpacity(
            duration: const Duration(milliseconds: 300),
            opacity: isDisappearing ? 0 : 1.0,
            child: _buildHistoryBtn(),
          ),
        ),
        Positioned.fill(
          child: AnimatedScale(
            duration: const Duration(milliseconds: 300),
            scale: showResult ? 1.0 : 0.0,
            child: _buildLowContent(context),
          ),
        ),
      ],
    );
  }

  /// 转动的UI，和结果页 TUDU
  Widget _buildLowContent(BuildContext context) {
    if (controller.state.curMode.value != 3) return Container();

    return Stack(
      clipBehavior: Clip.none,
      children: [
        Positioned(
          top: 70.dp,
          child: _buildResultContent(),
        ),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 10.dp, vertical: 10.dp),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Column(
                children: [
                  _buildTitle(context),
                  const Spacer(),
                  _buildResultBtn(),
                  Gaps.vGap32,
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildResultContent() {
    return controller.state.resultPrize != null &&
            GGUtil.parseInt(controller.state.resultPrize?.prizeId) != -1
        ? Stack(
            alignment: Alignment.center,
            children: [
              Image.asset(
                R.gameGameLuckyResultSuccess,
                width: 349.dp,
                height: 208.dp,
                fit: BoxFit.fitWidth,
              ),
              Container(
                constraints: BoxConstraints(maxWidth: 260.dp),
                child: Text(
                  textAlign: TextAlign.center,
                  localized('whe_win_txt') +
                      controller.state.resultPrize!.prizeText,
                  style: GGTextStyle(
                      fontSize: GGFontSize.superBigTitle,
                      color: GGColors.buttonTextWhite.color,
                      fontWeight: GGFontWeigh.bold),
                  maxLines: 3,
                ),
              ),
            ],
          )
        : SizedBox(
            width: 349.dp,
            height: 208.dp,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset(
                  R.gameGameLuckyResultFail,
                  width: 87.dp,
                  height: 89.dp,
                  fit: BoxFit.fitWidth,
                ),
                Gaps.vGap20,
                Container(
                  constraints: BoxConstraints(maxWidth: 260.dp),
                  child: Text(
                    textAlign: TextAlign.center,
                    localized('whe_lose_txt'),
                    style: GGTextStyle(
                        fontSize: GGFontSize.superBigTitle,
                        color: GGColors.buttonTextWhite.color,
                        fontWeight: GGFontWeigh.bold),
                    maxLines: 3,
                  ),
                ),
              ],
            ),
          );
  }

  /// 结果的底部按钮
  Widget _buildResultBtn() {
    return InkWell(
        onTap: _onClickResultBtn,
        child: Container(
          width: 272.dp,
          height: 44.dp,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(50.dp),
            gradient: const LinearGradient(
              colors: [
                Color(0xFFFFA901),
                Color(0xFFF04E23),
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: Text(
            controller.state.resultPrize != null &&
                    GGUtil.parseInt(controller.state.resultPrize?.prizeId) != -1
                ? localized('whe_g_g')
                : localized('whe_ag_t'),
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle,
              color: GGColors.buttonTextWhite.color,
            ),
          ),
        ));
  }

  Widget _buildMaskBg() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20.dp),
      child: Image.asset(
        R.gameLuckySpinMask,
        width: 349.dp,
        height: 373.dp,
        fit: BoxFit.fill,
      ),
    );
  }

  /// 顶部按钮
  Widget _buildTitle(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(right: 10.dp),
      child: Row(
        children: [
          const Spacer(),
          Visibility(
            visible: controller.state.curMode.value == 1,
            child: InkWell(
              onTap: _showExplainDialog,
              child: Image.asset(
                R.gameGameExplain,
                height: 18.dp,
              ),
            ),
          ),
          Gaps.hGap24,
          InkWell(
            onTap: () {
              _onClickMusic();
            },
            child: Image.asset(
              GameFlameAudioService.sharedInstance.isPlaying.value
                  ? R.gameGameMusicOpen
                  : R.gameGameMusicClose,
              height: 18.dp,
            ),
          ),
          Gaps.hGap24,
          InkWell(
            onTap: () {
              Navigator.of(context).pop();
            },
            child: SvgPicture.asset(
              R.iconClose,
              height: 17.dp,
              color: GGColors.buttonTextWhite.color.withOpacity(0.2),
            ),
          ),
        ],
      ),
    );
  }

  /// 历史记录入口
  Widget _buildHistoryBtn() {
    return Config.isM1 ? _buildHistoryBtnM1() : _buildHistoryBtnM2();
  }

  Widget _buildHistoryBtnM2() {
    return InkWell(
      onTap: _showHistoryDialog,
      child: GamingImage.asset(
        'assets/images/game/lucky_wheel_history_${UserSetting.sharedInstance.lang}.png',
        width: 32.dp,
        height: 131.dp,
      ),
      // child: Container(
      //   padding:
      //       EdgeInsets.only(top: 20.dp, bottom: 20.dp, left: 5.dp, right: 5.dp),
      //   decoration: BoxDecoration(
      //     borderRadius: BorderRadius.only(
      //       topLeft: Radius.circular(20.dp),
      //       bottomLeft: Radius.circular(20.dp),
      //     ),
      //     gradient: const LinearGradient(
      //       colors: [
      //         Color(0xFF40AFFF),
      //         Color(0xFF0057FF),
      //       ],
      //       begin: Alignment.centerLeft,
      //       end: Alignment.centerRight,
      //     ),
      //   ),
      //   child: Container(
      //     alignment: Alignment.centerRight,
      //     width: 14.dp,
      //     child: RotatedBox(
      //       quarterTurns:
      //           AppLocalizations.of(Get.context!).isMandarin() ? 4 : -1, //
      //       child: Text(
      //         localized('whe_prize_h'),
      //         style: GGTextStyle(
      //           fontSize: GGFontSize.content,
      //           color: GGColors.buttonTextWhite.color,
      //           fontWeight: GGFontWeigh.bold,
      //         ),
      //       ),
      //     ),
      //   ),
      // ),
    );
  }

  Widget _buildHistoryBtnM1() {
    return InkWell(
      onTap: _showHistoryDialog,
      child: Container(
        padding:
            EdgeInsets.only(top: 20.dp, bottom: 20.dp, left: 5.dp, right: 5.dp),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20.dp),
            bottomLeft: Radius.circular(20.dp),
          ),
          gradient: const LinearGradient(
            colors: [
              Color(0xFF40AFFF),
              Color(0xFF0057FF),
            ],
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
          ),
        ),
        child: Container(
          alignment: Alignment.centerRight,
          width: 14.dp,
          child: RotatedBox(
            quarterTurns:
                AppLocalizations.of(Get.context!).isMandarin() ? 4 : -1, //
            child: Text(
              localized('whe_prize_h'),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.buttonTextWhite.color,
                fontWeight: GGFontWeigh.bold,
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// 底部奖品
  Widget _buildPrizeList() {
    return Obx(() {
      return Visibility(
        visible: controller.state.informationModel != null,
        child: SizedBox(
          height: 36.dp,
          width: double.infinity,
          child: LuckySpinSwiper(
            autoplayDelay: 3000,
            autoplayAfter: 1000,
            count: controller.state.informationModel!.prizeInfos.length,
            builder: (p0, p1) {
              return _buildPrizeItem(
                controller.state.informationModel!.prizeInfos[p1],
              );
            },
          ),
        ),
      );
    });
  }

  Widget _buildPrizeItem(Prizeinfos item) {
    return Container(
      height: 36.dp,
      padding: EdgeInsets.only(left: 5.dp, right: 5.dp),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18.dp),
        color: const Color(0xFF000000).withOpacity(0.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          GamingImage.network(
            url: item.iconUrl,
            width: 28.dp,
            height: 28.dp,
          ),
          Gaps.hGap4,
          if (item.prizeType <= 3) ...[
            Text(item.currency,
                style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.bold)),
            Gaps.hGap4,
            Text(item.amountText,
                style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.bold)),
          ],
          if (item.prizeType > 3)
            Text(item.prizeFullName,
                style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.bold)),
        ],
      ),
    );
  }
}

extension _Action on GamingLuckySpinView {
  void _showExplainDialog() {
    _showHistoryGeneralDialog(builder: (BuildContext context) {
      return Center(
        child: Material(
            elevation: 0,
            borderRadius: BorderRadius.circular(20.dp),
            child: GamingLuckySpinExplainView(
              context: context,
              height: controller.state.height.value,
              content: controller.state.informationModel?.content ?? '',
            )),
      );
    });
  }

  void _showHistoryDialog() {
    _showHistoryGeneralDialog(builder: (BuildContext context) {
      return Center(
        child: Material(
          elevation: 0,
          borderRadius: BorderRadius.circular(20.dp),
          child: GamingLuckySpinHistoryView(
            context: context,
            height: controller.state.height.value,
          ),
        ),
      );
    });
  }

  void _showHistoryGeneralDialog({
    required Widget Function(BuildContext) builder,
    Widget? child,
  }) {
    showGeneralDialog(
      context: context,
      pageBuilder: (BuildContext buildContext, Animation<double> animation,
          Animation<double> secondaryAnimation) {
        final Widget pageChild = child ?? Builder(builder: builder);
        return Builder(builder: (BuildContext context) {
          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () {},
            child: pageChild,
          );
        });
      },
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      transitionDuration: const Duration(milliseconds: 400),
      transitionBuilder: (BuildContext context, Animation<double> animation,
          Animation<double> secondaryAnimation, Widget child) {
        return FractionalTranslation(
          translation: Offset(1 - animation.value, 0),
          child: child,
        );
      },
    );
  }

  /// 抽奖 or 登录
  void _onClickResultBtn() {
    if (controller.state.resultPrize != null &&
        GGUtil.parseInt(controller.state.resultPrize?.prizeId) != -1) {
      // 去游戏
      if (controller.state.oriGame == null) {
        controller.loadGame(false);
        return;
      }
      Navigator.of(context).pop();
      Get.toNamed<dynamic>(Routes.gameList.route, arguments: {
        'labelId': controller.state.oriGame?.code,
        'image': controller.state.oriGame?.icon,
        'title': controller.state.oriGame?.name,
      });
    } else {
      // 再抽一次
      controller.reset();
    }
  }

  void _onClickMusic() {
    if (GameFlameAudioService.sharedInstance.isPlaying.value) {
      controller.pause();
    } else {
      controller.resume();
    }
  }
}
