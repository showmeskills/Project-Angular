import 'package:flutter/material.dart';
import 'package:gogaming_app/common/api/currency/models/gaming_currency_model.dart';
import 'package:gogaming_app/common/components/util.dart';
import 'package:gogaming_app/common/service/account_service.dart';
import 'package:gogaming_app/common/widgets/appbar/appbar.dart';
import 'package:gogaming_app/common/widgets/coin_selector/coin_selector_page.dart';
import 'package:gogaming_app/common/widgets/gaming_bottom_sheet.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/generated/r.dart';
import 'package:gogaming_app/pages/base/base_view.dart';
import 'package:gogaming_app/widget_header.dart';
import 'manager_currency_logic.dart';

/// 管理货币
class ManagerCurrencyPage extends BaseView<ManagerCurrencyLogic> {
  const ManagerCurrencyPage({Key? key}) : super(key: key);

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      page: () => const ManagerCurrencyPage(),
    );
  }

  @override
  PreferredSizeWidget? appBar(BuildContext context) {
    return GGAppBar.normal(title: localized('curr_cho'));
  }

  @override
  Widget body(BuildContext context) {
    Get.put(
      ManagerCurrencyLogic(),
      permanent: true,
      tag: AccountService.sharedInstance.gamingUser?.uid,
    );
    return Container(
      padding: EdgeInsetsDirectional.only(top: 25.dp, start: 16.dp, end: 16.dp),
      child: Column(
        children: [
          _buildTitle(),
          if (controller.isLogin) ...[
            Gaps.vGap16,
            _buildDefaultCurrency(),
          ],
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsetsDirectional.only(top: 16.dp, end: 16.dp),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildList(localized('crypto'), controller.cryptoList),
                  Gaps.vGap8,
                  _buildList(localized('fiat_cur'), controller.fiatList),
                ],
              ),
            ),
          ),
          SizedBox(height: 20.dp),
          _buildSaveButton(),
          SizedBox(height: Util.bottomMargin),
        ],
      ),
    );
  }

  Widget _buildSaveButton() {
    return Row(
      children: [
        Expanded(
          child: Obx(() {
            return GGButton.main(
              onPressed: _onPressSave,
              isLoading: controller.isSaving.value,
              text: localized('save_btn'),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildList(String title, List<GamingCurrencyModel> currencies) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          children: [
            Text(
              title,
              style: GGTextStyle(
                fontSize: GGFontSize.content,
                color: GGColors.textSecond.color,
              ),
            ),
          ],
        ),
        Gaps.vGap8,
        GridView(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            mainAxisSpacing: 4.dp,
            crossAxisSpacing: 0,
            crossAxisCount: 2,
            mainAxisExtent: 34.dp,
            // childAspectRatio: 1.1, DONT USE THIS when using mainAxisExtent
          ),
          shrinkWrap: true,
          padding: EdgeInsetsDirectional.only(start: 16.dp, top: 8.dp),
          physics: const NeverScrollableScrollPhysics(),
          children: currencies.map((e) => _buildCheckCurrency(e)).toList(),
        ),
        Gaps.vGap8,
      ],
    );
  }

  Widget _buildCheckCurrency(GamingCurrencyModel model) {
    return GetBuilder(
      init: controller,
      id: model.currency,
      builder: (logic) {
        return Obx(() {
          return Opacity(
            opacity: controller.defaultCurrency.value.currency == model.currency
                ? 0.5
                : 1.0,
            child: GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: controller.defaultCurrency.value.currency == model.currency
                  ? null
                  : () => _onPressCurrency(model),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IgnorePointer(
                    child: GamingCheckBox(
                      value: controller.isChecked(model),
                      size: 18.dp,
                      onChanged: (v) {},
                    ),
                  ),
                  Gaps.hGap8,
                  GamingImage.network(
                    url: model.iconUrl,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                  Gaps.hGap8,
                  Text(
                    model.currency ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                      fontWeight: GGFontWeigh.medium,
                    ),
                  ),
                ],
              ),
            ),
          );
        });
      },
    );
  }

  Widget _buildDefaultCurrency() {
    return Row(
      children: [
        Text(
          localized('default_currency'),
          style: GGTextStyle(
            fontSize: GGFontSize.content,
            color: GGColors.textSecond.color,
          ),
        ),
        Gaps.hGap4,
        Container(
          width: 119.dp,
          height: 42.dp,
          alignment: AlignmentDirectional.center,
          decoration: BoxDecoration(
            color: GGColors.border.color,
            borderRadius: BorderRadius.circular(4),
          ),
          child: InkWell(
            onTap: _onPressSelectDefault,
            child: Obx(() {
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  GamingImage.network(
                    url: controller.defaultCurrency.value.iconUrl,
                    width: 18.dp,
                    height: 18.dp,
                  ),
                  Gaps.hGap8,
                  Text(
                    controller.defaultCurrency.value.currency ?? '',
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textMain.color,
                      fontWeight: GGFontWeigh.medium,
                    ),
                  ),
                  Gaps.hGap12,
                  SvgPicture.asset(
                    R.appbarAppbarArrowDown,
                    width: 11.dp,
                    // height: 14.dp,
                    fit: BoxFit.cover,
                    color: GGColors.textSecond.color,
                  ),
                ],
              );
            }),
          ),
        ),
      ],
    );
  }

  Widget _buildTitle() {
    return Row(
      children: [
        Expanded(
          child: Text(
            localized('man_curr_tip'),
            style: GGTextStyle(
              fontSize: GGFontSize.content,
              color: GGColors.textMain.color,
            ),
          ),
        ),
      ],
    );
  }
}

extension _Action on ManagerCurrencyPage {
  void _onPressSelectDefault() {
    GamingBottomSheet.show<GamingCurrencyModel?>(
      title: localized('select_default_curr'),
      builder: (context) {
        return CoinSelectorPage(
          list: controller.currencyList,
        );
      },
    ).then((value) {
      if (value != null) {
        controller.setDefaultCurrency(value.currency!);
      }
    });
  }

  void _onPressCurrency(GamingCurrencyModel model) {
    controller.revertCheck(model);
  }

  void _onPressSave() {
    controller.saveCheckStatus();
  }
}
