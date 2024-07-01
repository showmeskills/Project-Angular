// ignore_for_file: unused_element

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/lucky_spin/models/game_lucky_spin_information_model.dart';
import 'package:gogaming_app/common/clipper/rect_cycle_clipper.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/pages/gaming_game/gaming_lucky_spin/animations/animation_ratation_view.dart';
import 'package:gogaming_app/widget_header.dart';
import 'dart:math' as math;

class GamingTurntableViewM1 extends StatelessWidget {
  GamingTurntableViewM1({
    super.key,
    required this.informationMode,
    required this.rotationAnimation,
  });

  final GameLuckySpinInformationModel informationMode;
  final cycWidth = 329.dp;

  /// 控制大转盘旋转
  final Animation<double> rotationAnimation;

  /// 每一格的角度
  final perAngle = math.pi * 2 / 12.0;
  final imageWidth = 153.7.dp;
  final imageHeight = 86.dp;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: cycWidth,
      height: 329.dp,
      child: Stack(
        children: [
          Positioned.fill(child: _buildTurntable()),
          Positioned.fill(child: _buildCycHalfRight()),
          Positioned.fill(child: _buildCycHalfLeft()),
          _buildArrow(),
        ],
      ),
    );
  }

  Widget _buildArrow() {
    final defaultAngle = 5.5 * perAngle;
    return Container(
      alignment: Alignment.centerLeft,
      child: Transform.rotate(
        alignment: AlignmentDirectional.centerEnd,
        angle: defaultAngle,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              R.gameLuckyTurntableArrow,
              width: imageWidth,
              height: imageHeight,
              fit: BoxFit.fitHeight,
            ),
            if (Config.isM1) SizedBox(width: cycWidth / 2 - imageWidth + 2),
            if (!Config.isM1) SizedBox(width: cycWidth / 2 - imageWidth + 7),
          ],
        ),
        // child: RotationTransition(
        //   turns: new AlwaysStoppedAnimation(15 / 360),
        //   child: new Text("Lorem ipsum"),
      ),
    );
  }

  Widget _buildAllInfoVer3() {
    final defaultAngle = -perAngle * 2.5;
    final allInfo = informationMode.prizeInfos.map((e) {
      final index = informationMode.prizeInfos.indexOf(e);
      return Transform.rotate(
        alignment: AlignmentDirectional.centerStart,
        angle: defaultAngle + index * perAngle,
        child: ClipPath(
          clipper: RectCycleClipper(
            startAngle: -15,
            angle: 30,
          ),
          child: SizedBox(
            width: cycWidth / 2,
            child: Row(
              children: [
                SizedBox(width: cycWidth / 2 - imageWidth + 21),
                Expanded(
                  child: Text(
                    e.prizeText,
                    maxLines: 1,
                    overflow: TextOverflow.fade,
                    textAlign: TextAlign.end,
                    softWrap: false,
                    style: TextStyle(
                      color: GGColors.buttonTextWhite.color,
                      fontSize: 18,
                      height: 1.0,
                    ),
                    // ),
                  ),
                ),
                SizedBox(width: 4.dp),
                GamingImage.network(
                  url: e.iconUrl,
                  width: 26.dp,
                  height: 26.dp,
                ),
                SizedBox(width: 34.dp, height: 74.5.dp),
              ],
            ),
          ),
        ),
      );
    }).toList();

    return Container(
      alignment: Alignment.centerRight,
      child: Stack(
        children: allInfo,
      ),
    );
  }

  Widget _buildAllInfoVer2() {
    final defaultAngle = perAngle * 3.5;
    final allInfo = informationMode.prizeInfos.map((e) {
      final index = informationMode.prizeInfos.indexOf(e);
      return Transform.rotate(
        alignment: AlignmentDirectional.centerEnd,
        angle: defaultAngle + index * perAngle,
        child: ClipPath(
          clipper: RectCycleClipper(
            startAngle: 180 - 15,
            angle: 30,
          ),
          child: SizedBox(
            width: cycWidth / 2,
            child: Row(
              children: [
                SizedBox(width: 34.dp, height: 74.5.dp),
                GamingImage.network(
                  url: e.iconUrl,
                  width: 26.dp,
                  height: 26.dp,
                ),
                SizedBox(width: 4.dp),
                Expanded(
                  child: Text(
                    e.prizeText,
                    maxLines: 1,
                    overflow: TextOverflow.fade,
                    softWrap: false,
                    style: TextStyle(
                      color: GGColors.buttonTextWhite.color,
                      fontSize: 18,
                      height: 1.0,
                    ),
                    // ),
                  ),
                ),
                SizedBox(width: cycWidth / 2 - imageWidth + 21),
              ],
            ),
          ),
        ),
      );
    }).toList();

    return Container(
      alignment: Alignment.centerLeft,
      child: Stack(
        children: allInfo,
      ),
    );
  }

  Widget _buildTurntable() {
    return AnimationRotationView(
      controller: rotationAnimation,
      child: Stack(
        children: [
          Container(
            margin: EdgeInsets.all(16.dp),
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage(R.gameLuckyTurntableBgM1),
                fit: BoxFit.cover,
              ),
            ),
          ),
          _buildAllInfoVer3(),
        ],
      ),
    );
  }

  Widget _buildCycHalfLeft() {
    return AnimationRotationView(
      repeat: true,
      duration: const Duration(seconds: 6),
      child: SvgPicture.asset(R.gameLuckyTurntableCycHalfLeft),
    );
  }

  Widget _buildCycHalfRight() {
    return AnimationRotationView(
      repeat: true,
      duration: const Duration(seconds: 6),
      reverse: true,
      begin: 0.0,
      end: -1.0,
      child: SvgPicture.asset(R.gameLuckyTurntableCycHalfRight),
    );
  }
}
