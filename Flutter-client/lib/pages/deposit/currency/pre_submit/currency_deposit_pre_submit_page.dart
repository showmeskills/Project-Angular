import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/bonus/models/gaming_bonus_activity_model.dart';
import 'package:gogaming_app/common/api/currency/models/payment/gaming_currency_payment_model.dart';
import 'package:gogaming_app/common/api/faq/faq_api.dart';
import 'package:gogaming_app/common/service/payment_iq_service/payment_iq_config.dart';
import 'package:gogaming_app/common/widgets/bonus_wrapper.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_radio_box.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_ui_mixin.dart';
import 'package:gogaming_app/pages/deposit/common/views/deposit_base_view.dart';
import 'package:gogaming_app/pages/deposit/common/views/deposit_currency_select.dart';
import 'package:gogaming_app/pages/deposit/common/views/deposit_currency_select_normal.dart';
import 'package:gogaming_app/pages/deposit/common/views/deposit_tips_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'currency_deposit_pre_submit_logic.dart';
import 'currency_deposit_pre_submit_logic_m1.dart';
import 'currency_deposit_pre_submit_logic_m2.dart';
import 'views/currency_deposit_history_view.dart';

part 'views/_payment_method_view.dart';

class CurrencyDepositPreSubmitPage
    extends DepositBaseView<CurrencyDepositPreSubmitLogic> {
  const CurrencyDepositPreSubmitPage({
    super.key,
    this.currency,
    this.bonus,
    this.unknowtmpcode = false,
  });

  final String? currency;
  final GamingBonusActivityModel? bonus;
  final bool unknowtmpcode;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => CurrencyDepositPreSubmitPage.argument(
          Get.arguments as Map<String, dynamic>?),
    );
  }

  factory CurrencyDepositPreSubmitPage.argument(
      Map<String, dynamic>? arguments) {
    return CurrencyDepositPreSubmitPage(
      currency: arguments?['currency'] as String?,
      bonus: arguments?['bonus'] as GamingBonusActivityModel?,
      unknowtmpcode: arguments?['unknowtmpcode'] as bool? ?? false,
    );
  }

  CurrencyDepositPreSubmitState get state => controller.state;

  @override
  String get title => localized('dep_fiat');

  @override
  List<Widget>? get actions => [_buildSwitchButton()];

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  Widget _buildSwitchButton() {
    return GestureDetectorHitTestWithoutSizeLimit(
      extraHitTestArea: EdgeInsets.all(10.dp),
      onTap: () => DepositRouterUtil.goCryptoDeposit(null, true),
      child: Padding(
        padding: EdgeInsetsDirectional.only(end: 16.dp),
        child: GGButton.main(
          onPressed: () => DepositRouterUtil.goCryptoDeposit(null, true),
          backgroundColor: GGColors.border.color,
          text: localized('dep_crypto'),
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
    if (Config.isM1) {
      Get.put<CurrencyDepositPreSubmitLogic>(CurrencyDepositPreSubmitLogicM1(
        currency: currency,
        bonus: bonus,
        unknowtmpcode: unknowtmpcode,
      ));
    } else {
      Get.put<CurrencyDepositPreSubmitLogic>(
        CurrencyDepositPreSubmitLogicM2(currency),
      );
    }

    return SafeArea(
      bottom: true,
      minimum: EdgeInsets.only(bottom: 24.dp),
      child: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          children: [
            Gaps.vGap8,
            const DepositTipsView(),
            Gaps.vGap24,
            Obx(() {
              return DepositCurrencySelector(
                title: localized('select_cur'),
                selected: state.currency,
                onPressed: controller.selectCurrency,
                tag: FaqTag.legalCurrencyRecharge,
              );
            }),
            const _PaymentMethodView(),
            const CurrencyDepositHistoryView(),
          ],
        ),
      ),
    );
  }
}
