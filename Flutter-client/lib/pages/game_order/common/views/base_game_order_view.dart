import 'package:flutter/material.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart';
import 'package:gogaming_app/pages/game_order/game_order_page.dart';
import 'package:gogaming_app/widget_header.dart';

import 'game_order_day_item_view.dart';
import 'game_order_total_view.dart';

abstract class GameOrderBaseView<C extends BaseGameOrderLogic<T>, T>
    extends StatelessWidget with BaseSingleRenderViewDelegate {
  const GameOrderBaseView({super.key});

  C get controller => Get.find<C>();

  IGameOrderState<T> get state => controller.state;

  @override
  SingleRenderViewController get renderController => controller.controller;

  Widget itemBuilder(T v);

  @override
  Widget getLoadingWidget(BuildContext context) {
    return Column(
      children: [
        GameOrderFilterHeaderView<C, T>(),
        Expanded(
          child: super.getLoadingWidget(context) ?? Container(),
        ),
      ],
    );
  }

  @override
  Widget getEmptyWidget(BuildContext context) {
    return Column(
      children: [
        GameOrderFilterHeaderView<C, T>(),
        Expanded(
          child: super.getEmptyWidget(context) ?? Container(),
        ),
      ],
    );
  }

  @override
  @mustCallSuper
  Widget build(BuildContext context) {
    return KeepAliveWrapper(
      child: Column(
        children: [
          Expanded(
            child: SingleRenderView(
              delegate: this,
              controller: controller,
              child: Obx(
                () {
                  return CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(
                        child: GameOrderFilterHeaderView<C, T>(),
                      ),
                      SliverToBoxAdapter(
                        child: Builder(builder: (context) {
                          if ((state.total?.count ?? 0) == 0) {
                            return Gaps.empty;
                          }
                          return GameOrderTopTotalView(
                            count: state.total!.count,
                            betTotal: state.total!.betTotal,
                            payoutTotal: state.total!.payoutTotal,
                            color: GGColors.buttonTextWhite.color,
                          );
                        }),
                      ),
                      SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            return GameOrderDayItemView<C, T>(
                              data: state.dayTotal.keys.elementAt(index),
                              itemBuilder: itemBuilder,
                            );
                          },
                          childCount: state.dayTotal.keys.length,
                        ),
                      ),
                      SliverToBoxAdapter(
                        child: SafeArea(child: Gaps.empty),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
