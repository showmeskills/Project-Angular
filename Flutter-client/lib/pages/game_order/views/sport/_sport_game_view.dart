part of 'sport_view.dart';

class _SportGameView extends StatelessWidget {
  const _SportGameView({required this.data});

  final GamingSportOrderModel data;

  @override
  Widget build(BuildContext context) {
    if (data.subOrderList.isEmpty) {
      return _buildGame(
        gameName: data.gameDetail.tournamentName ?? '',
        betContent: data.gameDetail.betContent ?? '',
        betoptionName: data.gameDetail.betoptionName ?? '',
        eventName: data.gameDetail.eventName ?? '',
      );
    } else {
      return _SportSubGameView(list: data.subOrderList);
    }
  }
}

class _SportSubGameView extends StatelessWidget {
  const _SportSubGameView({required this.list});

  final List<GamingSportSubOrderModel> list;

  @override
  Widget build(BuildContext context) {
    return ExpandableNotifier(
      child: Column(
        children: [
          _buildGame(
            gameName: list.first.tournamentName ?? '',
            betContent:
                '${list.first.betContent ?? ''} @${list.first.detailOdds}',
            betoptionName: list.first.betoptionName ?? '',
            eventName: list.first.eventName ?? '',
          ),
          Expandable(
            collapsed: const SizedBox(width: double.infinity),
            expanded: Column(
              children: list.skip(1).map((e) {
                return _buildGame(
                  gameName: e.tournamentName ?? '',
                  betContent: '${e.betContent ?? ''} @${e.detailOdds}',
                  betoptionName: e.betoptionName ?? '',
                  eventName: e.eventName ?? '',
                );
              }).toList(),
            ),
          ),
          const _SportGameExpandableButton(),
        ],
      ),
    );
  }
}

class _SportGameExpandableButton extends StatelessWidget {
  const _SportGameExpandableButton();

  @override
  Widget build(BuildContext context) {
    final controller = ExpandableController.of(context)!;
    return Container(
      padding: EdgeInsets.all(10.dp).copyWith(
        top: 0,
      ),
      width: double.infinity,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () {
          controller.toggle();
        },
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            ValueListenableBuilder<bool>(
                valueListenable: controller,
                builder: (context, value, child) {
                  return Text(
                    value ? localized('deal_ex_0') : localized('deal_ex_1'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.hint,
                      color: GGColors.highlightButton.color,
                    ),
                  );
                }),
            Gaps.hGap6,
            ValueListenableBuilder<bool>(
              valueListenable: controller,
              builder: (context, value, child) {
                return AnimatedRotation(
                  turns: value ? 0.5 : 0,
                  duration: const Duration(milliseconds: 200),
                  child: SvgPicture.asset(
                    R.iconArrowDown,
                    width: 14.dp,
                    height: 14.dp,
                    color: GGColors.highlightButton.color,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

extension _SportGameBuilder on StatelessWidget {
  Widget _buildGame({
    required String gameName,
    required String betContent,
    required String betoptionName,
    required String eventName,
  }) {
    return Container(
      padding: EdgeInsets.all(10.dp),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: GGColors.border.color,
            width: 1.dp,
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 14.dp * 1.4,
                alignment: Alignment.center,
                child: SvgPicture.asset(
                  R.iconGame,
                  width: 14.dp,
                  height: 14.dp,
                  color: GGColors.textSecond.color,
                ),
              ),
              Gaps.hGap4,
              Expanded(
                child: Text(
                  gameName,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
            ],
          ),
          Gaps.vGap10,
          Text(
            betContent,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap10,
          Text(
            betoptionName,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap10,
          Text(
            eventName,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        ],
      ),
    );
  }
}
