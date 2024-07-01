import 'package:flutter/material.dart';

/// 位移动画-从屏幕的边角位移到原始位置
class AnimationScreenMoveView extends StatefulWidget {
  const AnimationScreenMoveView({
    super.key,
    required this.child,
    this.duration = const Duration(milliseconds: 800),
    required this.from,
    this.to,
  });

  final Widget child;
  final Duration duration;
  final Alignment? from;
  final Alignment? to;

  @override
  State<AnimationScreenMoveView> createState() => AanimatioMmovVieweState();
}

class AanimatioMmovVieweState extends State<AnimationScreenMoveView> {
  bool isReady = false;
  final childKey = GlobalKey();
  var animateOffset = const Offset(0, 0);

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 100), () {
      startAnimation();
    });
  }

  void startAnimation() {
    isReady = true;
    RenderBox box = childKey.currentContext?.findRenderObject() as RenderBox;
    final position = box.localToGlobal(Offset.zero);
    final size = box.size;
    final screenSzie = MediaQuery.of(context).size;
    Offset offset = const Offset(0, 0);
    if (widget.from == Alignment.topCenter) {
      offset = Offset(
        screenSzie.width / 2.0 - (position.dx + size.width / 2),
        -position.dy,
      );
    } else if (widget.from == Alignment.bottomCenter) {
      offset = Offset(
        screenSzie.width / 2.0 - (position.dx + size.width / 2),
        screenSzie.height - (position.dy + size.height),
      );
    }
    setState(() {
      animateOffset = offset;
    });

    Future.delayed(const Duration(milliseconds: 100), () {
      setState(() {
        if (widget.to == null) {
          animateOffset = const Offset(0, 0);
        } else if (widget.to == Alignment.bottomCenter) {
          animateOffset = Offset(
            screenSzie.width / 2.0 - (position.dx + size.width / 2),
            screenSzie.height - (position.dy + size.height),
          );
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return isReady
        ? AnimatedContainer(
            duration: widget.duration,
            transform: Matrix4.translationValues(
              animateOffset.dx,
              animateOffset.dy,
              0.0,
            ),
            child: widget.child,
          )
        : Opacity(
            opacity: 0,
            key: childKey,
            child: widget.child,
          );
  }
}
