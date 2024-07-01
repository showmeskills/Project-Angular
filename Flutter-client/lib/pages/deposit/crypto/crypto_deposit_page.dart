import 'package:extra_hittest_area/extra_hittest_area.dart';
import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/faq/faq_api.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/widgets/bonus_wrapper.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/helper/text_calculate_utils.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_ui_mixin.dart';
import 'package:gogaming_app/pages/deposit/common/mixin/deposit_common_utils_mixin.dart';
import 'package:gogaming_app/pages/deposit/common/views/deposit_base_view.dart';
import 'package:gogaming_app/pages/deposit/common/views/deposit_currency_select.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';
import 'package:qr_flutter/qr_flutter.dart';

import 'crypto_deposit_logic.dart';
import 'views/crypto_deposit_history_view.dart';

part 'views/_address_view.dart';

class CryptoDepositPage extends DepositBaseView<CryptoDepositLogic>
    with BaseSingleRenderViewDelegate, DepositCommonUIMixin {
  const CryptoDepositPage({
    super.key,
    this.currency,
  });

  final String? currency;

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () =>
          CryptoDepositPage.argument(Get.arguments as Map<String, dynamic>?),
    );
  }

  factory CryptoDepositPage.argument(Map<String, dynamic>? arguments) {
    return CryptoDepositPage(
      currency: arguments?['currency'] as String?,
    );
  }

  CryptoDepositState get state => controller.state;

  @override
  String get title => localized('dep_crypto');

  @override
  List<Widget>? get actions => [_buildSwitchButton()];

  @override
  bool ignoreBottomSafeSpacing() {
    return true;
  }

  Widget _buildSwitchButton() {
    return GestureDetectorHitTestWithoutSizeLimit(
      extraHitTestArea: EdgeInsets.all(10.dp),
      onTap: () => DepositRouterUtil.goCurrencyDeposit(null, true),
      child: Padding(
        padding: EdgeInsetsDirectional.only(end: 16.dp),
        child: GGButton.main(
          onPressed: () => DepositRouterUtil.goCurrencyDeposit(null, true),
          backgroundColor: GGColors.border.color,
          text: localized('dep_fiat'),
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
    Get.put(CryptoDepositLogic(currency));
    return SafeArea(
      bottom: true,
      minimum: EdgeInsets.only(bottom: 24.dp),
      child: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 16.dp),
        child: Column(
          children: [
            Gaps.vGap24,
            _buildBonusSelectView(context),
            Obx(() {
              return DepositCurrencySelector(
                title: localized('curr'),
                hintText: localized('select_cur'),
                selected: state.currency,
                onPressed: controller.selectCurrency,
                tag: null,
              );
            }),
            _buildCurrencySelectorBottom(context),
            const _AddressView(),
            const CryptoDepositHistoryView(),
          ],
        ),
      ),
    );
  }

  Widget _buildBonusSelectView(BuildContext context) {
    return Obx(() {
      return Column(
        children: [
          buildTitle(
            '',
            context,
            tag: FaqTag.digitalCurrencyRecharge,
          ),
          BonusWrapper(
            tag: controller.tag,
            currency: state.currency!.currency!,
            amount: 100000.0,
          ),
          Gaps.vGap24,
        ],
      );
    });
  }

  Widget _buildNetworkSelector(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildSubTitle(localized('trans_network'), context),
        Gaps.vGap4,
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: controller.selectNetwork,
          child: buildContainer(
            child: Row(
              children: [
                Expanded(
                  child: Obx(() {
                    if (state.network == null) {
                      return Text(
                        localized('sel_net'),
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textHint.color,
                        ),
                      );
                    } else {
                      return Row(
                        children: [
                          Text(
                            state.network!.name,
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textMain.color,
                              fontFamily: GGFontFamily.dingPro,
                              fontWeight: GGFontWeigh.bold,
                            ),
                          ),
                          Gaps.hGap4,
                          Text(
                            state.network!.desc ?? '',
                            style: GGTextStyle(
                              fontSize: GGFontSize.content,
                              color: GGColors.textSecond.color,
                              fontFamily: GGFontFamily.dingPro,
                            ),
                          ),
                        ],
                      );
                    }
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

  Widget _buildCurrencySelectorBottom(BuildContext context) {
    return Obx(() {
      if (state.currency != null) {
        return Column(
          children: [
            Gaps.vGap24,
            _buildNetworkSelector(context),
          ],
        );
      }
      return Container(
        margin: EdgeInsets.only(top: 8.dp),
        child: LayoutBuilder(builder: (context, constraints) {
          double width = constraints.maxWidth;

          List<Widget> children = state.quickCurrency.map((e) {
            final text = Text(
              e.currency ?? '',
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                fontFamily: GGFontFamily.dingPro,
                color: GGColors.textMain.color,
              ),
            );
            width -= (text.size.width + 4.dp + 18.dp);
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                GamingImage.network(
                  url: e.icon,
                  width: 18.dp,
                  height: 18.dp,
                ),
                Gaps.hGap4,
                text
              ],
            );
          }).toList();

          return Row(
            children: List.generate(5, (index) {
              if (children.length > index) {
                return GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () =>
                      controller.setCurrency(state.quickCurrency[index]),
                  child: Container(
                    margin: EdgeInsets.only(
                      left: index == 0 ? 0 : (width ~/ 4).toDouble(),
                    ),
                    child: children[index],
                  ),
                );
              }
              return Gaps.empty;
            }),
          );
        }),
      );
    });
  }

  @override
  SingleRenderViewController get renderController => controller.controller;
}
