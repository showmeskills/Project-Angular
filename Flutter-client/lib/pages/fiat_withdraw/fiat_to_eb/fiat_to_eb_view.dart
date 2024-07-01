import 'package:flutter/material.dart';
import 'package:base_framework/base_controller.dart';
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
import '../../../common/widgets/gg_dialog/dialog_util.dart';
import '../../../config/gaps.dart';
import '../../../router/app_pages.dart';
import '../../gg_kyc_middle/id/gg_kyc_middle_state.dart';
import 'fiat_to_eb_logic.dart';
import 'fiat_to_eb_state.dart';

class FiatToEBPage extends StatelessWidget {
  const FiatToEBPage({
    super.key,
    this.currentCurrency,
    required this.currencyQuotaModel,
    required this.paymentModel,
  });

  final String? currentCurrency;
  final GamingCurrencyQuotaModel currencyQuotaModel;
  final GamingCurrencyPaymentModel paymentModel;

  FiatToEBLogic get logic => Get.find<FiatToEBLogic>();
  FiatToEBState get state => Get.find<FiatToEBLogic>().state;

  @override
  Widget build(BuildContext context) {
    Get.put(FiatToEBLogic(
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
        _buildAddressContnet(),
        Gaps.vGap10,
        _buildImportantWidget(),
        Gaps.vGap16,
        _buildSubmitButton(),
      ],
    );
  }

  Widget _buildAddressContnet() {
    return Obx(() {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildAddressTab(),
          if (state.addressType.value == 0) ...[
            _buildAddress(),
            _buildVerCode(),
          ],
          if (state.addressType.value == 1) ...[
            _buildAddressBook(),
          ],
        ],
      );
    });
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
                              color: state.selectAddress.value?.address == null
                                  ? GGColors.textHint.color
                                  : GGColors.textMain.color,
                              fontWeight: GGFontWeigh.regular,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Gaps.hGap8,
                        Text(
                          state.selectAddress.value?.currency ?? '',
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

  Widget _buildVerCode() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap16,
        Text(
          localized("p_code"),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.hint,
          ),
        ),
        Gaps.vGap10,
        CheckPhoneTextField(
          controller: logic.codeTextFieldController,
          onCheckPhone: () {
            switch (logic.phoneCodeState.value) {
              case PhoneCodeState.send:
                break;
              case PhoneCodeState.unSend:
                logic.sendPhoneCode();
                break;
              case PhoneCodeState.reSend:
                logic.sendPhoneCode();
                break;
            }
          },
          checkPhoneSendWidget: Obx(() {
            return _getCheckPhoneSendWidget();
          }),
        ),
        Obx(() {
          return Container(
              margin: EdgeInsets.only(top: 15.dp), child: _getTips());
        }),
      ],
    );
  }

  Widget _getTips() {
    switch (logic.phoneCodeState.value) {
      case PhoneCodeState.send:
        return _getVoiceSmsDialogClickContent();
      case PhoneCodeState.reSend:
        return Row(
          children: [
            _getVoiceSmsDialogClickContent(),
            Text(
              localized('sms_info'),
              style: GGTextStyle(
                  fontSize: GGFontSize.content, color: GGColors.textMain.color),
            ),
            GestureDetector(
              onTap: () {
                logic.sendPhoneCode(isVoice: true);
              },
              child: Container(
                margin: EdgeInsets.only(left: 5.dp),
                child: Text(
                  localized('null_t'),
                  style: GGTextStyle(
                      fontSize: GGFontSize.content, color: GGColors.link.color),
                ),
              ),
            ),
          ],
        );
      case PhoneCodeState.unSend:
        return Container();
    }
  }

  Widget _getVoiceSmsDialogClickContent() {
    return GestureDetector(
      onTap: () {
        DialogUtil(
            context: Get.context!,
            iconHeight: 80.dp,
            iconWidth: 70.dp,
            contentMaxLine: 6,
            contentAlign: TextAlign.start,
            iconPath: R.iconNoRegisterCode,
            title: localized('sms_ver_code00'),
            content:
                '${localized('sms_ver_code01')}:\n1.${localized('sms_ver_code02')}\n2.${localized('sms_ver_code03')}\n3.${localized('sms_ver_code04')}',
            onLeftBtnPressed: () {
              Get.back<dynamic>();
            },
            onRightBtnPressed: () {
              Get.back<dynamic>();
            }).showNoticeDialogWithTwoButtons();
      },
      child: Text(
        localized('null'),
        style: GGTextStyle(
          fontSize: GGFontSize.content,
          color: GGColors.link.color,
        ),
      ),
    );
  }

  Widget _getCheckPhoneSendWidget() {
    switch (logic.phoneCodeState.value) {
      case PhoneCodeState.unSend:
        return Text(
          localized('get_verification_code_button'),
          style: GGTextStyle(
              color: GGColors.brand.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
      case PhoneCodeState.reSend:
        return Text(
          localized('resend'),
          style: GGTextStyle(
              color: GGColors.brand.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
      case PhoneCodeState.send:
        return Text(
          logic.secondLeft.value.toString() + localized('resend_info_app'),
          style: GGTextStyle(
              color: GGColors.textSecond.color,
              fontSize: GGFontSize.content,
              fontWeight: GGFontWeigh.regular),
        );
    }
  }

  Widget _buildAddressTab() {
    return Obx(
      () => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Gaps.vGap16,
          Row(
            children: [
              Text(
                localized("payee_info"),
                style: GGTextStyle(
                  color: GGColors.textSecond.color,
                  fontSize: GGFontSize.content,
                ),
              ),
            ],
          ),
          Gaps.vGap16,
          Row(
            children: [
              _buildTypeButton(0, localized('use_new_add')),
              Gaps.hGap12,
              _buildTypeButton(1, localized('add_book')),
              const Spacer(),
              Visibility(
                visible: state.addressType.value == 1,
                child: GGButton(
                  height: 35.dp,
                  textStyle: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.brand.color,
                  ),
                  backgroundColor: GGColors.transparent.color,
                  onPressed: logic.pressAddressManage,
                  text: localized('address_management'),
                ),
              ),
            ],
          ),
          Gaps.vGap16,
        ],
      ),
    );
  }

  Widget _buildTypeButton(int type, String text) {
    final isSelected = state.addressType.value == type;
    return GGButton(
      height: 35.dp,
      backgroundColor: isSelected
          ? GGColors.border.color.withOpacity(0.6)
          : GGColors.transparent.color,
      border: Border.all(
        width: 1,
        color: isSelected ? GGColors.transparent.color : GGColors.border.color,
      ),
      textStyle: GGTextStyle(
        color: GGColors.textMain.color,
        fontSize: GGFontSize.content,
      ),
      onPressed: () => logic.pressAddressType(type),
      text: text,
    );
  }

  Widget _buildAddress() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap6,
        Text(
          localized("withdraw_address"),
          style: GGTextStyle(
            color: GGColors.textSecond.color,
            fontSize: GGFontSize.hint,
          ),
        ),
        Gaps.vGap10,
        GamingBaseTextField(
          hintText: localized("enter_wd_curr_ad"),
          controller: logic.addressTextFieldController.textController,
        ),
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

  Widget _inset(Widget child, {double? start, double? end}) {
    return Padding(
      padding: EdgeInsetsDirectional.only(
        start: start ?? 32.dp,
        end: end ?? 32.dp,
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
