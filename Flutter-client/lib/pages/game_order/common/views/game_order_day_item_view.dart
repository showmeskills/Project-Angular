import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/go_gaming_no_more.dart';
import 'package:gogaming_app/pages/game_order/common/base_game_order_logic.dart';
import 'package:gogaming_app/common/api/game_order/models/gaming_wager_day_total/gaming_wager_day_total_stat_model.dart';
import 'package:gogaming_app/pages/game_order/common/views/game_order_total_view.dart';
import 'package:gogaming_app/widget_header.dart';

class GameOrderDayItemView<C extends BaseGameOrderLogic<T>, T>
    extends StatelessWidget {
  GameOrderDayItemView({
    super.key,
    required this.data,
    required this.itemBuilder,
  });
  final GamingWagerDayTotalStatModel data;
  final Widget Function(T) itemBuilder;

  C get controller => Get.find<C>();

  late final state = controller.findItemState(data);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp).copyWith(top: 16.dp),
      child: ExpandableNotifier(
        controller: state.expandableController,
        child: Column(
          children: [
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () {
                controller.toggle(data);
              },
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: GGColors.border.color,
                  borderRadius: BorderRadius.circular(4.dp),
                ),
                padding: EdgeInsets.all(10.dp),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            '${data.day}(GMT+0)',
                            style: GGTextStyle(
                              fontSize: GGFontSize.hint,
                              color: GGColors.textSecond.color,
                            ),
                          ),
                        ),
                        Obx(() {
                          if (state.isRefresh) {
                            return GoGamingLoading(
                              color: GGColors.textMain,
                              size: 10.dp,
                            );
                          }
                          return ValueListenableBuilder<bool>(
                              valueListenable: state.expandableController,
                              builder: (context, value, child) {
                                return AnimatedRotation(
                                  turns: value ? -0.25 : 0,
                                  duration: const Duration(milliseconds: 200),
                                  child: SvgPicture.asset(
                                    R.iconArrowLeft,
                                    width: 14.dp,
                                    height: 14.dp,
                                    color: GGColors.textSecond.color,
                                  ),
                                );
                              });
                        }),
                      ],
                    ),
                    Gaps.vGap10,
                    GameOrderTotalView(
                      count: data.count,
                      betTotal: data.betTotal,
                      payoutTotal: data.payoutTotal,
                    ),
                  ],
                ),
              ),
            ),
            Expandable(
              collapsed: const SizedBox(
                width: double.infinity,
              ),
              expanded: Obx(() {
                return Column(
                  children: state.data.list.map<Widget>((e) {
                    return itemBuilder(e);
                  }).toList()
                    ..add(Container(
                      margin: EdgeInsets.only(top: 10.dp),
                      height: GGFontSize.content.fontSize * 1.4,
                      alignment: Alignment.center,
                      child: Obx(() {
                        if (state.isLoading && !state.isRefresh) {
                          return GoGamingLoading(
                            color: GGColors.textMain,
                            size: 12.dp,
                          );
                        }
                        if (state.data.total > state.data.count) {
                          return GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () {
                              controller.loadMore(data);
                            },
                            child: Text(
                              localized('load_m'),
                              style: GGTextStyle(
                                fontSize: GGFontSize.content,
                                color: GGColors.highlightButton.color,
                              ),
                            ),
                          );
                        } else {
                          return const GoGamingNoMore();
                        }
                      }),
                    )),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
