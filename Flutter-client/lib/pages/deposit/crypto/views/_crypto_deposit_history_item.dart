part of 'crypto_deposit_history_view.dart';

class _CryptoDepositHistoryItem extends StatelessWidget {
  const _CryptoDepositHistoryItem({required this.data});

  final GamingCryptoHistoryModel data;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _showSuccessful,
      behavior: HitTestBehavior.opaque,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap20,
          Row(
            children: [
              GamingImage.network(
                url: data.iconUrl,
                height: 20.dp,
                width: 20.dp,
              ),
              Gaps.hGap4,
              Text(
                '${data.amount} ${data.currency}',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                  fontFamily: GGFontFamily.dingPro,
                  fontWeight: GGFontWeigh.bold,
                ),
              ),
              Gaps.hGap4,
              Container(
                padding: EdgeInsets.symmetric(horizontal: 6.dp),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(4.dp),
                  color: GGColors.success.color.withOpacity(0.2),
                ),
                child: Text(
                  data.statusName,
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.success.color,
                  ),
                ),
              ),
              const Spacer(),
              Container(
                width: 22.dp,
                height: 22.dp,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: GGColors.border.color,
                ),
                child: SvgPicture.asset(
                  R.iconArrowRightAlt,
                  width: 11.dp,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
          Gaps.vGap10,
          Text(
            DateFormat('yyyy-MM-dd HH:mm').formatTimestamp(data.date),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
        ],
      ),
    );
  }
}

extension _Action on _CryptoDepositHistoryItem {
  void _showSuccessful() {
    GamingBottomSheet.show<void>(
      title: localized('dep_det'),
      fixedHeight: true,
      builder: (context) {
        return _ResultView(
          data: data,
        );
      },
    );
  }
}
