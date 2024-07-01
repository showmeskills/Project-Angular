import 'package:flutter/widgets.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/gaming_selector/gaming_selector.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/pages/crypto_address/crypto_address_filter/crypto_address_filter_enum.dart';
import 'package:gogaming_app/widget_header.dart';

import 'crypto_address_filter_logic.dart';

class CryptoAddressFilterPage extends BaseView<CryptoAddressFilterLogic> {
  const CryptoAddressFilterPage({super.key});

  CryptoAddressFilterState get state => controller.state;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const CryptoAddressFilterPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(
      title: localized('filter'),
      backgroundColor: GGColors.alertBackground.color,
    );
  }

  @override
  Color? backgroundColor() {
    return GGColors.alertBackground.color;
  }

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  @override
  Widget body(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        children: [
          Gaps.vGap18,
          Obx(() {
            return _buildSelectorWidget(
              title: localized('pay_method'),
              value: state.type.text,
              onPressed: controller.onPaymentSelect,
            );
          }),
          Obx(() {
            if (state.type == CryptoAddressPayMethod.virtual) {
              return Container(
                margin: EdgeInsets.only(top: 24.dp),
                child: _buildSelectorWidget(
                  title: localized('type'),
                  value: state.isUniversalAddress.text,
                  onPressed: controller.onTypeSelect,
                ),
              );
            } else if (state.type == CryptoAddressPayMethod.electronic) {
              return Container(
                margin: EdgeInsets.only(top: 24.dp),
                child: _buildSelectorWidget(
                  title: localized('type'),
                  value: state.ewalletPayment == null
                      ? localized('all')
                      : state.ewalletPayment?.name ?? '',
                  onPressed: controller.onEWalletPaymentSelect,
                ),
              );
            }

            return Container();
          }),
          Gaps.vGap24,
          Obx(() {
            return _buildSelectorWidget(
              title: localized('curr'),
              value: state.currency?.currency,
              onPressed: controller.onCurrencySelect,
            );
          }),
          Gaps.vGap24,
          Obx(() {
            return _buildSelectorWidget(
              title: localized('whitelist'),
              value: state.isWhiteList.text,
              onPressed: controller.onIsWhitelistSelect,
            );
          }),
          const Spacer(),
          _buildConfirmButton(),
        ],
      ),
    );
  }

  Widget _buildConfirmButton() {
    return SizedBox(
      width: double.infinity,
      child: SafeArea(
        bottom: true,
        minimum: EdgeInsets.only(bottom: 24.dp),
        child: Row(
          children: [
            Expanded(
              child: GGButton.minor(
                onPressed: controller.reset,
                text: localized('reset'),
              ),
            ),
            Gaps.hGap16,
            Expanded(
              child: GGButton.main(
                onPressed: controller.submit,
                text: localized('filter'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSelectorWidget({
    required String title,
    String? value,
    void Function()? onPressed,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.vGap4,
        GamingSelectorWidget(
          padding: EdgeInsets.symmetric(
            horizontal: 16.dp,
            vertical: 14.dp,
          ),
          builder: (context) {
            if (value == null) {
              return Text(
                localized('all'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              );
            } else {
              return Text(
                value,
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textMain.color,
                ),
              );
            }
          },
          onPressed: onPressed,
        ),
      ],
    );
  }
}
