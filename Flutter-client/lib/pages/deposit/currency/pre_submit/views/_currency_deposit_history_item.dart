part of 'currency_deposit_history_view.dart';

class _CurrencyDepositHistoryItem extends StatelessWidget {
  const _CurrencyDepositHistoryItem({required this.data});

  final GamingCurrencyHistoryModel data;

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
              Text(
                localized('order'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
              Gaps.hGap4,
              Expanded(
                child: Text(
                  '${data.orderNum}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                    fontFamily: GGFontFamily.dingPro,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ),
              Gaps.hGap4,
              Text(
                '${data.amount} ${data.currency}',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                  fontFamily: GGFontFamily.dingPro,
                ),
              ),
            ],
          ),
          Gaps.vGap10,
          Row(
            children: [
              Expanded(
                child: Text(
                  DateFormat('yyyy-MM-dd HH:mm').formatTimestamp(data.date),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
              Text(
                data.statusName,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                  fontFamily: GGFontFamily.dingPro,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

extension _Action on _CurrencyDepositHistoryItem {
  void _showSuccessful() {
    // GamingBottomSheet.show<void>(
    //   title: localized('dep_det'),
    //   isScrollControlled: true,
    //   builder: (context) {
    //     return CryptoDepositResultView(
    //       data: data,
    //     );
    //   },
    // );
  }
}
