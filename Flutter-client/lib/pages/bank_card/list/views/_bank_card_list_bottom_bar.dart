part of '../bank_card_list_page.dart';

class _BankCardListBottomBar extends StatelessWidget {
  const _BankCardListBottomBar();

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (logic.batch) {
        return _buildBatchBottomBar();
      }
      return _buildNormalBottomBar();
    });
  }

  BankCardListLogic get logic => Get.find<BankCardListLogic>();

  Widget _buildBatchBottomBar() {
    return Material(
      color: GGColors.popBackground.color,
      child: SafeArea(
        child: Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(
            vertical: 18.dp,
            horizontal: 16.dp,
          ),
          child: Row(
            children: [
              Obx(
                () => Row(
                  children: [
                    GamingCheckBox(
                      value: logic.selectedAll,
                      padding: EdgeInsets.symmetric(
                        vertical: 4.dp,
                      ).copyWith(right: 12.dp),
                      onChanged: (v) {
                        logic.selectAll();
                      },
                    ),
                    GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: logic.selectAll,
                      child: Text(
                        localized('select_all'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textMain.color,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Gaps.hGap12,
              Expanded(
                child: Obx(() {
                  if (logic.selected.isEmpty) {
                    return Gaps.empty;
                  }
                  return Text(
                    localized('have_select') +
                        logic.selected.length.toString() +
                        localized('bc_wish'),
                    textAlign: TextAlign.end,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                  );
                }),
              ),
              Gaps.hGap18,
              Obx(() {
                return GGButton.main(
                  onPressed: batchDeleted,
                  enable: logic.selected.isNotEmpty,
                  text: localized('delete'),
                  height: 30.dp,
                  textStyle: GGTextStyle(fontSize: GGFontSize.content),
                );
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNormalBottomBar() {
    return SafeArea(
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(
          vertical: 18.dp,
          horizontal: 16.dp,
        ),
        child: GetBuilder(
          init: logic.controller,
          initState: (_) {},
          global: false,
          builder: (_) {
            return GGButton.main(
              onPressed: addButtonPressed,
              text: localized('add_bc'),
              enable: logic.controller.state.renderState.isSuccessful,
            );
          },
        ),
      ),
    );
  }
}

extension _Action on _BankCardListBottomBar {
  void addButtonPressed() {
    if (logic.data.length >= 5) {
      Toast.showFailed(localized('bankcard_max'));
      return;
    }
    if (logic.canAddBankCard) {
      Get.toNamed<dynamic>(Routes.addBankCard.route)?.then((value) {
        if (value is bool && value) {
          logic.reInitial(refresh: true, reset: false);
        }
      });
    } else {
      DialogUtil(
        context: Get.overlayContext!,
        iconPath: R.commonDialogErrorBig,
        iconWidth: 80.dp,
        iconHeight: 80.dp,
        title: localized('to_ke_u_safe00'),
        content: localized('kyc_befo_imm00'),
        leftBtnName: '',
        rightBtnName: localized('verification'),
        onRightBtnPressed: () {
          Get.back<void>();
          Get.toNamed<void>(Routes.kycMiddle.route);
        },
      ).showNoticeDialogWithTwoButtons();
    }
  }

  void batchDeleted() {
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('del_bank_ca00'),
      content: localized('oper_can_be00'),
      leftBtnName: localized('cancels'),
      rightBtnName: localized('confirm_button'),
      onRightBtnPressed: () {
        Get.back<void>();
        logic.batchDelete();
      },
    ).showNoticeDialogWithTwoButtons();
  }
}
