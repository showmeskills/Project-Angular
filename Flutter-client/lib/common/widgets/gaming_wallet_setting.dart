import 'package:flutter/material.dart';
import 'package:flutter_switch/flutter_switch.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/service/currency/currency_service.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_radio_box.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/widget_header.dart';

class GamingWalletSettings {
  static Future<void> show() async {
    GamingBottomSheet.show<void>(
      title: localized('wallet_settings'),
      fixedHeight: false,
      builder: (context) {
        return const GamingWalletSettingsView();
      },
    );
  }
}

class GamingWalletSettingsLogic extends GetxController {
  final _hideZeroBalance = CurrencyService.sharedInstance.hideZeroBalance.obs;
  bool get hideZeroBalance => _hideZeroBalance.value;

  /// 是否以法币显示加密货币
  final _displayInFiat = CurrencyService.sharedInstance.diplayInFiat.obs;
  bool get diplayInFiat => _displayInFiat.value;

  late final _displayFiatCurrency = () {
    final model = CurrencyService.sharedInstance.displayFiatCurrency ??
        fiatCurrencyList.first;
    return model.obs;
  }();
  GamingCurrencyModel get displayFiatCurrency => _displayFiatCurrency.value;

  late final _fiatCurrencyList = () {
    return CurrencyService.sharedInstance.getFiatList()
      ..removeWhere((element) => element.currency == null);
  }();

  List<GamingCurrencyModel> get fiatCurrencyList => _fiatCurrencyList;

  void setHideZeroBalance(bool v) {
    _hideZeroBalance.value = v;
  }

  void setDisplayCryptoInFiat(bool v) {
    _displayInFiat.value = v;
  }

  void setDisplayFiatCurrency(GamingCurrencyModel v) {
    _displayFiatCurrency.value = v;
  }

  void submit() {
    if (hideZeroBalance != CurrencyService.sharedInstance.hideZeroBalance) {
      CurrencyService.sharedInstance.setHideZeroBalance(hideZeroBalance);
    }
    CurrencyService.sharedInstance
        .setDisplayCryptoInFiat(diplayInFiat ? displayFiatCurrency : null);

    Get.back<void>();
  }
}

class GamingWalletSettingsView extends StatelessWidget {
  const GamingWalletSettingsView({super.key});

  GamingWalletSettingsLogic get logic => Get.find<GamingWalletSettingsLogic>();

  @override
  Widget build(BuildContext context) {
    Get.put(GamingWalletSettingsLogic());
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.dp),
      child: Column(
        children: [
          _buildHideZeroBalance(),
          _buildDisplayCryptoInFiat(),
          Gaps.vGap8,
          _buildFiatList(),
          Divider(
            indent: 8.dp,
            endIndent: 8.dp,
            color: GGColors.border.color,
            height: 2.dp,
            thickness: 2.dp,
          ),
          Gaps.vGap16,
          _buildButton(),
        ],
      ),
    );
  }

  Widget _buildButton() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.dp),
      child: SafeArea(
        top: false,
        bottom: true,
        minimum: EdgeInsets.only(bottom: 24.dp),
        child: Row(
          children: [
            Expanded(
              child: Text(
                localized('wallet_settings_save_tips'),
                style: GGTextStyle(
                  fontSize: GGFontSize.content,
                  color: GGColors.textSecond.color,
                ),
              ),
            ),
            Gaps.hGap16,
            GGButton.main(
              onPressed: logic.submit,
              isSmall: true,
              text: localized('save_btn'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHideZeroBalance() {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 16.dp,
        vertical: 8.dp,
      ),
      child: Row(
        children: [
          Obx(() {
            return FlutterSwitch(
              width: 34.dp,
              height: 20.dp,
              toggleSize: 16.dp,
              value: logic.hideZeroBalance,
              borderRadius: 10.dp,
              padding: 2.dp,
              activeColor: GGColors.brand.color,
              inactiveColor: GGColors.border.color,
              onToggle: logic.setHideZeroBalance,
            );
          }),
          Gaps.hGap12,
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  localized('hide_zero_balance'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                    height: 1.5,
                  ),
                ),
                Text(
                  localized('hide_zero_balance_tips'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDisplayCryptoInFiat() {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: 16.dp,
        vertical: 8.dp,
      ),
      child: Row(
        children: [
          Obx(() {
            return FlutterSwitch(
              width: 34.dp,
              height: 20.dp,
              toggleSize: 16.dp,
              value: logic.diplayInFiat,
              borderRadius: 10.dp,
              padding: 2.dp,
              activeColor: GGColors.brand.color,
              inactiveColor: GGColors.border.color,
              onToggle: logic.setDisplayCryptoInFiat,
            );
          }),
          Gaps.hGap12,
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  localized('display_crypto_in_fiat'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textMain.color,
                    height: 1.5,
                  ),
                ),
                Text(
                  localized('display_crypto_in_fiat_tips'),
                  style: GGTextStyle(
                    fontSize: GGFontSize.content,
                    color: GGColors.textSecond.color,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFiatList() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(
        horizontal: 8.dp,
        vertical: 32.dp,
      ),
      child: LayoutBuilder(builder: (context, constraints) {
        final width = ((constraints.maxWidth - 8.dp) ~/ 2).toDouble();
        return Obx(() {
          return Opacity(
            opacity: logic.diplayInFiat ? 1 : 0.5,
            child: Wrap(
              spacing: 8.dp,
              children: logic.fiatCurrencyList.map((e) {
                return _buildFiatItem(width: width, data: e);
              }).toList(),
            ),
          );
        });
      }),
    );
  }

  Widget _buildFiatItem({
    required GamingCurrencyModel data,
    required double width,
  }) {
    return ScaleTap(
      onPressed: logic.diplayInFiat
          ? () {
              logic.setDisplayFiatCurrency(data);
            }
          : null,
      child: Container(
        width: width,
        padding: EdgeInsets.symmetric(
          vertical: 8.dp,
          horizontal: 8.dp,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Obx(() {
              return GamingRadioBox(
                value: logic.displayFiatCurrency.currency == data.currency,
                onChanged: (v) {
                  if (logic.diplayInFiat) {
                    logic.setDisplayFiatCurrency(data);
                  }
                },
                size: 21.dp,
              );
            }),
            Gaps.hGap8,
            GamingImage.network(
              url: data.iconUrl,
              width: 14.dp,
              height: 14.dp,
            ),
            Gaps.hGap8,
            Text(
              data.currency!,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
                fontFamily: GGFontFamily.dingPro,
                fontWeight: GGFontWeigh.medium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
