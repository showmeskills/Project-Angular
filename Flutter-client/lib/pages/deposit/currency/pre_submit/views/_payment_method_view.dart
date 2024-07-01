part of '../currency_deposit_pre_submit_page.dart';

class _PaymentMethodView extends StatelessWidget with DepositCommonUIMixin {
  const _PaymentMethodView();

  CurrencyDepositPreSubmitLogic get logic =>
      Get.find<CurrencyDepositPreSubmitLogic>();

  CurrencyDepositPreSubmitState get state => logic.state;

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (state.paymentMap == null) {
        return Container();
      }
      if (state.paymentMap!.isEmpty) {
        return Container(
          margin: EdgeInsets.only(top: 16.dp),
          // child: const GoGamingMaintaining(),
          child: Obx(() {
            if (state.showPIQ) {
              return Column(
                children: [
                  _buildBonusSelectView(),
                  PaymentIQView(
                    controller: logic.paymentIQController,
                  ),
                ],
              );
            } else {
              return SizedBox(
                width: double.infinity,
                child: GGButton.main(
                  onPressed: _submitPIQ,
                  text: localized('continue'),
                ),
              );
            }
          }),
        );
      }
      return SizedBox(
        width: double.infinity,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Gaps.vGap24,
            buildSubTitle(localized('pay_method'), context),
            Gaps.vGap12,
            LayoutBuilder(builder: (context, constaints) {
              return Wrap(
                spacing: 12.dp,
                runSpacing: 12.dp,
                children: state.paymentMap!.keys.map((e) {
                  return _buildItem(type: e);
                }).toList(),
              );
            }),
            Visibility(
              visible: state.isDepositVirtualGetCurrency == false,
              child: Obx(() => Column(
                    mainAxisSize: MainAxisSize.min,
                    children: state.currentPaymentList.map((e) {
                      return _buildRadioItem(data: e);
                    }).toList(),
                  )),
            ),
            Gaps.vGap12,
            Visibility(
              visible: state.isDepositVirtualGetCurrency,
              child: Column(
                children: [
                  Obx(() {
                    return DepositCurrencySelectorNormal(
                      title: localized('curr'),
                      hintText: localized('select_cur'),
                      selected: state.cryptoCurrency,
                      onPressed: logic.selectCryptoCurrency,
                    );
                  }),
                  Gaps.vGap12,
                  _buildNetworkSelector(context),
                  Gaps.vGap12,
                ],
              ),
            ),
            SizedBox(
              width: double.infinity,
              child: Obx(
                () => GGButton.main(
                  onPressed: _submit,
                  enable: state.enable,
                  isLoading: state.isLoading,
                  text: localized('continue'),
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildBonusSelectView() {
    return Obx(() {
      // 1920修改bonusList空也一直显示
      return BonusWrapper(
        tag: logic.tag,
        currency: state.currency!.currency!,
        amount: 100000.0,
      );
    });
  }

  Widget _buildNetworkSelector(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('trans_network'), context),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: logic.selectNetwork,
          child: buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Obx(() {
                    if (state.network == null) {
                      return Text(
                        localized('sel_net'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textHint.color,
                        ),
                      );
                    } else {
                      return Row(
                        children: [
                          Text(
                            state.network!.name,
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontFamily: GGFontFamily.dingPro,
                              fontWeight: GGFontWeigh.bold,
                            ),
                          ),
                          Gaps.hGap4,
                          Text(
                            state.network!.desc ?? '',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textSecond.color,
                              fontFamily: GGFontFamily.dingPro,
                            ),
                          ),
                        ],
                      );
                    }
                  }),
                ),
                SvgPicture.asset(
                  R.iconDown,
                  height: 7.dp,
                  color: GGColors.textSecond.color,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildItem({
    required String type,
  }) {
    return ScaleTap(
      opacityMinValue: 0.8,
      scaleMinValue: 0.98,
      onPressed: () => _updatePaymentTab(type),
      child: Obx(() {
        return Container(
          padding: EdgeInsets.symmetric(vertical: 6.dp, horizontal: 8.dp),
          decoration: BoxDecoration(
            color: state.currentPaymentTab == type
                ? GGColors.border.color
                : GGColors.transparent.color,
            borderRadius: BorderRadius.circular(4.dp),
            border: Border.all(
              width: 1.dp,
              color: GGColors.border.color,
            ),
          ),
          child: Text(
            type,
            style: GGTextStyle(
              fontSize: GGFontSize.hint,
              color: GGColors.textMain.color,
            ),
          ),
        );
      }),
    );
  }

  Widget _buildRadioItem({
    required GamingCurrencyPaymentModel data,
  }) {
    return Container(
      margin: EdgeInsets.only(top: 12.dp),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => _updatePayment(data),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Obx(() => GamingRadioBox(
                      value: data.code == state.currentPayment?.code,
                      size: 20.dp,
                      onChanged: (v) {
                        _updatePayment(data);
                      },
                    )),
                Gaps.hGap10,
                if (data.icons.firstOrNull?.isEmpty ?? true)
                  GamingImage.asset(
                    R.iconDefaultPayment,
                    width: 18.dp,
                    height: 18.dp,
                  )
                else
                  GamingImage.network(
                    url: data.icons.first,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                Gaps.hGap10,
                Flexible(
                  child: Text(
                    data.name,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
                Gaps.hGap8,
                _buildRecommend(data),
              ],
            ),
            Gaps.vGap4,
            Row(
              children: [
                SizedBox(
                  width: 58.dp,
                ),
                Text(
                  '${data.feeText}% ${localized('fee')}',
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    color: GGColors.textSecond.color,
                    height: 1.4,
                  ),
                ),
                Gaps.hGap12,
                if (data.operateContent.isNotEmpty)
                  Flexible(
                    child: Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 7.dp,
                      ),
                      decoration: BoxDecoration(
                        color: GGColors.success.color.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(4.dp),
                      ),
                      child: Text(
                        data.operateContent,
                        style: GGTextStyle(
                          fontSize: GGFontSize.hint,
                          color: GGColors.success.color,
                          height: 1.4,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  )
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommend(GamingCurrencyPaymentModel data) {
    return Visibility(
      visible: data.showRecommend,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(2.dp),
          color: GGColors.error.color.withOpacity(0.2),
        ),
        padding:
            EdgeInsets.only(left: 10.dp, right: 10.dp, top: 2.dp, bottom: 2.dp),
        alignment: Alignment.center,
        child: Row(
          children: [
            Image.asset(
              R.iconRecommend,
              width: 12.dp,
              height: 12.dp,
              fit: BoxFit.contain,
            ),
            Gaps.hGap4,
            Text(
              localized('hot'),
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.textMain.color,
                height: 1.44,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

extension _Action on _PaymentMethodView {
  void _submit() {
    logic.submit();
  }

  void _submitPIQ() {
    logic.submitPIQ();
  }

  void _updatePayment(GamingCurrencyPaymentModel payment) {
    return logic.updatePayment(payment);
  }

  void _updatePaymentTab(String tab) {
    return logic.updatePaymentTab(tab);
  }
}
