part of '../currency_deposit_virtual_result_confirm_page.dart';

class VirtualConfirmPayView extends StatelessWidget
    with DepositCommonUtilsMixin {
  const VirtualConfirmPayView({super.key, required this.data});
  final GamingDepositVirtualToCurrencyModel data;

  CurrencyDepositVirtualResultConfirmLogic get logic =>
      Get.find<CurrencyDepositVirtualResultConfirmLogic>();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildCountdown(),
        Gaps.vGap20,
        SizedBox(
          width: double.infinity,
          child: GGButton.main(
            onPressed: () {
              navigateToWalletHome();
            },
            text: localized('confirm_pay'),
          ),
        ),
      ],
    );
  }

  Widget _buildCountdown() {
    return Container(
      width: double.infinity,
      color: GGColors.alertBackground.color,
      padding: EdgeInsets.all(8.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Obx(() => Text(
                    '${logic.statusText} ',
                    style: GGTextStyle(
                      fontSize: GGFontSize.smallTitle,
                      color: logic.statusColor,
                    ),
                  )),
              CountdownTimer(
                controller: logic.timerController,
                widgetBuilder: (context, time) {
                  if (logic.status ==
                      GamingCurrencyVirtualDepositOrderStatus.handling) {
                    final min = (time?.min ?? 0).toString().padLeft(2, '0');
                    final sec = (time?.sec ?? 0).toString().padLeft(2, '0');
                    return Text(
                      '$min:$sec',
                      style: GGTextStyle(
                        fontSize: GGFontSize.bigTitle,
                        color: logic.statusColor,
                        fontFamily: GGFontFamily.dingPro,
                        fontWeight: GGFontWeigh.bold,
                      ),
                    );
                  }
                  return Container();
                },
              ),
            ],
          ),
          Gaps.vGap8,
          Text(
            '${data.paymentAmount} ${data.paymentCurrency}',
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle,
              fontFamily: GGFontFamily.dingPro,
              fontWeight: GGFontWeigh.bold,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap8,
          Text(
            localized('complete_deposit'),
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
