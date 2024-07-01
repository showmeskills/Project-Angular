part of '../currency_deposit_submit_page.dart';

class DepositAmountTextFieldView extends StatelessWidget
    with DepositCommonUIMixin {
  const DepositAmountTextFieldView({
    super.key,
    required this.fixedAmounts,
  });

  CurrencyDepositSubmitLogic get controller =>
      Get.find<CurrencyDepositSubmitLogic>();

  CurrencyDepositSubmitState get state => controller.state;

  /// 固定金额选项
  final List<num> fixedAmounts;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildTitle(
          localized('ent_amount'),
          context,
          tag: FaqTag.legalCurrencyRecharge,
        ),
        if (fixedAmounts.isNotEmpty) _buildAmountTab(),
        Obx(() {
          if (state.amountType.value == 0 && fixedAmounts.isNotEmpty) {
            return _buildFixedAmount(context);
          } else {
            return _buildEnterAmount(context);
          }
        }),
      ],
    );
  }

  Widget _buildEnterAmount(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap12,
        buildSubTitle(localized('number'), context),
        Gaps.vGap4,
        Obx(
          () => GamingTextField(
            controller: state.amountController,
            keyboardType: TextInputType.number,
            fillColor: GGColors.background,
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[0-9]')),
            ],
            hintText:
                '${localized('please_enter')}${state.payment.minAmountText}-${state.payment.maxAmountText} ${state.currency.currency}',
          ),
        ),
      ],
    );
  }

  Widget _buildAmountTab() {
    return Padding(
      padding: EdgeInsets.only(top: 20.dp),
      child: Row(
        children: [
          _buildTypeButton(0, localized('fixed_amount')),
          Gaps.hGap12,
          _buildTypeButton(1, localized('customised_amount')),
        ],
      ),
    );
  }

  Widget _buildTypeButton(int type, String text) {
    return Obx(() {
      final isSelected = state.amountType.value == type;
      return GGButton(
        height: 35.dp,
        backgroundColor: isSelected
            ? GGColors.border.color.withOpacity(0.6)
            : GGColors.transparent.color,
        border: Border.all(
          width: 1,
          color:
              isSelected ? GGColors.transparent.color : GGColors.border.color,
        ),
        textStyle: GGTextStyle(
          color: GGColors.textMain.color,
          fontSize: GGFontSize.content,
        ),
        onPressed: () => _onPressAmountType(type),
        text: text,
      );
    });
  }

  Widget _buildFixedAmount(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.max,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap14,
        Row(
          children: [
            Expanded(
              child: Text(
                localized('fixed_amount_title'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                ),
              ),
            )
          ],
        ),
        GridView(
          padding: EdgeInsets.only(top: 5.dp),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3, //横轴三个子widget
            mainAxisExtent: 42.dp,
            mainAxisSpacing: 8.dp,
            crossAxisSpacing: 8.dp,
          ),
          shrinkWrap: true,
          children: fixedAmounts
              .map((e) => _buildAmountButton(e.toInt().toString()))
              .toList(),
        ),
      ],
    );
  }

  Widget _buildAmountButton(String text) {
    return Obx(() {
      final isSelected = state.amountController.text.value == text;
      return GGButton(
        backgroundColor:
            isSelected ? GGColors.brand.color : GGColors.transparent.color,
        border: Border.all(
          width: 1,
          color:
              isSelected ? GGColors.transparent.color : GGColors.border.color,
        ),
        textStyle: GGTextStyle(
          color: isSelected
              ? GGColors.buttonTextWhite.color
              : GGColors.textMain.color,
          fontSize: GGFontSize.content,
        ),
        onPressed: () => _onPressFixedAmount(text),
        text: text,
      );
    });
  }

  void _onPressFixedAmount(String amount) {
    state.amountController.textController.text = amount;
  }

  void _onPressAmountType(int type) {
    state.amountType.value = type;
    state.amountController.textController.clear();
  }
}
