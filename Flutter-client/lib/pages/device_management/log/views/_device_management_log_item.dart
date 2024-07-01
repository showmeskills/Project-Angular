part of '../device_management_log_page.dart';

class _DeviceManagementLogItem extends StatelessWidget {
  const _DeviceManagementLogItem({required this.data});

  final GamingDeviceLogModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16.dp),
      margin: EdgeInsets.only(top: 8.dp),
      decoration: BoxDecoration(
        color: GGColors.darkPopBackground.color,
        borderRadius: BorderRadius.circular(8.dp),
      ),
      child: Column(
        children: [
          _buildCellItem(
            title: localized('time'),
            value: DateFormat('yyyy-MM-dd HH:mm:ss')
                .formatTimestamp(data.createTime!),
          ),
          Gaps.vGap8,
          _buildCellItem(
            title: localized('location'),
            value: '${data.createZone}',
          ),
          Gaps.vGap8,
          _buildCellItem(
            title: localized('ip_addr00'),
            value: '${data.createIp}',
          ),
        ],
      ),
    );
  }

  Widget _buildCellItem({
    required String title,
    required String value,
  }) {
    return Row(
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
              fontFamily: GGFontFamily.dingPro,
            ),
          ),
        ),
      ],
    );
  }
}
