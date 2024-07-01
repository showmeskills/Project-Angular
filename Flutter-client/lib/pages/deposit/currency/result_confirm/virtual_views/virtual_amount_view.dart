part of '../currency_deposit_virtual_result_confirm_page.dart';

class VirtualAmountView extends StatelessWidget
    with DepositCommonUIMixin, DepositCommonUtilsMixin {
  const VirtualAmountView({super.key, required this.data});
  final GamingDepositVirtualToCurrencyModel data;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildConfirmPageTitle(localized('estimated_payment')),
        Gaps.vGap12,
        Text(
          '${data.paymentAmount} ${data.paymentCurrency}',
          style: GGTextStyle(
            fontSize: GGFontSize.bigTitle20,
            fontFamily: GGFontFamily.dingPro,
            fontWeight: GGFontWeigh.bold,
            color: GGColors.link.color,
          ),
        ),
        Row(
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    localized('create_time'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.hint,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                  Text(
                    DateFormat('yyyy-MM-dd HH:mm:ss')
                        .formatTimestamp(data.createTime),
                    style: GGTextStyle(
                      fontSize: GGFontSize.hint,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          localized('order'),
                          style: GGTextStyle(
                            fontSize: GGFontSize.hint,
                            color: GGColors.textSecond.color,
                          ),
                        ),
                        Text(
                          data.orderId,
                          style: GGTextStyle(
                            fontSize: GGFontSize.hint,
                            color: GGColors.textSecond.color,
                          ),
                        ),
                      ],
                    ),
                  ),
                  GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => copyToClipboard(data.orderId),
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
          ],
        ),
      ],
    );
  }
}
