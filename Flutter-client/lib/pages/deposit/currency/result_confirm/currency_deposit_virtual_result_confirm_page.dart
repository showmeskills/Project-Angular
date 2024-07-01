import 'package:flutter/material.dart';
import 'package:flutter_countdown_timer/flutter_countdown_timer.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/currency/models/payment/gaming_currency_payment_model.dart';
import 'package:gogaming_app/common/api/deposit/models/currency_deposit/gaming_deposit_virtual_to_currency_model.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/helper/time_helper.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_ui_mixin.dart';

import 'package:gogaming_app/pages/deposit/common/views/deposit_base_view.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/pages/deposit/currency/result_confirm/currency_deposit_virtual_result_confirm_logic.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:qr_flutter/qr_flutter.dart';
part 'virtual_views/virtual_amount_view.dart';
part 'virtual_views/virtual_pay_method_view.dart';
part 'virtual_views/virtual_confirm_remark_info_view.dart';
part 'virtual_views/virtual_confirm_pay_view.dart';
part 'virtual_views/virtual_address_network_view.dart';

class CurrencyDepositVirtualResultConfirmPage
    extends DepositBaseView<CurrencyDepositVirtualResultConfirmLogic> {
  const CurrencyDepositVirtualResultConfirmPage({
    super.key,
    required this.data,
    required this.payment,
    required this.title,
  });

  final GamingDepositVirtualToCurrencyModel data;
  final GamingCurrencyPaymentModel payment;
  @override
  final String title;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => CurrencyDepositVirtualResultConfirmPage.argument(
          Get.arguments as Map<String, dynamic>),
    );
  }

  factory CurrencyDepositVirtualResultConfirmPage.argument(
      Map<String, dynamic> arguments) {
    return CurrencyDepositVirtualResultConfirmPage(
      data: arguments['data'] as GamingDepositVirtualToCurrencyModel,
      payment: arguments['payment'] as GamingCurrencyPaymentModel,
      title: arguments['title'] as String,
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(CurrencyDepositVirtualResultConfirmLogic(data: data));
    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Gaps.vGap24,
          VirtualAmountView(
            data: data,
          ),
          Gaps.vGap20,
          VirtualPayMethodView(data: data, payment: payment),
          Gaps.vGap20,
          VirtualAddressNetworkView(
            data: data,
            payment: payment,
          ),
          Gaps.vGap20,
          Container(
            margin: EdgeInsets.only(top: 20.dp),
            child: VirtualConfirmRemarkInfoView(data: data, payment: payment),
          ),
          Gaps.vGap12,
          VirtualConfirmPayView(data: data),
          Gaps.vGap10,
        ],
      ),
    );
  }
}
