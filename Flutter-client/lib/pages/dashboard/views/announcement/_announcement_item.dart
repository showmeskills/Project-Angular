part of 'announcement.dart';

class _AnnouncementItem extends StatelessWidget {
  const _AnnouncementItem({
    this.hasDivider = true,
    required this.data,
  });
  final GamingAnnouncementModel data;
  final bool hasDivider;

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onPressed: () {
        H5WebViewManager.sharedInstance.openWebView(
          url: data.webUrl,
          title: localized('announcements'),
        );
      },
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Gaps.vGap16,
            Text(
              data.title,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textMain.color,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (data.releaseTime != null)
              Container(
                margin: EdgeInsets.only(top: 8.dp),
                child: Text(
                  DateFormat('yyyy-MM-dd').formatTimestamp(data.releaseTime!),
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textSecond.color,
                    fontFamily: GGFontFamily.dingPro,
                  ),
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
