part of '../gaming_date_range_selector.dart';

class _GamingDateRangeSelectorItem extends StatelessWidget {
  const _GamingDateRangeSelectorItem({
    required this.data,
    required this.selected,
    this.isUtc = false,
  });

  final GamingDateRangeType data;
  final GamingDateRangeType selected;
  final bool isUtc;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onPressed: () {
        Get.back(result: data);
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Container(
          height: 48.dp,
          alignment: Alignment.centerLeft,
          child: Text(
            data.description(isUtc),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: selected == data
                  ? GGColors.highlightButton.color
                  : GGColors.textMain.color,
            ),
          ),
        ),
      ),
    );
  }
}
