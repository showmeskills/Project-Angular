import 'package:flutter/cupertino.dart';
import 'package:gogaming_app/widget_header.dart';

class ChatMessageLoadingView extends StatefulWidget {
  const ChatMessageLoadingView({super.key});

  @override
  State<ChatMessageLoadingView> createState() => _ChatMessageLoadingViewState();
}

class _ChatMessageLoadingViewState extends State<ChatMessageLoadingView>
    with SingleTickerProviderStateMixin {
  late Animation<double> animation;
  late AnimationController controller;

  @override
  void initState() {
    super.initState();
    controller = AnimationController(
      duration: const Duration(milliseconds: 700),
      vsync: this,
    );
    //图片宽高从0变到300
    animation = Tween(begin: 0.0, end: 1.0).animate(controller);
    //启动动画
    controller.forward();
  }

  @override
  void dispose() {
    //路由销毁时需要释放动画资源
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      child: Container(
        width: 14.dp,
        height: 14.dp,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(
            color: GGColors.darkBorder.color,
            width: 1.dp,
          ),
        ),
      ),
      builder: (context, child) {
        if (animation.isCompleted) {
          return child!;
        }
        return Gaps.hGap14;
      },
    );
  }
}

class ChatFileUploadProgressView extends StatelessWidget {
  const ChatFileUploadProgressView({super.key, required this.progress});

  final double progress;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 50.dp,
      alignment: Alignment.centerRight,
      child: Text(
        '${progress.toInt()}%',
        style: GGTextStyle(
          fontSize: GGFontSize.hint,
          color: GGColors.textHint.color,
        ),
      ),
    );
  }
}
