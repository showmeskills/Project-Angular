part of '../currency_deposit_result_confirm_page.dart';

class _ConfirmPayView extends StatelessWidget with DepositCommonUtilsMixin {
  const _ConfirmPayView({required this.data});
  final GamingCurrencyDepositModel data;

  CurrencyDepositResultConfirmLogic get logic =>
      Get.find<CurrencyDepositResultConfirmLogic>();

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
              navigateToHome();
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
                      GamingCurrencyDepositOrderStatus.handling) {
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
            '${data.amountText} ${data.currency}',
            style: GGTextStyle(
              fontSize: GGFontSize.bigTitle,
              fontFamily: GGFontFamily.dingPro,
              fontWeight: GGFontWeigh.bold,
              color: GGColors.textMain.color,
            ),
          ),
          Gaps.vGap8,
          Row(
            children: [
              Expanded(
                child: Text(
                  localized('complete_deposit'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ),
            ],
          ),
          if (data.statue == 3) ...[
            Gaps.vGap8,
            Row(
              children: [
                Expanded(
                  child: Text(
                    localized('deposit_statue_three'),
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.brand.color,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
