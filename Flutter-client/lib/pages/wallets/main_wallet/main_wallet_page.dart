import 'package:flutter/material.dart';
import 'package:focus_detector/focus_detector.dart';
import 'package:gogaming_app/R.dart';
import 'package:gogaming_app/common/api/wallet/models/gaming_main_wallet/gaming_main_wallet_currency_model.dart';
import 'package:gogaming_app/common/delegate/base_single_render_view_delegate.dart';
import 'package:gogaming_app/common/widgets/gaming_check_box.dart';
import 'package:gogaming_app/common/widgets/gaming_image/gaming_image.dart';
import 'package:gogaming_app/common/widgets/gaming_overlay.dart';
import 'package:gogaming_app/common/widgets/gaming_popup.dart';
import 'package:gogaming_app/common/widgets/gaming_text_filed/gaming_text_filed.dart';
import 'package:gogaming_app/common/widgets/gg_button.dart';
import 'package:gogaming_app/common/widgets/gg_dialog/dialog_util.dart';
import 'package:gogaming_app/helper/deposit_router_util.dart';
import 'package:gogaming_app/helper/text_calculate_utils.dart';
import 'package:gogaming_app/helper/withdraw_router_util.dart';
import 'package:gogaming_app/pages/wallets/common/mixin/wallet_common_ui_mixin.dart';
import 'package:gogaming_app/pages/wallets/common/view/wallet_amout_view.dart';
import 'package:gogaming_app/pages/wallets/common/view/wallet_base_view.dart';
import 'package:gogaming_app/router/login_middle_ware.dart';
import 'package:gogaming_app/widget_header.dart';

import 'main_wallet_logic.dart';
part 'views/_currency_item_view.dart';
part 'views/_sort_button.dart';
part 'views/_hide_small_asset_button.dart';

class MainWalletPage extends WalletBaseView<MainWalletLogic>
    with BaseSingleRenderViewDelegate, WalletCommonUIMixin {
  const MainWalletPage({super.key});

  static GetPage<dynamic> getPage(String route) {
    return GetPage(
      name: route,
      middlewares: [LoginMiddleware()],
      page: () => const MainWalletPage(),
    );
  }

  @override
  SingleRenderViewController get renderController => controller.controller;

  MainWalletState get state => controller.state;

  @override
  Widget? getLoadingWidget(BuildContext context) {
    return buildOverviewContainer(
      padding: EdgeInsets.zero,
      child: super.getLoadingWidget(context)!,
    );
  }

  @override
  Widget? getEmptyWidget(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildOverview(),
        Gaps.vGap8,
        Expanded(
          child: Container(
            color: GGColors.moduleBackground.color,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCurrencyTextField(),
                Expanded(
                  child: super.getEmptyWidget(context)!,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget body(BuildContext context) {
    Get.put(MainWalletLogic(), tag: tag);
    return FocusDetector(
      onVisibilityGained: controller.getWalletViewData,
      child: SingleRenderView(
        delegate: this,
        controller: controller,
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              buildOverview(),
              Gaps.vGap8,
              _buildCurrencyList(),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget buildOverview() {
    return buildOverviewContainer(
        child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        buildWalletName(localized('main')),
        Gaps.vGap24,
        buildTotalAmount(
          child: Obx(() {
            return WalletAmountView(
              fontSize: GGFontSize.superBigTitle,
              totalValue: state.wallet.totalAssetText,
              obscureFund: false,
              convertWidegt: Obx(() {
                if (state.selectedCurrency.currency == 'USDT') {
                  return Gaps.empty;
                }
                return RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: '≈ ${state.usdtConvert} ',
                      ),
                      TextSpan(
                        text: ' ${state.selectedCurrency.currency}',
                        style: GGTextStyle(
                          fontSize: GGFontSize.content,
                          color: GGColors.textSecond.color,
                        ),
                      ),
                    ],
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                      fontFamily: GGFontFamily.dingPro,
                      fontWeight: GGFontWeigh.bold,
                    ),
                  ),
                );
              }),
            );
          }),
        ),
        Gaps.vGap14,
        _buildOperationRow(Get.context!),
      ],
    ));
  }

  Widget _buildOperationRow(BuildContext context) {
    final textStyle = GGTextStyle(fontSize: GGFontSize.content);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Container(
          constraints: BoxConstraints(
              minWidth: MediaQuery.of(context).size.width / 3 - 30.dp),
          child: GGButton.main(
            onPressed: _onPressCharge,
            text: localized('deposit'),
            isSmall: true,
            textStyle: textStyle,
            backgroundColor: GGColors.brand.color,
          ),
        ),
        Gaps.hGap10,
        Container(
          constraints: BoxConstraints(
              minWidth: MediaQuery.of(context).size.width / 3 - 30.dp),
          child: GGButton.minor(
            onPressed: _onPressTake,
            text: localized('withdraw'),
            isSmall: true,
            textStyle: textStyle,
            backgroundColor: GGColors.transparent.color,
            border: Border.all(
              width: 1.dp,
              color: GGColors.border.color,
            ),
          ),
        ),
        Gaps.hGap10,
        Container(
          constraints: BoxConstraints(
              minWidth: MediaQuery.of(context).size.width / 3 - 30.dp),
          child: GGButton.minor(
            onPressed: _onPressTransfer,
            text: localized('trans'),
            isSmall: true,
            textStyle: textStyle,
            backgroundColor: GGColors.transparent.color,
            border: Border.all(
              width: 1.dp,
              color: GGColors.border.color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCurrencyTextField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Gaps.hGap16,
            Expanded(
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 16.dp),
                child: GamingTextField(
                  controller: state.textFieldController,
                  contentPadding: EdgeInsets.symmetric(
                    vertical: 12.dp,
                    horizontal: 16.dp,
                  ),
                  prefixIcon: Container(
                    width: 42.dp,
                    padding: EdgeInsets.only(left: 4.dp),
                    child: SvgPicture.asset(
                      R.iconSearch,
                      width: 14.dp,
                      height: 14.dp,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                  prefixIconConstraints: BoxConstraints.tightFor(
                    width: 42.dp,
                  ),
                  hintText: localized('search_coin'),
                ),
              ),
            ),
            Gaps.hGap18,
            _HideSmallAssetButton(
              tag: tag,
              onChanged: _toggleHideSmallAsset,
            ),
            Gaps.hGap16,
          ],
        ),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          height: 40.dp,
          child: Row(
            children: [
              ...List.generate(MainWalletCurrencySortType.values.length,
                  (index) {
                return [
                  Obx(() {
                    final type = MainWalletCurrencySortType.values[index];
                    return GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => _onSortPressed(type),
                      child: _SortButton(
                        data: type,
                        selectedSort: state.sort,
                      ),
                    );
                  }),
                  if (index != MainWalletCurrencySortType.values.length - 1)
                    const Spacer(),
                ];
              }).expand((element) => element),
            ],
          ),
        ),
        Gaps.vGap16,
        Container(
          padding: EdgeInsets.symmetric(horizontal: 16.dp),
          child: Text(
            localized('asset'),
            style: GGTextStyle(
              fontSize: GGFontSize.smallTitle,
              fontWeight: GGFontWeigh.bold,
              color: GGColors.textMain.color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCurrencyList() {
    return Container(
      color: GGColors.moduleBackground.color,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCurrencyTextField(),
          Obx(() {
            return Column(
              children: List.generate(state.currencies.length, (index) {
                return _CurrencyItemView(
                  data: state.currencies[index],
                  tag: tag,
                  hasDivider: index > 0,
                  onExpandPressed: _expand,
                  onBuyPressed: _onCreditCardPressed,
                  onPressedClearNegative: onPressedClearNegative,
                );
              }),
            );
          }),
        ],
      ),
    );
  }
}

extension _Action on MainWalletPage {
  void _expand(String currency) {
    primaryFocus?.unfocus();
    controller.expand(currency);
  }

  void _toggleHideSmallAsset() {
    primaryFocus?.unfocus();
    controller.toggleHideSmallAsset();
  }

  void _onSortPressed(MainWalletCurrencySortType type) {
    primaryFocus?.unfocus();
    controller.sort(type);
  }

  /// 划转
  void _onPressTransfer() {
    Get.toNamed<dynamic>(Routes.transfer.route);
  }

  /// 提现
  void _onPressTake() {
    WithdrawRouterUtil.goWithdrawHome();
  }

  /// 充值
  void _onPressCharge() {
    DepositRouterUtil.goDepositHome();
  }

  void _onCreditCardPressed(String currency) {
    controller.creditCardBuy(currency);
  }

  void onPressedClearNegative(GamingMainWalletCurrencyModel data) {
    final hints = List<Widget>.from([
      localized('c_n_assets_n1'),
      localized('c_n_assets_n2'),
      localized('c_n_assets_n3'),
    ]
        .map(
          (e) => Padding(
            padding: EdgeInsets.only(left: 30.dp, right: 30.dp, bottom: 10.dp),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 5,
                  height: 5,
                  margin: EdgeInsetsDirectional.only(top: 8.dp),
                  decoration: BoxDecoration(
                    color: GGColors.textSecond.color,
                    shape: BoxShape.circle,
                  ),
                ),
                SizedBox(width: 8.dp),
                Expanded(
                  child: Text(
                    e,
                    style: GGTextStyle(
                      fontSize: GGFontSize.content,
                      color: GGColors.textSecond.color,
                    ),
                  ),
                ),
              ],
            ),
          ),
        )
        .toList());
    hints.add(SizedBox(height: 20.dp));
    DialogUtil(
      context: Get.overlayContext!,
      iconPath: R.commonDialogErrorBig,
      iconWidth: 80.dp,
      iconHeight: 80.dp,
      title: localized('precautions02'),
      content: localized('c_n_assets_t', params: [data.currency]),
      contentMaxLine: 3,
      moreWidget: Column(
        children: hints,
      ),
      leftBtnName: '',
      rightBtnName: localized('confirm_button'),
      onRightBtnPressed: () {
        Get.back<void>();
        controller.clearNegative(data);
      },
    ).showNoticeDialogWithTwoButtons();
  }
}
