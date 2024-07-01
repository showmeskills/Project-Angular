import 'package:base_framework/base_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_svg/svg.dart';

import 'package:gogaming_app/common/components/extensions/number_extension.dart';
import 'package:gogaming_app/common/service/fee/fee_service.dart';

import '../../../R.dart';
import '../../../common/api/currency/models/gaming_currency_quota_model.dart';
import '../../../common/api/currency/models/payment/gaming_currency_payment_model.dart';
import '../../../common/lang/locale_lang.dart';
import '../../../common/service/kyc_service.dart';
import '../../../common/theme/colors/go_gaming_colors.dart';
import '../../../common/theme/text_styles/gg_text_styles.dart';
import '../../../common/widgets/gaming_popup.dart';
import '../../../common/widgets/gaming_text_filed/gaming_text_filed.dart';
import '../../../common/widgets/gg_button.dart';
import '../../../config/gaps.dart';
import '../../../router/app_pages.dart';
import 'fiat_withdraw_bankcard_list_view.dart';
import 'fiat_withdraw_info_logic.dart';
import 'fiat_withdraw_info_state.dart';

class FiatWithdrawInfoView extends StatelessWidget {
  const FiatWithdrawInfoView({
    super.key,
    required this.paymentModel,
    required this.currentCurrency,
    required this.currencyQuotaModel,
  });

  final GamingCurrencyQuotaModel currencyQuotaModel;
  final GamingCurrencyPaymentModel paymentModel;
  final String? currentCurrency;

  FiatWithdrawInfoLogic get logic => Get.find<FiatWithdrawInfoLogic>();
  FiatWithdrawInfoState get state => Get.find<FiatWithdrawInfoLogic>().state;

  @override
  Widget build(BuildContext context) {
    Get.put(FiatWithdrawInfoLogic(
      currentPayment: paymentModel,
      currency: currentCurrency,
      quotaModel: currencyQuotaModel,
    ));
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
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
        const FiatWithdrawBankCardListView(),
        _buildImportantWidget(),
        Gaps.vGap16,
        _buildSubmitButton(),
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
          offset: Offset(16.dp, 0),
          triangleInset: EdgeInsetsDirectional.only(end: 6.dp),
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
          Expanded(
            child: Text(
              title,
              style: GGTextStyle(
                color: GGColors.textBlackOpposite.color,
                fontSize: GGFontSize.content,
              ),
            ),
          ),
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

  Widget _inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 18.dp,
        end: end ?? 18.dp,
      ),
      child: child,
    );
  }

  Widget _buildReceiptAmount() {
    return Obx(() {
      return Text(
        '${localized("actual_arrival")} '
        '${getExpArrContent()}'
        ' ${currencyQuotaModel.currency ?? ''}',
        style: GGTextStyle(
          color: GGColors.textSecond.color,
          fontSize: GGFontSize.hint,
        ),
      );
    });
  }

  String getExpArrContent() {
    final expArr = state.amountValue.value -
        FeeService().getFee(currencyQuotaModel,
            logic.amountTextFieldController.textController.text);
    if (expArr < 0) {
      return 0.toStringAsFixed(2);
    } else {
      return expArr.toStringAsFixed(2);
    }
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
}
