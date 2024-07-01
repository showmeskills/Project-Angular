part of '../currency_deposit_submit_page.dart';

class _DepositVirtualGetCurrencyView extends StatelessWidget
    with DepositCommonUIMixin {
  const _DepositVirtualGetCurrencyView();

  CurrencyDepositSubmitLogic get controller =>
      Get.find<CurrencyDepositSubmitLogic>();

  CurrencyDepositSubmitState get state => controller.state;

  CurrencyDepositPreSubmitLogic get preLogic =>
      Get.find<CurrencyDepositPreSubmitLogic>();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Obx(() {
          return _buildContentWithAmountWidget(localized('estimated_payment'),
              '${NumberPrecision((state.amount / GGUtil.parseDouble(state.curRates?.rate, 1.0)).stripTrailingZeros()).balanceText(true)} ${preLogic.state.cryptoCurrency?.currency}');
        }), // state.estimatedAmountText
        Obx(() {
          return _buildContentWithAmountWidget(
              localized('reference_exchange_rate'),
              '1 ${preLogic.state.cryptoCurrency?.currency} = ${state.curRates?.rate} ${state.currency.currency}');
        }),
        Gaps.vGap12,
        _buildContentWidget(localized('refer_rate_at_the_time_of_payment')),
        Gaps.vGap12,
        _buildContentWidget(localized(localized(
            'amount_received_will_be_subject_to_the_deposit_amount'))),
      ],
    );
  }

  Widget _buildContentWidget(String str) {
    return Text(
      str,
      style: GGTextStyle(
        fontSize: GGFontSize.content,
        color: GGColors.textHint.color,
      ),
    );
  }

  Widget _buildContentWithAmountWidget(String str, String amount) {
    return Row(
      children: [
        _buildContentWidget(str),
        Text(
          amount,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            fontFamily: GGFontFamily.dingPro,
            color: GGColors.textMain.color,
          ),
        ),
      ],
    );
  }
}
