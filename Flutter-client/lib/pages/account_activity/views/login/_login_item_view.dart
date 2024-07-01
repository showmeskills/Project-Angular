part of 'login_view.dart';

class _LogicItemView extends StatelessWidget {
  const _LogicItemView({
    required this.data,
  });

  final GamingAccountActivityModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: GGColors.darkPopBackground.color,
        borderRadius: BorderRadius.circular(8.dp),
      ),
      padding: EdgeInsets.all(16.dp),
      margin: EdgeInsets.symmetric(horizontal: 16.dp).copyWith(top: 8.dp),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  DateFormat('yyyy-MM-dd HH:mm:ss')
                      .formatTimestamp(data.createTime!),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
              ),
              Gaps.hGap16,
              Text(
                data.resultText,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: data.result == 'Success'
                      ? GGColors.success.color
                      : GGColors.error.color,
                ),
              ),
            ],
          ),
          Gaps.vGap8,
          _buildCellItem(
            title: localized('source'),
            value: '${data.source}',
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
