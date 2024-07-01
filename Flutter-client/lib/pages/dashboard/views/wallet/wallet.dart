import 'package:flutter/material.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/widgets/pie_chart/pie_chart_sample2.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/helper/withdraw_router_util.dart';
import 'package:gogaming_app/pages/dashboard/dashboard_logic.dart';
import 'package:gogaming_app/pages/dashboard/logics/wallet_logic.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../delegate/dashboard_render_view_delegate.dart';
import '../module_title.dart';

part '_balance_view.dart';

class DashboardWallet extends StatelessWidget
    with BaseSingleRenderViewDelegate, DashboardRenderViewDelegate {
  const DashboardWallet({super.key});
  @override
  SingleRenderViewController get renderController => logic2.controller;
  DashboardWalletLogic get logic2 => Get.find<DashboardWalletLogic>();
  DashboardWalletState get state => logic2.state;

  DashboardLogic get logic => Get.find<DashboardLogic>();

  @override
  Widget getLoadingWidget(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(bottom: 16.dp),
      child: const GoGamingLoading(
        alignment: Alignment.center,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return DashboardModuleContainer(
      child: Column(
        children: [
          DashboardModuleTitle(
            title: localized('bal_det'),
            hasDivider: false,
            onPressed: logic.onPressWalletHome,
          ),
          SingleRenderView(
            controller: logic2,
            delegate: this,
            child: Obx(
              () {
                if (state.currentWallet == null) {
                  return const SizedBox();
                }
                return Column(
                  children: [
                    Container(
                      width: double.infinity,
                      alignment: Alignment.centerLeft,
                      padding: EdgeInsets.only(left: 8.dp),
                      child: Obx(
                        () => TabBar(
                          controller: logic2.tabController,
                          isScrollable: true,
                          indicatorWeight: 3.dp,
                          indicatorSize: TabBarIndicatorSize.label,
                          labelPadding:
                              EdgeInsets.only(left: 8.dp, right: 8.dp),
                          indicatorColor: GGColors.brand.color,
                          labelColor: GGColors.textMain.color,
                          labelStyle: GGTextStyle(
                            fontSize: GGFontSize.content,
                          ),
                          unselectedLabelColor: GGColors.textMain.color,
                          unselectedLabelStyle: GGTextStyle(
                            fontSize: GGFontSize.content,
                          ),
                          tabs: List.generate(state.wallets.length, (index) {
                            return ScaleTap(
                              opacityMinValue: 0.8,
                              scaleMinValue: 0.98,
                              onPressed: () {
                                logic2.tabController.animateTo(index);
                              },
                              child: Container(
                                margin: EdgeInsets.only(bottom: 8.dp),
                                child: Text(
                                  localized(state.wallets[index].category
                                      .toLowerCase()),
                                ),
                              ),
                            );
                          }),
                        ),
                      ),
                    ),
                    Divider(
                      thickness: 1.dp,
                      height: 1.dp,
                      indent: 16.dp,
                      endIndent: 16.dp,
                    ),
                    const _BalanceView(),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
