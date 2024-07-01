part of 'digital_currency_withdrawal_history_view.dart';

class WithdrawalHistoryItem extends StatelessWidget
    with DepositCommonUtilsMixin {
  const WithdrawalHistoryItem({super.key, required this.data});

  final GamingCryptoHistoryModel data;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _showSuccessful,
      behavior: HitTestBehavior.opaque,
      child: Column(
        children: [
          Gaps.vGap2,
          Container(
            padding: EdgeInsets.only(
                top: 20.dp, left: 18.dp, right: 18.dp, bottom: 20.dp),
            decoration: BoxDecoration(
              color: GGColors.popBackground.color,
              borderRadius: BorderRadius.circular(8.dp),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    GamingImage.network(
                      url: data.iconUrl,
                      height: 18.dp,
                      width: 18.dp,
                    ),
                    Gaps.hGap8,
                    Text(
                      '${data.amount} ${data.currency}',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textMain.color,
                        fontFamily: GGFontFamily.dingPro,
                        fontWeight: GGFontWeigh.bold,
                      ),
                    ),
                    Gaps.hGap12,
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 8.dp, vertical: 4.dp),
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(4.dp),
                        color: data.status ==
                                GamingCryptoHistoryModelStatus.notPassed.value
                            ? GGColors.error.color.withOpacity(0.2)
                            : GGColors.success.color.withOpacity(0.2),
                      ),
                      child: Text(
                        data.statusName,
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: data.status ==
                                  GamingCryptoHistoryModelStatus.notPassed.value
                              ? GGColors.error.color
                              : GGColors.success.color,
                        ),
                      ),
                    ),
                    const Spacer(),
                    //
                    //   Text(
                    //     localized('trans_network'),
                    //     style: GGTextStyle(
                    //       fontSize: GGFontSize.hint,
                    //       color: GGColors.textSecond.color,
                    //     ),
                    //   ),
                    //   Gaps.hGap12,
                    //   Text(
                    //     data.network,
                    //     style: GGTextStyle(
                    //       fontSize: GGFontSize.hint,
                    //       color: GGColors.textSecond.color,
                    //     ),
                    //   ),
                  ],
                ),
                Gaps.vGap14,
                Row(
                  children: [
                    Text(
                      localized('address'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: GGColors.textSecond.color,
                      ),
                    ),
                    const Spacer(),
                    SizedBox(
                        width: 130.dp,
                        child: GamingText(
                          data.address,
                          style: GGTextStyle(
                            fontSize: GGFontSize.hint,
                            color: GGColors.textMain.color,
                          ),
                        )),
                    Gaps.vGap8,
                    GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => copyToClipboard(data.address),
                      child: SvgPicture.asset(
                        R.iconCopy,
                        width: 12.dp,
                        height: 14.dp,
                        color: GGColors.textSecond.color,
                      ),
                    ),
                  ],
                ),
                Gaps.vGap20,
                Row(
                  children: [
                    Text(
                      localized('tx_ad'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.hint,
                        color: GGColors.textSecond.color,
                      ),
                    ),
                    const Spacer(),
                    SizedBox(
                        width: 130.dp,
                        child: GamingText(
                          data.txid.isNotEmpty ? data.txid : data.address,
                          style: GGTextStyle(
                            fontSize: GGFontSize.hint,
                            color: GGColors.textMain.color,
                          ),
                        )),
                    Gaps.vGap8,
                    GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => copyToClipboard(
                          data.txid.isNotEmpty ? data.txid : data.address),
                      child: SvgPicture.asset(
                        R.iconCopy,
                        width: 12.dp,
                        height: 14.dp,
                        color: GGColors.textSecond.color,
                      ),
                    ),
                  ],
                ),
                Gaps.vGap20,
                Row(
                  children: [
                    Text(
                      DateFormat('yyyy-MM-dd HH:mm').formatTimestamp(data.date),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                      ),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: () {
                        GamingHistoryWithdrawCryptoBottomSheet.show(data: data);
                      },
                      child: Image.asset(
                        ThemeManager.shareInstacne.imagePath(R.iconGoDetail),
                        height: 24.dp,
                      ),
                    )
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

extension _Action on WithdrawalHistoryItem {
  void _showSuccessful() {}
}
