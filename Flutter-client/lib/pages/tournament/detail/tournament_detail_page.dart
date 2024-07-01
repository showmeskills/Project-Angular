import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_award_rang_model.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_model.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_rank_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_game_image.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/home/views/home_swiper.dart';
import 'package:gogaming_app/pages/tournament/common/tournament_card.dart';
import 'package:gogaming_app/pages/tournament/common/tournament_rank_header.dart';
import 'package:gogaming_app/widget_header.dart';

import 'tournament_detail_logic.dart';

class TournamentDetailPage extends BaseView<TournamentDetailLogic>
    with BaseSingleRenderViewDelegate {
  const TournamentDetailPage({super.key, required this.tmpCode});

  final String tmpCode;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () =>
          TournamentDetailPage.argument(Get.arguments as Map<String, dynamic>),
    );
  }

  factory TournamentDetailPage.argument(Map<String, dynamic> arguments) {
    final String tmpCode = arguments['tmpCode'] as String;

    return TournamentDetailPage(tmpCode: tmpCode);
  }

  TournamentDetailState get state => controller.state;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.userAppbar();
  }

  @override
  Color? backgroundColor() {
    return GGColors.alertBackground.color;
  }

  // @override
  // Color? backgroundColor() {
  //   return GGColors.alertBackground.color;
  // }

  @override
  Widget? getFailedWidget(BuildContext context,
      [void Function()? onErrorPressed]) {
    return Container();
  }

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return null;
  }

  @override
  Widget body(BuildContext context) {
    Get.put(TournamentDetailLogic(tmpCode));
    return SingleRenderView(
      controller: controller,
      delegate: this,
      child: SingleChildScrollView(
        child: Obx(() {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Gaps.vGap10,
              Container(
                padding: EdgeInsets.symmetric(horizontal: 16.dp),
                child: TournamentCard(
                  data: state.data!,
                  onCountdownEnd: state.data!.status == TournamentStatus.ongoing
                      ? controller.onCountdownEnd
                      : null,
                  onCountdownStart:
                      state.data!.status == TournamentStatus.upcoming
                          ? controller.onCountdownStart
                          : null,
                  onApplyPress: state.data!.status == TournamentStatus.ongoing
                      ? (p0) {
                          controller.apply(p0.tmpCode!);
                        }
                      : null,
                ),
              ),
              Gaps.vGap16,
              _buildAward(),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 4.dp),
                child: HomeSwiper(
                  title: localized('participating_games'),
                  total: state.data?.gameLists?.length ?? 0,
                  mainAxisCount: 3,
                  crossAxisCount: 1,
                  builder: (context, index) {
                    final gameData = state.data!.gameLists![index];
                    return GamingGameImage(
                      radius: 4.dp,
                      data: gameData,
                    );
                  },
                ),
              ),
              Gaps.vGap16,
              Container(
                padding: EdgeInsets.symmetric(horizontal: 16.dp),
                child: Column(
                  children: [
                    _buildRanking(),
                    Gaps.vGap16,
                    _buildDescription(),
                  ],
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  List<TournamentAwardRangModel> get awardList {
    final old = (state.data?.awards ?? []);
    List<TournamentAwardRangModel> list =
        old.getRange(0, min(old.length, 3)).map((e) {
      return e.toRangModel();
    }).toList();
    final range = (state.data?.awardRang ?? []);
    for (var e in range) {
      if (e.rankNumEnd > 3) {
        if (e.rankNumEnd == e.rankNumStart) {
          list.add(e);
          continue;
        }

        if (e.rankNumStart <= 3) {
          list.add(e.copyWith(rankNumStart: 4));
          continue;
        }
        list.add(e);
        continue;
      }
    }
    return list;
  }

  Widget _buildAward() {
    final list = awardList;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: LayoutBuilder(builder: (context, constraints) {
        final width = ((constraints.maxWidth - 8.dp) ~/ 2).toDouble();
        return Wrap(
          spacing: 8.dp,
          runSpacing: 8.dp,
          alignment: WrapAlignment.center,
          children: List.generate(list.length, (index) {
            final e = list[index];
            late Widget child;
            if (e.rankNumEnd <= 3) {
              child = Column(
                children: [
                  GamingImage.asset(
                    'assets/images/tournament/award-${e.rankNumEnd - 1}.svg',
                    width: 50.dp,
                  ),
                  Gaps.vGap6,
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Obx(() {
                        return GamingImage.network(
                          url: CurrencyService.sharedInstance
                              .getIconUrl(e.formatCurrency),
                          width: 14.dp,
                          height: 14.dp,
                        );
                      }),
                      Gaps.hGap6,
                      Flexible(
                        child: Obx(() {
                          return Text(
                            e.amountString,
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontWeight: GGFontWeigh.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          );
                        }),
                      ),
                    ],
                  ),
                ],
              );
            } else {
              final isSingle = e.rankNumStart == e.rankNumEnd;
              child = SizedBox(
                height: 34.dp,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Container(
                        alignment: Alignment.centerRight,
                        margin: EdgeInsets.only(right: 6.dp),
                        child: SizedBox(
                          width: 50.dp,
                          child: ShaderMask(
                            shaderCallback: (Rect bounds) {
                              return LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  GGColors.textMain.color.withOpacity(0.2),
                                  GGColors.textMain.color,
                                ],
                              ).createShader(Offset.zero & bounds.size);
                            },
                            blendMode: BlendMode.srcIn,
                            child: Text(
                              isSingle
                                  ? e.rankNumStart.toString()
                                  : '${e.rankNumStart} ~ ${e.rankNumEnd}',
                              style: GGTextStyle(
                                fontSize: GGFontSize.content,
                                fontWeight: GGFontWeigh.bold,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: SizedBox(
                        height: 34.dp,
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            SizedBox(
                              height: 14.dp * 1.4,
                              child: Obx(() {
                                return GamingImage.network(
                                  url: CurrencyService.sharedInstance
                                      .getIconUrl(e.formatCurrency),
                                  width: 14.dp,
                                  height: 14.dp,
                                );
                              }),
                            ),
                            Gaps.hGap6,
                            Flexible(
                              child: Obx(() {
                                return Text(
                                  e.amountString,
                                  style: GGTextStyle(
                                    fontSize: GGFontSize.content,
                                    color: GGColors.textMain.color,
                                    fontWeight: GGFontWeigh.bold,
                                    height: 1.4,
                                  ),
                                );
                              }),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }

            return Container(
              width: index < 1 ? double.infinity : width,
              padding: EdgeInsets.symmetric(horizontal: 4.dp, vertical: 8.dp),
              decoration: BoxDecoration(
                color: GGColors.popBackground.color,
                borderRadius: BorderRadius.circular(4.dp),
              ),
              alignment: Alignment.center,
              child: child,
            );
          }),
        );
      }),
    );
  }

  Widget _buildRankTitle() {
    return SizedBox(
      height: 40.dp,
      child: Row(
        children: [
          Text(
            localized('rank_jop'),
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle,
              fontWeight: GGFontWeigh.bold,
              color: GGColors.textMain.color,
            ),
          ),
          const Spacer(),
          ScaleTap(
            onPressed: _onSizeChange,
            child: Container(
              height: 40.dp,
              constraints: BoxConstraints(
                minWidth: 40.dp,
              ),
              padding: EdgeInsets.symmetric(horizontal: 8.dp),
              decoration: BoxDecoration(
                border: Border.all(
                  color: GGColors.border.color,
                  width: 1.dp,
                ),
                borderRadius: BorderRadius.circular(4.dp),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '${state.size}',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      fontWeight: GGFontWeigh.medium,
                      color: GGColors.textMain.color,
                    ),
                  ),
                  Gaps.hGap12,
                  GamingImage.asset(
                    R.iconArrowDown,
                    width: 14.dp,
                    color: GGColors.textSecond.color,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRanking() {
    if (state.data?.status == TournamentStatus.upcoming) {
      return Gaps.empty;
    }
    final list = rankList();
    return Column(
      children: [
        _buildRankTitle(),
        Gaps.vGap10,
        const TournamentRankHeader(),
        if (state.rankLoading)
          SizedBox(
            height: 200.dp,
            child: const GoGamingLoading(),
          )
        else
          Column(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(list.length, (index) {
              final e = list[index];
              return Container(
                decoration: BoxDecoration(
                  color: index % 2 == 0
                      ? GGColors.popBackground.color
                      : GGColors.transparent.color,
                  borderRadius: BorderRadius.circular(2.dp),
                  border: e.uid == state.data?.currentUserRank?.uid
                      ? Border.all(
                          color: GGColors.highlightButton.color, width: 1.dp)
                      : null,
                ),
                constraints: BoxConstraints(minHeight: 40.dp),
                padding: EdgeInsets.only(right: 8.dp),
                child: Row(
                  children: [
                    SizedBox(
                      width: 60.dp,
                      child: Text(
                        e.rankNumber.toString(),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          fontWeight: GGFontWeigh.bold,
                          color: GGColors.textMain.color,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    Gaps.hGap10,
                    Expanded(
                      child: Text(
                        e.showUserName,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          fontWeight: GGFontWeigh.bold,
                          color: GGColors.textMain.color,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    Gaps.hGap10,
                    Expanded(
                      child: Obx(() {
                        return Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Flexible(
                              child: Text(
                                e.amountString,
                                style: GGTextStyle(
                                  fontSize: GGFontSize.hint,
                                  fontWeight: GGFontWeigh.bold,
                                  color: const Color(0xFFE7BF00),
                                ),
                                textAlign: TextAlign.right,
                              ),
                            ),
                            Gaps.hGap6,
                            GamingImage.network(
                              url: CurrencyService.sharedInstance
                                  .getIconUrl(e.formatCurrency),
                              width: 14.dp,
                              height: 14.dp,
                            ),
                          ],
                        );
                      }),
                    ),
                    Gaps.hGap10,
                    Expanded(
                      child: Text(
                        e.rankScore.toStringAsFixedWithoutRound(2),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          fontWeight: GGFontWeigh.bold,
                          color: GGColors.textMain.color,
                        ),
                        textAlign: TextAlign.right,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ),
      ],
    );
  }

  List<TournamentRankModel> rankList() {
    final origin = state.data?.pageTable?.list ?? [];
    final list = List<TournamentRankModel>.from(origin)
        .getRange(0, min(origin.length, state.size))
        .toList();
    final currentUserRank = state.data?.currentUserRank;
    if (currentUserRank == null) {
      return list;
    }
    final index =
        list.indexWhere((element) => element.uid == currentUserRank.uid);
    if (index == -1) {
      list.add(currentUserRank);
    }

    return list;
  }

  Widget _buildDescription() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('terms'),
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle,
            fontWeight: GGFontWeigh.bold,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap10,
        Html(
          data: state.data?.activityContent ?? '',
          style: {
            'body': Style(
              margin: Margins.zero,
            ),
          },
        ),
      ],
    );
  }

  @override
  SingleRenderViewController get renderController => controller.controller;
}

extension _Action on TournamentDetailPage {
  void _onSizeChange() {
    GamingSelector.simple<int>(
      title: localized('select_display_number'),
      useCloseButton: false,
      original: [10, 20, 30, 40],
      fixedHeight: false,
      itemBuilder: (context, e, index) {
        return Container(
          width: double.infinity,
          height: 48.dp,
          alignment: Alignment.center,
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          child: Text(
            e.toString(),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        );
      },
    ).then((value) {
      if (value != null) {
        controller.setSize(value);
      }
    });
  }
}
