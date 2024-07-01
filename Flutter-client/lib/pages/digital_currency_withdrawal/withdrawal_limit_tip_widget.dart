part of 'digital_currency_withdrawal_view.dart';

class WithdrawalLimitTipWidget extends StatelessWidget {
  const WithdrawalLimitTipWidget({
    super.key,
  });

  DigitalCurrencyWithdrawalLogic get controller =>
      Get.find<DigitalCurrencyWithdrawalLogic>();

  DigitalCurrencyWithdrawalState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return _buildLimitWidget();
  }

  Widget _buildLimitWidget() {
    return Column(
      children: [
        _buildRow(
          localized('ava_balance'),
          NumberPrecision(state.limit?.balance).balanceText(true),
        ),
        _buildRow(
          FeeService().wdLimit,
          NumberPrecision(state.limit?.withdrawQuota).balanceText(true),
        ),
        _buildRow(
          localized('daily_limit'),
          state.limit?.todayUnlimited == true
              ? localized('no_limit')
              : NumberPrecision(state.limit?.todayQuota).balanceText(true),
        ),
        _buildRow(
          localized('widthdrawal_amount'),
          NumberPrecision(state.limit?.canUseQuota).balanceText(true),
        ),
      ],
    );
  }

  Widget _buildRow(String left, String right) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Expanded(
            child: Text(
              left,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textBlackOpposite.color,
              ),
            ),
          ),
          Gaps.hGap4,
          Text(
            right,
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textBlackOpposite.color,
            ),
          ),
          Gaps.hGap6,
          Text(
            '${state.limit?.currency}',
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textBlackOpposite.color,
            ),
          ),
        ],
      ),
    );
  }
}
