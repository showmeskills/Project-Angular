part of '../currency_deposit_submit_page.dart';

class _AmountView extends StatelessWidget with DepositCommonUIMixin {
  const _AmountView();

  CurrencyDepositSubmitLogic get controller =>
      Get.find<CurrencyDepositSubmitLogic>();

  CurrencyDepositSubmitState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          buildSubTitle(localized('will_receive'), context),
          Gaps.vGap12,
          Obx(() => Text(
                state.estimatedAmountText,
                style: GGTextStyle(
                  fontSize: GGFontSize.bigTitle,
                  fontFamily: GGFontFamily.dingPro,
                  fontWeight: GGFontWeigh.bold,
                  color: GGColors.textMain.color,
                ),
              )),
          Gaps.vGap12,
          Row(
            children: [
              Text(
                '${localized('act_arr')}:',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                ),
              ),
              SizedBox(width: 77.dp),
              Obx(
                () => Text(
                  state.estimatedAmountText2,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                    fontFamily: GGFontFamily.dingPro,
                  ),
                ),
              ),
            ],
          ),
          Gaps.vGap12,
          Text(
            localized('dep_real_name'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textHint.color,
            ),
          ),
          Gaps.vGap8,
          Opacity(
            opacity: 0.7,
            child: Container(
              width: double.infinity,
              height: 48.dp,
              padding: EdgeInsets.symmetric(horizontal: 14.dp, vertical: 14.dp),
              decoration: BoxDecoration(
                // color: ThemeManager.shareInstacne.isDarkMode ? GGColors.disabled.color.withOpacity(0.8),
                borderRadius: BorderRadius.circular(4.dp),
                border: Border.all(
                  color: GGColors.border.color,
                  width: 1.dp,
                ),
              ),
              alignment: Alignment.centerLeft,
              child: Text(
                state.kycName ?? '',
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textHint.color,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
