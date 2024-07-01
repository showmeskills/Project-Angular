part of 'activity.dart';

class _ActivityItem extends StatelessWidget {
  const _ActivityItem({
    this.hasDivider = true,
    required this.data,
  });
  final GamingActivityModel data;
  final bool hasDivider;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onPressed: () {
        Get.toNamed<void>(Routes.activityDetail.route, arguments: {
          'activitiesNo': data.activitiesNo,
        });
      },
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Gaps.vGap16,
            Text(
              data.title ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            Gaps.vGap8,
            Text(
              DateFormat('yyyy-MM-dd').formatTimestamp(data.endTime!),
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textSecond.color,
                fontFamily: GGFontFamily.dingPro,
              ),
            ),
            Gaps.vGap16,
            if (hasDivider)
              Divider(
                color: GGColors.border.color,
                thickness: 1.dp,
                height: 1.dp,
              ),
          ],
        ),
      ),
    );
  }
}
