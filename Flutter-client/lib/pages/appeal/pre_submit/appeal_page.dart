import 'package:expandable/expandable.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/appeal/models/gaming_appeal_model.dart';
import 'package:gogaming_app/common/delegate/base_refresh_view_delegate.dart';
import 'package:gogaming_app/common/painting/selected_rounded_rectangle_border.dart';
import 'package:gogaming_app/common/painting/triangle_painter.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/appeal/common/appeal_common_ui_mixin.dart';
import 'package:gogaming_app/pages/appeal/common/views/appeal_base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'appeal_logic.dart';

part 'views/_appeal_item_expanded_view.dart';
part 'views/_appeal_item_view.dart';

class AppealPage extends AppealBaseView<AppealLogic>
    with BaseRefreshViewDelegate {
  const AppealPage({super.key});

  AppealState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const AppealPage(),
    );
  }

  @override
  RefreshViewController get renderController => controller.controller;

  Widget _buildStateWidget({
    required Widget? child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap20,
        _buildTypeSelector(),
        Gaps.vGap60,
        _buildListTitle(),
        Expanded(
          child: Container(
            child: child,
          ),
        ),
      ],
    );
  }

  @override
  Widget getLoadingWidget(BuildContext context) {
    return _buildStateWidget(
      child: super.getLoadingWidget(context),
    );
  }

  @override
  String get emptyText => localized('no_records');

  @override
  Widget getEmptyWidget(BuildContext context) {
    return _buildStateWidget(
      child: super.getEmptyWidget(context),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(AppealLogic());
    return bodyContainer(
      child: RefreshView(
        delegate: this,
        controller: controller,
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Gaps.vGap20,
                  _buildTypeSelector(),
                  Gaps.vGap60,
                  _buildListTitle(),
                ],
              ),
            ),
            Obx(() {
              return SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    return _AppealItemView(
                      data: state.data.list[index],
                    );
                  },
                  childCount: state.data.count,
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildListTitle() {
    return Text(
      localized('self_recoverty'),
      style: GGTextStyle(
        fontSize: GGFontSize.bigTitle,
        color: GGColors.textSecond.color,
      ),
    );
  }

  Widget _buildTypeSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('why_receive_00'),
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap20,
        _buildTypeItem(0),
        Gaps.vGap16,
        _buildTypeItem(1),
        Obx(() {
          if (state.type == null) {
            return Gaps.empty;
          }
          return Container(
            margin: EdgeInsets.only(top: 32.dp),
            width: double.infinity,
            child: GGButton.main(
              onPressed: _onPressedButton,
              text: localized('apply_imm'),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildTypeItem(int type) {
    return ScaleTap(
      onPressed: () => _changeType(type),
      child: Obx(() {
        return Container(
          height: 48.dp,
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          alignment: Alignment.centerLeft,
          decoration: ShapeDecoration(
            shape: SelectedRoundedRectangleBorder(
              color: GGColors.highlightButton.color,
              iconColor: GGColors.buttonTextWhite.color,
              size: state.type == type ? Size(18.dp, 18.dp) : Size.zero,
              borderRadius: BorderRadius.circular(4.dp),
              aligemnt: Alignment.topRight,
              side: BorderSide(
                width: 1.dp,
                color: state.type == type
                    ? GGColors.highlightButton.color
                    : GGColors.border.color,
              ),
            ),
          ),
          child: Text(
            type == 0 ? localized('crypto') : localized('fiat'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        );
      }),
    );
  }
}

extension _Action2 on AppealPage {
  void _changeType(int type) {
    controller.changeType(type);
  }

  void _onPressedButton() {
    Get.toNamed<void>(state.type == 0
        ? Routes.cryptoAppealSubmit.route
        : Routes.currencyAppealSubmit.route);
  }
}
