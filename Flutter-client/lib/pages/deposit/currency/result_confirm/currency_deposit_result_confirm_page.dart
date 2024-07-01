import 'package:flutter/material.dart';
import 'package:flutter_countdown_timer/flutter_countdown_timer.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/currency/models/payment/gaming_currency_payment_model.dart';
import 'package:gogaming_app/common/api/deposit/models/currency_deposit/gaming_currency_deposit_model.dart';
import 'package:gogaming_app/common/api/deposit/models/currency_deposit/gaming_deposit_bank_info_model.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_ui_mixin.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/pages/deposit/common/views/deposit_base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'currency_deposit_result_confirm_logic.dart';

part 'views/_amount_view.dart';
part 'views/_bank_account_view.dart';
part 'views/_pay_view.dart';
part 'views/_remark_info_view.dart';

class CurrencyDepositResultConfirmPage
    extends DepositBaseView<CurrencyDepositResultConfirmLogic> {
  const CurrencyDepositResultConfirmPage({
    super.key,
    required this.data,
    required this.payment,
    required this.title,
  });

  final GamingCurrencyDepositModel data;
  final GamingCurrencyPaymentModel payment;
  @override
  final String title;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => CurrencyDepositResultConfirmPage.argument(
          Get.arguments as Map<String, dynamic>),
    );
  }

  factory CurrencyDepositResultConfirmPage.argument(
      Map<String, dynamic> arguments) {
    return CurrencyDepositResultConfirmPage(
      data: arguments['data'] as GamingCurrencyDepositModel,
      payment: arguments['payment'] as GamingCurrencyPaymentModel,
      title: arguments['title'] as String,
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(CurrencyDepositResultConfirmLogic(data: data));
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          _ComfirmAmountView(data: data),
          Gaps.vGap20,
          _ConfirmBankAccountView(
            data: data.bankInfo,
            payment: payment,
            onPressPayMethod: controller.openWebView,
          ),
          Container(
            margin: EdgeInsets.only(top: 20.dp),
            child: _ConfirmRemarkInfoView(
              payment: payment,
              data: data,
            ),
          ),
          Gaps.vGap12,
          _ConfirmPayView(data: data),
          Gaps.vGap10,
        ],
      ),
    );
  }
}
