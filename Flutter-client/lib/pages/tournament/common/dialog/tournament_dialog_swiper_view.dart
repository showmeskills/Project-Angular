part of 'tournament_dialog_view.dart';

class _TournamentDialogSwiperView extends StatelessWidget {
  const _TournamentDialogSwiperView({
    required this.data,
  });

  final TournamentModel data;

  @override
  Widget build(BuildContext context) {
    return KeepAliveWrapper(
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildTournamentHeader(),
            Gaps.vGap10,
            _buildCountdownTimer(),
            Gaps.vGap10,
            const TournamentRankHeader(),
            _buildRanking(),
            Gaps.vGap24,
          ],
        ),
      ),
    );
  }

  Widget _buildTournamentHeader() {
    return Row(
      children: [
        GamingImage.network(
          url: data.activityThumbnails?.isEmpty ?? true
              ? R.tournamentDefaultBanner
              : data.activityThumbnails!,
          fit: BoxFit.cover,
          width: 81.dp,
          height: 62.dp,
        ),
        Gaps.hGap10,
        Expanded(
          child: SizedBox(
            height: 62.dp,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                Text(
                  data.activityName ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.bigTitle22,
                    color: GGColors.textMain.color,
                    fontWeight: GGFontWeigh.bold,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  data.activitySubName ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textHint.color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ),
        // Gaps.hGap10,
        // GamingImage.asset(
        //   R.iconArrowRight,
        //   width: 14.dp,
        //   color: GGColors.textSecond.color,
        // ),
      ],
    );
  }

  Widget _buildCountdownTimer() {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.moduleBackground.color,
        borderRadius: BorderRadius.circular(4.dp),
      ),
      padding: EdgeInsets.symmetric(vertical: 11.dp),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            data.status == TournamentStatus.upcoming
                ? localized('start_in')
                : localized('end_in'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color.withOpacity(0.7),
              fontWeight: GGFontWeigh.bold,
            ),
          ),
          Gaps.hGap10,
          GGCountdown(
            duration: data.status == TournamentStatus.upcoming
                ? data.startDuration
                : data.endDuration,
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
        ],
      ),
    );
  }

  Widget _buildRanking() {
    final list = rankList();
    if (list.isEmpty) {
      return const GoGamingEmpty();
    }
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(list.length, (index) {
        final e = list[index];
        return Container(
          decoration: BoxDecoration(
            color: index % 2 == 0
                ? GGColors.moduleBackground.color
                : GGColors.transparent.color,
            borderRadius: BorderRadius.circular(2.dp),
            border: e.uid == data.currentUserRank?.uid
                ? Border.all(color: GGColors.highlightButton.color, width: 1.dp)
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
                    color: GGColors.textSecond.color,
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
                    color: GGColors.textSecond.color,
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
                            color: GGColors.highlightButton.color,
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
                    color: GGColors.textSecond.color,
                  ),
                  textAlign: TextAlign.right,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }

  List<TournamentRankModel> rankList() {
    final origin = data.pageTable?.list ?? [];
    final list = List<TournamentRankModel>.from(origin)
        .getRange(0, min(origin.length, 10))
        .toList();
    final currentUserRank = data.currentUserRank;
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
}
