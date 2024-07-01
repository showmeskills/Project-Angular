part of '../appeal_page.dart';

class _AppealItemExpandedView extends StatelessWidget {
  const _AppealItemExpandedView({
    required this.data,
  });
  final GamingAppealModel data;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Gaps.vGap24,
        _buildProgress(),
        _buildContent(),
      ],
    );
  }

  Widget _buildContent() {
    if (data.status != 'Finish' &&
        data.status != 'Supplement' &&
        data.status != 'Processing' &&
        data.status != 'Pending') {
      return Gaps.empty;
    }
    return Container(
      margin: EdgeInsets.only(top: 14.dp),
      child: Column(
        children: [
          CustomPaint(
            size: Size(18.dp, 13.dp),
            painter: TrianglePainter(
              color: GGColors.border.color,
              direction: TriangleDirection.top,
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: GGColors.border.color,
              borderRadius: BorderRadius.circular(4.dp),
            ),
            padding: EdgeInsets.symmetric(
              horizontal: 16.dp,
              vertical: 24.dp,
            ),
            child: Column(
              children: [
                Gaps.vGap10,
                _buildStatusIcon(),
                Gaps.vGap30,
                Text(
                  data.tips,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
                if (data.appealSupplementType != 'NoSupplement' &&
                    data.status == 'Supplement')
                  Container(
                    margin: EdgeInsets.only(top: 20.dp),
                    child: GGButton.main(
                      onPressed: data.onPressedSupplement,
                      height: 38.dp,
                      padding: EdgeInsets.symmetric(horizontal: 42.dp),
                      text: localized('addit_mater00'),
                      textStyle: GGTextStyle(
                        fontSize: GGFontSize.content,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusIcon() {
    if (data.status == 'Finish') {
      return Image.asset(
        R.appealComplete,
        width: 24.dp,
        height: 30.dp,
      );
    } else if (data.status == 'Supplement') {
      return Image.asset(
        R.appealSupplement,
        width: 24.dp,
        height: 30.dp,
      );
    }

    return Image.asset(
      R.appealPending,
      width: 30.dp,
      height: 33.dp,
    );
  }

  Widget _buildProgress() {
    final max = data.appealSupplementType != 'NoSupplement' ? 4 : 3;
    int step = 1;
    if (data.status == 'Pending') {
      step = 1;
    } else if (data.status == 'Supplement') {
      step = 1;
    } else if (data.status == 'Processing') {
      step = max == 4 ? 3 : 2;
    } else {
      step = max;
    }
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(max, (index) {
        return Expanded(
          child: Column(
            children: [
              Row(
                children: [
                  if (index == 0)
                    const Spacer()
                  else
                    Expanded(
                      child: Container(
                        height: 5.dp,
                        color: index > step
                            ? GGColors.textHint.color
                            : GGColors.highlightButton.color,
                      ),
                    ),
                  Container(
                    width: 30.dp,
                    height: 30.dp,
                    margin: EdgeInsets.symmetric(horizontal: 2.dp),
                    decoration: BoxDecoration(
                      color: index > step
                          ? GGColors.textHint.color
                          : GGColors.highlightButton.color,
                      shape: BoxShape.circle,
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      (index + 1).toString(),
                      style: GGTextStyle(
                        fontSize: GGFontSize.smallTitle,
                        color: index > step
                            ? GGColors.textSecond.color
                            : GGColors.textMain.color,
                      ),
                    ),
                  ),
                  if (index == max - 1)
                    const Spacer()
                  else
                    Expanded(
                      child: Container(
                        height: 5.dp,
                        color: index + 1 > step
                            ? GGColors.textHint.color
                            : GGColors.highlightButton.color,
                      ),
                    ),
                ],
              ),
              Gaps.vGap10,
              Text(
                _getStepText(index + 1, max),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  fontWeight:
                      index < step ? GGFontWeigh.bold : GGFontWeigh.regular,
                  color: index - 1 < step
                      ? GGColors.textMain.color
                      : GGColors.textSecond.color,
                ),
              ),
              Gaps.vGap6,
              if (index == 0)
                Text(
                  DateFormat('yyyy-MM-dd HH:mm:ss')
                      .formatTimestamp(data.appealTime!),
                  textAlign: TextAlign.center,
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textHint.color,
                  ),
                ),
            ],
          ),
        );
      }),
    );
  }

  String _getStepText(
    int index,
    int count,
  ) {
    if (index == 1) {
      return localized('sub_app');
    } else if (index == 2) {
      return count == 4 ? localized('addit_mater00') : localized('app_process');
    } else if (index == 3) {
      return count == 4 ? localized('app_process') : localized('app_complete');
    } else {
      return localized('app_complete');
    }
  }
}
