import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_smart_dialog/flutter_smart_dialog.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_model.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_rank_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_countdown/gg_countdown.dart';
import 'package:gogaming_app/common/widgets/go_gaming_empty.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/home/views/home_swiper.dart';
import 'package:gogaming_app/pages/home/views/home_swiper_pagination.dart';
import 'package:gogaming_app/widget_header.dart';

import '../tournament_rank_header.dart';
import 'tournament_dialog_logic.dart';

part 'tournament_dialog_swiper_view.dart';

class TournamentDialogView extends StatelessWidget
    with BaseSingleRenderViewDelegate {
  TournamentDialogView({
    super.key,
    required this.list,
    required this.providerId,
    required this.category,
    required this.gameId,
  });

  final RxList<TournamentModel> list;
  final String providerId;
  final String category;
  final String gameId;

  TournamentDialogLogic get logic => Get.find<TournamentDialogLogic>();

  TournamentDialogState get state => logic.state;

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return GoGamingEmpty(
      icon: R.tournamentEmpty,
      text: localized('no_tournament'),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GetBuilder(
        init: TournamentDialogLogic(
          list: list,
          providerId: providerId,
          category: category,
          gameId: gameId,
        ),
        builder: (controller) {
          return FractionallySizedBox(
            widthFactor: 0.9,
            child: Container(
              decoration: BoxDecoration(
                color: GGColors.popBackground.color,
                borderRadius: BorderRadius.circular(4.dp),
              ),
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.7,
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Gaps.hGap12,
                      GamingImage.asset(
                        R.tournamentAppbarRightIcon,
                        width: 14.dp,
                      ),
                      Gaps.hGap8,
                      Text(
                        localized('tournament'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                      const Spacer(),
                      GamingCloseButton(
                        size: 14.dp,
                        padding: EdgeInsets.symmetric(
                            horizontal: 12.dp, vertical: 14.dp),
                        onPressed: () {
                          SmartDialog.dismiss<void>();
                        },
                      ),
                    ],
                  ),
                  Gaps.vGap10,
                  Flexible(
                    child: SingleRenderView(
                      controller: logic,
                      delegate: this,
                      child: Container(
                        padding: EdgeInsets.symmetric(horizontal: 12.dp),
                        child: Obx(() {
                          return TournamentDialogSwiper(
                            total: state.list.length,
                            mainAxisCount: 1,
                            builder: (context, index) {
                              final data = state.list[index];
                              return _TournamentDialogSwiperView(data: data);
                            },
                          );
                        }),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        });
  }

  @override
  SingleRenderViewController get renderController => logic.controller;
}

class TournamentDialogSwiper extends StatefulWidget {
  const TournamentDialogSwiper({
    super.key,
    required this.total,
    this.crossAxisCount = 1,
    required this.mainAxisCount,
    required this.builder,
  });

  final int total;
  final int mainAxisCount;
  final int crossAxisCount;
  final Widget Function(BuildContext, int) builder;

  @override
  State<TournamentDialogSwiper> createState() => _TournamentDialogSwiperState();
}

class _TournamentDialogSwiperState extends State<TournamentDialogSwiper> {
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
  void didUpdateWidget(covariant TournamentDialogSwiper oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.total != widget.total ||
        oldWidget.mainAxisCount != widget.mainAxisCount ||
        oldWidget.crossAxisCount != widget.crossAxisCount) {
      controller = HomeSwiperController(
        total: widget.total,
        mainAxisCount: widget.mainAxisCount,
        crossAxisCount: widget.crossAxisCount,
      );
      if (controller.hasClients) {
        controller.jumpTo(0);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.total == 0) {
      return Container();
    }
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        HomeSwiperPagination(
          title: '',
          controller: controller,
          padding: EdgeInsets.zero,
        ),
        Gaps.vGap12,
        Flexible(
          child: PageView.builder(
            itemCount: controller.total,
            controller: controller,
            onPageChanged: (page) {
              controller.canNext = page < controller.total - 1;
              controller.canPrevious = page > 0;
            },
            itemBuilder: widget.builder,
          ),
        ),
      ],
    );
  }
}
