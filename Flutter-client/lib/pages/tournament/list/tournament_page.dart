import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/go_gaming_empty.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/tournament/common/tournament_card.dart';
import 'package:gogaming_app/widget_header.dart';

import 'tournament_logic.dart';

class TournamentPage extends BaseView<TournamentLogic>
    with BaseSingleRenderViewDelegate {
  const TournamentPage({super.key});

  TournamentState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const TournamentPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userBottomAppbar(
      bottomHeight: 81.dp,
      title: localized('tournament'),
      leadingIcon: Gaps.hGap16,
      trailingWidgets: [
        GamingImage.asset(
          R.tournamentAppbarRightIcon,
          height: 67.dp,
        ),
        Gaps.hGap16,
      ],
    );
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(TournamentLogic());
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        borderRadius: BorderRadiusDirectional.only(
          topStart: Radius.circular(20.dp),
          topEnd: Radius.circular(20.dp),
        ),
      ),
      constraints: const BoxConstraints(
        minHeight: double.infinity,
      ),
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: SingleRenderView(
        controller: controller,
        delegate: this,
        child: SingleChildScrollView(
          child: Obx(() {
            return Column(
              children: [
                _buildStarting(),
                _buildUpcoming(),
                _buildExpired(),
                SafeArea(
                  bottom: true,
                  minimum: EdgeInsets.only(bottom: 24.dp),
                  child: Gaps.empty,
                ),
              ],
            );
          }),
        ),
      ),
    );
  }

  @override
  SingleRenderViewController get renderController => controller.controller;

  Widget _buildTitle(String title) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 20.dp),
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: GGTextStyle(
          fontSize: GGFontSize.bigTitle,
          color: GGColors.textMain.color,
          fontWeight: GGFontWeigh.bold,
        ),
      ),
    );
  }

  Widget _buildStarting() {
    return Column(
      children: [
        if ((state.data.startList?.total ?? 0) > 0) Gaps.vGap22,
        ...List.generate(state.data.startList?.list.length ?? 0, (index) {
          final e = state.data.startList!.list[index];
          return Container(
            margin: EdgeInsets.only(top: index > 0 ? 12.dp : 0),
            child: TournamentCard(
              data: e,
              index: index,
              onApplyPress: (p0) {
                controller.apply(p0.tmpCode!);
              },
              onCountdownEnd: controller.onCountdownEnd,
            ),
          );
        }),
      ],
    );
  }

  Widget _buildUpcoming() {
    return Column(
      children: [
        _buildTitle(localized('upcoming')),
        if ((state.data.preList?.total ?? 0) == 0)
          GoGamingEmpty(
            icon: R.tournamentEmpty,
            text: localized('no_tournament'),
          )
        else
          ...List.generate(state.data.preList?.list.length ?? 0, (index) {
            final e = state.data.preList!.list[index];
            return Container(
              margin: EdgeInsets.only(top: index > 0 ? 12.dp : 0),
              child: TournamentCard(
                data: e,
                onCountdownStart: controller.onCountdownStart,
              ),
            );
          }),
      ],
    );
  }

  Widget _buildExpired() {
    return Column(
      children: [
        _buildTitle(localized('tournament_expired')),
        if ((state.data.endList?.total ?? 0) == 0)
          GoGamingEmpty(
            icon: R.tournamentEmpty,
            text: localized('no_tournament'),
          )
        else
          ...List.generate(state.data.endList?.list.length ?? 0, (index) {
            final e = state.data.endList!.list[index];
            return Container(
              margin: EdgeInsets.only(top: index > 0 ? 12.dp : 0),
              child: TournamentExpiredCard(
                data: e,
                index: index,
              ),
            );
          }).toList(),
      ],
    );
  }
}
