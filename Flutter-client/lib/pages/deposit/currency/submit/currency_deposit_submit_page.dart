import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/api/currency/models/payment/gaming_currency_payment_model.dart';
import 'package:gogaming_app/common/api/faq/faq_api.dart';
import 'package:gogaming_app/common/api/faq/models/gaming_faq_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/service/h5_webview_manager.dart';
import 'package:gogaming_app/common/service/merchant_service/merchant_service.dart';
import 'package:gogaming_app/common/utils/util.dart';
import 'package:gogaming_app/common/widgets/bonus_wrapper.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/deposit/common/views/deposi_common_select_view.dart';
import 'package:gogaming_app/pages/deposit/common/views/deposit_base_view.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_ui_mixin.dart';
import 'package:gogaming_app/pages/deposit/currency/pre_submit/currency_deposit_pre_submit_logic.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../../R.dart';
import '../../../../common/components/number_precision/number_precision.dart';
import 'currency_deposit_submit_logic.dart';

part 'views/_bank_select_view.dart';
part 'views/_amount_view.dart';
part 'views/_text_field_view.dart';
part 'views/_faq_view.dart';
part 'views/_deposit_virtual_get_currency_view.dart';

class CurrencyDepositSubmitPage
    extends DepositBaseView<CurrencyDepositSubmitLogic> {
  const CurrencyDepositSubmitPage({
    super.key,
    required this.payment,
    required this.currency,
  });

  final GamingCurrencyPaymentModel payment;
  final GamingCurrencyModel currency;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => CurrencyDepositSubmitPage.argument(
          Get.arguments as Map<String, dynamic>),
    );
  }

  factory CurrencyDepositSubmitPage.argument(Map<String, dynamic> arguments) {
    return CurrencyDepositSubmitPage(
      payment: arguments['payment'] as GamingCurrencyPaymentModel,
      currency: arguments['currency'] as GamingCurrencyModel,
    );
  }
  CurrencyDepositSubmitState get state => controller.state;

  BonusWrapperState get bonusWraperState =>
      Get.find<BonusWrapperLogic>(tag: controller.tag).state;

  @override
  String get title => localized('dep_fiat');

  @override
  Widget body(BuildContext context) {
    Get.put(CurrencyDepositSubmitLogic(payment: payment, currency: currency));
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          DepositAmountTextFieldView(fixedAmounts: payment.fixedAmounts),
          Gaps.vGap16,
          Visibility(
              visible: controller.preLogic.state.isDepositVirtualGetCurrency ==
                  false,
              child: const _AmountView()),
          Visibility(
              visible: controller.preLogic.state.isDepositVirtualGetCurrency,
              child: const _DepositVirtualGetCurrencyView()),
          _buildBankSelectView(),
          _buildBonusSelectView(),
          _buildDemoVideo(),
          Gaps.vGap12,
          _buildButton(),
          Gaps.vGap14,
          const _FaqView(),
        ],
      ),
    );
  }

  Widget _buildDemoVideo() {
    final paymentCode = state.payment.code.toLowerCase();
    final configJson =
        MerchantService.sharedInstance.merchantConfigModel?.config?.oriJson;
    final key = configJson?.keys.toList().firstWhereOrNull((element) {
      return element.toLowerCase() == paymentCode;
    });
    if (key != null) {
      final videoPath = configJson?[key];
      if (videoPath is String && videoPath.isNotEmpty) {
        final videoUrl = (MerchantService.sharedInstance.merchantConfigModel
                    ?.config?.appResourceUrl ??
                '') +
            videoPath;
        return ScaleTap(
          onPressed: () {
            Get.toNamed<void>(
              Routes.videoPlayer.route,
              arguments: {
                'name': state.payment.name,
                'url': videoUrl,
              },
            );
          },
          child: Padding(
            padding: EdgeInsets.only(top: 12.dp),
            child: Row(
              children: [
                Text(
                  state.payment.name,
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.error.color,
                    decoration: TextDecoration.underline,
                  ),
                ),
                Gaps.hGap4,
                GamingImage.asset(
                  R.iconVideo,
                  color: GGColors.error.color,
                  width: 18.dp,
                ),
              ],
            ),
          ),
        );
      }
    }
    return Container();
  }

  Widget _buildBankSelectView() {
    if (!payment.needBankCode) {
      return Gaps.empty;
    }
    return Container(
      margin: EdgeInsets.only(top: 12.dp),
      child: _BankSelectView(onPressed: _openBankSelector),
    );
  }

  Widget _buildBonusSelectView() {
    return Obx(() {
      //红利入口显示逻辑：api请求中/存在券码/(金额合法)
      return Visibility(
        visible: state.amountController.isPass,
        child: BonusWrapper(
          tag: controller.tag,
          currency: state.currency.currency!,
          amount: state.estimatedAmount,
          codeAmount: state.estimatedAmount,
        ),
      );
    });
  }

  Widget _buildButton() {
    return Row(
      children: [
        Expanded(
          child: GGButton.minor(
            onPressed: () {
              Get.back<void>();
            },
            text: localized('previous'),
          ),
        ),
        Gaps.hGap12,
        Expanded(
          child: Obx(() => GGButton.main(
                onPressed: _submit,
                enable: state.isEnable && !bonusWraperState.bonusLoading,
                isLoading: state.isLoading || bonusWraperState.bonusLoading,
                text: localized('continue'),
              )),
        ),
      ],
    );
  }
}

extension _Action on CurrencyDepositSubmitPage {
  void _submit() {
    return controller.submit();
  }

  void _openBankSelector() {
    return controller.openBankSelector();
  }
}
