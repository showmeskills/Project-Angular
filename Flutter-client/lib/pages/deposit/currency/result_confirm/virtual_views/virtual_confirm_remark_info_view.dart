part of '../currency_deposit_virtual_result_confirm_page.dart';

class VirtualConfirmRemarkInfoView extends StatelessWidget
    with DepositCommonUIMixin {
  const VirtualConfirmRemarkInfoView(
      {super.key, required this.payment, this.data});
  final GamingCurrencyPaymentModel payment;
  final GamingDepositVirtualToCurrencyModel? data;
  @override
  Widget build(BuildContext context) {
    String str = payment.detailContent
        .replaceAll('{CYPTO}', '${data?.paymentCurrency}-${data?.network}');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildConfirmPageTitle(localized('remark_info')),
        Gaps.vGap20,
        if (data?.remark?.isNotEmpty ?? false)
          Container(
            margin: EdgeInsets.only(bottom: 20.dp),
            child: Text(
              data!.remark!,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        Container(
          width: double.infinity,
          color: GGColors.alertBackground.color,
          padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 4.dp),
          child: Html(
            data: str,
            style: {
              'body': Style(
                margin: Margins.zero,
              ),
            },
          ),
        ),
      ],
    );
  }
}
