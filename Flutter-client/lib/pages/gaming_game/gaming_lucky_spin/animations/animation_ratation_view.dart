import 'package:flutter/material.dart';

/// 旋转动画
class AnimationRotationView extends StatefulWidget {
  const AnimationRotationView({
    super.key,
    required this.child,
    this.duration,
    this.repeat = false,
    this.alignment = Alignment.center,
    this.begin = 0.0,
    this.end = 1.0,
    this.reverse = false,
    this.lowerBound = 0.0,
    this.upperBound = 1.0,
    this.controller,
  });

  final Widget child;
  final Duration? duration;
  final bool repeat;
  final bool reverse;
  final Alignment alignment;
  final double begin;
  final double end;
  final double lowerBound;
  final double upperBound;
  final Animation<double>? controller;
  @override
  State<AnimationRotationView> createState() => _AnimationRotationViewState();
}

class _AnimationRotationViewState extends State<AnimationRotationView>
    with TickerProviderStateMixin {
  // Create a controller
  late final AnimationController _controller = () {
    var result = AnimationController(
      duration: widget.duration ?? const Duration(seconds: 2),
      vsync: this,
    );
    return result;
  }();

  // Create an animation with value of type "double"
  late final Animation<double> _animation =
      Tween(begin: widget.begin, end: widget.end).animate(_controller);

  @override
  void initState() {
    super.initState();
    _controller.reverse();
    if (widget.repeat) {
      _controller.repeat();
    } else {
      _controller.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    return RotationTransition(
      turns: widget.controller ?? _animation,
      alignment: widget.alignment,
      child: widget.child,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
