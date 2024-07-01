import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/widget_header.dart';

import 'lucky_spin_banner_header.dart';

class LuckSpinBgView extends StatelessWidget {
  const LuckSpinBgView({
    super.key,
    this.width,
    required this.height,
    required this.title,
    required this.child,
  });
  final double? width;
  final double height;
  final String title;
  final Widget child;
  @override
  Widget build(BuildContext context) {
    return Container(
      width: width ?? 349.dp,
      height: height,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10.dp),
        image: const DecorationImage(
          image: AssetImage(R.gameLuckySpinMaskM1),
          fit: BoxFit.fill,
        ),
      ),
      child: Column(
        children: [
          _buildTitle(context),
          LuckySpinBannerHeader(
            title: title,
          ),
          Expanded(
            child: Container(
              margin: EdgeInsets.only(
                left: 15.dp,
                right: 15.dp,
                top: 10.dp,
                bottom: 25.dp,
              ),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10.dp),
                color: Colors.black.withOpacity(0.23),
              ),
              child: child,
            ),
          ),
        ],
      ),
    );
  }

  /// 顶部按钮
  Widget _buildTitle(BuildContext context) {
    return Gaps.vGap32;
    // return Container(
    //   width: double.infinity,
    //   padding: EdgeInsets.only(right: 10.dp),
    //   child: Row(
    //     children: [
    //       const Spacer(),
    //       Visibility(
    //         visible: controller.state.curMode.value == 1,
    //         child: InkWell(
    //           onTap: () => _showExplainDialog(context),
    //           child: Image.asset(
    //             R.gameGameExplain,
    //             height: 18.dp,
    //           ),
    //         ),
    //       ),
    //       Gaps.hGap12,
    //       InkWell(
    //         onTap: () {
    //           _onClickMusic();
    //         },
    //         child: Image.asset(
    //           GameFlameAudioService.sharedInstance.isPlaying.value
    //               ? R.gameGameMusicOpen
    //               : R.gameGameMusicClose,
    //           height: 18.dp,
    //           color: GGColors.buttonTextWhite.color.withOpacity(0.2),
    //         ),
    //       ),
    //       Gaps.hGap12,
    //       InkWell(
    //         onTap: () {
    //           Navigator.of(context).pop();
    //         },
    //         child: SvgPicture.asset(
    //           R.iconClose,
    //           height: 17.dp,
    //           color: GGColors.buttonTextWhite.color.withOpacity(0.2),
    //         ),
    //       ),
    //     ],
    //   ),
    // );
  }
}

extension _Action on LuckSpinBgView {
  // void _onClickMusic() {
  //   if (GameFlameAudioService.sharedInstance.isPlaying.value) {
  //     controller.pause();
  //   } else {
  //     controller.resume();
  //   }
  // }

  // void _showExplainDialog(BuildContext context) {
  //   _showHistoryGeneralDialog(
  //       context: context,
  //       builder: (BuildContext context) {
  //         return Center(
  //           child: Material(
  //               elevation: 0,
  //               borderRadius: BorderRadius.circular(20.dp),
  //               child: GamingLuckySpinExplainViewM1(
  //                 context: context,
  //                 height: controller.state.height.value,
  //                 content: controller.state.informationModel?.content ?? '',
  //               )),
  //         );
  //       });
  // }

  // void _showHistoryGeneralDialog({
  //   required Widget Function(BuildContext) builder,
  //   required BuildContext context,
  //   Widget? child,
  // }) {
  //   showGeneralDialog(
  //     context: context,
  //     pageBuilder: (BuildContext buildContext, Animation<double> animation,
  //         Animation<double> secondaryAnimation) {
  //       final Widget pageChild = child ?? Builder(builder: builder);
  //       return Builder(builder: (BuildContext context) {
  //         return GestureDetector(
  //           behavior: HitTestBehavior.opaque,
  //           onTap: () {},
  //           child: pageChild,
  //         );
  //       });
  //     },
  //     barrierDismissible: true,
  //     barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
  //     transitionDuration: const Duration(milliseconds: 400),
  //     transitionBuilder: (BuildContext context, Animation<double> animation,
  //         Animation<double> secondaryAnimation, Widget child) {
  //       return FractionalTranslation(
  //         translation: Offset(1 - animation.value, 0),
  //         child: child,
  //       );
  //     },
  //   );
  // }
}
