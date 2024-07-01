part of '../currency_deposit_virtual_result_confirm_page.dart';

class VirtualAddressNetworkView extends StatelessWidget
    with DepositCommonUIMixin, DepositCommonUtilsMixin {
  const VirtualAddressNetworkView(
      {super.key, this.data, required this.payment});

  final GamingDepositVirtualToCurrencyModel? data;
  final GamingCurrencyPaymentModel payment;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildConfirmPageTitle(localized('pay_address')),
        Gaps.vGap20,
        _buildQR(),
        Gaps.vGap20,
        buildConfirmPageTitle(localized('exp_arr')),
        Gaps.vGap20,
        Text(
          '${data?.expectedBlock}${localized('time_net')}',
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
        Gaps.vGap20,
        buildConfirmPageTitle(localized('exp_un')),
        Gaps.vGap20,
        Text(
          '${data?.expectedUnlockBlock}${localized('time_net')}',
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }

  Widget _buildQR() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        QrImage(
          data: data?.depositAddress ?? '',
          size: 160.dp,
          backgroundColor: GGColors.buttonTextWhite.color,
          padding: EdgeInsets.all(16.dp),
          errorCorrectionLevel: QrErrorCorrectLevel.M,
        ),
        Gaps.vGap10,
        Row(
          children: [
            Expanded(
              child: Text(
                data?.depositAddress ?? '',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              ),
            ),
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => copyToClipboard(data?.depositAddress ?? ''),
              child: SvgPicture.asset(
                R.iconCopy,
                width: 18.dp,
                height: 18.dp,
                color: GGColors.textMain.color,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
