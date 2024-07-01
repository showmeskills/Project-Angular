part of '../currency_deposit_virtual_result_confirm_page.dart';

class VirtualPayMethodView extends StatelessWidget with DepositCommonUIMixin {
  const VirtualPayMethodView({super.key, this.data, required this.payment});
  final GamingDepositVirtualToCurrencyModel? data;
  final GamingCurrencyPaymentModel payment;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildConfirmPageTitle(localized('pay_method')),
        Gaps.vGap20,
        Container(
          decoration: BoxDecoration(
            border: Border.all(width: 1.dp, color: GGColors.border.color),
          ),
          padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 10.dp),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                '${localized('crypto')} ${data?.paymentCurrency}/${data?.network}',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
