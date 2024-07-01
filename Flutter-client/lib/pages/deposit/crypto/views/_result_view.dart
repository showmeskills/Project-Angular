part of 'crypto_deposit_history_view.dart';

class _ResultView extends StatelessWidget with DepositCommonUtilsMixin {
  const _ResultView({required this.data});

  final GamingCryptoHistoryModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildTextItem(
            title: localized('status'),
            value: data.statusName,
          ),
          Gaps.vGap16,
          _buildTextItem(
            title: localized('date'),
            value: DateFormat('yyyy-MM-dd HH:mm').formatTimestamp(data.date),
          ),
          Gaps.vGap16,
          _buildCurrency(),
          Gaps.vGap16,
          _buildTextItem(
            title: localized('recharge_num00'),
            value: data.amount.toString(),
          ),
          Gaps.vGap16,
          _buildTextItem(
            title: localized('trans_network'),
            value: data.network,
          ),
          Gaps.vGap16,
          _buildTextItem(
            title: localized('address'),
            value: data.address,
            allowCopy: true,
          ),
          Gaps.vGap16,
          _buildTextItem(
            title: localized('tx_ad'),
            value: data.txid,
            allowCopy: true,
          ),
        ],
      ),
    );
  }

  Widget _buildItem({
    required String title,
    required Widget child,
  }) {
    return Row(
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.hGap36,
        Expanded(child: child)
      ],
    );
  }

  Widget _buildTextItem({
    required String title,
    required String value,
    bool allowCopy = false,
  }) {
    return _buildItem(
      title: title,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: allowCopy ? () => copyToClipboard(value) : null,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            Flexible(
              child: Text(
                value,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
            ),
            if (allowCopy)
              Container(
                margin: EdgeInsets.only(left: 8.dp),
                child: SvgPicture.asset(
                  R.iconCopy,
                  width: 18.dp,
                  height: 18.dp,
                  color: GGColors.textMain.color,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrency() {
    return _buildItem(
      title: localized('curr'),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        mainAxisSize: MainAxisSize.min,
        children: [
          GamingImage.network(
            url: CurrencyService.sharedInstance.getIconUrl(data.currency),
            height: 20.dp,
            width: 20.dp,
          ),
          Gaps.hGap8,
          Text(
            data.currency,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        ],
      ),
    );
  }
}
