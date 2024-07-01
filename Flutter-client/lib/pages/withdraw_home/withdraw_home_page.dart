import 'package:flutter/material.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_close_button.dart';
import 'package:gogaming_app/helper/withdraw_router_util.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'withdraw_home_logic.dart';

class WithdrawHomePage extends BaseView<WithdrawHomeLogic> {
  const WithdrawHomePage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const WithdrawHomePage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('withdraw'),
      leadingIcon: const GamingCloseButton(),
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(WithdrawHomeLogic());
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Gaps.vGap12,
        Padding(
          padding: EdgeInsets.only(left: 16.dp, right: 16.dp),
          child: Text(
            localized('selected_wd_method'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textSecond.color,
            ),
          ),
        ),
        Gaps.vGap24,
        _buildItem(
          icon: R.depositCrypto,
          title: localized('wd_crypto'),
          content: localized('sto_trade', params: [localized('brand_name')]),
          onPressed: _onCryptoPressed,
        ),
        _buildItem(
          icon: R.depositCurrency,
          title: localized('wd_fiat'),
          content: localized('tender_to', params: [localized('brand_name')]),
          onPressed: _onCurrencyPressed,
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
      child: Padding(
        padding: EdgeInsetsDirectional.only(
          top: 12.dp,
          bottom: 12.dp,
          start: 16.dp,
          end: 16.dp,
        ),
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

extension _Action on WithdrawHomePage {
  void _onCryptoPressed() {
    WithdrawRouterUtil.goCryptoWithdraw();
  }

  void _onCurrencyPressed() {
    WithdrawRouterUtil.goCurrencyWithdraw();
  }
}
