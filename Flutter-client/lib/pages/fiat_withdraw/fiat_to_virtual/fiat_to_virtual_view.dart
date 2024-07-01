import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_html/flutter_html.dart';

import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';
import 'package:gogaming_app/common/service/kyc_service.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../R.dart';
import '../../../common/api/currency/models/gaming_currency_model.dart';
import '../../../common/api/currency/models/gaming_currency_quota_model.dart';
import '../../../common/api/currency/models/payment/gaming_currency_payment_model.dart';
import '../../../common/widgets/gaming_image/gaming_image.dart';
import '../../../common/widgets/gaming_popup.dart';
import '../../../common/widgets/gaming_selector/gaming_selector.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../../common/widgets/gg_button.dart';
import 'fiat_to_virtual_logic.dart';
import 'fiat_to_virtual_state.dart';

class FiatToVirtualView extends StatelessWidget {
  const FiatToVirtualView({
    super.key,
    this.currentCurrency,
    required this.currencyQuotaModel,
    required this.paymentModel,
  });

  final String? currentCurrency;
  final GamingCurrencyQuotaModel currencyQuotaModel;
  final GamingCurrencyPaymentModel paymentModel;

  FiatToVirtualLogic get logic => Get.find<FiatToVirtualLogic>();
  FiatToVirtualState get state => Get.find<FiatToVirtualLogic>().state;

  @override
  Widget build(BuildContext context) {
    Get.put(FiatToVirtualLogic(
      currency: currentCurrency,
      currentPayment: paymentModel,
      quotaModel: currencyQuotaModel,
    ));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildCurrencySelector(),
        Obx(() {
          if (state.currency.isEmpty) {
            return Gaps.empty;
          }
          return _buildInfo();
        }),
      ],
    );
  }

  /// 选择币种
  Widget _buildCurrencySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('curr'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: showCurrencySelect,
          child: _buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Obx(() {
                    if (state.currency.isEmpty) {
                      return Text(
                        localized('select_cur'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textHint.color,
                        ),
                      );
                    } else {
                      return Row(
                        children: [
                          GamingImage.network(
                            url: CurrencyService.sharedInstance
                                .getIconUrl(state.currency.value),
                            width: 18.dp,
                            height: 18.dp,
                          ),
                          Gaps.hGap10,
                          Text(
                            state.currency.value,
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontFamily: GGFontFamily.dingPro,
                              fontWeight: GGFontWeigh.bold,
                            ),
                          ),
                          Gaps.hGap4,
                          Text(
                            CurrencyService.sharedInstance
                                .getCurrencyName(state.currency.value),
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

  Widget _buildInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap24,
        Text(
          '2.${localized("wd_info")}',
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.smallTitle,
          ),
        ),
        Gaps.vGap16,
        Text(
          localized("enter_amount"),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.content,
          ),
        ),
        Gaps.vGap6,
        _buildBalance(),
        Gaps.vGap12,
        _buildAmountTF(),
        Gaps.vGap8,
        _buildFeeText(),
        _buildReceiptAmount(),
        Gaps.vGap16,
        Row(
          children: [
            Text(
              '${localized("reference_exchange_rate")}:',
              style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content,
              ),
            ),
            Gaps.hGap8,
            Text(
              '1 ${state.currency} = ${logic.getRate(state.currency.value)}CNY',
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ],
        ),
        Gaps.vGap8,
        Row(
          children: [
            Text(
              '${localized("estimated_cash_withdrawal")}:',
              style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content,
              ),
            ),
            Gaps.hGap8,
            Text(
              '${logic.getEstimatedWithdraw()}'
              '${state.currency}',
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ],
        ),
        Gaps.vGap8,
        Row(
          children: [
            Text(
              localized("digital_currency_fee"),
              style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content,
              ),
            ),
            GamingPopupLinkWidget(
              followerAnchor: Alignment.bottomCenter,
              targetAnchor: Alignment.topCenter,
              popup: Text(
                localized("mine_fee"),
                style: GGTextStyle(
                  color: GGColors.textBlackOpposite.color,
                  fontSize: GGFontSize.content,
                ),
              ),
              offset: Offset(3.dp, 0),
              triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
              child: Container(
                padding: EdgeInsets.only(left: 4.dp),
                child: SvgPicture.asset(
                  R.iconTipIcon,
                  width: 14.dp,
                  height: 14.dp,
                ),
              ),
            ),
            Gaps.hGap4,
            Text(
              ': ${(state.network.value?.withdrawFee ?? 0.0).toStringAsFixed(8)}'
              '${state.currency}',
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ],
        ),
        Gaps.vGap8,
        Row(
          children: [
            Text(
              '${localized("exp_arr")}:',
              style: GGTextStyle(
                color: GGColors.textSecond.color,
                fontSize: GGFontSize.content,
              ),
            ),
            Gaps.hGap8,
            Text(
              '${logic.getExpArrContent()}'
              '${state.currency}',
              style: GGTextStyle(
                color: GGColors.textMain.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ],
        ),
        Gaps.vGap16,
        _buildPayInfo(),
        Gaps.vGap16,
        _buildImportantWidget(),
        Gaps.vGap24,
        _buildSubmitButton(),
      ],
    );
  }

  Widget _buildPayInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized("payee_info"),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.content,
          ),
        ),
        Gaps.vGap6,
        Text(
          localized("wd_curr_add"),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.hint,
          ),
        ),
        Gaps.vGap10,
        SizedBox(
            height: 32.dp,
            child: Row(
              children: [
                InkWell(
                  onTap: () {
                    logic.changeToNewAddress();
                  },
                  child: Container(
                    padding: EdgeInsets.only(
                        left: 8.dp, right: 8.dp, top: 6.dp, bottom: 6.dp),
                    decoration: BoxDecoration(
                      color: state.useNewAddress.value
                          ? GGColors.border.color
                          : null,
                      borderRadius: BorderRadius.circular(4.dp),
                    ),
                    child: Text(
                      localized('use_new_add'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                        fontFamily: GGFontFamily.dingPro,
                      ),
                    ),
                  ),
                ),
                InkWell(
                  onTap: () {
                    logic.changeToAddressBook();
                  },
                  child: Container(
                    padding: EdgeInsets.only(
                        left: 8.dp, right: 8.dp, top: 6.dp, bottom: 6.dp),
                    decoration: BoxDecoration(
                      color: !state.useNewAddress.value
                          ? GGColors.border.color
                          : null,
                      borderRadius: BorderRadius.circular(4.dp),
                    ),
                    child: Text(
                      localized('add_book'),
                      style: GGTextStyle(
                        fontSize: GGFontSize.content,
                        color: GGColors.textSecond.color,
                        fontFamily: GGFontFamily.dingPro,
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                Visibility(
                  visible: !state.useNewAddress.value,
                  child: InkWell(
                    onTap: () {
                      Get.toNamed<void>(Routes.cryptoAddressList.route);
                    },
                    child: Container(
                      padding: EdgeInsets.only(
                          left: 8.dp, right: 8.dp, top: 6.dp, bottom: 6.dp),
                      child: Text(
                        localized('address_management'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.highlightButton.color,
                          fontFamily: GGFontFamily.dingPro,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            )),
        Gaps.vGap24,
        _buildAddressWidget(),
      ],
    );
  }

  /// 提币地址
  Widget _buildAddress() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('wd_curr_add'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        Obx(() {
          return GamingBaseTextField(
            enabled: state.editAddress.value,
            hintText: localized('enter_wd_ad'),
            controller: state.addressController.textController,
            suffixIconConstraints: BoxConstraints.tightFor(
              height: 40.dp,
            ),
            suffixIcon: ScaleTap(
              onPressed: logic.onPressScan,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  SvgPicture.asset(
                    R.iconScan,
                    color: GGColors.textSecond.color,
                    height: 18.dp,
                  ),
                  Gaps.hGap10,
                ],
              ),
            ),
          );
        }),
        Gaps.vGap4,
        Obx(() {
          return Visibility(
            visible: state.addressError.isNotEmpty,
            child: Text(
              state.addressError.value,
              style: GGTextStyle(
                fontSize: GGFontSize.hint,
                color: GGColors.error.color,
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildAddressWidget() {
    if (state.useNewAddress.value) {
      return Column(
        children: [
          _buildNetworkSelector(),
          Gaps.vGap24,
          _buildAddress(),
        ],
      );
    } else {
      return _buildAddressBook();
    }
  }

  /// 地址簿
  Widget _buildAddressBook() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('add_book'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: logic.addressBookSelect,
          child: _buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Obx(() {
                    return Row(
                      children: [
                        Container(
                          constraints: BoxConstraints(
                            maxWidth: 200.dp,
                          ),
                          child: Text(
                            state.selectAddress.value?.address ??
                                localized('select_add_book'),
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontWeight: GGFontWeigh.regular,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Gaps.hGap8,
                        Text(
                          state.selectAddress.value?.network ?? '',
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textSecond.color,
                            fontFamily: GGFontFamily.dingPro,
                          ),
                        ),
                      ],
                    );
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

  /// 转账网络
  Widget _buildNetworkSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized('trans_network'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: logic.selectNetwork,
          child: _buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Obx(() {
                    if (state.network.value == null) {
                      return Text(
                        localized('select_net'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textHint.color,
                        ),
                      );
                    } else {
                      return Row(
                        children: [
                          Text(
                            state.network.value?.name ?? '',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontFamily: GGFontFamily.dingPro,
                              fontWeight: GGFontWeigh.bold,
                            ),
                          ),
                          Gaps.hGap4,
                          Text(
                            state.network.value?.desc ?? '',
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

  Widget _buildSubmitButton() {
    return Obx(() {
      return SizedBox(
        width: double.infinity,
        height: 48.dp,
        child: GGButton(
          onPressed: () => logic.submit(),
          enable: state.submitEnable.value,
          text: localized('continue'),
        ),
      );
    });
  }

  Widget _buildImportantWidget() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localized("import_notes"),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.hint,
          ),
        ),
        Gaps.vGap16,
        Html(
          data: paymentModel.depositContent,
          style: {
            'body': Style(
              margin: Margins.zero,
            ),
          },
        ),
      ],
    );
  }

  Widget _buildReceiptAmount() {
    return Obx(() {
      final fee = FeeService().getFee(currencyQuotaModel,
          logic.amountTextFieldController.textController.text);
      return Text(
        '${localized("actual_arrival")} '
        '${(state.amountValue.value - fee > 0 ? (state.amountValue.value - fee) : 0).toStringAsFixed(2)}'
        ' ${currencyQuotaModel.currency ?? ''}',
        style: GGTextStyle(
          color: GGColors.textSecond.color,
          fontSize: GGFontSize.hint,
        ),
      );
    });
  }

  Widget _buildFeeText() {
    return Obx(() => FeeService().buildFeeText(
          currencyQuotaModel,
          logic.amountTextFieldController.text.value,
        ));
  }

  Widget _buildAmountTF() {
    final minNum = FeeService()
        .minAmountFee(currencyQuotaModel, paymentModel.minAmount)
        .toInt();
    final maxNum = paymentModel.maxAmount.toInt();
    return CheckPhoneTextField(
      fillColor: GGColors.transparent,
      controller: logic.amountTextFieldController,
      hintText: localized(
        "per_tran_amou_v",
        params: [
          minNum.toString(),
          maxNum.toString(),
        ],
      ),
      inputFormatters: [
        FilteringTextInputFormatter.allow(RegExp("[0-9]")),
      ],
      checkPhoneSendWidget: Row(
        children: [
          GestureDetector(
            onTap: logic.selectFullAmount,
            child: Text(
              localized("all"),
              style: GGTextStyle(
                color: GGColors.highlightButton.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ),
          Gaps.hGap12,
          Container(
            color: GGColors.border.color,
            width: 1.dp,
            height: 12.dp,
          ),
          Gaps.hGap12,
          Text(
            currencyQuotaModel.currency ?? '',
            style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBalance() {
    return Row(
      children: [
        Text(
          localized("number"),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.hint,
          ),
        ),
        const Spacer(),
        Text(
          '${localized("widthdrawal_amount")} ',
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.hint,
          ),
        ),
        Text(
          '${(currencyQuotaModel.availQuota ?? 0.00).toStringAsFixed(2)} '
          '${currencyQuotaModel.currency ?? ''}',
          style: GGTextStyle(
            color: GGColors.textMain.color,
            fontSize: GGFontSize.hint,
          ),
        ),
        // Gaps.hGap12,
        GamingPopupLinkWidget(
          followerAnchor: Alignment.bottomRight,
          targetAnchor: Alignment.topCenter,
          popup: _buildTip(),
          offset: Offset(10.dp, 0),
          triangleInset: EdgeInsetsDirectional.only(end: 0.dp),
          child: Container(
            padding: EdgeInsets.only(left: 12.dp),
            child: SvgPicture.asset(
              R.iconTipIcon,
              width: 14.dp,
              height: 14.dp,
            ),
          ),
        )
      ],
    );
  }

  Widget _buildTip() {
    return SizedBox(
      width: 256.dp,
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: 18.dp),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _inset(
              Row(
                children: [
                  Text(
                    localized("acc_limits"),
                    style: GGTextStyle(
                      color: GGColors.textBlackOpposite.color,
                      fontSize: GGFontSize.content,
                    ),
                  ),
                  const Spacer(),
                  InkWell(
                    onTap: () {
                      Get.toNamed<dynamic>(Routes.kycHome.route);
                    },
                    child: Text(
                      "${localized("learn_more")} >",
                      style: GGTextStyle(
                        color: GGColors.highlightButton.color,
                        fontSize: GGFontSize.content,
                      ),
                    ),
                  ),
                ],
              ),
              start: 12.dp,
              end: 12.dp,
            ),
            Gaps.vGap8,
            _tipContent(
                localized("ava_balance"),
                "${currencyQuotaModel.balance?.toStringAsFixed(2) ?? '0'}"
                " $currentCurrency"),
            Gaps.vGap8,
            _tipContent(
                '${FeeService().wdLimit}:',
                "${currencyQuotaModel.withdrawQuota?.toStringAsFixed(2) ?? 0}"
                    " $currentCurrency"),
            Gaps.vGap8,
            _tipContent(
                localized("today_limit"),
                currencyQuotaModel.todayUnlimited
                    ? localized('no_limit')
                    : "${currencyQuotaModel.todayQuota?.toStringAsFixed(2) ?? 0}"
                        " USDT"),
            Gaps.vGap8,
            _tipContent(
                localized("widthdrawal_amount"),
                "${currencyQuotaModel.canUseQuota?.toStringAsFixed(2) ?? 0}"
                " $currentCurrency"),
            Gaps.vGap8,
            if (!KycService.sharedInstance.advancePassed)
              _inset(
                Row(
                  children: [
                    Expanded(
                      child: Visibility(
                        visible: !currencyQuotaModel.todayUnlimited &&
                            _fiatWithdrawLimitContent() != '-1',
                        child: Text(
                          "${localized("up_limits")}: "
                          "${_fiatWithdrawLimitContent()}"
                          "${localized("usdt_d")}",
                          style: GGTextStyle(
                            color: GGColors.textHint.color,
                            fontSize: GGFontSize.content,
                          ),
                        ),
                      ),
                    ),
                    Gaps.hGap12,
                    GestureDetector(
                      onTap: () => Get.toNamed<dynamic>(Routes.kycHome.route),
                      child: Container(
                        decoration: BoxDecoration(
                          color: GGColors.highlightButton.color,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Padding(
                          padding: EdgeInsets.symmetric(
                              vertical: 7.dp, horizontal: 8.dp),
                          child: Text(
                            localized("upgrade"),
                            style: GGTextStyle(
                              color: GGColors.textMain.color,
                              fontSize: GGFontSize.content,
                            ),
                          ),
                        ),
                      ),
                    )
                  ],
                ),
                start: 12.dp,
                end: 12.dp,
              ),
          ],
        ),
      ),
    );
  }

  String _fiatWithdrawLimitContent() {
    if (KycService.sharedInstance.intermediatePassed) {
      return KycService.sharedInstance.info.value?.setting
              ?.advanceLimit()
              ?.fiatWithdrawLimit ??
          '0';
    } else if (KycService.sharedInstance.primaryPassed) {
      return KycService.sharedInstance.info.value?.setting
              ?.intermediateLimit()
              ?.fiatWithdrawLimit ??
          '0';
    }
    return '0';
  }

  Widget _tipContent(String title, String content) {
    return _inset(
      Row(
        children: [
          Text(
            title,
            style: GGTextStyle(
              color: GGColors.textBlackOpposite.color,
              fontSize: GGFontSize.content,
            ),
          ),
          const Spacer(),
          Text(
            content,
            style: GGTextStyle(
              color: GGColors.textBlackOpposite.color,
              fontSize: GGFontSize.content,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContainer({
    required Widget child,
    Color? color,
  }) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: 14.dp,
        vertical: color == null ? 16.dp : 17.dp,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4.dp),
        border: color == null
            ? Border.all(
                color: GGColors.border.color,
                width: 1.dp,
              )
            : null,
      ),
      child: child,
    );
  }

  Widget _inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 32.dp,
        end: end ?? 32.dp,
      ),
      child: child,
    );
  }

  Future<GamingCurrencyModel?> showCurrency() {
    return GamingSelector.simple(
      title: localized('select_cur'),
      itemBuilder: (context, e, index) {
        return _GamingCurrencySelectorWithAllItem(
          data: e,
        );
      },
      original: state.currencyList,
      onSearchDataStream: (keyword, l) {
        List<GamingCurrencyModel> list = l;
        if (keyword.isNotEmpty) {
          list = l.where((element) {
            return element.currency!
                    .toLowerCase()
                    .contains(keyword.toLowerCase()) ||
                element.name!.toLowerCase().contains(keyword.toLowerCase());
          }).toList();
        }
        return Stream.value(list);
      },
    );
  }
}

class _GamingCurrencySelectorWithAllItem extends StatelessWidget {
  const _GamingCurrencySelectorWithAllItem({
    required this.data,
  });
  final GamingCurrencyModel data;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp, vertical: 8.dp),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          data.iconUrl.isNotEmpty
              ? GamingImage.network(
                  url: data.iconUrl,
                  width: 24.dp,
                  height: 24.dp,
                )
              : Image.asset(
                  R.iconCurrencyAll,
                  width: 24.dp,
                  height: 24.dp,
                ),
          Gaps.hGap8,
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  data.currency ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    fontFamily: GGFontFamily.dingPro,
                    fontWeight: GGFontWeigh.bold,
                    color: GGColors.textMain.color,
                  ),
                ),
                Gaps.vGap2,
                Text(
                  data.name ?? '',
                  style: GGTextStyle(
                    fontSize: GGFontSize.hint,
                    fontFamily: GGFontFamily.dingPro,
                    color: GGColors.textSecond.color,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

extension _Action on FiatToVirtualView {
  void showCurrencySelect() {
    showCurrency().then((value) {
      logic.updateReg(value?.currency ?? '');
      state.currency.value = value?.currency ?? '';
    });
  }
}
