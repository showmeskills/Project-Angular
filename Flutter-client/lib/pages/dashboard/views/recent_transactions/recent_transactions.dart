import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/game_order/models/gaming_recent_order_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/pages/dashboard/logics/game_order_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../delegate/dashboard_render_view_delegate.dart';
import '../module_title.dart';
part '_recent_transactions_item.dart';

class DashboardRecentTransactions extends StatelessWidget
    with BaseSingleRenderViewDelegate, DashboardRenderViewDelegate {
  const DashboardRecentTransactions({super.key});

  @override
  SingleRenderViewController get renderController => logic.controller;
  DashboardGameOrderLogic get logic => Get.find<DashboardGameOrderLogic>();
  DashboardGameOrderState get state => logic.state;

  @override
  Widget build(BuildContext context) {
    return DashboardModuleContainer(
      child: Column(
        children: [
          DashboardModuleTitle(
            title: localized('rec_deals'),
            hasDivider: true,
            onPressed: () {
              Get.toNamed<dynamic>(Routes.gameOrder.route);
            },
          ),
          Container(
            padding: EdgeInsets.all(16.dp).copyWith(bottom: 10.dp),
            child: Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Text(
                    localized('gname'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
                Flexible(
                  flex: 1,
                  child: Center(
                    child: Text(
                      localized('odds'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                      ),
                    ),
                  ),
                ),
                Flexible(
                  flex: 2,
                  child: Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      localized('betting'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Divider(
            indent: 16.dp,
            endIndent: 16.dp,
            color: GGColors.border.color,
            thickness: 1.dp,
            height: 1.dp,
          ),
          SingleRenderView(
            controller: logic,
            delegate: this,
            child: Obx(() => Column(
                  children: List.generate(
                    state.data.count,
                    (index) {
                      return _RecentTransactionsItem(
                          data: state.data.list[index],
                          hasDivider: index != state.data.count - 1);
                    },
                  ),
                )),
          ),
        ],
      ),
    );
  }
}
