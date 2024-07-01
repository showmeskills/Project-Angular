part of '../currency_deposit_result_confirm_page.dart';

class _ConfirmBankAccountView extends StatelessWidget
    with DepositCommonUIMixin, DepositCommonUtilsMixin {
  const _ConfirmBankAccountView({this.data, required this.payment, required this.onPressPayMethod});
  final GamingDepositBankInfoModel? data;
  final GamingCurrencyPaymentModel payment;
  final void Function() onPressPayMethod;
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildConfirmPageTitle(localized('pay_method')),
        Gaps.vGap20,
        InkWell(
          onTap: onPressPayMethod,
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(width: 1.dp, color: GGColors.border.color),
            ),
            padding: EdgeInsets.symmetric(horizontal: 8.dp, vertical: 10.dp),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (payment.icons.firstOrNull?.isEmpty ?? true)
                  GamingImage.asset(
                    R.iconDefaultPayment,
                    width: 18.dp,
                    height: 18.dp,
                  )
                else
                  GamingImage.network(
                    url: payment.icons.first,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                Gaps.hGap8,
                Text(
                  payment.name,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
              ],
            ),
          ),
        ),
        if (!(data?.invalid ?? true))
          Container(
            width: double.infinity,
            color: GGColors.alertBackground.color,
            padding: EdgeInsets.all(8.dp),
            margin: EdgeInsets.only(top: 20.dp),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (data!.bankAccountNumber != null)
                  _buildItem(
                    title: localized('bank_acc'),
                    value: data!.bankAccountNumber!,
                  ),
                if (data!.bankAccountHolder != null)
                  Container(
                    margin: EdgeInsets.only(top: 8.dp),
                    child: _buildItem(
                      title: localized('name_name'),
                      value: data!.bankAccountHolder!,
                    ),
                  ),
                if (data!.bankName != null)
                  Container(
                    margin: EdgeInsets.only(top: 8.dp),
                    child: Row(
                      children: [
                        Flexible(
                          child: Text(
                            '${localized('acc_open_bank')}: ${data!.bankName}',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                            ),
                          ),
                        ),
                        Gaps.hGap8,
                        GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onTap: () => copyToClipboard(data!.bankName!),
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
          ),
      ],
    );
  }

  Widget _buildItem({
    required String title,
    required String value,
  }) {
    return Row(
      children: [
        Flexible(
          child: RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: '$title: ',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                  ),
                ),
                TextSpan(
                  text: value,
                  style: GGTextStyle(
                    fontSize: GGFontSize.smallTitle,
                    color: GGColors.textMain.color,
                    fontFamily: GGFontFamily.dingPro,
                    fontWeight: GGFontWeigh.bold,
                  ),
                ),
              ],
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        Gaps.hGap8,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => copyToClipboard(value),
          child: SvgPicture.asset(
            R.iconCopy,
            width: 18.dp,
            height: 18.dp,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }
}
