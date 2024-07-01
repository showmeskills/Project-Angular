part of 'recent_transactions.dart';

class _RecentTransactionsItem extends StatelessWidget {
  const _RecentTransactionsItem({
    this.hasDivider = true,
    required this.data,
  });
  final GamingRecentOrderModel data;
  final bool hasDivider;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap18,
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Text(
                  data.gameName ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Flexible(
                flex: 1,
                child: Center(
                  child: Text(
                    data.odds.isEmpty ? '-' : data.odds,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                    ),
                  ),
                ),
              ),
              Flexible(
                flex: 2,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Flexible(
                      child: Text(
                        data.betAmountText,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                    ),
                    Gaps.hGap4,
                    GamingImage.network(
                      url: data.currencyIconUrl,
                      width: 18.dp,
                      height: 18.dp,
                    ),
                  ],
                ),
              ),
            ],
          ),
          Gaps.vGap12,
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
