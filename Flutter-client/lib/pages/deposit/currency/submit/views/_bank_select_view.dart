part of '../currency_deposit_submit_page.dart';

class _BankSelectView extends StatelessWidget with DepositCommonUIMixin {
  const _BankSelectView({required this.onPressed});

  final void Function() onPressed;

  CurrencyDepositSubmitLogic get controller =>
      Get.find<CurrencyDepositSubmitLogic>();

  CurrencyDepositSubmitState get state => controller.state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('choose_bank'), context),
        Gaps.vGap4,
        DepositCommonSelectView(
          onPressed: onPressed,
          builder: (context) {
            return Obx(() {
              if (state.bank == null) {
                return Text(
                  localized('select_bank'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textHint.color,
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              } else {
                return Row(
                  children: [
                    Image.asset(
                      state.bank!.bankIcon,
                      width: 18.dp,
                      height: 18.dp,
                    ),
                    Gaps.hGap10,
                    Expanded(
                      child: Text(
                        state.bank!.bankNameLocal,
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ],
                );
              }
            });
          },
        ),
      ],
    );
  }
}
