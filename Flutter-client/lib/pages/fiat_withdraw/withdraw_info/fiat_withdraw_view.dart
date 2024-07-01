import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/helper/withdraw_router_util.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/fiat_withdraw/withdraw_info/views/fiat_withdraw_select_currency_view.dart';
import 'package:gogaming_app/pages/fiat_withdraw/withdraw_info/views/fiat_withdraw_select_payment_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import '../../../common/widgets/appbar/appbar.dart';
import '../../../common/widgets/gaming_close_button.dart';
import '../fiat_to_eb/fiat_to_eb_view.dart';
import '../fiat_to_virtual/fiat_to_virtual_view.dart';
import '../fiat_withdraw_histyory/fiat_withdraw_history_view.dart';
import '../fiat_withdraw_info/fiat_withdraw_info_view.dart';
import 'fiat_withdraw_logic.dart';
import 'fiat_withdraw_state.dart';

class FiatWithdrawPage extends BaseView<FiatWithdrawLogic> {
  const FiatWithdrawPage({
    super.key,
    this.currency,
  });

  final String? currency;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () =>
          FiatWithdrawPage.argument(Get.arguments as Map<String, dynamic>?),
    );
  }

  factory FiatWithdrawPage.argument(Map<String, dynamic>? arguments) {
    return FiatWithdrawPage(
      currency: arguments?['currency'] as String?,
    );
  }

  FiatWithdrawState get state => controller.state;

  @override
  bool ignoreBottomSafeSpacing() => true;

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      leadingIcon: const GamingCloseButton(
        onPressed: WithdrawRouterUtil.close,
      ),
      title: localized('wd_fiat'),
      centerTitle: false,
      actions: [_buildSwitchButton()],
    );
  }

  Widget _buildSwitchButton() {
    return GestureDetectorHitTestWithoutSizeLimit(
      extraHitTestArea: EdgeInsets.all(6.dp),
      onTap: WithdrawRouterUtil.goCryptoWithdraw,
      child: Padding(
        padding: EdgeInsetsDirectional.only(end: 16.dp),
        child: GGButton.main(
          onPressed: WithdrawRouterUtil.goCryptoWithdraw,
          backgroundColor: GGColors.border.color,
          text: localized('wd_crypto'),
          height: 33.dp,
          space: 5.dp,
          textStyle: GGTextStyle(
            fontSize: GGFontSize.hint,
            color: GGColors.textMain.color,
          ),
          image: SvgPicture.asset(
            R.iconArrowRightAlt,
            width: 10.dp,
            height: 10.dp,
            color: GGColors.textSecond.color,
          ),
          imageAlignment: AlignmentDirectional.centerEnd,
        ),
      ),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(FiatWithdrawLogic(currency));
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const FiatWithdrawSelectCurrencyView(),
          const FiatWithdrawSelectPaymentView(),
          Obx(() {
            if (controller
                        .getPaymentActionType(state.selectPaymentType.value) ==
                    7 &&
                state.selectPaymentInfo.value != null) {
              return FiatToVirtualView(
                currentCurrency: state.currentCurrency.value?.currency,
                currencyQuotaModel: state.currencyQuotaModel.value!,
                paymentModel: state.selectPaymentInfo.value!,
              );
            }

            if (controller
                        .getPaymentActionType(state.selectPaymentType.value) ==
                    4 &&
                state.selectPaymentInfo.value?.isNeedWalletAddress == true &&
                state.selectPaymentInfo.value != null) {
              return FiatToEBPage(
                currentCurrency: state.currentCurrency.value?.currency,
                currencyQuotaModel: state.currencyQuotaModel.value!,
                paymentModel: state.selectPaymentInfo.value!,
              );
            }

            if (state.selectPaymentInfo.value != null &&
                state.currencyQuotaModel.value != null) {
              return FiatWithdrawInfoView(
                paymentModel: state.selectPaymentInfo.value!,
                currentCurrency: state.currentCurrency.value?.currency,
                currencyQuotaModel: state.currencyQuotaModel.value!,
              );
            }
            return Container();
          }),
          const FiatWithdrawHistyoryView(),
        ],
      ),
    );
  }
}
