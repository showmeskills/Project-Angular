import 'package:flutter/material.dart';
import 'package:gogaming_app/common/components/extensions/number_extension.dart';

import 'dart:math' as math;

import '../../../../../common/theme/text_styles/gg_text_styles.dart';

class NonestickyProgress extends StatelessWidget {
  const NonestickyProgress({
    super.key,
    required this.isCasino,
    required this.progress,
  });

  final bool isCasino;

  /// 最大为 1
  final double progress;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (BuildContext context, BoxConstraints constraints) {
        return SizedBox(
          width: constraints.maxWidth,
          child: Stack(
            clipBehavior: Clip.none,
            alignment: AlignmentDirectional.centerStart,
            children: [
              _backgroundWidget(),
              Positioned(
                right: 0.dp,
                top: 0.dp,
                bottom: 0.dp,
                left: progress * constraints.maxWidth,
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(70),
                    borderRadius: const BorderRadius.horizontal(
                      right: Radius.circular(26),
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 0.dp,
                bottom: 0.dp,
                left: progress * constraints.maxWidth - 8.dp,
                child: Transform.rotate(
                  angle: math.pi / 4.0,
                  child: Container(
                    width: 16.dp,
                    height: 16.dp,
                    decoration: BoxDecoration(
                      color: isCasino
                          ? const Color(0xFF6D01AD)
                          : const Color(0xFFC70160),
                      border: Border.all(
                        width: 1.dp,
                        color: Colors.white,
                      ),
                      borderRadius: const BorderRadius.all(
                        Radius.circular(4),
                      ),
                    ),
                  ),
                ),
              ),
              Positioned.fill(
                child: Text(
                  '${(progress * 100).toStringAsFixed(2).stripTrailingZeros()}%',
                  textAlign: TextAlign.center,
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  ///background
  Widget _backgroundWidget() {
    return Container(
      width: double.infinity,
      height: 16.dp,
      decoration: BoxDecoration(
        borderRadius: const BorderRadius.all(Radius.circular(26)),
        border: Border.all(
          width: 1.dp,
          color: Colors.white.withAlpha(30),
        ),
        gradient: isCasino
            ? const LinearGradient(
                colors: [
                  Color(0xFFC70160),
                  Color(0xFF6D01AD),
                ],
              )
            : const LinearGradient(
                colors: [
                  Color(0xFFEAA941),
                  Color(0xFFC70160),
                ],
              ),
      ),
    );
  }
}
