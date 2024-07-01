import 'dart:async';

import 'package:flutter/material.dart';
import 'package:gogaming_app/widget_header.dart';

class LuckySpinScrollController extends ScrollController {
  LuckySpinScrollController({
    double initialScrollOffset = 0.0,
    bool keepScrollOffset = true,
    String? debugLabel,
  }) : super(
            initialScrollOffset: initialScrollOffset,
            keepScrollOffset: keepScrollOffset,
            debugLabel: debugLabel);

  /// The map which stores the states of the current items in the viewport
  final Map<int, Size> _itemMap = {};
  Map<int, Size> get itemMap => _itemMap;

  void addItem(int index, Size size) {
    _itemMap[index] = size;
  }

  void removeItem(int index) {
    _itemMap.remove(index);
  }
}

class LuckySpinItemWrapper extends StatelessWidget {
  LuckySpinItemWrapper({
    required this.index,
    required this.child,
    required this.controller,
    Key? key,
  }) : super(key: key ?? ValueKey(index));

  final LuckySpinScrollController controller;
  final int index;
  final Widget child;

  void _addItem(int index, Size size) {
    controller.addItem(index, size);
  }

  void _removeItem(int index) {
    controller.removeItem(index);
  }

  @override
  Widget build(BuildContext context) {
    return MeasureSize(
      child: child,
      onChange: (size, globalOffset) {
        _removeItem(index);
        _addItem(index, size);
      },
    );
  }
}

class LuckySpinSwiper extends StatelessWidget {
  LuckySpinSwiper({
    super.key,
    this.count = 0,
    this.autoplay = true,
    this.autoplayAfter = 2000,
    this.autoplayDelay = 2000,
    required this.builder,
  }) {
    controller = LuckySpinScrollController(initialScrollOffset: 5.dp);
  }

  late final LuckySpinScrollController controller;
  final Widget Function(BuildContext, int) builder;
  final int count;
  final bool autoplay;
  final int autoplayAfter;
  final int autoplayDelay;

  @override
  Widget build(BuildContext context) {
    return LuckySpinSwiperView(
      count: count,
      autoplay: autoplay,
      autoplayDelay: autoplayDelay,
      autoplayAfter: autoplayAfter,
      controller: controller,
      direction: MarqueerDirection.rtl,
      restartAfterInteractionDuration: const Duration(seconds: 1),
      restartAfterInteraction: true,
      onChangeItemInViewPort: (index) {
        debugPrint('item index: $index');
      },
      child: Row(
        children: List.generate(count, (index) {
          return LuckySpinItemWrapper(
            index: index,
            controller: controller,
            child: Container(
              margin: EdgeInsets.symmetric(horizontal: 5.dp),
              child: builder(context, index),
            ),
          );
        }),
      ),
    );
  }
}

enum MarqueerDirection {
  rtl,
  ltr,
}

class LuckySpinSwiperView extends StatefulWidget {
  const LuckySpinSwiperView({
    required this.child,
    this.autoplay = true,
    this.autoplayDelay = 2000,
    this.direction = MarqueerDirection.rtl,
    this.restartAfterInteractionDuration = const Duration(seconds: 3),
    this.restartAfterInteraction = true,
    this.onChangeItemInViewPort,
    this.autoplayAfter = 2000,
    required this.controller,
    required this.count,
    this.onStarted,
    this.onStoped,
    super.key,
  });

  /// Child
  final Widget child;

  /// Direction
  final MarqueerDirection direction;

  /// Stop when interaction
  final bool restartAfterInteraction;

  /// Restart delay
  final Duration restartAfterInteractionDuration;

  /// Controller
  final LuckySpinScrollController controller;

  /// auto start
  final bool autoplay;

  final int autoplayDelay;

  /// Auto Start after duration
  final int autoplayAfter;

  final int count;

  /// callbacks
  final void Function()? onStarted;
  final void Function()? onStoped;
  final void Function(int index)? onChangeItemInViewPort;

  @override
  State<LuckySpinSwiperView> createState() => _LuckySpinSwiperViewState();
}

class _LuckySpinSwiperViewState extends State<LuckySpinSwiperView> {
  LuckySpinScrollController get controller => widget.controller;

  int index = 0;

  var animating = false;

  Timer? timerLoop;
  Timer? timerInteraction;

  void animate() {
    final Size? size = controller.itemMap[index % widget.count];
    if (size != null) {
      controller.animateTo(
        controller.offset + size.width,
        duration: Duration(milliseconds: widget.autoplayDelay ~/ 2),
        curve: Curves.linear,
      );
      index += 1;
    }
  }

  void start() {
    if (animating || !mounted) {
      return;
    }

    animating = true;
    animate();
    createLoop();
    widget.onStarted?.call();
  }

  /// Duration calculating after every interaction
  /// so Timer.periodic is not a good solution
  void createLoop() {
    timerLoop?.cancel();
    timerLoop = Timer(Duration(milliseconds: widget.autoplayDelay), () {
      createLoop();
      animate();
    });
  }

  void stop([bool jumpTo = true]) {
    if (!animating || !mounted) {
      return;
    }

    animating = false;

    timerLoop?.cancel();
    timerInteraction?.cancel();
    if (jumpTo) {
      controller.jumpTo(controller.offset);
    }

    widget.onStoped?.call();
  }

  void onPointerUpHandler(PointerUpEvent event) {
    if (widget.restartAfterInteraction) {
      /// Wait for scroll animation end
      timerInteraction = Timer(widget.restartAfterInteractionDuration, () {
        start();
      });
    }
  }

  void onPointerDownHandler(PointerDownEvent event) {
    stop(false);
  }

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.autoplay) {
        Future.delayed(Duration(milliseconds: widget.autoplayAfter), start);
      }
    });
  }

  @override
  void didUpdateWidget(LuckySpinSwiperView oldWidget) {
    super.didUpdateWidget(oldWidget);
    stop(false);
    if (widget.autoplay) {
      Future.delayed(Duration(milliseconds: widget.autoplayAfter), start);
    }
  }

  @override
  void dispose() {
    controller.dispose();
    timerLoop?.cancel();
    timerInteraction?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isReverse = widget.direction == MarqueerDirection.ltr;

    Widget body = ListView.builder(
      controller: controller,
      padding: EdgeInsets.zero,
      scrollDirection: Axis.horizontal,
      physics: const NeverScrollableScrollPhysics(),
      reverse: isReverse,
      itemCount: null,
      itemBuilder: (context, index) {
        widget.onChangeItemInViewPort?.call(this.index);
        return widget.child;
      },
    );

    return IgnorePointer(
      ignoring: false,
      child: Listener(
        onPointerDown: onPointerDownHandler,
        onPointerUp: onPointerUpHandler,
        child: body,
      ),
    );
  }
}
