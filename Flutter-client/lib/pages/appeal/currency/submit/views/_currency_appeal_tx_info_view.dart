part of '../currency_appeal_submit_page.dart';

class _CurrencyAppealTxInfoView extends StatelessWidget
    with AppealCommonUIMixin {
  const _CurrencyAppealTxInfoView();

  CurrencyAppealSubmitLogic get controller =>
      Get.find<CurrencyAppealSubmitLogic>();

  CurrencyAppealSubmitState get state => controller.state;

  bool get amountUpdated {
    return double.tryParse(controller.amountTextFieldController.text.value) !=
        state.txInfo?.amount;
  }

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (state.txInfo == null) {
        return Gaps.empty;
      }
      return Column(
        children: [
          Gaps.vGap24,
          _buildCurrencySelector(),
          Gaps.vGap24,
          _buildPayMethod(),
          Gaps.vGap24,
          _buildAmount(),
          Obx(() {
            if (amountUpdated) {
              return Container(
                margin: EdgeInsets.only(top: 15.dp),
                child: buildTips(localized('ame_amo01')),
              );
            }
            return Gaps.empty;
          }),
          Gaps.vGap24,
          _buildDepositor(),
        ],
      );
    });
  }

  Widget _buildCurrencySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('curr')),
        Gaps.vGap10,
        Opacity(
          opacity: 0.8,
          child: GamingSelectorWidget(
            backgroundColor: GGColors.disabled.color,
            border: Border.all(width: 1.dp, color: GGColors.transparent.color),
            builder: (context) {
              return Obx(() {
                final GamingCurrencyModel currency = CurrencyService
                    .sharedInstance
                    .getModelByCurrency(state.txInfo!.currency!);
                return Row(
                  children: [
                    GamingImage.network(
                      url: currency.iconUrl,
                      width: 18.dp,
                      height: 18.dp,
                    ),
                    Gaps.hGap10,
                    Text(
                      currency.currency!,
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textMain.color,
                        fontFamily: GGFontFamily.dingPro,
                        fontWeight: GGFontWeigh.bold,
                      ),
                    ),
                    Gaps.hGap4,
                    Text(
                      currency.name ?? '',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                        fontFamily: GGFontFamily.dingPro,
                      ),
                    ),
                  ],
                );
              });
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPayMethod() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('pay_methods')),
        Gaps.vGap10,
        Row(
          children: [
            Opacity(
              opacity: 0.8,
              child: Container(
                constraints: BoxConstraints(minWidth: 160.dp),
                padding:
                    EdgeInsets.symmetric(horizontal: 14.dp, vertical: 14.dp),
                decoration: ShapeDecoration(
                  color: GGColors.disabled.color,
                  shape: SelectedRoundedRectangleBorder(
                    color: GGColors.highlightButton.color,
                    iconColor: GGColors.buttonTextWhite.color,
                    size: Size(32.dp, 32.dp),
                    borderRadius: BorderRadius.circular(4.dp),
                    aligemnt: Alignment.topRight,
                    side: BorderSide(
                      width: 1.dp,
                      color: GGColors.border.color,
                    ),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (state.txInfo?.paymentImages.isNotEmpty ?? false)
                      Container(
                        margin: EdgeInsets.only(right: 6.dp),
                        child: GamingImage.network(
                          url: state.txInfo!.paymentImages.first,
                          width: 28.dp,
                          height: 28.dp,
                          radius: 14.dp,
                        ),
                      ),
                    Text(
                      state.txInfo?.paymentName ?? '',
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildAmount() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('amount')),
        Gaps.vGap10,
        Row(
          children: [
            // TODO(lucky): 输入框右侧边框和圆角去除
            Expanded(
              child: Obx(() {
                return GamingTextField(
                  controller: controller.amountTextFieldController,
                  enabled: state.canEditAmount,
                  fillColor: GGColors.transparent,
                  contentPadding: EdgeInsets.symmetric(
                    horizontal: 14.dp,
                    vertical: 14.dp,
                  ),
                  keyboardType:
                      const TextInputType.numberWithOptions(decimal: true),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(
                      RegExp(r'([1-9]\d*\.?\d*)|(^(0){1}$)|(0\.\d*)'),
                    ),
                  ],
                  border: OutlineInputBorder(
                    borderSide: state.canEditAmount
                        ? BorderSide(
                            color: GGColors.border.color,
                            width: 1.dp,
                          )
                        : BorderSide.none,
                    borderRadius: BorderRadius.horizontal(
                      left: Radius.circular(4.dp),
                    ),
                  ),
                );
              }),
            ),
            ClipRRect(
              borderRadius: BorderRadius.horizontal(
                right: Radius.circular(4.dp),
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minWidth: 120.dp,
                ),
                child: GGButton.main(
                  onPressed: _onPressedEditAmount,
                  text: localized('ame_amo00'),
                  space: 6.dp,
                  radius: 0,
                  padding:
                      EdgeInsets.symmetric(vertical: 13.dp, horizontal: 12.dp),
                  height: 14.dp * 1.4 + 13.dp * 2,
                  image: SvgPicture.asset(
                    R.kycKycEdit,
                    width: 18.dp,
                    height: 18.dp,
                    color: GGColors.buttonTextWhite.color,
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDepositor() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('depositor')),
        Gaps.vGap10,
        Opacity(
          opacity: 0.8,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 14.dp, vertical: 14.dp),
            decoration: BoxDecoration(
              color: GGColors.disabled.color,
              borderRadius: BorderRadius.circular(4.dp),
            ),
            alignment: Alignment.centerLeft,
            child: Text(
              state.txInfo?.userName ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

extension _Action2 on _CurrencyAppealTxInfoView {
  void _onPressedEditAmount() {
    final ValueNotifier<bool> notify = ValueNotifier(state.canEditAmount);
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonStatement,
      iconWidth: 70.dp,
      iconHeight: 60.dp,
      title: localized('statem_00'),
      content: localized('statem_01'),
      contentMaxLine: 6,
      contentAlign: TextAlign.start,
      moreWidget: Container(
        margin: EdgeInsets.symmetric(horizontal: 20.dp).copyWith(bottom: 24.dp),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            notify.value = !notify.value;
          },
          child: Row(
            children: [
              ValueListenableBuilder<bool>(
                valueListenable: notify,
                builder: (context, value, child) {
                  return GamingCheckBox(
                    value: value,
                    onChanged: (v) => notify.value = v,
                  );
                },
              ),
              Gaps.hGap8,
              Text(
                localized('statem_02'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textHint.color,
                ),
              )
            ],
          ),
        ),
      ),
      rightBtnName: localized('confirm'),
      leftBtnName: '',
      onRightBtnPressed: () {
        Get.back<void>();
        controller.changeCanEditAmount(notify.value);
      },
    ).showNoticeDialogWithTwoButtons();
  }
}
