// ignore_for_file: dead_code

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/lucky_spin/models/game_lucky_spin_information_model.dart';
import 'package:gogaming_app/common/service/game_flame_audio_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/header/gg_user_app_bar_controller.dart';
import 'package:gogaming_app/config/user_setting.dart';
import 'package:gogaming_app/pages/gaming_game/gaming_lucky_spin_history_m1/gaming_lucky_spin_history_view_m1.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:visibility_detector/visibility_detector.dart';

import '../../../common/service/biometric_service.dart';
import 'animations/animation_screen_move_view.dart';
import 'gaming_lucky_spin_explain_view_m1.dart';
import 'gaming_lucky_spin_logic_m1.dart';
import 'views/gaming_turntable_view_m1.dart';
import 'views/lucky_spin_banner_header.dart';
import 'views/lucky_spin_swiper_m1.dart';

part 'gaming_lucky_spin_info_detail_view_m1.dart';

class GamingLuckySpinViewM1 extends GetView<GamingLuckySpinLogicM1> {
  final BuildContext context;

  const GamingLuckySpinViewM1({
    super.key,
    required this.context,
  });
  GGUserAppBarController get barLogic => Get.find<GGUserAppBarController>();

  @override
  Widget build(BuildContext context) {
    Get.lazyPut(() => GamingLuckySpinLogicM1());
    return Obx(() {
      return VisibilityDetector(
        key: const Key('GamingLuckySpinViewM1'),
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
              borderRadius: BorderRadius.circular(10.dp),
              image: const DecorationImage(
                image: AssetImage(R.gameLuckySpinMaskM1),
                fit: BoxFit.fill,
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
    // final isDisappearing = controller.state.curMode.value >= 2;
    // wu2021-17789不再有消失/出现的动画逻辑
    // ignore: prefer_const_declarations
    final isDisappearing = false;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        Padding(
          padding: EdgeInsets.symmetric(horizontal: 10.dp, vertical: 10.dp),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              //顶部banner
              Positioned(
                top: 23.dp,
                child: AnimationScreenMoveView(
                  from: Alignment.topCenter,
                  // duration: const Duration(milliseconds: 300),
                  child: LuckySpinBannerHeader(
                    title: controller.state.informationModel?.slogan ?? '',
                  ),
                ),
              ),
              //大转盘
              Positioned(
                top: 192.dp,
                child: Stack(
                  children: [
                    AnimatedScale(
                      duration: const Duration(milliseconds: 300),
                      scale: showResult ? 0.0 : 1.0,
                      child: AnimationScreenMoveView(
                        from: Alignment.topCenter,
                        child: GetBuilder(
                          init: controller,
                          builder: (_) {
                            return GamingTurntableViewM1(
                              informationMode:
                                  controller.state.informationModel!,
                              rotationAnimation: controller.rotationAnimation,
                            );
                          },
                        ),
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
                ),
              ),
              //抽奖按钮
              Positioned(
                bottom: 61.dp,
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 300),
                  opacity: isDisappearing ? 0 : 1.0,
                  child: AnimationScreenMoveView(
                    from: isDisappearing ? null : Alignment.bottomCenter,
                    to: isDisappearing ? Alignment.bottomCenter : null,
                    duration:
                        Duration(milliseconds: isDisappearing ? 300 : 800),
                    child: Obx(
                      () => GamingLuckySpinInfoDetailViewM1(
                        key: ValueKey(controller.getCurType()),
                        resultBtn: controller.state.curMode.value != 3
                            ? null
                            : _buildResultBtn(),
                      ),
                    ),
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
                  Gaps.vGap20,
                ],
              ),
            ],
          ),
        ),
        Positioned(
          right: 0,
          bottom: 247.dp,
          child: AnimatedOpacity(
            duration: const Duration(milliseconds: 300),
            opacity: isDisappearing ? 0 : 1.0,
            child: _buildHistoryBtn(),
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
          top: 55.dp,
          child: _buildResultContent(),
        ),
        // Padding(
        //   padding: EdgeInsets.symmetric(horizontal: 10.dp, vertical: 10.dp),
        //   child: Stack(
        //     clipBehavior: Clip.none,
        //     children: [
        //       Column(
        //         children: [
        //           _buildTitle(context),
        //           const Spacer(),
        //           _buildResultBtn(),
        //           Gaps.vGap32,
        //         ],
        //       ),
        //     ],
        //   ),
        // ),
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
                fit: BoxFit.cover,
              ),
              Container(
                constraints: BoxConstraints(maxWidth: 260.dp),
                child: Text(
                  textAlign: TextAlign.center,
                  '${localized('whe_win_txt')}\n${controller.state.resultPrize!.prizeResultText}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.superBigTitle,
                    color: GGColors.buttonTextWhite.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
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
          width: double.infinity,
          height: 48.dp,
          margin: EdgeInsets.symmetric(horizontal: 12.dp),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(35),
            color: const Color(0xFFFB6943),
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
          Gaps.hGap12,
          InkWell(
            onTap: () {
              _onClickMusic();
            },
            child: Image.asset(
              GameFlameAudioService.sharedInstance.isPlaying.value
                  ? R.gameGameMusicOpen
                  : R.gameGameMusicClose,
              height: 18.dp,
              color: GGColors.buttonTextWhite.color.withOpacity(0.2),
            ),
          ),
          Gaps.hGap12,
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
    return _buildHistoryBtnM1();
  }

  Widget _buildHistoryBtnM1() {
    return InkWell(
      onTap: _showHistoryDialog,
      child: GamingImage.asset(
        'assets/images/game/lucky_spin_his_${UserSetting.sharedInstance.lang}_m1.svg',
        width: 40.dp,
        height: 173.dp,
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
          child: LuckySpinSwiperM1(
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
        color: const Color(0xFF000000).withOpacity(0.1),
        border: Border.all(width: 1, color: Colors.white.withOpacity(0.1)),
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

extension _Action on GamingLuckySpinViewM1 {
  void _showExplainDialog() {
    _showHistoryGeneralDialog(builder: (BuildContext context) {
      return Center(
        child: Material(
            elevation: 0,
            borderRadius: BorderRadius.circular(20.dp),
            child: GamingLuckySpinExplainViewM1(
              context: context,
              height: controller.state.height.value,
              content: controller.state.informationModel?.content ?? '',
              title: controller.state.informationModel?.slogan ?? '',
            )),
      );
    });
  }

  void _showHistoryDialog() {
    _showHistoryGeneralDialog(builder: (BuildContext context) {
      return Center(
        child: Material(
          elevation: 0,
          color: Colors.transparent,
          child: GamingLuckySpinHistoryViewM1(
            context: context,
            height: controller.state.height.value,
            title: controller.state.informationModel?.slogan ?? '',
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
