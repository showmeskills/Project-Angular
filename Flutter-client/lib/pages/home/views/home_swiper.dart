import 'package:flutter/material.dart';
import 'package:gogaming_app/pages/home/views/home_swiper_builder.dart';
import 'package:gogaming_app/widget_header.dart';

import 'home_swiper_pagination.dart';

class HomeSwiperController extends PageController {
  HomeSwiperController({
    int initialPage = 0,
    bool keepPage = true,
    double viewportFraction = 1.0,
    required this.total,
    required this.mainAxisCount,
    this.crossAxisCount = 1,
  }) : super(
          initialPage: initialPage,
          keepPage: keepPage,
          viewportFraction: viewportFraction,
        );

  final int total;
  final int mainAxisCount;
  final int crossAxisCount;

  late final RxBool _canNext = (pageCount > 1).obs;
  late final RxBool _canPrevious = false.obs;
  set canNext(bool v) {
    if (canNext != v) {
      _canNext.value = v;
    }
  }

  set canPrevious(bool v) {
    if (canPrevious != v) {
      _canPrevious.value = v;
    }
  }

  bool get canNext => _canNext.value;
  bool get canPrevious => _canPrevious.value;

  int get pageCount => (total / limit).ceil();

  int get limit => mainAxisCount * crossAxisCount;
}

class HomeSwiper extends StatefulWidget {
  const HomeSwiper(
      {super.key,
      this.iconName,
      this.iconBuilder,
      required this.title,
      required this.total,
      required this.mainAxisCount,
      required this.builder,
      this.crossAxisCount = 1,
      this.aspectRatio = 1.33,
      this.needRefresh = false,
      this.onPressedTitle,
      this.extraWidget});

  final String? iconName;
  final Widget Function()? iconBuilder;
  final String title;
  final bool needRefresh;

  final int total;
  final int mainAxisCount;
  final int crossAxisCount;
  final double aspectRatio;
  final Widget? extraWidget;
  final Widget Function(BuildContext, int) builder;
  final VoidCallback? onPressedTitle;

  @override
  State<HomeSwiper> createState() => _HomeSwiperState();
}

class _HomeSwiperState extends State<HomeSwiper> {
  late HomeSwiperController controller;

  @override
  void initState() {
    super.initState();
    controller = HomeSwiperController(
      total: widget.total,
      mainAxisCount: widget.mainAxisCount,
      crossAxisCount: widget.crossAxisCount,
    );
  }

  @override
  void didUpdateWidget(covariant HomeSwiper oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.needRefresh) {
      _configSwiperController();
    } else if (oldWidget.total != widget.total ||
        oldWidget.mainAxisCount != widget.mainAxisCount ||
        oldWidget.crossAxisCount != widget.crossAxisCount) {
      _configSwiperController();
    }
  }

  void _configSwiperController() {
    controller = HomeSwiperController(
      total: widget.total,
      mainAxisCount: widget.mainAxisCount,
      crossAxisCount: widget.crossAxisCount,
    );
    if (controller.hasClients) {
      controller.jumpTo(0);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.total == 0 && widget.extraWidget == null) {
      return Container();
    }
    return NotificationListener(
      onNotification: (notification) {
        if (notification is ScrollEndNotification) {
          controller.canPrevious = notification.metrics.pixels > 0;
          controller.canNext = (notification.metrics.maxScrollExtent -
                      notification.metrics.pixels)
                  .abs() >
              1;
        }
        return true;
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Gaps.vGap20,
          HomeSwiperPagination(
            iconName: widget.iconName,
            iconBuilder: widget.iconBuilder,
            title: widget.title,
            controller: controller,
            onPressedTitle: widget.onPressedTitle,
          ),
          Gaps.vGap10,
          widget.extraWidget ?? Container(),
          Visibility(
            visible: widget.total > 0,
            child: HomeSwiperBuilder(
              aspectRatio: widget.aspectRatio,
              controller: controller,
              builder: widget.builder,
            ),
          ),
        ],
      ),
    );
  }
}
