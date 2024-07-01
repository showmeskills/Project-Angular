import 'dart:math';

import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/activity/models/tournament_model.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_countdown/gg_countdown.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';

import 'tournament_rank_header.dart';

class TournamentExpiredCard extends StatelessWidget {
  const TournamentExpiredCard({
    super.key,
    required this.data,
    this.index = 0,
  });
  final TournamentModel data;
  final int index;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: index % 2 == 0
              ? [
                  const Color(0xFF351D7D),
                  const Color(0xFF45C15A),
                ]
              : [
                  const Color(0xFF58187B),
                  const Color(0xFFDE014C),
                ],
          stops: const [0.3, 1],
        ),
        borderRadius: BorderRadius.circular(10.dp),
      ),
      child: Row(
        children: [
          Gaps.hGap10,
          Expanded(
            child: Container(
              padding: EdgeInsets.symmetric(vertical: 10.dp),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        data.activityName ?? '',
                        style: GGTextStyle(
                          fontSize: GGFontSize.smallTitle,
                          color: GGColors.buttonTextWhite.color,
                          fontWeight: GGFontWeigh.bold,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Gaps.vGap6,
                      Text(
                        data.activitySubName ?? '',
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: GGColors.buttonTextWhite.color,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                  Gaps.vGap10,
                  SizedBox(
                    width: double.infinity,
                    child: GGButton.main(
                      onPressed: _navigateToDetail,
                      text: 'see more',
                      height: 40.dp,
                      radius: 20.dp,
                      textStyle: GGTextStyle(
                        fontSize: GGFontSize.content,
                        fontWeight: GGFontWeigh.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Gaps.hGap24,
          GamingImage.network(
            url: data.activityThumbnails?.isEmpty ?? true
                ? R.tournamentDefaultBanner
                : data.activityThumbnails!,
            fit: BoxFit.contain,
            width: 126.dp,
          ),
        ],
      ),
    );
  }
}

class TournamentCard extends StatelessWidget {
  const TournamentCard({
    super.key,
    required this.data,
    this.index = 0,
    this.onApplyPress,
    this.onCountdownStart,
    this.onCountdownEnd,
  });

  final TournamentModel data;
  final int index;
  final void Function(TournamentModel)? onApplyPress;
  final void Function(TournamentModel)? onCountdownStart;
  final void Function(TournamentModel)? onCountdownEnd;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: _navigateToDetail,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: data.status == TournamentStatus.upcoming
                ? [
                    const Color(0xFF58187B),
                    const Color(0xFFDE014C),
                  ]
                : index % 2 == 0
                    ? [
                        const Color(0xFFC70160),
                        const Color(0xFF6E01AD),
                      ]
                    : [
                        const Color(0xFF6E01AD),
                        const Color(0xFF31009A),
                      ],
            stops: const [0.3, 1],
          ),
          borderRadius: BorderRadius.circular(10.dp),
        ),
        padding:
            EdgeInsets.symmetric(horizontal: 10.dp).copyWith(bottom: 20.dp),
        child: Column(
          children: [
            _buildBanner(),
            Gaps.vGap22,
            _buildTitle(),
            Gaps.vGap10,
            _buildAwardTotal(),
            Gaps.vGap10,
            _buildAwardRank(),
            Gaps.vGap10,
            if (data.status == TournamentStatus.upcoming)
              Column(
                children: [
                  _buildCountdownTimer(),
                  Gaps.vGap10,
                  _buildButton(),
                ],
              )
            else
              Column(
                children: [
                  if (data.uidCanJoin ?? false)
                    Container(
                      margin: EdgeInsets.only(bottom: 10.dp),
                      child: _buildButton(),
                    ),
                  _buildCountdownTimer(),
                  _buildRanking(),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBanner() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 26.dp),
      child: AspectRatio(
        aspectRatio: 1,
        child: GamingImage.network(
          url: data.activityThumbnails?.isEmpty ?? true
              ? R.tournamentDefaultBanner
              : data.activityThumbnails!,
          fit: BoxFit.contain,
        ),
      ),
    );
  }

  Widget _buildTitle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          data.activityName ?? '',
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle20,
            color: GGColors.buttonTextWhite.color,
            fontWeight: GGFontWeigh.bold,
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        Text(
          data.activitySubName ?? '',
          style: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.buttonTextWhite.color,
          ),
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  Widget _buildAwardTotal() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        GamingImage.asset(
          R.tournamentGlodIcon,
          width: 40.dp,
          height: 40.dp,
        ),
        Gaps.hGap10,
        Obx(() {
          return GamingImage.network(
            url: data.formatCurrency.iconUrl,
            width: 24.dp,
            height: 24.dp,
          );
        }),
        Gaps.hGap6,
        Flexible(
          child: Obx(() {
            return Text(
              data.formatTotalAmount,
              style: GGTextStyle(
                fontSize: GGFontSize.superBigTitle30,
                color: GGColors.buttonTextWhite.color,
                fontWeight: GGFontWeigh.bold,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            );
          }),
        ),
      ],
    );
  }

  Widget _buildAwardRank() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(3, (index) {
        final e = data.awards?.elementAtOrNull(index);
        if (e != null) {
          return Expanded(
              child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              GamingImage.asset(
                'assets/images/tournament/award-$index.svg',
                width: 22.dp,
                height: 22.dp,
              ),
              Gaps.hGap10,
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
                      color: GGColors.buttonTextWhite.color,
                      fontWeight: GGFontWeigh.bold,
                      height: 1.4,
                    ),
                  );
                }),
              ),
            ],
          ));
        }
        return const Spacer();
      }),
    );
  }

  Widget _buildButton() {
    if (data.status == TournamentStatus.upcoming &&
            Get.currentRoute == Routes.tournamentDetail.route ||
        data.status == TournamentStatus.expired) {
      return Gaps.empty;
    }
    return SizedBox(
      width: double.infinity,
      child: GGButton.main(
        onPressed: _onPressed,
        text: data.status == TournamentStatus.upcoming
            ? localized('see_more')
            : localized('jion_now'),
        height: 44.dp,
        radius: 22.dp,
        textStyle: GGTextStyle(
          fontSize: GGFontSize.content,
          fontWeight: GGFontWeigh.bold,
        ),
      ),
    );
  }

  Widget _buildCountdownTimer() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          padding: EdgeInsets.symmetric(horizontal: 8.dp),
          child: Text(
            data.status == TournamentStatus.upcoming
                ? localized('start_in')
                : data.status == TournamentStatus.expired
                    ? localized('tournament_expired')
                    : localized('end_in'),
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.buttonTextWhite.color.withOpacity(0.7),
              fontWeight: GGFontWeigh.bold,
            ),
          ),
        ),
        if (data.status != TournamentStatus.expired)
          Container(
            margin: EdgeInsets.only(left: 10.dp),
            child: GGCountdown(
              duration: data.status == TournamentStatus.upcoming
                  ? data.startDuration
                  : data.endDuration,
              onEnd: () {
                // 到了开启时间
                if (data.status == TournamentStatus.upcoming) {
                  onCountdownStart?.call(data);
                } else {
                  // 到了结束时间
                  onCountdownEnd?.call(data);
                }
              },
              widgetBuilder: (context, time) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(4, (index) {
                    late int value;
                    late String unit;
                    if (index == 0) {
                      value = time?.days ?? 0;
                      unit = 'D';
                    } else if (index == 1) {
                      value = time?.hours ?? 0;
                      unit = 'H';
                    } else if (index == 2) {
                      value = time?.min ?? 0;
                      unit = 'M';
                    } else if (index == 3) {
                      value = time?.sec ?? 0;
                      unit = 'S';
                    }
                    return Container(
                      margin: EdgeInsets.only(left: index != 0 ? 8.dp : 0),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(4.dp),
                      ),
                      width: 38.dp,
                      padding: EdgeInsets.symmetric(
                        vertical: 6.dp,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Text(
                            value.toString().padLeft(2, '0'),
                            style: GGTextStyle(
                              fontSize: GGFontSize.bigTitle,
                              color: GGColors.buttonTextWhite.color,
                              fontWeight: GGFontWeigh.bold,
                            ),
                          ),
                          Text(
                            unit,
                            style: GGTextStyle(
                              fontSize: GGFontSize.hint,
                              color: GGColors.buttonTextWhite.color,
                              fontWeight: GGFontWeigh.bold,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                );
              },
            ),
          ),
      ],
    );
  }

  Widget _buildRanking() {
    if ((data.pageTable?.total ?? 0) == 0) {
      return Gaps.empty;
    }
    return Column(
      children: [
        Gaps.vGap8,
        TournamentRankHeader(
          height: 36.dp,
          textColor: GGColors.buttonTextWhite.color,
        ),
        Column(
          children:
              List.generate(min(data.pageTable?.list.length ?? 0, 5), (index) {
            final e = data.pageTable!.list[index];
            return Container(
              decoration: BoxDecoration(
                color: index % 2 == 0
                    ? Colors.black.withOpacity(0.1)
                    : GGColors.transparent.color,
                borderRadius: BorderRadius.circular(2.dp),
              ),
              constraints: BoxConstraints(minHeight: 36.dp),
              padding: EdgeInsets.only(right: 8.dp),
              child: Row(
                children: [
                  SizedBox(
                    width: 60.dp,
                    child: Text(
                      e.rankNumber.toString(),
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        fontWeight: GGFontWeigh.bold,
                        color: GGColors.buttonTextWhite.color,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Gaps.hGap10,
                  Expanded(
                    child: Text(
                      e.showUserName,
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        fontWeight: GGFontWeigh.bold,
                        color: GGColors.buttonTextWhite.color,
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
                                color: GGColors.buttonTextWhite.color,
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
                        fontSize: GGFontSize.hint,
                        fontWeight: GGFontWeigh.bold,
                        color: GGColors.buttonTextWhite.color,
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
}

extension _Action1 on TournamentCard {
  void _navigateToDetail() {
    if (Get.currentRoute == Routes.tournamentDetail.route) {
      return;
    }
    Get.toNamed<void>(Routes.tournamentDetail.route, arguments: {
      'tmpCode': data.tmpCode,
    });
  }

  void _onPressed() {
    if (data.status == TournamentStatus.upcoming) {
      _navigateToDetail();
    } else {
      if (AccountService().isLogin) {
        onApplyPress?.call(data);
      } else {
        Get.toNamed<void>(Routes.login.route);
      }
    }
  }
}

extension _Action2 on TournamentExpiredCard {
  void _navigateToDetail() {
    if (Get.currentRoute == Routes.tournamentDetail.route) {
      return;
    }
    Get.toNamed<void>(Routes.tournamentDetail.route, arguments: {
      'tmpCode': data.tmpCode,
    });
  }
}
