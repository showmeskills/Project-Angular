import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/history/models/gaming_account_activity_model.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/pages/account_activity/common/account_activity_base_logic.dart';
import 'package:gogaming_app/pages/account_activity/common/account_activity_type_enum.dart';
import 'package:gogaming_app/widget_header.dart';

abstract class AccountActivityBaseView<C extends AccountActivityBaseLogic>
    extends StatelessWidget with BaseRefreshViewDelegate {
  const AccountActivityBaseView({super.key});

  C get controller => Get.find<C>();

  IAccountActivityState get state => controller.state;

  @override
  RefreshViewController get renderController => controller.controller;

  Widget itemBuilder(GamingAccountActivityModel v);

  @override
  Widget getLoadingWidget(BuildContext context) {
    return Column(
      children: [
        _buildFilterIcon(context),
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
        _buildFilterIcon(context),
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
            child: RefreshView(
              delegate: this,
              controller: controller,
              child: CustomScrollView(
                slivers: [
                  _buildFilterIcon(context, true),
                  Obx(() {
                    return SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          return itemBuilder(state.data.list[index]);
                        },
                        childCount: state.data.count,
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterIcon(BuildContext context, [bool sliver = false]) {
    final child = controller.type != AccountActivityType.login
        ? Container(
            padding: EdgeInsets.symmetric(horizontal: 8.dp),
            alignment: Alignment.centerRight,
            child: ScaleTap(
              onPressed: () {
                Scaffold.of(context).openEndDrawer();
              },
              child: Container(
                padding: EdgeInsets.all(8.dp),
                child: SvgPicture.asset(
                  R.iconFilter,
                  width: 24.dp,
                  height: 24.dp,
                  color: GGColors.textSecond.color,
                ),
              ),
            ),
          )
        : Gaps.vGap8;
    if (sliver) {
      return SliverToBoxAdapter(
        child: child,
      );
    }
    return child;
  }
}
