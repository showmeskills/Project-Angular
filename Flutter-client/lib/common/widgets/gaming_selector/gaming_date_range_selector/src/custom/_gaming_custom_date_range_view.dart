part of '../../gaming_date_range_selector.dart';

class _GamingCustomDateRangeView extends StatelessWidget {
  const _GamingCustomDateRangeView({
    this.selected,
    this.maxInterval = 90,
    this.isUtc = false,
  });

  final GamingDateRange? selected;
  final int maxInterval;
  final bool isUtc;

  int get maxMonth {
    return maxInterval ~/ 30;
  }

  _GamingCustomDateRangeLogic get logic =>
      Get.find<_GamingCustomDateRangeLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(_GamingCustomDateRangeLogic(
      selected: selected,
      maxInterval: maxInterval,
      isUtc: isUtc,
    ));
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            alignment: Alignment.centerLeft,
            height: 32.dp,
            child: Text(
              localized('date_picker_range_max', params: [maxMonth.toString()]),
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
          Gaps.vGap16,
          Row(
            children: [
              Expanded(
                child: Obx(
                  () {
                    return _buildDateSelected(
                      title: localized('start_time00'),
                      date: logic.start,
                      onPressed: _selectStartDate,
                    );
                  },
                ),
              ),
              Gaps.hGap16,
              _buildGaps(),
              Gaps.hGap16,
              Expanded(
                child: Obx(
                  () {
                    return _buildDateSelected(
                      title: localized('end_time00'),
                      date: logic.end,
                      onPressed: _selectEndDate,
                    );
                  },
                ),
              ),
            ],
          ),
          const Spacer(),
          SafeArea(
            top: false,
            minimum: EdgeInsets.only(bottom: 16.dp),
            child: SizedBox(
              width: double.infinity,
              child: Obx(
                () => GGButton.main(
                  onPressed: () {
                    Get.back(
                        result: GamingDateRange(
                      start: logic.start!,
                      end: logic.end!,
                    ));
                  },
                  enable: logic.allowSubmit,
                  text: localized('continue'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGaps() {
    return Container(
      margin: EdgeInsets.only(
        top: GGFontSize.content.fontSize * 1.4 + 4.dp,
      ),
      child: Text(
        localized('to'),
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.textSecond.color,
        ),
      ),
    );
  }

  Widget _buildDateSelected({
    DateTime? date,
    required String title,
    required void Function() onPressed,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title, // localized('start_time00'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        ScaleTap(
          onPressed: onPressed,
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(
                width: 1.dp,
                color: GGColors.border.color,
              ),
              borderRadius: BorderRadius.circular(4.dp),
            ),
            padding: EdgeInsets.symmetric(
              vertical: 14.dp,
              horizontal: 10.dp,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    date == null ? '-' : DateFormat('yyyy-MM-dd').format(date),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  ),
                ),
                Gaps.hGap6,
                SvgPicture.asset(
                  R.iconCalendar,
                  width: 14.dp,
                  height: 14.dp,
                  color: GGColors.textSecond.color,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

extension on _GamingCustomDateRangeView {
  void _selectEndDate() {
    GamingDatePicker.openDatePicker(
      initialDate: logic.end,
      maxDate: isUtc ? logic.end : DateTime.now(),
    ).then(logic.setEnd);
  }

  void _selectStartDate() {
    GamingDatePicker.openDatePicker(
      initialDate: logic.start ?? logic.end,
      maxDate: isUtc ? logic.start ?? logic.end : DateTime.now(),
    ).then(logic.setStart);
  }
}
