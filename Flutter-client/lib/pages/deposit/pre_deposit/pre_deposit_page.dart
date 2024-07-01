import 'package:flutter/material.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/config/config.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'pre_deposit_logic.dart';

class PreDepositPage extends BaseView<PreDepositLogic> {
  const PreDepositPage({super.key, this.onBack});

  final VoidCallback? onBack;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => PreDepositPage.argument(
        Get.arguments as Map<String, dynamic>? ?? {},
      ),
    );
  }

  factory PreDepositPage.argument(Map<String, dynamic> arguments) {
    final onBack = arguments['onBack'];
    if (onBack != null && onBack is VoidCallback) {
      return PreDepositPage(
        onBack: onBack,
      );
    }
    return const PreDepositPage();
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('deposit'),
      leadingIcon: GamingCloseButton(
        onPressed: () {
          if (onBack != null) {
            onBack?.call();
          } else {
            Navigator.maybePop(context);
          }
        },
      ),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(PreDepositLogic());
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap12,
        Container(
          padding: EdgeInsets.symmetric(
            horizontal: 16.dp,
          ),
          child: Text(
            localized('choose_dep'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
        Gaps.vGap24,
        _buildItem(
          icon: R.depositCrypto,
          title: localized('dep_crypto'),
          content: localized('have_dig', params: [localized('brand_name')]),
          onPressed: _onCryptoPressed,
        ),
        _buildItem(
          icon: R.depositCurrency,
          title: localized('dep_fiat'),
          content: localized('from_to', params: [localized('brand_name')]),
          onPressed: () => _onCurrencyPressed(context),
        ),
        if (Config.isM1)
          _buildItem(
            icon: R.depositCreditCard,
            title: localized('card_buy'),
            content: localized('others_buy'),
            onPressed: _onCreditCardPressed,
          ),
      ],
    );
  }

  Widget _buildItem({
    required String icon,
    required String title,
    required String content,
    required void Function() onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 12.dp, horizontal: 16.dp),
        child: Row(
          children: [
            Image.asset(
              icon,
              width: 42.dp,
              height: 42.dp,
            ),
            Gaps.hGap20,
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: GGTextStyle(
                            fontSize: GGFontSize.bigTitle20,
                            color: GGColors.textMain.color,
                          ),
                        ),
                      ),
                      SvgPicture.asset(
                        R.iconArrowRightAlt,
                        width: 14.dp,
                        height: 14.dp,
                        color: GGColors.textSecond.color,
                      ),
                    ],
                  ),
                  Gaps.vGap6,
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          content,
                          style: GGTextStyle(
                            fontSize: GGFontSize.content,
                            color: GGColors.textSecond.color,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

extension _Action on PreDepositPage {
  void _onCryptoPressed() {
    DepositRouterUtil.goCryptoDeposit();
  }

  void _onCurrencyPressed(BuildContext context) {
    DepositRouterUtil.goCurrencyDeposit();
  }

  void _onCreditCardPressed() {
    controller.creditCardBuy();
  }
}
