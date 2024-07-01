part of 'device_manage.dart';

class _DeviceManageItem extends StatelessWidget {
  const _DeviceManageItem({
    this.hasDivider = true,
    required this.data,
  });
  final GamingDeviceHistoryModel data;
  final bool hasDivider;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap16,
          Row(
            children: [
              Expanded(
                child: Text(
                  '${data.browser}${data.os?.isEmpty ?? true ? '' : "(${data.os})"}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Gaps.hGap16,
              Text(
                '${data.createIp}',
                style: GGTextStyle(
                  fontSize: GGFontSize.hint,
                  color: GGColors.textMain.color,
                  fontFamily: GGFontFamily.dingPro,
                ),
              ),
            ],
          ),
          Gaps.vGap6,
          Row(
            children: [
              Expanded(
                child: Text(
                  '${data.createZone}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (data.createTime != null)
                Text(
                  DateFormat('yyyy-MM-dd HH:mm:ss')
                      .formatTimestamp(data.lastLoginTime!),
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textSecond.color,
                    fontFamily: GGFontFamily.dingPro,
                  ),
                )
            ],
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
    );
  }
}
